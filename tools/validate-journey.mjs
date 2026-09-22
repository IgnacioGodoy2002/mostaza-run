import assert from 'node:assert/strict';
import * as T from '../public/game/js/three.module.js';
import {World} from '../public/game/js/world.js';
import {PlayerPhysics} from '../public/game/js/physics.js';
import {CollectionProgress} from '../public/game/js/collection-progress.js';
import {ArrivalSequence} from '../public/game/js/arrival.js';
import {advanceHazard,zoneAt} from '../public/game/js/journey.js';
import {recipe,partialBurger} from '../public/game/js/ingredients.js';
const scene=new T.Scene(),world=new World(scene,{loadAssets:false}),p=new PlayerPhysics();
// Continuous full-road cart patrol and autonomous trays, with no warning objects.
for(const kind of ['cart','slidingTray']){
 world.clear();const h=world.spawnMoving(kind,-1,0,-115);let min=Infinity,max=-Infinity,changes=0,previous=0;
 for(let i=0;i<1200;i++){advanceHazard(h,1/120);min=Math.min(min,h.x);max=Math.max(max,h.x);const direction=Math.sign(h.x-h.oldX);if(previous&&direction!==previous)changes++;previous=direction;assert(h.x>=-2.501&&h.x<=2.501)}
 assert(changes>=4);assert(min<-2.49);assert(max>(kind==='cart'?2.49:-.01));assert(!h.marker);assert(!('warning' in h));const x=h.x;advanceHazard(h,0);assert.equal(h.x,x);
}
// Collision follows actual position, not the lane the cart will eventually reach.
p.reset();assert(p.collides({type:'wall',dynamic:true,lane:1,x:0,oldX:0,z:.2},-.2));assert(!p.collides({type:'wall',dynamic:true,lane:0,x:2.5,oldX:2.5,z:.2},-.2));
p.input('jump');assert(p.y>0);for(let i=0;i<35;i++)p.update(1/120);assert(!p.collides({type:'low',lane:0,z:.2},-.2));
p.reset();p.input('slide');for(let i=0;i<15;i++)p.update(1/120);assert(!p.collides({type:'arch',lane:0,z:.2},-.2));
// A missed ingredient must remain the next target in all three recipes.
for(const variant of [1,2,3]){
 const progress=new CollectionProgress(variant);let d=230;
 for(const [i,type] of recipe(variant).entries()){
  let target=progress.spawnIfDue(d);assert.equal(target.ingredient,type);
  assert(progress.miss(target.id,d+72));assert.equal(progress.needed,type);d+=372;target=progress.spawnIfDue(d);assert.equal(target.ingredient,type);assert(progress.collect(target.id,d+70));assert.equal(partialBurger(variant,i+1).children.length,i+1);d+=300;
 }
 assert(progress.done);
}
// Clear crossing paths near target pickups and dispose their warning markers.
world.clear();const h=world.spawnMoving('cart',-1,0,-70);world.spawnIngredient({id:1,ingredient:'bottom',z:-70});assert(!world.items.includes(h));assert(!scene.children.includes(h.marker));
assert.equal(zoneAt(0).id,'neighborhood');assert.equal(zoneAt(240).id,'plaza');assert.equal(zoneAt(480).id,'restaurants');assert.equal(zoneAt(720).id,'neighborhood');
const fixedSceneSize=scene.children.length;for(let i=0;i<3000;i++)world.scenery.update(1,48);assert.equal(scene.children.length,fixedSceneSize);assert.equal(world.scenery.zones.length,3);world.reset();assert.equal(world.scenery.distance,0);
const arrival=new ArrivalSequence(scene,{loadAssets:false});
for(const variant of [1,2,3]){
 arrival.begin(variant,2.5);assert.equal(arrival.pose.phase,'assembled');let completed=0;
 for(let i=0;i<600;i++){const before=arrival.elapsed;arrival.update(0);assert.equal(arrival.elapsed,before);completed+=Number(arrival.update(1/60));assert.equal(arrival.pose.rotation,0);assert(Object.values(arrival.pose).filter(v=>typeof v==='number').every(Number.isFinite));if(arrival.pose.z<-14.9)assert(Math.abs(arrival.doors[0].position.x)>2.4)}
 assert.equal(completed,1);assert.equal(arrival.pose.phase,'celebrate');assert(arrival.reward.visible);assert.equal(arrival.delivery.visible,false);assert.equal(arrival.pose.z,-16.8);assert.equal(arrival.update(.1),false);arrival.reset();assert(!arrival.root.visible);
}
world.clear();assert.equal(world.items.length,0);
console.log('PASS: continuous obstacle patrol, no warnings, swept collisions, immediate jump/roll, missed-ingredient retry, three recipes, bounded zones, pausable arrival and single completion.');
