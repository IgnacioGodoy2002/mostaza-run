import {recipe} from './ingredients.js';
export class CollectionProgress{
 constructor(variant=1){this.reset(variant)}
 reset(variant){this.steps=recipe(variant);this.collected=0;this.nextAt=300;this.active=null;this.serial=0;this.misses=0}
 get done(){return this.collected===this.steps.length}
 get needed(){return this.steps[this.collected]||null}
 // Queue only the current ingredient, never one beyond a missed target.
 spawnIfDue(distance){if(this.done||this.active||distance<this.nextAt-70)return null;this.active={id:++this.serial,ingredient:this.needed,index:this.collected};return {...this.active,z:Math.min(-1,distance-this.nextAt)}}
 collect(id,distance){if(!this.active||this.active.id!==id||this.done)return false;this.collected++;this.misses=0;this.active=null;this.nextAt=distance+300;return true}
 miss(id,distance){if(!this.active||this.active.id!==id)return false;this.misses++;this.active=null;this.nextAt=distance+300;return true}
}
