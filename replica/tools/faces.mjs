/**
 * 猫脸表情时间线采样：进入 → 点指定想法 → 每 200ms 读一次表情图集的 uv 偏移，
 * 把「表情在第几秒换、维持多久回 Neutral」打成一条时间线。
 *
 * 只能跑本地（站点没有把材质暴露出来，那边只能靠截图比对）。
 *
 *   node tools/faces.mjs --thought starving --trace 8000 --out tools/faces-mine.json
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const token = process.argv[i];
  if (!token.startsWith("--")) continue;
  const next = process.argv[i + 1];
  if (next && !next.startsWith("--")) {
    args.set(token.slice(2), next);
    i++;
  } else args.set(token.slice(2), true);
}

const url = args.get("url") ?? "http://localhost:5173/";
const wantThought = args.get("thought");
const trace = Number(args.get("trace") ?? 8000);
const out = path.resolve(args.get("out") ?? "tools/faces.json");
const pick = Number(args.get("pick") ?? 0);

function findChromium() {
  const cache = path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
  if (!fs.existsSync(cache)) return undefined;
  const dirs = fs
    .readdirSync(cache)
    .filter((name) => /^chromium-\d+$/.test(name))
    .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
  for (const dir of dirs) {
    const exe = path.join(cache, dir, "chrome-win64", "chrome.exe");
    if (fs.existsSync(exe)) return exe;
  }
  return undefined;
}

const browser = await chromium.launch({
  executablePath: findChromium(),
  headless: false,
  args: [
    "--enable-unsafe-webgpu",
    "--window-position=-2400,0",
    "--window-size=1600,900",
    "--disable-lcd-text",
  ],
});

const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
page.on("pageerror", (err) => console.log(`[pageerror] ${err.message}`));
await page.goto(url, { waitUntil: "load", timeout: 120000 });

const BOX = "div[class*='w-[min(280px']";
const THOUGHT = `${BOX} button[data-ui-sound=expand]`;
const CHOICE = `${BOX} button[data-ui-sound=select]`;
const steps = Number(args.get("steps") ?? 1);
const gap = Number(args.get("gap") ?? 6000);

/** 气泡当前状态：整句文本、逐词亮度、选项列表 */
const readState = () =>
  page.evaluate(
    ([BOX, CHOICE]) => {
      const box = document.querySelector(BOX);
      const section = box?.querySelector("section[aria-label^=Ajo]");
      const sr = section?.querySelector("p span.sr-only");
      const spans = section ? section.querySelectorAll("p span[aria-hidden=true] > span") : [];
      return {
        reply: sr?.textContent?.trim() ?? section?.querySelector("p")?.textContent?.trim() ?? null,
        chunks: [...spans].map((el) => el.style.opacity),
        listening: !!box?.querySelector("span[class*='listening-indicator']"),
        choices: [...document.querySelectorAll(CHOICE)].map((el) => el.textContent.trim()),
      };
    },
    [BOX, CHOICE],
  );

/**
 * 等这一句念完：回复文本必须已换成新的一句（prevReply 不同）、逐词全亮、不在 listening。
 * 只判「chunks 全亮 && choices>0」会被上一句的残留 span 骗到，点了等于没点。
 */
async function settleLine(prevReply) {
  const deadline = Date.now() + gap * 3;
  let state = await readState();
  let last = "";
  while (Date.now() < deadline) {
    const spoken = state.chunks.length > 0 && state.chunks.every((opacity) => opacity === "1");
    if (state.reply && state.reply !== prevReply && !state.listening && spoken) {
      // 中间态（新回复 + 还在退场的旧选项）会骗过判据，要连续两帧一致才算站住
      const key = JSON.stringify([state.reply, state.choices]);
      if (key === last) return state;
      last = key;
    } else last = "";
    await page.waitForTimeout(300);
    state = await readState();
  }
  return state;
}

/**
 * 直接派发 DOM click。
 * 真鼠标事件先打 pointerdown，气泡靠它判「点在面板外面就收回」；
 * 脚本坐标一旦被 3D 投影挪位，真鼠标就会点到外面、把对话收掉（已踩过）。
 */
async function clickChoice(index) {
  const target = page.locator(CHOICE).nth(index);
  await target.waitFor({ state: "attached", timeout: 60000 });
  for (let deadline = Date.now() + 30000; Date.now() < deadline; ) {
    const sized = await target.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    if (sized) break;
    await page.waitForTimeout(150);
  }
  // layout 弹簧还没停时按钮在挪，等一拍再点
  await page.waitForTimeout(450);
  await target.evaluate((el) => el.click());
}

// Enter 在资产没加载完之前是 disabled 的，点空就白等
const enter = page.locator("button[data-ui-sound=page-enter]").first();
for (const deadline = Date.now() + 180000; Date.now() < deadline; ) {
  if (await enter.evaluate((el) => !el.disabled)) break;
  await page.waitForTimeout(300);
}
await enter.click({ force: true, timeout: 60000 });
await page.locator(THOUGHT).first().waitFor({ state: "attached", timeout: 120000 });

if (wantThought) {
  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    const text = await page.locator(THOUGHT).first().textContent();
    if (text && text.includes(wantThought)) break;
    await page.waitForTimeout(500);
  }
}

// 先把时间线采样挂上去，再点想法，这样能抓到底一帧
const sampling = page.evaluate(
  (duration) =>
    new Promise((resolve) => {
      const NAMES = [
        "Neutral",
        "-1-",
        "Surprised",
        "Annoyed",
        "Skeptical",
        "Tired",
        "Closed eyes",
        "-7-",
      ];
      const samples = [];
      const start = performance.now();
      const tick = () => {
        const snap = globalThis.__faces?.[0]?.snapshot?.();
        let entry = null;
        if (snap) {
          // offset = ((index % 4) / 4, floor(index / 4) / 4)，反推格子序号
          const index = Math.round(snap.offset[0] * 4) + Math.round(snap.offset[1] * 4) * 4;
          // setExpression 会把两个名字重映射到别的格子：Happy→7、Laughing→1，
          // 所以格 1 一定不是 Happy、格 7 一定是 Happy，反推时得跟着改
          const label =
            index === 7 ? "Happy" : index === 1 ? "Laughing" : (NAMES[index] ?? `#${index}`);
          entry = {
            t: Math.round((performance.now() - start) / 100) / 10,
            index,
            name: label,
            eyeBand: snap.eyeBand,
            blink: snap.blink,
            // 逐词气泡里最后一个字有没有亮，用来对齐「念完」这个时刻
            revealed: (() => {
              const spans = document.querySelectorAll(
                "div[class*='w-[min(280px'] section[aria-label^=Ajo] p span[aria-hidden=true] > span",
              );
              let lit = 0;
              for (const span of spans) if (span.style.opacity === "1") lit++;
              return `${lit}/${spans.length}`;
            })(),
            // 当前念的是哪一句，方便把表情对应到剧情节点
            line:
              document
                .querySelector("div[class*='w-[min(280px'] section[aria-label^=Ajo] p span.sr-only")
                ?.textContent?.trim()
                ?.slice(0, 34) ?? "",
          };
        }
        samples.push(entry);
        if (performance.now() - start < duration) setTimeout(tick, 200);
        else resolve(samples);
      };
      tick();
    }),
  trace,
);

await page.locator(THOUGHT).first().click({ force: true, timeout: 30000 });

// 往下走若干步选项（每步取第 pick 个），用来看节点切换时的表情
let state = await settleLine(null);
for (let step = 0; step < steps; step++) {
  if (!state.choices.length) break;
  const index = Math.min(pick, state.choices.length - 1);
  const label = (state.choices[index] ?? "").trim();
  if (label === "Leave him to it") break;
  console.log(`[step ${step}] "${label.slice(0, 44)}" (${state.choices.length} 选 1)`);
  const before = state.reply;
  await clickChoice(index);
  state = await settleLine(before);
  if (state.reply === before) {
    console.log(`[warn] 第 ${step} 步点完文本没变（对话可能被收掉）`);
    break;
  }
}

const samples = await sampling;
await browser.close();

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(samples, null, 2), "utf8");

// 只打「表情变了」和「念白进度变了」的那些帧，输出才不刷屏
let lastKey = "";
for (const entry of samples) {
  if (!entry) continue;
  const key = `${entry.index}|${entry.eyeBand}|${entry.revealed}|${entry.line}`;
  if (key === lastKey) continue;
  lastKey = key;
  console.log(
    `t=${String(entry.t).padStart(5)}s  ${entry.name.padEnd(11)} #${entry.index} eyeBand=${entry.eyeBand} blink=${entry.blink} lit=${entry.revealed}  "${entry.line}"`,
  );
}
console.log(`[faces] ${samples.length} 帧 -> ${out}`);
