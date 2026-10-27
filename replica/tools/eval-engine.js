// 跨引擎验证用：报渲染后端与几个可以被引擎差异影响的量。
// 判据是「两端在同一个引擎下结论相同」，而不是「Firefox 和 Chromium 相同」——
// 两台引擎的抗锯齿、字体光栅化本来就不同，能对齐的只有结构与几何。
(() => {
  const canvas = document.querySelector("canvas");
  const gl = document.createElement("canvas").getContext("webgl2");
  const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");
  const box = (selector) => {
    const rect = document.querySelector(selector)?.getBoundingClientRect();
    return rect ? [Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)] : null;
  };
  return {
    ua: navigator.userAgent,
    webgpu: typeof navigator.gpu !== "undefined",
    webgl2: Boolean(gl),
    renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null,
    canvas: canvas ? [canvas.width, canvas.height] : null,
    enter: box("button[data-ui-sound=page-enter]"),
    logo: box("svg[role=img]"),
    fonts: document.fonts.status,
    bodyText: document.body.innerText.replace(/\s+/g, " ").trim().slice(0, 60),
  };
})()
