// 首屏字体时序探针：必须在页面任何脚本之前注入（shot.mjs --init-eval）。
//
// 记录三件事：
//   1. 每一帧 Enter 按钮的盒子尺寸 —— font-display:swap 生效时，文字会先用
//      fallback 字体量出来、再在字体到达的瞬间换度量，盒子宽度会跳一次；
//      跳变有没有、跳了几次、跳多大，就是 FOUT 的客观证据。
//   2. document.fonts 的状态迁移（loading -> loaded）以及 ready 的时刻。
//   3. paint / largest-contentful-paint / layout-shift 的原始条目。
(() => {
  const state = {
    frames: [],
    fontEvents: [],
    paints: [],
    lcp: [],
    shifts: [],
    readyAt: null,
  };
  window.__fontProbe = state;

  if ("PerformanceObserver" in window) {
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) state.lcp.push([Math.round(entry.startTime), Math.round(entry.size)]);
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          state.shifts.push([Math.round(entry.startTime), Math.round(entry.value * 10000) / 10000]);
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {}
  }

  const start = () => {
    for (const entry of performance.getEntriesByType("paint")) {
      state.paints.push([entry.name, Math.round(entry.startTime)]);
    }
    document.fonts.addEventListener("loadingdone", () => state.fontEvents.push([Math.round(performance.now()), "loadingdone"]));
    document.fonts.ready.then(() => {
      state.readyAt = Math.round(performance.now());
    });

    let last = "";
    const tick = () => {
      const button = document.querySelector("button[data-ui-sound=page-enter]");
      if (button) {
        const rect = button.getBoundingClientRect();
        // 尺寸 + 当前字体状态一起记，只在变化时落盘，避免几千条样本
        const row = [Math.round(performance.now()), Math.round(rect.width * 100) / 100, Math.round(rect.height * 100) / 100, document.fonts.status];
        const key = row.slice(1).join("|");
        if (key !== last) {
          state.frames.push(row);
          last = key;
        }
      }
      if (performance.now() < 8000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
