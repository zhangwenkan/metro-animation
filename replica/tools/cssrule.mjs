/**
 * 在站点 CSS 里按字面量定位规则并打印上下文（压缩过的 CSS 一行到底，grep 没法看）。
 *
 *   node tools/cssrule.mjs "space-y-1" [上下文长度默认 220]
 */
import fs from "node:fs";
import path from "node:path";

const needle = process.argv[2] ?? "";
const span = Number(process.argv[3] ?? 220);
const dir = path.resolve("../ref/site/styles");

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".css"))) {
  const css = fs.readFileSync(path.join(dir, file), "utf8");
  let from = 0;
  let hits = 0;
  while (true) {
    const at = css.indexOf(needle, from);
    if (at < 0) break;
    hits++;
    from = at + needle.length;
    const start = Math.max(0, at - span);
    const end = Math.min(css.length, at + needle.length + span);
    console.log(`\n===== ${file} @${at} =====`);
    console.log(css.slice(start, end));
  }
  if (hits) console.log(`\n[${file}] ${hits} hit(s)`);
}
