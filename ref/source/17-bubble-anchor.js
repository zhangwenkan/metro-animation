entListener("blur",tb),s=()=>{
  tg.removeEventListener("pointermove",tf),tg.removeEventListener("pointerleave",tb),window.removeEventListener("blur",tb)
},h=function(){
  let e=new r_;
  e.name="Next station letterboard",e.position.set(-1.97,2.27,-1.32);
  let t=new nx(1.34,.27,.065),i=new we({
    color:"#373b38",roughness:.75,metalness:.25
  }),r=new at(t,i);
  e.add(r);
  let s=document.createElement("canvas");
  s.width=1280,s.height=96;
  let a=s.getContext("2d");
  a.fillStyle="#100e09",a.fillRect(0,0,s.width,s.height);
  let n="NEXT STATION: COMING SOON";
  for(let e=0;
  e<n.length;
  e++){
    let t=Li[n[e]];
    t&&t.forEach((t,i)=>{
      for(let r=0;
      r<t.length;
      r++)"1"===t[r]&&(a.fillStyle="#ffad39",a.beginPath(),a.arc(24+42*e+7*r,27+7*i,2.6,0,2*Math.PI),a.fill())
    })
  }let o=new nf(s);
  o.colorSpace=t7,o.wrapS=1e3;
  let l=FT(0),u=FT(.45),h=new __;
  h.colorNode=Fv(o,FS(Fw().x.mul(.45).add(l),Fw().y));
  let d=new of(1.26,.21),c=new at(d,h);
  c.position.z=.0335,e.add(c);
  let p=window.matchMedia("(prefers-reduced-motion: reduce)"),m=0;
  return{
    root:e,update(e){
      if(p.matches){
        u.value=(42*n.length+48)/1280,l.value=0;
        return
      }u.value=.45,m+=e,l.value=65*Math.max(0,m%(2+1280/65)-2)/1280
    },dispose(){
      t.dispose(),i.dispose(),d.dispose(),h.dispose(),o.dispose()
    }
  }
}(),P.add(h.root);
let ty=function(e,t){
  e.updateMatrixWorld(!0);
  let i=new r_,r=new r_;
  t.add(i,r);
  let s=new Map;
  for(let a of[...e.children]){
    let e=String(a.userData.sourceName??a.name),n=e.match(/^Grip (\d+) \| (strap|ivory ring)$/);
    if(n){
      let e=s.get(n[1])??[];
      e.push(a),s.set(n[1],e)
    }else e.startsWith("Sky |")?t.attach(a):e.startsWith("Distant ridge")?r.attach(a):/^(Ground |Road |Guardrail |Grass |Backdrop )/.test(e)&&i.attach(a)
  }let a=(e,i,r)=>{
    let s=[];
    for(let a=r?-2:-1;
    a<=(r?2:1);
    a++){
      let n=0===a?e:e.clone(!0);
      0!==a&&t.add(n),r&&Math.abs(a)%2==1&&(n.scale.x=-1),s.push({
        object:n,offset:a*i
      })
    }return e=>{
      let t=e%(r?2*i:i);
      for(let e of s)e.object.position.x=e.offset-t
    }
  },n=a(i,60,!1),o=a(r,130,!0),l=[];
  for(let t of s.values()){
    let i=new r$;
    for(let e of t)i.union(new r$().setFromObject(e));
    let r=new r_;
    for(let s of(r.position.copy(i.getCenter(new iB)),r.position.y=i.max.y,e.worldToLocal(r.position),e.add(r),r.updateMatrixWorld(!0),t))r.attach(s);
    l.push(r)
  }let u=0,h=0;
  return{
    update(e,t,i=1){
      u+=e*t,h+=e,n(u),o(.22*u),l.forEach((e,t)=>{
        let r=(.9+.1*Math.sin(.43*h))*i;
        e.rotation.z=.075*Math.sin(1.65*h+.32*t)*r,e.rotation.x=.035*Math.sin(1.13*h+.21*t)*r
      })
    }
  }
}(e0.scene,F);
ty.update(0,0),ta(),a=function(e,t,i,r,s=!1){
  let{
    RenderPipeline:a
  }=Fz,n=new a(e),o=r?Fd(r,i,{
    samples:0
  }):null,l=FT(.65),u=FT(15);
  if(o){
    let e=o.getTextureNode("output");
    e.uvNode=Fy,o.getTextureNode("depth").uvNode=Fy;
    let i=o.getViewZNode().negate().max(1),r=FS(Fa(80).div(i).clamp(0,8).mul(i.smoothstep(35,100).oneMinus()).mul(l).mul(u.div(15)).min(12).div(Fb.x),0);
    t.backgroundNode=e.mul(.4).add(e.sample(Fy.add(r.mul(.5))).mul(.2)).add(e.sample(Fy.sub(r.mul(.5))).mul(.2)).add(e.sample(Fy.add(r)).mul(.1)).add(e.sample(Fy.sub(r)).mul(.1)).rgb
  }let h=Fd(t,i,{
    samples:4*!!s
  }),d=h.getTextureNode("output");
  d.value.minFilter=s?Fz.LinearFilter:Fz.NearestFilter,d.value.magFilter=s?Fz.LinearFilter:Fz.NearestFilter;
  let c=FT(2),p=Fy.mul(Fb).div(c).floor().mul(c).add(c.mul(.5)).div(Fb),m=FT(0),g=FT(.567),f=FT(1),b=FT(0),y=Fb.x.div(Fb.y),x=p.sub(.5).mul(2).mul(FS(y,1)),v=x.length().max(1e-5),_=Fl(g.tan(),v.mul(g).tan().div(v),m).div(f),T=s?x.mul(_).div(FS(y,1)).mul(.5).add(.5):p,w=function(e){
    let t=FT(.09),i=e.sample(Fy).rgb,r=i.dot(FM(.2126,.7152,.0722)),s=[],a=Array.from({
      length:4
    },()=>FT(new iF(1,1))),n=(e,t)=>{
      let i=Ff(FA(e,1),1,1,{
        type:1016
      });
      return i.updateBeforeType=cA.FRAME,i.renderTarget.depthBuffer=!1,i.renderTarget.texture.minFilter=1006,i.renderTarget.texture.magFilter=1006,i.renderTarget.texture.generateMipmaps=!1,s.push({
        node:i,divisor:t
      }),i
    },o=[n(i.mul(r.smoothstep(2,2.1)),2)];
    for(let e=1;
    e<4;
    e++){
      let t=o[e-1],i=a[e-1],r=(e,r)=>t.sample(Fy.add(FS(e,r).mul(i))).rgb,s=r(0,0).mul(.125).add(r(-1,-1).add(r(1,-1)).add(r(-1,1)).add(r(1,1)).mul(.125)).add(r(-2,0).add(r(2,0)).add(r(0,-2)).add(r(0,2)).mul(.0625)).add(r(-2,-2).add(r(2,-2)).add(r(-2,2)).add(r(2,2)).mul(.03125));
      o.push(n(s,2**(e+1)))
    }let l=o[3];
    for(let e=2;
    e>=1;
    e--){
      let t=l,i=a[e+1],r=(e,r)=>t.sample(Fy.add(FS(e,r).mul(i))).rgb,s=r(0,0).mul(.25).add(r(-1,0).add(r(1,0)).add(r(0,-1)).add(r(0,1)).mul(.125)).add(r(-1,-1).add(r(1,-1)).add(r(-1,1)).add(r(1,1)).mul(.0625));
      l=n(o[e].sample(Fy).rgb.add(s),2**(e+1))
    }let u=0,h=0,d=new iF;
    return{
      strength:t,sample:e=>l.sample(e).rgb.mul(1.1).mul(t).clamp(0,2),resize(e){
        if(e.getDrawingBufferSize(d),d.x!==u||d.y!==h){
          for(let{
            node:e,divisor:t
          }of(u=d.x,h=d.y,s))e.setSize(Math.max(1,Math.floor(d.x/t)),Math.max(1,Math.floor(d.y/t)));
          o.forEach((e,t)=>{
            a[t].value.set(1/e.renderTarget.width,1/e.renderTarget.height)
          })
        }
      },dispose(){
        for(let{
          node:e
        }of s)e.renderTarget.dispose(),e._quadMesh.material.dispose(),e.dispose()
      }
    }
  }(d),S=FT(0),M=FT(0),A=FT(0),N=FT(1),C=Fg(d.sample(T).add(FA(w.sample(T),0)),Fz.AgXToneMapping,Fz.SRGBColorSpace).toVar(),R=C.rgb,E=FM(.2126,.7152,.0722),k=R.dot(E),P=R.r.max(R.g).max(R.b),F=R.r.min(R.g).min(R.b),L=P.sub(F).div(P.max(.001)),B=Fl(FM(k),R,Fa(1).add(S.mul(L.oneMinus()))),I=k.smoothstep(.45,.9),O=k.smoothstep(.1,.55).oneMinus(),D=FM(.08,-.015,-.0864).mul(M).mul(I),V=FM(-.035,.002,.0833).mul(A).mul(O),U=B.add(D).add(V).clamp();
  n.outputColorTransform=!1;
  let z=Fl(R,U,N),G=s?Fa(1).sub(v.div(y.mul(y).add(1).sqrt()).smoothstep(.65,1).mul(b)):Fa(1);
  return n.outputNode=FA(z.mul(G),C.a),{
    setSceneResolutionScale:e=>h.setResolutionScale(e),lensStrength:m,lensHalfFov:g,lensSourceTan:f,lensVignette:b,glow:w.strength,pixelSize:c,blurStrength:l,trainSpeed:u,vibrance:S,warmth:M,coolShadows:A,amount:N,render:()=>{
      w.resize(e),n.render()
    },dispose:()=>{
      t.backgroundNode=null,o?.dispose(),h.dispose(),w.dispose(),n.dispose()
    }
  }
}(L,P,tr,F);
let tx=()=>{
  if(!a)return;
  let e=C.current;
  a.vibrance.value=e.vibrance,a.warmth.value=e.warmHighlights,a.coolShadows.value=e.coolShadows,a.amount.value=+!!e.enabled,a.pixelSize.value=e.pixelSize,a.glow.value=e.sunGlow,a.blurStrength.value=E.current.exteriorBlur,a.trainSpeed.value=E.current.playing?E.current.speed:0,a.render()
};
if(await L.compileAsync(P,tr),S||(tx(),await T.loaded,S))return;
p(!0),i(!0),(t=new ResizeObserver(ta)).observe(b);
let tv=(eQ=0,{
  advance(e,t=30){
    if(!Number.isFinite(e)||e<=0||!Number.isFinite(t)||t<=0)return 0;
    let i=1/t,r=Math.floor(((eQ+=e)+1e-10)/i)*i;
    return eQ=Math.max(0,eQ-r),r
  }
}),t_=performance.now(),tT=e=>{
  if(