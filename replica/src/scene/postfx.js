import {
  AgXToneMapping,
  HalfFloatType,
  LinearFilter,
  NearestFilter,
  NodeUpdateType,
  RenderPipeline,
  SRGBColorSpace,
  Vector2,
} from "three/webgpu";
import {
  float,
  mix,
  pass,
  renderOutput,
  rtt,
  screenSize,
  screenUV,
  uniform,
  vec2,
  vec3,
  vec4,
} from "three/tsl";

/**
 * 复刻后处理链（对应 ref/source/05-postfx.js，站点实参是 pixelated=false 这条分支）
 *
 * 1. 窗外世界单独一个场景，先渲染成 pass，再按深度做水平方向拖尾 → 作为主场景 background
 * 2. 主 pass 用 NearestFilter + 像素栅格量化 UV（低分辨率颗粒感）
 * 3. 4 级降采样 / 9-tap 上采的 bloom 金字塔
 * 4. AgX 色调映射 + vibrance / 暖高光 / 冷暗部 + 暗角
 */
export function createPostFX(renderer, scene, camera, exteriorScene) {
  const pipeline = new RenderPipeline(renderer);

  const blurStrength = uniform(0.65);
  const trainSpeed = uniform(15);

  // ── 窗外：深度驱动的横向拖尾，作为主场景背景 ──
  let exteriorPass = null;
  if (exteriorScene) {
    exteriorPass = pass(exteriorScene, camera, { samples: 0 });

    const output = exteriorPass.getTextureNode("output");
    output.uvNode = screenUV;
    exteriorPass.getTextureNode("depth").uvNode = screenUV;

    const viewZ = exteriorPass.getViewZNode().negate().max(1);
    const offset = vec2(
      float(80)
        .div(viewZ)
        .clamp(0, 8)
        .mul(viewZ.smoothstep(35, 100).oneMinus())
        .mul(blurStrength)
        .mul(trainSpeed.div(15))
        .min(12)
        .div(screenSize.x),
      0,
    );

    scene.backgroundNode = output
      .mul(0.4)
      .add(output.sample(screenUV.add(offset.mul(0.5))).mul(0.2))
      .add(output.sample(screenUV.sub(offset.mul(0.5))).mul(0.2))
      .add(output.sample(screenUV.add(offset)).mul(0.1))
      .add(output.sample(screenUV.sub(offset)).mul(0.1)).rgb;
  }

  // ── 主 pass：最近邻 + 像素量化 ──
  const mainPass = pass(scene, camera, { samples: 0 });
  const mainTex = mainPass.getTextureNode("output");
  mainTex.value.minFilter = NearestFilter;
  mainTex.value.magFilter = NearestFilter;

  const pixelSize = uniform(2);
  const pixelUV = screenUV
    .mul(screenSize)
    .div(pixelSize)
    .floor()
    .mul(pixelSize)
    .add(pixelSize.mul(0.5))
    .div(screenSize);

  // ── bloom 金字塔 ──
  const bloom = createBloom(mainTex);

  // ── 调色 ──
  const vibrance = uniform(0);
  const warmth = uniform(0);
  const coolShadows = uniform(0);
  const amount = uniform(1);

  const toned = renderOutput(
    mainTex.sample(pixelUV).add(vec4(bloom.sample(pixelUV), 0)),
    AgXToneMapping,
    SRGBColorSpace,
  ).toVar();

  const rgb = toned.rgb;
  const luma = rgb.dot(vec3(0.2126, 0.7152, 0.0722));
  const maxRGB = rgb.r.max(rgb.g).max(rgb.b);
  const minRGB = rgb.r.min(rgb.g).min(rgb.b);
  const saturation = maxRGB.sub(minRGB).div(maxRGB.max(0.001));

  const vivid = mix(
    vec3(luma),
    rgb,
    float(1).add(vibrance.mul(saturation.oneMinus())),
  );
  const highlights = luma.smoothstep(0.45, 0.9);
  const shadows = luma.smoothstep(0.1, 0.55).oneMinus();

  const warmTint = vec3(0.08, -0.015, -0.0864).mul(warmth).mul(highlights);
  const coolTint = vec3(-0.035, 0.002, 0.0833).mul(coolShadows).mul(shadows);
  const graded = vivid.add(warmTint).add(coolTint).clamp();

  pipeline.outputColorTransform = false;
  pipeline.outputNode = vec4(mix(rgb, graded, amount).mul(1), toned.a);

  return {
    pixelSize,
    blurStrength,
    trainSpeed,
    vibrance,
    warmth,
    coolShadows,
    amount,
    glow: bloom.strength,
    render() {
      bloom.resize(renderer);
      pipeline.render();
    },
    dispose() {
      scene.backgroundNode = null;
      exteriorPass?.dispose();
      mainPass.dispose();
      bloom.dispose();
      pipeline.dispose();
    },
  };
}

function createBloom(passTexture) {
  const strength = uniform(0.09);
  const base = passTexture.sample(screenUV).rgb;
  const luma = base.dot(vec3(0.2126, 0.7152, 0.0722));

  const targets = [];
  const texel = Array.from({ length: 4 }, () => uniform(new Vector2(1, 1)));

  const renderInto = (node, divisor) => {
    const target = rtt(vec4(node, 1), 1, 1, { type: HalfFloatType });

    target.updateBeforeType = NodeUpdateType.FRAME;
    target.renderTarget.depthBuffer = false;
    target.renderTarget.texture.minFilter = LinearFilter;
    target.renderTarget.texture.magFilter = LinearFilter;
    target.renderTarget.texture.generateMipmaps = false;

    targets.push({ node: target, divisor });
    return target;
  };

  const levels = [renderInto(base.mul(luma.smoothstep(2, 2.1)), 2)];

  for (let level = 1; level < 4; level++) {
    const previous = levels[level - 1];
    const size = texel[level - 1];
    const tap = (x, y) =>
      previous.sample(screenUV.add(vec2(x, y).mul(size))).rgb;

    const sum = tap(0, 0)
      .mul(0.125)
      .add(tap(-1, -1).add(tap(1, -1)).add(tap(-1, 1)).add(tap(1, 1)).mul(0.125))
      .add(tap(-2, 0).add(tap(2, 0)).add(tap(0, -2)).add(tap(0, 2)).mul(0.0625))
      .add(
        tap(-2, -2)
          .add(tap(2, -2))
          .add(tap(-2, 2))
          .add(tap(2, 2))
          .mul(0.03125),
      );

    levels.push(renderInto(sum, 2 ** (level + 1)));
  }

  let upsample = levels[3];
  for (let level = 2; level >= 1; level--) {
    const source = upsample;
    const size = texel[level + 1];
    const tap = (x, y) => source.sample(screenUV.add(vec2(x, y).mul(size))).rgb;

    const sum = tap(0, 0)
      .mul(0.25)
      .add(tap(-1, 0).add(tap(1, 0)).add(tap(0, -1)).add(tap(0, 1)).mul(0.125))
      .add(tap(-1, -1).add(tap(1, -1)).add(tap(-1, 1)).add(tap(1, 1)).mul(0.0625));

    upsample = renderInto(levels[level].sample(screenUV).rgb.add(sum), 2 ** (level + 1));
  }

  let previousWidth = 0;
  let previousHeight = 0;
  const bufferSize = new Vector2();

  return {
    strength,
    sample: (uvNode) => upsample.sample(uvNode).rgb.mul(1.1).mul(strength).clamp(0, 2),
    resize(renderer) {
      renderer.getDrawingBufferSize(bufferSize);
      if (bufferSize.x === previousWidth && bufferSize.y === previousHeight) return;

      previousWidth = bufferSize.x;
      previousHeight = bufferSize.y;

      for (const { node, divisor } of targets) {
        node.setSize(
          Math.max(1, Math.floor(bufferSize.x / divisor)),
          Math.max(1, Math.floor(bufferSize.y / divisor)),
        );
      }
      levels.forEach((node, index) => {
        texel[index].value.set(1 / node.renderTarget.width, 1 / node.renderTarget.height);
      });
    },
    dispose() {
      for (const { node } of targets) {
        node.renderTarget.dispose();
        node._quadMesh.material.dispose();
        node.dispose();
      }
    },
  };
}
