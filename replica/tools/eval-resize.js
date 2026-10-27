(() => {
  const box = (el) => {
    const rect = el?.getBoundingClientRect();
    return rect
      ? [Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)]
      : null;
  };
  const canvas = document.querySelector("canvas");
  const bubble = document.querySelector("div[class*='w-[min(280px']");
  return {
    viewport: [innerWidth, innerHeight],
    dpr: devicePixelRatio,
    canvas: canvas ? [canvas.width, canvas.height] : null,
    canvasBox: box(canvas),
    // 想法气泡坐在 3D 投影锚点上，它的位置能同时反映相机跟随和 DOM 叠层定位
    bubble: bubble ? [box(bubble), bubble.innerText.trim().slice(0, 24)] : null,
    about: box(document.querySelector("[data-ui-sound=select]")),
    info: box(document.querySelector("button[aria-label^='Open info']")),
  };
})()
