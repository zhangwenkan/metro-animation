/**
 * 截图小工具：用 Playwright 驱动本机缓存的 Chromium，固定视口做 A/B 对照。
 *
 *   node tools/shot.mjs --out _mine.png --wait 8000
 *   node tools/shot.mjs --url https://www.tobis.vision/ --click "button" --out _site.png
 *   node tools/shot.mjs --gpu --click page-enter --click "thought=invoice" --walk 0,0,1 --wait-lit 1
 *   （page-enter 是 button[data-ui-sound=page-enter] 的简写）
 *
 * 之所以不用无头以外的窗口：无头模式下 WebGL2 走 SwiftShader，结果稳定、可重复。
 */
import fs from "node:fs";
import path from "node:path";
import { chromium, firefox } from "playwright-core";

const args = new Map();
// --click 可以给多次，按顺序逐个点（例如先 Enter 再点 i 按钮）
const clicks = [];
for (let i = 2; i < process.argv.length; i++) {
  const token = process.argv[i];
  if (!token.startsWith("--")) continue;
  const next = process.argv[i + 1];
  if (next && !next.startsWith("--")) {
    if (token === "--click") clicks.push(next);
    else args.set(token.slice(2), next);
    i++;
  } else {
    args.set(token.slice(2), true);
  }
}

const url = args.get("url") ?? "http://localhost:5173/";
const out = path.resolve(args.get("out") ?? "_shot.png");
const width = Number(args.get("w") ?? 1600);
const height = Number(args.get("h") ?? 900);
const dpr = Number(args.get("dpr") ?? 1);
const wait = Number(args.get("wait") ?? 9000);
const hide = args.get("hide");
const gpu = args.has("gpu");

function findChromium() {
  const cache = path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
  if (!fs.existsSync(cache)) return undefined;

  const dirs = fs
    .readdirSync(cache)
    .filter((name) => /^chromium-\d+$/.test(name))
    .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));

  for (const dir of dirs) {
    const exe = path.join(cache, dir, "chrome-win64", "chrome.exe");
    if (fs.existsSync(exe)) return exe;
  }
  return undefined;
}

const browserName = String(args.get("browser") ?? "chromium");
const launcher = browserName === "firefox" ? firefox : chromium;
// --browser firefox：跨引擎验证。Firefox 无 WebGPU，场景退到 WebGL2，
// 且它没有 CDP，--ax-out 这类 Chromium 专用探针会被跳过。
const browser = await launcher.launch({
  executablePath: browserName === "firefox" ? undefined : findChromium(),
  // 无头模式下拿不到 WebGPU 适配器，场景会退回 WebGL2（uniform buffer 不够，渲不全），
  // 所以 --gpu 时开一个挪到屏幕外的真窗口，走真实显卡。
  headless: !gpu || browserName === "firefox",
  // --disable-http2 是必须的：直连站点时 h2 协商会被对端直接 reset，
  // 表现为 ERR_CONNECTION_CLOSED 连首页都打不开，退回 h1.1 就正常了。
  args: browserName === "firefox"
    ? []
    : gpu
      ? [
          "--enable-unsafe-webgpu",
          "--disable-http2",
          "--window-position=-2400,0",
          `--window-size=${width},${height}`,
          "--disable-lcd-text",
        ]
      : [
          "--enable-unsafe-swiftshader",
          "--use-gl=angle",
          "--use-angle=swiftshader",
          "--disable-http2",
          "--disable-lcd-text",
        ],
});

const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: dpr,
  // --touch：给页面真的触屏能力（PointerEvent.pointerType = "touch"），
  // 后面每次 --click 都改成 tap。不开 isMobile：那会改 viewport meta 的解释，
  // 而这里要验的是「同一布局下的触屏路径」，不是移动端布局。
  hasTouch: args.has("touch"),
});
const useTouch = args.has("touch");

// 这台机器连不上 fonts.googleapis.com，站点会因此挂在 CSS chunk 上、整页走错误边界；
// 而站点自己的样式表里根本没有 Geist（正文用的是本地 amiamie），
// 把这个请求兜成空样式表，视觉上无影响。
if (args.has("no-webfonts")) {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
}

// --assets-local：站点的 /assets/** （模型、音频、EXR）改由本地 public/assets 提供。
// 这台机器拉站点的大文件经常被 ERR_CONNECTION_CLOSED 掐断，导致预加载卡在 Loading，
// 而 demo 资产本来就是从站点拷下来的，换上不影响 DOM / 像素 / 音频内容。
if (args.has("assets-local")) {
  const mediaRoot = path.resolve("public");
  const mime = {
    ".ogg": "audio/ogg",
    ".mp3": "audio/mpeg",
    ".glb": "model/gltf-binary",
    ".exr": "image/x-exr",
    ".webp": "image/webp",
    ".json": "application/json",
    ".png": "image/png",
    ".ico": "image/x-icon",
  };
  await page.route(/tobis\.vision\/assets\//, (route) => {
    const rel = new URL(route.request().url()).pathname.replace(/^\//, "");
    const file = path.join(mediaRoot, rel);
    if (!fs.existsSync(file)) return route.continue();
    return route.fulfill({
      status: 200,
      contentType: mime[path.extname(file)] ?? "application/octet-stream",
      body: fs.readFileSync(file),
    });
  });
}

// --rm：把 prefers-reduced-motion 模拟成 reduce，站点和我这边都会停掉
// 只在时间相位上跑的东西（水牌滚动等），方便做无相位对比。
if (args.has("rm")) await page.emulateMedia({ reducedMotion: "reduce" });

page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning") {
    console.log(`[console.${msg.type()}] ${msg.text()}`);
  }
});
page.on("pageerror", (err) => console.log(`[pageerror] ${err.message}`));
page.on("response", (response) => {
  if (response.status() >= 400) console.log(`[${response.status()}] ${response.url()}`);
});
// 连接被掐断的请求不会进 response，单列一行，否则只看到 ERR_CONNECTION_CLOSED 不知道是谁
page.on("requestfailed", (request) => {
  console.log(`[failed] ${request.failure()?.errorText ?? "?"} ${request.url()}`);
});

// --init-eval @file：在页面任何脚本之前注入（addInitScript）。
// 钩住 AudioBuffer / AudioNode 这类原型方法必须在脚本执行前，事后 evaluate 已经晚了。
const initEval = args.get("init-eval");
if (initEval) {
  const source = fs.readFileSync(path.resolve(String(initEval).replace(/^@/, "")), "utf8");
  await page.addInitScript({ content: source });
}

// waitUntil: load 会被某个挂住的子资源拖到超时，而后面本来就要轮询状态，
// 所以只等 DOMContentLoaded，超时也不当致命错误。
// 直连站点会间歇性 ERR_CONNECTION_RESET / ERR_PROXY_CONNECTION_FAILED（环境代理不稳），
// 同一个进程里重试即可，所以默认重试 4 次。
for (let attempt = 1; attempt <= Number(args.get("retries") ?? 4); attempt++) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    break;
  } catch (err) {
    console.log(`[goto] #${attempt} ${err.message.split("\n")[0]}`);
    if (attempt === Number(args.get("retries") ?? 4)) break;
    await page.waitForTimeout(1500);
  }
}

// --wait-lit <n>：不等固定时长，而是等逐词气泡亮到第 n 个字就立刻截图。
// 猫的表情是在开口那一瞬定下的（再 2.4 秒自己回 Neutral），
// 只有卡住逐词进度才能让两边截到同一个表情。
const waitLit = args.has("wait-lit") ? Number(args.get("wait-lit")) : null;

// 每次 click 前都可以用 --wait-<n> 单独指定点完这一下到下一动之间的等待，
// 缺省时只有最后一下会等 --wait。
for (let index = 0; index < clicks.length; index++) {
  let selector = clicks[index];
  let wantText = null;
  // --click page-enter：入场按钮的长选择器懒得每次写
  if (selector === "page-enter") selector = "button[data-ui-sound=page-enter]";
  // --click "key:Escape"：键盘动作也能插在这条序列里，顺序和点击一致
  if (selector.startsWith("key:")) {
    await page.keyboard.press(selector.slice("key:".length));
    if (index < clicks.length - 1) {
      const step = Number(args.get(`wait-${index + 1}`) ?? 1500);
      await page.waitForTimeout(step);
    }
    continue;
  }
  // --click "dom:<sel>"：直接派发 DOM click（真鼠标会被 3D 投影挪位、打偏热点）
  const domClick = selector.startsWith("dom:");
  if (domClick) selector = selector.slice("dom:".length);
  // --click "thought=starving"：等想法气泡轮到指定那条再点（想法是随机轮换的）
  if (selector.startsWith("thought=")) {
    wantText = selector.slice("thought=".length);
    selector = "div[class*='w-[min(280px'] button[data-ui-sound=expand]";
  }
  const target = page.locator(selector).first();
  await target.waitFor({ state: "attached", timeout: 60000 });

  if (wantText) {
    const textDeadline = Date.now() + 180000;
    while (Date.now() < textDeadline) {
      const text = await target.textContent();
      if (text && text.includes(wantText)) break;
      await page.waitForTimeout(400);
    }
  }

  // 等按钮真正可用（站点在预加载资产期间会把它设成 disabled）
  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    const blocked = await target.evaluate(
      (el) => !!el.disabled || el.getAttribute("aria-disabled") === "true",
    );
    if (!blocked) break;
    await page.waitForTimeout(300);
  }

  // 热点类按钮（报纸）平时 pointer-events-none 且尺寸为 0，要等镜头把它带进画面
  const armed = () =>
    target.evaluate(
      (el) => el.getBoundingClientRect().width > 0 && getComputedStyle(el).pointerEvents !== "none",
    );
  if (!(await armed())) {
    const armDeadline = Date.now() + 60000;
    while (Date.now() < armDeadline) {
      await page.waitForTimeout(200);
      if (await armed()) break;
    }
  }

  // force 跳过可点击性/稳定性检查：主线程被 WebGL 帧占满，那两项会一直等
  if (domClick) await target.evaluate((el) => el.click());
  else if (useTouch) await target.tap({ force: true, timeout: 20000 });
  else await target.click({ force: true, timeout: 20000 });

  if (index < clicks.length - 1) {
    const step = Number(args.get(`wait-${index + 1}`) ?? 1500);
    await page.waitForTimeout(step);
  }
}

// --tab-trail 5：连按 n 次 Tab，记录每次焦点落在谁身上（真正执行放在等待之后，
// 页面没就绪时的焦点轨迹没有意义）
const tabTrail = args.has("tab-trail") ? Number(args.get("tab-trail")) : 0;

if (hide) {
  await page.evaluate((selectors) => {
    for (const selector of selectors.split(",")) {
      for (const el of document.querySelectorAll(selector.trim())) el.style.display = "none";
    }
  }, hide);
}

/**
 * --walk "0,0,1"：进对话之后依次点选项（下标），每步等这句念完再点下一句。
 * 真鼠标事件会先打 pointerdown，气泡靠它判「点在面板外面就收回」，
 * 脚本坐标被 3D 投影挪位时会误关对话，所以这里也直接派发 DOM click。
 */
const walk = args.get("walk");
if (walk) {
  const BOX = "div[class*='w-[min(280px']";
  const CHOICE = `${BOX} button[data-ui-sound=select]`;
  const readState = () =>
    page.evaluate(
      ([BOX, CHOICE]) => {
        const box = document.querySelector(BOX);
        const section = box?.querySelector("section[aria-label^=Ajo]");
        const sr = section?.querySelector("p span.sr-only");
        const spans = section ? section.querySelectorAll("p span[aria-hidden=true] > span") : [];
        return {
          reply:
            sr?.textContent?.trim() ?? section?.querySelector("p")?.textContent?.trim() ?? null,
          chunks: [...spans].map((el) => el.style.opacity),
          listening: !!box?.querySelector("span[class*='listening-indicator']"),
          choices: [...document.querySelectorAll(CHOICE)].map((el) => el.textContent.trim()),
        };
      },
      [BOX, CHOICE],
    );

  // 念完的判据：回复已换成新的一句、逐词全亮、不在 listening；连续两帧一致才算站住
  const settle = async (prevReply) => {
    const deadline = Date.now() + 60000;
    let state = await readState();
    let last = "";
    while (Date.now() < deadline) {
      const spoken = state.chunks.length > 0 && state.chunks.every((o) => o === "1");
      if (state.reply && state.reply !== prevReply && !state.listening && spoken) {
        const key = JSON.stringify([state.reply, state.choices]);
        if (key === last) return state;
        last = key;
      } else last = "";
      await page.waitForTimeout(300);
      state = await readState();
    }
    return state;
  };

  let state = await settle(null);
  for (const raw of String(walk).split(",")) {
    if (!state.choices.length) break;
    const index = Math.min(Number(raw), state.choices.length - 1);
    const before = state.reply;
    await page.locator(CHOICE).nth(index).evaluate((el) => el.click());
    state = await settle(before);
    if (state.reply === before) {
      console.log(`[walk] "${raw}" 点完文本没变，停`);
      break;
    }
  }
  console.log(`[walk] 到达 "${(state.reply ?? "").slice(0, 48)}"`);
}

if (waitLit === null) {
  // --until <sel>：等到某个元素出现（两边加载速度不一样，固定等待容易错位）
  const until = args.get("until");
  if (until) {
    const untilDeadline = Date.now() + 180000;
    while (Date.now() < untilDeadline) {
      if (await page.evaluate((sel) => !!document.querySelector(sel), until)) break;
      await page.waitForTimeout(100);
    }
  }
  await page.waitForTimeout(wait);
} else {
  const litDeadline = Date.now() + 120000;
  while (Date.now() < litDeadline) {
    const lit = await page.evaluate(() => {
      const spans = document.querySelectorAll(
        "div[class*='w-[min(280px'] section[aria-label^=Ajo] p span[aria-hidden=true] > span",
      );
      let count = 0;
      for (const span of spans) if (span.style.opacity === "1") count++;
      return count;
    });
    if (lit >= waitLit) break;
    await page.waitForTimeout(50);
  }
}

if (tabTrail > 0) {
  const trail = [];
  for (let step = 0; step < tabTrail; step++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(150);
    trail.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        const box = el?.getBoundingClientRect();
        return [
          el?.tagName ?? null,
          el?.getAttribute("aria-label") ?? el?.textContent?.trim().slice(0, 24) ?? null,
          box ? `${Math.round(box.x)},${Math.round(box.y)}` : null,
        ];
      }),
    );
  }
  console.log(`[tab] ${JSON.stringify(trail)}`);
}

// --mouse x,y：把鼠标真实地移到某点，用来验证鼠标视差层（事件要 trusted，
// 所以不能直接用 dispatchEvent）
const mouse = args.get("mouse");
if (mouse) {
  const [mx, my] = String(mouse).split(",").map(Number);
  await page.mouse.move(mx, my, { steps: 12 });
  await page.waitForTimeout(1600);
}

// --ax-out <file>：把 Chromium 的无障碍树整棵导出来，用来逐节点比对
// （读屏软件看到的角色、名字、状态就是这棵树，而不是 DOM）。
const axOut = args.get("ax-out");
if (axOut && browserName !== "chromium") {
  console.log(`[ax] 跳过：${browserName} 没有 CDP`);
} else if (axOut) {
  const session = await page.context().newCDPSession(page);
  await session.send("Accessibility.enable");
  const { nodes } = await session.send("Accessibility.getFullAXTree", { depth: -1 });
  const byId = new Map(nodes.map((node) => [node.nodeId, node]));
  const value = (v) => (v === undefined ? null : typeof v === "object" ? (v.value ?? null) : v);
  const rows = [];
  const walk = (node, depth) => {
    if (!node) return;
    let nextDepth = depth;
    if (!node.ignored) {
      const props = {};
      for (const item of node.properties ?? []) props[item.name] = value(item.value);
      const row = { depth, role: value(node.role), name: value(node.name) };
      // 只留会影响读屏念法的状态量，其余（如 focusable、editable）噪声太大
      for (const key of ["checked", "expanded", "selected", "disabled", "required", "level", "live", "pressed", "valuetext", "modal"]) {
        if (props[key] !== undefined) row[key] = props[key];
      }
      rows.push(row);
      nextDepth = depth + 1;
    }
    for (const childId of node.childIds ?? []) walk(byId.get(childId), nextDepth);
  };
  walk(nodes[0], 0);
  fs.mkdirSync(path.dirname(path.resolve(axOut)), { recursive: true });
  fs.writeFileSync(path.resolve(axOut), JSON.stringify(rows, null, 1));
  console.log(`[ax] ${rows.length} 个节点 -> ${axOut}`);
}

// --resize 1000x700：跑起来之后改视口，验证 canvas 后备尺寸、相机与 DOM 叠层的跟随
const resize = args.get("resize");
if (resize) {
  const [resizeWidth, resizeHeight] = String(resize).split("x").map(Number);
  await page.setViewportSize({ width: resizeWidth, height: resizeHeight });
  await page.waitForTimeout(Number(args.get("resize-wait") ?? 2500));
}

const stats = await page.evaluate(() => {
  const canvas = document.querySelector("canvas");
  const rect = canvas?.getBoundingClientRect();
  return {
    size: canvas ? [canvas.width, canvas.height] : null,
    rect: rect ? [Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)] : null,
    text: document.body.innerText.slice(0, 160),
  };
});
console.log("[page]", JSON.stringify(stats));

// --eval <表达式>：在页面里取运行时状态，例如 --eval "__faces.map(f=>f.snapshot())"
// 表达式里的引号和空格在 PowerShell 里过不去，可以写成 --eval @tools/eval-xxx.js 读文件
const evaluate = args.get("eval");
if (evaluate) {
  const source =
    typeof evaluate === "string" && evaluate.startsWith("@")
      ? fs.readFileSync(path.resolve(evaluate.slice(1)), "utf8").trim()
      : evaluate;
  try {
    console.log("[eval]", JSON.stringify(await page.evaluate(source)));
  } catch (err) {
    console.log("[eval-error]", err.message);
  }
}
fs.mkdirSync(path.dirname(out), { recursive: true });

// --clip x,y,w,h：只截一块区域，方便比对纹理细节
const clip = args.get("clip");
if (clip) {
  const [x, y, cw, ch] = clip.split(",").map(Number);
  await page.screenshot({ path: out, clip: { x, y, width: cw, height: ch } });
} else {
  await page.screenshot({ path: out });
}
console.log("[shot]", out);

await browser.close();
