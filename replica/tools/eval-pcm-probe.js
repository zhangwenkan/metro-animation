// 语音合成器输出指纹：Ajo 的嗓音是逐音素算出来的 PCM，直接灌进 AudioBuffer。
// 把每个 buffer 的样本做个 FNV 指纹 + RMS，两端跑同一句话就能逐样本对账。
(() => {
  const log = [];
  window.__pcm = log;

  const original = AudioBuffer.prototype.copyToChannel;
  AudioBuffer.prototype.copyToChannel = function copyToChannel(source, channelNumber, offset) {
    const result = original.call(this, source, channelNumber, offset);
    try {
      const data = this.getChannelData(channelNumber ?? 0);
      let hash = 0x811c9dc5;
      let energy = 0;
      for (let i = 0; i < data.length; i++) {
        const q = (data[i] * 32768) | 0;
        hash = Math.imul(hash ^ q, 0x1000193) >>> 0;
        energy += data[i] * data[i];
      }
      log.push([
        this.sampleRate,
        this.length,
        hash.toString(16),
        Number(Math.sqrt(energy / data.length).toFixed(5)),
      ]);
    } catch {
      // 拿不到样本就算了，免得影响页面本身
    }
    return result;
  };
})();
