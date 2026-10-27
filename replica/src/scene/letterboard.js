import {
  BoxGeometry,
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
} from "three/webgpu";
import { texture, uniform, uv, vec2 } from "three/tsl";

const TEXT = "NEXT STATION: COMING SOON";
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 96;
const DOT_RADIUS = 2.6;
const DOT_SIZE = 7;
const LETTER_STEP = 42;
const ORIGIN = { x: 24, y: 27 };

/** 5 × 7 点阵字模，只做了水牌文案用到的字符 */
const GLYPHS = {
  N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01110"],
  ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
};

const SCROLL_SPEED = 65;
const SCROLL_PAUSE = 2;

/** Canvas2D 画一遍点阵文案，当作滚动贴图（对应 ref/source/04 前半段） */
function createDotMatrixTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#100e09";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < TEXT.length; index++) {
    const glyph = GLYPHS[TEXT[index]];
    if (!glyph) continue;

    glyph.forEach((row, rowIndex) => {
      for (let column = 0; column < row.length; column++) {
        if (row[column] !== "1") continue;
        ctx.fillStyle = "#ffad39";
        ctx.beginPath();
        ctx.arc(
          ORIGIN.x + LETTER_STEP * index + DOT_SIZE * column,
          ORIGIN.y + DOT_SIZE * rowIndex,
          DOT_RADIUS,
          0,
          2 * Math.PI,
        );
        ctx.fill();
      }
    });
  }

  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.wrapS = RepeatWrapping;
  return map;
}

/**
 * 站名水牌：车厢里唯一一块自发光屏幕，文案以 65px/s 从右往左滚，
 * 每滚完一圈停 2 秒再重来；开了 reduced-motion 就固定在开头不滚。
 */
export function createLetterboard() {
  const root = new Group();
  root.name = "Next station letterboard";
  root.position.set(-1.97, 2.27, -1.32);

  const housingGeometry = new BoxGeometry(1.34, 0.27, 0.065);
  const housingMaterial = new MeshStandardNodeMaterial({
    color: "#373b38",
    roughness: 0.75,
    metalness: 0.25,
  });
  root.add(new Mesh(housingGeometry, housingMaterial));

  const map = createDotMatrixTexture();
  const scroll = uniform(0);

  const screenGeometry = new PlaneGeometry(1.26, 0.21);
  const screenMaterial = new MeshBasicNodeMaterial();
  // 站点这里用的是字面量 0.45：它们还留了一个 uniform，但材质从没引用过，
  // 所以 reduced-motion 分支里那个“整屏装下全文”的赋值实际上是死代码。
  screenMaterial.colorNode = texture(map, vec2(uv().x.mul(0.45).add(scroll), uv().y));

  const screen = new Mesh(screenGeometry, screenMaterial);
  screen.position.z = 0.0335;
  root.add(screen);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const loopLength = SCROLL_PAUSE + CANVAS_WIDTH / SCROLL_SPEED;
  let elapsed = 0;

  return {
    root,
    update(dt) {
      if (reducedMotion.matches) {
        scroll.value = 0;
        return;
      }
      elapsed += dt;
      const travelled = SCROLL_SPEED * Math.max(0, (elapsed % loopLength) - SCROLL_PAUSE);
      scroll.value = travelled / CANVAS_WIDTH;
    },
    dispose() {
      housingGeometry.dispose();
      housingMaterial.dispose();
      screenGeometry.dispose();
      screenMaterial.dispose();
      map.dispose();
    },
  };
}
