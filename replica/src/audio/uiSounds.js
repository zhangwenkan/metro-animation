/**
 * 站点全局 UI 音效（chunk 0nhvy2f115xt_ 里的 UISounds + "Minimal" 音色包）。
 *
 * 站点把它挂在 document 的 click / input / pointerover 捕获阶段：
 *  - 带 data-ui-sound="xxx" 的元素 → 播 xxx
 *  - aria-checked / aria-pressed 变化 → toggle-on / toggle-off
 *  - role=tab/radio/menuitem → select
 *  - 有 aria-expanded → expand / collapse
 *  - 都没有 → click；鼠标划过 → hover（100ms 节流）
 * 音色包里每个音都是「正弦振荡器 + ADSR 包络 + 增益」，这里按同样的调度方式复刻。
 * 站点这套包一共 26 个音色（ref/source/12-ui-sound.js 第 262~609 行），少一个就意味着
 * 对应交互静默无声，所以下面按站点原顺序整份搬过来。
 */

export const PATCH = {
  name: "Minimal",
  sounds: {
    tap: { source: { type: "sine", frequency: 1200 }, envelope: { attack: 0, decay: 0.012, sustain: 0, release: 0.004 }, gain: 0.08 },
    click: { source: { type: "sine", frequency: 800 }, envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.005 }, gain: 0.1 },
    "key-press": { source: { type: "sine", frequency: 1100 }, envelope: { attack: 0, decay: 0.01, sustain: 0, release: 0.003 }, gain: 0.06 },
    "toggle-on": {
      layers: [
        { source: { type: "sine", frequency: 880 }, envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 }, gain: 0.08 },
        { source: { type: "sine", frequency: 1320 }, envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 }, delay: 0.03, gain: 0.07 },
      ],
    },
    "toggle-off": {
      layers: [
        { source: { type: "sine", frequency: 1320 }, envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 }, gain: 0.08 },
        { source: { type: "sine", frequency: 880 }, envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 }, delay: 0.03, gain: 0.07 },
      ],
    },
    checkbox: { source: { type: "sine", frequency: 1000 }, envelope: { attack: 0, decay: 0.018, sustain: 0, release: 0.005 }, gain: 0.09 },
    select: { source: { type: "sine", frequency: 1100 }, envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 }, gain: 0.08 },
    deselect: { source: { type: "sine", frequency: 900 }, envelope: { attack: 0, decay: 0.018, sustain: 0, release: 0.005 }, gain: 0.06 },
    hover: { source: { type: "sine", frequency: 1300 }, envelope: { attack: 0, decay: 0.01, sustain: 0, release: 0.004 }, gain: 0.04 },
    "tab-switch": { source: { type: "sine", frequency: 1050 }, envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.005 }, gain: 0.07 },
    expand: {
      source: { type: "sine", frequency: { start: 800, end: 1000 } },
      envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.012 },
      gain: 0.06,
    },
    collapse: {
      source: { type: "sine", frequency: { start: 1000, end: 800 } },
      envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.012 },
      gain: 0.06,
    },
    "page-enter": {
      source: { type: "sine", frequency: { start: 700, end: 900 } },
      envelope: { attack: 0.003, decay: 0.04, sustain: 0, release: 0.015 },
      gain: 0.05,
    },
    "page-exit": {
      source: { type: "sine", frequency: { start: 900, end: 700 } },
      envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.015 },
      gain: 0.04,
    },
    success: {
      layers: [
        { source: { type: "sine", frequency: 523 }, envelope: { attack: 0, decay: 0.05, sustain: 0, release: 0.015 }, gain: 0.1 },
        { source: { type: "sine", frequency: 784 }, envelope: { attack: 0, decay: 0.05, sustain: 0, release: 0.015 }, delay: 0.06, gain: 0.08 },
      ],
    },
    error: {
      layers: [
        { source: { type: "sine", frequency: 300 }, envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.012 }, gain: 0.12 },
        { source: { type: "sine", frequency: 280 }, envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.012 }, delay: 0.01, gain: 0.1 },
      ],
    },
    warning: {
      layers: [
        { source: { type: "sine", frequency: 440 }, envelope: { attack: 0, decay: 0.03, sustain: 0, release: 0.01 }, gain: 0.1 },
        { source: { type: "sine", frequency: 466 }, envelope: { attack: 0, decay: 0.03, sustain: 0, release: 0.01 }, delay: 0.008, gain: 0.08 },
      ],
    },
    notification: {
      layers: [
        { source: { type: "sine", frequency: 660 }, envelope: { attack: 0, decay: 0.05, sustain: 0, release: 0.02 }, gain: 0.1 },
        { source: { type: "sine", frequency: 880 }, envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.015 }, delay: 0.08, gain: 0.08 },
      ],
    },
    info: {
      source: { type: "sine", frequency: 880 },
      envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.015 },
      gain: 0.08,
    },
    copy: {
      layers: [
        { source: { type: "sine", frequency: 1000 }, envelope: { attack: 0, decay: 0.012, sustain: 0, release: 0.004 }, gain: 0.08 },
        { source: { type: "sine", frequency: 1200 }, envelope: { attack: 0, decay: 0.012, sustain: 0, release: 0.004 }, delay: 0.035, gain: 0.07 },
      ],
    },
    send: {
      source: { type: "sine", frequency: { start: 600, end: 1000 } },
      envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.012 },
      gain: 0.08,
    },
    delete: {
      source: { type: "sine", frequency: { start: 500, end: 250 } },
      envelope: { attack: 0, decay: 0.05, sustain: 0, release: 0.015 },
      gain: 0.1,
    },
    undo: {
      source: { type: "sine", frequency: { start: 800, end: 600 } },
      envelope: { attack: 0, decay: 0.035, sustain: 0, release: 0.01 },
      gain: 0.07,
    },
    pop: { source: { type: "sine", frequency: { start: 400, end: 200 } }, envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.012 }, gain: 0.1 },
    swoosh: { source: { type: "sine", frequency: { start: 600, end: 1400 } }, envelope: { attack: 0.005, decay: 0.04, sustain: 0, release: 0.015 }, gain: 0.05 },
    slide: { source: { type: "sine", frequency: { start: 800, end: 1100 } }, envelope: { attack: 0.003, decay: 0.035, sustain: 0, release: 0.012 }, gain: 0.05 },
  },
};

let context = null;
let unlocked = false;
let mounted = false;

function resume() {
  if (!context) {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return Promise.reject(new Error("no WebAudio"));
    context = new Ctor();
  }
  return context.resume().then(() => context);
}

/** ADSR：起始压到 1e-4，attack 线性拉到峰值，之后按 decay/3 的时间常数指数衰减 */
function envelopeNode(ctx, envelope, level, at) {
  const gain = ctx.createGain();
  if (!envelope) {
    gain.gain.setValueAtTime(level, at);
    gain.gain.setTargetAtTime(1e-4, at, 0.15);
    return { node: gain, duration: 0.5 };
  }
  const attack = envelope.attack ?? 0;
  const decay = envelope.decay;
  const sustain = envelope.sustain ?? 0;
  const release = envelope.release ?? 0;
  const peak = Math.max(sustain * level, 1e-4);
  const tau = decay / 3;

  gain.gain.setValueAtTime(1e-4, at);
  if (attack > 0) gain.gain.linearRampToValueAtTime(level, at + attack);
  else gain.gain.setValueAtTime(level, at);
  if (sustain > 0) {
    gain.gain.setTargetAtTime(peak, at + attack, tau);
    if (release > 0) gain.gain.setTargetAtTime(1e-4, at + attack + decay, release / 3);
  } else {
    gain.gain.setTargetAtTime(1e-4, at + attack, tau);
  }
  return { node: gain, duration: attack + decay + release };
}

function playLayer(ctx, layer, at, volume) {
  const level = (layer.gain ?? 0.5) * volume;
  const { node: envelope, duration } = envelopeNode(ctx, layer.envelope, level, at);
  const { source } = layer;
  const oscillator = ctx.createOscillator();
  oscillator.type = source.type;

  if (typeof source.frequency === "number") {
    oscillator.frequency.setValueAtTime(source.frequency, at);
  } else {
    oscillator.frequency.setValueAtTime(source.frequency.start, at);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(source.frequency.end, 1),
      at + duration,
    );
  }
  oscillator.start(at);
  oscillator.stop(at + duration + 0.1);
  oscillator.connect(envelope);
  envelope.connect(ctx.destination);
}

function play(name, { volume = 1 } = {}) {
  const patch = PATCH.sounds[name];
  if (!patch || !context) return;
  const layers = patch.layers ?? [patch];
  const audio = context;
  const now = audio.currentTime;
  for (const layer of layers) playLayer(audio, layer, now + (layer.delay ?? 0), volume);
}

export function playUiSound(name, options) {
  play(name, options);
}

function target(event) {
  const element =
    event.target instanceof Element
      ? event.target.closest(
          'button,a[href],summary,select,input[type="button"],input[type="submit"],input[type="reset"],input[type="checkbox"],input[type="radio"],input[type="range"],[role="button"],[role="tab"],[role="switch"],[role="checkbox"],[role="radio"],[role="menuitem"],[role="slider"],[data-ui-sound]',
        )
      : null;
  if (!element) return null;
  if (element.closest('[inert], [aria-disabled="true"], [data-ui-sound="off"]')) return null;
  if (element.matches(":disabled")) return null;
  return element;
}

/** 站点只有在音频上下文本来就已经解锁（resume 在 250ms 内完成）时才发声 */
function emit(name) {
  if (document.hidden) return;
  const startedAt = performance.now();
  resume()
    .then(() => {
      if (!mounted) return;
      unlocked = true;
      if (performance.now() - startedAt < 250) play(name, { volume: 0.65 });
    })
    .catch(() => {});
}

let lastHover = 0;
let lastTap = 0;

function onClick(event) {
  const element = target(event);
  if (!element || !event.isTrusted || event.button !== 0) return;
  if (
    element.matches('select, input[type="checkbox"], input[type="radio"], input[type="range"], [role="slider"]')
  ) {
    return;
  }

  const sound = element.getAttribute("data-ui-sound");
  if (sound && PATCH.sounds[sound]) return emit(sound);

  const checked = element.getAttribute("aria-checked") ?? element.getAttribute("aria-pressed");
  if (checked !== null) return emit(checked === "true" ? "toggle-off" : "toggle-on");
  if (element.matches('[role="tab"], [role="radio"], [role="menuitem"]')) return emit("select");

  const expanded = element.getAttribute("aria-expanded");
  if (expanded !== null) return emit(expanded === "true" ? "collapse" : "expand");

  return emit("click");
}

function onInput(event) {
  const element = target(event);
  if (!element || !event.isTrusted) return;
  if (element instanceof HTMLSelectElement) return emit("select");
  if (element instanceof HTMLInputElement) {
    if (element.type === "checkbox") emit(element.checked ? "toggle-on" : "toggle-off");
    if (element.type === "radio") emit("select");
    if (element.type === "range" && performance.now() - lastTap > 90) {
      lastTap = performance.now();
      emit("tap");
    }
  }
}

function onPointerOver(event) {
  if (!unlocked || event.pointerType !== "mouse" || !event.isTrusted) return;
  const element = target(event);
  if (!element) return;
  // 在同一元素内部移动不算再次进入
  if (event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) return;
  if (performance.now() - lastHover < 100) return;
  lastHover = performance.now();
  emit("hover");
}

/** 挂到 document 上，返回卸载函数；和站点 UISounds 组件等价的副作用 */
export function startUiSounds() {
  mounted = true;
  document.addEventListener("click", onClick, true);
  document.addEventListener("input", onInput, true);
  document.addEventListener("pointerover", onPointerOver, true);

  return () => {
    mounted = false;
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("input", onInput, true);
    document.removeEventListener("pointerover", onPointerOver, true);
    if (context) {
      context.close().catch(() => {});
      context = null;
    }
    unlocked = false;
  };
}
