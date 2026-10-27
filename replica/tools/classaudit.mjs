/**
 * 类名审计：抓本地页面真实用到的所有 class，逐个到站点 CSS 里查有没有对应规则。
 * 原站的 Tailwind 构建只生成了一部分具名工具类（tracking-tight、sm:xxx 都没有），
 * 这些类在我这边会真的生效，于是产生 1~3px 的偏差，必须找出来去掉。
 *
 *   node tools/classaudit.mjs --clicks "button[data-ui-sound=page-enter]|button[aria-label^=About]"
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

const url = args.get("url") ?? "http://localhost:5173/";
const width = Number(args.get("w") ?? 1600);
const height = Number(args.get("h") ?? 900);
const wait = Number(args.get("wait") ?? 9000);
const clicks = String(args.get("clicks") ?? "")
  .split("|")
  .filter(Boolean);

// 站点三份 CSS 去掉转义反斜杠后拼成一座「已生成类名」的字典
const styleDir = path.resolve(args.get("css") ?? "../ref/site/styles");
const css = fs
  .readdirSync(styleDir)
  .filter((name) => name.endsWith(".css"))
  .map((name) => fs.readFileSync(path.join(styleDir, name), "utf8"))
  .join("\n")
  .replace(/\\/g, "");

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
await page.goto(url, { waitUntil: "load", timeout: 120000 });

for (const selector of clicks) {
  const target = page.locator(selector).first();
  await target.waitFor({ state: "attached", timeout: 90000 });
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    const blocked = await target.evaluate(
      (el) => !!el.disabled || el.getAttribute("aria-disabled") === "true",
    );
    if (!blocked) break;
    await page.waitForTimeout(300);
  }
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
  await page.waitForTimeout(1500);
}

await page.waitForTimeout(wait);

const tokens = await page.evaluate(() => {
  const set = new Set();
  for (const el of document.querySelectorAll("*")) {
    for (const token of el.classList) set.add(token);
  }
  return [...set].sort();
});

await browser.close();

// 我自己的类（entry-*、hud、font-amiamie）不算
const own = /^(entry-|hud$|hud\b|font-amiamie$)/;
const missing = tokens.filter((token) => !own.test(token) && !css.includes(`.${token}`));
const found = tokens.length - missing.length;

console.log(`[tokens] ${tokens.length}  used, ${found} 在站点 CSS 里存在, ${missing.length} 缺失`);
for (const token of missing) console.log(`  ${token}`);
