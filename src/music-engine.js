function midi(n){return 440*Math.pow(2,(n-69)/12)}

export class DominionPulseMusic{
  constructor({bpm=110}={}){
    this.bpm=bpm;
    this.ctx=null;
    this.master=null;
    this.delay=null;
    this.feedback=null;
    this.noise=null;
    this.timer=null;
    this.active=false;
    this.step=0;
    this.nextTime=0;
  }

  ensure(){
    if(this.ctx)return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return;
    this.ctx=new AC();

    const compressor=this.ctx.createDynamicsCompressor();
    compressor.threshold.value=-22;
    compressor.knee.value=18;
    compressor.ratio.value=3;
    compressor.attack.value=.006;
    compressor.release.value=.22;

    this.master=this.ctx.createGain();
    this.master.gain.value=.0001;
    this.master.connect(compressor);
    compressor.connect(this.ctx.destination);

    this.delay=this.ctx.createDelay(.8);
    this.delay.delayTime.value=.27;
    this.feedback=this.ctx.createGain();
    this.feedback.gain.value=.18;
    this.delay.connect(this.feedback);
    this.feedback.connect(this.delay);
    this.delay.connect(this.master);

    this.noise=this.ctx.createBuffer(1,Math.floor(this.ctx.sampleRate*.08),this.ctx.sampleRate);
    const data=this.noise.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
  }

  async start(){
    this.ensure();
    if(!this.ctx||this.active)return;
    this.active=true;
    try{await this.ctx.resume()}catch{}
    const now=this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(.0001,this.master.gain.value),now);
    this.master.gain.exponentialRampToValueAtTime(.13,now+.35);
    this.step=0;
    this.nextTime=now+.06;
    this.timer=setInterval(()=>this.schedule(),25);
  }

  stop(){
    if(!this.ctx||!this.active)return;
    this.active=false;
    if(this.timer){clearInterval(this.timer);this.timer=null}
    const now=this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(.0001,this.master.gain.value),now);
    this.master.gain.exponentialRampToValueAtTime(.0001,now+.22);
  }

  schedule(){
    if(!this.active||!this.ctx)return;
    const horizon=this.ctx.currentTime+.14;
    const stepDur=(60/this.bpm)/4;
    while(this.nextTime<horizon){
      this.scheduleStep(this.step,this.nextTime);
      this.step++;
      this.nextTime+=stepDur;
    }
  }

  scheduleStep(step,t){
    const bar=Math.floor(step/16)%4;
    const pos=step%16;
    const roots=[50,46,53,48];
    const root=roots[bar];

    if(pos%4===0)this.kick(t);
    if(pos%4===2)this.bass(t,root-12);
    if(pos%2===1)this.hat(t,pos%4===3?.018:.012);

    const arp=[12,15,19,22,19,15,12,19];
    this.pluck(t,root+arp[pos%arp.length],pos%4===0?.045:.032);

    if(pos===0)this.pad(t,[root+12,root+15,root+19]);
  }

  kick(t){
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type="sine";
    o.frequency.setValueAtTime(128,t);
    o.frequency.exponentialRampToValueAtTime(48,t+.14);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(.42,t+.008);
    g.gain.exponentialRampToValueAtTime(.0001,t+.18);
    o.connect(g);g.connect(this.master);
    o.start(t);o.stop(t+.2);
  }

  bass(t,note){
    const o=this.ctx.createOscillator(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    o.type="sawtooth";o.frequency.value=midi(note);
    f.type="lowpass";f.frequency.value=340;f.Q.value=1.2;
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(.10,t+.018);
    g.gain.exponentialRampToValueAtTime(.0001,t+.19);
    o.connect(f);f.connect(g);g.connect(this.master);
    o.start(t);o.stop(t+.22);
  }

  pluck(t,note,level){
    const o=this.ctx.createOscillator(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    o.type="triangle";o.frequency.value=midi(note);
    f.type="lowpass";f.frequency.setValueAtTime(2400,t);
    f.frequency.exponentialRampToValueAtTime(820,t+.20);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(level,t+.008);
    g.gain.exponentialRampToValueAtTime(.0001,t+.21);
    o.connect(f);f.connect(g);g.connect(this.master);g.connect(this.delay);
    o.start(t);o.stop(t+.24);
  }

  hat(t,level){
    const s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    s.buffer=this.noise;
    f.type="highpass";f.frequency.value=5200;
    g.gain.setValueAtTime(level,t);
    g.gain.exponentialRampToValueAtTime(.0001,t+.055);
    s.connect(f);f.connect(g);g.connect(this.master);
    s.start(t);s.stop(t+.065);
  }

  pad(t,notes){
    notes.forEach((note,i)=>{
      const o=this.ctx.createOscillator(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
      o.type="sine";o.frequency.value=midi(note);o.detune.value=(i-1)*4;
      f.type="lowpass";f.frequency.value=1250;
      g.gain.setValueAtTime(.0001,t);
      g.gain.exponentialRampToValueAtTime(.018,t+.22);
      g.gain.exponentialRampToValueAtTime(.0001,t+1.75);
      o.connect(f);f.connect(g);g.connect(this.master);
      o.start(t);o.stop(t+1.8);
    });
  }
}
