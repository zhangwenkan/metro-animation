/**
 * 语音合成器静态对账：把站点 chunk 里那段 formantSynth 原文和 replica 的
 * src/audio/formantSynth.js 逐字符比（忽略空白）。
 *
 * 用法：node replica/tools/speech-diff.mjs
 */
import fs from "node:fs";
import path from "node:path";

const SITE_START = 1498617;
const SITE_END = 1510198;
// 以脚本自己为基准，从哪个目录跑都一样
const ROOT = path.resolve(import.meta.dirname, "../..");

const chunk = fs.readFileSync(path.join(ROOT, "ref/site/chunks/1reeeg5qme_uu.js"), "utf8");
const siteRaw = chunk
  .slice(SITE_START, SITE_END)
  // 开头这句是 three 的模块引用（Fz 在这段里根本没用到），复刻时去掉了
  .replace(/^var Fz=e\.i\(44841\),/, "var ");

const mineFile = fs.readFileSync(path.join(ROOT, "replica/src/audio/formantSynth.js"), "utf8");
const mineStart = mineFile.indexOf("var FG=");
const mineEnd = mineFile.indexOf("export { F8 as createSpeech }");
const mineRaw = mineFile.slice(mineStart, mineEnd);

fs.writeFileSync(path.join(ROOT, "replica/tools/_speech-site.txt"), siteRaw, "utf8");
fs.writeFileSync(path.join(ROOT, "replica/tools/_speech-mine.txt"), mineRaw, "utf8");

console.log(`站点段 ${siteRaw.length} 字符，开头：${JSON.stringify(siteRaw.slice(0, 40))}`);
console.log(`站点段结尾：${JSON.stringify(siteRaw.slice(-60))}`);
console.log(`复刻段 ${mineRaw.length} 字符，开头：${JSON.stringify(mineRaw.slice(0, 40))}`);
console.log(`复刻段结尾：${JSON.stringify(mineRaw.slice(-60))}`);

const squash = (text) => text.replace(/\s+/g, "");
const a = squash(siteRaw);
const b = squash(mineRaw);

if (a === b) {
  console.log("\n结果：忽略空白后完全一致");
  process.exit(0);
}

// 找第一个不同的位置，并把周围 60 字符打出来，方便定位是尾部包装还是真差异
let i = 0;
while (i < a.length && i < b.length && a[i] === b[i]) i++;
console.log(`\n第一个差异在去空白后的第 ${i} 个字符（站点 ${a.length} / 复刻 ${b.length}）`);
console.log(`站点: ${JSON.stringify(a.slice(Math.max(0, i - 60), i + 60))}`);
console.log(`复刻: ${JSON.stringify(b.slice(Math.max(0, i - 60), i + 60))}`);
process.exitCode = 1;
