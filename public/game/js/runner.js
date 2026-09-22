import {ground} from './character-ground.js';
import * as T from './three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
export class Runner extends T.Group{
 constructor({loadAssets=true}={}){super();this.avatar=new T.Group();this.add(this.avatar);this.actions={};this.skinned=[];this.bounds=new T.Box3();this.partBounds=new T.Box3();this.lastTime=null;this.runTime=0;this.deathStart=0;this.previousMode='menu';this.loadError=null;this.lookTarget=null;this.reactionAge=10;this.bones={};this.gestureBase=new Map();
 this.ready=loadAssets?new GLTFLoader().loadAsync('assets/models/mostaza-runner.glb').then(g=>{this.install(g);return true;}).catch(e=>{this.loadError=e;console.error('Character asset could not load',e);return false;}):Promise.resolve(false);}
 install(gltf){this.avatar.add(gltf.scene);this.model=gltf.scene;gltf.scene.traverse(o=>{if(o.isBone)this.bones[o.name]=o;if(o.isMesh){// Backpack color is authored directly into the packed Blender material.
o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;if(o.isSkinnedMesh)this.skinned.push(o);}});this.mixer=new T.AnimationMixer(gltf.scene);
 for(const clip of gltf.animations){const action=this.mixer.clipAction(clip);action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;action.play();action.paused=true;action.setEffectiveWeight(0);this.actions[clip.name]={action,duration:clip.duration,weight:0};}
 for(const name of ['Idle','Run','Jump','Roll','Stumble','Deliver','Celebrate'])if(!this.actions[name])throw Error('Missing character animation: '+name);this.actions.Idle.weight=1;}
 react(){this.reactionAge=0}
 resetPresentation(){this.reactionAge=10;this.lookTarget=null;this.lastTime=null;this.runTime=0}
 setLookTarget(target){this.lookTarget=target}
 measure(){this.updateMatrixWorld(true);this.bounds.makeEmpty();for(const mesh of this.skinned){mesh.computeBoundingBox();this.partBounds.copy(mesh.boundingBox).applyMatrix4(mesh.matrixWorld);this.bounds.union(this.partBounds);}return this.bounds;}
 animate(p,t,mode,speed){if(!this.mixer)return;const dt=this.lastTime===null?0:Math.max(0,Math.min(.1,t-this.lastTime));this.lastTime=t;this.reactionAge+=dt;if(t===0)this.runTime=0;if(mode==='run')this.runTime+=dt*(.85+speed*.012);if(mode==='dead'&&this.previousMode!=='dead')this.deathStart=t;
 let state=mode==='dead'?'Stumble':p.slide>0?'Roll':p.y>0?'Jump':mode==='run'?'Run':mode==='deliver'?'Deliver':mode==='celebrate'?'Celebrate':'Idle';if(mode==='pause')state=this.state||'Idle';if(state!==this.state)this.stateStart=t;this.state=state;this.position.set(p.x,p.y,0);this.rotation.y=mode==='menu'?-2.7:0;
 const turn=T.MathUtils.clamp(p.lane*2.5-p.x,-1,1);this.avatar.position.set(0,0,0);this.avatar.scale.setScalar(1);this.avatar.rotation.set(0,0,-turn*.075);
 let total=0;for(const [name,item] of Object.entries(this.actions)){const target=name===state?1:0;item.weight=state==='Roll'||name==='Roll'?target:T.MathUtils.lerp(item.weight,target,1-Math.exp(-dt*20));total+=item.weight;}
 for(const [name,item] of Object.entries(this.actions)){item.action.setEffectiveWeight(item.weight/(total||1));const normalized=name==='Roll'?T.MathUtils.clamp((.85-p.slide)/.85,0,1):name==='Jump'?T.MathUtils.clamp((11-p.vy)/22,0,1):name==='Stumble'?T.MathUtils.clamp((t-this.deathStart)/.65,0,1):null;item.action.time=['Deliver','Celebrate'].includes(name)?Math.min(Math.max(0,t-(this.stateStart??t)),item.duration-1e-5):normalized===null?(name==='Run'?this.runTime:t)%item.duration:normalized*(item.duration-1e-5);}
 // Restore the authored pose before sampling; additive gestures must not accumulate on pause.
 for(const [name,q] of this.gestureBase)this.bones[name].quaternion.copy(q);
 this.mixer.update(0);
 for(const name of ['head'])if(this.bones[name])this.gestureBase.set(name,this.bones[name].quaternion.clone());
 if(state!=='Roll'&&state!=='Stumble'){
  const head=this.bones.head;
  if(head&&this.lookTarget&&mode==='run')head.rotateY(-T.MathUtils.clamp(Math.atan2(this.lookTarget.x-p.x,Math.max(2,-this.lookTarget.z)),-.40,.40));
  // A small nod acknowledges pickups without layering local-axis rotations onto the arms.
  if(mode==='run')head?.rotateX(Math.sin(Math.min(1,this.reactionAge/.65)*Math.PI)*.045);
 }
 // Baked contact curves keep the stance foot on the road without CPU skinning every run frame.
 if(state!=='Roll'){
 const samples=ground[state]||ground.Idle;
 const normalized=state==='Run'?(this.runTime%this.actions.Run.duration)/this.actions.Run.duration:state==='Stumble'?T.MathUtils.clamp((t-this.deathStart)/.65,0,1):['Deliver','Celebrate'].includes(state)?T.MathUtils.clamp((t-this.stateStart)/this.actions[state].duration,0,1):0;
 const at=normalized*(samples.length-1),i=Math.floor(at);this.avatar.position.y=T.MathUtils.lerp(samples[i],samples[Math.min(i+1,samples.length-1)],at-i);
 }
 if(state==='Roll'){let box=this.measure();this.avatar.scale.setScalar(Math.min(1,T.MathUtils.lerp(2.20,1.25,p.slideBlend||0)/(box.max.y-box.min.y)));box=this.measure();this.avatar.position.y+=(p.y+.04-box.min.y)*Math.min(1,(p.slideBlend||0)/.5);}
 this.previousMode=mode;
 }
}
