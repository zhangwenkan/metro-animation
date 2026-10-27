/**
 * 两张同尺寸截图的区域统计 + 差异热图，用来量化 A/B 色差。
 *
 *   node tools/diff.mjs --a _site_a.png --b _mine_a.png
 *   node tools/diff.mjs --a _site_a.png --b _mine_a.png --rects "seat:1100,650,120,60;sky:600,240,80,60"
 *   node tools/diff.mjs --a _site_a.png --b _mine_a.png --heat _diff.png --heat-scale 20
 *   node tools/diff.mjs --a _site_a.png --b _mine_a.png --align 4   # 搜最优平移（分割内容差异与相位差）
 *
 * 统计走浏览器 canvas 的 getImageData，避免引入原生依赖。
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

const fileA = path.resolve(args.get("a") ?? "_site.png");
const fileB = path.resolve(args.get("b") ?? "_mine.png");
const heat = args.get("heat");
const heatScale = Number(args.get("heat-scale") ?? 16);
const heatThreshold = Number(args.get("heat-threshold") ?? 24);
// --align：在 ±range 像素内搜一个最贴合的平移，用来分辨「真的不一样」和
// 「相机拖动/滚动相位差了几像素」。差在平移上时对齐后 over 会跌回噪声底。
const alignRange = args.has("align") ? Number(args.get("align") === true ? 4 : args.get("align")) : 0;

const rects = String(args.get("rects") ?? "")
  .split(";")
  .filter(Boolean)
  .map((chunk) => {
    const [name, box] = chunk.split(":");
    const [x, y, w, h] = box.split(",").map(Number);
    return { name, x, y, w, h };
  });

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

const mime = (file) =>
  file.endsWith(".jpg") || file.endsWith(".jpeg")
    ? "image/jpeg"
    : file.endsWith(".webp")
      ? "image/webp"
      : "image/png";

const browser = await chromium.launch({ executablePath: findChromium(), headless: true });
const page = await browser.newPage({ viewport: { width: 400, height: 300 } });

const result = await page.evaluate(
  async ({ a, b, mimeA, mimeB, rects, threshold, alignRange }) => {
    const load = async (src, type) => {
      const image = new Image();
      image.src = `data:${type};base64,${src}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(image, 0, 0);
      return { image, ctx, width: canvas.width, height: canvas.height };
    };

    const left = await load(a, mimeA);
    const right = await load(b, mimeB);

    const mean = (ctx, x, y, w, h) => {
      const data = ctx.getImageData(x, y, w, h).data;
      let r = 0;
      let g = 0;
      let bl = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        bl += data[i + 2];
      }
      const n = data.length / 4;
      return [r / n, g / n, bl / n].map((v) => Math.round(v * 10) / 10);
    };

    const regions = rects.map(({ name, x, y, w, h }) => {
      const ma = mean(left.ctx, x, y, w, h);
      const mb = mean(right.ctx, x, y, w, h);
      // 区域内的超阈像素占比：均值撞车时（两个表情长得像）靠它分辨
      const da = left.ctx.getImageData(x, y, w, h).data;
      const db = right.ctx.getImageData(x, y, w, h).data;
      let over = 0;
      for (let i = 0; i < da.length; i += 4) {
        const d =
          Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
        if (d > threshold * 3) over++;
      }
      return {
        name,
        site: ma,
        mine: mb,
        delta: ma.map((v, i) => Math.round((mb[i] - v) * 10) / 10),
        over: Math.round((over / (w * h)) * 1000) / 10,
      };
    });

    // 全图：平均色 + 超过阈值的像素占比（结构性差异的粗指标）
    const full = (source, other) => {
      const width = Math.min(source.width, other.width);
      const height = Math.min(source.height, other.height);
      const da = source.ctx.getImageData(0, 0, width, height).data;
      const db = other.ctx.getImageData(0, 0, width, height).data;
      const sums = [0, 0, 0];
      let over = 0;
      let total = 0;
      for (let i = 0; i < da.length; i += 4) {
        sums[0] += db[i];
        sums[1] += db[i + 1];
        sums[2] += db[i + 2];
        const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
        if (d > threshold * 3) over++;
        total++;
      }
      return {
        mineMean: sums.map((v) => Math.round((v / total) * 10) / 10),
        overThreshold: Math.round((over / total) * 1000) / 10,
        width,
        height,
      };
    };

    return {
      size: [left.width, left.height, right.width, right.height],
      regions,
      full: full(left, right),
      align: alignRange
        ? (() => {
            const w = Math.min(left.width, right.width);
            const h = Math.min(left.height, right.height);
            const da = left.ctx.getImageData(0, 0, w, h).data;
            const db = right.ctx.getImageData(0, 0, w, h).data;
            let best = { dx: 0, dy: 0, over: 1 };
            for (let dy = -alignRange; dy <= alignRange; dy++) {
              for (let dx = -alignRange; dx <= alignRange; dx++) {
                let over = 0;
                let total = 0;
                for (let y = Math.max(0, -dy); y < Math.min(h, h - dy); y += 2) {
                  for (let x = Math.max(0, -dx); x < Math.min(w, w - dx); x += 2) {
                    const i = (y * w + x) * 4;
                    const j = ((y + dy) * w + (x + dx)) * 4;
                    const d =
                      Math.abs(da[i] - db[j]) +
                      Math.abs(da[i + 1] - db[j + 1]) +
                      Math.abs(da[i + 2] - db[j + 2]);
                    if (d > threshold * 3) over++;
                    total++;
                  }
                }
                if (over / total < best.over) best = { dx, dy, over: over / total };
              }
            }
            return { dx: best.dx, dy: best.dy, over: Math.round(best.over * 1000) / 10 };
          })()
        : null,
    };
  },
  {
    a: fs.readFileSync(fileA).toString("base64"),
    b: fs.readFileSync(fileB).toString("base64"),
    mimeA: mime(fileA),
    mimeB: mime(fileB),
    rects,
    threshold: heatThreshold,
    alignRange,
  },
);

console.log("[size]", JSON.stringify(result.size));
console.log("[full]", JSON.stringify(result.full));
if (result.align) {
  console.log("[align]", JSON.stringify(result.align));
}
for (const region of result.regions) {
  console.log(
    `[${region.name}] site=${region.site.join(",")} mine=${region.mine.join(",")} delta=${region.delta.join(",")} over=${region.over}%`,
  );
}

if (heat) {
  const width = result.full.width;
  const height = result.full.height;
  const heatPath = path.resolve(heat);
  fs.mkdirSync(path.dirname(heatPath), { recursive: true });
  await page.setViewportSize({ width: Math.ceil(width / heatScale), height: Math.ceil(height / heatScale) });
  await page.setContent(
    `<body style="margin:0;background:#000"><canvas id="c" width="${Math.ceil(width / heatScale)}" height="${Math.ceil(height / heatScale)}"></canvas></body>`,
  );
  await page.evaluate(
    async ({ a, b, mimeA, mimeB, width, height, scale, threshold }) => {
      const load = async (src, type) => {
        const image = new Image();
        image.src = `data:${type};base64,${src}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(image, 0, 0);
        return ctx;
      };

      const ctxA = await load(a, mimeA);
      const ctxB = await load(b, mimeB);
      const da = ctxA.getImageData(0, 0, width, height).data;
      const db = ctxB.getImageData(0, 0, width, height).data;

      const out = document.getElementById("c").getContext("2d");
      const image = out.createImageData(width, height);
      const limit = threshold * 3;
      for (let i = 0; i < da.length; i += 4) {
        const d =
          Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
        const t = Math.min(1, d / limit);
        image.data[i] = Math.round(255 * t);
        image.data[i + 1] = Math.round(80 * t);
        image.data[i + 2] = Math.round(255 * (1 - t) * 0.15);
        image.data[i + 3] = 255;
      }
      const temp = document.createElement("canvas");
      temp.width = width;
      temp.height = height;
      temp.getContext("2d").putImageData(image, 0, 0);
      out.imageSmoothingEnabled = true;
      out.drawImage(temp, 0, 0, width / scale, height / scale);
    },
    {
      a: fs.readFileSync(fileA).toString("base64"),
      b: fs.readFileSync(fileB).toString("base64"),
      mimeA: mime(fileA),
      mimeB: mime(fileB),
      width,
      height,
      scale: heatScale,
      threshold: heatThreshold,
    },
  );
  await page.locator("#c").screenshot({ path: heatPath });
  console.log("[heat]", heatPath);
}

await browser.close();
