import { ANNOUNCEMENTS } from "./announcements.js";

const BUFFERS = [
  "carriage-loop",
  "bump",
  "station-announcement",
  "cat-disclaimer",
  "newspaper-pickup",
];

/**
 * 音频总线（对应 ref/source/07-audio-engine.js）
 *
 * 三条支路：
 *   master  ← carriage-loop（车厢底噪，会被广播压低）
 *   master  ← music-bus（音量滑杆在 master 之外，因为淡入只有一次）
 *   master  ← bump / 广播 / 翻报纸（干声）
 *
 * 广播按 3 秒后第一条、之后 60~100 秒随机轮播，播报期间用 setTargetAtTime 压掉底噪。
 */
export function createAudioEngine({ onSubtitle = () => {}, onStatus = () => {} } = {}) {
  const context = new AudioContext();

  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  const carriageBus = context.createGain();
  carriageBus.gain.value = 1;
  carriageBus.connect(master);

  const musicBus = context.createGain();
  musicBus.gain.value = 0;
  musicBus.connect(master);

  const musicInner = context.createGain();
  musicInner.gain.value = 1;
  musicInner.connect(musicBus);

  const channels = {
    "ajo-morning": context.createGain(),
    "carriage-loop": context.createGain(),
    bump: context.createGain(),
    "newspaper-pickup": context.createGain(),
    "station-announcement": context.createGain(),
    "cat-disclaimer": context.createGain(),
  };

  for (const [name, channel] of Object.entries(channels)) {
    if (name === "ajo-morning") channel.connect(musicInner);
    else channel.connect(name === "carriage-loop" ? carriageBus : master);
  }

  channels["carriage-loop"].gain.value = 0.58;
  channels["ajo-morning"].gain.value = 0.1;
  channels.bump.gain.value = 1;
  channels["station-announcement"].gain.value = 0.24;
  channels["cat-disclaimer"].gain.value = 0.24;

  const buffers = new Map();
  const abort = new AbortController();
  const worldEvents = new Set();

  let disposed = false;
  let loaded = false;
  let failed = false;
  let muted = false;
  let started = false;
  let playing = true;

  let carriageStarted = false;
  let musicStarted = false;
  let dialogueSpeaking = false;
  let ducked = false;

  let nextAnnouncementAt = Infinity;
  let nextAnnouncement = "station-announcement";
  let firstAnnouncement = true;
  let announcementStartsAt = 0;
  let announcementEndsAt = 0;
  let currentAnnouncement = "general";

  let catDisclaimerPending = false;
  let catDisclaimerEndsAt = Infinity;
  let lastBumpAt = 0;

  let subtitle = "";

  const publishSubtitle = (text) => {
    if (text === subtitle) return;
    subtitle = text;
    onSubtitle(text);
  };

  const publishStatus = () => {
    if (disposed) return;
    if (failed) onStatus("unavailable");
    else if (muted) onStatus("muted");
    else onStatus(context.state === "running" ? "playing" : "blocked");
  };

  const syncSuspension = () => {
    if (disposed) return;
    const shouldRun = started && playing && !muted && !document.hidden;
    if (!shouldRun) {
      publishSubtitle("");
      if (context.state === "running") context.suspend().then(publishStatus);
      return;
    }
    context.resume().then(publishStatus).catch(publishStatus);
  };

  const onGesture = () => syncSuspension();
  document.addEventListener("pointerdown", onGesture);
  document.addEventListener("keydown", onGesture);
  document.addEventListener("visibilitychange", onGesture);
  context.addEventListener("statechange", publishStatus);

  /** carriage-loop 首尾交叉淡化，拼成无缝循环 */
  function seamlessLoop(buffer, crossfadeSeconds = 1) {
    const fade = Math.min(
      Math.floor(buffer.length / 4),
      Math.round(crossfadeSeconds * buffer.sampleRate),
    );
    if (fade < 2) return buffer;

    const length = buffer.length - fade;
    const output = context.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const source = buffer.getChannelData(channel);
      const target = output.getChannelData(channel);
      target.set(source.subarray(fade, length));
      for (let i = 0; i < fade; i++) {
        const angle = (i / (fade - 1)) * Math.PI * 0.5;
        target[length - fade + i] = source[length + i] * Math.cos(angle) + source[i] * Math.sin(angle);
      }
    }

    return output;
  }

  const loading = Promise.all(
    BUFFERS.map(async (name) => {
      const response = await fetch(`/assets/train/audio/${name}.ogg`, { signal: abort.signal });
      if (!response.ok) throw new Error(`Unable to load ${name}`);
      const decoded = await context.decodeAudioData(await response.arrayBuffer());
      buffers.set(name, name === "carriage-loop" ? seamlessLoop(decoded) : decoded);
    }),
  )
    .then(() => {
      loaded = true;
    })
    .catch(() => {
      failed = true;
      publishStatus();
    });

  /** 播一段音频，返回它的时长（秒） */
  function play(name, gain = 1, loop = false) {
    const source = context.createBufferSource();
    source.buffer = buffers.get(name);
    source.loop = loop;

    const volume = context.createGain();
    volume.gain.value = gain;
    source.connect(volume);
    volume.connect(channels[name]);
    source.onended = () => {
      source.disconnect();
      volume.disconnect();
    };

    source.start();
    return source.buffer.duration;
  }

  fetch("/assets/train/audio/ajo-morning.ogg", { signal: abort.signal })
    .then(async (response) => {
      if (!response.ok) throw new Error("Unable to load train music");
      const decoded = await context.decodeAudioData(await response.arrayBuffer());
      if (!disposed) buffers.set("ajo-morning", decoded);
    })
    .catch(() => {});

  return {
    loaded: loading,

    /** 世界事件：广播结束等，供剧情层订阅 */
    onWorldEvent(listener) {
      worldEvents.add(listener);
      return () => worldEvents.delete(listener);
    },

    getContext: () => context,
    isAnnouncing: () => context.currentTime < announcementEndsAt,
    hasHeardCatDisclaimer: () => context.currentTime >= catDisclaimerEndsAt,
    isMuted: () => muted,

    setDialogueSpeaking(value) {
      dialogueSpeaking = value;
    },

    /** 音量滑杆传的是 0~100 的百分数 */
    setVolumes(volumes) {
      const targets = {
        "ajo-morning": volumes.music,
        "carriage-loop": volumes.carriage,
        bump: volumes.bump,
        "station-announcement": volumes.station,
        "cat-disclaimer": volumes.cat,
        "newspaper-pickup": 100,
      };

      for (const name of Object.keys(channels)) {
        const value = Math.min(1, Math.max(0, targets[name] / 100));
        channels[name].gain.setTargetAtTime(value, context.currentTime, 0.02);
      }
    },

    /** 进入车厢（站点是点 Enter 按钮）时调用，master 用 1.4 秒淡进来 */
    start() {
      if (!started) {
        started = true;
        master.gain.setValueAtTime(0, context.currentTime);
        master.gain.linearRampToValueAtTime(0.8, context.currentTime + 1.4);
      }
      syncSuspension();
    },

    toggle() {
      muted = !muted;
      syncSuspension();
      publishStatus();
    },

    update(nextPlaying) {
      if (playing !== nextPlaying) {
        playing = nextPlaying;
        syncSuspension();
      }

      if (
        !(started && loaded && playing) ||
        muted ||
        document.hidden ||
        context.state !== "running"
      ) {
        publishSubtitle("");
        return;
      }

      const now = context.currentTime;

      // 背景音乐只在第一次拿到 buffer 时起播，音量走 musicBus 的 4 秒淡入
      if (!musicStarted && buffers.has("ajo-morning")) {
        musicStarted = true;
        musicBus.gain.setValueAtTime(0, now);
        musicBus.gain.linearRampToValueAtTime(1, now + 4);
        play("ajo-morning", 1, true);
      }

      if (catDisclaimerPending && now >= catDisclaimerEndsAt) {
        catDisclaimerPending = false;
        for (const listener of worldEvents) listener("cat_disclaimer_finished");
      }

      if (!carriageStarted) {
        carriageStarted = true;
        play("carriage-loop", 1, true);
        nextAnnouncementAt = now + 3;
      }

      if (now >= nextAnnouncementAt && !dialogueSpeaking) {
        currentAnnouncement = nextAnnouncement === "cat-disclaimer" ? "cat" : "general";
        announcementStartsAt = now;
        announcementEndsAt = now + play(nextAnnouncement, 1);

        if (nextAnnouncement === "cat-disclaimer") {
          catDisclaimerEndsAt = announcementEndsAt;
          catDisclaimerPending = true;
        }

        if (firstAnnouncement) {
          firstAnnouncement = false;
          nextAnnouncement = "cat-disclaimer";
          nextAnnouncementAt = announcementEndsAt + 4 + 2 * Math.random();
        } else {
          nextAnnouncement =
            nextAnnouncement === "cat-disclaimer" ? "station-announcement" : "cat-disclaimer";
          nextAnnouncementAt = announcementEndsAt + 60 + 40 * Math.random();
        }
      }

      if (now < announcementEndsAt) {
        const cues = ANNOUNCEMENTS[currentAnnouncement].cues;
        const elapsed = now - announcementStartsAt;
        publishSubtitle([...cues].reverse().find((cue) => elapsed >= cue.start)?.en ?? "");
      } else {
        publishSubtitle("");
      }

      const shouldDuck = now < announcementEndsAt || dialogueSpeaking;
      if (shouldDuck !== ducked) {
        ducked = shouldDuck;
        carriageBus.gain.setTargetAtTime(shouldDuck ? 0.22 / 0.45 : 1, now, 0.15);
        musicInner.gain.setTargetAtTime(shouldDuck ? 0.35 : 1, now, shouldDuck ? 0.2 : 0.8);
      }
    },

    pickupNewspaper() {
      if (loaded && !muted && playing && context.state === "running") {
        play("newspaper-pickup", 0.6);
      }
    },

    /** 过轨接缝的冲击声，广播期间压低，并用 lastBumpAt 做最小间隔 */
    bump() {
      if (!(carriageStarted && playing) || muted || document.hidden) return;
      if (context.state !== "running") return;
      const now = context.currentTime;
      if (now < lastBumpAt) return;
      lastBumpAt = now + play("bump", now < announcementEndsAt ? 0.35 / 0.6 : 1);
    },

    dispose() {
      disposed = true;
      worldEvents.clear();
      abort.abort();
      document.removeEventListener("pointerdown", onGesture);
      document.removeEventListener("keydown", onGesture);
      document.removeEventListener("visibilitychange", onGesture);
      context.removeEventListener("statechange", publishStatus);
      context.close();
    },
  };
}
