/**
 * 裁剪 + 放大已有截图，方便逐块比对细节。
 *
 *   node tools/crop.mjs --in _site.png --out _a.png --rect 0,40,450,120 --scale 2
 *
 * 借浏览器当图像处理器：读成 data URL、画到 canvas、再把 canvas 截下来。
 * 这样不用额外装 sharp / canvas 之类的原生依赖。
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
const output = path.resolve(args.get("out") ?? "_crop.png");
const scale = Number(args.get("scale") ?? 2);
const [x, y, width, height] = String(args.get("rect") ?? "0,0,400,200").split(",").map(Number);

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
const page = await browser.newPage({
  viewport: { width: Math.ceil(width * scale), height: Math.ceil(height * scale) },
  deviceScaleFactor: 1,
});

const source = `data:image/png;base64,${fs.readFileSync(input).toString("base64")}`;
await page.setContent(
  `<body style="margin:0;background:#000"><canvas id="c" width="${Math.ceil(width * scale)}" height="${Math.ceil(height * scale)}"></canvas></body>`,
);

await page.evaluate(
  async ({ source, x, y, width, height, scale }) => {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, x, y, width, height, 0, 0, width * scale, height * scale);
  },
  { source, x, y, width, height, scale },
);

fs.mkdirSync(path.dirname(output), { recursive: true });
await page.locator("#c").screenshot({ path: output });
console.log("[crop]", output);
await browser.close();
