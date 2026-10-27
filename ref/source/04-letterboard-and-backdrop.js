/* ===== 04-letterboard-and-backdrop.js =====
 * Canvas2D 点阵站名水牌 + 窗外几何分块视差滚动 + 吊环摆动
 * 来源: tobis.vision /_next/static/immutable/chunks/1reeeg5qme_uu.js  offset 1538152-1540396
 * 说明: 站点原始代码经 Turbopack 压缩与混淆，变量名已被重命名，此处仅做切分与格式化，逻辑未改动。
 * 变量名对照见 ref/source/00-name-map.js
 */
(h = (function () {
  let e = new r_();
  (e.name = "Next station letterboard"), e.position.set(-1.97, 2.27, -1.32);
  let t = new nx(1.34, 0.27, 0.065),
    i = new we({ color: "#373b38", roughness: 0.75, metalness: 0.25 }),
    r = new at(t, i);
  e.add(r);
  let s = document.createElement("canvas");
  (s.width = 1280), (s.height = 96);
  let a = s.getContext("2d");
  (a.fillStyle = "#100e09"), a.fillRect(0, 0, s.width, s.height);
  let n = "NEXT STATION: COMING SOON";
  for (let e = 0; e < n.length; e++) {
    let t = Li[n[e]];
    t &&
      t.forEach((t, i) => {
        for (let r = 0; r < t.length; r++)
          "1" === t[r] &&
            ((a.fillStyle = "#ffad39"),
            a.beginPath(),
            a.arc(24 + 42 * e + 7 * r, 27 + 7 * i, 2.6, 0, 2 * Math.PI),
            a.fill());
      });
  }
  let o = new nf(s);
  (o.colorSpace = t7), (o.wrapS = 1e3);
  let l = FT(0),
    u = FT(0.45),
    h = new __();
  h.colorNode = Fv(o, FS(Fw().x.mul(0.45).add(l), Fw().y));
  let d = new of(1.26, 0.21),
    c = new at(d, h);
  (c.position.z = 0.0335), e.add(c);
  let p = window.matchMedia("(prefers-reduced-motion: reduce)"),
    m = 0;
  return {
    root: e,
    update(e) {
      if (p.matches) {
        (u.value = (42 * n.length + 48) / 1280), (l.value = 0);
        return;
      }
      (u.value = 0.45),
        (m += e),
        (l.value = (65 * Math.max(0, (m % (2 + 1280 / 65)) - 2)) / 1280);
    },
    dispose() {
      t.dispose(), i.dispose(), d.dispose(), h.dispose(), o.dispose();
    },
  };
})()),
  P.add(h.root);
let ty = (function (e, t) {
  e.updateMatrixWorld(!0);
  let i = new r_(),
    r = new r_();
  t.add(i, r);
  let s = new Map();
  for (let a of [...e.children]) {
    let e = String(a.userData.sourceName ?? a.name),
      n = e.match(/^Grip (\d+) \| (strap|ivory ring)$/);
    if (n) {
      let e = s.get(n[1]) ?? [];
      e.push(a), s.set(n[1], e);
    } else
      e.startsWith("Sky |")
        ? t.attach(a)
        : e.startsWith("Distant ridge")
          ? r.attach(a)
          : /^(Ground |Road |Guardrail |Grass |Backdrop )/.test(e) &&
            i.attach(a);
  }
  let a = (e, i, r) => {
      let s = [];
      for (let a = r ? -2 : -1; a <= (r ? 2 : 1); a++) {
        let n = 0 === a ? e : e.clone(!0);
        0 !== a && t.add(n),
          r && Math.abs(a) % 2 == 1 && (n.scale.x = -1),
          s.push({ object: n, offset: a * i });
      }
      return (e) => {
        let t = e % (r ? 2 * i : i);
        for (let e of s) e.object.position.x = e.offset - t;
      };
    },
    n = a(i, 60, !1),
    o = a(r, 130, !0),
    l = [];
  for (let t of s.values()) {
    let i = new r$();
    for (let e of t) i.union(new r$().setFromObject(e));
    let r = new r_();
    for (let s of (r.position.copy(i.getCenter(new iB())),
    (r.position.y = i.max.y),
    e.worldToLocal(r.position),
    e.add(r),
    r.updateMatrixWorld(!0),
    t))
      r.attach(s);
    l.push(r);
  }
  let u = 0,
    h = 0;
  return {
    update(e, t, i = 1) {
      (u += e * t),
        (h += e),
        n(u),
        o(0.22 * u),
        l.forEach((e, t) => {
          let r = (0.9 + 0.1 * Math.sin(0.43 * h)) * i;
          (e.rotation.z = 0.075 * Math.sin(1.65 * h + 0.32 * t) * r),
            (e.rotation.x = 0.035 * Math.sin(1.13 * h + 0.21 * t) * r);
        });
    },
  };
})(e0.scene, F);
ty.update(0, 0), ta();
