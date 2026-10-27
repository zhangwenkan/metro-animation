import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { createTrainScene } from "./scene/trainScene.js";
import { createAudioEngine } from "./scene/audio.js";
import { params } from "./scene/params.js";
import { startUiSounds } from "./audio/uiSounds.js";
import EntryScreen from "./ui/EntryScreen.jsx";
import AboutPanel from "./ui/AboutPanel.jsx";
import BlinkingFavicon from "./ui/BlinkingFavicon.jsx";
import NewspaperDialog from "./ui/NewspaperDialog.jsx";
import Conversation from "./ui/Conversation.jsx";
import { Subtitle } from "./ui/speechParts.jsx";

/**
 * 对应站点 chunk 里的 TrainClient（模块 69798）+ Train（模块 67272）两层：
 * 车厢一直在后台加载，白底入场页盖在上面；Enter 只负责放行音频，
 * 随后入口页自己的 reveal 动画结束才把自己卸掉。
 */
// 调试层默认关：站点没有这一层，做像素 A/B 时不该把它带上
const showHud = new URLSearchParams(window.location.search).has("hud");

export default function App() {
  const stage = useRef(null);
  const shell = useRef(null);
  const enterAudio = useRef(null);
  const audio = useRef(null);
  const paperButton = useRef(null);
  const thoughtBox = useRef(null);
  // 下面四个和站点一样是 ref 而不是 state：改名状态不该触发重渲染
  const reading = useRef(false);
  const paperSeen = useRef(false);
  const faces = useRef(null);
  const conversation = useRef(false);
  // 嗓音参数由叙事控制器接管（站点是实时面板，这里固定成 params.voice）
  const voiceSettings = useRef(params.voice);

  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [paperOpen, setPaperOpen] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("初始化…");
  const [subtitle, setSubtitle] = useState("");
  const [audioStatus, setAudioStatus] = useState("blocked");

  // 站点把 UISounds 挂在根布局上，全站点击/滑过都有合成音
  useEffect(() => startUiSounds(), []);

  useEffect(() => {
    let scene = null;
    let disposed = false;

    const engine = createAudioEngine({ onSubtitle: setSubtitle, onStatus: setAudioStatus });
    engine.setVolumes(params.audio);
    audio.current = engine;
    // 站点把 audio.start 存进 ref 交给入场页，Enter 就是唯一的手势入口
    enterAudio.current = () => engine.start();

    createTrainScene(stage.current, {
      onStatus: setStatus,
      audio: engine,
      paperButton: paperButton.current,
      thoughtBox: thoughtBox.current,
      reading,
      conversation,
    })
      .then((created) => {
        if (disposed) {
          created.dispose();
          return;
        }
        scene = created;
        faces.current = created.faces;
        setReady(true);
      })
      .catch((err) => {
        console.error(err);
        setError(err);
      });

    return () => {
      disposed = true;
      scene?.dispose();
      engine.dispose();
    };
  }, []);

  const enter = () => {
    if (!ready || entered) return;
    enterAudio.current?.();
    setEntered(true);
  };

  const reveal = () => {
    setRevealed(true);
    requestAnimationFrame(() => shell.current?.focus());
  };

  // 站点把 reading 存成 ref 并在 close / exit 两处都清零：关的时候镜头就开始往回退
  const openPaper = () => {
    if (!ready || !revealed || reading.current) return;
    audio.current?.start();
    audio.current?.pickupNewspaper();
    reading.current = true;
    conversation.current = false;
    setPaperOpen(true);
  };

  const closePaper = () => {
    reading.current = false;
    setPaperOpen(false);
  };

  return (
    <div className="font-amiamie">
      {/* 站点把它和车厢一起放在根布局里：标签页图标自己会眨 */}
      <BlinkingFavicon />

      <div
        ref={shell}
        tabIndex={-1}
        inert={!revealed}
        aria-hidden={!revealed}
        className="outline-none"
      >
        <main className="relative h-dvh w-full overflow-hidden bg-white">
          <div ref={stage} className="absolute inset-0" />

          {/* 热点：位置/尺寸/可见性全由报纸机位每帧写进 style */}
          <button
            ref={paperButton}
            type="button"
            aria-label="Read the newspaper"
            data-ui-sound="expand"
            tabIndex={ready && revealed && !paperOpen ? 0 : -1}
            onClick={openPaper}
            className={`group invisible absolute top-0 left-0 z-10 cursor-pointer rounded-lg border-0 bg-transparent outline-offset-4 focus-visible:outline-2 focus-visible:outline-white ${
              ready && revealed ? "" : "pointer-events-none"
            }`}
          />

          <AnimatePresence
            onExitComplete={() => {
              reading.current = false;
            }}
          >
            {paperOpen && (
              <NewspaperDialog
                audio={audio}
                subtitle={subtitle}
                faces={faces}
                voiceSettings={voiceSettings}
                seen={paperSeen}
                onClose={closePaper}
              />
            )}
          </AnimatePresence>

          {/* 想法气泡：位置跟着猫的 head 骨骼走，由 thoughtAnchor 每帧写 style */}
          <div
            ref={thoughtBox}
            className="invisible absolute top-0 left-0 z-10 w-[min(280px,calc(100%-32px))]"
          >
            <Conversation
              audio={audio}
              ready={ready && revealed}
              faceReactions={faces}
              conversationActive={conversation}
              suspended={paperOpen}
              voiceSettings={voiceSettings}
            />
          </div>

          <div className="pointer-events-none absolute inset-x-6 bottom-[max(32px,env(safe-area-inset-bottom))] z-20">
            {!paperOpen && <Subtitle text={subtitle} />}
          </div>
        </main>
      </div>

      {!revealed && (
        <EntryScreen
          ready={ready}
          entered={entered}
          error={error}
          onEnter={enter}
          onRevealed={reveal}
        />
      )}

      {revealed && <AboutPanel />}

      {/* 调试层：站点没有。默认不渲染，地址后面加 ?hud 才出来；报错时总是显示 */}
      {(showHud || error) && (
        <div className="hud">
          {error ? (
            <span className="err">{String(error.message ?? error)}</span>
          ) : (
            `${status} · 音频 ${audioStatus}`
          )}
        </div>
      )}
    </div>
  );
}
