/**
 * 调参默认值（对应 ref/source/08-tuning-params.js 的 DialKit 声明）
 * 站点是实时面板，这里先固定成同一组初始值，后续要加面板直接改这里即可。
 */
export const params = {
  audio: {
    music: 10,
    carriage: 58,
    bump: 100,
    station: 24,
    cat: 24,
  },
  lighting: {
    exposure: 1.22,
    sun: 10,
    sky: 1.25,
    bounce: 2.65,
    weave: 0.2,
    dirt: 0.49,
    glass: 0.03,
  },
  colorGrade: {
    enabled: true,
    vibrance: 1,
    warmHighlights: 0.56,
    coolShadows: 0.36,
    pixelSize: 2,
    sunGlow: 0.09,
  },
  motion: {
    playing: true,
    catFps: 16,
    speed: 30,
    exteriorBlur: 2,
    handleSway: 2,
    cameraShake: 2,
    cameraPan: 2,
  },
  // Ajo 的嗓音（站点面板 "Train — Ajo voice"，默认值和 13 里的 Ln 完全一致）
  voice: {
    pitch: 2.25,
    formant: 2.16,
    speed: 2.6,
    intonation: 1.35,
    volume: 0.2,
    softness: 0.95,
    overlap: 0.035,
  },
};
