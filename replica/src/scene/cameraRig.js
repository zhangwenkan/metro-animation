import { Box3, Euler, MathUtils, Quaternion, Vector2, Vector3 } from "three/webgpu";

/**
 * 相机四层叠加（对应 ref/source/03-camera-rigs.js 的 tc / tp 两段）
 *
 * 1. shake：鼠标视差 + 行驶抖动 + 过轨接缝的冲击脉冲
 * 2. idle：闲置时把机位缓推 18%、视线转会猫头
 * 站点把它们叠在 GLB 自带的 WEB_CAM_reference 机位上，所以这里保存初始位姿做基准。
 */
export function createCameraRig(camera, catScene) {
  const head = catScene.getObjectByName("head") ?? catScene;
  const catTop = new Box3().setFromObject(catScene).max.y;
  const headY = head.getWorldPosition(new Vector3()).y;

  const home = camera.position.clone();
  const homeQuaternion = camera.quaternion.clone();

  // ── 抖动层 ──
  const shakeOffset = new Vector3();
  const shakeEuler = new Euler(0, 0, 0, "YXZ");
  const shakeQuaternion = new Quaternion();
  const hoverTarget = new Vector2();
  const hover = new Vector2();
  const panQuaternion = new Quaternion();
  const panEuler = new Euler(0, 0, 0, "YXZ");

  let travelled = 0;
  let nextBump = 2.7;
  let lastBump = -10;
  let bumpGain = 1;
  let bumpCount = 0;

  // ── 闲置看猫层 ──
  const focusHeight = (catTop - headY) * 0.55;
  const headWorld = new Vector3();
  const focus = new Vector3();
  const localFocus = new Vector3();
  const towardFocus = new Vector3();
  const beforeQuaternion = new Quaternion();
  const lookQuaternion = new Quaternion();
  let focusReady = false;
  let amount = 0;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  return {
    get amount() {
      return amount;
    },
    get reducedMotion() {
      return reducedMotion.matches;
    },
    setHover(x, y) {
      hoverTarget.set(MathUtils.clamp(x, -1, 1), MathUtils.clamp(y, -1, 1));
    },
    update(dt, { speed = 0, playing = true, shake = 1, pan = 1, idle = false, onBump } = {}) {
      // ── 抖动 ──
      hover.lerp(hoverTarget, 1 - Math.exp(-12 * dt));
      if (playing && speed > 0) travelled += dt;

      const strength =
        Math.min(2, Math.max(0, shake)) *
        Math.min(1.4, Math.sqrt(Math.max(0, speed) / 22.9));

      if (travelled >= nextBump) {
        if (playing && strength > 0) onBump?.();
        lastBump = travelled;
        bumpGain = 0.7 + (hash(++bumpCount, 91) + 1) * 0.2;
        nextBump = travelled + 4.2 + (hash(bumpCount, 63) + 1) * 2.1;
      }

      const sinceBump = travelled - lastBump;
      const impulse =
        sinceBump < 0.8 ? Math.sin(38 * sinceBump) * Math.exp(-8 * sinceBump) * bumpGain : 0;

      const noiseX = hash(7.7 * travelled, 3);
      const noiseY = hash(11.3 * travelled, 7);
      const noiseZ = hash(8.9 * travelled, 19);

      shakeOffset
        .set(9e-4 * noiseX, 0.0012 * noiseY + 0.009 * impulse, 4e-4 * hash(6.1 * travelled, 31))
        .multiplyScalar(strength);

      camera.position.copy(home).add(shakeOffset.applyQuaternion(homeQuaternion));
      shakeEuler.set(
        (35e-5 * noiseY + 0.0022 * impulse) * strength,
        25e-5 * noiseX * strength,
        (5e-4 * noiseZ + 9e-4 * impulse) * strength,
      );
      shakeQuaternion.setFromEuler(shakeEuler);
      panQuaternion.setFromEuler(panEuler.set(0.004 * hover.y * pan, -(0.008 * hover.x) * pan, 0));
      camera.quaternion.copy(homeQuaternion).multiply(panQuaternion).multiply(shakeQuaternion);

      // ── 闲置看猫 ──
      const step = Math.min(Math.max(dt, 0), 0.1);
      const target = idle && !reducedMotion.matches ? 1 : 0;
      amount = reducedMotion.matches
        ? 0
        : MathUtils.damp(amount, target, idle ? 6 : 4, step);
      if (Math.abs(amount - target) < 1e-4) amount = target;

      head.getWorldPosition(headWorld);
      headWorld.y += focusHeight;
      if (focusReady) focus.lerp(headWorld, 1 - Math.exp(-3 * step));
      else (focus.copy(headWorld), (focusReady = true));

      if (amount !== 0) {
        localFocus.copy(focus);
        camera.parent?.worldToLocal(localFocus);
        towardFocus.copy(home).lerp(localFocus, 0.18);
        camera.position.addScaledVector(towardFocus.sub(home), amount);

        beforeQuaternion.copy(camera.quaternion);
        camera.lookAt(focus);
        lookQuaternion.copy(camera.quaternion);
        camera.quaternion.copy(beforeQuaternion).slerp(lookQuaternion, amount);
      }
    },
  };
}

/**
 * 一维值噪声（对应 ref/source 里 03 段尾部的 FU）
 * 同一个 (时间, 种子) 必然得到同一个值，所以镜头抖动可复现。
 */
function hash(x, seed) {
  const sample = (value) => {
    const raw = 43758.5453 * Math.sin(127.1 * value + 311.7 * seed);
    return (raw - Math.floor(raw)) * 2 - 1;
  };
  const floor = Math.floor(x);
  return MathUtils.lerp(sample(floor), sample(floor + 1), x - floor);
}

/**
 * 把 dt 量化到 1/fps 的整数倍（对应 ref/source 06 里的 tv）
 * 猫的骨骼只按 16fps 步进，就有了定格动画的顿挫感。
 */
export function createFpsStepper() {
  let accumulated = 0;

  return (dt, fps = 30) => {
    if (!Number.isFinite(dt) || dt <= 0 || !Number.isFinite(fps) || fps <= 0) return 0;
    const step = 1 / fps;
    const advance = Math.floor((accumulated + 1e-10) / step) * step;
    accumulated = Math.max(0, accumulated + dt - advance);
    return advance;
  };
}
