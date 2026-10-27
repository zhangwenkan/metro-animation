import { useEffect, useRef, useState } from "react";
import { motion, useIsPresent, useReducedMotion } from "motion/react";
import { createSpeech } from "../audio/formantSynth.js";
import { AjoFace, ListeningDots, Subtitle } from "./speechParts.jsx";

/**
 * 读报纸时盖在最上面的那个模态层（对应 ref/source/13 里的 La）
 *
 * 报纸本身是 3D 模型，镜头推过去就是「看报」；这一层只放两样东西：
 * 全屏的「放回去」按钮（点哪里都收起），以及底部的 Ajo 逐词台词气泡。
 * 台词走站点自带的共振峰合成器，两行之间停 1 秒；
 * 第二行念完 seen 置真，之后再翻开就不念了（和站点一致）。
 */
const LINES = ["What... they put me in the paper?", "Gotta start charging for this face, baby."];

export default function NewspaperDialog({
  audio,
  subtitle,
  faces,
  voiceSettings,
  seen,
  onClose,
}) {
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const reduced = useReducedMotion();
  const isPresent = useIsPresent();

  // 镜头推到报纸需要一会儿，台词等镜头就位再开口
  const [ready, setReady] = useState(false);
  const [line, setLine] = useState(null);
  const [silent, setSilent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), reduced ? 150 : 800);
    return () => clearTimeout(timer);
  }, [reduced]);

  // 真·模态：Esc 由 onCancel 接住，卸载时关掉对话框
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    closeButton.current?.focus({ preventScroll: true });
    return () => element?.close();
  }, []);

  useEffect(() => {
    if (!(ready && isPresent) || seen.current) return;
    const engine = audio.current;
    if (!engine) return;

    let cancelled = false;
    let lineIndex = 0;
    let timer;

    const speech = createSpeech({
      context: engine.getContext(),
      onProgress(event) {
        if (cancelled) return;
        if (event.type === "start") {
          engine.setDialogueSpeaking(true);
          setLine({
            text: LINES[lineIndex],
            chunks: event.cues.map((cue) => cue.text),
            count: 0,
          });
        } else if (event.type === "word") {
          setLine((current) => (current ? { ...current, count: event.index + 1 } : current));
        } else if (event.type === "end") {
          engine.setDialogueSpeaking(false);
          setLine((current) =>
            current ? { ...current, count: current.chunks.length } : current,
          );
          if (lineIndex === 0) {
            lineIndex = 1;
            timer = setTimeout(next, 1000);
          } else {
            seen.current = true;
          }
        }
      },
    });

    function next() {
      if (cancelled || document.hidden) return;
      // 广播还在念的时候 Ajo 不插嘴，只显示三点 waiting
      if (engine.isAnnouncing()) {
        setSilent(true);
        timer = setTimeout(next, 150);
        return;
      }
      setSilent(false);
      faces.current?.react({
        nodeId: lineIndex ? "newspaper_nice" : "newspaper_photo",
        mood: "neutral",
      });
      speech.speak(LINES[lineIndex], voiceSettings.current);
    }

    timer = setTimeout(next, 450);

    const onVisibility = () => {
      if (!document.hidden) return;
      cancelled = true;
      clearTimeout(timer);
      speech.stop();
      engine.setDialogueSpeaking(false);
      setSilent(false);
      setLine((current) => (current ? { ...current, count: current.chunks.length } : current));
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      speech.dispose();
      engine.setDialogueSpeaking(false);
      faces.current?.clear();
    };
  }, [ready, isPresent, audio, faces, seen, voiceSettings]);

  return (
    <motion.dialog
      ref={dialog}
      aria-label="The Local newspaper"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.1 : 0.22 }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-[#343434] backdrop:bg-transparent"
    >
      <button
        type="button"
        ref={closeButton}
        aria-label="Put newspaper back"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-transparent"
      />
      <div className="pointer-events-none absolute inset-x-6 bottom-[max(32px,env(safe-area-inset-bottom))] flex flex-col items-center gap-4">
        <div className="pointer-events-none flex max-w-full items-center justify-center">
          {/* 站点这里还挂着 tracking-tight / shadow-sm，但它那份 CSS 没生成这两条规则，
              照抄会多出字距和投影，所以不写（见 tools/classaudit.mjs） */}
          {(line || silent) && (
            <div className="flex max-w-full items-center gap-3 rounded-[20px] bg-[#f2f2ef] py-3 pr-5 pl-3.5 text-[17px] leading-[1.22]">
              <AjoFace />
              <div className="min-w-0">
                {silent ? (
                  <ListeningDots />
                ) : (
                  line && (
                    <>
                      <span className="sr-only" aria-live="polite">
                        {line.text}
                      </span>
                      <span aria-hidden="true">
                        {line.chunks.map((chunk, index) => (
                          <span
                            key={`${index}-${chunk}`}
                            style={{ opacity: Number(index < line.count) }}
                            className="transition-opacity duration-75 motion-reduce:transition-none"
                          >
                            {chunk}
                          </span>
                        ))}
                      </span>
                    </>
                  )
                )}
              </div>
            </div>
          )}
        </div>
        {subtitle && <Subtitle text={subtitle} />}
      </div>
    </motion.dialog>
  );
}
