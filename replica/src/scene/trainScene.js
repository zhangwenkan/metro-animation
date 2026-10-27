import { AnimationMixer, Color, PerspectiveCamera, Scene } from "three/webgpu";
import { shadow, vec3 } from "three/tsl";
import { applyBakedSun, createLighting } from "./lighting.js";
import { createExterior } from "./exterior.js";
import { createPostFX } from "./postfx.js";
import { createWindowReflector } from "./reflector.js";
import { createCameraRig, createFpsStepper } from "./cameraRig.js";
import { createLetterboard } from "./letterboard.js";
import { createNewspaperRig } from "./newspaperRig.js";
import { createThoughtAnchor } from "./thoughtAnchor.js";
import { createFaceReactions } from "./faceReactions.js";
import { applyTrainMaterials } from "./materials.js";
import { loadAssets } from "./assets.js";
import { createRenderer } from "./renderer.js";
import { params } from "./params.js";

/**
 * 复刻场景入口：WebGPU 渲染器 + 烘焙光照车厢 + 窗外独立场景 + 后处理
 * 对应 ref/source/01、02、04、05、06 五个文件。
 */
export async function createTrainScene(
  container,
  {
    onStatus = () => {},
    audio,
    paperButton = null,
    thoughtBox = null,
    reading = { current: false },
    conversation = { current: false },
  } = {},
) {
  const renderer = createRenderer();
  renderer.toneMappingExposure = params.lighting.exposure;

  const scene = new Scene();
  const exteriorScene = new Scene();
  exteriorScene.background = new Color("#a9c6d6");

  const lights = createLighting(scene);

  onStatus("加载资产 0%");
  const assets = await loadAssets((p) => onStatus(`加载资产 ${Math.round(p * 100)}%`));

  applyBakedSun(lights.sun, lights.occluder, assets.bake);
  lights.sun.intensity = params.lighting.sun;
  lights.sky.intensity = params.lighting.sky;

  for (const target of [scene, exteriorScene]) {
    target.environment = assets.reflection;
    target.environmentIntensity = 0.12;
  }

  const { train, cat } = assets;

  // GLB 里标记为 dynamicPart 的部件是给动画/阴影用的替身，除吊环外默认隐藏
  train.scene.traverse((node) => {
    if (
      node.userData.dynamicPart === true &&
      !String(node.userData.sourceName).startsWith("Grip ")
    ) {
      node.visible = false;
    }
  });

  const catRig = cat.scene.getObjectByName("Cat_V1");
  if (!catRig) throw new Error("Cat_V1 rig missing from character export");

  catRig.scale.setScalar(0.2);
  catRig.position.set(0.2012888789, 0.075, -0.96);
  cat.scene.userData.dynamicPart = true;
  cat.scene.userData.sourceName = "Animated cat";
  train.scene.add(cat.scene);

  const sourceClip = cat.animations.find((a) => a.name === "Cat_Train_Idle_v04");
  if (!sourceClip) throw new Error("Cat_Train_Idle_v04 missing from export");

  const clip = sourceClip.clone();
  const lead = Math.min(...clip.tracks.map((track) => track.times[0]));
  for (const track of clip.tracks) track.shift(-lead);
  clip.resetDuration();

  const mixer = new AnimationMixer(cat.scene);
  mixer.clipAction(clip).play();
  mixer.update(0);

  // 相机直接取自 GLB 里的参考机位
  const camera =
    train.cameras.find((c) => c.name.includes("CAM_reference")) ??
    new PerspectiveCamera(40, 1, 0.05, 200);

  scene.add(train.scene, camera);

  // 窗面平面反射 + 动态遮挡阴影（只投影不发光的方向光）
  const glassMesh = findMainGlass(train.scene);
  const reflectorNode = createWindowReflector(glassMesh, camera, scene);
  const visibility = vec3(shadow(lights.occluder).mul(0.25).add(0.75));

  const { bakedMaterials, faceMaterials } = applyTrainMaterials(train.scene, {
    reflection: assets.reflection,
    lightMap: assets.lightMap,
    smudge: assets.smudge,
    faceAtlas: assets.faceAtlas,
    lights,
    bake: assets.bake,
    reflector: reflectorNode,
    visibility,
  });

  // 材质改完之后再把窗外几何抽到独立场景
  const exterior = createExterior(train.scene, exteriorScene);

  const letterboard = createLetterboard();
  scene.add(letterboard.root);

  const hotspot = createNewspaperRig(container, train.scene, camera, { button: paperButton });
  const thoughtAnchor = createThoughtAnchor(container, cat.scene, camera, thoughtBox);
  const faceReactions = createFaceReactions(faceMaterials);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  onStatus("编译着色器…");
  await renderer.init();
  container.appendChild(renderer.domElement);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    if (camera.isPerspectiveCamera) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  };
  resize();

  const observer = new ResizeObserver(resize);
  observer.observe(container);

  const postfx = createPostFX(renderer, scene, camera, exteriorScene);
  applyPostFXParams(postfx);

  const rig = createCameraRig(camera, cat.scene);
  const stepCat = createFpsStepper();

  if (import.meta.env.DEV) globalThis.__faces = faceMaterials;

  container.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const rect = container.getBoundingClientRect();
    rig.setHover(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      1 - ((event.clientY - rect.top) / rect.height) * 2,
    );
  });
  const resetHover = () => rig.setHover(0, 0);
  container.addEventListener("pointerleave", resetHover);
  window.addEventListener("blur", resetHover);

  await renderer.compileAsync(scene, camera);
  await renderer.compileAsync(exteriorScene, camera);

  const clock = { last: performance.now() };
  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const dt = Math.min((now - clock.last) / 1000, 0.1);
    clock.last = now;

    // 站点顺序：先推音频（含字幕），再看页面是否隐藏
    audio?.update(params.motion.playing);
    if (document.hidden) return;

    if (params.motion.playing) {
      // 猫的骨骼只按 catFps 步进（定格动画的顿挫感）
      const step = stepCat(dt, params.motion.catFps);
      if (step > 0) mixer.update(step);
      exterior.update(dt, params.motion.speed, params.motion.handleSway);
    }

    // 表情状态机顺带推进每一张脸自己的眨眼
    faceReactions.update(dt);
    letterboard.update(dt);

    rig.update(dt, {
      speed: params.motion.speed,
      playing: params.motion.playing,
      shake: params.motion.cameraShake * (1 - 0.65 * rig.amount),
      pan: params.motion.cameraPan * (1 - 0.8 * rig.amount),
      // 站点 tp.update(t, f.current, ...) 里的 f 就是 conversationActive：
      // Ajo 开始回话时置真，报纸拾取时被按回 false。这一层负责把机位往猫头推 18%。
      idle: conversation.current,
      onBump: () => audio?.bump(),
    });

    // 站点顺序：视差/抖动层叠完之后，报纸机位再盖上去（td 是最后一层）
    thoughtAnchor?.update(dt);
    hotspot.update(reading.current, dt, reducedMotion.matches);

    postfx.render();
  });

  onStatus(
    `就绪 · 烘焙材质 ${bakedMaterials.length} · 表情材质 ${faceMaterials.length}`,
  );

  return {
    renderer,
    scene,
    exteriorScene,
    camera,
    mixer,
    postfx,
    exterior,
    faces: faceReactions,
    dispose() {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      window.removeEventListener("blur", resetHover);
      letterboard.dispose();
      hotspot.dispose();
      postfx.dispose();
      renderer.domElement.remove();
      renderer.dispose();
    },
  };
}

function findMainGlass(root) {
  let main = null;
  root.traverse((obj) => {
    if (obj.name.includes("Glass") && obj.name.includes("main")) main = obj;
  });
  if (!main) throw new Error("Main window missing from scene export");
  return main;
}

function applyPostFXParams(postfx) {
  const grade = params.colorGrade;
  const motion = params.motion;

  postfx.amount.value = grade.enabled ? 1 : 0;
  postfx.vibrance.value = grade.vibrance;
  postfx.warmth.value = grade.warmHighlights;
  postfx.coolShadows.value = grade.coolShadows;
  postfx.pixelSize.value = grade.pixelSize;
  postfx.glow.value = grade.sunGlow;
  postfx.blurStrength.value = motion.exteriorBlur;
  postfx.trainSpeed.value = motion.playing ? motion.speed : 0;
}
