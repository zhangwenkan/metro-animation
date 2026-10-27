// 触屏路径的状态快照：既要确认「点到了、状态变了」，也要确认媒体查询跟着变。
// 站点靠 pointerdown 判「点面板外面就收回」，所以触屏和鼠标走的不是同一条路径。
(() => {
  const box = document.querySelector("div[class*='w-[min(280px']");
  const section = box?.querySelector("section[aria-label^=Ajo]");
  const dialog = document.querySelector("dialog");
  return {
    maxTouchPoints: navigator.maxTouchPoints,
    coarse: matchMedia("(pointer: coarse)").matches,
    hover: matchMedia("(hover: hover)").matches,
    // 入场页还在不在 = Enter 那一下有没有生效（点不到就还盖着白底）
    entry: !!document.querySelector("section[aria-label='Ajo was here']"),
    shellFocused: document.activeElement?.tagName === "DIV" && document.activeElement?.tabIndex === -1,
    bubbleOpen: !!box?.querySelector("button[data-ui-sound=expand]"),
    reply: section?.querySelector("p span.sr-only")?.textContent?.trim() ?? null,
    choices: [...(box?.querySelectorAll("button[data-ui-sound=select]") ?? [])].map((el) =>
      el.textContent.trim(),
    ),
    dialogOpen: dialog ? dialog.open : null,
  };
})()
