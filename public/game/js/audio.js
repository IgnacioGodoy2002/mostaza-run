// Small synthesized soundtrack: no downloads, playback starts after a user gesture.
export class AudioEngine{
 constructor(){this.enabled=false;this.ctx=null;this.step=0;this.timer=null}
 init(){if(!this.ctx)this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.ctx.resume()}
 tone(freq,dur=.12,vol=.035,type='sine'){if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;let o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+dur);o.connect(g);g.connect(this.ctx.destination);o.start();o.stop(this.ctx.currentTime+dur)}
 effect(type){const f={coin:880,jump:380,slide:190,power:660,hit:75};this.tone(f[type]||440,type==='hit'?.4:.12,.05,type==='hit'?'sawtooth':'sine')}
 toggle(){this.init();this.enabled=!this.enabled;return this.enabled}
 music(on){clearInterval(this.timer);if(on)this.timer=setInterval(()=>{let notes=[220,0,329.63,293.66,220,0,196,261.63];let n=notes[this.step++%notes.length];if(n)this.tone(n,.32,.018,'triangle')},280)}
}
