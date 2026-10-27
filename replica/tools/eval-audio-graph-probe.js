// 音频图探针：把页面创建的所有音频节点攒起来，事后取一份参数快照。
// 判据是「用了哪些 ogg、循环与否、滤波器种类、增益数量」这类离散量，
// 连续量（gain 当前值）只做参考，因为两边进入场景的时刻不同。
(() => {
  const nodes = [];
  const wrap = (proto, name) => {
    const original = proto[name];
    if (typeof original !== "function") return;
    proto[name] = function patched(...args) {
      const node = original.apply(this, args);
      nodes.push(node);
      return node;
    };
  };

  for (const method of [
    "createGain",
    "createBufferSource",
    "createBiquadFilter",
    "createStereoPanner",
    "createDynamicsCompressor",
    "createConvolver",
    "createDelay",
    "createWaveShaper",
    "createOscillator",
  ]) {
    wrap(BaseAudioContext.prototype, method);
  }

  const round = (value, digits = 3) => Number(Number(value).toFixed(digits));

  window.__audioGraph = () => {
    const snapshot = {
      gainCount: 0,
      gains: [],
      buffers: [],
      filters: [],
      panners: [],
      compressors: [],
      convolvers: 0,
      delays: 0,
      oscillators: 0,
    };
    for (const node of nodes) {
      if (node instanceof GainNode) {
        snapshot.gainCount += 1;
        snapshot.gains.push(round(node.gain.value, 4));
      } else if (node instanceof AudioBufferSourceNode) {
        snapshot.buffers.push([round(node.buffer?.duration ?? 0), node.loop ? 1 : 0, round(node.playbackRate.value)]);
      } else if (node instanceof BiquadFilterNode) {
        snapshot.filters.push([node.type, round(node.frequency.value), round(node.Q.value)]);
      } else if (node instanceof StereoPannerNode) {
        snapshot.panners.push(round(node.pan.value));
      } else if (node instanceof DynamicsCompressorNode) {
        snapshot.compressors.push([node.threshold.value, node.knee.value, node.ratio.value]);
      } else if (node instanceof ConvolverNode) {
        snapshot.convolvers += 1;
      } else if (node instanceof DelayNode) {
        snapshot.delays += 1;
      } else if (node instanceof OscillatorNode) {
        snapshot.oscillators += 1;
      }
    }
    snapshot.buffers.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    snapshot.filters.sort((a, b) => String(a[0]).localeCompare(String(b[0])) || a[1] - b[1]);
    return snapshot;
  };
})();
