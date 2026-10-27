/t,r=Math.floor(((eQ+=e)+1e-10)/i)*i;
return eQ=Math.max(0,eQ-r),r
}
}),t_=performance.now(),tT=e=>{
if(S)return;
if(N=requestAnimationFrame(tT),T.update(E.current.playing),document.hidden){
t_=e;
return
}let t=Math.min((e-t_)/1e3,.1);
if(t_=e,E.current.playing){
let e=tv.advance(t,E.current.catFps);
e>0&&u?.update(e),_.update(t),ty.update(t,E.current.speed,E.current.handleSway)
}h?.update(t),tc.update(t,E.current.speed,E.current.cameraShake*(1-.65*tp.amount),E.current.playing,E.current.cameraPan*(1-.8*tp.amount)),tp.update(t,f.current,tm.matches),tu?.update(t),td?.update(n.current,t,tm.matches),tx()
};
N=requestAnimationFrame(tT)
}catch(e){
S||r(e instanceof Error?e.message:"Unable to load scene"),S||w(`Unable to start the scene: ${e instanceof Error?e.message:String(e)}`)
}finally{
A=!1,S&&Q()
}
}(),()=>{
S=!0,T.dispose(),m.current=null,g.current=null,cancelAnimationFrame(N),t?.disconnect(),s?.(),e.current=null,k.current=null,L.domElement.remove(),A||Q()
}
},[e,i,r]),(0,b.jsxs)("main",{
className:"relative h-dvh w-full overflow-hidden bg-white",children:[(0,b.jsx)("div",{
ref:v,className:"absolute inset-0"
}),(0,b.jsx)("button",{
ref:l,type:"button","aria-label":"Read the newspaper","data-ui-sound":"expand",tabIndex:c&&t&&!s?0:-1,onClick:()=>{
c&&t&&!n.current&&(m.current?.start(),m.current?.pickupNewspaper(),n.current=!0,f.current=!1,a(!0))
},className:`group invisible absolute top-0 left-0 z-10 cursor-pointer rounded-lg border-0 bg-transparent outline-offset-4 focus-visible:outline-2 focus-visible:outline-white ${c&&t?"":"pointer-events-none"}`
}),(0,b.jsx)(_.AnimatePresence,{
onExitComplete:()=>{
n.current=!1
},children:s&&(0,b.jsx)(La,{
subtitle:h,audio:m,faces:g,voiceSettings:u,seen:o,onClose:()=>{
n.current=!1,a(!1)
}
})
}),(0,b.jsx)("div",{
ref:x,className:"invisible absolute top-0 left-0 z-10 w-[min(280px,calc(100%-32px))]",children:(0,b.jsx)(Lt,{
audio:m,voiceSettings:u,suspended:s,ready:c&&t,faceReactions:g,conversationActive:f
})
}),(0,b.jsx)("div",{
className:"pointer-events-none absolute inset-x-6 bottom-[max(32px,env(safe-area-inset-bottom))] z-20",children:!s&&(0,b.jsx)(FB,{
text:h
})
}),T&&(0,b.jsx)("p",{
role:"alert",className:"absolute right-6 bottom-6 left-6 text-black text-sm",children:T
}),!1]
})
}],67272)
},7365,function(e){
e.n(e.i(67272))
}]);
