// 焦点落点的详细快照：谁被聚焦、它挂在哪几层容器里、想法气泡现在有没有字。
// 配合 shot.mjs 用：--eval @tools/eval-focus.js
(() => {
  const info = (node) =>
    node
      ? {
          tag: node.tagName,
          label: node.getAttribute?.("aria-label") ?? null,
          role: node.getAttribute?.("role") ?? null,
          text: node.textContent?.replace(/\s+/g, " ").trim().slice(0, 50) ?? null,
        }
      : null;

  const chain = [];
  for (let node = document.activeElement, depth = 0; node && depth < 3; depth++) {
    chain.push(info(node));
    node = node.parentElement;
  }

  return {
    focus: chain,
    thought: document.querySelector("div[class*='w-[min(280px']")?.innerText?.trim().slice(0, 60) ?? null,
    about: document.querySelector("section[aria-label='About Tobi']")?.getAttribute("aria-hidden") ?? "n/a",
    subtitle: document.querySelector("p[class*='subtitle'], [aria-live=polite]")?.textContent?.trim().slice(0, 50) ?? null,
  };
})()
