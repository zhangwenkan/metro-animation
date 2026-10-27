/**
 * 资产对账：把站点上的音频 / 字体拉下来算 sha1，与 replica/public 里的同名文件比。
 * 这台机器到大文件的连接时好时坏，失败会重试 3 次并允许整体失败（不阻断其它验证）。
 *
 * 字体是 next/font 管的，文件名带构建哈希（Amiamie_RegularRound-s.p.xxxx.otf），
 * 所以不写死：先拉首页、顺着 stylesheet 链把 /media/Amiamie_*.otf 找出来再比。
 *
 * 用法：node replica/tools/asset-hash.mjs
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// 以脚本自己为基准，从哪个目录跑都一样
const ROOT = path.resolve(import.meta.dirname, "../..");
const SITE = "https://www.tobis.vision";

const FILES = [
  "assets/train/audio/ajo-morning.ogg",
  "assets/train/audio/bump.ogg",
  "assets/train/audio/carriage-loop.ogg",
  "assets/train/audio/cat-disclaimer.ogg",
  "assets/train/audio/newspaper-pickup.ogg",
  "assets/train/audio/station-announcement.ogg",
];

const sha1 = (buffer) => crypto.createHash("sha1").update(buffer).digest("hex");

async function download(url, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (err) {
      if (i === attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
}

let mismatched = 0;
let failed = 0;
let total = 0;

async function compare(label, localPath, remoteUrl) {
  total += 1;
  const local = fs.readFileSync(path.join(ROOT, "replica/public", localPath));
  const localHash = sha1(local);
  try {
    const remote = await download(remoteUrl);
    const remoteHash = sha1(remote);
    const ok = remoteHash === localHash;
    if (!ok) mismatched += 1;
    console.log(`${ok ? "一致" : "不一致"}  ${label}  ${local.length}B  ${localHash.slice(0, 12)}`);
  } catch (err) {
    failed += 1;
    console.log(`拉取失败 ${label}  本地 ${local.length}B  ${localHash.slice(0, 12)}  (${err.message})`);
  }
}

for (const file of FILES) await compare(file, file, `${SITE}/${file}`);

// 字体：从站点首页的样式表里找 next/font 生成的哈希文件名
try {
  const html = (await download(`${SITE}/`)).toString("utf8");
  const cssHrefs = [...html.matchAll(/href="([^"]+\.css)"/g)].map((match) => match[1]);
  const found = new Map();
  for (const href of cssHrefs) {
    const url = new URL(href, `${SITE}/`).href;
    const css = (await download(url)).toString("utf8");
    for (const match of css.matchAll(/url\(["']?\.\.\/media\/(Amiamie_[^"')]+\.otf)["']?\)/g)) {
      found.set(match[1], new URL(`../media/${match[1]}`, url).href);
    }
  }
  for (const [name, url] of [...found].sort()) {
    const local = /Italic/i.test(name) ? "fonts/amiamie-italic.otf" : "fonts/amiamie-regular.otf";
    await compare(`字体 ${name}`, local, url);
  }
  if (found.size === 0) console.log("字体 未在站点样式表里找到 Amiamie otf");
} catch (err) {
  failed += 1;
  console.log(`字体 定位失败 (${err.message})`);
}

console.log(`\n${total} 个文件：${total - mismatched - failed} 一致 / ${mismatched} 不一致 / ${failed} 拉取失败`);
process.exitCode = mismatched > 0 ? 1 : 0;
