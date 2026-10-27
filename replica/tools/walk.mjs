/**
 * 剧情图 A/B 走查：按「进入 → 点想法 → 每次点第一个选项」的固定策略往前走，
 * 每一步把气泡里的文本、选项列表、猫的表情格子、报纸热点矩形记下来。
 *
 * 两次运行（站点 / 本地）导出的 JSON 应该逐步一致；不一致就是节点图、
 * 好感度结算或文案有偏差。
 *
 *   node tools/walk.mjs --url https://www.tobis.vision/ --steps 6 --out tools/walk-site.json
 *   node tools/walk.mjs --url http://localhost:5173/ --steps 6 --out tools/walk-mine.json
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
const steps = Number(args.get("steps") ?? 6);
const out = path.resolve(args.get("out") ?? "tools/walk.json");
const width = Number(args.get("w") ?? 1600);
const height = Number(args.get("h") ?? 900);
const settle = Number(args.get("settle") ?? 25000);
// 走哪一支：每次点第几个选项（0 起）
const pickIndex = Number(args.get("pick") ?? 0);
// 只走指定的那条想法（气泡里的文案包含这个子串就走）；想法本身是随机挑的
const wantThought = args.get("thought");

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
    `--window-size=${width},${height}`,
    "--disable-lcd-text",
  ],
});

const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
page.on("pageerror", (err) => console.log(`[pageerror] ${err.message}`));
await page.goto(url, { waitUntil: "load", timeout: 120000 });

// 气泡容器：选项、回复、三点都得限定在它里面，否则会抓到 About 面板的导航按钮
const BOX = "div[class*='w-[min(280px']";
const TEXT = {
  thought: `${BOX} button[data-ui-sound=expand]`,
  reply: `${BOX} section[aria-label^=Ajo] p`,
  srOnly: `${BOX} section[aria-label^=Ajo] p span.sr-only`,
  choice: `${BOX} button[data-ui-sound=select]`,
  leave: `${BOX} button[data-ui-sound=select]`,
  listening: `${BOX} span[class*='listening-indicator']`,
  hotspot: "button[aria-label='Read the newspaper']",
};

const snapshot = () =>
  page.evaluate((TEXT) => {
    const pick = (selector) => document.querySelector(selector);
    const all = (selector) => [...document.querySelectorAll(selector)];
    const replyEl = pick(TEXT.reply);
    const sr = pick(TEXT.srOnly);
    return {
      thought: pick(TEXT.thought)?.textContent?.trim() ?? null,
      // 逐词气泡里 sr-only 才是完整句子，aria-hidden 那份是分块
      reply: sr?.textContent?.trim() ?? replyEl?.textContent?.trim() ?? null,
      chunks: all(`${TEXT.reply} span[aria-hidden=true] > span`).map((el) => ({
        text: el.textContent,
        opacity: el.style.opacity,
      })),
      listening: !!pick(TEXT.listening),
      choices: all(TEXT.choice).map((el) => el.textContent.trim()),
      leave: all(TEXT.leave).some((el) => el.textContent.trim() === "Leave him to it"),
      hotspot: (() => {
        const el = pick(TEXT.hotspot);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return [Math.round(r.x * 10) / 10, Math.round(r.y * 10) / 10, Math.round(r.width * 10) / 10];
      })(),
    };
  }, TEXT);

/**
 * 等这一句念完。最可靠的信号是逐词亮完了（chunks 全部 opacity=1），
 * 而不是「选项列表非空」：popLayout 的退场按钮还会在 DOM 里撑 0.7s。
 */
async function settleLine(prevReply) {
  const deadline = Date.now() + settle;
  let last = null;
  let same = 0;
  while (Date.now() < deadline) {
    const state = await snapshot();
    const spoken =
      state.chunks.length > 0 && state.chunks.every((chunk) => chunk.opacity === "1");
    if (state.reply !== prevReply && !state.listening && spoken) {
      const key = JSON.stringify([state.reply, state.choices, state.leave]);
      if (key === last) same++;
      else {
        last = key;
        same = 0;
      }
      if (same >= 1) return state;
    } else {
      last = null;
      same = 0;
    }
    await page.waitForTimeout(300);
  }
  return snapshot();
}

/** 等按钮既不 disabled、又有尺寸（热点类平时 pointer-events-none）再点 */
async function clickWhenReady(selector, { armed = false, index = 0 } = {}) {
  const target = page.locator(selector).nth(index);
  await target.waitFor({ state: "attached", timeout: 120000 });
  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    const ok = await target.evaluate(
      (el, needArmed) =>
        !el.disabled &&
        el.getAttribute("aria-disabled") !== "true" &&
        (!needArmed || el.getBoundingClientRect().width > 0),
      armed,
    );
    if (ok) break;
    await page.waitForTimeout(300);
  }
  // 气泡锚在猫头上，有时整块被投影到视口外（站点自己的控件也会这样），
  // 真鼠标点不到就直接派发 click，反正只比 DOM 状态
  try {
    await target.click({ force: true, timeout: 8000 });
  } catch (err) {
    const rect = await target.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return [r.x, r.y, r.width, r.height].map((v) => Math.round(v));
    });
    console.log(`[fallback] ${selector} rect=${rect} ${err.message.split("\n")[0]}`);
    await target.evaluate((el) => el.click());
  }
}

// 1) 进入
await clickWhenReady("button[data-ui-sound=page-enter]");
await page.waitForTimeout(1200);

// 2) 等想法气泡冒出来（--thought 时等到指定的那条，想法是随机轮换的）
await page.locator(TEXT.thought).first().waitFor({ state: "attached", timeout: 120000 });
if (wantThought) {
  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    const text = await page.locator(TEXT.thought).first().textContent();
    if (text && text.includes(wantThought)) break;
    await page.waitForTimeout(500);
  }
}
const stepsOut = [];
stepsOut.push({ step: "thought", ...(await snapshot()) });

// 3) 点想法，进入对话
await clickWhenReady(TEXT.thought);
stepsOut.push({ step: 0, ...(await settleLine(null)) });

// 4) 每次点第 pickIndex 个选项
for (let step = 1; step <= steps; step++) {
  const state = await snapshot();
  if (!state.choices.length) break;
  const before = state.reply;
  const index = Math.min(pickIndex, state.choices.length - 1);
  await clickWhenReady(TEXT.choice, { index });
  stepsOut.push({ step, ...(await settleLine(before)) });
}

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(stepsOut, null, 2), "utf8");
console.log(`[walk] ${stepsOut.length} 步 -> ${out}`);
for (const entry of stepsOut) {
  console.log(
    `${String(entry.step).padEnd(8)} listen=${String(entry.listening).padEnd(5)} reply="${(entry.reply ?? "").slice(0, 52)}" choices=${JSON.stringify(entry.choices.map((c) => c.slice(0, 28)))}`,
  );
}

await browser.close();
