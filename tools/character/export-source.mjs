import fs from 'node:fs';
import * as T from '../../public/game/js/three.module.js';
import {Runner} from './prototype-runner.js';
const r=new Runner({loadAssets:false});r.updateMatrixWorld(true);
const roots=new Map([[r.head,'head'],[r.pack,'pack']]);
for(let i=0;i<2;i++){const side=i?'R':'L';roots.set(r.legs[i].leg,'thigh_'+side);roots.set(r.legs[i].knee,'shin_'+side);roots.set(r.arms[i].arm,'upper_'+side);roots.set(r.arms[i].elbow,'fore_'+side);}
const meshes=[];r.traverse(o=>{if(!o.isMesh)return;let parent=o.parent,bone='spine';while(parent){if(roots.has(parent)){bone=roots.get(parent);break;}parent=parent.parent;}
const p=o.geometry.attributes.position,n=o.geometry.attributes.normal,uv=o.geometry.attributes.uv;const verts=[],normals=[];for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);verts.push(v.toArray());if(n)normals.push(new T.Vector3().fromBufferAttribute(n,i).transformDirection(o.matrixWorld).toArray());}
const indices=o.geometry.index?Array.from(o.geometry.index.array):Array.from({length:p.count},(_,i)=>i);
meshes.push({bone,verts,indices,uv:uv?Array.from(uv.array):null,color:o.material.color?.toArray()||[1,1,1],hex:o.material.color?.getHexString(),roughness:o.material.roughness??.8,logo:!!o.material.map});});
const origin=g=>g.getWorldPosition(new T.Vector3()).toArray();
const joints={hips:origin(r.body),spine:[0,1.08,0],head:[0,1.57,0],pack:origin(r.pack)};
for(let i=0;i<2;i++){const s=i?'R':'L';joints['thigh_'+s]=origin(r.legs[i].leg);joints['shin_'+s]=origin(r.legs[i].knee);joints['foot_'+s]=[joints['shin_'+s][0],.16,.01];joints['upper_'+s]=origin(r.arms[i].arm);joints['fore_'+s]=origin(r.arms[i].elbow);joints['hand_'+s]=[joints['fore_'+s][0],joints['fore_'+s][1]-.23,0];}
fs.writeFileSync(new URL('./source-mesh.json',import.meta.url),JSON.stringify({meshes,joints}));console.log(meshes.length,'source surfaces');
