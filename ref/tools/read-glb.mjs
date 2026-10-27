import fs from "fs";

function readGLB(p) {
  const b = fs.readFileSync(p);
  if (b.readUInt32LE(0) !== 0x46546c67) throw new Error("not glb");
  const total = b.readUInt32LE(8);
  let off = 12,
    json = null,
    binLen = 0;
  while (off < total) {
    const len = b.readUInt32LE(off);
    const type = b.readUInt32LE(off + 4);
    if (type === 0x4e4f534a)
      json = JSON.parse(b.slice(off + 8, off + 8 + len).toString("utf8"));
    else binLen = len;
    off += 8 + len + ((4 - (len % 4)) % 4);
  }
  return { json, binLen, fileSize: b.length };
}

for (const f of process.argv.slice(2)) {
  const { json: g, binLen, fileSize } = readGLB(f);
  console.log("=== " + f + " ===");
  console.log("fileSize", fileSize, "binChunk", binLen);
  console.log(
    "generator",
    g.asset && g.asset.generator,
    "| version",
    g.asset && g.asset.version,
  );
  console.log("extensionsUsed", g.extensionsUsed);
  console.log("extensionsRequired", g.extensionsRequired);
  console.log(
    "scenes",
    (g.scenes || []).length,
    "nodes",
    (g.nodes || []).length,
    "meshes",
    (g.meshes || []).length,
    "materials",
    (g.materials || []).length,
    "textures",
    (g.textures || []).length,
    "images",
    (g.images || []).length,
    "animations",
    (g.animations || []).length,
    "skins",
    (g.skins || []).length,
  );
  console.log(
    "animations:",
    (g.animations || []).map((a) => a.name),
  );
  console.log("node names:", (g.nodes || []).map((n) => n.name).join(" | "));
  console.log("materials:", (g.materials || []).map((m) => m.name).join(" | "));
  console.log(
    "images:",
    (g.images || [])
      .map((i) => (i.name || "") + ":" + (i.mimeType || i.uri))
      .join(" | "),
  );
  if (g.extras) console.log("extras", JSON.stringify(g.extras).slice(0, 500));
  const prim = (g.meshes || []).reduce((a, m) => a + m.primitives.length, 0);
  console.log("primitives", prim);
  const attrs = new Set();
  (g.meshes || []).forEach((m) =>
    m.primitives.forEach((p) =>
      Object.keys(p.attributes).forEach((k) => attrs.add(k)),
    ),
  );
  console.log("attributes", [...attrs].join(","));
  console.log("");
}
