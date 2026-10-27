/* ===== 02-load-and-material-patch.js =====
 * 资产加载 + 场景遍历改材质（烘焙 lightMap / 动态阴影 / 玻璃 / 猫脸图集 / 窗反射）
 * 来源: tobis.vision /_next/static/immutable/chunks/1reeeg5qme_uu.js  offset 1527125-1532783
 * 说明: 站点原始代码经 Turbopack 压缩与混淆，变量名已被重命名，此处仅做切分与格式化，逻辑未改动。
 * 变量名对照见 ref/source/00-name-map.js
 */
if ((await L.init(), S)) return;
b?.appendChild(L.domElement);
let [e0, e1, e9, e2, e3, e4, e5] = await Promise.all([
  new dv().setDRACOLoader(Z).loadAsync("/assets/train/train-v06-optimized.glb"),
  new dy().loadAsync("/assets/train/lighting/carriage-sunboost-v06.exr"),
  new dy().loadAsync("/assets/train/lighting/carriage-reflection-v06.exr"),
  new ln().loadAsync("/assets/train/lighting/glass-smudge.webp"),
  fetch("/assets/train/lighting/bake-v06.json").then((e) => {
    if (!e.ok) throw Error("Unable to load baked sun direction");
    return e.json();
  }),
  new dv()
    .setMeshoptDecoder(t5)
    .loadAsync("/assets/cat/cat-locomotion-v06-mexico66.glb"),
  new ln().loadAsync("/assets/cat/expressions-rounded.webp"),
]);
(e5.flipY = !1), (e5.colorSpace = ""), K.add(e5);
let e8 = e3.sunDirectionBlender;
if (3 !== e8.length || !e8.every(Number.isFinite))
  throw Error("Invalid baked sun direction");
let e6 = new iB(-e8[0], -e8[2], e8[1]).normalize(),
  e7 = e3.sunColorLinear;
for (let e of (e7?.length === 3 &&
  e7.every(Number.isFinite) &&
  B.color.setRGB(e7[0], e7[1], e7[2], ie),
B.position.copy(B.target.position).addScaledVector(e6, 10),
z.position.copy(B.position),
[e1, e9, e2]))
  K.add(e);
(e1.channel = 1),
  (e1.flipY = !0),
  (e2.flipY = !1),
  (e2.colorSpace = ""),
  (e9.mapping = 303),
  (P.environment = e9),
  (P.environmentIntensity = 0.12),
  (F.environment = e9),
  (F.environmentIntensity = 0.12),
  e0.scene.traverse((e) => {
    !0 !== e.userData.dynamicPart ||
      String(e.userData.sourceName).startsWith("Grip ") ||
      (e.visible = !1);
  });
let te = e4.scene.getObjectByName("Cat_V1");
if (!te) throw Error("Cat_V1 rig missing from character export");
te.scale.setScalar(0.2),
  te.position.set(0.2012888789, 0.075, -0.96),
  (e4.scene.userData.dynamicPart = !0),
  (e4.scene.userData.sourceName = "Animated cat"),
  e0.scene.add(e4.scene),
  (c = e4.scene);
let tt = e4.animations.find((e) => "Cat_Train_Idle_v04" === e.name)?.clone();
if (!tt) throw Error("Cat idle animation missing from export");
let ti = Math.min(...tt.tracks.map((e) => e.times[0]));
for (let e of tt.tracks) e.shift(-ti);
tt.resetDuration(),
  (tt.name = "Cat_Train_Idle"),
  (u = new uo(e4.scene)).clipAction(tt).play(),
  u.update(0);
let tr = e0.cameras.find((e) => e.name.includes("CAM_reference"));
if (!tr) throw Error("Reference camera missing from the scene export");
if (
  (e0.scene.traverse((e) => {
    e.name.includes("Glass") && e.name.includes("main") && (r = e);
  }),
  !r)
)
  throw Error("Main window missing from scene export");
let ts =
  ((e = r),
  e.updateWorldMatrix(!0, !0),
  tr.updateWorldMatrix(!0, !1),
  (O =
    (A = (w = new r$().setFromObject(e)).getSize(new iB())).x < A.y && A.x < A.z
      ? 0
      : 2),
  (D = new iB().setComponent(O, 1)),
  (G = new rv()).position.copy(w.getCenter(new iB())),
  (Q = tr.getWorldPosition(new iB()).sub(G.position)),
  0 > D.dot(Q) && D.negate(),
  G.quaternion.setFromUnitVectors(new iB(0, 0, 1), D),
  G.updateMatrixWorld(!0),
  (ee = Fm({
    target: G,
    resolutionScale: 0.5,
    bounces: !1,
    samples: 0,
  })).reflector
    .getVirtualCamera(tr)
    .layers.set(2),
  ee);
if (
  ((o = ts),
  P.add(o.target),
  e0.scene.traverse((e) => {
    if ((e instanceof lo && (e.visible = !1), !(e instanceof at))) return;
    J.add(e.geometry),
      e instanceof ac && (R.add(e.skeleton), (e.frustumCulled = !1));
    let t = Array.isArray(e.material) ? e.material : [e.material];
    for (let e of t)
      for (let t of (Y.add(e), Object.values(e))) t instanceof iJ && K.add(t);
    (e.castShadow = !e.name.includes("Sky")), (e.receiveShadow = !0);
    let i = e,
      r = !1,
      s = !1,
      a = !1;
    for (; i; )
      (r ||= !0 === i.userData.bakedIndirect),
        (a ||= !0 === i.userData.dynamicPart),
        (s ||=
          !0 === i.userData.dynamicPart &&
          !String(i.userData.sourceName).startsWith("Grip ")),
        (i = i.parent);
    if ((a && e.layers.enable(1), e.name.includes("Glass"))) {
      let t = new we({
          color: "#b8cec5",
          transparent: !0,
          depthWrite: !1,
          roughness: 0.15,
          metalness: 0.15,
          side: 2,
        }),
        i = Fv(e2).r.div(0.25).clamp(),
        r = Fa(1).sub(Fu.dot(Fc).abs()).pow(5);
      (t.lightsNode = V),
        (t.envMap = e9),
        (t.envMapIntensity = 0),
        (t.emissiveNode = ts.rgb.mul(1.5)),
        (t.opacityNode = H.add(i.mul(q)).add(r.mul(0.25)).clamp(0, 0.85)),
        (t.roughnessNode = i.mul(0.65).add(0.1)),
        (e.material = t),
        (e.castShadow = !1),
        Y.add(t);
    } else
      "The Wrong Site | banner paper" !== e.userData.sourceName &&
        e.layers.enable(2),
        (e.material = t.map((t) => {
          if (!(t instanceof ok)) return t;
          let i = r ? new FV(j) : new we();
          if (
            (ok.prototype.copy.call(i, t),
            (i.lightsNode = s ? W : V),
            t.map &&
              (t.name.startsWith("Seating")
                ? ((t.map.wrapS = t.map.wrapT = 1e3),
                  (i.colorNode = F_(
                    Fv(t.map),
                    null,
                    null,
                    $.mul(3),
                    Fp,
                    Fh,
                  ).mul(Fs(t.color))))
                : (i.colorNode = Fv(t.map).mul(Fs(t.color)))),
            t.name.startsWith("Backdrop | hill") && t.map)
          ) {
            let e = t.name.endsWith("1") ? 0.62 : 0.25;
            i.colorNode = Fl(Fv(t.map).rgb, FM(0.38, 0.49, 0.48), e);
          }
          return (
            (r || s || t.metalness > 0.6) &&
              ((i.envMap = e9), (i.envMapIntensity = s ? 0.3 : 0.65)),
            r &&
              ((i.lightsNode = U),
              i.emissive.set(0),
              (i.emissiveMap = null),
              (i.emissiveIntensity = 0),
              (i.lightMap = e1),
              (i.lightMapIntensity = 2.65),
              X.push(i)),
            s &&
              t.name.includes("FACE_ATLAS") &&
              (y.push(
                (function (e, t) {
                  if (!e.map) throw Error("Missing cat expression atlas");
                  let i = t ?? e.map,
                    r = t ? 4 : 2,
                    s = !1,
                    a = FT(new iF()),
                    n = FT(0),
                    o = FT(0.48),
                    l = (function (e = Math.random) {
                      let t = !0,
                        i = !1,
                        r = 2.5 + 3.5 * e(),
                        s = !1;
                      return {
                        get closed() {
                          return i;
                        },
                        setEnabled(a) {
                          (t = a), (i = !1), (s = !1), (r = 2.5 + 3.5 * e());
                        },
                        blink() {
                          (i = !0), (s = !1), (r = 0.07);
                        },
                        update(a) {
                          for (r -= Math.max(0, a); r <= 0; )
                            i
                              ? ((i = !1),
                                (s = t && !s && 0.25 > e()),
                                (r += s ? 0.13 : 2.5 + 3.5 * e()))
                              : t
                                ? ((i = !0), (r += 0.07))
                                : (r = 2.5);
                          return i;
                        },
                      };
                    })(),
                    u = Fw(i.channel).clamp(0.001, 0.999),
                    h = u.mul(FS(0.25, 1 / r)),
                    d = Fv(i, h.add(a)),
                    c = Fv(i, h.add(FS(0.5, 1 / r))),
                    p = Fl(
                      d,
                      c,
                      u.y.greaterThan(o).and(u.y.lessThan(0.62)).select(n, 0),
                    );
                  return (
                    (e.colorNode = t ? FT(new rC(526344)) : p.rgb),
                    (e.opacityNode = t ? p.r.oneMinus() : p.a),
                    {
                      setExpression(e) {
                        let i = FI.indexOf(e);
                        "Happy" === e && t && (i = 7),
                          "Laughing" === e && (i = 1),
                          i < 0 ||
                            (a.value.set((i % 4) / 4, Math.floor(i / 4) / r),
                            (n.value = (s =
                              !!t &&
                              ("Happy" === e ||
                                "Laughing" === e ||
                                "Closed eyes" === e))
                              ? 0
                              : Number(l.closed)),
                            (o.value = i >= 3 && i <= 5 ? 0.535 : 0.48));
                      },
                      setAutoBlink: l.setEnabled,
                      blink: l.blink,
                      update(e) {
                        n.value = Number(l.update(e)) * Number(!s);
                      },
                    }
                  );
                })(i, e5),
              ),
              (i.depthWrite = !1),
              (i.polygonOffset = !0),
              (i.polygonOffsetFactor = -1),
              (e.castShadow = !1)),
            Y.add(i),
            i
          );
        })),
        (Array.isArray(t) && 1 !== t.length) || (e.material = e.material[0]);
  }),
  S)
)
  return;
P.add(e0.scene),
  (k.current = {
    renderer: L,
    sun: B,
    sky: I,
    glass: H,
    dirt: q,
    weave: $,
    baked: X,
  });
