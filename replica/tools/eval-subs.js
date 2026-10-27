// 盯 60 秒广播字幕（p[aria-live=polite]），记录每一次换词和时间点。
// 两侧进入场景的时刻不同，所以比的不是绝对时间，而是「播放顺序 + 停留时长」。
// 用法：shot.mjs --eval @tools/eval-subs.js --wait 1000
(async () => {
  const pick = () => document.querySelector("p[aria-live=polite]")?.textContent?.trim() ?? "";
  const start = performance.now();
  const events = [];
  let last = pick();
  events.push([0, last]);
  while (performance.now() - start < 60000) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const now = pick();
    if (now !== last) {
      last = now;
      events.push([Math.round(performance.now() - start), now]);
    }
  }
  return events;
})()
