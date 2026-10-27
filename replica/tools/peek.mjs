/**
 * 在（已被 beautify 重排过的）源码里按字符串定位，打印一段字符窗口并自动折行。
 * 有些 JSX 链即使重排后仍有上万字符一行，按字符窗口读比按行读更省事。
 *
 *   node tools/peek.mjs --find "onReady" --before 800 --after 2400 --width 110
 *   node tools/peek.mjs --at 1520000 --span 3000
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

const file = path.resolve(args.get("file") ?? "../ref/source/11-main-client.js");
const text = fs.readFileSync(file, "utf8");
const width = Number(args.get("width") ?? 110);
const before = Number(args.get("before") ?? 400);
const after = Number(args.get("after") ?? 1600);
const limit = Number(args.get("limit") ?? 1);

let windows = [];
if (args.get("at") !== undefined) {
  const start = Number(args.get("at"));
  windows.push([start, start + Number(args.get("span") ?? 2000)]);
} else {
  const find = String(args.get("find"));
  let from = 0;
  for (let n = 0; n < limit; n++) {
    const index = text.indexOf(find, from);
    if (index < 0) {
      if (!n) console.log("not found:", find);
      break;
    }
    windows.push([Math.max(0, index - before), index + after]);
    from = index + find.length;
  }
}

for (const [start, end] of windows) {
  const slice = text.slice(start, end);
  const prefix = text.slice(0, start);
  const line = prefix.split("\n").length;
  console.log(`===== @${start} (line ${line}) =====`);
  for (let i = 0; i < slice.length; i += width) {
    console.log(slice.slice(i, i + width));
  }
  console.log("");
}
