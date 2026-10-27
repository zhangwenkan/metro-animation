import { Box3, Group, Vector3 } from "three/webgpu";

/**
 * 窗外世界（对应 ref/source/04-letterboard-and-backdrop.js 后半段的 ty）
 *
 * 站点把车厢 GLB 里的「天空 / 远山 / 地面 / 道路 / 护栏 / 草地 / 景物」抽出来，
 * 挂到独立的 exterior 场景里，按 60 / 130 两个单位长度首尾相接循环平移，
 * 再由后处理按深度做横向拖尾当作主场景背景。
 * 吊环则按 Grip 编号归组，给每组加一个枢轴做正弦摆动。
 */
export function createExterior(trainScene, exteriorScene) {
  trainScene.updateMatrixWorld(true);

  const nearGroup = new Group();
  const farGroup = new Group();
  exteriorScene.add(nearGroup, farGroup);

  const gripGroups = new Map();

  for (const child of [...trainScene.children]) {
    const name = String(child.userData.sourceName ?? child.name);
    const grip = name.match(/^Grip (\d+) \| (strap|ivory ring)$/);

    if (grip) {
      const list = gripGroups.get(grip[1]) ?? [];
      list.push(child);
      gripGroups.set(grip[1], list);
    } else if (name.startsWith("Sky |")) {
      exteriorScene.attach(child);
    } else if (name.startsWith("Distant ridge")) {
      farGroup.attach(child);
    } else if (/^(Ground |Road |Guardrail |Grass |Backdrop )/.test(name)) {
      nearGroup.attach(child);
    }
  }

  // 分块循环：0 号用原件，其余克隆；镜像层只覆盖 ±2
  const tile = (source, span, mirrored) => {
    const tiles = [];
    const from = mirrored ? -2 : -1;
    const to = mirrored ? 2 : 1;

    for (let index = from; index <= to; index++) {
      const object = index === 0 ? source : source.clone(true);
      if (index !== 0) exteriorScene.add(object);
      if (mirrored && Math.abs(index) % 2 === 1) object.scale.x = -1;
      tiles.push({ object, offset: index * span });
    }

    return (distance) => {
      const shift = distance % (mirrored ? 2 * span : span);
      for (const entry of tiles) entry.object.position.x = entry.offset - shift;
    };
  };

  const scrollNear = tile(nearGroup, 60, false);
  const scrollFar = tile(farGroup, 130, true);

  // 吊环：每组挂到一个位于吊带顶端的枢轴下
  const pivots = [];
  for (const group of gripGroups.values()) {
    const bounds = new Box3();
    for (const grip of group) bounds.union(new Box3().setFromObject(grip));

    const pivot = new Group();
    pivot.position.copy(bounds.getCenter(new Vector3()));
    pivot.position.y = bounds.max.y;
    trainScene.worldToLocal(pivot.position);
    trainScene.add(pivot);
    pivot.updateMatrixWorld(true);

    for (const grip of group) pivot.attach(grip);
    pivots.push(pivot);
  }

  let distance = 0;
  let elapsed = 0;

  return {
    update(dt, speed, handleSway = 1) {
      distance += dt * speed;
      elapsed += dt;

      scrollNear(distance);
      scrollFar(0.22 * distance);

      pivots.forEach((pivot, index) => {
        const amount = (0.9 + 0.1 * Math.sin(0.43 * elapsed)) * handleSway;
        pivot.rotation.z = 0.075 * Math.sin(1.65 * elapsed + 0.32 * index) * amount;
        pivot.rotation.x = 0.035 * Math.sin(1.13 * elapsed + 0.21 * index) * amount;
      });
    },
  };
}
