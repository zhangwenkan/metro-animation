/* ===== 01-renderer-and-lights.js =====
 * WebGPURenderer 初始化 + 灯光组（烘焙太阳 / 动态遮挡阴影专用光 / 面光）
 * 来源: tobis.vision /_next/static/immutable/chunks/1reeeg5qme_uu.js  offset 1525417-1526662
 * 说明: 站点原始代码经 Turbopack 压缩与混淆，变量名已被重命名，此处仅做切分与格式化，逻辑未改动。
 * 变量名对照见 ref/source/00-name-map.js
 */
(P = new rP()), (F = new rP());
F.background = new rC("#a9c6d6");
let L = new P0({ antialias: !1 });
(L.domElement.style.opacity = "1"),
  L.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)),
  (L.toneMapping = 6),
  (L.toneMappingExposure = 1.22),
  (L.shadowMap.enabled = !0);
let B = new lN("#ffe0aa", 10);
B.target.position.set(0, 1, -1),
  (B.castShadow = !0),
  B.shadow.mapSize.set(2048, 2048),
  Object.assign(B.shadow.camera, {
    left: -4,
    right: 4,
    top: 4,
    bottom: -4,
    near: 0.1,
    far: 30,
  }),
  (B.shadow.normalBias = 0.015);
let I = new ll("#c2dcff", "#9b7950", 1.25);
Rt.setLTC(uD.init());
let O = new lR("#ffe6c8", 5, 2.5, 1.2);
O.position.set(1.51, 2.37, -2.18), O.lookAt(0, 1, 0), P.add(O);
let D = new lN("#ffdbb5", 0.65);
D.position.set(-1, 0.4, 2),
  D.target.position.set(0, 1.2, -1),
  P.add(B, B.target, I, D, D.target);
let V = Fn([B, I]),
  U = Fn([]),
  z = new lN(0xffffff, 0);
(z.name = "Baked sun — moving occluders"),
  z.target.position.copy(B.target.position),
  (z.castShadow = !0),
  z.shadow.camera.layers.set(1),
  z.shadow.mapSize.set(1024, 1024),
  Object.assign(z.shadow.camera, {
    left: -2.5,
    right: 2.5,
    top: 2.5,
    bottom: -2.5,
    near: 0.1,
    far: 25,
  }),
  (z.shadow.normalBias = 0.01),
  (z.shadow.bias = -1e-4),
  P.add(z, z.target);
let G = Fx(z),
  j = FM(G.mul(0.25).add(0.75)),
  W = Fn([B, I, O, D]),
  H = FT(0.03),
  q = FT(0.49),
  $ = FT(1),
  X = [],
  K = new Set(),
  Y = new Set(),
  J = new Set(),
  Z = new uU().setDecoderPath("/assets/decoders/three-r184/draco/gltf/");
