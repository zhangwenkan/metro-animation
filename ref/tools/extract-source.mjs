// 从站点 chunk 中按锚点切出关键实现，输出到 ref/source/*.js（随后用 prettier 格式化）
// 用法: node ref/tools/extract-source.mjs [--probe]
import fs from "fs";
import path from "path";

const CHUNK = "ref/site/chunks/1reeeg5qme_uu.js";
const OUT = "ref/source";
const src = fs.readFileSync(CHUNK, "utf8");

const SECTIONS = [
  {
    file: "01-renderer-and-lights.js",
    title:
      "WebGPURenderer 初始化 + 灯光组（烘焙太阳 / 动态遮挡阴影专用光 / 面光）",
    start: "P=new rP,F=new rP;F.background=",
    end: 'draco/gltf/")',
  },
  {
    file: "02-load-and-material-patch.js",
    title:
      "资产加载 + 场景遍历改材质（烘焙 lightMap / 动态阴影 / 玻璃 / 猫脸图集 / 窗反射）",
    start: "if(await L.init(),S)return;",
    end: "weave:$,baked:X}",
  },
  {
    file: "03-camera-rigs.js",
    title:
      "相机四层叠加：鼠标视差 / 车厢抖动 / 过轨接缝冲击 / 闲置回看猫 + 报纸拾取机位",
    start: "let ta=()=>{",
    end: 'tm=window.matchMedia("(prefers-reduced-motion: reduce)")',
  },
  {
    file: "04-letterboard-and-backdrop.js",
    title: "Canvas2D 点阵站名水牌 + 窗外几何分块视差滚动 + 吊环摆动",
    start: 'h=function(){let e=new r_;e.name="Next station letterboard"',
    end: "ty.update(0,0),ta()",
  },

  {
    file: "05-postfx.js",
    title:
      "TSL 后处理：窗外反射景深模糊 / 主 pass 最近邻+像素量化 / 4级 bloom / AgX+调色+暗角",
    start: "a=function(e,t,i,r,s=!1){",
    end: "let tx=()=>{",
    stripEnd: "let tx=()=>{",
  },
  {
    file: "06-render-loop.js",
    title: "主循环：帧时间钳制 / 猫按 fps 量化 / 各 rig 更新 / 后处理合成",
    start: "let tx=()=>{",
    end: "tx()};N=requestAnimationFrame(tT)",
    // 原代码处于 async 函数体内，切片后由 wrap 补上外壳，仅用于让片段可解析/格式化
    wrap: ["async function __slice() {", "}"],
  },
  {
    file: "07-audio-engine.js",
    title:
      "Web Audio 引擎：buffer 总线 / 无缝循环自拼接 / 广播 cues 与 ducking",
    start: "let T=function(e,t){let i=new AudioContext",
    end: "}(void 0,d);m.current=T,e.current=()=>T.start()",
  },
  {
    file: "08-tuning-params.js",
    title: "DialKit 实时调参默认值（Ajo 嗓音 / 音频总线 / 灯光 / 调色 / 运动）",
    start: "let Ln={pitch:2.25",
    end: "E=(0,y.useRef)(R);",
    pad: "}])",
  },
  {
    file: "09-cat-reactions.js",
    title: "猫的情绪状态机：事件 → 表情 + 持续时间（配合 3D 表情图集）",
    start: "let y=[],_=function(e){let t=0;function i(t){",
    end: "}(y);g.current=_;",
  },
];

const probe = process.argv.includes("--probe");
fs.mkdirSync(OUT, { recursive: true });

for (const s of SECTIONS) {
  const a = src.indexOf(s.start);
  const b = a < 0 ? -1 : src.indexOf(s.end, a);
  if (a < 0 || b < 0) {
    console.log(`MISS ${s.file}: start=${a} end=${b}`);
    continue;
  }
  const from = Math.max(0, a - (s.back ?? 0));
  let code = src.slice(from, b + s.end.length);
  if (s.stripEnd && code.endsWith(s.stripEnd))
    code = code.slice(0, -s.stripEnd.length);
  if (s.wrap) code = s.wrap[0] + "\n" + code + "\n" + s.wrap[1];
  if (s.pad) code += s.pad;
  if (probe) {
    console.log(
      `OK ${s.file} [${from},${b + s.end.length}] len=${code.length}`,
    );
    continue;
  }
  const header = [
    `/* ===== ${s.file} =====`,
    ` * ${s.title}`,
    ` * 来源: tobis.vision /_next/static/immutable/chunks/1reeeg5qme_uu.js  offset ${from}-${b + s.end.length - (s.stripEnd?.length ?? 0)}`,
    ` * 说明: 站点原始代码经 Turbopack 压缩与混淆，变量名已被重命名，此处仅做切分与格式化，逻辑未改动。`,
    s.wrap
      ? ` * 注: 片段原处于 async 函数体内，额外包了一层 async function 以便解析。`
      : null,
    s.pad ? ` * 注: 片段尾部补上了被截断的闭合括号（${s.pad}）。` : null,
    ` * 变量名对照见 ref/source/00-name-map.js`,
    ` */`,
    "",
  ]
    .filter(Boolean)
    .join("\n");
  fs.writeFileSync(path.join(OUT, s.file), header + "\n" + code + "\n", "utf8");
  console.log(`WROTE ${s.file} (${code.length} bytes)`);
}
