/**
 * 压缩代码「摊开」工具：只插入换行，绝不删字符，用来读 chunk 里那些
 * 一行上万字符的实现（Lt 对话控制器、Train 组件之类）。
 *
 * 之前 tools/beautify.mjs 会把括号吃掉，读出来的优先级是错的，
 * 所以这里换成「扫描字符串/正则/注释 + 在 ; { } 后面换行」的保守做法：
 * 输出里去掉空白必须和输入完全一致，不一致就直接报错。
 *
 *   node tools/unmin.mjs --file ../ref/site/chunks/1reeeg5qme_uu.js \
 *     --find "var F6=e.i(79993)" --span 12000 --out ../ref/source/15-narrative.js
 */
import fs from "node:fs";
import path from "node:path";

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const token = process.argv[i];
  if (!token.startsWith("--")) continue;
  const next = process.argv[i + 1];
  if (next && !next.startsWith("--")) {
    args.set(token.slice(2), next);
    i++;
  } else args.set(token.slice(2), true);
}

const file = path.resolve(args.get("file") ?? "../ref/site/chunks/1reeeg5qme_uu.js");
const source = fs.readFileSync(file, "utf8");

let start = args.get("at") !== undefined ? Number(args.get("at")) : -1;
if (start < 0) {
  const find = String(args.get("find") ?? "");
  start = source.indexOf(find);
  if (start < 0) throw new Error(`找不到锚点: ${find}`);
}
const span = Number(args.get("span") ?? 4000);
const raw = source.slice(start, start + span);

// 前一个有效字符决定 `/` 是除号还是正则字面量的开头
const REGEX_PREFIX = new Set([..."(,=:[!&|?{};+-*%~^<>"]);

function pretty(src) {
  let out = "";
  let depth = 0;
  let i = 0;
  let prevMeaningful = "";

  const write = (text) => {
    out += text;
  };
  const newline = () => {
    out = out.replace(/[ \t]+$/, "");
    write("\n" + "  ".repeat(Math.max(0, depth)));
  };

  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];

    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === "\\") {
          j += 2;
          continue;
        }
        if (src[j] === quote) break;
        j++;
      }
      write(src.slice(i, j + 1));
      prevMeaningful = quote;
      i = j + 1;
      continue;
    }

    if (ch === "/" && next === "/") {
      const end = src.indexOf("\n", i);
      const stop = end < 0 ? src.length : end;
      write(src.slice(i, stop));
      i = stop;
      continue;
    }

    if (ch === "/" && next === "*") {
      const end = src.indexOf("*/", i);
      const stop = end < 0 ? src.length : end + 2;
      write(src.slice(i, stop));
      i = stop;
      continue;
    }

    if (ch === "/" && (prevMeaningful === "" || REGEX_PREFIX.has(prevMeaningful))) {
      let j = i + 1;
      let inClass = false;
      while (j < src.length) {
        const c = src[j];
        if (c === "\\") {
          j += 2;
          continue;
        }
        if (c === "[") inClass = true;
        else if (c === "]") inClass = false;
        else if (c === "/" && !inClass) break;
        else if (c === "\n") break;
        j++;
      }
      j++;
      while (j < src.length && /[a-z]/.test(src[j])) j++;
      write(src.slice(i, j));
      prevMeaningful = "/";
      i = j;
      continue;
    }

    if (ch === "{") {
      depth++;
      write(ch);
      newline();
      prevMeaningful = ch;
      i++;
      continue;
    }

    if (ch === "}") {
      depth--;
      // `}` 前面如果是 `{`，说明是空对象，别再折一行
      if (!out.endsWith("{")) newline();
      write(ch);
      prevMeaningful = ch;
      i++;
      continue;
    }

    if (ch === ";") {
      write(ch);
      newline();
      prevMeaningful = ch;
      i++;
      continue;
    }

    write(ch);
    if (!/\s/.test(ch)) prevMeaningful = ch;
    i++;
  }

  return out;
}

const text = pretty(raw);
const strip = (value) => value.replace(/\s+/g, "");
if (strip(text) !== strip(raw)) {
  throw new Error("展开过程丢字符了，别用这份输出");
}

const out = path.resolve(args.get("out") ?? "_unmin.txt");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, text, "utf8");
console.log(`[unmin] @${start}  ${raw.length} chars -> ${out}`);
