import { useRef } from "react";
import AjoLogo from "./AjoLogo.jsx";

/**
 * 入场页（站点 chunk 模块 69798 里的 `c`，SSR 直出在 index.html 的 <body> 里）。
 * 白底盖住车厢，场景在下面照常加载；按 Enter 后 inner 走 depart、section 走 reveal，
 * section 自己的 animationend 就是「可以卸载入口页」的信号。
 */
export default function EntryScreen({ ready, entered, error, onEnter, onRevealed }) {
  const enterButton = useRef(null);

  return (
    <section
      aria-label="Ajo was here"
      className={`fixed inset-0 z-50 flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-white text-[#292929] ${
        entered ? "entry-reveal" : ""
      }`}
      onAnimationEnd={(event) => {
        // 子元素的 depart 也会冒泡上来，站点用 target===currentTarget 过滤掉
        if (event.target === event.currentTarget && entered) onRevealed();
      }}
    >
      <div
        className={`flex w-full -translate-y-4 flex-col items-center px-8 ${
          entered ? "entry-depart" : ""
        }`}
      >
        <AjoLogo />
        <button
          ref={enterButton}
          data-ui-sound="page-enter"
          type="button"
          disabled={!ready || entered || !!error}
          onClick={() => {
            enterButton.current?.blur();
            onEnter();
          }}
          className="mt-8 min-h-11 rounded-full bg-[#f2f2f0] px-7 py-2.5 text-[17px] shadow-[0_1px_3px_#0000000d,inset_0_1px_0_#ffffff] transition-[transform,background-color,opacity] duration-150 hover:scale-[1.04] hover:bg-[#e8e8e5] focus-visible:outline-2 focus-visible:outline-[#3764f7] focus-visible:outline-offset-4 active:scale-[0.96] disabled:cursor-default disabled:opacity-40 disabled:hover:scale-100 motion-reduce:transform-none"
        >
          Enter
        </button>
      </div>

      {!entered && (
        <div className="absolute inset-x-0 bottom-[max(24px,env(safe-area-inset-bottom))] flex flex-col items-center">
          {error && (
            <p
              role="alert"
              className="max-w-60 pb-2 text-center text-[#73736f] text-[13px]"
            >
              Couldn't open the carriage. Please try again.
              <button
                type="button"
                className="mt-2 block w-full underline underline-offset-4"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </p>
          )}
          {!ready && !error && (
            <output>
              <span className="sr-only">Loading</span>
              <span aria-hidden="true" className="entry-runner" />
            </output>
          )}
        </div>
      )}
    </section>
  );
}
