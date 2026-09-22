import {brandedCup} from './branded-cup.js';
import * as T from './three.module.js';
export const palette={red:new T.MeshStandardMaterial({color:'#cf2338',roughness:.55}),cream:new T.MeshStandardMaterial({color:'#f4e9d0',roughness:.8}),metal:new T.MeshStandardMaterial({color:'#9aadb4',roughness:.35,metalness:.5}),dark:new T.MeshStandardMaterial({color:'#303946',roughness:.7}),wood:new T.MeshStandardMaterial({color:'#bf8750',roughness:.9}),green:new T.MeshStandardMaterial({color:'#519252',roughness:.95}),gold:new T.MeshStandardMaterial({color:'#ffcc4c',roughness:.6}),white:new T.MeshStandardMaterial({color:'#fffdf4',roughness:.85})};
const box=new T.BoxGeometry(),cyl=new T.CylinderGeometry(1,1,1,16),sphere=new T.SphereGeometry(1,12,8);const cached=new Map();
export function part(parent,geo,mat,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx,ry,rz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
export function prop(type){if(cached.has(type))return cached.get(type).clone(true);const g=new T.Group(),m=palette,b=(color,x,y,z,sx,sy,sz)=>part(g,box,color,x,y,z,sx,sy,sz);
 if(type==='mayo'){
 // Squeeze bottle reference: rounded yellow body, ribbed screw cap and fine nozzle.
 const yellow=new T.MeshStandardMaterial({color:'#ffda13',roughness:.32}),cap=new T.MeshStandardMaterial({color:'#f4c600',roughness:.4});
 const profile=[[0,-.38],[.19,-.38],[.224,-.35],[.23,-.30],[.23,.25],[.22,.29],[.18,.32],[0,.32]].map(([r,y])=>new T.Vector2(r,y));
 part(g,new T.LatheGeometry(profile,24),yellow,0,0,0);
 const ribs=new T.CylinderGeometry(.235,.235,.10,112);const vertices=ribs.attributes.position;for(let i=0;i<vertices.count;i++){const x=vertices.getX(i),z=vertices.getZ(i);if(Math.hypot(x,z)>.2){const angle=Math.atan2(x,z),factor=1+.025*Math.cos(angle*28);vertices.setX(i,x*factor);vertices.setZ(i,z*factor);}}ribs.computeVertexNormals();part(g,ribs,cap,0,.345,0);
 part(g,cyl,yellow,0,.409,0,.14,.04,.14);
 part(g,new T.CylinderGeometry(.022,.062,.20,16),yellow,0,.524,0);
 part(g,cyl,cap,0,.629,0,.023,.013,.023);
 }else if(type==='napkins'){
 b(m.dark,0,.06,0,1.8,.12,1.05);b(m.metal,0,.45,0,1.72,.76,.92);b(m.red,0,.40,.47,1.6,.60,.045);b(m.dark,0,.72,.499,1.30,.11,.022);
 for(let i=0;i<5;i++)b(m.white,(i-2)*.055,.83+i*.014,-.02,1.06,.022,.59);
 const tissue=b(m.white,0,.90,.1,1.0,.16,.025);tissue.rotation.x=-.25;
 b(m.cream,0,.32,.50,.70,.19,.02);
 }else if(type==='cup'){g.add(brandedCup());
 }else if(type==='tray'){
 for(let side of [-1,1]){b(m.metal,side*1.03,.84,0,.14,1.68,.78);part(g,cyl,m.dark,side*1.03,.13,.3,.13,.1,.13,0,0,Math.PI/2)}
 b(m.red,0,1.75,0,2.22,.30,1.0);b(m.metal,0,1.92,0,2.23,.06,1.02);b(m.red,0,2.01,-.47,2.22,.15,.06);b(m.red,0,2.01,.47,2.22,.15,.06);
 part(g,cyl,m.white,.55,2.12,0,.25,.20,.25);part(g,cyl,m.red,-.60,2.15,0,.17,.28,.17);
 }else if(type==='floorTray'){
 b(m.red,0,.15,0,1.75,.14,1.1);b(m.metal,0,.235,0,1.64,.03,.97);
 for(const z of [-.51,.51])b(m.red,0,.28,z,1.75,.15,.07);
 b(m.cream,-.25,.41,0,.68,.30,.65);part(g,cyl,m.red,.49,.52,0,.21,.55,.21);part(g,cyl,m.white,.49,.80,0,.23,.04,.23);
 }else if(type==='table'){
 part(g,cyl,m.wood,0,1.06,0,1.1,.12,1.1);part(g,cyl,m.metal,0,.54,0,.075,1.0,.075);part(g,cyl,m.dark,0,.07,0,.5,.08,.5);
 for(const side of [-1,1]){b(m.red,side*1.35,.58,0,.66,.12,.68);b(m.red,side*1.68,.98,0,.10,.76,.68);for(const z of [-.25,.25]){b(m.dark,side*1.35,.30,z,.06,.53,.06)}}
 const cup=brandedCup();cup.scale.setScalar(.13);cup.position.set(.28,1.12,.20);g.add(cup);b(m.cream,-.24,1.14,-.15,.45,.025,.35);
 }else if(type==='umbrella'){
 part(g,cyl,m.metal,0,1.72,0,.055,3.4,.055);part(g,cyl,m.dark,0,.05,0,.45,.08,.45);
 const canopy=new T.ConeGeometry(2.05,.70,12,1,true);part(g,canopy,m.red,0,3.40,0);part(g,cyl,m.gold,0,3.79,0,.09,.10,.09);
 }else if(type==='planter'){
 b(m.cream,0,.30,0,1.7,.6,1.0);b(m.dark,0,.60,0,1.5,.02,.85);
 for(let i=0;i<3;i++)part(g,sphere,m.green,(i-1)*.52,.87,0,.58,.48,.48);
 }else if(type==='tree'){
 const bark=new T.MeshStandardMaterial({color:'#695741',roughness:1});
 part(g,cyl,bark,0,1.85,0,.22,3.7,.20,0,0,.045);
 for(let i=0;i<7;i++){const angle=i*2.399,branch=part(g,cyl,bark,Math.sin(angle)*.48,2.7+i*.15,Math.cos(angle)*.48,.07,2.4,.07);branch.rotation.set(Math.cos(angle)*.48,0,Math.sin(angle)*.48);}
 // One shared crown mesh contains many uneven leaf clusters; no spherical canopy.
 const positions=[],normals=[],colors=[],leafGeo=new T.IcosahedronGeometry(1,0),matrix=new T.Matrix4(),q=new T.Quaternion();
 const tones=['#3f652a','#597b30','#779239','#98aa45'];
 for(let i=0;i<180;i++){const angle=i*2.399,rad=Math.sqrt((i+.5)/180)*2.2,yy=4.2+Math.sin(i*7.31)*.65+(1-rad/2.2)*1.1;
 const scale=.21+(Math.sin(i*9.2)+1)*.19;matrix.compose(new T.Vector3(Math.sin(angle)*rad,yy,Math.cos(angle)*rad*.85),q.setFromEuler(new T.Euler(i*.7,i*1.1,i*.3)),new T.Vector3(scale*1.35,scale*.55,scale));
 const color=new T.Color(tones[i%4]),geo=leafGeo.clone().applyMatrix4(matrix);positions.push(...geo.attributes.position.array);normals.push(...geo.attributes.normal.array);for(let j=0;j<geo.attributes.position.count;j++)colors.push(color.r,color.g,color.b);geo.dispose();}
 leafGeo.dispose();const crown=new T.BufferGeometry();crown.setAttribute('position',new T.Float32BufferAttribute(positions,3));crown.setAttribute('normal',new T.Float32BufferAttribute(normals,3));crown.setAttribute('color',new T.Float32BufferAttribute(colors,3));part(g,crown,new T.MeshStandardMaterial({vertexColors:true,roughness:.95}),0,0,0);
 }else if(type.startsWith('house')){
 const shade=Number(type.slice(-1))||0,walls=new T.MeshStandardMaterial({color:['#eed18a','#7baac5','#c87d69','#9cb57c','#b19bc5','#f1e7d1'][shade%6],roughness:1}),roof=new T.MeshStandardMaterial({color:['#69554d','#445b67','#674c45','#555950','#58505f','#856b55'][shade%6],roughness:.9}),glass=new T.MeshStandardMaterial({color:'#536c75',roughness:.23,metalness:.18});
 b(walls,0,2.5,0,5.6,5,4.8);b(m.cream,0,.18,0,5.8,.36,5);
 for(const side of [-1,1]){const panel=b(roof,side*1.46,5.62,0,3.35,.16,5.3);panel.rotation.z=-side*.45;}
 b(walls,0,5.05,0,4.4,.5,4.8);
 for(const x of [-1.65,1.65])for(const y of [1.5,3.9]){b(m.cream,x,y,2.44,1.35,1.5,.15);b(glass,x,y,2.53,1.13,1.28,.03);b(m.cream,x,y,2.56,.06,1.3,.04);b(m.cream,x,y,2.56,1.15,.06,.04);b(m.wood,x,y-.84,2.63,1.45,.12,.42);}
 b(m.wood,0,1.25,2.44,.9,2.5,.1);b(m.cream,0,2.65,2.88,1.7,.13,1.1);b(m.metal,.3,1.2,2.52,.045,.045,.03);
 for(let i=0;i<9;i++)b(walls,0,.45+i*.5,2.415,5.6,.016,.025);
 b(roof,1.8,5.9,-.6,.65,1.65,.65);
 }else if(type==='bench'){
 b(m.wood,0,.65,0,2.7,.12,.72);b(m.wood,0,1.05,-.30,2.7,.62,.10);for(const side of [-1,1])b(m.dark,side*1,.33,0,.08,.6,.58);
 }else if(type==='shop'){
 b(m.cream,0,2.3,0,5.8,4.6,3.3);b(m.red,0,3.9,1.76,6.0,.65,.35);b(m.dark,0,2.1,1.68,4.8,2.65,.05);for(let i=-1;i<=1;i++)b(m.metal,i*1.5,2.1,1.75,.07,2.65,.08);b(m.red,0,3.4,2.3,6,.12,1.1);
 }
 cached.set(type,g);return g.clone(true)}
