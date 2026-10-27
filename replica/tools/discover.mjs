/**
 * 站点勘察：打开页面，按顺序点几下，然后把 DOM 里「有意义的元素」摊平打印出来
 * （aria-label / role / 可见性 / 矩形 / 文本），外加整棵 main 的结构。
 * 用来在没有源码的情况下搞清某一屏到底渲染了什么。
 *
 *   node tools/discover.mjs --url https://www.tobis.vision/ \
 *     --clicks "button[data-ui-sound=page-enter]|button[aria-label='Read the newspaper']" \
 *     --wait 6000 --html main
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

const url = args.get("url") ?? "https://www.tobis.vision/";
const width = Number(args.get("w") ?? 1600);
const height = Number(args.get("h") ?? 900);
const wait = Number(args.get("wait") ?? 9000);
const gap = Number(args.get("gap") ?? 1500);
const htmlSel = args.get("html");
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

for (let index = 0; index < clicks.length; index++) {
  const selector = clicks[index];
  const target = page.locator(selector).first();
  await target.waitFor({ state: "attached", timeout: 120000 });
  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    const blocked = await target.evaluate(
      (el) => !!el.disabled || el.getAttribute("aria-disabled") === "true",
    );
    if (!blocked) break;
    await page.waitForTimeout(400);
  }
  // 热点类按钮（比如报纸）平时是 pointer-events-none 且尺寸为 0，
  // 要等镜头把它带进画面才能点
  const armed = await target.evaluate(
    (el) => el.getBoundingClientRect().width > 0 && getComputedStyle(el).pointerEvents !== "none",
  );
  if (!armed) {
    for (let spin = 0; spin < 300; spin++) {
      await page.waitForTimeout(200);
      const ok = await target.evaluate(
        (el) =>
          el.getBoundingClientRect().width > 0 && getComputedStyle(el).pointerEvents !== "none",
      );
      if (ok) break;
    }
  }
  await target.click({ force: true, timeout: 30000 });
  await page.waitForTimeout(Number(args.get(`wait-${index + 1}`) ?? gap));
}

await page.waitForTimeout(wait);

const shot = args.get("out");
if (shot) {
  await page.screenshot({ path: path.resolve(shot) });
  console.log(`[shot] ${path.resolve(shot)}`);
}

const flat = await page.evaluate(() => {
  const round = (v) => Math.round(v * 100) / 100;
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const label = el.getAttribute("aria-label");
    const role = el.getAttribute("role");
    const tabIndex = el.getAttribute("tabindex");
    if (!label && !role && !tabIndex) continue;
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (rect.width === 0 && rect.height === 0) continue;
    out.push({
      tag: el.tagName.toLowerCase(),
      label,
      role,
      tabIndex,
      hidden: cs.visibility === "hidden" || cs.pointerEvents === "none",
      rect: [round(rect.x), round(rect.y), round(rect.width), round(rect.height)],
      cls: el.className?.baseVal ?? String(el.className ?? "").slice(0, 160),
      text: (el.innerText ?? "").replace(/\s+/g, " ").trim().slice(0, 80),
    });
  }
  return out;
});
console.log("[flat]");
for (const item of flat) console.log(JSON.stringify(item));

if (htmlSel) {
  const html = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const t = node.textContent.replace(/\s+/g, " ").trim();
        return t ? t : "";
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return "";
      const tag = node.tagName.toLowerCase();
      const attrs = [...node.attributes]
        .filter((a) => !["style"].includes(a.name))
        .map((a) => `${a.name}="${a.value}"`)
        .join(" ");
      const open = `<${tag}${attrs ? " " + attrs : ""}>`;
      const child = [...node.childNodes].map(walk).join("");
      return `${open}${child}</${node.tagName.toLowerCase()}>`;
    };
    return walk(el);
  }, htmlSel);
  const outFile = `_discover.html`;
  fs.writeFileSync(outFile, (html ?? "(null)").replace(/></g, ">\n<"), "utf8");
  console.log(`\n[html] -> ${outFile}`);
}

await browser.close();
