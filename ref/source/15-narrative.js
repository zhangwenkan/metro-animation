var F6=e.i(79993);
let F7=F6.default.nodes,Le=F6.default.thoughts.filter(e=>"idle"===e.availableWhen);
function Lt({
  audio:e,ready:t,faceReactions:i,conversationActive:r,suspended:s=!1,voiceSettings:a
}){
  let n=e1("Train — Ajo voice",{
    pitch:[2.25,.25,4.5,.05],formant:[2.16,.25,3.5,.01],speed:[2.6,.45,2.8,.05],intonation:[1.35,0,3,.05],volume:[.2,0,1,.01],softness:[.95,0,1,.05],overlap:[.035,0,.12,.005]
  });
  (0,y.useEffect)(()=>{
    a.current=n
  },[n,a]);
  let[o,l]=(0,y.useState)(!1),u=(0,FN.useReducedMotion)(),[h,d]=(0,y.useState)(!1),[c,p]=(0,y.useState)(Le[0].id),[m,g]=(0,y.useState)(null),[f,x]=(0,y.useState)(null),T=(0,y.useRef)({
    trust:0,irritation:0,turns:0,appreciated:[]
  }),[w,S]=(0,y.useState)(""),[M,A]=(0,y.useState)({
    chunks:[],revealed:0
  }),[N,C]=(0,y.useState)(!1),R=(0,y.useRef)(null),E=(0,y.useRef)(null),k=(0,y.useRef)(null),P=(0,y.useRef)(null),F=(0,y.useRef)(null),L=F6.default.thoughts.find(e=>e.id===c),B=F7.find(e=>e.id===f);
  function I(){
    k.current=null,E.current&&clearTimeout(E.current),E.current=null,R.current?.stop(),e.current?.setDialogueSpeaking(!1),C(!1),l(!1)
  }function O(){
    I(),i.current?.clear(),r.current=!1,F.current=null,x(null),d(!1)
  }function D(t,s){
    var a;
    let o,u=F7.find(e=>e.id===t);
    if(!u)return;
    T.current=function(e,t,i){
      let{
        trust:r,irritation:s
      }=e,a=[...e.appreciated];
      return("pry"===i||"tease"===i)&&(s+=1),a.includes(t)||("empathize"===i||"offer"===i?(r+=2,s-=1,a.push(t)):"respect"===i?(r+=1,s-=1,a.push(t)):"apologize"===i&&(s-=2,a.push(t))),{
        trust:Math.min(4,r),irritation:Math.max(0,Math.min(3,s)),turns:e.turns+1,appreciated:a
      }
    }(T.current,`${F.current}:${t}`,s?.intent);
    let h=(a=T.current,o="neutral",a.irritation>=2?o="irritated":a.trust>=2?o="warmer":a.turns<=2&&(o="tired"),u.replies.find(e=>e.mood===o)??u.replies.find(e=>"neutral"===e.mood)??u.replies[0]);
    I(),r.current=!0,F.current=t,x(t),S(h.text),A({
      chunks:[h.text],revealed:0
    });
    let d=e.current;
    if(!d)return void A({
      chunks:[h.text],revealed:1
    });
    d.start(),R.current??=F8({
      context:d.getContext(),onProgress(e){
        "start"===e.type?(A({
          chunks:e.cues.map(e=>e.text),revealed:0
        }),C(!0),d.setDialogueSpeaking(!0)):"word"===e.type?(i.current?.word(F.current,e.index),A(t=>({
          ...t,revealed:e.index+1
        }))):"end"===e.type?(i.current?.finish(F.current),C(!1),d.setDialogueSpeaking(!1),A(e=>({
          ...e,revealed:e.chunks.length
        }))):"stop"===e.type&&(C(!1),d.setDialogueSpeaking(!1))
      }
    });
    let c=d.isAnnouncing();
    l(c);
    let p=()=>{
      if(F.current===t&&!document.hidden){
        if(d.isAnnouncing()){
          c=!0,l(!0),E.current=setTimeout(p,100);
          return
        }if(E.current=null,c){
          c=!1,l(!1),k.current=p;
          return
        }i.current?.react({
          nodeId:t,mood:h.mood
        }),R.current?.speak(h.text,n),C(!0),d.setDialogueSpeaking(!0)
      }
    };
    C(!0),d.setDialogueSpeaking(!0),k.current=p
  }return(0,y.useEffect)(()=>{
    if(t)return e.current?.onWorldEvent(e=>{
      let t=F6.default.thoughts.find(t=>t.availableWhen===e);
      t&&g({
        id:t.id,expires:Date.now()+15e3
      })
    })
  },[e,t]),(0,y.useEffect)(()=>{
    let e;
    if(!t||s||null!==f)return;
    let r=()=>{
      let t=h?9e3:4500+2500*Math.random();
      m&&(t=h?300:650),e=setTimeout(()=>{
        if(document.hidden)return void r();
        if(h){
          if(document.activeElement===P.current)return void r();
          d(!1)
        }else{
          let e=Le.filter(e=>e.id!==c);
          m&&Date.now()<m.expires&&i.current?.react({
            nodeId:"operator",mood:"neutral"
          }),p(m&&Date.now()<m.expires?m.id:e[Math.floor(Math.random()*e.length)].id),g(null),d(!0)
        }
      },t)
    };
    return r(),()=>clearTimeout(e)
  },[f,t,h,m,c,i,s]),(0,y.useEffect)(()=>{
    let t=()=>{
      document.hidden&&(k.current=null,E.current&&clearTimeout(E.current),E.current=null,R.current?.stop(),e.current?.setDialogueSpeaking(!1),C(!1),l(!1),A(e=>({
        ...e,revealed:e.chunks.length
      })))
    };
    return document.addEventListener("visibilitychange",t),()=>{
      document.removeEventListener("visibilitychange",t),E.current&&clearTimeout(E.current),R.current?.dispose(),R.current=null,e.current?.setDialogueSpeaking(!1)
    }
  },[e]),(0,y.useEffect)(()=>{
    s&&(k.current=null,E.current&&clearTimeout(E.current),E.current=null,R.current?.stop(),e.current?.setDialogueSpeaking(!1),r.current=!1,i.current?.clear(),F.current=null,x(null),d(!1),C(!1),l(!1))
  },[s,e,r,i]),(0,b.jsx)(_.AnimatePresence,{
    mode:"wait",children:!s&&(h||B)&&(0,b.jsx)(v.motion.div,{
      exit:{
        opacity:0,scale:u?1:.94,y:4*!u,pointerEvents:"none"
      },transition:u?{
        duration:0
      }:{
        type:"spring",stiffness:420,damping:25,opacity:{
          duration:.18
        }
      },className:"origin-bottom-right",children:(0,b.jsx)(FL,{
        thought:L.text,text:B?w:void 0,words:B?M:void 0,listening:o,buttonRef:P,onActivate:()=>D(L.startNode),onDismiss:O,onContentReady:()=>{
          let e=k.current;
          k.current=null,e?.()
        },choices:N?[]:B?.choices?.map(e=>({
          id:`${B.id}-${e.next}-${e.text}`,text:e.text,onClick:()=>{
            F.current===B.id&&D(e.next,e)
          }
        }))??(B?.end?[{
          id:"leave",text:"Leave him to it",onClick:O
        }]:[])
      })
    },"conversation")
  })
}let Li={
  N:["10001","11001","11001","10101","10011","10011","10001"],E:["11111","10000","10000","11110","10000","10000","11111"],X:["10001","10001","01010","00100","01010","10001","10001"],T:["11111","00100","00100","00100","00100","00100","00100"],S:["01111","10000","10000","01110","00001","00001","11110"],A:["01110","10001","10001","11111","10001","10001","10001"],I:["11111","00100","00100","00100","00100","00100","11111"],O:["01110","10001","10001","10001","10001","10001","01110"],C:["01111","10000","10000","10000","10000","10000","01111"],M:["10001","11011","10101","10101","10001","10001","10001"],G:["01111","10000","10000","10111","10001","10001","01110"],":":["00000","00100","00100","00000","00100","00100","00000"]
};
var Lr=e.i(64978);
let Ls=["What... they put me in the paper?","Gotta start charging for this face, baby."];
function La({
  audio:e,subtitle:t,faces:i,voiceSettings:r,seen:s,onClose:a
}){
  let n=(0,y.useRef)(null),o=(0,y.useRef)(null),l=(0,FN.useReducedMotion)(),u=(0,Lr.useIsPresent)(),[h,d]=(0,y.useState)(!1);
  (0,y.useEffect)(()=>{
    let e=setTimeout(()=>d(!0),l?150:800);
    return()=>clearTimeout(e)
  },[l]);
  let[c,p]=(0,y.useState)(null),[m,g]=(0,y.useState)(!1);
  return(0,y.useEffect)(()=>{
    let e=n.current;
    return e?.showModal(),o.current?.focus({
      preventScroll:!0
    }),()=>e?.close()
  },[]),(0,y.useEffect)(()=>{
    let t;
    if(!(h&&u)||s.current)return;
    let a=e.current;
    if(!a)return;
    let n=!1,o=0,l=F8({
      context:a.getContext(),onProgress(e){
        n||("start"===e.type?(a.setDialogueSpeaking(!0),p({
          text:Ls[o],chunks:e.cues.map(e=>e.text),count:0
        })):"word"===e.type?p(t=>t?{
          ...t,count:e.index+1
        }:t):"end"===e.type&&(a.setDialogueSpeaking(!1),p(e=>e?{
          ...e,count:e.chunks.length
        }:e),0===o?(o=1,t=setTimeout(d,1e3)):s.current=!0))
      }
    });
    function d(){
      if(!n&&!document.hidden){
        if(a.isAnnouncing()){
          g(!0),t=setTimeout(d,150);
          return
        }g(!1),i.current?.react({
          nodeId:o?"newspaper_nice":"newspaper_photo",mood:"neutral"
        }),l.speak(Ls[o],r.current)
      }
    }t=setTimeout(d,450);
    let c=()=>{
      document.hidden&&(n=!0,clearTimeout(t),l.stop(),a.setDialogueSpeaking(!1),g(!1),p(e=>e?{
        ...e,count:e.chunks.length
      }:e))
    };
    return document.addEventListener("visibilitychange",c),()=>{
      n=!0,clearTimeout(t),document.removeEventListener("visibilitychange",c),l.dispose(),a.setDialogueSpeaking(!1),i.current?.clear()
    }
  },[h,u,e,i,s,r]),(0,b.jsxs)(v.motion.dialog,{
    ref:n,"aria-label":"The Local newspaper",onCancel:e=>{
      e.preventDefault(),a()
    },initial:{
      opacity:0
    },animate:{
      opacity:1
    },exit:{
      opacity:0
    },transition:{
      duration:l?.1:.22
    },className:"fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-[#343434] backdrop:bg-transparent",children:[(0,b.jsx)("button",{
      type:"button",ref:o,"aria-label":"Put newspaper back",onClick:a,className:"absolute inset-0 h-full w-full cursor-default bg-transparent"
    }),(0,b.jsxs)("div",{
      className:"pointer-events-none absolute inset-x-6 bottom-[max(32px,env(safe-area-inset-bottom))] flex flex-col items-center gap-4",children:[(0,b.jsx)("div",{
        className:"pointer-events-none flex max-w-full items-center justify-center",children:(c||m)&&(0,b.jsxs)("div",{
          className:"flex max-w-full items-center gap-3 rounded-[20px] bg-[#f2f2ef] py-3 pr-5 pl-3.5 text-[17px] leading-[1.22] tracking-tight shadow-sm",children:[(0,b.jsx)(FC,{

          }),(0,b.jsx)("div",{
            className:"min-w-0",children:m?(0,b.jsx)(FE,{

            }):c&&(0,b.jsxs)(b.Fragment,{
              children:[(0,b.jsx)("span",{
                className:"sr-only","aria-live":"polite",children:c.text
              }),(0,b.jsx)("span",{
                "aria-hidden":"true",children:c.chunks.map((e,t)=>(0,b.jsx)("span",{
                  style:{
                    opacity:+(t<c.count)
                  },className:"transition-opacity duration-75 motion-reduce:transition-none",children:e
                },`${t}-${e}`))
              })]
            })
          })]
        })
      }),t&&(0,b.jsx)(FB,{
        text:t
      })]
    })]
  })
}let Ln={
  pitch:2.25,formant:2.16,intonation:1.35,speed:2.6,volume:.2,overlap:.035,softness:.95
};
e.s(["default",0,function({
  enter:e,revealed:t,onReady:i,onError:r
}){
  let[s,a]=(0,y.useState)(!1),n=(0,y.useRef)(!1),o=(0,y.useRef)(!1),l=(0,y.useRef)(null),u=(0,y.useRef)(Ln),[h,d]=(0,y.useState)(""),[c,p]=(0,y.useState)(!1),m=(0,y.useRef)(null),g=(0,y.useRef)(null),f=(0,y.useRef)(!1),x=(0,y.useRef)(null),v=(0,y.useRef)(null),[T,w]=(0,y.useState)(null),S=e1("Train — audio",{
    music:[10,0,100,1],carriage:[58,0,100,1],bump:[100,0,100,1],station:[24,0,100,1],cat:[24,0,100,1]
  }),M=(0,y.useRef)(S);
  (0,y.useEffect)(()=>{
    M.current=S,m.current?.setVolumes(S)
  },[S]);
  let A=e1("Train — lighting",{
    exposure:[1.22,.2,2.5,.01],sun:[10,0,10,.1],sky:[1.25,0,4,.05],bounce:[2.65,0,8,.05],weave:[.2,.1,3,.05],dirt:[.49,0,1,.01],glass:[.03,0,.4,.01]
  }),N=e1("Train — color grade",{
    enabled:!0,vibrance:[1,-1,1,.01],warmHighlights:[.56,0,1,.01],coolShadows:[.36,0,1,.01],pixelSize:[2,1,4,1],sunGlow:[.09,0,.5,.01]
  }),C=(0,y.useRef)(N);
  (0,y.useEffect)(()=>{
    C.current=N
  },[N]);
  let R=e1("Train — motion",{
    playing:!0,catFps:[16,6,30,1],speed:[30,0,30,.1],exteriorBlur:[2,0,2,.05],handleSway:[2,0,2,.05],cameraShake:[2,0,2,.05],cameraPan:[2,0,2,.05]
  }),E=(0,y.useRef)(R);
  (0,y.useEffect)(()=>{
    E.current=R
  },[R]);
  let k=(0,y.useRef)(null);
  return(0,y.useEffect)(()=>{
    let e=k.current;
    if(e)for(let t of(e.renderer.toneMappingExposure=A.exposure,e.sun.intensity=A.sun,e.sky.intensity=A.sky,e.glass.value=A.glass,e.dirt.value=A.dirt,e.weave.value=A.weave,e.baked))t.lightMapIntensity=A.bounce
  },[A.exposure,A.sun,A.sky,A.glass,A.bounce,A.weave,A.dirt]),(0,y.useEffect)(()=>{
    let t,s,a,o,u,h,c,b=v.current;
    if(!b)return;
    let y=[],_=function(e){
      let t=0;
      function i(t){
        for(let i of e)i.setExpression(t)
      }return{
        react(e){
          let r=function({
            nodeId:e,mood:t
          }){
            return"work_easy"===e?"Laughing":"newspaper_photo"===e?"Surprised":"newspaper_nice"===e?"Happy":"irritated"===t?"Annoyed":"seeds"===e||"operator_support"===e?"Happy":["operator","operator_reply","ticket_tease","private","awake"].includes(e)?"Skeptical":"tired"===t||"night"===e||"rest"===e?"Tired":"food_preference"===e&&"warmer"===t?"Happy":"Neutral"
          }(e);
          i(r),t=2.4*("Neutral"!==r),"work_easy"===e.nodeId&&(t=1/0)
        },word(e,t){
          "work_easy"===e&&2===t&&i("Happy")
        },finish(e){
          "work_easy"===e&&(t=1.2)
        },clear(){
          t=0,i("Neutral")
        },update(r){
          for(let s of(t>0&&0===(t=Math.max(0,t-Math.max(0,r)))&&i("Neutral"),e))s.update(r)
        }
      }
    }(y);
    g.current=_;
    let T=function(e,t){
      let i=new AudioContext,r=i.createGain();
      r.gain.value=0,r.connect(i.destination);
      let s=i.createGain();
      s.gain.value=1,s.connect(r);
      let a=i.createGain();
      a.gain.value=0,a.connect(r);
      let n=i.createGain();
      n.gain.value=1,n.connect(a);
      let o={
        "ajo-morning":i.createGain(),"carriage-loop":i.createGain(),bump:i.createGain(),"newspaper-pickup":i.createGain(),"station-announcement":i.createGain(),"cat-disclaimer":i.createGain()
      };
      for(let[e,t]of Object.entries(o))"ajo-morning"===e?t.connect(n):t.connect("carriage-loop"===e?s:r);
      o["carriage-loop"].gain.value=.58,o["ajo-morning"].gain.value=.1,o.bump.gain.value=1,o["station-announcement"].gain.value=.24,o["cat-disclaimer"].gain.value=.24;
      let l=new Map,u=new AbortController,h=!1,d=!1,c=!1,p=!1,m=!0,g=!1,f=!1,b=1/0,y="station-announcement",x=!0,v=0,_=0,T=!1,w=!1,S=new Set,M=!1,A=1/0,N="general",C=0,R="",E=e=>{
        e!==R&&(R=e,t?.(e))
      },k=!1,P=()=>{
        h||(k?e?.("unavailable"):c?e?.("muted"):e?.("running"===i.state?"playing":"blocked"))
      },F=()=>{
        h||(!(p&&m)||c||document.hidden?(E(""),"running"===i.state&&i.suspend().then(P)):i.resume().then(P).catch(P))
      },L=()=>F(),B=()=>F();
      document.addEventListener("pointerdown",L),document.addEventListener("keydown",L),document.addEventListener("visibilitychange",B),i.addEventListener("statechange",P);
      let I=Promise.all(["carriage-loop","bump","station-announcement","cat-disclaimer","newspaper-pickup"].map(async e=>{
        let t=await fetch(`/assets/train/audio/${e}.ogg`,{
          signal:u.signal
        });
        if(!t.ok)throw Error(`Unable to load ${e}`);
        let r=await i.decodeAudioData(await t.arrayBuffer());
        l.set(e,"carriage-loop"===e?function(e,t,i=1){
          let r=Math.min(Math.floor(t.length/4),Math.round(i*t.sampleRate));
          if(r<2)return t;
          let s=t.length-r,a=e.createBuffer(t.numberOfChannels,s,t.sampleRate);
          for(let e=0;
          e<t.numberOfChannels;
          e++){
            let i=t.getChannelData(e),n=a.getChannelData(e);
            n.set(i.subarray(r,s));
            for(let e=0;
            e<r;
            e++){
              let t=e/(r-1)*Math.PI*.5;
              n[s-r+e]=i[s+e]*Math.cos(t)+i[e]*Math.sin(t)
            }
          }return a
        }(i,r):r)
      })).then(()=>{
        d=!0
      }).catch(()=>{
        k=!0,P()
      });
      function O(e,t,r=!1){
        let s=i.createBufferSource();
        s.buffer=l.get(e),s.loop=r;
        let a=i.createGain();
        return a.gain.value=t,s.connect(a),a.connect(o[e]),s.onended=()=>{
          s.disconnect(),a.disconnect()
        },s.start(),s.buffer.duration
      }return fetch("/assets/train/audio/ajo-morning.ogg",{
        signal:u.signal
      }).then(async e=>{
        if(!e.ok)throw Error("Unable to load train music");
        let t=await i.decodeAudioData(await e.arrayBuffer());
        h||l.set("ajo-morning",t)
      }).catch(()=>{

      }),{
        loaded:I,onWorldEvent:e=>(S.add(e),()=>{
          S.delete(e)
        }),getContext:()=>i,isAnnouncing:()=>i.currentTime<v,hasHeardCatDisclaimer:()=>i.currentTime>=A,setDialogueSpeaking(e){
          w=e
        },setVolumes(e){
          let t={
            "ajo-morning":e.music,"carriage-loop":e.carriage,bump:e.bump,"station-announcement":e.station,"cat-disclaimer":e.cat,"newspaper-pickup":100
          };
          for(let e of Object.keys(o)){
            let r=Math.min(1,Math.max(0,t[e]/100));
            o[e].gain.setTargetAtTime(r,i.currentTime,.02)
          }
        },start(){
          p||(p=!0,r.gain.setValueAtTime(0,i.currentTime),r.gain.linearRampToValueAtTime(.8,i.currentTime+1.4)),F()
        },toggle(){
          c=!c,F(),P()
        },update(e){
          var t,r;
          let o;
          if(m!==e&&(m=e,F()),!(p&&d&&m)||c||document.hidden||"running"