globalThis.TURBOPACK||globalThis.TURBOPACK=[].push["object"==typeof document?document.currentScript:void 021760e=>{
  "use strict";
  let t=nulln=nulla={
  }
  ;
  function re{
    return e&&a=et&&"closed"!==t.state||t=new AudioContext{
      latencyHint:a.latencyHintsampleRate:a.sampleRate
    }
    n=null"suspended"===t.state&&t.resumet
  }
  async function ce{
    let t=re;
    return"suspended"===t.state&&await t.resumet
  }
  function oetn{
    let a=e.createGainr=e.createGainc=e.createGain;
    c.gain.value=1-ta.connectcc.connectr;
    let o=e.createGain;
    o.gain.value=ta.connecto;
    let i=e.createGain;
    i.connectr;
    let l=noi;
    return{
      input:aoutput:rdispose:l?.dispose
    }
  }
  let i=new Map;
  function let{
    switcht.type{
      case"reverb":let narcl;
      return n=t.decay??.5a=t.mix??.3r=t.preDelay??0c=t.damping??0l=t.roomSize??1oeata=>{
        let o=e.sampleRatei=Math.ceiln*l*os=e.createBuffer2io;
        forlet e=0;
        e<2;
        e++{
          let t=s.getChannelDatae;
          forlet e=0;
          e<i;
          e++t[e]=2*Math.random-1*Math.exp-e/.28*i
        }
        ifc>0forlet e=0;
        e<2;
        e++{
          let t=s.getChannelDataen=Math.minc.99a=0;
          forlet e=0;
          e<i;
          e++a=t[e]*1-n+a*nt[e]=a
        }
        let u=e.createConvolver;
        ifu.buffer=sr>0{
          let n=e.createDelayMath.maxr+.011;
          n.delayTime.value=rt.connectnn.connectu
        }
        else t.connectu;
        u.connecta
      }
      ;
      case"convolver":return oet.mix??.5na=>{
        let r=e.createConvolver;
        ift.bufferr.buffer=t.buffer;
        else ift.url{
          let n=i.gett.url;
          ifnr.buffer=n;
          else{
            let n=t.url;
            fetchn.thene=>e.arrayBuffer.thent=>e.decodeAudioDatat.thene=>{
              i.setner.buffer=e
            }
          }
        }
        n.connectrr.connecta
      }
      ;
      case"delay":let su;
      return s=t.time??.25u=t.feedback??.3oet.mix??.3na=>{
        let r=e.createDelayMath.maxs+.011;
        r.delayTime.value=s;
        let c=e.createGain;
        ifc.gain.value=un.connectrr.connectct.feedbackFilter{
          let n=e.createBiquadFilter;
          n.type=t.feedbackFilter.typen.frequency.value=t.feedbackFilter.frequencyn.Q.value=t.feedbackFilter.Q??1c.connectnn.connectr
        }
        else c.connectr;
        r.connecta
      }
      ;
      case"distortion":let d;
      return d=t.amount??50oet.mix??.5tn=>{
        let a=e.createWaveShaperr=new Float32Array44100;
        forlet e=0;
        e<44100;
        e++{
          let t=2*e/44100-1;
          r[e]=Math.tanhd*t
        }
        a.curve=ra.oversample="4x"t.connectaa.connectn
      }
      ;
      case"chorus":let fp;
      return f=t.rate??1.5p=t.depth??.003oet.mix??.3tn=>{
        let a=e.createDelay;
        a.delayTime.value=.012;
        let r=e.createDelay;
        r.delayTime.value=.016;
        let c=e.createOscillator;
        c.type="sine"c.frequency.value=f;
        let o=e.createOscillator;
        o.type="sine"o.frequency.value=1.1*f;
        let i=e.createGain;
        i.gain.value=p;
        let l=e.createGain;
        return l.gain.value=pc.connectii.connecta.delayTimec.starto.connectll.connectr.delayTimeo.startt.connectat.connectra.connectnr.connectn{
          dispose{
            try{
              c.stop
            }
            catche{
            }
            try{
              o.stop
            }
            catche{
            }
          }
        }
      }
      ;
      case"flanger":let yvm;
      return y=t.rate??.5v=t.depth??.002m=t.feedback??.5oet.mix??.5tn=>{
        let a=e.createDelay;
        a.delayTime.value=.005;
        let r=e.createOscillator;
        r.type="sine"r.frequency.value=y;
        let c=e.createGain;
        c.gain.value=vr.connectcc.connecta.delayTimer.start;
        let o=e.createGain;
        return o.gain.value=ma.connectoo.connectat.connectaa.connectn{
          dispose{
            try{
              r.stop
            }
            catche{
            }
          }
        }
      }
      ;
      case"phaser":let ghbk;
      return g=t.rate??.5h=t.depth??1e3b=t.stages??4k=t.feedback??.5oet.mix??.5tn=>{
        let a=[]r=[2006001200240048008e3];
        forlet t=0;
        t<b;
        t++{
          let n=e.createBiquadFilter;
          n.type="allpass"n.frequency.value=r[t%r.length]n.Q.value=.5a.pushn
        }
        forlet e=0;
        e<a.length-1;
        e++a[e].connecta[e+1];
        let c=e.createOscillator;
        c.type="sine"c.frequency.value=g;
        let o=e.createGain;
        forlet e ofo.gain.value=hc.connectoao.connecte.frequency;
        c.start;
        let i=e.createGain;
        return i.gain.value=ka[a.length-1].connectii.connecta[0]t.connecta[0]a[a.length-1].connectn{
          dispose{
            try{
              c.stop
            }
            catche{
            }
          }
        }
      }
      ;
      case"tremolo":let qwTAEPS;
      return q=t.rate??4w=t.depth??.5T=e.createGainA=e.createGainE=e.createGain.gain.value=1-w/2T.connectEE.connectAP=e.createOscillator.type="sine"P.frequency.value=q,
      S=e.createGain.gain.value=w/2P.connectSS.connectE.gainP.start{
        input:Toutput:Adispose{
          try{
            P.stop
          }
          catche{
          }
        }
      }
      ;
      case"vibrato":let RxMGOVB;
      return R=t.rate??5x=t.depth??.002M=e.createGainG=e.createGainO=e.createDelay.delayTime.value=xV=e.createOscillator.type="sine"V.frequency.value=RB=e.createGain(
      .gain.value=xV.connectBB.connectO.delayTimeV.startM.connectOO.connectG{
        input:Moutput:Gdispose{
          try{
            V.stop
          }
          catche{
          }
        }
      }
      ;
      case"bitcrusher":let _CD;
      return _=t.bits??8C=t.mix??1D=t.sampleRateReduction??1oeCtn=>{
        let a=e.createWaveShaperr=2**_c=new Float32Array65536;
        forlet e=0;
        e<65536;
        e++{
          let t=2*e/65536-1;
          ifD>1{
            let t=Math.floore/D*D*2/65536-1;
            c[e]=Math.roundt*r/r
          }
          else c[e]=Math.roundt*r/r
        }
        a.curve=ct.connectaa.connectn
      }
      ;
      case"compressor":let F;
      returnF=e.createDynamicsCompressor.threshold.value=t.threshold??-24F.knee.value=t.knee??30F.ratio.value=t.ratio??4F.attack.value=t.attack??.003F.release.value=t.release??.25,
      {
        input:Foutput:F
      }
      ;
      case"eq":let I=e.createGainL=e.createGain;
      if0===t.bands.lengthreturn I.connectL{
        input:Ioutput:L
      }
      ;
      let j=t.bands.mapt=>{
        let n=e.createBiquadFilter;
        return n.type=t.typen.frequency.value=t.frequencyn.gain.value=t.gainn.Q.value=t.Q??1n
      }
      ;
      I.connectj[0];
      forlet e=0;
      e<j.length-1;
      e++j[e].connectj[e+1];
      return j[j.length-1].connectL{
        input:Ioutput:L
      }
      ;
      case"gain":let $;
      return$=e.createGain.gain.value=t.value{
        input:$output:$
      }
      ;
      case"pan":let Q;
      returnQ=e.createStereoPanner.pan.value=t.value{
        input:Qoutput:Q
      }
    }
  }
  let s=new Map;
  async function uet{
    let n=s.gett;
    ifnreturn n;
    let a=await fetchtr=await a.arrayBufferc=await e.decodeAudioDatar;
    return s.settcc
  }
  var d=e.i71645;
  let f={
    name:"Minimal"author:"Raphael Salaja"version:"1.0.0"description:"An ultra-clean sine-based palette for quiet, transparent UI feedback, made for products that prioritize subtlety, restraint, and smooth interaction cues over expressive flourish.",
    sounds:{
      tap:{
        source:{
          type:"sine"frequency:1200
        }
        envelope:{
          attack:0decay:.012sustain:0release:.004
        }
        gain:.08
      }
      click:{
        source:{
          type:"sine"frequency:800
        }
        envelope:{
          attack:0decay:.015sustain:0release:.005
        }
        gain:.1
      }
      "key-press":{
        source:{
          type:"sine"frequency:1100
        }
        envelope:{
          attack:0decay:.01sustain:0release:.003
        }
        gain:.06
      }
      "toggle-on":{
        layers:[{
          source:{
            type:"sine"frequency:880
          }
          envelope:{
            attack:0decay:.02sustain:0release:.006
          }
          gain:.08
        }
        {
          source:{
            type:"sine"frequency:1320
          }
          envelope:{
            attack:0decay:.02sustain:0release:.006
          }
          delay:.03gain:.07
        }
        ]
      }
      "toggle-off":{
        layers:[{
          source:{
            type:"sine"frequency:1320
          }
          envelope:{
            attack:0decay:.02sustain:0release:.006
          }
          gain:.08
        }
        {
          source:{
            type:"sine"frequency:880
          }
          envelope:{
            attack:0decay:.02sustain:0release:.006
          }
          delay:.03gain:.07
        }
        ]
      }
      checkbox:{
        source:{
          type:"sine"frequency:1e3
        }
        envelope:{
          attack:0decay:.018sustain:0release:.005
        }
        gain:.09
      }
      select:{
        source:{
          type:"sine"frequency:1100
        }
        envelope:{
          attack:0decay:.02sustain:0release:.006
        }
        gain:.08
      }
      deselect:{
        source:{
          type:"sine"frequency:900
        }
        envelope:{
          attack:0decay:.018sustain:0release:.005
        }
        gain:.06
      }
      hover:{
        source:{
          type:"sine"frequency:1300
        }
        envelope:{
          attack:0decay:.01sustain:0release:.004
        }
        gain:.04
      }
      "tab-switch":{
        source:{
          type:"sine"frequency:1050
        }
        envelope:{
          attack:0decay:.015sustain:0release:.005
        }
        gain:.07
      }
      expand:{
        source:{
          type:"sine"frequency:{
            start:800end:1e3
          }
        }
        envelope:{
          attack:0decay:.04sustain:0release:.012
        }
        gain:.06
      }
      collapse:{
        source:{
          type:"sine"frequency:{
            start:1e3end:800
          }
        }
        envelope:{
          attack:0decay:.04sustain:0release:.012
        }
        gain:.06
      }
      "page-enter":{
        source:{
          type:"sine"frequency:{
            start:700end:900
          }
        }
        envelope:{
          attack:.003decay:.04sustain:0release:.015
        }
        gain:.05
      }
      "page-exit":{
        source:{
          type:"sine"frequency:{
            start:900end:700
          }
        }
        envelope:{
          attack:0decay:.04sustain:0release:.015
        }
        gain:.04
      }
      success:{
        layers:[{
          source:{
            type:"sine"frequency:523
          }
          envelope:{
            attack:0decay:.05sustain:0release:.015
          }
          gain:.1
        }
        {
          source:{
            type:"sine"frequency:784
          }
          envelope:{
            attack:0decay:.05sustain:0release:.015
          }
          delay:.06gain:.08
        }
        ]
      }
      error:{
        layers:[{
          source:{
            type:"sine"frequency:300
          }
          envelope:{
            attack:0decay:.04sustain:0release:.012
          }
          gain:.12
        }
        {
          source:{
            type:"sine"frequency:280
          }
          envelope:{
            attack:0decay:.04sustain:0release:.012
          }
          delay:.01gain:.1
        }
        ]
      }
      warning:{
        layers:[{
          source:{
            type:"sine"frequency:440
          }
          envelope:{
            attack:0decay:.03sustain:0release:.01
          }
          gain:.1
        }
        {
          source:{
            type:"sine"frequency:466
          }
          envelope:{
            attack:0decay:.03sustain:0release:.01
          }
          delay:.008gain:.08
        }
        ]
      }
      notification:{
        layers:[{
          source:{
            type:"sine"frequency:660
          }
          envelope:{
            attack:0decay:.05sustain:0release:.02
          }
          gain:.1
        }
        {
          source:{
            type:"sine"frequency:880
          }
          envelope:{
            attack:0decay:.04sustain:0release:.015
          }
          delay:.08gain:.08
        }
        ]
      }
      info:{
        source:{
          type:"sine"frequency:880
        }
        envelope:{
          attack:0decay:.04sustain:0release:.015
        }
        gain:.08
      }
      copy:{
        layers:[{
          source:{
            type:"sine"frequency:1e3
          }
          envelope:{
            attack:0decay:.012sustain:0release:.004
          }
          gain:.08
        }
        {
          source:{
            type:"sine"frequency:1200
          }
          envelope:{
            attack:0decay:.012sustain:0release:.004
          }
          delay:.035gain:.07
        }
        ]
      }
      send:{
        source:{
          type:"sine"frequency:{
            start:600end:1e3
          }
        }
        envelope:{
          attack:0decay:.04sustain:0release:.012
        }
        gain:.08
      }
      delete:{
        source:{
          type:"sine"frequency:{
            start:500end:250
          }
        }
        envelope:{
          attack:0decay:.05sustain:0release:.015
        }
        gain:.1
      }
      undo:{
        source:{
          type:"sine"frequency:{
            start:800end:600
          }
        }
        envelope:{
          attack:0decay:.035sustain:0release:.01
        }
        gain:.07
      }
      pop:{
        source:{
          type:"sine"frequency:{
            start:400end:200
          }
        }
        envelope:{
          attack:0decay:.04sustain:0release:.012
        }
        gain:.1
      }
      swoosh:{
        source:{
          type:"sine"frequency:{
            start:600end:1400
          }
        }
        envelope:{
          attack:.005decay:.04sustain:0release:.015
        }
        gain:.05
      }
      slide:{
        source:{
          type:"sine"frequency:{
            start:800end:1100
          }
        }
        envelope:{
          attack:.003decay:.035sustain:0release:.012
        }
        gain:.05
      }
    }
  }
  ;
  function pe{
    let t=e instanceof Element?e.closest'button,a[href],summary,select,input[type="button"],input[type="submit"],input[type="reset"],input[type="checkbox"],input[type="radio"],input[type="range"],[role="button"],[role="tab"],[role="switch"],[role="checkbox"],[role="radio"],[role="menuitem"],[role="slider"],[data-ui-sound]')
    :null;
    return!t||t.closest'[inert], [aria-disabled="true"], [data-ui-sound="off"]'||t.matches":disabled"?null:t
  }
  e.s["UISounds"0function{
    return0d.useEffect=>{
      let ea=e=Object.keysf.sounds{
        ready:!0name:f.nameauthor:f.authorversion:f.versiondescription:f.descriptiontags:f.tagssounds:eplayet{
          let ac=f.sounds[e];
          if!cthrow ErrorSound "${e}" not found in patch "${
            f.name
          }
          "`);return function(e,t,n,a,r){var c;let{layers:o,effects:i}="layers"in(c=t)?c:{layers:[c],effects:[]},s=r??e.destination,d=function(e,t,n){if(0===t.length)return{input:n,output:n,dispose(){}};let a=t.map(t=>l(e,t));for(let e=0;e<a.length-1;e++)a[e].output.connect(a[e+1].input);return a[a.length-1].output.connect(n),{input:a[0].input,output:a[a.length-1].output,dispose(){for(let e of a)e.dispose?.()}}}(e,i??[],s),f=a??e.currentTime,p=n?.velocity??1,y=n?.jitter,v=y?.detune?(2*Math.random()-1)*y.detune:0,m=y?.volume?1+(2*Math.random()-1)*y.volume:1,g=y?.playbackRate?1+(2*Math.random()-1)*y.playbackRate:1,h=[d.dispose],b=[],k=[];for(let t of o){let a,r=f+(t.delay??0),c=(t.gain??.5)*(n?.volume??1)*p*m,{node:o,duration:i}=function(e,t,n,a){let r=e.createGain();if(!t)return r.gain.setValueAtTime(n,a),r.gain.setTargetAtTime(1e-4,a,.15),{node:r,duration:.5};let c=t.attack??0,o=t.decay,i=t.sustain??0,l=t.release??0,s=Math.max(i*n,1e-4),u=o/3;return r.gain.setValueAtTime(1e-4,a),c>0?r.gain.linearRampToValueAtTime(n,a+c):r.gain.setValueAtTime(n,a),i>0?(r.gain.setTargetAtTime(s,a+c,u),l>0&&r.gain.setTargetAtTime(1e-4,a+c+o,l/3)):r.gain.setTargetAtTime(1e-4,a+c,u),{node:r,duration:c+o+l}}(e,t.envelope,c,r);k.push(o);let s=function(e,t,n,a){switch(t.type){case"sine":case"triangle":case"square":case"sawtooth":let r,c=e.createOscillator();if(c.type=t.type,"number"==typeof t.frequency?c.frequency.setValueAtTime(t.frequency,n):(c.frequency.setValueAtTime(t.frequency.start,n),c.frequency.exponentialRampToValueAtTime(Math.max(t.frequency.end,1),n+a)),t.detune&&(c.detune.value=t.detune),c.start(n),c.stop(n+a+.1),t.fm){let o="number"==typeof t.frequency?t.frequency:t.frequency.start;(r=e.createOscillator()).type="sine",r.frequency.value=o*t.fm.ratio;let i=e.createGain();i.gain.value=t.fm.depth,r.connect(i),i.connect(c.frequency),r.start(n),r.stop(n+a+.1)}return{node:c,scheduled:c,frequencyParam:c.frequency,detuneParam:c.detune};case"noise":let o,i;return o=function(e,t,n){let a=e.sampleRate*n,r=e.createBuffer(1,a,e.sampleRate),c=r.getChannelData(0);switch(t){case"pink":!function(e){let t=0,n=0,a=0,r=0,c=0,o=0,i=0;for(let l=0;l<e.length;l++){let s=2*Math.random()-1;t=.99886*t+.0555179*s,n=.99332*n+.0750759*s,a=.969*a+.153852*s,r=.8665*r+.3104856*s,c=.55*c+.5329522*s,o=-.7616*o-.016898*s,e[l]=(t+n+a+r+c+o+i+.5362*s)*.11,i=.115926*s}}(c);break;case"brown":let o=0;for(let e=0;e<c.length;e++)o=(o+.02*(2*Math.random()-1))/1.02,c[e]=3.5*o;break;default:for(let e=0;e<c.length;e++)c[e]=2*Math.random()-1}return r}(e,t.color??"white",a+.1),(i=e.createBufferSource()).buffer=o,i.start(n),i.stop(n+a+.1),{node:i,scheduled:i};case"wavetable":return function(e,t,n,a){let r=new Float32Array(t.harmonics.length+1),c=new Float32Array(t.harmonics.length+1);r[0]=0,c[0]=0;for(let e=0;e<t.harmonics.length;e++)r[e+1]=0,c[e+1]=t.harmonics[e];let o=e.createPeriodicWave(r,c,{disableNormalization:!1}),i=e.createOscillator();return i.setPeriodicWave(o),"number"==typeof t.frequency?i.frequency.setValueAtTime(t.frequency,n):(i.frequency.setValueAtTime(t.frequency.start,n),i.frequency.exponentialRampToValueAtTime(Math.max(t.frequency.end,1),n+a)),i.start(n),i.stop(n+a+.1),{node:i,scheduled:i,frequencyParam:i.frequency,detuneParam:i.detune}}(e,t,n,a);case"sample":let l;return l=e.createBufferSource(),void 0!==t.playbackRate&&(l.playbackRate.value=t.playbackRate),void 0!==t.detune&&(l.detune.value=t.detune),t.loop&&(l.loop=!0,void 0!==t.loopStart&&(l.loopStart=t.loopStart),void 0!==t.loopEnd&&(l.loopEnd=t.loopEnd)),t.buffer?(l.buffer=t.buffer,l.start(n)):t.url&&u(e,t.url).then(t=>{l.buffer=t,l.start(Math.max(n,e.currentTime))}),{node:l,scheduled:l,detuneParam:l.detune,playbackRateParam:l.playbackRate};case"stream":return{node:e.createMediaStreamSource(t.stream)};case"constant":let s;return(s=e.createConstantSource()).offset.value=t.offset??1,s.start(n),s.stop(n+a+.1),{node:s,scheduled:s}}}(e,t.source,r,i);s.detuneParam&&(n?.detune||0!==v)&&(s.detuneParam.value+=(n?.detune??0)+v),s.playbackRateParam&&(n?.playbackRate||1!==g)&&(s.playbackRateParam.value*=(n?.playbackRate??1)*g);let y=s.node,q=[];if(t.filter){for(let n of function(e,t,n){return(Array.isArray(t)?t:[t]).map(t=>(function(e,t,n){if("iir"===t.type){let{node:n}={node:e.createIIRFilter(t.feedforward,t.feedback)};return{node:n}}let{node:a,frequencyParam:r}=function(e,t,n){let a=e.createBiquadFilter();if(a.type=t.type,a.frequency.setValueAtTime(t.frequency,n),a.Q.value=t.resonance??1,void 0!==t.gain&&(a.gain.value=t.gain),t.envelope){let e=t.envelope,r=n+(e.attack??0);a.frequency.setValueAtTime(t.frequency,n),a.frequency.linearRampToValueAtTime(e.peak,r),a.frequency.exponentialRampToValueAtTime(Math.max(t.frequency,1),r+e.decay)}return{node:a,frequencyParam:a.frequency}}(e,t,n);return{node:a,frequencyParam:r,detuneParam:a.detune,QParam:a.Q,gainParam:a.gain}})(e,t,n))}(e,t.filter,r))if(y.connect(n.node),y=n.node,q.push(n),p<1&&n.frequencyParam){let e=n.frequencyParam.value;n.frequencyParam.setValueAtTime(e*(.5+.5*p),r)}}y.connect(o);let w=o,T=[];if(t.effects&&t.effects.length>0){let n=t.effects.map(t=>l(e,t));for(let e=0;e<n.length-1;e++)n[e].output.connect(n[e+1].input);for(let e of(w.connect(n[0].input),w=n[n.length-1].output,n))e.dispose&&T.push(e.dispose)}let A=n?.pan??t.pan;if(t.panner){let n=function(e,t){let n=e.createPanner();return n.panningModel=t.panningModel??"HRTF",n.distanceModel=t.distanceModel??"inverse",n.positionX.value=t.positionX,n.positionY.value=t.positionY,n.positionZ.value=t.positionZ,void 0!==t.orientationX&&(n.orientationX.value=t.orientationX),void 0!==t.orientationY&&(n.orientationY.value=t.orientationY),void 0!==t.orientationZ&&(n.orientationZ.value=t.orientationZ),void 0!==t.maxDistance&&(n.maxDistance=t.maxDistance),void 0!==t.refDistance&&(n.refDistance=t.refDistance),void 0!==t.rolloffFactor&&(n.rolloffFactor=t.rolloffFactor),void 0!==t.coneInnerAngle&&(n.coneInnerAngle=t.coneInnerAngle),void 0!==t.coneOuterAngle&&(n.coneOuterAngle=t.coneOuterAngle),void 0!==t.coneOuterGain&&(n.coneOuterGain=t.coneOuterGain),n}(e,t.panner);w.connect(n),w=n}else void 0!==A&&0!==A&&((a=e.createStereoPanner()).pan.value=A,w.connect(a),w=a);if(w.connect(d.input),t.lfo)for(let n of Array.isArray(t.lfo)?t.lfo:[t.lfo])!function(e,t,n,a,r){let c=e.createOscillator();c.type=t.type,c.frequency.value=t.frequency;let o=e.createGain();o.gain.value=t.depth,c.connect(o);let i=null;switch(t.target){case"frequency":i=r.source.frequencyParam??null;break;case"detune":i=r.source.detuneParam??null;break;case"gain":i=r.envNode.gain;break;case"pan":i=r.panner?.pan??null;break;case"playbackRate":i=r.source.playbackRateParam??null;break;case"filter.frequency":i=r.filters[0]?.frequencyParam??null;break;case"filter.detune":i=r.filters[0]?.detuneParam??null;break;case"filter.Q":i=r.filters[0]?.QParam??null;break;case"filter.gain":i=r.filters[0]?.gainParam??null}i&&(o.connect(i),c.start(n),c.stop(n+a+.1))}(e,n,r,i,{source:s,filters:q,envNode:o,panner:a});if(s.scheduled){b.push(s.scheduled);let e=[s.node,o,...q.map(e=>e.node),...a?[a]:[]];s.scheduled.onended=()=>{for(let t of e)try{t.disconnect()}catch(e){}for(let e of T)e()}}h.push(...T)}return{stop(t){let n=e.currentTime,a=t??.015;for(let e of k)e.gain.cancelScheduledValues(n),e.gain.setValueAtTime(e.gain.value,n),e.gain.setTargetAtTime(1e-4,n,a/3);for(let e of b)try{e.stop(n+a+.05)}catch(e){}}}}(r(),c,t,void 0,(a=r(),n&&n.context===a?n:a.destination))},get:e=>f.sounds[e],toJSON:()=>structuredClone(f)}),o=!0,i=!1,s=0,d=0;function y(e){if(document.hidden)return;let t=performance.now();c().then(()=>{o&&(i=!0,performance.now()-t<250&&a.play(e,{volume:.65}))}).catch(()=>{})}function v(e){let t=p(e.target);if(!(t&&e.isTrusted)||0!==e.button||t.matches('select, input[type="checkbox"], input[type="radio"], input[type="range"], [role="slider"]'))return;let n=t.getAttribute("data-ui-sound");if(n&&a.sounds.includes(n))return y(n);let r=t.getAttribute("aria-checked")??t.getAttribute("aria-pressed");if(null!==r)return y("true"===r?"toggle-off":"toggle-on");if(t.matches('[role="tab"], [role="radio"], [role="menuitem"]'))return y("select");let c=t.getAttribute("aria-expanded");if(null!==c)return y("true"===c?"collapse":"expand");y("click")}function m(e){let t=p(e.target);if(t&&e.isTrusted){if(t instanceof HTMLSelectElement)return y("select");t instanceof HTMLInputElement&&("checkbox"===t.type&&y(t.checked?"toggle-on":"toggle-off"),"radio"===t.type&&y("select"),"range"===t.type&&performance.now()-d>90&&(d=performance.now(),y("tap")))}}function g(e){if(!i||"mouse"!==e.pointerType||!e.isTrusted)return;let t=p(e.target);!t||e.relatedTarget instanceof Node&&t.contains(e.relatedTarget)||performance.now()-s<100||(s=performance.now(),y("hover"))}return document.addEventListener("click",v,!0),document.addEventListener("input",m,!0),document.addEventListener("pointerover",g,!0),()=>{o=!1,document.removeEventListener("click",v,!0),document.removeEventListener("input",m,!0),document.removeEventListener("pointerover",g,!0),t&&(t.close(),t=null,n=null)}},[]),null}],21760)},18566,(e,t,n)=>{t.exports=e.r(76562)},2355,e=>{"use strict";var t=e.i(47167),n=e.i(71645),a=e.i(18566);function r(){return"u">typeof window}function c(){return"production"}function o(){return"development"===((r()?window.vam:c())||"production")}function i(e){return RegExp(`/${e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}(?=[/?#]|$)`)}function l(e){return e.startsWith("http://")||e.startsWith("https://")||e.startsWith("/")?e:`/${e}`}function s(e){return(0,n.useEffect)(()=>{var t;e.beforeSend&&(null==(t=window.va)||t.call(window,"beforeSend",e.beforeSend))},[e.beforeSend]),(0,n.useEffect)(()=>{!function(e={debug:!0},t){var n;if(!r())return;let{beforeSend:a,src:i,dataset:s}=function(e,t){var n,a;let r=e;if(t)try{r={...null==(n=JSON.parse(t))?void 0:n.analytics,...e}}catch{}!function(e="auto"){if("auto"===e){window.vam=c();return}window.vam=e}(r.mode);let i={sdkn:"@vercel/analytics"+(r.framework?`/${r.framework}`:""),sdkv:"2.0.1"};return r.disableAutoTrack&&(i.disableAutoTrack="1"),r.viewEndpoint&&(i.viewEndpoint=l(r.viewEndpoint)),r.eventEndpoint&&(i.eventEndpoint=l(r.eventEndpoint)),r.sessionEndpoint&&(i.sessionEndpoint=l(r.sessionEndpoint)),o()&&!1===r.debug&&(i.debug="false"),r.dsn&&(i.dsn=r.dsn),r.endpoint?i.endpoint=r.endpoint:r.basePath&&(i.endpoint=l(`${r.basePath}/insights`)),{beforeSend:r.beforeSend,src:(a=r).scriptSrc?l(a.scriptSrc):o()?"https://va.vercel-scripts.com/v1/script.debug.js":a.basePath?l(`${a.basePath}/insights/script.js`):"/_vercel/insights/script.js",dataset:i}}(e,t);if(window.va||(window.va=function(...e){window.vaq||(window.vaq=[]),window.vaq.push(e)}),a&&(null==(n=window.va)||n.call(window,"beforeSend",a)),document.head.querySelector(`script[src*="${i}"]`))return;let u=document.createElement("script");for(let[e,t]of(u.src=i,Object.entries(s)))u.dataset[e]=t;u.defer=!0,u.onerror=()=>{let e=o()?"Please check if any ad blockers are enabled and try again.":"Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.";console.log(`[Vercel Web Analytics] Failed to load script from ${i}. ${e}`)},document.head.appendChild(u)}({framework:e.framework||"react",basePath:e.basePath??function(){if(void 0!==t.default&&void 0!==t.default.env)return t.default.env.REACT_APP_VERCEL_OBSERVABILITY_BASEPATH}(),...void 0!==e.route&&{disableAutoTrack:!0},...e},e.configString??function(){if(void 0!==t.default&&void 0!==t.default.env)return t.default.env.REACT_APP_VERCEL_OBSERVABILITY_CLIENT_CONFIG}())},[]),(0,n.useEffect)(()=>{e.route&&e.path&&function({route:e,path:t}){var n;null==(n=window.va)||n.call(window,"pageview",{route:e,path:t})}({route:e.route,path:e.path})},[e.route,e.path]),null}function u(e){let r,c,o,{route:l,path:u}=(r=(0,a.useParams)(),c=(0,a.useSearchParams)(),o=(0,a.usePathname)(),r?{route:function(e,t){if(!e||!t)return e;let n=e;try{let e=Object.entries(t);for(let[t,a]of e)if(!Array.isArray(a)){let e=i(a);e.test(n)&&(n=n.replace(e,`/[${t}]`))}for(let[t,a]of e)if(Array.isArray(a)){let e=i(a.join("/"));e.test(n)&&(n=n.replace(e,`/[...${t}]`))}return n}catch{return e}}(o,Object.keys(r).length?r:Object.fromEntries(c.entries())),path:o}:{route:null,path:o});return n.default.createElement(s,{path:u,route:l,...e,basePath:function(){if(void 0!==t.default&&void 0!==t.default.env)return t.default.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH}(),configString:function(){if(void 0!==t.default&&void 0!==t.default.env)return'{"analytics":{"scriptSrc":"3fc521f1b890149c/script.js","viewEndpoint":"3fc521f1b890149c/view","eventEndpoint":"3fc521f1b890149c/event","sessionEndpoint":"3fc521f1b890149c/session"},"speedInsights":{"scriptSrc":"082c05bb2c78badf/script.js","endpoint":"082c05bb2c78badf/vitals"}}'}(),framework:"next"})}e.s(["Analytics",0,function(e){return n.default.createElement(n.Suspense,{fallback:null},n.default.createElement(u,{...e}))}])}]);
