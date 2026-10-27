import { NoColorSpace, TextureLoader } from "three/webgpu";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const TRAIN_GLB = "/assets/train/train-v06-optimized.glb";
const CAT_GLB = "/assets/cat/cat-locomotion-v06-mexico66.glb";
const LIGHTMAP = "/assets/train/lighting/carriage-sunboost-v06.exr";
const REFLECTION = "/assets/train/lighting/carriage-reflection-v06.exr";
const SMUDGE = "/assets/train/lighting/glass-smudge.webp";
const BAKE = "/assets/train/lighting/bake-v06.json";
const FACE_ATLAS = "/assets/cat/expressions-rounded.webp";

/** 一次性把场景需要的 7 项资产全部拉下来（对应 ref/source/02 的 Promise.all） */
export async function loadAssets(onProgress = () => {}) {
  const draco = new DRACOLoader().setDecoderPath("/draco/gltf/");
  const gltf = new GLTFLoader().setDRACOLoader(draco);
  const exr = new EXRLoader();
  const tex = new TextureLoader();

  const steps = [
    () => gltf.loadAsync(TRAIN_GLB),
    () => exr.loadAsync(LIGHTMAP),
    () => exr.loadAsync(REFLECTION),
    () => tex.loadAsync(SMUDGE),
    () => fetch(BAKE).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.statusText)))),
    () => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(CAT_GLB),
    () => tex.loadAsync(FACE_ATLAS),
  ];

  let done = 0;
  const results = await Promise.all(
    steps.map(async (step) => {
      const value = await step();
      onProgress(++done / steps.length);
      return value;
    }),
  );

  const [train, lightMap, reflection, smudge, bake, cat, faceAtlas] = results;

  lightMap.channel = 1;
  lightMap.flipY = true;
  lightMap.needsUpdate = true;

  smudge.flipY = false;
  smudge.colorSpace = NoColorSpace;

  faceAtlas.flipY = false;
  faceAtlas.colorSpace = NoColorSpace;

  reflection.mapping = 303; // EquirectangularReflectionMapping

  return { train, lightMap, reflection, smudge, bake, cat, faceAtlas };
}
