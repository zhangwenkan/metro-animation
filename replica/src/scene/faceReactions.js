/**
 * 猫的情绪状态机（对应 ref/source/09-cat-reactions.js）
 *
 * 把「剧情事件」翻译成表情图集的格子，并管住持续时间：
 * 非 Neutral 的表情维持 2.4 秒后自己回到 Neutral，work_easy 是个例外
 * （笑到 finish 或者 clear 为止）。眨眼仍然由每个材质自己的 update 走。
 */
export function createFaceReactions(faceMaterials) {
  let timer = 0;

  const apply = (expression) => {
    for (const face of faceMaterials) face.setExpression(expression);
  };

  const pick = ({ nodeId, mood }) => {
    if (nodeId === "work_easy") return "Laughing";
    if (nodeId === "newspaper_photo") return "Surprised";
    if (nodeId === "newspaper_nice") return "Happy";
    if (mood === "irritated") return "Annoyed";
    if (nodeId === "seeds" || nodeId === "operator_support") return "Happy";
    if (
      ["operator", "operator_reply", "ticket_tease", "private", "awake"].includes(nodeId)
    ) {
      return "Skeptical";
    }
    if (mood === "tired" || nodeId === "night" || nodeId === "rest") return "Tired";
    if (nodeId === "food_preference" && mood === "warmer") return "Happy";
    return "Neutral";
  };

  return {
    react(event) {
      const expression = pick(event);
      apply(expression);
      timer = 2.4 * Number(expression !== "Neutral");
      if (event.nodeId === "work_easy") timer = Infinity;
    },

    /** 逐词回调：讲到第三个词时从 Laughing 换成 Happy */
    word(nodeId, index) {
      if (nodeId === "work_easy" && index === 2) apply("Happy");
    },

    finish(nodeId) {
      if (nodeId === "work_easy") timer = 1.2;
    },

    clear() {
      timer = 0;
      apply("Neutral");
    },

    update(dt) {
      if (timer > 0 && (timer = Math.max(0, timer - Math.max(0, dt))) === 0) apply("Neutral");
      // 表情只是 uv 偏移，眨眼还得每帧推进
      for (const face of faceMaterials) face.update(dt);
    },
  };
}
