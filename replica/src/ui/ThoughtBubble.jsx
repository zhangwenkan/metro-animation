import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ListeningDots, AjoFace } from "./speechParts.jsx";

/**
 * Ajo 的想法气泡（对应 ref/source/18-thought-bubble.js 里的 FL）
 *
 * 一个组件同时承担两种形态：
 * - 只有 thought：一个圆角药丸按钮，点了才开口（带一只小尾巴，两团泡泡图案）
 * - 有 text：变成对话面板，左上角猫头、正文逐词淡入，尾巴换成实心三角
 * 关心面板时用 pointerdown 判是否点在面板外，Escape 也关。
 *
 * 站点用 CSS module 生成哈希类名，这里照抄同一串，样式在 styles.css 里。
 */
const CONTENT = "text-reveal-module__GYHhaq__content";

// 面板自身用柔一点的弹簧，进出用略带回弹的缓动
const PANEL_SPRING = { type: "spring", stiffness: 420, damping: 23, mass: 0.7 };
const REVEAL_EASE = { duration: 0.24, ease: [0.22, 1.12, 0.36, 1] };

export default function ThoughtBubble({
  thought,
  text,
  words,
  status = "Ajo",
  listening = false,
  choices,
  onActivate,
  onDismiss,
  buttonRef,
  onContentReady,
}) {
  const reduced = useReducedMotion();
  const spring = reduced ? { duration: 0 } : PANEL_SPRING;
  const ease = reduced ? { duration: 0 } : REVEAL_EASE;
  const panel = useRef(null);
  const root = useRef(null);

  // 展开状态下，点面板外面或按 Esc 都收回去
  useEffect(() => {
    if (!text) return;
    const onPointerDown = (event) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) onDismiss();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") onDismiss();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [text, onDismiss]);

  // 展开后把焦点挪进面板，键盘用户能直接读屏
  useEffect(() => {
    if (text) panel.current?.focus({ preventScroll: true });
  }, [text]);

  return (
    <motion.div
      ref={root}
      initial={{ opacity: 0, scale: reduced ? 1 : 0.96, y: 5 * !reduced }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={ease}
      style={{ transformOrigin: "calc(100% - 28px) bottom" }}
      className={text && !listening ? "relative w-full" : "relative ml-auto w-fit max-w-full"}
    >
      <motion.div
        transition={{ ...spring, layout: ease }}
        animate={{ scale: 1, y: 0 }}
        whileHover={{ scale: text || reduced ? 1 : 1.025, y: text || reduced ? 0 : -2 }}
        whileTap={{ scale: text || reduced ? 1 : 0.94, y: Number(!text && !reduced) }}
        className="relative text-[#343430] drop-shadow-[0_3px_6px_#00000018]"
      >
        <motion.div
          layout
          transition={ease}
          style={{ borderRadius: text ? "24px 24px 20px 24px" : "28px" }}
          className="relative overflow-hidden bg-[#f2f2ef] shadow-[inset_0_1px_0_#ffffffb3]"
        >
          {text ? (
            <section
              ref={panel}
              tabIndex={-1}
              aria-label="Ajo’s reply"
              className="relative min-w-[112px] px-5 pt-4 pb-5 focus:outline-none"
            >
              <div className={`${CONTENT} mb-2 flex items-center`}>
                <AjoFace label={status} />
              </div>
              <p
                key={listening ? "listening" : text}
                aria-live="polite"
                onAnimationEnd={(event) => {
                  // 面板的 reveal 动画放完才让合成器开口，声音不会抢在字前面
                  if (event.target === event.currentTarget) onContentReady?.();
                }}
                className={`${CONTENT} text-[18px] leading-[1.22] tracking-[-0.03em]`}
              >
                {listening && <ListeningDots />}
                {!listening &&
                  (words ? (
                    <>
                      <span className="sr-only">{text}</span>
                      <span aria-hidden="true">
                        {words.chunks.map((chunk, index) => (
                          <span
                            key={`${index}-${chunk}`}
                            style={{ opacity: Number(index < words.revealed) }}
                            className="transition-opacity duration-[90ms] motion-reduce:transition-none"
                          >
                            {chunk}
                          </span>
                        ))}
                      </span>
                    </>
                  ) : (
                    text
                  ))}
              </p>
            </section>
          ) : (
            <button
              key="thought"
              ref={buttonRef}
              type="button"
              onClick={onActivate}
              data-ui-sound="expand"
              className={`${CONTENT} relative block w-full cursor-pointer rounded-full px-5 py-4 text-left text-[17px] leading-[1.15] tracking-[-0.03em] focus-visible:outline-2 focus-visible:outline-[#777] focus-visible:-outline-offset-4`}
            >
              {thought}
            </button>
          )}
        </motion.div>

        {/* 尾巴：药丸形态是一颗椭圆加一颗小圆，面板形态是一块三角 */}
        <AnimatePresence initial={false} mode="wait">
          {text ? (
            <motion.svg
              key="tail"
              aria-hidden="true"
              width="25"
              height="18"
              viewBox="0 0 25 18"
              className="absolute right-7 -bottom-[15px] overflow-visible text-[#f2f2ef]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 * !reduced }}
            >
              <path fill="currentColor" d="M0 0H25C21 5 18 12 8 17C12 9 8 4 0 0Z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="thought-tail"
              aria-hidden="true"
              width="35"
              height="30"
              viewBox="0 0 35 30"
              className="absolute right-4 -bottom-7 text-[#f2f2ef]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 * !reduced }}
            >
              <ellipse fill="currentColor" cx="10" cy="10" rx="5.5" ry="4.5" />
              <circle fill="currentColor" cx="22" cy="23" r="2.5" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 选项只在台词念完之后长出来，逐条错开 35ms */}
      <motion.div
        layout
        transition={spring}
        className={`relative flex flex-col items-start gap-2 pl-2 ${text ? "mt-7" : ""}`}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {text &&
            choices.map((choice, index) => (
              <motion.button
                key={choice.id}
                layout="position"
                type="button"
                onClick={choice.onClick}
                data-ui-sound="select"
                initial={{ opacity: 0, y: reduced ? 0 : -8, scale: reduced ? 1 : 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, pointerEvents: "none", y: reduced ? 0 : -4, scale: reduced ? 1 : 0.97 }}
                whileHover={{ x: 3 * !reduced, scale: reduced ? 1 : 1.025 }}
                whileTap={{ scale: reduced ? 1 : 0.94 }}
                transition={{
                  ...spring,
                  delay: reduced ? 0 : 0.36 + 0.035 * index,
                  opacity: { duration: 0.12 * !reduced },
                }}
                className="max-w-full cursor-pointer rounded-[16px] bg-[#e5e5e1] px-4 py-3 text-left text-[#464640] text-[13px] leading-[1.15] tracking-[-0.02em] shadow-[0_3px_10px_#00000015] hover:bg-[#f4f4f1] focus-visible:outline-2 focus-visible:outline-[#777] focus-visible:outline-offset-3"
              >
                {choice.text}
              </motion.button>
            ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}