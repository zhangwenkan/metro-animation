import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon, chevronLeft, chevronRight, close, email, github, info, xMark } from "./icons.jsx";

/**
 * i 按钮 + About & contact 面板（站点 chunk 模块 69798 里的 `C`）。
 * 关闭时是左下角 52×52 的圆，打开后宽度长到 min(440px, 100vw-32px)、圆角 26→32，
 * 三个视图 home / about / work 用 AnimatePresence popLayout 横切。
 */
const panelSpring = { type: "spring", stiffness: 460, damping: 42, mass: 1 };
const pressSpring = { type: "spring", stiffness: 430, damping: 34, mass: 0.85 };
const easeOut = [0.22, 1, 0.36, 1];
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-[#777] focus-visible:-outline-offset-2";

const works = [
  { name: "Shader Lab", href: "https://eng.basement.studio/tools/shader-lab" },
  { name: "Babble", href: "https://babble.tobis.vision/" },
  { name: "Modal", href: "https://modal.com" },
  { name: "Coinbase", href: null },
  { name: "basement.studio", href: "https://basement.studio" },
  { name: "Blackstar Inc.", href: null },
];

const contacts = [
  { label: "Email Tobi", href: "mailto:contact@tobis.vision", icon: email, size: 21 },
  { label: "GitHub", href: "https://github.com/git-chad", icon: github, size: 22 },
  { label: "X", href: "https://x.com/bewaretherat", icon: xMark, size: 19 },
];

export default function AboutPanel() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("home");
  const reduced = useReducedMotion();
  const panel = useRef(null);
  const toggle = useRef(null);
  const heading = useRef(null);
  // 键盘进入子视图时才把焦点丢给标题，鼠标点就不抢
  const moveFocus = useRef(false);
  const id = useId();

  // 打开期间才挂：点面板外面收起、Esc 收起并把焦点还给 i 按钮
  useEffect(() => {
    if (!open) return;

    const outside = (event) => {
      if (event.target instanceof Node && !panel.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      toggle.current?.focus();
    };

    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape, true);
    };
  }, [open]);

  const go = (next) => (event) => {
    moveFocus.current = event.detail === 0;
    setView(next);
  };

  return (
    <motion.div
      ref={panel}
      layout
      initial={{ opacity: 0, scale: reduced ? 1 : 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        layout: reduced ? { duration: 0 } : panelSpring,
        scale: reduced ? { duration: 0 } : { ...panelSpring, delay: 0.08 },
        opacity: { duration: 0.2 * !reduced, delay: 0.08 * !reduced, ease: easeOut },
      }}
      style={{
        width: open ? "min(440px, calc(100vw - 32px))" : 52,
        height: open ? "auto" : 52,
        borderRadius: open ? 32 : 26,
      }}
      className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-4 z-40 max-h-[calc(100dvh-32px)] overflow-hidden bg-[#f2f2f0] text-[#323230] shadow-[0_8px_32px_#00000020,0_1px_3px_#00000012,inset_0_1px_0_#ffffff]"
    >
      <motion.button
        layout="position"
        ref={toggle}
        type="button"
        aria-label={open ? "Close info" : "About & contact"}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        whileHover={reduced ? {} : { scale: 1.04 }}
        whileTap={reduced ? {} : { scale: 0.95 }}
        transition={{ layout: reduced ? { duration: 0 } : panelSpring, scale: pressSpring }}
        style={{ bottom: open ? 24 : 4, left: open ? 24 : 4 }}
        className={`absolute z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full ${
          open ? "bg-[#e5e5e2] hover:bg-[#dcdcd8]" : "hover:bg-[#e5e5e2]"
        } ${focusRing}`}
      >
        <Icon icon={open ? close : info} size={23} strokeWidth={1.6} />
      </motion.button>

      <motion.section
        layout="position"
        id={id}
        aria-label="About Tobi"
        aria-hidden={!open}
        inert={!open}
        initial={false}
        animate={{ opacity: +!!open }}
        transition={
          reduced
            ? { duration: 0 }
            : {
                layout: panelSpring,
                opacity: { duration: open ? 0.18 : 0.08, delay: 0.1 * (open ? 1 : 0), ease: easeOut },
              }
        }
        className="relative w-[min(440px,calc(100vw-32px))] pb-[84px]"
      >
        <div className="relative max-h-[calc(100dvh-132px-env(safe-area-inset-bottom))] overflow-y-auto overflow-x-hidden overscroll-contain p-4">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={view}
              className="relative"
              initial={{ opacity: 0, x: 8 * !reduced }}
              animate={{
                opacity: 1,
                x: 0,
                transition: reduced
                  ? { duration: 0 }
                  : { opacity: { duration: 0.16, delay: 0.07, ease: easeOut }, x: panelSpring },
              }}
              exit={{ opacity: 0, transition: { duration: 0.07 * !reduced } }}
              onAnimationComplete={(definition) => {
                if (
                  typeof definition === "object" &&
                  "opacity" in definition &&
                  definition.opacity === 1 &&
                  open &&
                  moveFocus.current
                ) {
                  heading.current?.focus();
                  moveFocus.current = false;
                }
              }}
            >
              {view === "home" ? (
                <>
                  <div className="px-4 pt-5 pb-8">
                    <h2
                      ref={heading}
                      tabIndex={-1}
                      className="text-[23px] tracking-[-0.04em] outline-none"
                    >
                      Tobi Moccagatta
                    </h2>
                    <p className="mt-3 text-[#686865] text-[17px] leading-[1.35] tracking-[-0.025em]">
                      Design engineer at basement.studio.
                      <br />
                      Making the web a little less boring.
                    </p>
                    <p className="mt-5 text-[#898985] text-[13px]">
                      Buenos Aires, Argentina
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { view: "about", label: "About me" },
                      { view: "work", label: "Selected work" },
                    ].map((entry) => (
                      <motion.button
                        key={entry.view}
                        aria-label={entry.label}
                        initial="rest"
                        animate="rest"
                        whileHover={reduced ? "rest" : "hover"}
                        whileFocus={reduced ? "rest" : "hover"}
                        type="button"
                        data-ui-sound="select"
                        onClick={go(entry.view)}
                        whileTap={reduced ? {} : { scale: 0.985 }}
                        transition={pressSpring}
                        className={`relative flex min-h-14 w-full cursor-pointer items-center gap-2 rounded-full text-left text-[16px] tracking-[-0.025em] ${focusRing}`}
                      >
                        <motion.span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-[#e7e7e4]"
                          variants={{ rest: { right: 0 }, hover: { right: 64 } }}
                          transition={
                            reduced
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 380, damping: 30, mass: 0.8 }
                          }
                        />
                        <span
                          aria-hidden="true"
                          className="relative flex min-h-14 min-w-0 flex-1 items-center px-4"
                        >
                          <span className="block h-6 overflow-hidden">
                            <motion.span
                              className="block"
                              variants={{ rest: { y: "0%" }, hover: { y: "-50%" } }}
                              transition={
                                reduced
                                  ? { duration: 0 }
                                  : { type: "spring", stiffness: 380, damping: 32, mass: 0.8 }
                              }
                            >
                              <span className="block h-6 leading-6">{entry.label}</span>
                              <span className="block h-6 leading-6">{entry.label}</span>
                            </motion.span>
                          </span>
                        </span>
                        <motion.span
                          aria-hidden="true"
                          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e7e7e4]"
                          variants={{ rest: { scale: 1, x: 0 }, hover: { scale: 1, x: 0 } }}
                          transition={
                            reduced
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 360, damping: 23, mass: 0.7 }
                          }
                        >
                          <motion.span
                            className="flex"
                            variants={{ rest: { x: 0 }, hover: { x: 1.5 } }}
                            transition={pressSpring}
                          >
                            <Icon icon={chevronRight} size={18} strokeWidth={1.6} />
                          </motion.span>
                        </motion.span>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-5 flex items-center gap-2 px-1 pt-2">
                    <button
                      type="button"
                      aria-label="Back to info"
                      data-ui-sound="select"
                      onClick={go("home")}
                      className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-[#e5e5e2] ${focusRing}`}
                    >
                      <Icon icon={chevronLeft} size={20} strokeWidth={1.6} />
                    </button>
                    <h2
                      ref={heading}
                      tabIndex={-1}
                      className="text-[22px] tracking-[-0.035em] outline-none"
                    >
                      {view === "about" ? "About me" : "Selected work"}
                    </h2>
                  </div>

                  {view === "about" && (
                    <div className="flex flex-col gap-5 px-4 text-[#686865] text-[17px] leading-[1.4] tracking-[-0.025em]">
                      <p>
                        I was getting burnt out. Work had become repetitive, and I missed
                        figuring things out and learning something new.
                      </p>
                      <p>
                        This project gives me room to do that. I’m trying things I haven’t done
                        before, getting absorbed in the details, and taking my time with it.
                      </p>
                      <p className="text-[#323230]">Mostly websites. Sometimes things like this.</p>
                    </div>
                  )}

                  {view === "work" && (
                    <ul className="space-y-1">
                      {works.map((item) => (
                        <li key={item.name}>
                          {item.href ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex min-h-[50px] items-center justify-between rounded-[16px] px-4 text-[17px] tracking-[-0.025em] hover:bg-[#e5e5e2] active:bg-[#dcdcd8] ${focusRing}`}
                            >
                              {item.name}
                              <Icon
                                icon={chevronRight}
                                size={17}
                                strokeWidth={1.6}
                                className="text-[#92928d]"
                              />
                            </a>
                          ) : (
                            <span className="flex min-h-[50px] items-center px-4 text-[17px] tracking-[-0.025em]">
                              {item.name}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <nav
          aria-label="Contact Tobi"
          className="absolute right-6 bottom-6 flex items-center gap-2"
        >
          {contacts.map((contact) => (
            <motion.a
              key={contact.label}
              href={contact.href}
              aria-label={contact.label}
              target={contact.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer"
              whileHover={reduced ? {} : { scale: 1.07 }}
              whileTap={reduced ? {} : { scale: 0.92 }}
              transition={pressSpring}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-[#656561] hover:bg-[#e5e5e2] hover:text-[#323230] ${focusRing}`}
            >
              <Icon icon={contact.icon} size={contact.size} strokeWidth={1.6} />
            </motion.a>
          ))}
        </nav>
      </motion.section>
    </motion.div>
  );
}
