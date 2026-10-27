/* ===== 07-audio-engine.js =====
 * Web Audio 引擎：buffer 总线 / 无缝循环自拼接 / 广播 cues 与 ducking
 * 来源: tobis.vision /_next/static/immutable/chunks/1reeeg5qme_uu.js  offset 1521031-1525364
 * 说明: 站点原始代码经 Turbopack 压缩与混淆，变量名已被重命名，此处仅做切分与格式化，逻辑未改动。
 * 变量名对照见 ref/source/00-name-map.js
 */
let T = (function (e, t) {
  let i = new AudioContext(),
    r = i.createGain();
  (r.gain.value = 0), r.connect(i.destination);
  let s = i.createGain();
  (s.gain.value = 1), s.connect(r);
  let a = i.createGain();
  (a.gain.value = 0), a.connect(r);
  let n = i.createGain();
  (n.gain.value = 1), n.connect(a);
  let o = {
    "ajo-morning": i.createGain(),
    "carriage-loop": i.createGain(),
    bump: i.createGain(),
    "newspaper-pickup": i.createGain(),
    "station-announcement": i.createGain(),
    "cat-disclaimer": i.createGain(),
  };
  for (let [e, t] of Object.entries(o))
    "ajo-morning" === e
      ? t.connect(n)
      : t.connect("carriage-loop" === e ? s : r);
  (o["carriage-loop"].gain.value = 0.58),
    (o["ajo-morning"].gain.value = 0.1),
    (o.bump.gain.value = 1),
    (o["station-announcement"].gain.value = 0.24),
    (o["cat-disclaimer"].gain.value = 0.24);
  let l = new Map(),
    u = new AbortController(),
    h = !1,
    d = !1,
    c = !1,
    p = !1,
    m = !0,
    g = !1,
    f = !1,
    b = 1 / 0,
    y = "station-announcement",
    x = !0,
    v = 0,
    _ = 0,
    T = !1,
    w = !1,
    S = new Set(),
    M = !1,
    A = 1 / 0,
    N = "general",
    C = 0,
    R = "",
    E = (e) => {
      e !== R && ((R = e), t?.(e));
    },
    k = !1,
    P = () => {
      h ||
        (k
          ? e?.("unavailable")
          : c
            ? e?.("muted")
            : e?.("running" === i.state ? "playing" : "blocked"));
    },
    F = () => {
      h ||
        (!(p && m) || c || document.hidden
          ? (E(""), "running" === i.state && i.suspend().then(P))
          : i.resume().then(P).catch(P));
    },
    L = () => F(),
    B = () => F();
  document.addEventListener("pointerdown", L),
    document.addEventListener("keydown", L),
    document.addEventListener("visibilitychange", B),
    i.addEventListener("statechange", P);
  let I = Promise.all(
    [
      "carriage-loop",
      "bump",
      "station-announcement",
      "cat-disclaimer",
      "newspaper-pickup",
    ].map(async (e) => {
      let t = await fetch(`/assets/train/audio/${e}.ogg`, { signal: u.signal });
      if (!t.ok) throw Error(`Unable to load ${e}`);
      let r = await i.decodeAudioData(await t.arrayBuffer());
      l.set(
        e,
        "carriage-loop" === e
          ? (function (e, t, i = 1) {
              let r = Math.min(
                Math.floor(t.length / 4),
                Math.round(i * t.sampleRate),
              );
              if (r < 2) return t;
              let s = t.length - r,
                a = e.createBuffer(t.numberOfChannels, s, t.sampleRate);
              for (let e = 0; e < t.numberOfChannels; e++) {
                let i = t.getChannelData(e),
                  n = a.getChannelData(e);
                n.set(i.subarray(r, s));
                for (let e = 0; e < r; e++) {
                  let t = (e / (r - 1)) * Math.PI * 0.5;
                  n[s - r + e] = i[s + e] * Math.cos(t) + i[e] * Math.sin(t);
                }
              }
              return a;
            })(i, r)
          : r,
      );
    }),
  )
    .then(() => {
      d = !0;
    })
    .catch(() => {
      (k = !0), P();
    });
  function O(e, t, r = !1) {
    let s = i.createBufferSource();
    (s.buffer = l.get(e)), (s.loop = r);
    let a = i.createGain();
    return (
      (a.gain.value = t),
      s.connect(a),
      a.connect(o[e]),
      (s.onended = () => {
        s.disconnect(), a.disconnect();
      }),
      s.start(),
      s.buffer.duration
    );
  }
  return (
    fetch("/assets/train/audio/ajo-morning.ogg", { signal: u.signal })
      .then(async (e) => {
        if (!e.ok) throw Error("Unable to load train music");
        let t = await i.decodeAudioData(await e.arrayBuffer());
        h || l.set("ajo-morning", t);
      })
      .catch(() => {}),
    {
      loaded: I,
      onWorldEvent: (e) => (
        S.add(e),
        () => {
          S.delete(e);
        }
      ),
      getContext: () => i,
      isAnnouncing: () => i.currentTime < v,
      hasHeardCatDisclaimer: () => i.currentTime >= A,
      setDialogueSpeaking(e) {
        w = e;
      },
      setVolumes(e) {
        let t = {
          "ajo-morning": e.music,
          "carriage-loop": e.carriage,
          bump: e.bump,
          "station-announcement": e.station,
          "cat-disclaimer": e.cat,
          "newspaper-pickup": 100,
        };
        for (let e of Object.keys(o)) {
          let r = Math.min(1, Math.max(0, t[e] / 100));
          o[e].gain.setTargetAtTime(r, i.currentTime, 0.02);
        }
      },
      start() {
        p ||
          ((p = !0),
          r.gain.setValueAtTime(0, i.currentTime),
          r.gain.linearRampToValueAtTime(0.8, i.currentTime + 1.4)),
          F();
      },
      toggle() {
        (c = !c), F(), P();
      },
      update(e) {
        var t, r;
        let o;
        if (
          (m !== e && ((m = e), F()),
          !(p && d && m) || c || document.hidden || "running" !== i.state)
        )
          return void E("");
        let u = i.currentTime;
        if (
          (!f &&
            l.has("ajo-morning") &&
            ((f = !0),
            a.gain.setValueAtTime(0, u),
            a.gain.linearRampToValueAtTime(1, u + 4),
            O("ajo-morning", 1, !0)),
          M && u >= A)
        )
          for (let e of ((M = !1), S)) e("cat_disclaimer_finished");
        g || ((g = !0), O("carriage-loop", 1, !0), (b = u + 3)),
          u >= b &&
            !w &&
            ((N = "cat-disclaimer" === y ? "cat" : "general"),
            (C = u),
            (v = u + O(y, 1)),
            "cat-disclaimer" === y && ((A = v), (M = !0)),
            x
              ? ((x = !1),
                (y = "cat-disclaimer"),
                (b = v + 4 + 2 * Math.random()))
              : ((y =
                  "cat-disclaimer" === y
                    ? "station-announcement"
                    : "cat-disclaimer"),
                (b = v + 60 + 40 * Math.random()))),
          E(
            u < v
              ? ((t = N),
                (r = u - C),
                (o = FO[t].cues),
                [...o].reverse().find((e) => r >= e.start)?.en ?? "")
              : "",
          );
        let h = u < v || w;
        h !== T &&
          ((T = h),
          s.gain.setTargetAtTime(h ? 0.22 / 0.45 : 1, u, 0.15),
          n.gain.setTargetAtTime(h ? 0.35 : 1, u, h ? 0.2 : 0.8));
      },
      pickupNewspaper() {
        d && !c && m && "running" === i.state && O("newspaper-pickup", 0.6);
      },
      bump() {
        if (!(g && m) || c || document.hidden || "running" !== i.state) return;
        let e = i.currentTime;
        e < _ || (_ = e + O("bump", e < v ? 0.35 / 0.6 : 1));
      },
      dispose() {
        (h = !0),
          S.clear(),
          u.abort(),
          document.removeEventListener("pointerdown", L),
          document.removeEventListener("keydown", L),
          document.removeEventListener("visibilitychange", B),
          i.removeEventListener("statechange", P),
          i.close();
      },
    }
  );
})(void 0, d);
(m.current = T), (e.current = () => T.start());
