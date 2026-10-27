/**
 * UI 音色包参数级 A/B：把 replica 的 PATCH 和从站点源码里解析出来的 _patch-site.json
 * 逐音色、逐字段对比。任何一个数字不对都算失败。
 *
 * 用法：node replica/tools/audio-patch-diff.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { PATCH } from "../src/audio/uiSounds.js";

// 以脚本自己为基准，从哪个目录跑都一样
const ROOT = path.resolve(import.meta.dirname, "..");
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "tools/_patch-site.json"), "utf8"));

/** 单层音色是扁平对象，多层是 { layers: [...] }，统一成 layers 数组 */
const normalize = (entry) => (Array.isArray(entry.layers) ? entry.layers : [entry]);

const fields = ["type", "frequency", "envelope", "delay", "gain"];

function flatten(layer) {
  // 复刻侧写成 { source: { type, frequency }, ... }，站点侧是扁平的，先把 source 解包
  const source = layer.source ?? layer;
  const out = { type: source.type, frequency: source.frequency };
  for (const key of ["envelope", "delay", "gain"]) {
    if (layer[key] === undefined) continue;
    out[key] = key === "envelope" ? { ...layer[key] } : layer[key];
  }
  return out;
}

const siteNames = Object.keys(site).sort();
const mineNames = Object.keys(PATCH.sounds).sort();

const problems = [];
const missing = siteNames.filter((name) => !mineNames.includes(name));
const extra = mineNames.filter((name) => !siteNames.includes(name));
if (missing.length) problems.push(`缺少音色：${missing.join(", ")}`);
if (extra.length) problems.push(`多出音色：${extra.join(", ")}`);

let compared = 0;
let layers = 0;
for (const name of siteNames) {
  if (!mineNames.includes(name)) continue;
  const a = normalize(site[name]).map(flatten);
  const b = normalize(PATCH.sounds[name]).map(flatten);
  if (a.length !== b.length) {
    problems.push(`${name}: 层数 ${b.length} != ${a.length}`);
    continue;
  }
  for (let i = 0; i < a.length; i++) {
    for (const key of fields) {
      const va = JSON.stringify(a[i][key]);
      const vb = JSON.stringify(b[i][key]);
      if (va !== vb) problems.push(`${name}[${i}].${key}: ${vb} != ${va}`);
      compared += 1;
    }
    layers += 1;
  }
}

console.log(`音色数：站点 ${siteNames.length} / 复刻 ${mineNames.length}`);
console.log(`比对：${layers} 层 / ${compared} 个字段（缺省字段按 undefined 计入）`);
if (problems.length) {
  console.log(`\n不一致 ${problems.length} 处：`);
  for (const line of problems) console.log(`  - ${line}`);
  process.exitCode = 1;
} else {
  console.log("\n结果：全部一致");
}
