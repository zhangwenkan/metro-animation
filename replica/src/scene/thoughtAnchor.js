import { Box3, MathUtils, Vector2, Vector3 } from "three/webgpu";

/**
 * 想法气泡的挂点（对应 ref/source/17-bubble-anchor.js 里那个 tu）
 *
 * 气泡不是钉在屏幕上的：它跟着猫的 head 骨骼走。
 * 先用「整只猫的包围盒顶 - head 世界高度 + 0.04」算出要抬高多少，
 * 再把 head 的世界坐标投到屏幕上，换成像素后：
 *   左边界 = 头的投影 x - 气泡宽 + 35（也就是气泡尾巴正好压在头右侧）
 *   上边界 = 头的投影 y - 78
 * 两边都做 16/20px 与容器边界的安全夹取，最后用 9 的一阶滤波做平滑，
 * 免得骨骼动画的抖动直接抖到 DOM 上。
 *
 * 元素本身由 React 渲染，这里只改它的 transform / visibility。
 */
export function createThoughtAnchor(container, catScene, camera, box) {
  if (!box) return null;

  const head = catScene.getObjectByName("head") ?? catScene;
  const top = new Box3().setFromObject(catScene).max.y;
  const headHeight = head.getWorldPosition(new Vector3()).y;
  const lift = top - headHeight + 0.04;

  const world = new Vector3();
  const target = new Vector2();
  const current = new Vector2();
  let initialised = false;

  return {
    update(dt) {
      head.getWorldPosition(world);
      world.y += lift;
      camera.updateMatrixWorld();
      world.project(camera);

      const width = container.clientWidth;
      const height = container.clientHeight;
      const boxWidth = Math.min(280, width - 32);
      const boxHeight = box.offsetHeight;

      target.set(
        MathUtils.clamp(
          (0.5 * world.x + 0.5) * width - boxWidth + 35,
          16,
          Math.max(16, width - boxWidth - 16),
        ),
        MathUtils.clamp(
          (-(0.5 * world.y) + 0.5) * height - 78,
          20,
          Math.max(20, height - boxHeight - 24),
        ),
      );

      if (initialised) current.lerp(target, 1 - Math.exp(-9 * dt));
      else {
        current.copy(target);
        initialised = true;
      }

      box.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      box.style.visibility = world.z > -1 && world.z < 1 ? "visible" : "hidden";
    },
  };
}