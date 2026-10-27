/* ===== 08-tuning-params.js =====
 * DialKit 实时调参默认值（Ajo 嗓音 / 音频总线 / 灯光 / 调色 / 运动）
 * 来源: tobis.vision /_next/static/immutable/chunks/1reeeg5qme_uu.js  offset 1518594-1519831
 * 说明: 站点原始代码经 Turbopack 压缩与混淆，变量名已被重命名，此处仅做切分与格式化，逻辑未改动。
 * 注: 片段尾部补上了被截断的闭合括号（}])）。
 * 变量名对照见 ref/source/00-name-map.js
 */
let Ln = {
  pitch: 2.25,
  formant: 2.16,
  intonation: 1.35,
  speed: 2.6,
  volume: 0.2,
  overlap: 0.035,
  softness: 0.95,
};
e.s([
  "default",
  0,
  function ({ enter: e, revealed: t, onReady: i, onError: r }) {
    let [s, a] = (0, y.useState)(!1),
      n = (0, y.useRef)(!1),
      o = (0, y.useRef)(!1),
      l = (0, y.useRef)(null),
      u = (0, y.useRef)(Ln),
      [h, d] = (0, y.useState)(""),
      [c, p] = (0, y.useState)(!1),
      m = (0, y.useRef)(null),
      g = (0, y.useRef)(null),
      f = (0, y.useRef)(!1),
      x = (0, y.useRef)(null),
      v = (0, y.useRef)(null),
      [T, w] = (0, y.useState)(null),
      S = e1("Train — audio", {
        music: [10, 0, 100, 1],
        carriage: [58, 0, 100, 1],
        bump: [100, 0, 100, 1],
        station: [24, 0, 100, 1],
        cat: [24, 0, 100, 1],
      }),
      M = (0, y.useRef)(S);
    (0, y.useEffect)(() => {
      (M.current = S), m.current?.setVolumes(S);
    }, [S]);
    let A = e1("Train — lighting", {
        exposure: [1.22, 0.2, 2.5, 0.01],
        sun: [10, 0, 10, 0.1],
        sky: [1.25, 0, 4, 0.05],
        bounce: [2.65, 0, 8, 0.05],
        weave: [0.2, 0.1, 3, 0.05],
        dirt: [0.49, 0, 1, 0.01],
        glass: [0.03, 0, 0.4, 0.01],
      }),
      N = e1("Train — color grade", {
        enabled: !0,
        vibrance: [1, -1, 1, 0.01],
        warmHighlights: [0.56, 0, 1, 0.01],
        coolShadows: [0.36, 0, 1, 0.01],
        pixelSize: [2, 1, 4, 1],
        sunGlow: [0.09, 0, 0.5, 0.01],
      }),
      C = (0, y.useRef)(N);
    (0, y.useEffect)(() => {
      C.current = N;
    }, [N]);
    let R = e1("Train — motion", {
        playing: !0,
        catFps: [16, 6, 30, 1],
        speed: [30, 0, 30, 0.1],
        exteriorBlur: [2, 0, 2, 0.05],
        handleSway: [2, 0, 2, 0.05],
        cameraShake: [2, 0, 2, 0.05],
        cameraPan: [2, 0, 2, 0.05],
      }),
      E = (0, y.useRef)(R);
  },
]);
