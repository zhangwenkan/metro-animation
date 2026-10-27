/**
 * 在截图里量一个矩形区域的“暗像素包围盒”，用来对齐几何尺寸。
 *
 *   node tools/measure.mjs --in _site_a.png --rect 0,0,500,220 --max 45
 *   node tools/measure.mjs --in _dbg.png   --rect 0,0,500,220 --max 45
 *
 * 输出：暗像素的最小/最大 x、y 以及宽高，可直接比较两块水牌的屏幕尺寸。
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

const input = path.resolve(args.get("in") ?? "_shot.png");
const [rx, ry, rw, rh] = String(args.get("rect") ?? "0,0,400,200").split(",").map(Number);
const max = Number(args.get("max") ?? 45);
// --rgb r,g,b --tol n：改成量“接近某个颜色”的像素，比如字幕的 #ffe373
const rgb = args.get("rgb") ? String(args.get("rgb")).split(",").map(Number) : null;
const tol = Number(args.get("tol") ?? 40);

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

const browser = await chromium.launch({ executablePath: findChromium(), headless: true });
const page = await browser.newPage({ viewport: { width: 200, height: 200 } });

const result = await page.evaluate(
  async ({ source, rx, ry, rw, rh, max, rgb, tol }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${source}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(rx, ry, rw, rh).data;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let count = 0;
    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        const i = (y * rw + x) * 4;
        const hit = rgb
          ? Math.abs(data[i] - rgb[0]) <= tol &&
            Math.abs(data[i + 1] - rgb[1]) <= tol &&
            Math.abs(data[i + 2] - rgb[2]) <= tol
          : data[i] <= max && data[i + 1] <= max && data[i + 2] <= max;
        if (!hit) continue;
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (!count) return { count: 0 };
    return {
      count,
      x: [rx + minX, rx + maxX],
      y: [ry + minY, ry + maxY],
      size: [maxX - minX + 1, maxY - minY + 1],
    };
  },
  {
    source: fs.readFileSync(input).toString("base64"),
    rx,
    ry,
    rw,
    rh,
    max,
    rgb,
    tol,
  },
);

console.log("[measure]", path.basename(input), JSON.stringify(result));
await browser.close();
