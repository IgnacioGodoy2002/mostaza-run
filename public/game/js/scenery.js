import * as T from './three.module.js';
import {prop,part,palette as m} from './restaurant-props.js';
import {streetMaterial} from './atmosphere.js';
import {ZONE_LENGTH,ZONES,zoneAt} from './journey.js';

// Three bounded, instanced sections recycle as whole blocks, so their borders stay aligned.
export class Scenery{
 constructor(scene,{loadAssets=true}={}){
  this.scene=scene;this.distance=0;this.batches=[];this.zones=[];
  const box=new T.BoxGeometry(),lampPole=new T.CylinderGeometry(.05,.08,5.6,8),lampGlobe=new T.SphereGeometry(.22,10,8);
  const stone=new T.MeshStandardMaterial({color:'#c6bda4',roughness:1}),grass=new T.MeshStandardMaterial({color:'#778751',roughness:1}),paint=new T.MeshStandardMaterial({color:'#e5cb77',roughness:.9});
  const fountainGeo=new T.CylinderGeometry(1,1,1,24),water=new T.MeshStandardMaterial({color:'#64b8cb',roughness:.25,metalness:.15});
  part(scene,box,streetMaterial(),0,-.20,-105,8.5,.4,280);part(scene,box,grass,0,-.46,-105,110,.4,280);
  let logoMaterial=null;const logoGeometry=new T.PlaneGeometry(1.15,1.15);
  if(loadAssets){const tex=new T.TextureLoader().load('assets/mostaza.png');tex.colorSpace=T.SRGBColorSpace;logoMaterial=new T.MeshBasicMaterial({map:tex,transparent:true});}
  for(const [zoneIndex,zone] of ZONES.entries()){
   const root=new T.Group();
   for(const side of [-1,1])part(root,box,stone,side*7,-.11,-120,5,.30,240);
   // Every zone shares the same asphalt; only sidewalk scenery changes.
   const place=(name,x,z,rotation=0,scale=1)=>{const g=prop(name);g.position.set(x,0,z);g.rotation.y=rotation;g.scale.setScalar(scale);root.add(g);return g;};
   for(let i=0;i<24;i++){
    const z=-5-i*10;
    for(const side of [-1,1]){
     const inward=side>0?-Math.PI/2:Math.PI/2;
     part(root,box,stone,side*4.35,.08,z,.25,.24,9.98);
     for(let k=0;k<4;k++)part(root,box,m.cream,side*7,.046,z+3.75-k*2.5,4.9,.006,.025);
     if(zone.id==='neighborhood'){
      if(i%2===0){place('tree',side*6.15,z,i*1.71,.92+(i%3)*.12);place('house'+((Math.floor(i/2)+(side>0?3:0))%6),side*12,z-1,inward,1+(i%3)*.08)}
      else{place('bench',side*7.2,z-2,inward);place('planter',side*6.2,z+1,0,.75);for(let k=0;k<7;k++)part(root,box,m.cream,side*9.3,.55,z-3+k*.6,.09,1.1,.12);part(root,box,m.cream,side*9.3,.8,z-1.2,.10,.08,4)}
     }else if(zone.id==='plaza'){
      if(i%2===0){place('tree',side*9.4,z-2,i,.95);place('table',side*6.9,z+1,0,.78);place('umbrella',side*6.9,z+1,0,.86)}
      else{place('planter',side*6.1,z,0,.85);place('bench',side*8.6,z-2,inward)}
      if(i%6===3){part(root,fountainGeo,m.cream,side*12,.16,z,1.6,.32,1.6);part(root,fountainGeo,water,side*12,.33,z,1.42,.025,1.42);part(root,fountainGeo,m.cream,side*12,.64,z,.22,.6,.22)}
     }else{
      // One destination restaurant; the surrounding block is a large outdoor terrace.
      place('table',side*7.2,z,0,.85);
      if(i%2===0)place('umbrella',side*7.2,z,0,.92);
      if(i%3===1)place('planter',side*5.8,z+3.7,0,.8);
      if(side<0||Math.abs(z+120)>22){place('table',side*11,z+2,0,.85);if(i%2===1)place('umbrella',side*11,z+2,0,.92)}
      if(i%4===0)place('tree',side*15,z,i,1.05);

     }
     if(i%4===1){part(root,lampPole,m.dark,side*5.2,2.8,z);part(root,box,m.dark,side*5,5.6,z,.6,.08,.08);part(root,lampGlobe,m.cream,side*4.78,5.45,z)}
    }
    for(const x of [-1.25,1.25])part(root,box,paint,x,.012,z,.065,.012,3.2);
    for(const x of [-4.05,4.05])part(root,box,m.cream,x,.012,z,.09,.008,9.97);
   }
   if(zone.id==='restaurants'){
    const shop=place('shop',16,-120,-Math.PI/2);shop.scale.set(3.8,1.5,2.8);
    if(logoMaterial){const sign=part(shop,logoGeometry,logoMaterial,0,3.92,1.97);sign.scale.set(.6,1.45,1)}
    part(root,box,stone,10.5,.005,-120,12,.05,40);
    for(const z of [-136,-128,-120,-112,-104]){place('table',9,z,0,.9);place('umbrella',9,z,0,1)}
   }
   root.updateMatrixWorld(true);const groups=new Map();root.traverse(o=>{if(!o.isMesh)return;const key=o.geometry.uuid+o.material.uuid;if(!groups.has(key))groups.set(key,{geometry:o.geometry,material:o.material,matrices:[]});groups.get(key).matrices.push(o.matrixWorld.clone())});
   const renderRoot=new T.Group();renderRoot.name=zone.id;renderRoot.userData.restaurantCount=zone.id==='restaurants'?1:0;
   for(const {geometry,material,matrices} of groups.values()){
    const batch=new T.InstancedMesh(geometry,material,matrices.length);batch.castShadow=!material.transparent;batch.receiveShadow=true;batch.frustumCulled=false;
    matrices.forEach((matrix,i)=>batch.setMatrixAt(i,matrix));renderRoot.add(batch);this.batches.push({batch});
   }
   scene.add(renderRoot);this.zones.push(renderRoot);
  }
  for(let layer=0;layer<3;layer++){
   const shape=new T.Shape();shape.moveTo(-160,-12);for(let i=0;i<=60;i++){const x=-160+i*320/60,y=12+layer*3+Math.sin(i*.19+layer)*9+Math.sin(i*.55+layer*2)*3;shape.lineTo(x,y)}shape.lineTo(160,-12);shape.closePath();
   const hill=new T.Mesh(new T.ShapeGeometry(shape),new T.MeshBasicMaterial({color:['#899e9c','#76908b','#648275'][layer],fog:false}));hill.position.z=-225+layer*6;scene.add(hill);
  }
  const distant=new T.Group(),town=new T.MeshStandardMaterial({color:'#b0b2a3',roughness:1});for(let i=0;i<65;i++){const x=-100+i*3.1,y=1.2+(Math.sin(i*17.1)+1)*2.1;part(distant,box,town,x,y/2,-199-(i%3)*3,1.8,y,2.1)}scene.add(distant);this.reset();
 }
 reset(){this.distance=0;this.update(0,0)}
 get zone(){return zoneAt(this.distance)}
 update(dt,speed){this.distance+=dt*speed;for(const [i,root] of this.zones.entries()){root.position.z=((this.distance-i*ZONE_LENGTH+460)%720+720)%720-460;root.visible=root.position.z>-245&&root.position.z<260}}
}
