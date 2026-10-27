/* ===== 03-camera-rigs.js =====
 * 相机四层叠加：鼠标视差 / 车厢抖动 / 过轨接缝冲击 / 闲置回看猫 + 报纸拾取机位
 * 来源: tobis.vision /_next/static/immutable/chunks/1reeeg5qme_uu.js  offset 1532784-1537720
 * 说明: 站点原始代码经 Turbopack 压缩与混淆，变量名已被重命名，此处仅做切分与格式化，逻辑未改动。
 * 变量名对照见 ref/source/00-name-map.js
 */
let ta = () => {
    b &&
      (L.setSize(b.clientWidth, b.clientHeight),
      (tr.aspect = b.clientWidth / b.clientHeight),
      tr.updateProjectionMatrix());
  },
  tn = e4.scene.getObjectByName("head") ?? e4.scene,
  to = new r$().setFromObject(e4.scene).max.y,
  tl = tn.getWorldPosition(new iB()).y,
  tu = x.current
    ? ((d = x.current),
      (m = to - tl + 0.04),
      (et = new iB()),
      (ei = new iF()),
      (er = new iF()),
      (es = !1),
      {
        update(e) {
          tn.getWorldPosition(et),
            (et.y += m),
            tr.updateMatrixWorld(),
            et.project(tr);
          let t = b.clientWidth,
            i = b.clientHeight,
            r = Math.min(280, t - 32),
            s = d.offsetHeight;
          er.set(
            iP.clamp(
              (0.5 * et.x + 0.5) * t - r + 35,
              16,
              Math.max(16, t - r - 16),
            ),
            iP.clamp(
              (-(0.5 * et.y) + 0.5) * i - 78,
              20,
              Math.max(20, i - s - 24),
            ),
          ),
            es ? ei.lerp(er, 1 - Math.exp(-9 * e)) : (ei.copy(er), (es = !0)),
            (d.style.transform = `translate3d(${ei.x}px, ${ei.y}px, 0)`),
            (d.style.visibility = et.z > -1 && et.z < 1 ? "visible" : "hidden");
        },
      })
    : null,
  th =
    e0.scene.getObjectByProperty("name", "WEB_The Local | folded newspaper") ??
    (e0.scene.traverse((e) => {
      "The Local | folded newspaper" === e.userData.sourceName && (ea = e);
    }),
    ea),
  td =
    th && l.current
      ? ((g = l.current),
        (en = th.position.clone()),
        (eo = new iB(0, 0, 0.135)),
        (el = new iB()),
        (eu = th.quaternion.clone()),
        (eh = new iL().setFromAxisAngle(new iB(1, 0, 0), iP.degToRad(18))),
        (ed = eu.clone().multiply(eh)),
        (ec = new iB()),
        (ep = new iL()),
        (em = new i2()),
        (eg = new iB(0, 1, 0)),
        (ef = new iL()),
        (eb = new iB()),
        (ey = new iL()),
        (ex = new iB()),
        (ev = new iB()),
        (e_ = new iB()),
        (eT = new iB()),
        (ew = new iB()),
        (eS = new iB()),
        (eM = new iL()),
        (eA = 0),
        (eN = 0),
        (eC = new r$()),
        (eR = new iB()),
        {
          update(e, t, i) {
            let r = eN > 0,
              s = Math.min(Math.max(t, 0), 0.1),
              a = +!!e,
              n = eN - a,
              o = eA + 9 * n,
              l = Math.exp(-9 * s);
            (eN = i ? a : a + (n + o * s) * l),
              (eA = i ? 0 : (eA - 9 * o * s) * l),
              1e-4 > Math.abs(eN - a) &&
                0.001 > Math.abs(eA) &&
                ((eN = a), (eA = 0));
            let u = eN;
            if (
              (eb.copy(tr.position),
              ey.copy(tr.quaternion),
              tr.updateMatrixWorld(),
              e &&
                !r &&
                (ex.copy(tr.position),
                tr.getWorldPosition(eT),
                tr.getWorldDirection(ew),
                el.copy(eo).applyQuaternion(eu),
                eS.copy(en).add(el),
                el.copy(eo).applyQuaternion(ed),
                eS.sub(el),
                th.parent?.localToWorld(eS),
                eM.copy(ed),
                th.parent &&
                  (th.parent.getWorldQuaternion(ef), eM.premultiply(ef)),
                ev.copy(eT).addScaledVector(ew, eT.distanceTo(eS))),
              th.quaternion.copy(eu).slerp(ed, u),
              el.copy(eo).applyQuaternion(eu),
              th.position.copy(en).add(el),
              el.copy(eo).applyQuaternion(th.quaternion),
              th.position.sub(el),
              th.updateWorldMatrix(!0, !1),
              u > 0)
            ) {
              let e = iP.degToRad(tr.fov),
                t = Math.max(
                  0.27 / (2 * Math.tan(e / 2) * 0.68),
                  0.36 / (2 * Math.tan(e / 2) * tr.aspect * 0.84),
                  0.4,
                );
              ec.set(0, t, 0.07).applyQuaternion(eM).add(eS),
                tr.parent && tr.parent.worldToLocal(ec),
                tr.position.lerpVectors(ex, ec, u),
                tr.updateMatrixWorld(!0),
                tr.getWorldPosition(eT);
              let i = 1 - (1 - u) ** 1.35;
              e_.lerpVectors(ev, eS, i),
                em.lookAt(eT, e_, eg),
                ep.setFromRotationMatrix(em),
                tr.parent &&
                  (tr.parent.getWorldQuaternion(ef).invert(),
                  ep.premultiply(ef)),
                tr.quaternion.copy(ep);
              let r = iP.smoothstep(u, 0, 0.08);
              tr.position.lerp(eb, 1 - r),
                tr.quaternion.slerp(ey, 1 - r),
                tr.updateMatrixWorld(!0);
            }
            if (
              (th.updateMatrixWorld(!0),
              (g.disabled = e || eN > 0),
              e || eN > 0)
            ) {
              g.style.visibility = "hidden";
              return;
            }
            tr.updateMatrixWorld(), eC.setFromObject(th);
            let h = 1 / 0,
              d = 1 / 0,
              c = -1 / 0,
              p = -1 / 0,
              m = !1;
            for (let e = 0; e < 8; e++) {
              eR
                .set(
                  1 & e ? eC.max.x : eC.min.x,
                  2 & e ? eC.max.y : eC.min.y,
                  4 & e ? eC.max.z : eC.min.z,
                )
                .project(tr),
                (m ||= eR.z > -1 && eR.z < 1);
              let t = ((eR.x + 1) * b.clientWidth) / 2,
                i = ((1 - eR.y) * b.clientHeight) / 2;
              (h = Math.min(h, t)),
                (c = Math.max(c, t)),
                (d = Math.min(d, i)),
                (p = Math.max(p, i));
            }
            if (
              !m ||
              c < 24 ||
              h > b.clientWidth - 24 ||
              p < 0 ||
              d > b.clientHeight
            ) {
              (g.disabled = !0), (g.style.visibility = "hidden");
              return;
            }
            let f = Math.max(48, c - h + 12),
              y = Math.max(44, p - d + 12);
            (g.style.width = `${f}px`),
              (g.style.height = `${y}px`),
              (g.style.transform = `translate(${Math.max(0, Math.min(b.clientWidth - f, (h + c - f) / 2))}px, ${(d + p - y) / 2}px)`),
              (g.style.visibility = "visible"),
              r && 0 === eN && g.focus({ preventScroll: !0 });
          },
        })
      : null,
  tc =
    ((v = () => T.bump()),
    (eE = tr.position.clone()),
    (ek = tr.quaternion.clone()),
    (eP = new iB()),
    (eF = new rr(0, 0, 0, "YXZ")),
    (eL = new iL()),
    (eB = new iF()),
    (eI = new iF()),
    (eO = new iL()),
    (eD = new rr(0, 0, 0, "YXZ")),
    (eV = 0),
    (eU = 2.7),
    (ez = -10),
    (eG = 1),
    (ej = 0),
    {
      setHover(e, t) {
        eB.set(iP.clamp(e, -1, 1), iP.clamp(t, -1, 1));
      },
      update(e, t, i, r, s = 1) {
        eI.lerp(eB, 1 - Math.exp(-12 * e)), r && t > 0 && (eV += e);
        let a =
          Math.min(2, Math.max(0, i)) *
          Math.min(1.4, Math.sqrt(Math.max(0, t) / 22.9));
        eV >= eU &&
          (r && a > 0 && v?.(),
          (ez = eV),
          (eG = 0.7 + (FU(++ej, 91) + 1) * 0.2),
          (eU = eV + 4.2 + (FU(ej, 63) + 1) * 2.1));
        let n = eV - ez,
          o = n < 0.8 ? Math.sin(38 * n) * Math.exp(-(8 * n)) * eG : 0,
          l = FU(7.7 * eV, 3),
          u = FU(11.3 * eV, 7),
          h = FU(8.9 * eV, 19);
        eP
          .set(9e-4 * l, 0.0012 * u + 0.009 * o, 4e-4 * FU(6.1 * eV, 31))
          .multiplyScalar(a),
          tr.position.copy(eE).add(eP.applyQuaternion(ek)),
          eF.set(
            (35e-5 * u + 0.0022 * o) * a,
            25e-5 * l * a,
            (5e-4 * h + 9e-4 * o) * a,
          ),
          eL.setFromEuler(eF),
          eO.setFromEuler(eD.set(0.004 * eI.y * s, -(0.008 * eI.x) * s, 0)),
          tr.quaternion.copy(ek).multiply(eO).multiply(eL);
      },
    }),
  tp =
    ((M = (to - tl) * 0.55),
    (eW = tr.position.clone()),
    (eH = new iB()),
    (eq = new iB()),
    (e$ = new iB()),
    (eX = new iB()),
    (eK = new iL()),
    (eY = new iL()),
    (eJ = !1),
    (eZ = 0),
    {
      get amount() {
        return eZ;
      },
      update(e, t, i = !1) {
        let r = Math.min(Math.max(e, 0), 0.1),
          s = t && !i ? 1 : 0;
        1e-4 > Math.abs((eZ = i ? 0 : iP.damp(eZ, s, t ? 6 : 4, r)) - s) &&
          (eZ = s),
          tn.getWorldPosition(eH),
          (eH.y += M),
          eJ ? eq.lerp(eH, 1 - Math.exp(-3 * r)) : (eq.copy(eH), (eJ = !0)),
          0 !== eZ &&
            (e$.copy(eq),
            tr.parent?.worldToLocal(e$),
            eX.copy(eW).lerp(e$, 0.18),
            tr.position.addScaledVector(eX.sub(eW), eZ),
            eK.copy(tr.quaternion),
            tr.lookAt(eq),
            eY.copy(tr.quaternion),
            tr.quaternion.copy(eK).slerp(eY, eZ));
      },
    }),
  tm = window.matchMedia("(prefers-reduced-motion: reduce)");
