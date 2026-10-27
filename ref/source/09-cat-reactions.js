/* ===== 09-cat-reactions.js =====
 * 猫的情绪状态机：事件 → 表情 + 持续时间（配合 3D 表情图集）
 * 来源: tobis.vision /_next/static/immutable/chunks/1reeeg5qme_uu.js  offset 1520267-1521031
 * 说明: 站点原始代码经 Turbopack 压缩与混淆，变量名已被重命名，此处仅做切分与格式化，逻辑未改动。
 * 变量名对照见 ref/source/00-name-map.js
 */
let y = [],
  _ = (function (e) {
    let t = 0;
    function i(t) {
      for (let i of e) i.setExpression(t);
    }
    return {
      react(e) {
        let r = (function ({ nodeId: e, mood: t }) {
          return "work_easy" === e
            ? "Laughing"
            : "newspaper_photo" === e
              ? "Surprised"
              : "newspaper_nice" === e
                ? "Happy"
                : "irritated" === t
                  ? "Annoyed"
                  : "seeds" === e || "operator_support" === e
                    ? "Happy"
                    : [
                          "operator",
                          "operator_reply",
                          "ticket_tease",
                          "private",
                          "awake",
                        ].includes(e)
                      ? "Skeptical"
                      : "tired" === t || "night" === e || "rest" === e
                        ? "Tired"
                        : "food_preference" === e && "warmer" === t
                          ? "Happy"
                          : "Neutral";
        })(e);
        i(r),
          (t = 2.4 * ("Neutral" !== r)),
          "work_easy" === e.nodeId && (t = 1 / 0);
      },
      word(e, t) {
        "work_easy" === e && 2 === t && i("Happy");
      },
      finish(e) {
        "work_easy" === e && (t = 1.2);
      },
      clear() {
        (t = 0), i("Neutral");
      },
      update(r) {
        for (let s of (t > 0 &&
          0 === (t = Math.max(0, t - Math.max(0, r))) &&
          i("Neutral"),
        e))
          s.update(r);
      },
    };
  })(y);
g.current = _;
