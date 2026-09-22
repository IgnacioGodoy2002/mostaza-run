import assert from 'node:assert/strict';
import * as T from '../public/game/js/three.module.js';
import {mayonnaiseReward,MAYO_PER_SHIELD,MAYO_SHIELD_SECONDS} from '../public/game/js/mayonnaise.js';
import {World} from '../public/game/js/world.js';
import {brandedCup} from '../public/game/js/branded-cup.js';
assert.equal(MAYO_PER_SHIELD,100);
for(let n=0;n<=301;n++){const r=mayonnaiseReward(n);assert.equal(r.activate,[100,200,300].includes(n));assert.equal(r.charge,n%100)}
assert.equal(MAYO_SHIELD_SECONDS,5);assert.equal(mayonnaiseReward(0).activate,false);
let shield=0;for(let n=1;n<=200;n++)if(mayonnaiseReward(n).activate)shield=Math.max(shield,MAYO_SHIELD_SECONDS);assert.equal(shield,5);shield=0;assert.equal(shield,0);
const world=new World(new T.Scene(),{loadAssets:false});for(let i=0;i<100;i++){world.clear();world.rows=i;world.row(32);assert(world.items.every(o=>!['shield','magnet','double'].includes(o.type)))}
const cup=brandedCup(),box=new T.Box3().setFromObject(cup);assert(box.max.y>3&&box.max.y<3.1);assert(box.max.x<.8);assert.equal(cup.children.length,5);
console.log('PASS: shield at 100/200/300 only, reset charge, five-second duration, no street shield/x2/magnet pickups, cup bounds.');
