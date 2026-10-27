/**
 * 在所有站点 chunk 里批量搜关键词，输出文件 + 次数 + 偏移，避免 PowerShell 引号地狱。
 *
 *   node tools/grepchunks.mjs --keys "data-ui-sound],playUiSound,resume("
 *   node tools/grepchunks.mjs --keys "ajo-closed" --dir ../ref/site
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

const dir = path.resolve(args.get("dir") ?? "../ref/site/chunks");
const keys = String(args.get("keys") ?? "").split(",").filter(Boolean);

function walk(current) {
  const out = [];
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(js|css|html)$/.test(entry.name)) out.push(full);
  }
  return out;
}

for (const file of walk(dir)) {
  const text = fs.readFileSync(file, "utf8");
  for (const key of keys) {
    let from = 0;
    const hits = [];
    while (true) {
      const at = text.indexOf(key, from);
      if (at < 0) break;
      hits.push(at);
      from = at + key.length;
    }
    if (hits.length) {
      console.log(`${path.basename(file)}  ${JSON.stringify(key)}  x${hits.length}  @${hits.slice(0, 8).join(",")}`);
    }
  }
}
