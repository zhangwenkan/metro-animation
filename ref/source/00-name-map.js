/* ===== 00-name-map.js =====
 * 站点 chunk 被 Turbopack 压缩 + 混淆，标识符已重命名。
 * 下面是人工比对后整理的「混淆名 → 实际含义」对照表，按 ref/source 下的文件分组。
 * 标注 [?] 的是根据上下文推断、未能 100% 确认的。
 *
 * ── 通用（three.js / three-webgpu 的导出别名，全 chunk 一致）
 *   P0   WebGPURenderer（内置 WebGL2 回退后端）
 *   rP   Scene            rP 实例 P      = 场景
 *   r_   Group            rv           = Object3D
 *   iB   Vector3   iF Vector2   iL Quaternion   rr Euler   r$ Box3   rC Color
 *   at   Mesh      nx BoxGeometry      of PlaneGeometry   __ MeshBasicNodeMaterial
 *   we   MeshStandardNodeMaterial      ok 原 GLB 的 MeshStandardMaterial（被检测出来替换）
 *   nf   CanvasTexture   ln TextureLoader   dy EXRLoader[?]   dv GLTFLoader
 *   uU   DRACOLoader     t5 MeshoptDecoder
 *   uo   AnimationMixer  lo [?]   ac SkinnedMesh
 *   Fn   lightsNode()    Ft/Fx [?]  Fd pass()   Fm reflector()   Ff rtt()
 *   FT   uniform()       Fv texture()  Fw uv()   Fy screenUV  Fb screenSize
 *   Fa   float()         Fs float()    FM vec3() FT vec3 uniform
 *   Fl   mix()           FA [?]        Fg toneMapping+outputColorSpace 组合
 *   Fp/Fh 常量（织物粗细/相位）[?]
 *
 * ── 01-renderer-and-lights.js
 *   L    renderer
 *   B    太阳 DirectionalLight("#ffe0aa", 10)（位置由 bake json 反算，主要用来投影）
 *   I    HemisphereLight("#c2dcff", "#9b7950", 1.25)
 *   O    RectAreaLight("#ffe6c8", 5, 2.5, 1.2)  窗面光
 *   D    补充 DirectionalLight("#ffdbb5", .65)
 *   z    只投影不发光的方向光 "Baked sun — moving occluders"（shadow.camera.layers = 1）
 *   G    z 的 shadow node； j = mix(G*0.25+0.75)，乘到烘焙 lightMap 上做动态阴影
 *   V    lightsNode([B,I])     W lightsNode([B,I,O,D])     U lightsNode([]) 烘焙件专用
 *   H    glass 强度 uniform     q 玻璃脏污 uniform     $ 织物 weave uniform
 *   X    需要走烘焙光路的材质数组   K 贴图集合  Y 材质集合  J 几何集合  R 骨骼集合
 *   Z    DRACOLoader（自托管 wasm）
 *
 * ── 02-load-and-material-patch.js
 *   e0 train GLB      e1 carriage-sunboost EXR（lightMap, channel 1）
 *   e9 carriage-reflection EXR（EquirectangularReflectionMapping, 强度 .12）
 *   e2 glass-smudge webp（非颜色数据）      e3 bake-v06.json
 *   e4 cat GLB        e5 expressions webp（4×2 表情图集）
 *   FV   自定义 NodeMaterial：setupLightMap 里 lightMap × 动态阴影；setupEnvironment 关 IBL
 *   FD   environment node 包装，把 iblIrradiance 归零
 *   r    主窗 mesh     ts 窗面平面反射节点(o.reflector.getVirtualCamera)   o reflector 实例
 *   c    猫场景        u AnimationMixer     tn 猫头节点   tt Cat_Train_Idle clip
 *
 * ── 03-camera-rigs.js
 *   tr   相机（来自 GLB 的 WEB_CAM_reference）
 *   ta   resize 处理    tu 字幕框跟随猫头的投影器
 *   td   报纸热点投影器（同时负责“飞过去看报纸”的机位插值）
 *   tc   相机抖动 / 鼠标视差 rig（bump 冲击 + hash 噪声 + hover 转角）
 *   tp   闲置时缓慢转头看向猫的 rig（amount 用于衰减其它抖动）
 *   FU   hash 噪声函数（1D value noise）
 *
 * ── 04-letterboard-and-backdrop.js
 *   h    站名水牌（Canvas2D 点阵 → CanvasTexture → TSL uv 偏移滚动）
 *   Li   5×7 点阵字模表
 *   ty   窗外背景几何分块循环滚动 + 5 组吊环摆动
 *
 * ── 05-postfx.js / 06-render-loop.js
 *   a(...) 返回后处理对象，挂到 F：
 *     c/pixelSize  uv 像素栅格量化   m/lensStrength 镜头（鱼眼）强度，默认 0
 *     g/lensHalfFov f/lensSourceTan 镜头参数      b/lensVignette 暗角
 *     l/blurStrength 窗外景深模糊    u/trainSpeed 列车速度（驱动模糊）
 *     w  bloom 金字塔（4 级降采样 + 9-tap 上采）   S/M/A vibrance/暖高光/冷暗部
 *     N/amount 调色总开关
 *   tv   把 dt 量化到 1/catFps 的步进器（定格动画质感）
 *   T    音频引擎实例   _ 猫的情绪状态机   h/F 其它 rig
 *
 * ── 07-audio-engine.js
 *   r    总输出 gain（淡入）  s 对话 ducking 总线  a 音乐总线  n 音乐子总线[?]
 *   o    {"ajo-morning","carriage-loop",bump,"newspaper-pickup","station-announcement","cat-disclaimer"} 总线
 *   l    name → AudioBuffer（carriage-loop 做了交叉淡化自拼接）
 *   O()  一次性播放（buffer + gain + start）
 *   FO   广播文案表（ja/en + cues[].start 时间戳）
 *
 * ── 08-tuning-params.js
 *   Ln   Ajo 嗓音参数（pitch/formant/intonation/speed/volume/overlap/softness）
 *   e1   DialKit 参数声明函数：e1(分组名, {键: [默认, 最小, 最大, 步长]})
 *
 * ── 09-cat-reactions.js
 *   y    场景事件 → 表情 setExpression 的响应器数组
 *   _    状态机：react(nodeId, mood) / word(id, index) / finish(id) / clear() / update(dt)
 */
