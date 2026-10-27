/**
 * 把站点 chunk 里被 JSON.parse('...') 内联的资源还原成文件，并补齐 public 下缺的图片。
 *
 *   node tools/extract-assets.mjs
 *
 * 站点把 logo 的 SVG 路径当成 JSON 字符串塞进 chunk（模块 44684），
 * 直接引用站点原始数据比手抄 path 更稳妥，所以这里还原成 public/assets/intro/ajo-logo.json。
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const chunks = path.resolve(root, "../ref/site/chunks");
const origin = "https://www.tobis.vision";

/** 从一个 chunk 里找出所有 JSON.parse('...') 内联块 */
function inlineJson(text) {
  const found = [];
  const marker = "JSON.parse('";
  let from = 0;
  while (true) {
    const at = text.indexOf(marker, from);
    if (at < 0) break;
    from = at + marker.length;

    // 扫到未被转义的结束单引号
    let end = from;
    while (end < text.length) {
      if (text[end] === "\\") {
        end += 2;
        continue;
      }
      if (text[end] === "'") break;
      end++;
    }

    const literal = text.slice(from, end).replaceAll("\\'", "'").replaceAll('\\\\', "\\");
    try {
      found.push({ at, value: JSON.parse(literal) });
    } catch (error) {
      console.log(`[skip] @${at} ${error.message}`);
    }
  }
  return found;
}

const shellChunk = fs.readFileSync(path.join(chunks, "1hywx2bplomjl.js"), "utf8");
for (const { at, value } of inlineJson(shellChunk)) {
  const keys = Object.keys(value);
  console.log(`[json] @${at} keys=${keys.slice(0, 6).join(",")} size=${JSON.stringify(value).length}`);

  // logo：background + letters（每组若干 path）
  if (value.background && value.letters) {
    const out = path.join(root, "public/assets/intro/ajo-logo.json");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(value));
    const paths = value.letters.reduce((n, group) => n + group.length, 0);
    console.log(`[logo] ${out} groups=${value.letters.length} paths=${paths}`);

    // 站点把这份 path 数据编进 JS bundle（模块 44684），不是运行时 fetch；
    // 复刻里也做成模块，保证首帧就有 logo，和站点 SSR 直出一致。
    const module = path.join(root, "src/ui/ajoLogoData.js");
    fs.mkdirSync(path.dirname(module), { recursive: true });
    fs.writeFileSync(
      module,
      `// 由 tools/extract-assets.mjs 从站点 chunk 模块 44684 还原，请勿手改。\nexport default ${JSON.stringify(value)};\n`,
    );
    console.log(`[logo] ${module}`);
  }
}

/** public 下还缺的图片资源 */
const downloads = [
  ["/assets/intro/ajo-run.webp", "public/assets/intro/ajo-run.webp"],
  // 报纸弹窗里那个 28×28 的猫头
  ["/assets/favicon/ajo-open.svg", "public/assets/favicon/ajo-open.svg"],
];

for (const [url, relative] of downloads) {
  const target = path.join(root, relative);
  if (fs.existsSync(target)) {
    console.log(`[have] ${relative}`);
    continue;
  }
  const response = await fetch(origin + url);
  if (!response.ok) {
    console.log(`[fail] ${url} ${response.status}`);
    continue;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  console.log(`[get ] ${relative} ${fs.statSync(target).size}`);
}
