/**
 * 双页 computed-style A/B：同时打开站点和本地，按同一套探针取元素几何 + 计算样式，
 * 逐条对比。比截图更快定位「类名在原站根本没生成」这类差异。
 *
 *   node tools/props.mjs --a https://www.tobis.vision/ --b http://localhost:5173/ \
 *     --clicks "button[data-ui-sound=page-enter]" --wait 9000 --probes tools/probes.json
 *   node tools/props.mjs --probes tools/probes-entry.json \
 *     --until "button[data-ui-sound=page-enter]:not([disabled])" --wait 1200
 *
 * 探针格式：[{ "name": "...", "sel": "css", "up": 1, "notext": true }]，up = 从命中元素往上走几层父节点，
 * notext = 不比 textContent（气泡、字幕这类文字内容随动画时序变化，只比盒子）。
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
  } else {
    args.set(token.slice(2), true);
  }
}

const urlA = args.get("a") ?? "https://www.tobis.vision/";
const urlB = args.get("b") ?? "http://localhost:5173/";
const width = Number(args.get("w") ?? 1600);
const height = Number(args.get("h") ?? 900);
const dpr = Number(args.get("dpr") ?? 1);
const wait = Number(args.get("wait") ?? 9000);
const clicks = String(args.get("clicks") ?? "")
  .split("|")
  .filter(Boolean);
const probeFile = path.resolve(args.get("probes") ?? "tools/probes.json");
const probes = JSON.parse(fs.readFileSync(probeFile, "utf8"));

// 只比这些属性：既覆盖摆位/字号/颜色，又不会因为无意义的值噪声假阳性
const PROPS = [
  "display",
  "position",
  "inset",
  "width",
  "height",
  "margin",
  "padding",
  "gap",
  "flex-direction",
  "align-items",
  "justify-content",
  "flex-grow",
  "flex-basis",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-stretch",
  "font-kerning",
  "font-variation-settings",
  "font-feature-settings",
  "font-optical-sizing",
  "word-spacing",
  "text-transform",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-wrap",
  "white-space",
  "color",
  "background-color",
  "border-radius",
  "border-width",
  "box-shadow",
  "opacity",
  "transform",
  "translate",
  "scale",
  "rotate",
  "filter",
  "z-index",
  "overflow",
  "overscroll-behavior",
  "-webkit-text-stroke-width",
  "-webkit-text-stroke-color",
  "text-shadow",
  "cursor",
  "pointer-events",
  "fill",
  "stroke-width",
];

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
  // 站点要 WebGPU，必须开真窗口（挪到屏幕外）
  headless: false,
  args: [
    "--enable-unsafe-webgpu",
    "--window-position=-2400,0",
    `--window-size=${width},${height}`,
    "--disable-lcd-text",
  ],
});

async function capture(url, label) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: dpr });
  // fonts.googleapis.com 在这个环境里连不上，站点会因为 CSS chunk 加载失败整页报错；
  // 站点样式表没用 Geist，兜成空样式表不影响视觉。
  if (args.has("no-webfonts")) {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
      route.fulfill({ status: 200, contentType: "text/css", body: "" }),
    );
  }
  page.on("pageerror", (err) => console.log(`[${label}.pageerror] ${err.message}`));
  // waitUntil: load 会被挂住的子资源（比如连不上的 Google Fonts）拖到超时
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  } catch (err) {
    console.log(`[${label}.goto] ${err.message.split("\n")[0]}`);
  }

  for (let step = 0; step < clicks.length; step++) {
    const selector = clicks[step];
    const target = page.locator(selector).first();
    await target.waitFor({ state: "attached", timeout: 90000 });
    // 站点预加载资产时会禁用 Enter，网络慢的时候要等很久；
    // 宁可多等，也不要对着 disabled 按钮点空
    const deadline = Date.now() + 180000;
    while (Date.now() < deadline) {
      const blocked = await target.evaluate(
        (el) => !!el.disabled || el.getAttribute("aria-disabled") === "true",
      );
      if (!blocked) break;
      await page.waitForTimeout(400);
    }
    const stillBlocked = await target.evaluate(
      (el) => !!el.disabled || el.getAttribute("aria-disabled") === "true",
    );
    if (stillBlocked) throw new Error(`[${label}] ${selector} 一直是 disabled，站点没加载完`);
    // 热点类按钮（报纸）平时 pointer-events-none 且尺寸为 0，要等镜头把它带进画面
    const armed = () =>
      target.evaluate(
        (el) => el.getBoundingClientRect().width > 0 && getComputedStyle(el).pointerEvents !== "none",
      );
    if (!(await armed())) {
      const armDeadline = Date.now() + 60000;
      while (Date.now() < armDeadline) {
        await page.waitForTimeout(200);
        if (await armed()) break;
      }
    }
    await target.click({ force: true, timeout: 30000 });
    // 想法气泡要等 4.5~9 秒才冒出来，用 --wait-<n> 单独指定这一下的等待
    await page.waitForTimeout(Number(args.get(`wait-${step + 1}`) ?? 1200));
  }

  await page.waitForTimeout(wait);

  // --until <sel>：等到某个元素出现再取证（两边加载速度不一样，固定等待会
  // 把「站点还在 Loading、本地已就绪」当成差异）
  const until = args.get("until");
  if (until) {
    const untilDeadline = Date.now() + 180000;
    while (Date.now() < untilDeadline) {
      if (await page.evaluate((sel) => !!document.querySelector(sel), until)) break;
      await page.waitForTimeout(200);
    }
  }

  // --hover：把鼠标悬到某个元素上，用来验 whileHover 的各种变形
  const hover = args.get("hover");
  if (hover) {
    await page.locator(hover).first().hover({ force: true, timeout: 30000 });
    await page.waitForTimeout(1000);
  }

  const data = await page.evaluate(
    ({ probes, PROPS }) => {
      const round = (v) => Math.round(v * 100) / 100;
      const result = {};
      for (const probe of probes) {
        let el = document.querySelector(probe.sel);
        for (let i = 0; i < (probe.up ?? 0) && el; i++) el = el.parentElement;
        if (!el) {
          result[probe.name] = null;
          continue;
        }
        const rect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        // 文本真实渲染宽度：字体（或字宽轴）不一致时 rect 可能被容器夹住看不出来，
        // 但 Range 量出来的行宽会直接暴露差异。
        const range = document.createRange();
        range.selectNodeContents(el);
        const textWidth = Math.round(Math.max(0, ...[...range.getClientRects()].map((r) => r.width)) * 100) / 100;
        const style = {};
        for (const prop of PROPS) style[prop] = cs.getPropertyValue(prop);
        result[probe.name] = {
          rect: [round(rect.x), round(rect.y), round(rect.width), round(rect.height)],
          textWidth: Number.isFinite(textWidth) ? textWidth : 0,
          text: (el.textContent ?? "").trim().slice(0, 40),
          style,
        };
      }
      return result;
    },
    { probes, PROPS },
  );

  await page.close();
  return data;
}

const site = await capture(urlA, "site");
const mine = await capture(urlB, "mine");
await browser.close();

const showAll = args.has("all");
let diffs = 0;
for (const probe of probes) {
  const a = site[probe.name];
  const b = mine[probe.name];
  if (!a && !b) {
    // 两边都没命中通常说明这个状态不在当前画面（例如加载完就没有 runner 了）
    if (showAll) console.log(`[${probe.name}] absent（两边都没有）`);
    continue;
  }
  if (!a || !b) {
    console.log(`[${probe.name}] MISSING site=${!!a} mine=${!!b}`);
    diffs++;
    continue;
  }
  const problems = [];
  if (a.rect.join() !== b.rect.join()) problems.push(`rect site=${a.rect} mine=${b.rect}`);
  if (a.textWidth !== b.textWidth) problems.push(`textWidth site=${a.textWidth} mine=${b.textWidth}`);
  for (const prop of PROPS) {
    if (a.style[prop] !== b.style[prop]) {
      problems.push(`${prop}: site="${a.style[prop]}" mine="${b.style[prop]}"`);
    }
  }
  if (!probe.notext && a.text !== b.text) problems.push(`text site="${a.text}" mine="${b.text}"`);

  if (problems.length) {
    diffs++;
    console.log(`\n[${probe.name}] ${probe.sel}`);
    for (const line of problems) console.log(`  ${line}`);
  } else if (showAll) {
    console.log(`[${probe.name}] ok  rect=${a.rect}`);
  }
}
console.log(`\n${probes.length - diffs}/${probes.length} probes identical`);