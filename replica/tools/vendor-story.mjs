/**
 * 把站点 chunk 里那块「剧情数据」模块（79993：Ajo 的想法 / 对话节点图）
 * 原样搬到 src/narrative/story.json。
 *
 * 它是个纯数据对象字面量（键没加引号、用 !0 表示 true），所以这里做一次
 * 括号配平扫描后交给 new Function 求值，再 JSON.stringify 落盘：
 * 只格式化，不改一个字，方便后面直接对着改剧情。
 *
 *   node tools/vendor-story.mjs
 */
import fs from "node:fs";
import path from "node:path";

const CHUNK = path.resolve("../ref/site/chunks/1reeeg5qme_uu.js");
const OUT = path.resolve("src/narrative/story.json");

const src = fs.readFileSync(CHUNK, "utf8");
const anchor = ",79993,(e,t,i)=>{t.exports=";
const at = src.indexOf(anchor);
if (at < 0) throw new Error("chunk 结构变了，找不到剧情数据模块");

const start = at + anchor.length;

// 括号配平：只认 {}[]，字符串里的括号不算
function scan(from) {
  let depth = 0;
  let quote = "";
  for (let i = from; i < src.length; i++) {
    const ch = src[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "{" || ch === "[") depth++;
    else if (ch === "}" || ch === "]") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  throw new Error("剧情数据没配平，切片失败");
}

const literal = src.slice(start, scan(start));
const story = new Function(`return (${literal})`)();

if (story.version !== 1 || !Array.isArray(story.thoughts) || !Array.isArray(story.nodes)) {
  throw new Error("解析出来的剧情数据结构不对，别用");
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(story, null, 2)}\n`, "utf8");
console.log(
  `[vendor-story] ${path.relative(process.cwd(), OUT)}  ` +
    `thoughts=${story.thoughts.length} nodes=${story.nodes.length}`,
);