import {
  Color,
  EnvironmentNode,
  IrradianceNode,
  MeshStandardMaterial,
  MeshStandardNodeMaterial,
  RepeatWrapping,
  Vector2,
} from "three/webgpu";
import {
  color,
  float,
  lights,
  materialLightMap,
  mix,
  normalView,
  normalWorld,
  positionViewDirection,
  positionWorld,
  texture,
  triplanarTexture,
  uniform,
  uv,
  vec2,
  vec3,
} from "three/tsl";
import { params } from "./params.js";

/** 只保留 IBL 的镜面反射，不让环境光再参与漫反射（对应 ref/source/02 的 FD） */
class NoIblEnvironment extends EnvironmentNode {
  setup(builder) {
    super.setup(builder);
    builder.context.iblIrradiance.assign(0);
  }
}

/**
 * 烘焙材质：不再接受实时灯光，环境只给反射；
 * 动态物体的阴影在 lightMap 里乘掉，再当作辐照度喂给标准光照模型（对应 ref/source/02 的 FV）。
 */
class BakedMaterial extends MeshStandardNodeMaterial {
  constructor(visibility) {
    super();
    this.visibility = visibility;
  }

  setupEnvironment(builder) {
    const environment = super.setupEnvironment(builder);
    return environment ? new NoIblEnvironment(environment.envNode) : null;
  }

  setupLightMap() {
    return new IrradianceNode(materialLightMap.mul(this.visibility));
  }
}

/**
 * 场景遍历改材质（对应 ref/source/02-load-and-material-patch.js）
 *
 * 站点的核心思路：
 * 1. 静态车厢：丢掉灯光、只吃烘焙 lightMap（lightsNode 传空数组），避免双重照明；
 * 2. 动态件（猫、吊环）：走实时灯光，并把阴影投给“只投影不发光”的方向光；
 * 3. 玻璃：半透明 + 脏污贴图 + 窗面平面反射（反射在 postfx 阶段接入）。
 */
export function applyTrainMaterials(root, ctx) {
  const { reflection, lightMap, faceAtlas, lights: lightRig, reflector, visibility } = ctx;

  const bakedLights = lights([]);
  const worldLights = lights([lightRig.sun, lightRig.sky]);
  const shadowedLights = lights([
    lightRig.sun,
    lightRig.sky,
    lightRig.rect,
    lightRig.fill,
  ]);
  // 站点里 `k.current` 在资产加载完之后才赋值，而同步 uniform 的 effect 在挂载时就跑过了，
  // 所以 DialKit 里的 0.2 从未生效，实际渲染一直用初始值 1。
  const weave = uniform(1);

  const bakedMaterials = [];
  const faceMaterials = [];

  root.traverse((obj) => {
    if (obj.isLight) {
      obj.visible = false;
      return;
    }
    if (!obj.isMesh) return;

    if (obj.isSkinnedMesh) obj.frustumCulled = false;

    let bakedIndirect = false;
    let dynamicPart = false;
    // 吊环虽然挂在动态组下，但站点让它们走普通光照（不参与烘焙阴影的乘算）
    let animated = false;
    for (let node = obj; node; node = node.parent) {
      if (node.userData.bakedIndirect === true) bakedIndirect = true;
      if (node.userData.dynamicPart === true) {
        dynamicPart = true;
        if (!String(node.userData.sourceName).startsWith("Grip ")) animated = true;
      }
    }
    if (dynamicPart) obj.layers.enable(1);

    obj.castShadow = !obj.name.includes("Sky");
    obj.receiveShadow = true;

    if (obj.name.includes("Glass")) {
      obj.material = createGlassMaterial(
        reflection,
        ctx.smudge,
        worldLights,
        reflector,
      );
      obj.castShadow = false;
      return;
    }

    if (obj.userData.sourceName !== "The Wrong Site | banner paper") {
      obj.layers.enable(2);
    }

    const source = Array.isArray(obj.material) ? obj.material : [obj.material];
    const patched = source.map((old) => {
      if (!(old instanceof MeshStandardMaterial)) return old;

      const material = bakedIndirect
        ? new BakedMaterial(visibility)
        : new MeshStandardNodeMaterial();
      MeshStandardMaterial.prototype.copy.call(material, old);

      material.lightsNode = animated ? shadowedLights : worldLights;

      if (old.map) {
        if (old.name.startsWith("Seating")) {
          // 座椅布料：三向投影采样，用 weave 控制编织纹理的密度
          old.map.wrapS = old.map.wrapT = RepeatWrapping;
          old.map.needsUpdate = true;
          material.colorNode = triplanarTexture(
            texture(old.map),
            null,
            null,
            weave.mul(3),
            positionWorld,
            normalWorld,
          ).mul(color(old.color));
        } else {
          material.colorNode = texture(old.map).mul(color(old.color));
        }
      }

      // 远山：往雾蓝色压，序号 1 的那块压得更重
      if (old.name.startsWith("Backdrop | hill") && old.map) {
        const amount = old.name.endsWith("1") ? 0.62 : 0.25;
        material.colorNode = mix(
          texture(old.map).rgb,
          vec3(0.38, 0.49, 0.48),
          amount,
        );
      }

      if (bakedIndirect || animated || old.metalness > 0.6) {
        material.envMap = reflection;
        material.envMapIntensity = animated ? 0.3 : 0.65;
      }

      if (bakedIndirect) {
        material.lightsNode = bakedLights;
        material.emissive.set(0);
        material.emissiveMap = null;
        material.emissiveIntensity = 0;
        material.lightMap = lightMap;
        material.lightMapIntensity = 2.65;
        bakedMaterials.push(material);
      }

      if (animated && old.name.includes("FACE_ATLAS")) {
        applyFaceAtlas(material, faceAtlas, faceMaterials);
        material.depthWrite = false;
        material.polygonOffset = true;
        material.polygonOffsetFactor = -1;
        obj.castShadow = false;
      }

      return material;
    });

    obj.material = patched.length === 1 ? patched[0] : patched;
  });

  return { bakedMaterials, faceMaterials };
}

function createGlassMaterial(reflection, smudge, worldLights, reflectorNode) {
  const material = new MeshStandardNodeMaterial({
    color: "#b8cec5",
    transparent: true,
    depthWrite: false,
    roughness: 0.15,
    metalness: 0.15,
    side: 2,
  });

  const dirt = texture(smudge).r.div(0.25).clamp();
  const fresnel = float(1)
    .sub(normalView.dot(positionViewDirection).abs())
    .pow(5);

  material.lightsNode = worldLights;
  material.envMap = reflection;
  material.envMapIntensity = 0;
  if (reflectorNode) material.emissiveNode = reflectorNode.rgb.mul(1.5);
  material.opacityNode = float(0.03)
    .add(dirt.mul(0.49))
    .add(fresnel.mul(0.25))
    .clamp(0, 0.85);
  material.roughnessNode = dirt.mul(0.65).add(0.1);

  return material;
}

/**
 * 猫脸表情图集：4 列 × 4 行的网格，实际只用前两行共 8 个表情，下面两行留白。
 *
 * 图集是**白底黑线**，所以站点不直接贴图：
 * 颜色固定压成近黑（0x080808），alpha 取反相的红通道，白底镂空、只留笔画。
 * 眨眼不换表情：同一格的 uv.y 落在 0.48~0.62 眼带时，混入 +2 列 / +1 行的闭眼格。
 */
function applyFaceAtlas(material, atlas, out) {
  if (!atlas) throw new Error("Missing cat expression atlas");

  const rows = 4;
  const offset = uniform(new Vector2(0, 0));
  const blink = uniform(0);
  const eyeBand = uniform(0.48);
  let staticExpression = false;

  const base = uv().clamp(0.001, 0.999);
  const cellUV = base.mul(vec2(1 / 4, 1 / rows));
  const open = texture(atlas, cellUV.add(offset));
  const closed = texture(atlas, cellUV.add(vec2(0.5, 1 / rows)));

  const inEyeBand = base.y.greaterThan(eyeBand).and(base.y.lessThan(0.62));
  const face = mix(open, closed, inEyeBand.select(blink, 0));

  material.colorNode = uniform(new Color(0x080808));
  material.opacityNode = face.r.oneMinus();
  material.transparent = true;

  const autoBlink = createAutoBlink();

  out.push({
    material,
    setExpression(expression) {
      let index = EXPRESSIONS.indexOf(expression);
      if (expression === "Happy") index = 7;
      if (expression === "Laughing") index = 1;
      if (index < 0) return;

      offset.value.set((index % 4) / 4, Math.floor(index / 4) / rows);
      // 笑眼和闭眼本身就是定格状态，再眨眼会闪
      staticExpression = ["Happy", "Laughing", "Closed eyes"].includes(expression);
      blink.value = staticExpression ? 0 : Number(autoBlink.closed);
      eyeBand.value = index >= 3 && index <= 5 ? 0.535 : 0.48;
    },
    setAutoBlink: autoBlink.setEnabled,
    blink: autoBlink.blink,
    // 调试用只读快照（tools 里的探针会读它）
    snapshot: () => ({ blink: blink.value, eyeBand: eyeBand.value, offset: offset.value.toArray() }),
    update(dt) {
      blink.value = Number(autoBlink.update(dt)) * Number(!staticExpression);
    },
  });

  return material;
}

/** 自动眨眼（2.5~6 秒一次，0.07 秒闭合，偶尔连眨两下） */
function createAutoBlink(random = Math.random) {
  let enabled = true;
  let closed = false;
  let doubleBlink = false;
  let timer = 2.5 + 3.5 * random();

  return {
    get closed() {
      return closed;
    },
    setEnabled(value) {
      enabled = value;
      closed = false;
      doubleBlink = false;
      timer = 2.5 + 3.5 * random();
    },
    blink() {
      closed = true;
      doubleBlink = false;
      timer = 0.07;
    },
    update(dt) {
      timer -= Math.max(0, dt);
      while (timer <= 0) {
        if (closed) {
          closed = false;
          doubleBlink = enabled && !doubleBlink && random() < 0.25;
          timer += doubleBlink ? 0.13 : 2.5 + 3.5 * random();
        } else if (enabled) {
          closed = true;
          timer += 0.07;
        } else {
          timer = 2.5;
        }
      }
      return closed;
    },
  };
}

const EXPRESSIONS = [
  "Neutral",
  "Happy",
  "Surprised",
  "Annoyed",
  "Skeptical",
  "Tired",
  "Closed eyes",
  "Laughing",
];
