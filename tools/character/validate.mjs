import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as T from '../../public/game/js/three.module.js';
import {GLTFLoader} from '../../public/game/js/vendor/GLTFLoader.js';
import {Runner} from '../../public/game/js/runner.js';
import {PlayerPhysics} from '../../public/game/js/physics.js';
const loader=new GLTFLoader();loader.register(()=>({name:'geometry-validation',loadTexture:()=>Promise.resolve(new T.Texture())}));
const data=fs.readFileSync(new URL('../../public/game/assets/models/mostaza-runner.glb',import.meta.url));
const g=await loader.parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
const r=new Runner({loadAssets:false});r.install(g);const p=new PlayerPhysics();
assert.equal(g.animations.length,7);assert.equal(r.skinned.length,9);
let max=0;
for(const lane of [-1,0,1]){
 p.reset();p.lane=lane;p.input('slide');
 for(let i=0;i<110;i++){p.update(1/120);r.animate(p,i/120,'run',30);const b=r.measure();assert([...b.min.toArray(),...b.max.toArray()].every(Number.isFinite));if(p.slideBlend>=.74){max=Math.max(max,b.max.y);assert(b.max.y<1.6);assert(b.min.y>=0);}}
 assert(p.input('jump'));r.animate(p,1,'run',30);assert(p.y>0);assert.equal(r.state,'Jump');
}
p.reset();for(let i=0;i<90;i++)r.animate(p,2+i/60,'run',24);
const before=r.measure().clone();r.animate(p,3.5,'pause',24);const paused=r.measure().clone();r.animate(p,3.5,'pause',24);assert.deepEqual(r.measure().min.toArray(),paused.min.toArray());
for(let i=0;i<40;i++)r.animate(p,4+i/60,'dead',24);
assert.equal(r.state,'Stumble');assert(Number.isFinite(r.measure().max.y));
console.log({assetBytes:data.length,skinnedSurfaces:r.skinned.length,clips:g.animations.map(a=>a.name),rollMaxHeight:max,result:'passed'});

// Delivery must keep both hands in front of the body, with no accumulated rotations.
r.resetPresentation();p.reset();for(let i=0;i<120;i++)r.animate(p,10+i/60,'deliver',0);
r.updateMatrixWorld(true);const head=r.bones.head.getWorldPosition(new T.Vector3());
for(const side of ['L','R']){const hand=r.bones['hand_'+side].getWorldPosition(new T.Vector3());assert(hand.z<head.z-.2,'Delivery hand must face the counter');}
const hand=r.bones.hand_R.getWorldPosition(new T.Vector3());for(let i=0;i<60;i++)r.animate(p,12,'deliver',0);r.updateMatrixWorld(true);const frozen=r.bones.hand_R.getWorldPosition(new T.Vector3());r.animate(p,12,'deliver',0);r.updateMatrixWorld(true);assert(frozen.distanceTo(r.bones.hand_R.getWorldPosition(new T.Vector3()))<1e-9);
console.log('PASS: coordinated delivery, frozen pose and forward-facing hands');
