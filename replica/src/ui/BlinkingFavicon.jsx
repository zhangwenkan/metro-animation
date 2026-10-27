import { useEffect } from "react";

const OPEN = "/assets/favicon/ajo-open.png";
const CLOSED = "/assets/favicon/ajo-closed.png";

/**
 * 对应站点模块 78640（BlinkingFavicon）：标签页图标会眨眼。
 *
 * 3~6 秒随机眨一次，闭眼 70ms；25% 的概率连眨两下（第二下隔 110ms）。
 * 页面不可见或 prefers-reduced-motion 时不眨，只留睁眼图标。
 * 两张图都 decode 完才开始，否则会闪一帧空白图标。
 */
export default function BlinkingFavicon() {
  useEffect(() => {
    let timer = null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    // 站点原文是 link.sizes.value = "32x32"，效果等同 setAttribute
    link.setAttribute("sizes", "32x32");
    link.dataset.ajoBlink = "true";

    let alive = true;
    let ready = false;

    const paint = (href) => {
      if (!ready || !alive) return;
      link.href = href;
      document.head.append(link);
    };

    const schedule = () => {
      clearTimeout(timer);
      paint(OPEN);
      if (alive && ready && !reducedMotion.matches && !document.hidden) {
        timer = setTimeout(() => blink(Math.random() < 0.25), 3000 + 3000 * Math.random());
      }
    };

    const blink = (again) => {
      if (!alive || document.hidden || reducedMotion.matches) return schedule();
      paint(CLOSED);
      timer = setTimeout(() => {
        paint(OPEN);
        if (again) timer = setTimeout(() => blink(false), 110);
        else schedule();
      }, 70);
    };

    Promise.all(
      [OPEN, CLOSED].map((src) => {
        const image = new Image();
        image.src = src;
        return image.decode();
      }),
    )
      .then(() => {
        if (!alive) return;
        ready = true;
        schedule();
      })
      .catch(() => {});

    document.addEventListener("visibilitychange", schedule);
    reducedMotion.addEventListener("change", schedule);

    return () => {
      alive = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", schedule);
      reducedMotion.removeEventListener("change", schedule);
      link.remove();
    };
  }, []);

  return null;
}
