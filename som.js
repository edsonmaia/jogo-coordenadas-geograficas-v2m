// Áudio do jogo, sintetizado com Web Audio (sem arquivos). Expõe window.SOM.
(function(){
  const PREF='coordenadas-som';
  const pref=Object.assign({musica:true,efeitos:true,volMusica:.55,volEfeitos:.8},JSON.parse(localStorage.getItem(PREF)||'{}'));
  const salvar=()=>localStorage.setItem(PREF,JSON.stringify(pref));
  let ctx,mestre,busMusica,busFx,ondas,timer,proxCompasso=0,compasso=0;
  const hz=n=>440*Math.pow(2,(n-69)/12);

  function iniciar(){
    if(ctx)return ctx.state==='suspended'&&ctx.resume();
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    mestre=ctx.createDynamicsCompressor();mestre.connect(ctx.destination);
    busMusica=ctx.createGain();busMusica.gain.value=0;busMusica.connect(mestre);
    busFx=ctx.createGain();busFx.gain.value=pref.efeitos?pref.volEfeitos:0;busFx.connect(mestre);
    // eco suave para a música
    const eco=ctx.createDelay(1);eco.delayTime.value=.42;const fb=ctx.createGain();fb.gain.value=.32;
    const ecoF=ctx.createBiquadFilter();ecoF.type='lowpass';ecoF.frequency.value=2200;
    busMusica.eco=ctx.createGain();busMusica.eco.gain.value=.35;
    busMusica.eco.connect(eco);eco.connect(ecoF);ecoF.connect(fb);fb.connect(eco);ecoF.connect(busMusica);
    if(pref.musica)ligarMusica();
  }

  // ---------- música de fundo: ondas + pads + arpejo (Lá menor eólio, ~76 bpm)
  const PROG=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]; // Am F C G
  const BAIXO=[45,41,36,43];
  const TEMPO=60/76, COMP=TEMPO*4;

  function criarOndas(){
    const len=ctx.sampleRate*4,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
    let b=0;for(let i=0;i<len;i++){b=(b+.02*(Math.random()*2-1))/1.02;d[i]=b*3.5}
    const src=ctx.createBufferSource();src.buffer=buf;src.loop=true;
    const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=600;
    const g=ctx.createGain();g.gain.value=.18;
    const lfo=ctx.createOscillator();lfo.frequency.value=.09;const lg=ctx.createGain();lg.gain.value=.12;
    lfo.connect(lg);lg.connect(g.gain);
    const lfo2=ctx.createOscillator();lfo2.frequency.value=.07;const lg2=ctx.createGain();lg2.gain.value=350;
    lfo2.connect(lg2);lg2.connect(f.frequency);
    src.connect(f);f.connect(g);g.connect(busMusica);src.start();lfo.start();lfo2.start();
    return {src,lfo,lfo2};
  }
  function pad(notas,t,dur){
    notas.forEach(n=>[-6,6].forEach(det=>{
      const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=hz(n);o.detune.value=det;
      const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(500,t);f.frequency.linearRampToValueAtTime(1100,t+dur/2);f.frequency.linearRampToValueAtTime(500,t+dur);
      const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.022,t+1.2);g.gain.setValueAtTime(.022,t+dur-1);g.gain.linearRampToValueAtTime(0,t+dur+.4);
      o.connect(f);f.connect(g);g.connect(busMusica);o.start(t);o.stop(t+dur+.5);
    }));
  }
  function nota(n,t,dur,vol,tipo,bus){
    const o=ctx.createOscillator();o.type=tipo||'triangle';o.frequency.value=hz(n);
    const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(bus||busFx);if(bus===busMusica)g.connect(busMusica.eco);o.start(t);o.stop(t+dur+.05);
  }
  function agendar(){
    while(proxCompasso<ctx.currentTime+COMP*1.5){
      const i=compasso%4,t=proxCompasso,ch=PROG[i];
      pad(ch,t,COMP);
      nota(BAIXO[i],t,COMP*.9,.09,'sine',busMusica);
      const arp=[ch[0]+12,ch[1]+12,ch[2]+12,ch[1]+12,ch[0]+24,ch[2]+12,ch[1]+12,ch[2]+12];
      arp.forEach((n,k)=>{if(compasso%8<4&&k%2)return;nota(n,t+k*TEMPO/2,TEMPO*1.6,.035,'triangle',busMusica)});
      proxCompasso+=COMP;compasso++;
    }
  }
  function ligarMusica(){
    if(!ctx)return;
    if(!ondas)ondas=criarOndas();
    if(!timer){proxCompasso=ctx.currentTime+.1;timer=setInterval(agendar,200);agendar()}
    busMusica.gain.cancelScheduledValues(ctx.currentTime);busMusica.gain.setTargetAtTime(pref.volMusica,ctx.currentTime,.8);
  }
  function desligarMusica(){
    if(!ctx)return;
    busMusica.gain.cancelScheduledValues(ctx.currentTime);busMusica.gain.setTargetAtTime(0,ctx.currentTime,.3);
    setTimeout(()=>{if(!pref.musica&&timer){clearInterval(timer);timer=null}},1500);
  }
  function abaixarMusica(seg){
    if(!ctx||!pref.musica)return;const t=ctx.currentTime;
    busMusica.gain.cancelScheduledValues(t);busMusica.gain.setTargetAtTime(pref.volMusica*.22,t,.08);busMusica.gain.setTargetAtTime(pref.volMusica,t+seg,.8);
  }
  function ruido(t,dur,vol,freq){
    const len=Math.ceil(ctx.sampleRate*dur),buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
    const s=ctx.createBufferSource();s.buffer=buf;const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=freq||5000;
    const g=ctx.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(busFx);s.start(t);
  }

  // ---------- efeitos
  const FX={
    // navio legal: ping de sonar com eco
    inspecao(){const t=ctx.currentTime;[0,.28,.56].forEach((d,i)=>{const o=ctx.createOscillator();o.type='sine';o.frequency.setValueAtTime(1180,t+d);o.frequency.exponentialRampToValueAtTime(1040,t+d+.6);
      const g=ctx.createGain();const v=[.28,.1,.04][i];g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(v,t+d+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d+.9);o.connect(g);g.connect(busFx);o.start(t+d);o.stop(t+d+1)});},
    // pirata / pesca ilegal: alerta + captura ascendente
    apreensao(){const t=ctx.currentTime;abaixarMusica(1.4);
      [0,.1].forEach(d=>nota(76,t+d,.09,.12,'square'));
      [72,76,79,84].forEach((n,k)=>{nota(n,t+.24+k*.08,.5,.18,'triangle');nota(n+12,t+.24+k*.08,.3,.05,'square')});
      nota(48,t+.24,.5,.2,'sine');ruido(t+.24,.4,.08,6000);},
    // nenhum navio
    erro(){const t=ctx.currentTime;const o=ctx.createOscillator();o.type='sine';o.frequency.setValueAtTime(330,t);o.frequency.exponentialRampToValueAtTime(140,t+.35);
      const g=ctx.createGain();g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.0001,t+.4);o.connect(g);g.connect(busFx);o.start(t);o.stop(t+.45);},
    // fim de missão: fanfarra curta
    missao(){const t=ctx.currentTime;abaixarMusica(3);
      const mel=[[67,0,.18],[72,.18,.18],[76,.36,.18],[79,.54,.5],[76,1.04,.16],[79,1.2,.9]];
      mel.forEach(([n,d,du])=>{nota(n,t+d,du+.25,.17,'triangle');nota(n,t+d,du+.1,.04,'square')});
      [[48,52,55],[53,57,60],[55,59,62],[48,52,55]].forEach((c,k)=>c.forEach(n=>nota(n+12,t+k*.54,.7,.05,'sawtooth')));
      nota(36,t,.5,.22,'sine');nota(43,t+.54,.5,.2,'sine');nota(36,t+1.2,1.2,.24,'sine');
      ruido(t+1.2,1.1,.07,7000);},
    // fim do jogo: fanfarra longa
    final(){const t=ctx.currentTime;abaixarMusica(6);
      const mel=[[67,0,.2],[67,.2,.2],[72,.4,.6],[71,1,.2],[72,1.2,.2],[74,1.4,.6],[76,2,.2],[77,2.2,.2],[79,2.4,.4],[84,2.8,1.6]];
      mel.forEach(([n,d,du])=>{nota(n,t+d,du+.3,.17,'triangle');nota(n+12,t+d,du,.03,'square')});
      [[[48,52,55],0],[[53,57,60],1],[[55,59,62],2],[[48,52,55,60],2.8]].forEach(([c,d])=>c.forEach(n=>nota(n+12,t+d,d===2.8?2:1,.05,'sawtooth')));
      [[36,0],[41,1],[43,2],[36,2.8]].forEach(([n,d])=>nota(n,t+d,d===2.8?2.2:1,.24,'sine'));
      [0,1,2,2.8].forEach(d=>ruido(t+d,d===2.8?1.8:.5,.06,7000));
      [96,91,88,84,91,96].forEach((n,k)=>nota(n,t+3+k*.09,.3,.04,'sine'));},
    clique(){const t=ctx.currentTime;nota(84,t,.06,.05,'sine')}
  };

  window.SOM={
    pref,
    tocar(nome){iniciar();if(!pref.efeitos||!FX[nome])return;FX[nome]()},
    alternarMusica(){iniciar();pref.musica=!pref.musica;salvar();pref.musica?ligarMusica():desligarMusica();return pref.musica},
    alternarEfeitos(){iniciar();pref.efeitos=!pref.efeitos;salvar();busFx.gain.setTargetAtTime(pref.efeitos?pref.volEfeitos:0,ctx.currentTime,.05);return pref.efeitos},
    volumeMusica(v){iniciar();pref.volMusica=v;pref.musica=v>0;salvar();
      if(pref.musica){if(!timer)ligarMusica();else{busMusica.gain.cancelScheduledValues(ctx.currentTime);busMusica.gain.setTargetAtTime(v,ctx.currentTime,.05)}}else desligarMusica()},
    volumeEfeitos(v){iniciar();pref.volEfeitos=v;pref.efeitos=v>0;salvar();busFx.gain.setTargetAtTime(v,ctx.currentTime,.03)},
    destravar(){iniciar()}
  };
  // navegadores só liberam áudio após um gesto do usuário
  const primeiro=()=>{iniciar();['pointerdown','keydown'].forEach(e=>removeEventListener(e,primeiro,true))};
  ['pointerdown','keydown'].forEach(e=>addEventListener(e,primeiro,true));
})();
