import * as T from './three.module.js';
import {part,palette as m} from './restaurant-props.js';
import {burger,combo} from './ingredients.js';
import {smooth01,arrivalPhase,ARRIVAL_DURATION} from './journey.js';

// All transforms are sampled from elapsed simulation time: pause and replay are deterministic.
export class ArrivalSequence{
 constructor(scene,{loadAssets=true}={}){
  this.foodCache=new Map();this.root=new T.Group();this.root.position.z=-18;scene.add(this.root);
  const box=new T.BoxGeometry(),b=(material,x,y,z,sx,sy,sz)=>part(this.root,box,material,x,y,z,sx,sy,sz);
  b(m.cream,0,-.01,-.2,11,.10,8);b(m.cream,-3.55,2.3,2.85,3.1,4.6,.36);b(m.cream,3.55,2.3,2.85,3.1,4.6,.36);
  for(const x of [-5.1,5.1])b(m.cream,x,2.3,-.25,.25,4.6,6.5);
  b(m.red,0,4.45,2.95,10.4,1.15,.55);b(m.cream,0,5.12,-.15,10.6,.2,6.8);b(m.red,0,2.3,-3.4,10.4,4.6,.25);
  b(m.red,0,.51,.10,4.2,1.02,1.15);b(m.cream,0,1.08,.10,4.35,.12,1.3);
  for(const x of [-3.7,3.7]){b(m.dark,x,2,-3.20,2.1,1.2,.04);b(m.gold,x,2,-3.15,1.75,.055,.02)}
  if(loadAssets){const tex=new T.TextureLoader().load('assets/mostaza.png');tex.colorSpace=T.SRGBColorSpace;const logo=new T.MeshBasicMaterial({map:tex,transparent:true});part(this.root,new T.PlaneGeometry(1.08,1.08),logo,0,4.46,3.24);part(this.root,new T.PlaneGeometry(1.4,1.4),logo,0,3.1,-3.20)}
  const glass=new T.MeshStandardMaterial({color:'#9bcfd5',transparent:true,opacity:.24,roughness:.15,depthWrite:false});this.doors=[];
  for(const side of [-1,1]){const door=new T.Group();door.position.set(side*.87,1.65,3.08);part(door,box,glass,0,0,0,1.72,3.2,.045);for(const x of [-.84,.84])part(door,box,m.metal,x,0,0,.045,3.2,.07);for(const y of [-1.59,1.59])part(door,box,m.metal,0,y,0,1.72,.045,.07);part(door,box,m.metal,-side*.63,-.10,.065,.05,.5,.05);this.root.add(door);this.doors.push(door)}
  this.delivery=new T.Group();scene.add(this.delivery);this.reward=new T.Group();scene.add(this.reward);
  const geo=new T.BufferGeometry(),positions=new Float32Array(72*3),colors=new Float32Array(72*3);this.seeds=[];
  for(let i=0;i<72;i++){this.seeds.push({x:Math.sin(i*13.4)*2.1,z:Math.cos(i*8.7)*1.6,delay:(i%12)*.055});const c=new T.Color(['#ffd355','#ed3344','#fff3d0'][i%3]);colors.set([c.r,c.g,c.b],i*3)}
  geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('color',new T.BufferAttribute(colors,3));this.confetti=new T.Points(geo,new T.PointsMaterial({size:.065,vertexColors:true}));this.confetti.frustumCulled=false;this.root.add(this.confetti);this.reset();
 }
 reset(){this.active=false;this.elapsed=0;this.root.visible=false;this.delivery.visible=false;this.reward.visible=false;this.confetti.visible=false}
 begin(variant,x){this.reset();this.active=true;this.root.visible=true;this.originX=x;this.delivery.clear();this.reward.clear();if(!this.foodCache.has(variant))this.foodCache.set(variant,{burger:burger(variant),combo:combo(variant)});const food=this.foodCache.get(variant);this.delivery.add(food.burger);this.reward.add(food.combo);this.reward.position.set(.1,1.15,-17.85);this.delivery.position.set(0,0,0);this.delivery.scale.setScalar(.48);this.delivery.rotation.set(0,0,0);this.foodBase=new T.Box3().setFromObject(this.delivery).min.y;this.update(0)}
 update(dt){
  if(!this.active)return false;const before=this.elapsed;this.elapsed=Math.min(ARRIVAL_DURATION,this.elapsed+dt);const t=this.elapsed,open=smooth01((t-2.2)/1.3);
  this.doors.forEach((door,i)=>door.position.x=(i===0?-1:1)*(.87+open*1.85));
  const transfer=smooth01((t-4.35)/1.7);this.delivery.visible=t>=4.35&&t<6.6;this.delivery.position.set(0,T.MathUtils.lerp(1.10,1.15,transfer)-this.foodBase,T.MathUtils.lerp(-17.20,-17.42,transfer));this.delivery.scale.setScalar(.48);this.delivery.rotation.y=0;
  this.reward.visible=t>=6.6;this.reward.scale.setScalar(.85*smooth01((t-6.6)/.65));this.reward.rotation.y=Math.sin(Math.max(0,t-6.6))*.14;
  this.confetti.visible=t>=6.6;if(this.confetti.visible){const a=this.confetti.geometry.attributes.position;this.seeds.forEach((s,i)=>{const age=Math.max(0,t-6.6-s.delay);a.setXYZ(i,s.x+Math.sin(age*3+i)*.2,Math.max(.15,3.8-age*1.1),s.z-.2)});a.needsUpdate=true}
  return before<ARRIVAL_DURATION&&t===ARRIVAL_DURATION;
 }
 get pose(){const t=this.elapsed,phase=arrivalPhase(t);return {x:this.originX*(1-smooth01(t/1.4)),z:-16.8*smooth01((t-1.1)/3.5),rotation:0,motion:phase==='approach'?'run':phase==='celebrate'?'celebrate':phase==='delivery'?'deliver':'idle',phase}}
 get caption(){return {assembled:'¡Hamburguesa completa!',approach:'¡Llevemos los ingredientes!',delivery:'Entregándolos para armar tu combo…',celebrate:'¡Tu combo está listo!'}[arrivalPhase(this.elapsed)]}
 applyCamera(camera){const k=smooth01((this.elapsed-1.1)/3.5);camera.position.set(T.MathUtils.lerp(0,4.1,k),T.MathUtils.lerp(3.7,3.2,k),T.MathUtils.lerp(7.6,-9,k));camera.lookAt(0,1.25,T.MathUtils.lerp(-15,-16.8,k))}
}
