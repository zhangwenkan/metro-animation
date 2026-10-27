// 盯 12 秒标签页图标链接的 href，记录每一次翻面（睁眼/闭眼）。
// 站点与复刻都用 link[data-ajo-blink] 标自己，找不到就把所有 icon 链出来。
// 用法：shot.mjs --eval @tools/eval-favicon.js --wait 1000
(async () => {
  const link =
    document.querySelector("link[data-ajo-blink]") ??
    [...document.querySelectorAll("link[rel=icon]")].find((el) => el.href.includes("ajo-"));

  if (!link) {
    return { found: false, icons: [...document.querySelectorAll("link[rel=icon]")].map((el) => el.href) };
  }

  const start = performance.now();
  const events = [];
  let last = link.href;
  while (performance.now() - start < 12000) {
    if (link.href !== last) {
      last = link.href;
      events.push([Math.round(performance.now() - start), last.split("/").pop()]);
    }
    await new Promise((resolve) => setTimeout(resolve, 12));
  }
  return { found: true, sizes: link.getAttribute("sizes"), events };
})()
