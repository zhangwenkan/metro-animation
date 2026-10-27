import { Box3, Object3D, Vector3 } from "three/webgpu";
import { reflector } from "three/tsl";

/**
 * 窗面平面反射（对应 ref/source/02 里构造 ts 的那一段）
 *
 * 主轴取包围盒最短边 → 得到窗面法线；再把法线朝向相机一侧；
 * 目标物体 G 只需位置 + 朝向，reflector 会自己算虚拟相机。
 * 虚拟相机只渲染 layer 2，避免把玻璃自身再反射一层。
 */
export function createWindowReflector(glassMesh, camera, scene) {
  glassMesh.updateWorldMatrix(true, true);
  camera.updateWorldMatrix(true, false);

  const box = new Box3().setFromObject(glassMesh);
  const size = box.getSize(new Vector3());
  const axis = size.x < size.y && size.x < size.z ? 0 : 2;

  const normal = new Vector3().setComponent(axis, 1);
  const target = new Object3D();
  target.position.copy(box.getCenter(new Vector3()));

  const toCamera = camera.getWorldPosition(new Vector3()).sub(target.position);
  if (normal.dot(toCamera) < 0) normal.negate();

  target.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), normal);
  target.updateMatrixWorld(true);

  const node = reflector({
    target,
    resolutionScale: 0.5,
    bounces: false,
    samples: 0,
  });

  node.reflector.getVirtualCamera(camera).layers.set(2);
  scene.add(node.target);

  return node;
}
