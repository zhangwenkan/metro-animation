import { useEffect, useRef } from "react";
import logo from "./ajoLogoData.js";

/**
 * 站点首屏的 ajo was here 字标（模块 69798 的 `a`）：
 * 底下一条蓝色不规则形状 + 12 组白色字母 path，鼠标进入时字母按 38ms 依次跳一下。
 * path 数据由 tools/extract-assets.mjs 从 chunk 里还原，和站点逐字相同。
 */
export default function AjoLogo() {
  const svg = useRef(null);
  const running = useRef([]);

  useEffect(
    () => () => {
      for (const animation of running.current) animation.cancel();
    },
    [],
  );

  const wave = (event) => {
    // 站点只在真实鼠标、非 reduced-motion、且上一轮动画没跑完时触发
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (running.current.some((animation) => animation.playState === "running")) return;

    running.current = Array.from(svg.current?.querySelectorAll("g") ?? []).map((group, index) =>
      group.animate(
        [
          { transform: "translateY(0)", offset: 0 },
          { transform: "translateY(-12px)", offset: 0.3 },
          { transform: "translateY(2px)", offset: 0.65 },
          { transform: "translateY(0)", offset: 1 },
        ],
        { duration: 420, delay: 38 * index, easing: "cubic-bezier(0.33, 0, 0.2, 1)" },
      ),
    );
  };

  return (
    <svg
      ref={svg}
      role="img"
      aria-label="ajo was here"
      width={1000}
      height={730}
      viewBox="0 0 1000 730"
      className="h-auto w-[min(64vw,420px)]"
      onPointerEnter={wave}
    >
      <title>ajo was here</title>
      <path d={logo.background} fill="#3764f7" />
      {logo.letters.map((group, index) => (
        <g key={group[0]?.d ?? index}>
          {group.map((path) => (
            <path key={path.d} d={path.d} fill={path.fill} />
          ))}
        </g>
      ))}
    </svg>
  );
}
