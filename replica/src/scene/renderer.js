import { WebGPURenderer, AgXToneMapping } from "three/webgpu";

/**
 * 与站点一致：WebGPURenderer（WebGPU 优先，内部自动回退 WebGL2）
 * 参数来自 ref/source/01-renderer-and-lights.js
 */
export function createRenderer() {
  const renderer = new WebGPURenderer({ antialias: false });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = AgXToneMapping;
  renderer.toneMappingExposure = 1.22;
  renderer.shadowMap.enabled = true;

  return renderer;
}
