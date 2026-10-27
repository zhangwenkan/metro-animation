import { Box3, MathUtils, Matrix4, Quaternion, Vector3 } from "three/webgpu";

/**
 * 报纸的拾取机位 + 热点（对应 ref/source/03-camera-rigs.js 里的 td）
 *
 * 两件事，同一个 update 里做完：
 *
 * 1. 镜头推拉。报纸先绕自身局部 X 轴翘起 18°，并按 0.135 的偏移绕前缘转向，
 *    镜头再沿着报纸自己的局部 +Y 推到「0.27 宽 / 0.36 高」的取景距离
 *    （下限 0.4），进度 u 走的是一个二阶弹簧，所以进出都有点惯性。
 *    起步用 smoothstep(u, 0, 0.08) 往回混一层，把第一帧的位置跳变抹掉。
 * 2. 热点。报纸包围盒 8 个角投影到屏幕，取包住它们的矩形当按钮位置；
 *    阅读中或过渡中都把按钮藏掉。
 *
 * 按钮本身由 React 渲染（站点就是这样），这里只负责改它的尺寸/位置/可见性。
 */
export function createNewspaperRig(container, root, camera, { button } = {}) {
  const newspaper =
    root.getObjectByProperty("name", "WEB_The Local | folded newspaper") ??
    findByName(root, "The Local | folded newspaper");
  if (!newspaper) throw new Error("Folded newspaper missing from scene export");

  const restPosition = newspaper.position.clone();
  const restQuaternion = newspaper.quaternion.clone();
  // 绕前缘转，所以先把 pivot 挪到纸面前方 0.135，转完再挪回来
  const pivotOffset = new Vector3(0, 0, 0.135);
  const tilt = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), MathUtils.degToRad(18));
  const tiltedQuaternion = restQuaternion.clone().multiply(tilt);

  const offset = new Vector3();
  const target = new Vector3();
  const paperPivot = new Vector3();
  const paperQuaternion = new Quaternion();
  const lookMatrix = new Matrix4();
  const lookQuaternion = new Quaternion();
  const up = new Vector3(0, 1, 0);
  const parentQuaternion = new Quaternion();

  const cameraRestPosition = new Vector3();
  const cameraRestQuaternion = new Quaternion();
  const capturedPosition = new Vector3();
  const capturedTarget = new Vector3();
  const lookPoint = new Vector3();
  const cameraWorldPosition = new Vector3();
  const viewDirection = new Vector3();

  const bounds = new Box3();
  const corner = new Vector3();

  // 弹簧：progress 是进度，velocity 是它的导数（站点里的 eN / eA）
  let progress = 0;
  let velocity = 0;

  return {
    update(reading, dt, reducedMotion = false) {
      const wasTransitioning = progress > 0;
      const step = Math.min(Math.max(dt, 0), 0.1);
      const goal = Number(!!reading);

      const delta = progress - goal;
      const push = velocity + 9 * delta;
      const decay = Math.exp(-9 * step);

      progress = reducedMotion ? goal : goal + (delta + push * step) * decay;
      velocity = reducedMotion ? 0 : (velocity - 9 * push * step) * decay;
      if (Math.abs(progress - goal) < 1e-4 && Math.abs(velocity) < 0.001) {
        progress = goal;
        velocity = 0;
      }

      const u = progress;

      // 镜头层叠后的当前姿态：推拉结束后要能原样交还给它
      cameraRestPosition.copy(camera.position);
      cameraRestQuaternion.copy(camera.quaternion);
      camera.updateMatrixWorld();

      // 只在「刚开始读」的那一帧记录起点
      if (reading && !wasTransitioning) {
        capturedPosition.copy(camera.position);
        camera.getWorldPosition(cameraWorldPosition);
        camera.getWorldDirection(viewDirection);

        offset.copy(pivotOffset).applyQuaternion(restQuaternion);
        paperPivot.copy(restPosition).add(offset);
        offset.copy(pivotOffset).applyQuaternion(tiltedQuaternion);
        paperPivot.sub(offset);
        newspaper.parent?.localToWorld(paperPivot);

        paperQuaternion.copy(tiltedQuaternion);
        if (newspaper.parent) {
          newspaper.parent.getWorldQuaternion(parentQuaternion);
          paperQuaternion.premultiply(parentQuaternion);
        }

        // 起点视线落点：沿当前朝向、和报纸同距离的那个点
        capturedTarget
          .copy(cameraWorldPosition)
          .addScaledVector(viewDirection, cameraWorldPosition.distanceTo(paperPivot));
      }

      newspaper.quaternion.copy(restQuaternion).slerp(tiltedQuaternion, u);
      offset.copy(pivotOffset).applyQuaternion(restQuaternion);
      newspaper.position.copy(restPosition).add(offset);
      offset.copy(pivotOffset).applyQuaternion(newspaper.quaternion);
      newspaper.position.sub(offset);
      newspaper.updateWorldMatrix(true, false);

      if (u > 0) {
        const fov = MathUtils.degToRad(camera.fov);
        const distance = Math.max(
          0.27 / (2 * Math.tan(fov / 2) * 0.68),
          0.36 / (2 * Math.tan(fov / 2) * camera.aspect * 0.84),
          0.4,
        );
        target.set(0, distance, 0.07).applyQuaternion(paperQuaternion).add(paperPivot);
        camera.parent && camera.parent.worldToLocal(target);
        camera.position.lerpVectors(capturedPosition, target, u);
        camera.updateMatrixWorld(true);
        camera.getWorldPosition(cameraWorldPosition);

        // 看向报纸的进度比位移更快收尾，避免最后一小段还在飘
        const eased = 1 - (1 - u) ** 1.35;
        lookPoint.lerpVectors(capturedTarget, paperPivot, eased);
        lookMatrix.lookAt(cameraWorldPosition, lookPoint, up);
        lookQuaternion.setFromRotationMatrix(lookMatrix);
        if (camera.parent) {
          camera.parent.getWorldQuaternion(parentQuaternion).invert();
          lookQuaternion.premultiply(parentQuaternion);
        }
        camera.quaternion.copy(lookQuaternion);

        const handover = MathUtils.smoothstep(u, 0, 0.08);
        camera.position.lerp(cameraRestPosition, 1 - handover);
        camera.quaternion.slerp(cameraRestQuaternion, 1 - handover);
        camera.updateMatrixWorld(true);
      }

      if (!button) return;

      newspaper.updateMatrixWorld(true);
      button.disabled = reading || progress > 0;
      if (reading || progress > 0) {
        button.style.visibility = "hidden";
        return;
      }

      camera.updateMatrixWorld();
      bounds.setFromObject(newspaper);

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      let onScreen = false;

      for (let index = 0; index < 8; index++) {
        corner
          .set(
            index & 1 ? bounds.max.x : bounds.min.x,
            index & 2 ? bounds.max.y : bounds.min.y,
            index & 4 ? bounds.max.z : bounds.min.z,
          )
          .project(camera);
        onScreen ||= corner.z > -1 && corner.z < 1;

        const x = ((corner.x + 1) * container.clientWidth) / 2;
        const y = ((1 - corner.y) * container.clientHeight) / 2;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }

      if (!onScreen || maxX < 24 || minX > container.clientWidth - 24 || maxY < 0 || minY > container.clientHeight) {
        button.disabled = true;
        button.style.visibility = "hidden";
        return;
      }

      const width = Math.max(48, maxX - minX + 12);
      const height = Math.max(44, maxY - minY + 12);
      button.style.width = `${width}px`;
      button.style.height = `${height}px`;
      button.style.transform = `translate(${Math.max(0, Math.min(container.clientWidth - width, (minX + maxX - width) / 2))}px, ${(minY + maxY - height) / 2}px)`;
      button.style.visibility = "visible";

      // 收回报纸之后把焦点还给热点，键盘用户不用重新 Tab 一遍
      if (wasTransitioning && progress === 0) button.focus({ preventScroll: true });
    },

    dispose() {
      newspaper.position.copy(restPosition);
      newspaper.quaternion.copy(restQuaternion);
    },
  };
}

function findByName(root, sourceName) {
  let found = null;
  root.traverse((node) => {
    if (node.userData.sourceName === sourceName) found = node;
  });
  return found;
}
