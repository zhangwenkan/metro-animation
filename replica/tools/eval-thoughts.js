// 盯 45 秒想法气泡（折叠态），记录每次换词和时间点。
// 想法是随机轮换的，比的是「出现过哪些句子 + 每句停留多久」，不是顺序。
// 用法：shot.mjs --eval @tools/eval-thoughts.js --wait 500（不要再点气泡，否则会进对话）
(async () => {
  const box = "div[class*='w-[min(280px']";
  const pick = () => document.querySelector(box)?.innerText?.replace(/\s+/g, " ").trim() ?? "";
  const start = performance.now();
  const events = [];
  let last = pick();
  events.push([0, last]);
  while (performance.now() - start < 45000) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const now = pick();
    if (now !== last) {
      last = now;
      events.push([Math.round(performance.now() - start), now]);
    }
  }
  return events;
})()
