/**
 * 抓站点首屏：body 文本、按钮清单、控制台报错。
 *   node tools/probe-raw.mjs --wait 8000
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
const wait = Number(args.get("wait") ?? 8000);
const click = args.get("click");

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
  args: ["--enable-unsafe-webgpu", "--window-position=-2400,0", "--window-size=1600,900"],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
page.on("console", (m) => {
  if (m.type() === "error") console.log("[console.error]", m.text().slice(0, 200));
});
page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(0, 200)));
page.on("requestfailed", (r) => console.log("[requestfailed]", r.url().slice(0, 120), r.failure()?.errorText));

await page.goto(url, { waitUntil: "load", timeout: 120000 });

if (click) {
  // 等 Enter 按钮从 disabled 变可用（站点要先下完 GLB）
  await page.waitForFunction(
    (selector) => {
      const el = document.querySelector(selector);
      return !!el && !el.disabled;
    },
    click,
    { timeout: 120000, polling: 250 },
  );
  await page.click(click, { force: true, timeout: 20000 });
}

await page.waitForTimeout(wait);

const info = await page.evaluate(() => {
  const buttons = [...document.querySelectorAll("button")].map((el) => {
    const rect = el.getBoundingClientRect();
    return {
      text: (el.textContent ?? "").trim().slice(0, 60),
      ariaLabel: el.getAttribute("aria-label"),
      disabled: !!el.disabled,
      rect: [Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)],
      className: String(el.className).slice(0, 200),
    };
  });
  return {
    title: document.title,
    bodyText: document.body.innerText.slice(0, 400),
    htmlLength: document.documentElement.outerHTML.length,
    buttons,
    canvases: [...document.querySelectorAll("canvas")].map((c) => [c.width, c.height]),
    visible: [...document.querySelectorAll("body *")]
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return { el, rect, style };
      })
      .filter(({ el, rect, style }) => {
        if (rect.width < 2 || rect.height < 2) return false;
        if (style.display === "none" || style.visibility === "hidden") return false;
        return ["BUTTON", "P", "DIV", "SVG", "SECTION", "SPAN"].includes(el.tagName);
      })
      .slice(0, 60)
      .map(({ el, rect, style }) => ({
        tag: el.tagName.toLowerCase(),
        ariaLabel: el.getAttribute("aria-label"),
        role: el.getAttribute("role"),
        text: (el.textContent ?? "").trim().slice(0, 60),
        rect: [Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)],
        opacity: style.opacity,
        color: style.color,
        background: style.backgroundColor,
        fontSize: style.fontSize,
        className: String(el.className?.baseVal ?? el.className ?? "").slice(0, 300),
      })),
  };
});

fs.writeFileSync("_raw.json", JSON.stringify(info, null, 2));
console.log(JSON.stringify(info, null, 2).slice(0, 3000));
await page.screenshot({ path: "_raw.png" });
await browser.close();
