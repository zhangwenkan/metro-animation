/**
 * 站点 chunk 切片器：混淆后的代码是一整行，普通编辑器打不开，
 * 用这个按“字符串定位 + 前后窗口”取出局部，或者按绝对下标取。
 *
 *   node tools/slice.mjs --find "thoughts:" --before 400 --after 200
 *   node tools/slice.mjs --at 1514902 --span 2000
 *   node tools/slice.mjs --grep "\/assets\/[^\"]+" --limit 40
 *
 * 默认读 ../ref/site/chunks/1reeeg5qme_uu.js，可用 --file 覆盖。
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
  } else {
    args.set(token.slice(2), true);
  }
}

const file = path.resolve(args.get("file") ?? "../ref/site/chunks/1reeeg5qme_uu.js");
const text = fs.readFileSync(file, "utf8");

const find = args.get("find");
const at = args.get("at");
const span = Number(args.get("span") ?? 1200);
const before = Number(args.get("before") ?? 300);
const after = Number(args.get("after") ?? 900);
const grep = args.get("grep");
const limit = Number(args.get("limit") ?? 20);
// --out：把取到的片段写成文件，方便反复阅读同一段混淆代码
const out = args.get("out");

function emit(text) {
  if (out) {
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    fs.writeFileSync(path.resolve(out), text);
    console.log("[slice]", path.resolve(out), text.length);
  } else {
    console.log(text);
  }
}

if (grep) {
  const expression = new RegExp(String(grep), "g");
  const seen = new Set();
  for (const match of text.matchAll(expression)) {
    const value = match[0];
    if (seen.has(value)) continue;
    seen.add(value);
    console.log(`@${match.index}  ${value}`);
    if (seen.size >= limit) break;
  }
  console.log("unique:", seen.size);
} else if (at !== undefined) {
  const start = Number(at);
  emit(text.slice(start, start + span));
} else if (find) {
  let from = 0;
  let count = 0;
  while (count < limit) {
    const index = text.indexOf(String(find), from);
    if (index < 0) break;
    count++;
    const chunk = `--- hit #${count} @${index}\n${text.slice(Math.max(0, index - before), index + after)}`;
    if (out) emit(chunk + "\n");
    else console.log(chunk);
    from = index + String(find).length;
  }
  if (!count) console.log("not found:", find);
} else {
  console.log("length:", text.length);
  console.log(text.slice(0, 2000));
}
