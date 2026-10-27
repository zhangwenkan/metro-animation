/* ===== 06-render-loop.js =====
 * 主循环：帧时间钳制 / 猫按 fps 量化 / 各 rig 更新 / 后处理合成
 * 来源: tobis.vision /_next/static/immutable/chunks/1reeeg5qme_uu.js  offset 1543757-1544924
 * 说明: 站点原始代码经 Turbopack 压缩与混淆，变量名已被重命名，此处仅做切分与格式化，逻辑未改动。
 * 注: 片段原处于 async 函数体内，额外包了一层 async function 以便解析。
 * 变量名对照见 ref/source/00-name-map.js
 */
async function __slice() {
  let tx = () => {
    if (!a) return;
    let e = C.current;
    (a.vibrance.value = e.vibrance),
      (a.warmth.value = e.warmHighlights),
      (a.coolShadows.value = e.coolShadows),
      (a.amount.value = +!!e.enabled),
      (a.pixelSize.value = e.pixelSize),
      (a.glow.value = e.sunGlow),
      (a.blurStrength.value = E.current.exteriorBlur),
      (a.trainSpeed.value = E.current.playing ? E.current.speed : 0),
      a.render();
  };
  if ((await L.compileAsync(P, tr), S || (tx(), await T.loaded, S))) return;
  p(!0), i(!0), (t = new ResizeObserver(ta)).observe(b);
  let tv =
      ((eQ = 0),
      {
        advance(e, t = 30) {
          if (!Number.isFinite(e) || e <= 0 || !Number.isFinite(t) || t <= 0)
            return 0;
          let i = 1 / t,
            r = Math.floor(((eQ += e) + 1e-10) / i) * i;
          return (eQ = Math.max(0, eQ - r)), r;
        },
      }),
    t_ = performance.now(),
    tT = (e) => {
      if (S) return;
      if (
        ((N = requestAnimationFrame(tT)),
        T.update(E.current.playing),
        document.hidden)
      ) {
        t_ = e;
        return;
      }
      let t = Math.min((e - t_) / 1e3, 0.1);
      if (((t_ = e), E.current.playing)) {
        let e = tv.advance(t, E.current.catFps);
        e > 0 && u?.update(e),
          _.update(t),
          ty.update(t, E.current.speed, E.current.handleSway);
      }
      h?.update(t),
        tc.update(
          t,
          E.current.speed,
          E.current.cameraShake * (1 - 0.65 * tp.amount),
          E.current.playing,
          E.current.cameraPan * (1 - 0.8 * tp.amount),
        ),
        tp.update(t, f.current, tm.matches),
        tu?.update(t),
        td?.update(n.current, t, tm.matches),
        tx();
    };
  N = requestAnimationFrame(tT);
}
