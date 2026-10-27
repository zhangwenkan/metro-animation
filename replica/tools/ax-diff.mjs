/**
 * 无障碍树 A/B：比对两端导出的 AX 快照（shot.mjs --ax-out）。
 *
 *   node tools/ax-diff.mjs --a tools/ax-site-entry.json --b tools/ax-mine-entry.json --require-names
 *   node tools/ax-diff.mjs --a tools/ax-site-conv.json  --b tools/ax-mine-conv.json
 *
 * 分两档看：
 *   结构 = 角色 + 状态（expanded/checked/live/level…）+ 树里出现的先后顺序，必须逐节点相同；
 *   文案 = 节点名字。想法气泡、对话选项、回复台词本来就是随机的，两边必然不同，
 *          所以默认只做「双方都有名字 / 双方都没名字」的一致性检查，
 *          确定性的状态（入口页、About、报纸）加 --require-names 连名字一起比。
 *
 * 站点是 Next.js，body 里多一个 <next-route-announcer>（内含空 role=alert）：
 * 它只用来播报客户端路由切换，本站没有路由、永远是空节点，默认连同包装一起剔除。
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

const read = (file) => JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
const site = read(String(args.get("a")));
const mine = read(String(args.get("b")));

const ATTR_KEYS = ["checked", "expanded", "selected", "disabled", "required", "level", "live", "pressed", "valuetext", "modal"];

const skipFramework = !args.has("keep-framework");

function dropRouteAnnouncer(rows) {
  const drop = new Set();
  rows.forEach((row, index) => {
    if (row.role !== "alert" || row.name) return;
    drop.add(index);
    for (let back = index - 1; back >= 0; back--) {
      if (rows[back].depth >= row.depth) continue;
      if (rows[back].role === "generic" && !rows[back].name) drop.add(back);
      break;
    }
  });
  return rows.filter((_, index) => !drop.has(index));
}

const shape = (row) => {
  const attrs = ATTR_KEYS.filter((key) => row[key] !== undefined)
    .map((key) => `${key}=${row[key]}`)
    .join(",");
  return { key: `${row.role}|${attrs}`, label: `${"  ".repeat(row.depth)}${row.role}${row.name ? ` "${row.name}"` : ""}${attrs ? ` [${attrs}]` : ""}` };
};

const rawSite = skipFramework ? dropRouteAnnouncer(site) : site;
const rawMine = skipFramework ? dropRouteAnnouncer(mine) : mine;
const prepare = (rows) => rows.map(shape);
const a = prepare(rawSite);
const b = prepare(rawMine);

// 最长公共子序列：能同时给出「多了什么」和「少了什么」，而不是从头错到尾
const lcs = (() => {
  const n = a.length;
  const m = b.length;
  const table = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i][j] = a[i].key === b[j].key ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const pairs = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i].key === b[j].key) {
      pairs.push([i, j]);
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) i++;
    else j++;
  }
  return pairs;
})();

const matchedA = new Set(lcs.map(([i]) => i));
const matchedB = new Set(lcs.map(([, j]) => j));
const onlySite = a.filter((_, i) => !matchedA.has(i));
const onlyMine = b.filter((_, j) => !matchedB.has(j));

console.log(`结构：站点 ${a.length} 节点 / 复刻 ${b.length} 节点 / 对上 ${lcs.length} 个`);
for (const row of onlySite) console.log(`  仅站点：${row.label}`);
for (const row of onlyMine) console.log(`  仅复刻：${row.label}`);

// 名字只在两边都存在的节点上比；随机文案造成的差异单列，不参与结构判定
const nameDiffs = [];
for (const [i, j] of lcs) {
  const left = rawSite[i].name ?? "";
  const right = rawMine[j].name ?? "";
  if (left !== right) nameDiffs.push([a[i], b[j]]);
}

const structureOk = onlySite.length === 0 && onlyMine.length === 0;
if (nameDiffs.length) {
  console.log(`\n文案：${nameDiffs.length} 处不同（想法气泡 / 对话选项 / 回复台词是随机轮换的）`);
  for (const [left, right] of nameDiffs.slice(0, 12)) {
    console.log(`  站点 ${left.label}\n  复刻 ${right.label}`);
  }
  if (nameDiffs.length > 12) console.log(`  …… 其余 ${nameDiffs.length - 12} 处省略`);
}

const requireNames = args.has("require-names");
if (structureOk && (!requireNames || nameDiffs.length === 0)) {
  console.log(`\n结果：无障碍树结构逐节点完全一致${requireNames ? "，文案也完全一致" : ""}`);
} else {
  console.log(`\n结果：${onlySite.length + onlyMine.length} 处结构差异`);
  process.exitCode = 1;
}
