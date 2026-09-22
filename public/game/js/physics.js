export const LANE=2.5;
export class PlayerPhysics{
 constructor(){this.reset()}
 reset(){this.lane=0;this.x=0;this.oldX=0;this.y=0;this.vy=0;this.grounded=true;this.slide=0;this.slideBlend=0}
 input(type){
  if(type==='left'){this.lane=Math.max(-1,this.lane-1);return true}
  if(type==='right'){this.lane=Math.min(1,this.lane+1);return true}
  if(type==='jump'&&this.grounded){
   // Commit takeoff at input time. No pending jump, animation wait or zero-dt cancellation.
   this.grounded=false;this.y=.001;this.vy=11;this.slide=0;this.slideBlend=0;return true;
  }
  if(type==='slide'&&this.grounded){this.slide=.85;return true}
  return false;
 }
 update(dt){
  if(dt<=0)return;
  this.oldX=this.x;
  this.x+=(this.lane*LANE-this.x)*(1-Math.exp(-18*dt));
  if(!this.grounded){this.y+=this.vy*dt-13.5*dt*dt;this.vy-=27*dt;if(this.y<=0&&this.vy<0){this.y=0;this.vy=0;this.grounded=true}}
  this.slide=Math.max(0,this.slide-dt);
  const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
  this.slideBlend=this.slide>0?ease(Math.min((.85-this.slide)/.09,this.slide/.12)):0;
 }
 // Swept z interval prevents tunneling at maximum speed / slower frame rates.
 collides(o,oldZ){
  if(o.z<-.85||oldZ>.85)return false;
  const f=o.z===oldZ?1:Math.max(0,Math.min(1,-oldZ/(o.z-oldZ)));
  const ox=o.dynamic?o.oldX+(o.x-o.oldX)*f:o.lane*LANE,px=this.oldX+(this.x-this.oldX)*f;
  if(Math.abs(ox-px)>.94)return false;
  if(o.type==='low')return this.y<1.05;if(o.type==='arch')return this.slideBlend<.74||this.y>.15;return true;
 }
}
