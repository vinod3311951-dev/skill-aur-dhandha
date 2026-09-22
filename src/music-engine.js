function midi(n){return 440*Math.pow(2,(n-69)/12)}

const WORLD_PROFILES=Object.freeze({
  "Dawn Gardens":{roots:[50,46,53,48],pluck:[12,15,19,22,19,15,12,19],pad:[12,15,19],mallet:[0,7,12,15],air:"sine",airRatio:1.333,delay:.27},
  "River Lights":{roots:[48,55,51,46],pluck:[12,19,15,22,17,15,12,20],pad:[12,17,19],mallet:[0,5,12,17],air:"triangle",airRatio:1.5,delay:.31},
  "Festival Streets":{roots:[53,50,46,51],pluck:[12,16,19,23,19,16,14,21],pad:[12,16,19],mallet:[0,7,10,16],air:"sine",airRatio:1.25,delay:.24},
  "Sky Courtyards":{roots:[46,53,50,55],pluck:[12,19,24,22,17,15,12,19],pad:[12,15,22],mallet:[0,5,12,19],air:"triangle",airRatio:1.667,delay:.29},
  "Prism Fort":{roots:[51,48,55,50],pluck:[12,15,22,19,24,19,15,22],pad:[12,15,22],mallet:[0,7,12,22],air:"sine",airRatio:1.414,delay:.33}
});

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
    this.world="Dawn Gardens";
    this.profile=WORLD_PROFILES[this.world];
  }

  setWorld(world){
    if(!WORLD_PROFILES[world])return;
    this.world=world;
    this.profile=WORLD_PROFILES[world];
    if(this.delay&&this.ctx)this.delay.delayTime.setTargetAtTime(this.profile.delay,this.ctx.currentTime,.06);
  }

  snapshot(){return{active:this.active,bpm:this.bpm,world:this.world,identity:"factory-x-trance-v2"}}

  ensure(){
    if(this.ctx)return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return;
    this.ctx=new AC();

    const compressor=this.ctx.createDynamicsCompressor();
    compressor.threshold.value=-24;
    compressor.knee.value=20;
    compressor.ratio.value=2.6;
    compressor.attack.value=.008;
    compressor.release.value=.28;

    this.master=this.ctx.createGain();
    this.master.gain.value=.0001;
    this.master.connect(compressor);
    compressor.connect(this.ctx.destination);

    this.delay=this.ctx.createDelay(.8);
    this.delay.delayTime.value=this.profile.delay;
    this.feedback=this.ctx.createGain();
    this.feedback.gain.value=.16;
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
    this.master.gain.exponentialRampToValueAtTime(.082,now+.45);
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
    this.master.gain.exponentialRampToValueAtTime(.0001,now+.28);
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
    const p=this.profile;
    const root=p.roots[bar];

    if(pos%4===0)this.kick(t);
    if(pos%4===2)this.bass(t,root-12);
    if(pos%2===1)this.hat(t,pos%4===3?.014:.009);

    this.pluck(t,root+p.pluck[pos%p.pluck.length],pos%4===0?.034:.025);
    if(pos===3||pos===11)this.mallet(t,root+p.mallet[(bar+(pos===11?1:0))%p.mallet.length],.025);
    if(pos===0)this.pad(t,p.pad.map(v=>root+v));
    if(pos===8)this.softPulse(t,root+7);
  }

  kick(t){
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type="sine";
    o.frequency.setValueAtTime(112,t);
    o.frequency.exponentialRampToValueAtTime(46,t+.16);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(.27,t+.01);
    g.gain.exponentialRampToValueAtTime(.0001,t+.20);
    o.connect(g);g.connect(this.master);
    o.start(t);o.stop(t+.22);
  }

  bass(t,note){
    const o=this.ctx.createOscillator(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    o.type="sawtooth";o.frequency.value=midi(note);
    f.type="lowpass";f.frequency.value=300;f.Q.value=1.1;
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(.065,t+.02);
    g.gain.exponentialRampToValueAtTime(.0001,t+.21);
    o.connect(f);f.connect(g);g.connect(this.master);
    o.start(t);o.stop(t+.23);
  }

  pluck(t,note,level){
    const o=this.ctx.createOscillator(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    o.type="triangle";o.frequency.value=midi(note);
    f.type="lowpass";f.frequency.setValueAtTime(2200,t);
    f.frequency.exponentialRampToValueAtTime(760,t+.24);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(level,t+.008);
    g.gain.exponentialRampToValueAtTime(.0001,t+.24);
    o.connect(f);f.connect(g);g.connect(this.master);g.connect(this.delay);
    o.start(t);o.stop(t+.27);
  }

  mallet(t,note,level){
    const fundamental=this.ctx.createOscillator(),partial=this.ctx.createOscillator(),g=this.ctx.createGain();
    fundamental.type="sine";fundamental.frequency.value=midi(note);
    partial.type="sine";partial.frequency.value=midi(note)*2.01;
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(level,t+.006);
    g.gain.exponentialRampToValueAtTime(.0001,t+.42);
    fundamental.connect(g);partial.connect(g);g.connect(this.master);g.connect(this.delay);
    fundamental.start(t);partial.start(t);fundamental.stop(t+.46);partial.stop(t+.46);
  }

  softPulse(t,note){
    const o=this.ctx.createOscillator(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    o.type="sine";o.frequency.value=midi(note);
    f.type="lowpass";f.frequency.value=900;
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(.012,t+.08);
    g.gain.exponentialRampToValueAtTime(.0001,t+.7);
    o.connect(f);f.connect(g);g.connect(this.master);
    o.start(t);o.stop(t+.74);
  }

  hat(t,level){
    const s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    s.buffer=this.noise;
    f.type="highpass";f.frequency.value=5600;
    g.gain.setValueAtTime(level,t);
    g.gain.exponentialRampToValueAtTime(.0001,t+.05);
    s.connect(f);f.connect(g);g.connect(this.master);
    s.start(t);s.stop(t+.06);
  }

  pad(t,notes){
    notes.forEach((note,i)=>{
      const o=this.ctx.createOscillator(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
      o.type=this.profile.air;o.frequency.value=midi(note);o.detune.value=(i-1)*3.5;
      f.type="lowpass";f.frequency.value=1050;
      g.gain.setValueAtTime(.0001,t);
      g.gain.exponentialRampToValueAtTime(.013,t+.30);
      g.gain.exponentialRampToValueAtTime(.0001,t+1.85);
      o.connect(f);f.connect(g);g.connect(this.master);
      o.start(t);o.stop(t+1.9);
    });
  }
}
