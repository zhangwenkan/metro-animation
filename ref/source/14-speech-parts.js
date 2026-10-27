subgroupIndexCg.subgroupMaxCg.subgroupMinCg.subgroupMulCg.subgroupOrCg.subgroupShuffleCg.subgroupShuffleDownCg.subgroupShuffleUpCg.subgroupShuffleXorCg.subgroupSize,
Cg.subgroupXorCg.tanCg.tanhCg.tangentGeometryCg.tangentLocalCg.tangentViewCg.tangentWorld;
let Fv=Cg.texture;
Cg.texture3DCg.textureBarrierCg.textureBicubicCg.textureBicubicLevelCg.textureCubeUVCg.textureLoadCg.textureSizeCg.textureLevelCg.textureStoreCg.thickness,
Cg.timeCg.toneMappingCg.toneMappingExposureCg.toonOutlinePassCg.transformDirectionCg.transformNormalCg.transformNormalToViewCg.transformedClearcoatNormalView,
Cg.transformedNormalViewCg.transformedNormalWorldCg.transmissionCg.transposeCg.triNoise3D;
let F_=Cg.triplanarTexture;
Cg.triplanarTexturesCg.truncCg.uintCg.uintBitsToFloat;
let FT=Cg.uniform;
Cg.uniformArrayCg.uniformCubeTextureCg.uniformGroupCg.uniformFlowCg.uniformTextureCg.unpackHalf2x16Cg.unpackSnorm2x16Cg.unpackUnorm2x16Cg.unpremultiplyAlpha,
Cg.userData;
let Fw=Cg.uv;
Cg.uvec2Cg.uvec3Cg.uvec4Cg.varyingCg.varyingProperty;
let FS=Cg.vec2FM=Cg.vec3FA=Cg.vec4;
Cg.vectorComponentsCg.velocityCg.vertexColorCg.vertexIndexCg.vertexStageCg.vibranceCg.viewZToLogarithmicDepthCg.viewZToOrthographicDepthCg.viewZToPerspectiveDepth,
Cg.viewZToReversedOrthographicDepthCg.viewZToReversedPerspectiveDepthCg.viewportCg.viewportCoordinateCg.viewportDepthTextureCg.viewportLinearDepthCg.viewportMipTexture,
Cg.viewportOpaqueMipTextureCg.viewportResolutionCg.viewportSafeUVCg.viewportSharedTextureCg.viewportSizeCg.viewportTextureCg.viewportUVCg.wgslCg.wgslFn,
Cg.workgroupArrayCg.workgroupBarrierCg.workgroupIdCg.workingToColorSpaceCg.xor;
var FN=e.i72328;
function FC{
  label:e="Ajo"
}
{
  return0b.jsx"img"{
    src:"/assets/favicon/ajo-open.svg"alt:ewidth:28height:28draggable:!1className:"block size-7 shrink-0 select-none"
  }
}
var FR=e.i27285;
function FE{
  return0b.jsxs"output"{
    className:"flex h-5 items-center gap-1.5 text-[#85857e]"children:[0b.jsx"span"{
      className:"sr-only"children:"Listening to the announcement"
    }
    [012].mape=>0b.jsx"span"{
      "aria-hidden":"true"className:${FR.default.dot} h-1.5 w-1.5 rounded-full bg-current,style:{animationDelay:`${
        -.16*e
      }
      s}},e))]})}var Fk=e.i(25497);let FP={type:"spring",stiffness:420,damping:23,mass:.7},FF={duration:.24,ease:[.22,1.12,.36,1]};function FL({thought:e,text:t,words:i,status:r="Ajo",listening:s=!1,choices:a,onActivate:n,onDismiss:o,buttonRef:l,onContentReady:u}){let h=(0,FN.useReducedMotion)(),d=h?{duration:0}:FP,c=h?{duration:0}:FF,p=(0,y.useRef)(null),m=(0,y.useRef)(null);return(0,y.useEffect)(()=>{if(!t)return;let e=e=>{e.target instanceof Node&&!m.current?.contains(e.target)&&o()},i=e=>{"Escape"===e.key&&o()};return document.addEventListener("pointerdown",e),document.addEventListener("keydown",i),()=>{document.removeEventListener("pointerdown",e),document.removeEventListener("keydown",i)}},[t,o]),(0,y.useEffect)(()=>{t&&p.current?.focus({preventScroll:!0})},[t]),(0,b.jsxs)(v.motion.div,{ref:m,initial:{opacity:0,scale:h?1:.96,y:5*!h},animate:{opacity:1,scale:1,y:0},transition:c,style:{transformOrigin:"calc(100% - 28px) bottom"},className:t&&!s?"relative w-full":"relative ml-auto w-fit max-w-full",children:[(0,b.jsxs)(v.motion.div,{transition:{...d,layout:c},animate:{scale:1,y:0},whileHover:{scale:t||h?1:1.025,y:t||h?0:-2},whileTap:{scale:t||h?1:.94,y:+(!t&&!h)},className:"relative text-[#343430] drop-shadow-[0_3px_6px_#00000018]",children:[(0,b.jsx)(v.motion.div,{layout:!0,transition:c,style:{borderRadius:t?"24px 24px 20px 24px":"28px"},className:"relative overflow-hidden bg-[#f2f2ef] shadow-[inset_0_1px_0_#ffffffb3]",children:t?(0,b.jsxs)("section",{ref:p,tabIndex:-1,"aria-label":"Ajo’s reply",className:"relative min-w-[112px] px-5 pt-4 pb-5 focus:outline-none",children:[(0,b.jsx)("div",{className:`${
        Fk.default.content
      }
      mb-2 flex items-center,children:(0,b.jsx)(FC,{label:r})}),(0,b.jsxs)("p",{"aria-live":"polite",onAnimationEnd:e=>{e.target===e.currentTarget&&u?.()},className:`${
        Fk.default.content
      }
      text-[18px] leading-[1.22] tracking-[-0.03em],children:[s&&(0,b.jsx)(FE,{}),!s&&(i?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("span",{className:"sr-only",children:t}),(0,b.jsx)("span",{"aria-hidden":"true",children:i.chunks.map((e,t)=>(0,b.jsx)("span",{style:{opacity:+(t<i.revealed)},className:"transition-opacity duration-[90ms] motion-reduce:transition-none",children:e},`${
        t
      }
      -${
        e
      }
      ))})]}):t)]},s?"listening":t)]},"speech"):(0,b.jsx)("button",{ref:l,type:"button",onClick:n,"data-ui-sound":"expand",className:`${
        Fk.default.content
      }
      relative block w-full cursor-pointer rounded-full px-5 py-4 text-left text-[17px] leading-[1.15] tracking-[-0.03em] focus-visible:outline-2 focus-visible:outline-[#777] focus-visible:-outline-offset-4,children:e},"thought")}),(0,b.jsx)(_.AnimatePresence,{initial:!1,mode:"wait",children:t?(0,b.jsx)(v.motion.svg,{"aria-hidden":"true",width:"25",height:"18",viewBox:"0 0 25 18",className:"absolute right-7 -bottom-[15px] overflow-visible text-[#f2f2ef]",initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.1*!h},children:(0,b.jsx)("path",{fill:"currentColor",d:"M0 0H25C21 5 18 12 8 17C12 9 8 4 0 0Z"})},"tail"):(0,b.jsxs)(v.motion.svg,{"aria-hidden":"true",width:"35",height:"30",viewBox:"0 0 35 30",className:"absolute right-4 -bottom-7 text-[#f2f2ef]",initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.1*!h},children:[(0,b.jsx)("ellipse",{fill:"currentColor",cx:"10",cy:"10",rx:"5.5",ry:"4.5"}),(0,b.jsx)("circle",{fill:"currentColor",cx:"22",cy:"23",r:"2.5"})]},"thought-tail")})]}),(0,b.jsx)(v.motion.div,{layout:!0,transition:d,className:`relative flex flex-col items-start gap-2 pl-2 ${
        t?"mt-7":""
      }
      ,children:(0,b.jsx)(_.AnimatePresence,{initial:!1,mode:"popLayout",children:t&&a.map((e,t)=>(0,b.jsx)(v.motion.button,{layout:"position",type:"button",onClick:e.onClick,"data-ui-sound":"select",initial:{opacity:0,y:h?0:-8,scale:h?1:.95},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,pointerEvents:"none",y:h?0:-4,scale:h?1:.97},whileHover:{x:3*!h,scale:h?1:1.025},whileTap:{scale:h?1:.94},transition:{...d,delay:h?0:.36+.035*t,opacity:{duration:.12*!h}},className:"max-w-full cursor-pointer rounded-[16px] bg-[#e5e5e1] px-4 py-3 text-left text-[#464640] text-[13px] leading-[1.15] tracking-[-0.02em] shadow-[0_3px_10px_#00000015] hover:bg-[#f4f4f1] focus-visible:outline-2 focus-visible:outline-[#777] focus-visible:outline-offset-3",children:e.text},e.id))})})]})}function FB({text:e}){return(0,b.jsx)("p",{"aria-live":"polite","aria-atomic":"true",className:"pointer-events-none mx-auto max-w-[48ch] text-balance text-center text-[#ffe373] text-[clamp(18px,1.45vw,22px)] italic leading-[1.15] tracking-[-0.025em] [-webkit-text-stroke:1px_#242019] [paint-order:stroke_fill] [text-shadow:0_1px_2px_#000,0_2px_8px_#0009]",children:e})}let FI=["Neutral","Happy","Surprised","Annoyed","Skeptical","Tired","Closed eyes","Laughing"],FO={cat:{title:"About Ajo",file:"/assets/train/audio/cat-disclaimer.ogg",cues:[{start:0,ja:"お客様にご案内いたします。",en:"May we have your attention, please."},{start:2.65,ja:"車内におります人型の猫は、アホです。",en:"The humanoid cat in this carriage is Ajo."},{start:6.55,ja:"通常のことですので、特にご対応いただく必要はございません。",en:"This is normal and requires no special action."},{start:11.51,ja:"有効な乗車券を所持しておりますので、座席もご利用いただけます。",en:"He holds a valid ticket and is entitled to use the seats."}]},general:{title:"Next stop",file:"/assets/train/audio/station-announcement.ogg",cues:[{start:0,ja:"次は、静岡。静岡です。",en:"Next is Shizuoka. Shizuoka."},{start:3.68
