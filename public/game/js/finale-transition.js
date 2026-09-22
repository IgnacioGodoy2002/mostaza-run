import {smooth01} from './journey.js';
// Switch scenery only under a fully opaque cover, including at low frame rates.
export class FinaleTransition{
 constructor(){this.reset()}
 reset(){this.elapsed=0;this.switched=false;this.active=false}
 begin(){this.reset();this.active=true}
 get opacity(){const t=this.elapsed;return t<.4?smooth01(t/.4):t<.6?1:1-smooth01((t-.6)/.65)}
 update(dt){if(!this.active)return {swap:false,done:false};this.elapsed=Math.min(1.25,this.elapsed+Math.max(0,dt));const swap=!this.switched&&this.elapsed>=.4;if(swap){this.switched=true;this.elapsed=.4}const done=this.elapsed>=1.25;if(done)this.active=false;return {swap,done}}
}
