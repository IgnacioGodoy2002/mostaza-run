import * as T from './three.module.js';
import {prop} from './restaurant-props.js';
import {ingredient} from './ingredients.js';
import {powerIcon} from './powerups.js';
import {advanceHazard} from './journey.js';
import {Scenery} from './scenery.js';
const mat=(c)=>new T.MeshStandardMaterial({color:c,roughness:1,flatShading:true});
export class World{
 constructor(scene,{loadAssets=true}={}){this.loadAssets=loadAssets;this.scene=scene;this.items=[];this.rows=0;this.until=25;this.box=new T.BoxGeometry(1,1,1);this.coinGeo=new T.CylinderGeometry(.26,.26,.10,10);this.powerGeo=new T.OctahedronGeometry(.47);this.ringGeo=new T.TorusGeometry(.66,.035,4,16);this.mats={low:mat('#db293a'),wall:mat('#b51d29'),arch:mat('#9daeb0'),coin:mat('#ffda62'),shield:mat('#78e3e0'),speed:mat('#f79e4b')};this.decor=[];this.setup()}
 mesh(geo,m,x,y,z,sx=1,sy=1,sz=1){let o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;return o}
 setup(){this.scenery=new Scenery(this.scene,{loadAssets:this.loadAssets});this.trim=mat('#ffd355');this.wood=mat('#f0dfc0');this.dark=mat('#6a1a23')}
 reset(){this.clear();this.until=25;this.rows=0;this.scenery.reset()}
 clear(){for(const o of [...this.items])this.remove(o)}
 spawn(type,lane,z){let g=new T.Group(),m=this.mats[type];
 if(['arch','wall','low'].includes(type)){g.add(prop({arch:'tray',wall:'cup',low:'napkins'}[type]));}
 else if(type==='coin'){const tub=prop('mayo');tub.position.y=1;g.add(tub)}else{const icon=powerIcon(type);icon.position.y=1.2;g.add(icon)}
 g.position.set(lane*2.5,0,z);this.scene.add(g);this.items.push({type,lane,z,mesh:g})}
 spawnIngredient(target){const lanes=[-1,0,1].sort(()=>Math.random()-.5);const blocked=lane=>this.items.filter(o=>['wall','low','arch'].includes(o.type)&&(o.dynamic||o.lane===lane)&&Math.abs(o.z-target.z)<24);const lane=lanes.find(l=>blocked(l).length===0)??lanes[0];for(const o of blocked(lane))this.remove(o);
 const group=new T.Group(),food=ingredient(target.ingredient);food.position.y=.95;food.rotation.x=-.35;group.add(food);const marker=new T.Mesh(this.ringGeo,this.mats.coin);marker.scale.setScalar(1.5);marker.rotation.x=-Math.PI/2;marker.position.y=.05;group.add(marker);group.position.set(lane*2.5,0,target.z);this.scene.add(group);const o={type:'ingredient',ingredient:target.ingredient,targetId:target.id,lane,z:target.z,oldZ:target.z,mesh:group};this.items.push(o);return o;
 }
 // Carts patrol the full road; trays glide between adjacent lanes. Only one moving obstacle per row.
 spawnMoving(kind,fromLane,toLane,z){
  const type=kind==='cart'?'wall':'low',g=new T.Group();
  if(kind==='cart'){const cart=prop('tray');cart.scale.setScalar(.8);g.add(cart);g.add(this.mesh(this.box,this.mats.wall,0,.9,0,1.6,1.05,.9));const napkins=prop('napkins');napkins.scale.setScalar(.55);napkins.position.y=1.6;g.add(napkins)}else g.add(prop('floorTray'));
  g.position.set(fromLane*2.5,0,z);this.scene.add(g);

  const phase=Math.random()*Math.PI*2,fromX=kind==='cart'?-2.5:fromLane*2.5,toX=kind==='cart'?2.5:toLane*2.5;
  const o={type,kind,dynamic:true,lane:toLane,fromLane,fromX,toX,x:fromX,oldX:fromX,z,oldZ:z,motionAge:0,phase,period:kind==='cart'?3.6:2.8,mesh:g};advanceHazard(o,0);o.oldX=o.x;g.position.x=o.x;this.items.push(o);return o;
 }
 row(speed){
  const moving=this.rows>=4&&this.rows%4===1;
  const safe=moving?(Math.random()<.5?-1:1):Math.floor(Math.random()*3)-1,other=[-1,0,1].filter(l=>l!==safe);
  if(moving&&Math.random()<.5)other.reverse();
  if(moving)this.spawnMoving(this.rows%8===1?'cart':'slidingTray',other[0],other[1],-115);
  else{const count=this.rows<4?1:(Math.random()<Math.min(.72,this.rows/40)?2:1);for(let i=0;i<count;i++)this.spawn(['low','arch','wall'][Math.floor(Math.random()*3)],other[i],-115)}
  for(let i=0;i<5;i++)this.spawn('coin',safe,-115-i*1.35);if(this.rows%6===3)this.spawn('speed',safe,-124);
  this.rows++;this.until=Math.max(moving?30:18,speed*(moving?1.35:.98))+Math.random()*6;
 }
 update(dt,speed,active,moveScenery=true){let dz=dt*speed;if(moveScenery)this.scenery.update(dt,speed);if(!active)return;if((this.until-=dz)<=0)this.row(speed);
 for(let o of this.items){o.oldZ=o.z;
  if(o.dynamic){advanceHazard(o,dt);o.mesh.position.x=o.x}
  o.z+=dz;o.mesh.position.z=o.z;
  if(o.type==='coin')o.mesh.rotation.y+=dt*2;
  else if(!['low','arch','wall'].includes(o.type))o.mesh.rotation.y=Math.sin(o.z*.08)*.18;
 }
 for(let i=this.items.length-1;i>=0;i--)if(this.items[i].z>8&&this.items[i].type!=='ingredient'){this.remove(this.items[i])}}
 remove(o){const i=this.items.indexOf(o);if(i<0)return;this.scene.remove(o.mesh);this.items.splice(i,1)}
}
