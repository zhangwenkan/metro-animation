import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createSpeech } from "../audio/formantSynth.js";
import story from "../narrative/story.json";
import { params } from "../scene/params.js";
import ThoughtBubble from "./ThoughtBubble.jsx";

/**
 * 猫的叙事控制器（对应 ref/source/15-narrative.js 里的 Lt）
 *
 * 三种东西糅在一个组件里，和站点一样：
 *
 * 1. 想法气泡的排期。ready 之后：气泡冒出时停 9 秒再收回，
 *    收回去空 4.5~7 秒再冒下一个；广播（cat_disclaimer_finished）
 *    落地时插播一条 announcement 想法，15 秒内有效。
 * 2. 对话推进。点气泡 → 从 thought.startNode 开始走节点图；
 *    每个节点的回复按隐藏的 trust / irritation 选一版 mood，
 *    选项本身带 intent（pry / respect / empathize / offer / apologize）参与计分。
 * 3. 念白。第一句先显示，再走站点自带的共振峰合成器逐词念出来；
 *    广播还在响的时候只显示 listening 三点，不进合成器。
 */
const nodes = story.nodes;
const idleThoughts = story.thoughts.filter((thought) => thought.availableWhen === "idle");
const THOUGHT_LIFETIME = 15000;

export default function Conversation({
  audio,
  ready,
  faceReactions,
  conversationActive,
  suspended = false,
  voiceSettings,
}) {
  // 站点这里是个实时调参面板（e1 "Train — Ajo voice"），复刻里固定成默认值
  const settings = params.voice;
  useEffect(() => {
    voiceSettings.current = settings;
  }, [settings, voiceSettings]);

  const reduced = useReducedMotion();

  const [listening, setListening] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [thoughtId, setThoughtId] = useState(idleThoughts[0].id);
  const [announced, setAnnounced] = useState(null);
  const [nodeId, setNodeId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [reveal, setReveal] = useState({ chunks: [], revealed: 0 });
  const [speaking, setSpeaking] = useState(false);

  const mood = useRef({ trust: 0, irritation: 0, turns: 0, appreciated: [] });
  const speech = useRef(null);
  const retry = useRef(null);
  const pendingSpeak = useRef(null);
  const thoughtButton = useRef(null);
  const currentLine = useRef(null);

  const thought = story.thoughts.find((entry) => entry.id === thoughtId);
  const node = nodes.find((entry) => entry.id === nodeId);

  /** 停掉当前这句：清重试、收合成器、恢复播音 */
  function stopLine() {
    pendingSpeak.current = null;
    if (retry.current) clearTimeout(retry.current);
    retry.current = null;
    speech.current?.stop();
    audio.current?.setDialogueSpeaking(false);
    setSpeaking(false);
    setListening(false);
  }

  /** 收回气泡：连对话状态和猫的表情一起清 */
  function dismiss() {
    stopLine();
    faceReactions.current?.clear();
    conversationActive.current = false;
    currentLine.current = null;
    setNodeId(null);
    setBubbleVisible(false);
  }

  /** 走一个节点：先按意图结算隐藏好感度，再挑一版回复念出来 */
  function advance(nextId, choice) {
    const target = nodes.find((entry) => entry.id === nextId);
    if (!target) return;

    mood.current = updateMood(mood.current, `${currentLine.current}:${nextId}`, choice?.intent);

    // 先把文本放进气泡（字已经在那里，只是还没逐词亮）
    let targetMood = "neutral";
    if (mood.current.irritation >= 2) targetMood = "irritated";
    else if (mood.current.trust >= 2) targetMood = "warmer";
    else if (mood.current.turns <= 2) targetMood = "tired";

    const reply =
      target.replies.find((entry) => entry.mood === targetMood) ??
      target.replies.find((entry) => entry.mood === "neutral") ??
      target.replies[0];

    stopLine();
    conversationActive.current = true;
    currentLine.current = nextId;
    setNodeId(nextId);
    setReplyText(reply.text);
    setReveal({ chunks: [reply.text], revealed: 0 });

    const engine = audio.current;
    if (!engine) {
      setReveal({ chunks: [reply.text], revealed: 1 });
      return;
    }

    engine.start();
    speech.current ??= createSpeech({
      context: engine.getContext(),
      onProgress(event) {
        if (event.type === "start") {
          setReveal({ chunks: event.cues.map((cue) => cue.text), revealed: 0 });
          setSpeaking(true);
          engine.setDialogueSpeaking(true);
        } else if (event.type === "word") {
          faceReactions.current?.word(currentLine.current, event.index);
          setReveal((current) => ({ ...current, revealed: event.index + 1 }));
        } else if (event.type === "end") {
          faceReactions.current?.finish(currentLine.current);
          setSpeaking(false);
          engine.setDialogueSpeaking(false);
          setReveal((current) => ({ ...current, revealed: current.chunks.length }));
        } else if (event.type === "stop") {
          setSpeaking(false);
          engine.setDialogueSpeaking(false);
        }
      },
    });

    // 广播念到一半时不插嘴：先挂 listening，等它结束再开口；
    // 刚结束的那一瞬间还要等 reveal 动画放完（onContentReady 回调）
    let waiting = engine.isAnnouncing();
    setListening(waiting);

    const trySpeak = () => {
      if (currentLine.current !== nextId || document.hidden) return;
      if (engine.isAnnouncing()) {
        waiting = true;
        setListening(true);
        retry.current = setTimeout(trySpeak, 100);
        return;
      }
      retry.current = null;
      if (waiting) {
        waiting = false;
        setListening(false);
        pendingSpeak.current = trySpeak;
        return;
      }
      faceReactions.current?.react({ nodeId: nextId, mood: reply.mood });
      speech.current?.speak(reply.text, settings);
      setSpeaking(true);
      engine.setDialogueSpeaking(true);
    };

    setSpeaking(true);
    engine.setDialogueSpeaking(true);
    pendingSpeak.current = trySpeak;
  }

  // 广播里的猫声明念完了 → 插播一条「听见了」的想法
  useEffect(() => {
    if (!ready) return;
    return audio.current?.onWorldEvent((event) => {
      const match = story.thoughts.find((entry) => entry.availableWhen === event);
      if (match) setAnnounced({ id: match.id, expires: Date.now() + THOUGHT_LIFETIME });
    });
  }, [audio, ready]);

  // 想法排期：冒出来 → 停一会儿 → 收回去，循环
  useEffect(() => {
    let timer;
    if (!ready || suspended || nodeId !== null) return;

    const schedule = () => {
      // 站点是按「气泡是开着还是收着」排期，不是按 reduced motion：
      // 开着停 9 秒再收，收着空 4.5~7 秒再冒
      let delay = bubbleVisible ? 9000 : 4500 + 2500 * Math.random();
      if (announced) delay = bubbleVisible ? 300 : 650;
      timer = setTimeout(() => {
        if (document.hidden) {
          schedule();
          return;
        }
        if (bubbleVisible) {
          // 焦点还在气泡上就不收，键盘用户正在读
          if (document.activeElement === thoughtButton.current) {
            schedule();
            return;
          }
          setBubbleVisible(false);
        } else {
          const pool = idleThoughts.filter((entry) => entry.id !== thoughtId);
          if (announced && Date.now() < announced.expires) {
            faceReactions.current?.react({ nodeId: "operator", mood: "neutral" });
          }
          setThoughtId(
            announced && Date.now() < announced.expires
              ? announced.id
              : pool[Math.floor(Math.random() * pool.length)].id,
          );
          setAnnounced(null);
          setBubbleVisible(true);
        }
      }, delay);
    };

    schedule();
    return () => clearTimeout(timer);
  }, [nodeId, ready, bubbleVisible, announced, thoughtId, faceReactions, reduced, suspended]);

  // 切到后台：把正在念的这句掐掉，但保留已经亮出来的字
  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden) return;
      pendingSpeak.current = null;
      if (retry.current) clearTimeout(retry.current);
      retry.current = null;
      speech.current?.stop();
      audio.current?.setDialogueSpeaking(false);
      setSpeaking(false);
      setListening(false);
      setReveal((current) => ({ ...current, revealed: current.chunks.length }));
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (retry.current) clearTimeout(retry.current);
      speech.current?.dispose();
      speech.current = null;
      audio.current?.setDialogueSpeaking(false);
    };
  }, [audio]);

  // 去看报纸时把对话整体挂起
  useEffect(() => {
    if (!suspended) return;
    pendingSpeak.current = null;
    if (retry.current) clearTimeout(retry.current);
    retry.current = null;
    speech.current?.stop();
    audio.current?.setDialogueSpeaking(false);
    conversationActive.current = false;
    faceReactions.current?.clear();
    currentLine.current = null;
    setNodeId(null);
    setBubbleVisible(false);
    setSpeaking(false);
    setListening(false);
  }, [suspended, audio, conversationActive, faceReactions]);

  return (
    <AnimatePresence mode="wait">
      {!suspended && (bubbleVisible || node) && (
        <motion.div
          key="conversation"
          exit={{ opacity: 0, scale: reduced ? 1 : 0.94, y: 4 * !reduced, pointerEvents: "none" }}
          transition={
            reduced
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 25, opacity: { duration: 0.18 } }
          }
          className="origin-bottom-right"
        >
          <ThoughtBubble
            thought={thought.text}
            text={node ? replyText : undefined}
            words={node ? reveal : undefined}
            listening={listening}
            buttonRef={thoughtButton}
            onActivate={() => advance(thought.startNode)}
            onDismiss={dismiss}
            onContentReady={() => {
              const run = pendingSpeak.current;
              pendingSpeak.current = null;
              run?.();
            }}
            choices={
              speaking
                ? []
                : (node?.choices?.map((choice) => ({
                    id: `${node.id}-${choice.next}-${choice.text}`,
                    text: choice.text,
                    onClick: () => {
                      if (currentLine.current === node.id) advance(choice.next, choice);
                    },
                  })) ??
                  (node?.end ? [{ id: "leave", text: "Leave him to it", onClick: dismiss }] : []))
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * 隐藏好感度结算（对应 ref/source/15-narrative.js 里 D 开头那段内联函数）
 * 同一个节点组合只奖励一次，所以 appreciated 里存的是 `上一个节点:这个节点`。
 */
function updateMood(state, key, intent) {
  let { trust, irritation } = state;
  const appreciated = [...state.appreciated];

  if (intent === "pry" || intent === "tease") irritation += 1;
  if (!appreciated.includes(key)) {
    if (intent === "empathize" || intent === "offer") {
      trust += 2;
      irritation -= 1;
      appreciated.push(key);
    } else if (intent === "respect") {
      trust += 1;
      irritation -= 1;
      appreciated.push(key);
    } else if (intent === "apologize") {
      irritation -= 2;
      appreciated.push(key);
    }
  }

  return {
    trust: Math.min(4, trust),
    irritation: Math.max(0, Math.min(3, irritation)),
    turns: state.turns + 1,
    appreciated,
  };
}