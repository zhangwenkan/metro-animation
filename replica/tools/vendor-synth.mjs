/**
 * 把站点 chunk 里的共振峰语音合成器（F8 + 音素/共振峰表）原样搬进
 * src/audio/formantSynth.js，只动两处：去掉 three 的模块引用前缀、补一个命名导出。
 * 其余字符一个不改——这块是声音，手抄一有偏差就能听出来。
 *
 *   node tools/vendor-synth.mjs
 */
import fs from "node:fs";
import path from "node:path";

const CHUNK = path.resolve("../ref/site/chunks/1reeeg5qme_uu.js");
const OUT = path.resolve("src/audio/formantSynth.js");

const src = fs.readFileSync(CHUNK, "utf8");
const start = "var Fz=e.i(44841),FG={";
const end = "var F6=e.i(79993)";
const a = src.indexOf(start);
const b = src.indexOf(end);
if (a < 0 || b < 0 || b > 0 && b < a) throw new Error("chunk 结构变了，锚点没找到");

const prefix = "var Fz=e.i(44841),";
const body = src.slice(a + prefix.length, b).trimEnd();

const header = `/**
 * Ajo 的嗓音：站点自带的共振峰语音合成器（对应 ref/source 里 1reeeg5qme_uu.js
 * offset ${a}-${b} 那一段）。用 Web Audio 的 AudioBufferSourceNode 直接播
 * 逐音素合成的样本，不依赖系统 TTS。
 *
 * 变量名保留混淆后的样子：改名既没法验证、又容易在细节上抄错。
 * 唯一的手工改动是把 three 的模块引用前缀去掉（这段代码本来就没用到它）。
 *
 * speak(text, voice) 的 voice 形如 { pitch, formant, intonation, speed, volume, overlap, softness }，
 * 站点用的是 ref/source 里的 Ln 常量。
 */
`;

fs.writeFileSync(OUT, `${header}var ${body}\n\nexport { F8 as createSpeech };\n`, "utf8");
console.log(
  `[vendor-synth] ${path.relative(process.cwd(), OUT)}  ${body.length} chars`,
);
