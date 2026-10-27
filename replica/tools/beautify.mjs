/**
 * 把混淆成单行的站点 chunk 重新断行，方便阅读。
 * 只做“语句级”排版：在 ; { } 处换行并按花括号缩进，字符串/模板串/正则原样保留，
 * 不追求格式化正确性——目的是能在编辑器里看懂结构，不是产出可提交代码。
 *
 *   node tools/beautify.mjs --file ../ref/site/chunks/1hywx2bplomjl.js --out ../ref/source/10-shell-ui.js
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

const file = path.resolve(args.get("file") ?? "../ref/site/chunks/1hywx2bplomjl.js");
const out = args.get("out");
const source = fs.readFileSync(file, "utf8");

/** 上一个“有意义的”字符，用来判断 / 是除号还是正则开头 */
function regexAllowed(prev) {
  if (!prev) return true;
  return "(,=:[!&|?{};+-*%~^<>".includes(prev);
}

// 超过这个长度的行在逗号处硬折行，否则长对象字面量会变成几万字符一行
const wrap = Number(args.get("wrap") ?? 150);

let depth = 0;
let line = "";
const lines = [];
const templates = []; // 模板串中 ${ 的花括号深度栈

function push(char) {
  line += char;
}
function flush() {
  const trimmed = line.replace(/\s+$/, "");
  if (trimmed.trim()) lines.push("  ".repeat(Math.max(0, depth)) + trimmed.trimStart());
  line = "";
}
/** 行太长时在逗号/括号处折行；只在字符串外的标点上调用，所以不会切坏字面量 */
function softBreak(char, extraIndent = 1) {
  if (line.length <= wrap) return;
  push(char);
  const trimmed = line.replace(/\s+$/, "");
  if (trimmed.trim()) lines.push("  ".repeat(Math.max(0, depth)) + trimmed.trimStart());
  line = "  ".repeat(Math.max(0, depth + extraIndent));
}

let prev = "";
for (let i = 0; i < source.length; i++) {
  const char = source[i];

  // 注释
  if (char === "/" && source[i + 1] === "/") {
    const end = source.indexOf("\n", i);
    const stop = end < 0 ? source.length : end;
    push(source.slice(i, stop));
    i = stop - 1;
    continue;
  }
  if (char === "/" && source[i + 1] === "*") {
    const end = source.indexOf("*/", i + 2);
    const stop = end < 0 ? source.length : end + 2;
    push(source.slice(i, stop));
    i = stop - 1;
    continue;
  }

  // 字符串
  if (char === '"' || char === "'") {
    let j = i + 1;
    while (j < source.length) {
      if (source[j] === "\\") {
        j += 2;
        continue;
      }
      if (source[j] === char) break;
      j++;
    }
    push(source.slice(i, j + 1));
    i = j;
    prev = char;
    continue;
  }

  // 模板串：整段保留，${…} 里继续按普通代码排版
  if (char === "`") {
    let j = i + 1;
    let literal = "";
    while (j < source.length) {
      if (source[j] === "\\") {
        literal += source.slice(j, j + 2);
        j += 2;
        continue;
      }
      if (source[j] === "`") break;
      if (source[j] === "$" && source[j + 1] === "{") {
        literal += "${";
        j += 2;
        templates.push(depth);
        depth++;
        push(literal);
        literal = "";
        break;
      }
      literal += source[j];
      j++;
    }
    if (literal) push(literal);
    if (source[j] === "`") {
      push("`");
      i = j;
      prev = "`";
      continue;
    }
    // 进入了 ${…}
    i = j - 1;
    prev = "{";
    continue;
  }

  // 正则
  if (char === "/" && regexAllowed(prev)) {
    let j = i + 1;
    let inClass = false;
    while (j < source.length) {
      const c = source[j];
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
    while (j < source.length && /[gimsuyd]/.test(source[j])) j++;
    push(source.slice(i, j));
    i = j - 1;
    prev = "/";
    continue;
  }

  if (char === "{") {
    push(char);
    flush();
    depth++;
    prev = char;
    continue;
  }

  if (char === "}") {
    // 从模板串 ${…} 退出
    if (templates.length && templates[templates.length - 1] === depth - 1) {
      templates.pop();
      depth--;
      push("}");
      prev = "}";
      continue;
    }
    flush();
    depth = Math.max(0, depth - 1);
    line = "  ".repeat(depth) + "}";
    flush();
    prev = char;
    continue;
  }

  if (char === ";") {
    push(char);
    flush();
    prev = char;
    continue;
  }

  if (char === "," || char === ")") {
    softBreak(char);
    prev = char;
    continue;
  }

  if (char === "(") {
    softBreak(char, 1);
    prev = char;
    continue;
  }

  if (char === "\n") {
    push(" ");
    continue;
  }

  push(char);
  if (char !== " " && char !== "\t") prev = char;
}
flush();

const result = lines.join("\n") + "\n";
if (out) {
  const target = path.resolve(out);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, result);
  console.log("[beautify]", target, result.split("\n").length, "lines");
} else {
  console.log(result);
}
