import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../public/game/js/three.module.js';
import {FinaleTransition} from '../public/game/js/finale-transition.js';
import {World} from '../public/game/js/world.js';
import {prop} from '../public/game/js/restaurant-props.js';
for(const dt of [1/60,.25,2]){
 const f=new FinaleTransition();f.begin();let swaps=0,completed=0;
 for(let i=0;i<150;i++){const before=f.elapsed;f.update(0);assert.equal(f.elapsed,before);const event=f.update(dt);if(event.swap){swaps++;assert.equal(f.opacity,1)}if(event.done)completed++;assert(f.opacity>=0&&f.opacity<=1)}
 assert.equal(swaps,1);assert.equal(completed,1);assert.equal(f.opacity,0);f.reset();assert(!f.active);
}
const world=new World(new T.Scene(),{loadAssets:false});
assert.equal(world.scenery.zones.reduce((sum,z)=>sum+z.userData.restaurantCount,0),1);
for(let i=0;i<100;i++){world.clear();world.rows=i;world.row(32);assert(world.items.every(o=>o.type!=='magnet'))}
assert.equal(new Set(Array.from({length:6},(_,i)=>prop('house'+i).children[0].material.color.getHex())).size,6);
const html=fs.readFileSync('public/game/index.html','utf8'),main=fs.readFileSync('public/game/js/main.js','utf8');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);for(const m of main.matchAll(/\$\('([^']+)'\)/g))assert(ids.includes(m[1]),m[1]);
console.log('PASS: scene switch fully covered, single completion, pause/reset, one restaurant, six house palettes, no magnet pickups, DOM references.');
