import * as T from './three.module.js';
import {headGeometry,torsoGeometry,tailGeometry} from './raccoon-model.js';
// Electric scooter + articulated raccoon: feet stay on deck; hands follow actual grips.
export class Character extends T.Group {
 constructor(){super();const mat=(c,r=.8)=>new T.MeshStandardMaterial({color:c,roughness:r});const fur=mat('#92918c'),dark=mat('#303a43'),cream=mat('#efe6cf'),orange=mat('#e88639'),teal=mat('#258982'),shoe=mat('#e3b862'),black=mat('#152630'),white=mat('#fff6e5'),metal=mat('#657c85',.32);
 const sphere=new T.SphereGeometry(1,24,16),box=new T.BoxGeometry();
 const add=(parent,geo,m,x,y,z,sx=1,sy=1,sz=1)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;parent.add(o);return o};
 this.board=new T.Group();this.add(this.board);
 add(this.board,new T.CapsuleGeometry(.22,1.04,5,14).rotateX(Math.PI/2),teal,0,.28,0,1,.20,1);
 add(this.board,box,dark,0,.326,0,.39,.02,1.28);
 for(const side of [-1,1])add(this.board,box,orange,side*.223,.28,0,.035,.065,1.10);
 this.wheels=[];for(const z of [-.81,.81]){const w=new T.Group();w.position.set(0,.18,z);this.board.add(w);add(w,new T.CylinderGeometry(.18,.18,.15,20),black,0,0,0).rotation.z=Math.PI/2;add(w,new T.CylinderGeometry(.105,.105,.16,16),metal,0,0,0).rotation.z=Math.PI/2;this.wheels.push(w);add(this.board,new T.TorusGeometry(.21,.035,6,16,Math.PI),teal,0,.18,z).rotation.y=Math.PI/2;}
 // Stem, front fork, battery indicator, grips and a small headlamp.
 add(this.board,new T.CylinderGeometry(.035,.05,1.06,12),metal,0,.78,-.68);
 add(this.board,new T.CylinderGeometry(.032,.032,.80,12),dark,0,1.31,-.68).rotation.z=Math.PI/2;
 this.grips=[];for(const side of [-1,1]){const grip=add(this.board,new T.CylinderGeometry(.052,.052,.21,12),black,side*.33,1.31,-.68);grip.rotation.z=Math.PI/2;this.grips.push(grip)}
 add(this.board,box,black,0,1.33,-.68,.13,.06,.11);add(this.board,box,new T.MeshBasicMaterial({color:'#75efc1'}),0,1.365,-.68,.075,.005,.035);
 add(this.board,sphere,new T.MeshStandardMaterial({color:'#fff4c5',emissive:'#ffebae',emissiveIntensity:1}),0,1.18,-.732,.07,.055,.025);
 add(this.board,box,new T.MeshBasicMaterial({color:'#ef7752'}),0,.34,.74,.13,.045,.025);
 this.rider=new T.Group();this.add(this.rider);const r=this.rider;
 const coat=add(r,torsoGeometry(),teal,0,0,0,1,1,.8);add(r,sphere,dark,0,-.06,0,.25,.17,.22);
 // Tailored jacket collar, front zip, shoulder panels and a stitched back patch.
 add(r,new T.TorusGeometry(.16,.038,8,24),cream,0,.55,0).rotation.x=Math.PI/2;
 add(r,box,cream,0,.28,-.246,.025,.45,.016);add(r,box,orange,0,.31,.251,.20,.17,.022);
 for(const side of [-1,1])add(r,new T.CapsuleGeometry(.085,.13,4,12),orange,side*.26,.42,0,1,1,.8).rotation.z=side*.65;
 this.head=new T.Group();this.head.position.y=.82;r.add(this.head);const h=this.head;
 add(h,headGeometry(),new T.MeshStandardMaterial({vertexColors:true,roughness:.92}),0,0,0);
 // Tapered ears have a pinched tip, rather than separate round balls.
 const earGeo=new T.SphereGeometry(1,18,14);for(let i=0;i<earGeo.attributes.position.count;i++){const y=earGeo.attributes.position.getY(i);earGeo.attributes.position.setX(i,earGeo.attributes.position.getX(i)*(1-.38*Math.max(0,y)))}earGeo.computeVertexNormals();
 this.ears=[];for(const side of [-1,1]){const ear=new T.Group();ear.position.set(side*.29,.28,0);h.add(ear);ear.rotation.z=-side*.20;add(ear,earGeo,dark,0,0,0,.135,.205,.085);add(ear,earGeo,cream,0,.012,-.06,.082,.133,.029);this.ears.push(ear)}
 this.eyes=[];for(const side of [-1,1]){const eye=new T.Group();eye.position.set(side*.151,.025,-.323);h.add(eye);add(eye,sphere,white,0,0,0,.085,.095,.038);add(eye,sphere,mat('#6e8b66',.3),0,0,-.029,.050,.064,.02);add(eye,sphere,black,0,0,-.046,.028,.044,.012);add(eye,sphere,white,-.013,.023,-.057,.013,.015,.005);this.eyes.push(eye);const brow=add(h,new T.CapsuleGeometry(.022,.105,3,10),cream,side*.155,.146,-.29);brow.rotation.z=side*.14+Math.PI/2;}
 add(h,sphere,black,0,-.09,-.465,.074,.052,.045);
 const mouth=new T.CatmullRomCurve3([new T.Vector3(-.09,-.19,-.39),new T.Vector3(0,-.205,-.42),new T.Vector3(.09,-.19,-.39)]);add(h,new T.TubeGeometry(mouth,12,.008,5,false),dark,0,0,0);
 add(h,new T.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2),orange,0,.17,.025,.30,.225,.285);
 add(h,box,cream,0,.387,.025,.052,.025,.25);for(const side of [-1,1])add(h,box,dark,side*.135,.362,.08,.033,.02,.11);
 this.legs=[];this.arms=[];
 const limb=(x,y,z,length,radius,color,endMaterial,isArm)=>{const hip=new T.Group();hip.position.set(x,y,z);r.add(hip);add(hip,new T.CapsuleGeometry(radius,length-radius*2,4,12),color,0,-length/2,0);const knee=new T.Group();knee.position.y=-length;hip.add(knee);add(knee,new T.CapsuleGeometry(radius*.88,length-radius*1.76,4,12),fur,0,-length/2,0);const foot=add(knee,sphere,endMaterial,0,-length,0,isArm?.10:.12,isArm?.09:.09,isArm?.085:.19);return {hip,knee,foot,length}};
 for(const side of [-1,1]){this.legs.push(limb(side*.145,-.05,0,.37,.10,dark,shoe,false));this.arms.push(limb(side*.285,.44,-.04,.45,.09,teal,dark,true))}
 // Smooth ringed tail deforms with a four-bone skin instead of rigid bead segments.
 this.tail=new T.Group();this.tail.position.set(0,-.07,.20);r.add(this.tail);const tailGeo=tailGeometry(),indices=[],weights=[];
 for(let i=0;i<tailGeo.attributes.position.count;i++){const u=T.MathUtils.clamp(tailGeo.attributes.position.getZ(i)/.28,0,2.999),n=Math.floor(u);indices.push(n,n+1,0,0);weights.push(1-(u-n),u-n,0,0)}tailGeo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));tailGeo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
 this.tailBones=[];for(let i=0;i<4;i++){const bone=new T.Bone();if(i)bone.position.z=.28;if(i)this.tailBones[i-1].add(bone);this.tailBones.push(bone)}const tailMesh=new T.SkinnedMesh(tailGeo,new T.MeshStandardMaterial({vertexColors:true,roughness:.95}));tailMesh.add(this.tailBones[0]);tailMesh.bind(new T.Skeleton(this.tailBones));tailMesh.castShadow=true;this.tail.add(tailMesh);
 this.wasAir=false;this.landing=0;this.death=0;this.lastT=0;
 }
 solve(limb,target,bend){const {hip,knee,foot,length}=limb;this.rider.updateWorldMatrix(true,false);const local=this.rider.worldToLocal(target.clone()).sub(hip.position),distance=Math.min(local.length(),length*2-.00001),direction=local.clone().normalize();const forward=bend.clone().addScaledVector(direction,-bend.dot(direction)).normalize();const joint=direction.clone().multiplyScalar(distance*.5).addScaledVector(forward,Math.sqrt(length*length-distance*distance*.25));const down=new T.Vector3(0,-1,0);hip.quaternion.setFromUnitVectors(down,joint.clone().normalize());const lower=new T.Quaternion().setFromUnitVectors(down,direction.multiplyScalar(distance).sub(joint).normalize());knee.quaternion.copy(hip.quaternion).invert().multiply(lower);foot.quaternion.copy(lower).invert()}
 animate(p,t,mode,speed){const dt=Math.min(.05,Math.max(0,t-this.lastT));this.lastT=t;const air=p.y>0,run=mode==='run',slide=p.slideBlend||0,turn=T.MathUtils.clamp(p.lane*2.5-p.x,-1,1);
 if(this.wasAir&&!air&&run)this.landing=.22;this.wasAir=air;if(t===0||mode==='menu')this.landing=0;this.landing=Math.max(0,this.landing-dt);const absorb=Math.sin(this.landing/.22*Math.PI)*.07;this.death=mode==='dead'?Math.min(1,this.death+dt*3):0;
 this.position.set(p.x,p.y,0);this.rotation.set(0,mode==='menu'?-2.6:0,0);
 // Both feet stay aboard; a compact duck replaces the skate's prone slide.
 this.rider.position.set(-turn*.025,.91-slide*.40-absorb,.10+slide*.13);this.rider.rotation.set(-slide*1.30,0,-turn*.09*(1-slide)-this.death*.9);
 this.board.position.set(0,0,-this.death*1.4);this.board.rotation.set(air?-.13*T.MathUtils.clamp(p.vy/11,-1,1):0,0,-turn*.018);
 this.head.rotation.set(slide*.60+Math.sin(t*2.4)*.025*(1-slide),mode==='menu'?Math.sin(t*.7)*.22:-turn*.20,0);
 const blink=Math.pow(Math.max(0,Math.cos(t*1.8)),48);for(const eye of this.eyes)eye.scale.y=1-blink*.88;
 this.ears.forEach((ear,i)=>ear.rotation.z=(i?-.2:.2)+Math.sin(t*2.5+i)*.025);
 this.tail.rotation.x=slide*.9;this.tailBones.forEach((bone,i)=>{bone.rotation.y=(Math.sin(t*3-i*.55)*.065+turn*.065)*(1-slide);bone.rotation.x=Math.sin(t*2-i*.4)*.025*(1-slide)});
 this.updateWorldMatrix(true,true);
 for(let i=0;i<2;i++){const local=new T.Vector3(i?.11:-.10,.43,i?.32:-.12);this.solve(this.legs[i],this.board.localToWorld(local),new T.Vector3(0,0,-1));this.solve(this.arms[i],this.grips[i].getWorldPosition(new T.Vector3()),new T.Vector3(i?1:-1,0,.25))}
 for(const wheel of this.wheels)if(run)wheel.rotation.x-=speed*dt/.18;
 }
}
