import { DirectionalLight, HemisphereLight, RectAreaLight } from "three/webgpu";
import { RectAreaLightTexturesLib } from "three/addons/lights/RectAreaLightTexturesLib.js";
import { RectAreaLightNode } from "three/webgpu";

/**
 * 站点灯光结构（ref/source/01-renderer-and-lights.js）
 * - sun      主方向光，颜色/位置由烘焙数据反算，负责阴影
 * - sky      半球光，给暗部一点天光/地面反光
 * - rect     窗面矩形光（需要 LTC 查找表）
 * - fill     补光（弱，模拟车厢内反弹）
 * - occluder 强度 0 的“只投影不发光”方向光，用于把动态物体的阴影压到烘焙 lightMap 上
 */
export function createLighting(scene) {
  const sunTarget = { x: 0, y: 1, z: -1 };

  const sun = new DirectionalLight("#ffe0aa", 10);
  sun.target.position.set(sunTarget.x, sunTarget.y, sunTarget.z);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -4,
    right: 4,
    top: 4,
    bottom: -4,
    near: 0.1,
    far: 30,
  });
  sun.shadow.normalBias = 0.015;

  const sky = new HemisphereLight("#c2dcff", "#9b7950", 1.25);

  RectAreaLightNode.setLTC(RectAreaLightTexturesLib.init());
  const rect = new RectAreaLight("#ffe6c8", 5, 2.5, 1.2);
  rect.position.set(1.51, 2.37, -2.18);
  rect.lookAt(0, 1, 0);

  const fill = new DirectionalLight("#ffdbb5", 0.65);
  fill.position.set(-1, 0.4, 2);
  fill.target.position.set(0, 1.2, -1);

  const occluder = new DirectionalLight(0xffffff, 0);
  occluder.name = "Baked sun — moving occluders";
  occluder.target.position.set(sunTarget.x, sunTarget.y, sunTarget.z);
  occluder.castShadow = true;
  occluder.shadow.camera.layers.set(1);
  occluder.shadow.mapSize.set(1024, 1024);
  Object.assign(occluder.shadow.camera, {
    left: -2.5,
    right: 2.5,
    top: 2.5,
    bottom: -2.5,
    near: 0.1,
    far: 25,
  });
  occluder.shadow.normalBias = 0.01;
  occluder.shadow.bias = -1e-4;

  scene.add(
    sun,
    sun.target,
    sky,
    rect,
    fill,
    fill.target,
    occluder,
    occluder.target,
  );

  return { sun, sky, rect, fill, occluder };
}

/**
 * 烘焙数据里存的是 Blender 坐标系下的太阳方向，
 * 这里按站点源码的方式换算到 three 的坐标：(-x, -z, y)
 */
export function applyBakedSun(sun, occluder, bake) {
  const [x, y, z] = bake.sunDirectionBlender;
  const dir = { x: -x, y: -z, z: y };
  const len = Math.hypot(dir.x, dir.y, dir.z) || 1;

  for (const light of [sun, occluder]) {
    light.position.set(
      light.target.position.x + (dir.x / len) * 10,
      light.target.position.y + (dir.y / len) * 10,
      light.target.position.z + (dir.z / len) * 10,
    );
  }

  const linear = bake.sunColorLinear;
  if (Array.isArray(linear) && linear.length === 3) {
    // sunColorLinear 已是线性值，用 LinearSRGBColorSpace 避免二次转换
    sun.color.setRGB(linear[0], linear[1], linear[2], "srgb-linear");
  }
}
