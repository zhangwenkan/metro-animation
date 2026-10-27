/**
 * 双页 DOM 结构 A/B：同时打开站点和本地，按同一串点击走到目标视图，
 * 然后把指定选择器命中的元素 outerHTML 打出来，方便逐类比对标记结构。
 * 与 classaudit 的区别：classaudit 只查「类名在站点 CSS 里有没有」，
 * 这里查「站点 DOM 到底挂了哪些类」，能抓到「我多写了类」这种反向问题。
 *
 *   node tools/markup.mjs --sel "section[aria-label='About Tobi'] ul" \
 *     --clicks "button[data-ui-sound=page-enter]|button[aria-label^=About]|button[aria-label='Selected work']" \
 *     --wait 5000 --depth 2
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
const wait = Number(args.get("wait") ?? 9000);
const sel = String(args.get("sel") ?? "");
const depth = Number(args.get("depth") ?? 2);
const clicks = String(args.get("clicks") ?? "")
  .split("|")
  .filter(Boolean);

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
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "load", timeout: 120000 });

  for (const selector of clicks) {
    const target = page.locator(selector).first();
    await target.waitFor({ state: "attached", timeout: 90000 });
    const deadline = Date.now() + 180000;
    while (Date.now() < deadline) {
      const blocked = await target.evaluate(
        (el) => !!el.disabled || el.getAttribute("aria-disabled") === "true",
      );
      if (!blocked) break;
      await page.waitForTimeout(400);
    }
    await target.click({ force: true, timeout: 30000 });
    await page.waitForTimeout(1200);
  }

  await page.waitForTimeout(wait);

  const html = await page.evaluate(
    ({ sel, depth }) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      // 只保留到 depth 层，太深的 svg path 之类噪声剪掉
      const walk = (node, level) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.replace(/\s+/g, " ").trim();
          return text ? text : "";
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return "";
        const tag = node.tagName.toLowerCase();
        const attrs = [...node.attributes]
          .map((a) => `${a.name}="${a.value}"`)
          .join(" ");
        const open = `<${tag}${attrs ? " " + attrs : ""}>`;
        if (level >= depth) return open;
        const inner = [...node.childNodes].map((child) => walk(child, level + 1)).join("");
        return `${open}${inner}</${tag}>`;
      };
      return walk(el, 0);
    },
    { sel, depth },
  );

  await page.close();
  return html;
}

const site = await capture(urlA, "site");
const mine = await capture(urlB, "mine");
await browser.close();

const pretty = (html) =>
  html
    ? html
        .replace(/></g, ">\n<")
        .replace(/ class="([^"]*)"/g, (_, cls) => ` class="${cls.split(/\s+/).join(" ")}"`)
    : "(null)";

fs.writeFileSync("_markup-site.txt", pretty(site), "utf8");
fs.writeFileSync("_markup-mine.txt", pretty(mine), "utf8");

const siteLines = pretty(site).split("\n");
const mineLines = pretty(mine).split("\n");
const max = Math.max(siteLines.length, mineLines.length);
let diffs = 0;
for (let i = 0; i < max; i++) {
  if (siteLines[i] === mineLines[i]) continue;
  diffs++;
  console.log(`--- line ${i + 1}`);
  console.log(`site: ${siteLines[i] ?? "(none)"}`);
  console.log(`mine: ${mineLines[i] ?? "(none)"}`);
}
console.log(`\n${diffs === 0 ? "identical" : diffs + " differing lines"}  (->_markup-site.txt / _markup-mine.txt)`);
