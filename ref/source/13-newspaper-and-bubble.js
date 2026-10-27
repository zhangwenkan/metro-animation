["S""Z""SH""ZH""F""TH""CH""JH"].includese?.09:.075*t/i.speed
}
}
;
FH.hash[h.length-1]&&d>0&&c.push{
  phone:"AX"duration:.025+.015*i.softness/i.speedstress:.12+.1*i.softnessrelease:!0
}
;
let p=c.reduceet=>e+t.duration0m=Math.min330-l;
ifp>m{
  forlet e of ce.duration*=m/p;
  p=m
}
a.push{
  word:sat:lduration:psegments:cprosody:{
    start:0end:1ending:""nucleusStart:0nucleusEnd:1
  }
}
o=e.index+t.lengthn.push{
  start:r.starts[e.index]end:r.ends[e.index+Math.mint.length32-1]tokenEnd:r.ends[o-1]
}
l+=p+.06/i.speed-Math.mini.overlap.25*p
}
FYau"";
let h=s.finde=>e.index>=o&&/^[a-z0-9]/.teste[0]d=h?r.starts[h.index]:r.limit;
return{
  words:a...functioneti{
    let r=""s=0a=[];
    forlet i of ta.push{
      start:r.length+i.start-send:r.length+i.end-s
    }
    r+=e.slicesi.ends=i.tokenEnd;
    if!t.lengthreturn{
      text:""cues:[]
    }
    ;
    r+=e.slicesi;
    let n=[];
    forlet[et]of a.entries{
      let i=a[e-1]?.end??0s=r.sliceit.start;
      ife>0&&/^[\p{L}\p{M}]*$/u.testscontinue;
      let o=t.start;
      for;
      o>i&&/["'“‘([{¡¿]/.testr[o-1];
      o--;
      n.push{
        start:owordIndex:e
      }
    }
    return{
      text:rcues:n.mapet=>{
        text:r.slice0===t?0:e.startn[t+1]?.startwordIndex:e.wordIndex
      }
    }
  }
  r.sourcend
}
}
ecm=p.words;
if!m.lengthreturn;
let g=i??=new AudioContextf=sb="running"===g.state?null:g.resumey==>{
  let eidbyxv_;
  ifr||f!==sreturn;
  t&&e=[]i=0d=0y=!1x=!1_==>{
    ifv=void 0!x{
      if"running"===g.state{
        let rs=r=g.getOutputTimestamp?."number"==typeof r?.contextTime&&Number.isFiniter.contextTime?r.contextTime:Math.max0g.currentTime-g.outputLatency||g.baseLatency||0)
        ;
        for;
        i<e.length&&e[i].time<=s;
        {
          if!y&&y=!0t{
            type:"start"text:p.textcues:p.cues
          }
          xreturn;
          let r=e[i++];
          ift{
            type:"word"index:r.indexaudioTime:r.time
          }
          xreturn
        }
        ifvoid 0!==b&&s>=b&&i===e.length{
          x=!0t{
            type:"end"
          }
          ;
          return
        }
      }
      v=setTimeout_16
    }
  }
  n={
    scheduledti{
      let r;
      p.cues[d]?.wordIndex===t&&e.push{
        index:d++time:i+"CH"===r=p.words[t].segments[0].phone?.35*r.duration:["P""T""K"].includesr.phone?.62*r.duration:0
      }
      void 0!==v||x||v=setTimeout_16
    }
    finishe{
      b=e
    }
    dispose{
      x=!0clearTimeoutv
    }
  }
  ;
  let T==>{
    "running"!==g.state&&f===s&&h
  }
  ;
  g.addEventListener"statechange"To==>g.removeEventListener"statechange"T;
  let w=g.currentTime+.02S=0M=0A=0N==>{
    ifr||f!==sreturn;
    let e=g.currentTime+.12;
    for;
    S<m.length&&w+m[S].at<e;
    {
      let e=m[S++]t=JSON.stringify[e.worde.segments0===c.intonation?null:e.prosodyc.pitchc.formantc.intonationc.softness]i=l.gett;
      if!i{
        let r=functionet{
          let i=new Float32ArrayMath.max1Math.ceil24e3*e.durationr=[new F9new F9new F9]s=new F9a=[]n=0;
          forlet t of e.segmentsn+=t.durationa.pushn;
          let o=0l=0u=0h=0x811c9dc5;
          forlet t of e.wordh=Math.imulh^t.charCodeAt00x1000193>>>0;
          let d=0c=0p=0m=1;
          forlet n=0;
          n<i.length;
          n++{
            let g=n/24e3;
            for;
            o<e.segments.length-1&&g>=a[o];
            l=a[o++];
            let f=e.segments[o]b=Math.min1g-l/f.duration;
            ifn%16==0{
              let i=F1f.phonebn=e.segments[o+1]l=n?F1n.phone0:i;
              f.release&&i.formants=i.formants.mapet=>FQeFG.UW[t].35*b;
              let u=Math.min.018.28*f.durationh=n?F0g-a[o]-u/u:0y=1;
              ifi.stop{
                let e="CH"===f.phone||"JH"===f.phone?.35:.62;
                y=F0b-e/.12*Math.exp-7*Math.max0b-e-.12
              }
              d=FQi.voice*i.stop?.25:1l.voicehc=FQi.noise*yl.noiseh*1-.65*t.softnessp=FQ+!!i.nasal+!!l.nasalhm=FQf.stressn?.stress??f.stressh;
              forlet e=0;
              e<3;
              e++{
                let s=i.formants[e]a="H"===f.phone?l.formants[e]:s;
                r[e].tuneMath.max80Math.min10800FQal.formants[e]h*t.formant[90130200][e]*t.formant
              }
              s.tuneFQi.noiseHzl.noiseHzhi.stop?2300:1700
            }
            let y=g/e.durationx=155*t.pitch*functioneti{
              if0===ireturn 1;
              let r=.6*Math.sin2*Math.PI*e.start+e.end-e.start*ts=t-e.nucleusStart/Math.max1e-4e.nucleusEnd-e.nucleusStarta=FJs-.15/.75n=0;
              switche.ending{
                case"?":n=2.8*a;
                break;
                case".":n=-1.35*a;
                break;
                case",":n=.7*a;
                break;
                case"…":n=-2.1*FJs;
                break;
                case"!":n=2.4*FJs/.4-3*FJs-.4/.6
              }
              return 2**r+n*i/12
            }
            e.prosodyyt.intonation/24e3v=0;
            ifu=u+x%1<x{
              let e=u/x;
              v=e+e-e*e-1
            }
            else ifu>1-x{
              let e=u-1/x;
              v=e*e+e+e+1
            }
            let _=h=Math.imulh1664525+0x3c6ef35f>>>0/0xffffffff*2-1T=2*u-1-v*.6+.15*Math.sin2*u*Math.PI*d+.015*_*dw=r[0].sampleT+r[1].sampleT*.7-.35*p+r[2].sampleT)
            *.4-.2*pS=s.sample_*cM=F0g/.003+.005*t.softnessA=F0e.duration-g/.012;
            i[n]=.6*Math.tanh4*w+1.6*S*m*M*A
          }
          return i[0]=0i[i.length-1]=0i
        }
        ec;
        i=g.createBuffer1r.length24e3.copyToChannelr0l.setti
      }
      let r=w+e.ats=Math.minc.overlap.25*Aa=Math.maxrg.currentTime+.004M-s;
      w+=a-rA=e.durationM=a+e.duration;
      let o=g.createBufferSourceh=g.createGain;
      o.buffer=io.playbackRate.value=1h.gain.setValueAtTimec.volumeao.connecthh.connectg.destination;
      let d={
        source:ogain:h
      }
      ;
      u.adddo.onended==>{
        o.disconnecth.disconnectu.deleted
      }
      o.starta0e.durationo.stopa+e.duration+.002n?.scheduledS-1a
    }
    S<m.length?a=setTimeoutN30:n?.finishM
  }
  ;
  N
}
;
b?b.theny.catch=>{
  f===s&&h
}
:y
}
stop:hdispose{
  if!r{
    forlet{
      source:egain:t
    }
    ofhr=!0ue.onended=nulle.disconnectt.disconnect;
    u.clearl.cleare||i?.close.catch=>{
    }
    i=void 0
  }
}
}
}
var F6=e.i79993;
let F7=F6.default.nodesLe=F6.default.thoughts.filtere=>"idle"===e.availableWhen;
function Lt{
  audio:eready:tfaceReactions:iconversationActive:rsuspended:s=!1voiceSettings:a
}
{
  let n=e1"Train — Ajo voice"{
    pitch:[2.25.254.5.05]formant:[2.16.253.5.01]speed:[2.6.452.8.05]intonation:[1.3503.05]volume:[.201.01]softness:[.9501.05]overlap:[.0350.12.005]
  }
  ;
  0y.useEffect=>{
    a.current=n
  }
  [na];
  let[ol]=0y.useState!1u=0FN.useReducedMotion[hd]=0y.useState!1[cp]=0y.useStateLe[0].id[mg]=0y.useStatenull[fx]=0y.useStatenullT=0y.useRef{
    trust:0irritation:0turns:0appreciated:[]
  }
  [wS]=0y.useState""[MA]=0y.useState{
    chunks:[]revealed:0
  }
  [NC]=0y.useState!1R=0y.useRefnullE=0y.useRefnullk=0y.useRefnullP=0y.useRefnullF=0y.useRefnullL=F6.default.thoughts.finde=>e.id===cB=F7.finde=>e.id===f;
  function I{
    k.current=nullE.current&&clearTimeoutE.currentE.current=nullR.current?.stope.current?.setDialogueSpeaking!1C!1l!1
  }
  function O{
    Ii.current?.clearr.current=!1F.current=nullxnulld!1
  }
  function Dts{
    var a;
    let ou=F7.finde=>e.id===t;
    if!ureturn;
    T.current=functioneti{
      let{
        trust:rirritation:s
      }
      =ea=[...e.appreciated];
      return"pry"===i||"tease"===i&&s+=1a.includest||"empathize"===i||"offer"===i?r+=2s-=1a.pusht:"respect"===i?r+=1s-=1a.pusht:"apologize"===i&&s-=2a.pusht{
        trust:Math.min4rirritation:Math.max0Math.min3sturns:e.turns+1appreciated:a
      }
    }
    T.current${F.current}:${
      t
    }
    ,s?.intent);let h=(a=T.current,o="neutral",a.irritation>=2?o="irritated":a.trust>=2?o="warmer":a.turns<=2&&(o="tired"),u.replies.find(e=>e.mood===o)??u.replies.find(e=>"neutral"===e.mood)??u.replies[0]);I(),r.current=!0,F.current=t,x(t),S(h.text),A({chunks:[h.text],revealed:0});let d=e.current;if(!d)return void A({chunks:[h.text],revealed:1});d.start(),R.current??=F8({context:d.getContext(),onProgress(e){"start"===e.type?(A({chunks:e.cues.map(e=>e.text),revealed:0}),C(!0),d.setDialogueSpeaking(!0)):"word"===e.type?(i.current?.word(F.current,e.index),A(t=>({...t,revealed:e.index+1}))):"end"===e.type?(i.current?.finish(F.current),C(!1),d.setDialogueSpeaking(!1),A(e=>({...e,revealed:e.chunks.length}))):"stop"===e.type&&(C(!1),d.setDialogueSpeaking(!1))}});let c=d.isAnnouncing();l(c);let p=()=>{if(F.current===t&&!document.hidden){if(d.isAnnouncing()){c=!0,l(!0),E.current=setTimeout(p,100);return}if(E.current=null,c){c=!1,l(!1),k.current=p;return}i.current?.react({nodeId:t,mood:h.mood}),R.current?.speak(h.text,n),C(!0),d.setDialogueSpeaking(!0)}};C(!0),d.setDialogueSpeaking(!0),k.current=p}return(0,y.useEffect)(()=>{if(t)return e.current?.onWorldEvent(e=>{let t=F6.default.thoughts.find(t=>t.availableWhen===e);t&&g({id:t.id,expires:Date.now()+15e3})})},[e,t]),(0,y.useEffect)(()=>{let e;if(!t||s||null!==f)return;let r=()=>{let t=h?9e3:4500+2500*Math.random();m&&(t=h?300:650),e=setTimeout(()=>{if(document.hidden)return void r();if(h){if(document.activeElement===P.current)return void r();d(!1)}else{let e=Le.filter(e=>e.id!==c);m&&Date.now()<m.expires&&i.current?.react({nodeId:"operator",mood:"neutral"}),p(m&&Date.now()<m.expires?m.id:e[Math.floor(Math.random()*e.length)].id),g(null),d(!0)}},t)};return r(),()=>clearTimeout(e)},[f,t,h,m,c,i,s]),(0,y.useEffect)(()=>{let t=()=>{document.hidden&&(k.current=null,E.current&&clearTimeout(E.current),E.current=null,R.current?.stop(),e.current?.setDialogueSpeaking(!1),C(!1),l(!1),A(e=>({...e,revealed:e.chunks.length})))};return document.addEventListener("visibilitychange",t),()=>{document.removeEventListener("visibilitychange",t),E.current&&clearTimeout(E.current),R.current?.dispose(),R.current=null,e.current?.setDialogueSpeaking(!1)}},[e]),(0,y.useEffect)(()=>{s&&(k.current=null,E.current&&clearTimeout(E.current),E.current=null,R.current?.stop(),e.current?.setDialogueSpeaking(!1),r.current=!1,i.current?.clear(),F.current=null,x(null),d(!1),C(!1),l(!1))},[s,e,r,i]),(0,b.jsx)(_.AnimatePresence,{mode:"wait",children:!s&&(h||B)&&(0,b.jsx)(v.motion.div,{exit:{opacity:0,scale:u?1:.94,y:4*!u,pointerEvents:"none"},transition:u?{duration:0}:{type:"spring",stiffness:420,damping:25,opacity:{duration:.18}},className:"origin-bottom-right",children:(0,b.jsx)(FL,{thought:L.text,text:B?w:void 0,words:B?M:void 0,listening:o,buttonRef:P,onActivate:()=>D(L.startNode),onDismiss:O,onContentReady:()=>{let e=k.current;k.current=null,e?.()},choices:N?[]:B?.choices?.map(e=>({id:`${
      B.id
    }
    -${
      e.next
    }
    -${
      e.text
    }
    ,text:e.text,onClick:()=>{F.current===B.id&&D(e.next,e)}}))??(B?.end?[{id:"leave",text:"Leave him to it",onClick:O}]:[])})},"conversation")})}let Li={N:["10001","11001","11001","10101","10011","10011","10001"],E:["11111","10000","10000","11110","10000","10000","11111"],X:["10001","10001","01010","00100","01010","10001","10001"],T:["11111","00100","00100","00100","00100","00100","00100"],S:["01111","10000","10000","01110","00001","00001","11110"],A:["01110","10001","10001","11111","10001","10001","10001"],I:["11111","00100","00100","00100","00100","00100","11111"],O:["01110","10001","10001","10001","10001","10001","01110"],C:["01111","10000","10000","10000","10000","10000","01111"],M:["10001","11011","10101","10101","10001","10001","10001"],G:["01111","10000","10000","10111","10001","10001","01110"],":":["00000","00100","00100","00000","00100","00100","00000"]};var Lr=e.i(64978);let Ls=["What... they put me in the paper?","Gotta start charging for this face, baby."];function La({audio:e,subtitle:t,faces:i,voiceSettings:r,seen:s,onClose:a}){let n=(0,y.useRef)(null),o=(0,y.useRef)(null),l=(0,FN.useReducedMotion)(),u=(0,Lr.useIsPresent)(),[h,d]=(0,y.useState)(!1);(0,y.useEffect)(()=>{let e=setTimeout(()=>d(!0),l?150:800);return()=>clearTimeout(e)},[l]);let[c,p]=(0,y.useState)(null),[m,g]=(0,y.useState)(!1);return(0,y.useEffect)(()=>{let e=n.current;return e?.showModal(),o.current?.focus({preventScroll:!0}),()=>e?.close()},[]),(0,y.useEffect)(()=>{let t;if(!(h&&u)||s.current)return;let a=e.current;if(!a)return;let n=!1,o=0,l=F8({context:a.getContext(),onProgress(e){n||("start"===e.type?(a.setDialogueSpeaking(!0),p({text:Ls[o],chunks:e.cues.map(e=>e.text),count:0})):"word"===e.type?p(t=>t?{...t,count:e.index+1}:t):"end"===e.type&&(a.setDialogueSpeaking(!1),p(e=>e?{...e,count:e.chunks.length}:e),0===o?(o=1,t=setTimeout(d,1e3)):s.current=!0))}});function d(){if(!n&&!document.hidden){if(a.isAnnouncing()){g(!0),t=setTimeout(d,150);return}g(!1),i.current?.react({nodeId:o?"newspaper_nice":"newspaper_photo",mood:"neutral"}),l.speak(Ls[o],r.current)}}t=setTimeout(d,450);let c=()=>{document.hidden&&(n=!0,clearTimeout(t),l.stop(),a.setDialogueSpeaking(!1),g(!1),p(e=>e?{...e,count:e.chunks.length}:e))};return document.addEventListener("visibilitychange",c),()=>{n=!0,clearTimeout(t),document.removeEventListener("visibilitychange",c),l.dispose(),a.setDialogueSpeaking(!1),i.current?.clear()}},[h,u,e,i,s,r]),(0,b.jsxs)(v.motion.dialog,{ref:n,"aria-label":"The Local newspaper",onCancel:e=>{e.preventDefault(),a()},initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:l?.1:.22},className:"fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-[#343434] backdrop:bg-transparent",children:[(0,b.jsx)("button",{type:"button",ref:o,"aria-label":"Put newspaper back",onClick:a,className:"absolute inset-0 h-full w-full cursor-default bg-transparent"}),(0,b.jsxs)("div",{className:"pointer-events-none absolute inset-x-6 bottom-[max(32px,env(safe-area-inset-bottom))] flex flex-col items-center gap-4",children:[(0,b.jsx)("div",{className:"pointer-events-none flex max-w-full items-center justify-center",children:(c||m)&&(0,b.jsxs)("div",{className:"flex max-w-full items-center gap-3 rounded-[20px] bg-[#f2f2ef] py-3 pr-5 pl-3.5 text-[17px] leading-[1.22] tracking-tight shadow-sm",children:[(0,b.jsx)(FC,{}),(0,b.jsx)("div",{className:"min-w-0",children:m?(0,b.jsx)(FE,{}):c&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("span",{className:"sr-only","aria-live":"polite",children:c.text}),(0,b.jsx)("span",{"aria-hidden":"true",children:c.chunks.map((e,t)=>(0,b.jsx)("span",{style:{opacity:+(t<c.count)},className:"transition-opacity duration-75 motion-reduce:transition-none",children:e},`${
      t
    }
    -${
      e
    }
    ))})]})})]})}),t&&(0,b.jsx)(FB,{text:t})]})]})}let Ln={pitch:2.25,formant:2.16,intonation:1.35,speed:2.6,volume:.2,overlap:.035,softness:.95};e.s(["default",0,function({enter:e,revealed:t,onReady:i,onError:r}){let[s,a]=(0,y.useState)(!1),n=(0,y.useRef)(!1),o=(0,y.useRef)(!1),l=(0,y.useRef)(null),u=(0,y.useRef)(Ln),[h,d]=(0,y.useState)(""),[c,p]=(0,y.useState)(!1),m=(0,y.useRef)(null),g=(0,y.useRef)(null),f=(0,y.useRef)(!1),x=(0,y.useRef)(null),v=(0,y.useRef)(null),[T,w]=(0,y.useState)(null),S=e1("Train — audio",{music:[10,0,100,1],carriage:[58,0,100,1],bump:[100,0,100,1],station:[24,0,100,1],cat:[24,0,100,1]}),M=(0,y.useRef)(S);(0,y.useEffect)(()=>{M.current=S,m.current?.setVolumes(S)},[S]);let A=e1("Train — lighting",{exposure:[1.22,.2,2.5,.01],sun:[10,0,10,.1],sky:[1.25,0,4,.05],bounce:[2.65,0,8,.05],weave:[.2,.1,3,.05],dirt:[.49,0,1,.01],glass:[.03,0,.4,.01]}),N=e1("Train — color grade",{enabled:!0,vibrance:[1,-1,1,.01],warmHighlights:[.56,0,1,.01],coolShadows:[.36,0,1,.01],pixelSize:[2,1,4,1],sunGlow:[.09,0,.5,.01]}),C=(0,y.useRef)(N);(0,y.useEffect)(()=>{C.current=N},[N]);let R=e1("Train — motion",{playing:!0,catFps:[16,6,30,1],speed:[30,0,30,.1],exteriorBlur:[2,0,2,.05],handleSway:[2,0,2,.05],cameraShake:[2,0,2,.05],cameraPan:[2,0,2,.05]}),E=(0,y.useRef)(R);(0,y.useEffect)(()=>{E.current=R},[R]);let k=(0,y.useRef)(null);return(0,y.useEffect)(()=>{let e=k.current;if(e)for(let t of(e.renderer.toneMappingExposure=A.exposure,e.sun.intensity=A.sun,e.sky.intensity=A.sky,e.glass.value=A.glass,e.dirt.value=A.dirt,e.weave.value=A.weave,e.baked))t.lightMapIntensity=A.bounce},[A.exposure,A.sun,A.sky,A.glass,A.bounce,A.weave,A.dirt]),(0,y.useEffect)(()=>{let t,s,a,o,u,h,c,b=v.current;if(!b)return;let y=[],_=function(e){let t=0;function i(t){for(let i of e)i.setExpression(t)}return{react(e){let r=function({nodeId:e,mood:t}){return"work_easy"===e?"Laughing":"newspaper_photo"===e?"Surprised":"newspaper_nice"===e?"Happy":"irritated"===t?"Annoyed":"seeds"===e||"operator_support"===e?"Happy":["operator","operator_reply","ticket_tease","private","awake"].includes(e)?"Skeptical":"tired"===t||"night"===e||"rest"===e?"Tired":"food_preference"===e&&"warmer"===t?"Happy":"Neutral"}(e);i(r),t=2.4*("Neutral"!==r),"work_easy"===e.nodeId&&(t=1/0)},word(e,t){"work_easy"===e&&2===t&&i("Happy")},finish(e){"work_easy"===e&&(t=1.2)},clear(){t=0,i("Neutral")},update(r){for(let s of(t>0&&0===(t=Math.max(0,t-Math.max(0,r)))&&i("Neutral"),e))s.update(r)}}}(y);g.current=_;let T=function(e,t){let i=new AudioContext,r=i.createGain();r.gain.value=0,r.connect(i.destination);let s=i.createGain();s.gain.value=1,s.connect(r);let a=i.createGain();a.gain.value=0,a.connect(r);let n=i.createGain();n.gain.value=1,n.connect(a);let o={"ajo-morning":i.createGain(),"carriage-loop":i.createGain(),bump:i.createGain(),"newspaper-pickup":i.createGain(),"station-announcement":i.createGain(),"cat-disclaimer":i.createGain()};for(let[e,t]of Object.entries(o))"ajo-morning"===e?t.connect(n):t.connect("carriage-loop"===e?s:r);o["carriage-loop"].gain.value=.58,o["ajo-morning"].gain.value=.1,o.bump.gain.value=1,o["station-announcement"].gain.value=.24,o["cat-disclaimer"].gain.value=.24;let l=new Map,u=new AbortController,h=!1,d=!1,c=!1,p=!1,m=!0,g=!1,f=!1,b=1/0,y="station-announcement",x=!0,v=0,_=0,T=!1,w=!1,S=new Set,M=!1,A=1/0,N="general",C=0,R="",E=e=>{e!==R&&(R=e,t?.(e))},k=!1,P=()=>{h||(k?e?.("unavailable"):c?e?.("muted"):e?.("running"===i.state?"playing":"blocked"))},F=()=>{h||(!(p&&m)||c||document.hidden?(E(""),"running"===i.state&&i.suspend().then(P)):i.resume().then(P).catch(P))},L=()=>F(),B=()=>F();document.addEventListener("pointerdown",L),document.addEventListener("keydown",L),document.addEventListener("visibilitychange",B),i.addEventListener("statechange",P);let I=Promise.all(["carriage-loop","bump","station-announcement","cat-disclaimer","newspaper-pickup"].map(async e=>{let t=await fetch(`/assets/train/audio/${
      e
    }
    .ogg,{signal:u.signal});if(!t.ok)throw Error(`Unable to load ${
      e
    }
    );let r=await i.decodeAudioData(await t.arrayBuffer());l.set(e,"carriage-loop"===e?function(e,t,i=1){let r=Math.min(Math.floor(t.length/4),Math.round(i*t.sampleRate));if(r<2)return t;let s=t.length-r,a=e.createBuffer(t.numberOfChannels,s,t.sampleRate);for(let e=0;e<t.numberOfChannels;e++){let i=t.getChannelData(e),n=a.getChannelData(e);n.set(i.subarray(r,s));for(let e=0;e<r;e++){let t=e/(r-1)*Math.PI*.5;n[s-r+e]=i[s+e]*Math.cos(t)+i[e]*Math.sin(t)}}return a}(i,r):r)})).then(()=>{d=!0}).catch(()=>{k=!0,P()});function O(e,t,r=!1){let s=i.createBufferSource();s.buffer=l.get(e),s.loop=r;let a=i.createGain();return a.gain.value=t,s.connect(a),a.connect(o[e]),s.onended=()=>{s.disconnect(),a.disconnect()},s.start(),s.buffer.duration}return fetch("/assets/train/audio/ajo-morning.ogg",{signal:u.signal}).then(async e=>{if(!e.ok)throw Error("Unable to load train music");let t=await i.decodeAudioData(await e.arrayBuffer());h||l.set("ajo-morning",t)}).catch(()=>{}),{loaded:I,onWorldEvent:e=>(S.add(e),()=>{S.delete(e)}),getContext:()=>i,isAnnouncing:()=>i.currentTime<v,hasHeardCatDisclaimer:()=>i.currentTime>=A,setDialogueSpeaking(e){w=e},setVolumes(e){let t={"ajo-morning":e.music,"carriage-loop":e.carriage,bump:e.bump,"station-announcement":e.station,"cat-disclaimer":e.cat,"newspaper-pickup":100};for(let e of Object.keys(o)){let r=Math.min(1,Math.max(0,t[e]/100));o[e].gain.setTargetAtTime(r,i.currentTime,.02)}},start(){p||(p=!0,r.gain.setValueAtTime(0,i.currentTime),r.gain.linearRampToValueAtTime(.8,i.currentTime+1.4)),F()},toggle(){c=!c,F(),P()},update(e){var t,r;let o;if(m!==e&&(m=e,F()),!(p&&d&&m)||c||document.hidden||"running"!==i.state)return void E("");let u=i.currentTime;if(!f&&l.has("ajo-morning")&&(f=!0,a.gain.setValueAtTime(0,u),a.gain.linearRampToValueAtTime(1,u+4),O("ajo-morning",1,!0)),M&&u>=A)for(let e of(M=!1,S))e("cat_disclaimer_finished");g||(g=!0,O("carriage-loop",1,!0),b=u+3),u>=b&&!w&&(N="cat-disclaimer"===y?"cat":"general",C=u,v=u+O(y,1),"cat-disclaimer"===y&&(A=v,M=!0),x?(x=!1,y="cat-disclaimer",b=v+4+2*Math.random()):(y="cat-disclaimer"===y?"station-announcement":"cat-disclaimer",b=v+60+40*Math.random())),E(u<v?(t=N,r=u-C,o=FO[t].cues,[...o].reverse().find(e=>r>=e.start)?.en??""):"");let h=u<v||w;h!==T&&(T=h,s.gain.setTargetAtTime(h?.22/.45:1,u,.15),n.gain.setTargetAtTime(h?.35:1,u,h?.2:.8))},pickupNewspaper(){d&&!c&&m&&"running"===i.state&&O("newspaper-pickup",.6)},bump(){if(!(g&&m)||c||document.hidden||"running"!==i.state)return;let e=i.currentTime;e<_||(_=e+O("bump",e<v?.35/.6:1))},dispose(){h=!0,S.clear(),u.abort(),document.removeEventListener("pointerdown",L),document.removeEventListener("keydown",L),document.removeEventListener("visibilitychange",B),i.removeEventListener("statechange",P),i.close()}}}(void 0,d);m.current=T,e.current=()=>T.start(),T.setVolumes(M.current);let S=!1,A=!0,N=0,R=new Set,P=new rP,F=new rP;F.background=new rC("#a9c6d6");let L=new P0({antialias:!1});L.domElement.style.opacity="1",L.setPixelRatio(Math.min(window.devicePixelRatio,1.5)),L.toneMapping=6,L.toneMappingExposure=1.22,L.shadowMap.enabled=!0;let B=new lN("#ffe0aa",10);B.target.position.set(0,1,-1),B.castShadow=!0,B.shadow.mapSize.set(2048,2048),Object.assign(B.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:30}),B.shadow.normalBias=.015;let I=new ll("#c2dcff","#9b7950",1.25);Rt.setLTC(uD.init());let O=new lR("#ffe6c8",5,2.5,1.2);O.position.set(1.51,2.37,-2.18),O.lookAt(0,1,0),P.add(O);let D=new lN("#ffdbb5",.65);D.position.set(-1,.4,2),D.target.position.set(0,1.2,-1),P.add(B,B.target,I,D,D.target);let V=Fn([B,I]),U=Fn([]),z=new lN(0xffffff,0);z.name="Baked sun — moving occluders",z.target.position.copy(B.target.position),z.castShadow=!0,z.shadow.camera.layers.set(1),z.shadow.mapSize.set(1024,1024),Object.assign(z.shadow.camera,{left:-2.5,right:2.5,top:2.5,bottom:-2.5,near:.1,far:25}),z.shadow.normalBias=.01,z.shadow.bias=-1e-4,P.add(z,z.target);let G=Fx(z),j=FM(G.mul(.25).add(.75)),W=Fn([B,I,O,D]),H=FT(.03),q=FT(.49),$=FT(1),X=[],K=new Set,Y=new Set,J=new Set,Z=new uU().setDecoderPath("/assets/decoders/three-r184/draco/gltf/");function Q(){for(let e of(u?.stopAllAction(),c&&u?.uncacheRoot(c),R))e.dispose();for(let e of(o?.dispose(),h?.dispose(),a?.dispose(),G.dispose(),J))e.dispose();for(let e of Y)e.dispose();for(let e of K)e.dispose();Z.dispose(),L.dispose()}return async function(){try{var e,d,m,g,v,M;let r,w,A,O,D,G,Q,ee,et,ei,er,es,ea,en,eo,el,eu,eh,ed,ec,ep,em,eg,ef,eb,ey,ex,ev,e_,eT,ew,eS,eM,eA,eN,eC,eR,eE,ek,eP,eF,eL,eB,eI,eO,eD,eV,eU,ez,eG,ej,eW,eH,eq,e$,eX,eK,eY,eJ,eZ,eQ;if(await L.init(),S)return;b?.appendChild(L.domElement);let[e0,e1,e9,e2,e3,e4,e5]=await Promise.all([new dv().setDRACOLoader(Z).loadAsync("/assets/train/train-v06-optimized.glb"),new dy().loadAsync("/assets/train/lighting/carriage-sunboost-v06.exr"),new dy().loadAsync("/assets/train/lighting/carriage-reflection-v06.exr"),new ln().loadAsync("/assets/train/lighting/glass-smudge.webp"),fetch("/assets/train/lighting/bake-v06.json").then(e=>{if(!e.ok)throw Error("Unable to load baked sun direction");return e.json()}),new dv().setMeshoptDecoder(t5).loadAsync("/assets/cat/cat-locomotion-v06-mexico66.glb"),new ln().loadAsync("/assets/cat/expressions-rounded.webp")]);e5.flipY=!1,e5.colorSpace="",K.add(e5);let e8=e3.sunDirectionBlender;if(3!==e8.length||!e8.every(Number.isFinite))throw Error("Invalid baked sun direction");let e6=new iB(-e8[0],-e8[2],e8[1]).normalize(),e7=e3.sunColorLinear;for(let e of(e7?.length===3&&e7.every(Number.isFinite)&&B.color.setRGB(e7[0],e7[1],e7[2],ie),B.position.copy(B.target.position).addScaledVector(e6,10),z.position.copy(B.position),[e1,e9,e2]))K.add(e);e1.channel=1,e1.flipY=!0,e2.flipY=!1,e2.colorSpace="",e9.mapping=303,P.environment=e9,P.environmentIntensity=.12,F.environment=e9,F.environmentIntensity=.12,e0.scene.traverse(e=>{!0!==e.userData.dynamicPart||String(e.userData.sourceName).startsWith("Grip ")||(e.visible=!1)});let te=e4.scene.getObjectByName("Cat_V1");if(!te)throw Error("Cat_V1 rig missing from character export");te.scale.setScalar(.2),te.position.set(.2012888789,.075,-.96),e4.scene.userData.dynamicPart=!0,e4.scene.userData.sourceName="Animated cat",e0.scene.add(e4.scene),c=e4.scene;let tt=e4.animations.find(e=>"Cat_Train_Idle_v04"===e.name)?.clone();if(!tt)throw Error("Cat idle animation missing from export");let ti=Math.min(...tt.tracks.map(e=>e.times[0]));for(let e of tt.tracks)e.shift(-ti);tt.resetDuration(),tt.name="Cat_Train_Idle",(u=new uo(e4.scene)).clipAction(tt).play(),u.update(0);let tr=e0.cameras.find(e=>e.name.includes("CAM_reference"));if(!tr)throw Error("Reference camera missing from the scene export");if(e0.scene.traverse(e=>{e.name.includes("Glass")&&e.name.includes("main")&&(r=e)}),!r)throw Error("Main window missing from scene export");let ts=(e=r,e.updateWorldMatrix(!0,!0),tr.updateWorldMatrix(!0,!1),O=(A=(w=new r$().setFromObject(e)).getSize(new iB)).x<A.y&&A.x<A.z?0:2,D=new iB().setComponent(O,1),(G=new rv).position.copy(w.getCenter(new iB)),Q=tr.getWorldPosition(new iB).sub(G.position),0>D.dot(Q)&&D.negate(),G.quaternion.setFromUnitVectors(new iB(0,0,1),D),G.updateMatrixWorld(!0),(ee=Fm({target:G,resolutionScale:.5,bounces:!1,samples:0})).reflector.getVirtualCamera(tr).layers.set(2),ee);if(o=ts,P.add(o.target),e0.scene.traverse(e=>{if(e instanceof lo&&(e.visible=!1),!(e instanceof at))return;J.add(e.geometry),e instanceof ac&&(R.add(e.skeleton),e.frustumCulled=!1);l
