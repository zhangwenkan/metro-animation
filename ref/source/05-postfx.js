/* ===== 05-postfx.js =====
 * TSL 后处理：窗外反射景深模糊 / 主 pass 最近邻+像素量化 / 4级 bloom / AgX+调色+暗角
 * 来源: tobis.vision /_next/static/immutable/chunks/1reeeg5qme_uu.js  offset 1540397-1543757
 * 说明: 站点原始代码经 Turbopack 压缩与混淆，变量名已被重命名，此处仅做切分与格式化，逻辑未改动。
 * 变量名对照见 ref/source/00-name-map.js
 */
a = (function (e, t, i, r, s = !1) {
  let { RenderPipeline: a } = Fz,
    n = new a(e),
    o = r ? Fd(r, i, { samples: 0 }) : null,
    l = FT(0.65),
    u = FT(15);
  if (o) {
    let e = o.getTextureNode("output");
    (e.uvNode = Fy), (o.getTextureNode("depth").uvNode = Fy);
    let i = o.getViewZNode().negate().max(1),
      r = FS(
        Fa(80)
          .div(i)
          .clamp(0, 8)
          .mul(i.smoothstep(35, 100).oneMinus())
          .mul(l)
          .mul(u.div(15))
          .min(12)
          .div(Fb.x),
        0,
      );
    t.backgroundNode = e
      .mul(0.4)
      .add(e.sample(Fy.add(r.mul(0.5))).mul(0.2))
      .add(e.sample(Fy.sub(r.mul(0.5))).mul(0.2))
      .add(e.sample(Fy.add(r)).mul(0.1))
      .add(e.sample(Fy.sub(r)).mul(0.1)).rgb;
  }
  let h = Fd(t, i, { samples: 4 * !!s }),
    d = h.getTextureNode("output");
  (d.value.minFilter = s ? Fz.LinearFilter : Fz.NearestFilter),
    (d.value.magFilter = s ? Fz.LinearFilter : Fz.NearestFilter);
  let c = FT(2),
    p = Fy.mul(Fb).div(c).floor().mul(c).add(c.mul(0.5)).div(Fb),
    m = FT(0),
    g = FT(0.567),
    f = FT(1),
    b = FT(0),
    y = Fb.x.div(Fb.y),
    x = p.sub(0.5).mul(2).mul(FS(y, 1)),
    v = x.length().max(1e-5),
    _ = Fl(g.tan(), v.mul(g).tan().div(v), m).div(f),
    T = s ? x.mul(_).div(FS(y, 1)).mul(0.5).add(0.5) : p,
    w = (function (e) {
      let t = FT(0.09),
        i = e.sample(Fy).rgb,
        r = i.dot(FM(0.2126, 0.7152, 0.0722)),
        s = [],
        a = Array.from({ length: 4 }, () => FT(new iF(1, 1))),
        n = (e, t) => {
          let i = Ff(FA(e, 1), 1, 1, { type: 1016 });
          return (
            (i.updateBeforeType = cA.FRAME),
            (i.renderTarget.depthBuffer = !1),
            (i.renderTarget.texture.minFilter = 1006),
            (i.renderTarget.texture.magFilter = 1006),
            (i.renderTarget.texture.generateMipmaps = !1),
            s.push({ node: i, divisor: t }),
            i
          );
        },
        o = [n(i.mul(r.smoothstep(2, 2.1)), 2)];
      for (let e = 1; e < 4; e++) {
        let t = o[e - 1],
          i = a[e - 1],
          r = (e, r) => t.sample(Fy.add(FS(e, r).mul(i))).rgb,
          s = r(0, 0)
            .mul(0.125)
            .add(r(-1, -1).add(r(1, -1)).add(r(-1, 1)).add(r(1, 1)).mul(0.125))
            .add(r(-2, 0).add(r(2, 0)).add(r(0, -2)).add(r(0, 2)).mul(0.0625))
            .add(
              r(-2, -2).add(r(2, -2)).add(r(-2, 2)).add(r(2, 2)).mul(0.03125),
            );
        o.push(n(s, 2 ** (e + 1)));
      }
      let l = o[3];
      for (let e = 2; e >= 1; e--) {
        let t = l,
          i = a[e + 1],
          r = (e, r) => t.sample(Fy.add(FS(e, r).mul(i))).rgb,
          s = r(0, 0)
            .mul(0.25)
            .add(r(-1, 0).add(r(1, 0)).add(r(0, -1)).add(r(0, 1)).mul(0.125))
            .add(
              r(-1, -1).add(r(1, -1)).add(r(-1, 1)).add(r(1, 1)).mul(0.0625),
            );
        l = n(o[e].sample(Fy).rgb.add(s), 2 ** (e + 1));
      }
      let u = 0,
        h = 0,
        d = new iF();
      return {
        strength: t,
        sample: (e) => l.sample(e).rgb.mul(1.1).mul(t).clamp(0, 2),
        resize(e) {
          if ((e.getDrawingBufferSize(d), d.x !== u || d.y !== h)) {
            for (let { node: e, divisor: t } of ((u = d.x), (h = d.y), s))
              e.setSize(
                Math.max(1, Math.floor(d.x / t)),
                Math.max(1, Math.floor(d.y / t)),
              );
            o.forEach((e, t) => {
              a[t].value.set(
                1 / e.renderTarget.width,
                1 / e.renderTarget.height,
              );
            });
          }
        },
        dispose() {
          for (let { node: e } of s)
            e.renderTarget.dispose(),
              e._quadMesh.material.dispose(),
              e.dispose();
        },
      };
    })(d),
    S = FT(0),
    M = FT(0),
    A = FT(0),
    N = FT(1),
    C = Fg(
      d.sample(T).add(FA(w.sample(T), 0)),
      Fz.AgXToneMapping,
      Fz.SRGBColorSpace,
    ).toVar(),
    R = C.rgb,
    E = FM(0.2126, 0.7152, 0.0722),
    k = R.dot(E),
    P = R.r.max(R.g).max(R.b),
    F = R.r.min(R.g).min(R.b),
    L = P.sub(F).div(P.max(0.001)),
    B = Fl(FM(k), R, Fa(1).add(S.mul(L.oneMinus()))),
    I = k.smoothstep(0.45, 0.9),
    O = k.smoothstep(0.1, 0.55).oneMinus(),
    D = FM(0.08, -0.015, -0.0864).mul(M).mul(I),
    V = FM(-0.035, 0.002, 0.0833).mul(A).mul(O),
    U = B.add(D).add(V).clamp();
  n.outputColorTransform = !1;
  let z = Fl(R, U, N),
    G = s
      ? Fa(1).sub(v.div(y.mul(y).add(1).sqrt()).smoothstep(0.65, 1).mul(b))
      : Fa(1);
  return (
    (n.outputNode = FA(z.mul(G), C.a)),
    {
      setSceneResolutionScale: (e) => h.setResolutionScale(e),
      lensStrength: m,
      lensHalfFov: g,
      lensSourceTan: f,
      lensVignette: b,
      glow: w.strength,
      pixelSize: c,
      blurStrength: l,
      trainSpeed: u,
      vibrance: S,
      warmth: M,
      coolShadows: A,
      amount: N,
      render: () => {
        w.resize(e), n.render();
      },
      dispose: () => {
        (t.backgroundNode = null),
          o?.dispose(),
          h.dispose(),
          w.dispose(),
          n.dispose();
      },
    }
  );
})(L, P, tr, F);
