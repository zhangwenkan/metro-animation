/**
 * 对话/播报用到的三个小零件（站点 chunk 里的 FC / FE / FB）：
 * 猫头、三点 listening 指示、黄字斜体字幕。
 *
 * 类名保持站点 CSS module 的哈希名，样式在 styles.css 里，两边对得上。
 */
export function AjoFace({ label = "Ajo" }) {
  return (
    <img
      src="/assets/favicon/ajo-open.svg"
      alt={label}
      width={28}
      height={28}
      draggable={false}
      className="block size-7 shrink-0 select-none"
    />
  );
}

/** 广播念台词的时候，Ajo 先听着，不进合成器 */
export function ListeningDots() {
  return (
    <output className="flex h-5 items-center gap-1.5 text-[#85857e]">
      <span className="sr-only">Listening to the announcement</span>
      {[0, 1, 2].map((index) => (
        <span
          aria-hidden="true"
          key={index}
          className="listening-indicator-module__3H1sLa__dot h-1.5 w-1.5 rounded-full bg-current"
          style={{ animationDelay: `${-0.16 * index}s` }}
        />
      ))}
    </output>
  );
}

export function Subtitle({ text }) {
  return (
    <p
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none mx-auto max-w-[48ch] text-balance text-center text-[#ffe373] text-[clamp(18px,1.45vw,22px)] italic leading-[1.15] tracking-[-0.025em] [-webkit-text-stroke:1px_#242019] [paint-order:stroke_fill] [text-shadow:0_1px_2px_#000,0_2px_8px_#0009]"
    >
      {text}
    </p>
  );
}
