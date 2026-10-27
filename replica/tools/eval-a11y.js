// 无障碍相关的「活区」（live region）与 body 顶层容器快照。
// AX 树只告诉你有一个空的 role=alert，具体是哪个 div、怎么定位的，得回 DOM 看。
(() => {
  const pick = (el) => {
    const style = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role"),
      live: el.getAttribute("aria-live"),
      atomic: el.getAttribute("aria-atomic"),
      label: el.getAttribute("aria-label"),
      hidden: el.getAttribute("aria-hidden"),
      inert: el.hasAttribute("inert"),
      text: (el.innerText ?? "").trim().slice(0, 60),
      cls: String(el.className ?? "").slice(0, 140),
      box: [Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)],
      style: [style.position, style.zIndex, style.display, style.visibility, style.opacity].join("|"),
    };
  };
  return {
    liveRegions: [...document.querySelectorAll("[role=alert],[role=status],[aria-live]")].map(pick),
    bodyChildren: [...document.body.children].map(pick),
    lang: document.documentElement.lang,
    title: document.title,
  };
})()
