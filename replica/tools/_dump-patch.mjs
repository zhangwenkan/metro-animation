import fs from "node:fs";

const lines = fs.readFileSync("ref/source/12-ui-sound.js", "utf8").split(/\r?\n/);
// 站点 patch 对象：第 262 行 "{" 之后到音色表结束
const seg = lines.slice(261, 610);

const keys = [];
seg.forEach((line, i) => {
  const m = line.match(/^ {6}(?:"([^"]+)"|([A-Za-z0-9_-]+)):\s*\{\s*$/);
  if (m) keys.push({ name: m[1] || m[2], at: i });
});

const srcRe = /type:"(\w+)"\s*frequency:\s*(?:\{\s*start:\s*([\d.e-]+)\s*end:\s*([\d.e-]+)\s*\}|([\d.e-]+))/g;

function num(v) {
  return Number(v);
}

function parseLayers(block) {
  const hits = [...block.matchAll(srcRe)];
  const layers = [];
  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i];
    const from = hit.index + hit[0].length;
    const to = i + 1 < hits.length ? hits[i + 1].index : block.length;
    const tail = block.slice(from, to);

    const layer = { type: hit[1] };
    if (hit[4] !== undefined) layer.frequency = num(hit[4]);
    else layer.frequency = { start: num(hit[2]), end: num(hit[3]) };

    const env = tail.match(/attack:\s*([\d.e-]+)\s*decay:\s*([\d.e-]+)\s*sustain:\s*([\d.e-]+)\s*release:\s*([\d.e-]+)/);
    if (env) layer.envelope = { attack: num(env[1]), decay: num(env[2]), sustain: num(env[3]), release: num(env[4]) };

    const delay = tail.match(/delay:\s*([\d.e-]+)/);
    if (delay) layer.delay = num(delay[1]);

    const gains = [...tail.matchAll(/(?<![A-Za-z.])gain:\s*([\d.e-]+)/g)].map((g) => num(g[1]));
    if (gains.length) layer.gain = gains[0];

    layers.push(layer);
  }
  return layers;
}

const out = {};
for (let i = 0; i < keys.length; i++) {
  const block = seg.slice(keys[i].at, i + 1 < keys.length ? keys[i + 1].at : seg.length).join("\n");
  const layers = parseLayers(block);
  const hasLayers = /layers:\[/.test(block);
  if (hasLayers) out[keys[i].name] = { layers };
  else out[keys[i].name] = layers[0];
}

fs.writeFileSync("replica/tools/_patch-site.json", JSON.stringify(out, null, 2));
console.log(Object.keys(out).length, "sounds");
console.log(JSON.stringify(out, null, 2));
