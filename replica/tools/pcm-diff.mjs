/**
 * 语音 PCM 指纹对账：两端各跑一遍「进车厢 → 点报纸」，把合成器写进 AudioBuffer 的
 * 样本指纹逐条比。报纸台词是固定的四句（猫的免责声明），所以 buffer 序列两端应该全等；
 * 对话开场的句子是随机的，不适合做对账。
 *
 * 用法：node replica/tools/pcm-diff.mjs
 */
import fs from "node:fs";
import path from "node:path";

// 以脚本自己为基准，从哪个目录跑都一样
const ROOT = path.resolve(import.meta.dirname, "..");

function readPcm(file) {
  const text = fs.readFileSync(path.join(ROOT, "tools", file), "utf8");
  const line = text.split(/\r?\n/).find((row) => row.startsWith("[eval] "));
  if (!line) throw new Error(`${file} 里没有 [eval] 行`);
  return JSON.parse(line.slice("[eval] ".length));
}

const site = readPcm("pcm-site.log");
const mine = readPcm("pcm-mine.log");

const format = ([rate, length, hash, rms]) => `${rate}Hz/${length}样本/${hash}/rms ${rms}`;

let same = 0;
while (same < site.pcm.length && same < mine.pcm.length) {
  if (JSON.stringify(site.pcm[same]) !== JSON.stringify(mine.pcm[same])) break;
  same += 1;
}

console.log(`站点 buffer ${site.pcm.length} 个 / 复刻 ${mine.pcm.length} 个`);
console.log(`公共前缀 ${same} 个 buffer 逐样本指纹一致`);
if (same < site.pcm.length || same < mine.pcm.length) {
  console.log(`  分叉处：站点 ${format(site.pcm[same] ?? [])} / 复刻 ${format(mine.pcm[same] ?? [])}`);
}
for (let i = 0; i < Math.min(same, 3); i++) console.log(`  [${i}] ${format(site.pcm[i])}`);
console.log(`站点最后一句：${site.reply}`);
console.log(`复刻最后一句：${mine.reply}`);
const pass = same === site.pcm.length && same === mine.pcm.length;
console.log(pass ? `\n结果：${same} 个 buffer 逐样本完全一致` : "\n结果：序列未对齐，判失败");
process.exitCode = pass ? 0 : 1;
