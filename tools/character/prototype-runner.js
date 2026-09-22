import * as T from '../../public/game/js/three.module.js';
// Human runner, articulated knees and arms, branded uniform facing the chase camera.
export class Runner extends T.Group{
 constructor({loadAssets=true}={}){super();const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.78}),red=mat('#cf2037'),dark=mat('#242936'),skin=mat('#c98f68'),white=mat('#fff3df'),hair=mat('#68412b');skin.roughness=.62;const sphere=new T.SphereGeometry(1,28,18);
 const add=(parent,geo,m,x,y,z,sx=1,sy=1,sz=1)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
 // Elliptical cross-sections shape shoulders, waist and tapered limbs as continuous surfaces.
 const loft=(rings,segments=20)=>{const positions=[],indices=[];
 for(const [y,rx,rz,cx=0,cz=0] of rings)for(let j=0;j<=segments;j++){const a=j/segments*Math.PI*2;positions.push(cx+Math.sin(a)*rx,y,cz+Math.cos(a)*rz);}
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<segments;j++){const a=i*(segments+1)+j,b=a+segments+1;indices.push(a,a+1,b,b,a+1,b+1);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
 // Average duplicate vertices along the closing seam for smooth fabric shading.
 const n=geo.attributes.normal;for(let i=0;i<rings.length;i++){const a=i*(segments+1),b=a+segments,v=new T.Vector3().fromBufferAttribute(n,a).add(new T.Vector3().fromBufferAttribute(n,b)).normalize();n.setXYZ(a,v.x,v.y,v.z);n.setXYZ(b,v.x,v.y,v.z);}return geo;};
 const seam=(parent,points,color=dark,radius=.006)=>add(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),12,radius,5,false),color,0,0,0);
 this.body=new T.Group();this.add(this.body);this.body.position.y=.92;
 const torso=loft([[0,.238,.178],[.035,.26,.186],[.12,.249,.18],[.25,.265,.19],[.42,.285,.185],[.52,.295,.17],[.59,.24,.14],[.63,.12,.10]]);
 add(this.body,torso,red,0,0,0);add(this.body,loft([[-.15,.23,.16],[-.06,.255,.18],[.04,.235,.17]]),dark,0,0,0);
 for(const side of [-1,1]){
 seam(this.body,[[side*.20,-.01,.168],[side*.19,-.085,.181],[side*.10,-.10,.178]],white,.003);
 seam(this.body,[[side*.24,.10,.03],[side*.26,.29,.08],[side*.29,.44,.10]],red,.008);
 seam(this.body,[[side*.10,.08,.176],[side*.16,.11,.176],[side*.21,.12,.16]],red,.007);
 }
 add(this.body,new T.CylinderGeometry(.10,.13,.18,12),skin,0,.66,0);const head=new T.Group();head.position.y=.89;this.body.add(head);this.head=head;head.scale.setScalar(1.0);head.position.y=.88;this.cap=new T.Group();head.add(this.cap);this.cap.rotation.y=-.25;this.cap.rotation.z=-.055;const face=new T.SphereGeometry(1,28,20);const vertices=face.attributes.position;for(let i=0;i<vertices.count;i++){const y=vertices.getY(i);vertices.setX(i,vertices.getX(i)*(y<-.15?.79+.21*(y+1)/.85:1));const z=vertices.getZ(i);if(z<-.4){const cheek=Math.exp(-(((y+.1)/.32)**2));vertices.setZ(i,z-.045*cheek);}}face.computeVertexNormals();add(head,face,skin,0,0,0,.22,.28,.21);add(this.cap,new T.SphereGeometry(1,28,16,0,Math.PI*2,0,Math.PI/2),red,0,.12,.02,.263,.18,.245);const brim=new T.Shape();brim.moveTo(-.20,0);brim.quadraticCurveTo(-.23,-.19,0,-.24);brim.quadraticCurveTo(.23,-.19,.20,0);brim.closePath();const visor=add(this.cap,new T.ExtrudeGeometry(brim,{depth:.022,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.008,bevelThickness:.005}),red,0,.14,-.13);visor.rotation.x=Math.PI/2;for(let side of [-1,1]){add(head,sphere,skin,side*.21,-.02,0,.045,.065,.04);add(head,sphere,white,side*.078,.025,-.196,.033,.028,.013);add(head,sphere,hair,side*.078,.024,-.208,.015,.019,.007);add(head,new T.CapsuleGeometry(.009,.046,2,8),hair,side*.078,.069,-.196,1,1,1).rotation.z=side*.10+Math.PI/2}add(head,loft([[-.075,.018,.012,0,-.219],[-.046,.033,.030,0,-.236],[-.025,.028,.038,0,-.233],[.035,.014,.018,0,-.211],[.065,0,0,0,-.198]],16),skin,0,0,0);
 // Polo collar, piping, placket and belt give the uniform a tailored silhouette.
 const collar=new T.TorusGeometry(.124,.023,8,24);add(this.body,collar,white,0,.62,0).rotation.x=Math.PI/2;
 for(const side of [-1,1]){const lapel=add(this.body,new T.BoxGeometry(.095,.115,.018),white,side*.065,.553,-.203);lapel.rotation.z=side*.25;add(this.body,new T.BoxGeometry(.018,.35,.035),white,side*.275,.28,.05)}
 add(this.body,new T.BoxGeometry(.045,.22,.012),red,0,.46,-.242);for(const y of [.48,.42])add(this.body,sphere,white,0,y,-.255,.009,.009,.005);
 add(this.body,new T.CylinderGeometry(.247,.247,.043,20),hair,0,.007,0,1,1,.86);add(this.body,new T.BoxGeometry(.07,.044,.025),white,0,.01,-.22);
 const smile=new T.CatmullRomCurve3([new T.Vector3(-.046,-.12,-.19),new T.Vector3(0,-.13,-.212),new T.Vector3(.046,-.12,-.19)]);add(head,new T.TubeGeometry(smile,10,.005,5,false),hair,0,0,0);
 add(this.cap,new T.CylinderGeometry(.055,.055,.012,16),white,0,.185,-.20,1,1,1).rotation.x=Math.PI/2;
 const band=add(this.cap,new T.TorusGeometry(.245,.009,6,32,Math.PI*2),red,0,.12,.02);band.rotation.x=Math.PI/2;
 // Embroidered panel seams and the rear adjustment strap soften the cap silhouette.
 for(const a of [-1.1,0,1.1])seam(this.cap,[[Math.sin(a)*.247,.13,Math.cos(a)*.229],[Math.sin(a)*.185,.24,Math.cos(a)*.18],[0,.30,.02]],red,.004);
 add(this.cap,new T.BoxGeometry(.115,.032,.014),white,0,.12,.261);
 this.legs=[];this.arms=[];
 for(const side of [-1,1]){const leg=new T.Group();leg.position.set(side*.15,0,0);this.body.add(leg);add(leg,loft([[-.305,.105,.117],[-.285,.111,.122],[-.22,.12,.13],[-.09,.128,.137],[.01,.13,.135]]),dark,0,0,0);const knee=new T.Group();knee.position.y=-.4;leg.add(knee);add(knee,loft([[-.35,.057,.062],[-.27,.060,.07],[-.18,.079,.084],[-.08,.083,.089],[.015,.074,.078],[.095,.082,.088]]),skin,0,0,0);add(knee,sphere,white,0,-.36,-.07,.12,.09,.21);add(knee,sphere,dark,0,-.423,-.075,.115,.027,.19);add(knee,new T.BoxGeometry(.16,.05,.08),red,0,-.31,-.08);for(let j=0;j<3;j++)add(knee,new T.BoxGeometry(.12,.012,.012),dark,0,-.304,-.10-j*.035);add(knee,loft([[-.35,.063,.068],[-.31,.065,.072],[-.275,.065,.075]]),white,0,0,0);seam(leg,[[side*.105,-.29,.065],[0,-.298,.119],[-side*.105,-.29,.065]],dark,.009);this.legs.push({leg,knee});
 const arm=new T.Group();arm.position.set(side*.32,.48,0);this.body.add(arm);add(arm,loft([[-.25,.077,.077],[-.19,.088,.09],[-.06,.096,.101],[.025,.048,.05]]),red,0,0,0);const elbow=new T.Group();elbow.position.y=-.27;arm.add(elbow);add(elbow,loft([[-.23,.046,.045],[-.14,.062,.06],[-.04,.072,.072],[.02,.063,.062]]),skin,0,0,0);add(elbow,sphere,skin,0,-.27,0,.060,.078,.05);add(elbow,sphere,skin,-side*.047,-.25,-.025,.022,.037,.026);add(arm,new T.CylinderGeometry(.087,.087,.028,12),white,0,-.22,0);for(let f=0;f<3;f++)seam(elbow,[[side*(f-1)*.023-.008,-.28,-.049],[side*(f-1)*.023+.008,-.28,-.049]],skin,.003);
 seam(leg,[[side*.105,-.06,.075],[side*.106,-.18,.066],[side*.097,-.26,.055]],dark,.004);
 this.arms.push({arm,elbow});}
 // A small branded delivery pack and soft hair add a recognizable silhouette from behind.
 const canvas=new T.MeshStandardMaterial({color:'#dfad48',roughness:.97}),stitch=new T.MeshStandardMaterial({color:'#efdfbd',roughness:1});
 this.pack=new T.Group();this.pack.position.set(0,.03,.27);this.body.add(this.pack);
 add(this.pack,loft([[0,0,0],[.025,.18,.10],[.10,.25,.145],[.37,.25,.145],[.48,.21,.13],[.50,0,0]]),canvas,0,0,0);
 add(this.pack,loft([[.35,.245,.149],[.44,.245,.155],[.51,.19,.12],[.52,0,0]]),stitch,0,0,.01);
 seam(this.pack,[[-.21,.11,.145],[-.21,.28,.150],[0,.31,.152],[.21,.28,.150],[.21,.11,.145]],stitch,.0035);
 for(const side of [-1,1]){
 seam(this.body,[[side*.16,.12,.34],[side*.20,.55,.18],[side*.18,.59,-.06],[side*.21,.40,-.18],[side*.19,.08,-.16]],canvas,.019);
 add(this.body,new T.BoxGeometry(.054,.064,.020),dark,side*.20,.27,-.20);
 }
 // Layered, tapered chestnut locks extend visibly below the cap, especially from behind.
 const hairShell=new T.SphereGeometry(1,24,16,0,Math.PI,Math.PI*.25,Math.PI*.55);
 add(head,hairShell,hair,0,.01,.025,.239,.253,.224);
 const warmHair=mat('#805139');this.hairLocks=[];
 for(let i=0;i<12;i++){
 const a=-1.65+i*3.3/11,lock=new T.Group();lock.position.set(Math.sin(a)*.196,-.045,Math.cos(a)*.208+.018);lock.rotation.z=Math.sin(a)*.3+Math.sin(i*2.7)*.13;lock.scale.set(1,.65+.18*(.5+.5*Math.sin(i*3.1)),1);head.add(lock);
 add(lock,loft([[-.17,0,0,.025,.012],[-.12,.026,.022,.015,.009],[-.05,.044,.029],[.035,.039,.029],[.07,0,0]]),i%3?hair:warmHair,0,0,0);this.hairLocks.push(lock);
 }
 // A short fringe peeks out beneath the turned visor.
 for(let i=0;i<4;i++){const fringe=add(head,loft([[-.06,0,0,.02,0],[0,.032,.018],[.07,.037,.020],[.10,0,0]]),hair,-.11+i*.055,.08,-.197);fringe.rotation.z=-.25;}
 // The folded fabric top and carry handle distinguish the bag from a rigid box.
 add(this.pack,new T.CapsuleGeometry(.040,.34,3,12),stitch,0,.50,.02).rotation.z=Math.PI/2;
 seam(this.pack,[[-.085,.50,-.02],[-.07,.58,-.035],[.07,.58,-.035],[.085,.50,-.02]],canvas,.014);
 for(const side of [-1,1]){add(this.pack,new T.BoxGeometry(.038,.19,.013),canvas,side*.16,.365,.159);add(this.pack,new T.BoxGeometry(.052,.045,.022),dark,side*.16,.31,.166);}
 // Soft skin-colored eyelids and catchlights make the face read at menu distance.
 for(const side of [-1,1]){
 add(head,sphere,white,side*.074,.031,-.215,.004,.004,.003);
 seam(head,[[side*.078-.030,.042,-.200],[side*.078,.050,-.207],[side*.078+.030,.042,-.200]],skin,.006);
 }
 // Use the same official brand asset on the front and back of the shirt.
 const tex=loadAssets?new T.TextureLoader().load('assets/mostaza.png'):new T.Texture();tex.colorSpace=T.SRGBColorSpace;const logoMat=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false});const back=add(this.pack,new T.PlaneGeometry(.23,.23),logoMat,0,.18,.154);const front=add(this.body,new T.PlaneGeometry(.19,.19),logoMat,-.09,.43,-.245);front.rotation.y=Math.PI;
 this.death=0;this.phase=0;this.lastTime=0;this.rollBounds=new T.Box3();
 }
 animate(p,t,mode,speed){const slide=p.slideBlend||0,run=mode==='run',air=p.y>0,turn=T.MathUtils.clamp(p.lane*2.5-p.x,-1,1);const dt=Math.max(0,Math.min(.05,t-this.lastTime));this.lastTime=t;if(t===0)this.phase=0;if(run)this.phase+=dt*(10+speed*.12);const phase=this.phase;this.position.set(p.x,p.y,0);this.rotation.y=mode==='menu'?-2.7:0;this.death=mode==='dead'?Math.min(1,this.death+.045):0;
 // The roll follows the physics timer, so pause and low frame rates cannot desync it.
 const elapsed=.85-(p.slide||0),roll=p.slide>0?T.MathUtils.smoothstep(elapsed,.09,.73):0;
 this.body.scale.setScalar(1);
 this.body.position.set(0,.92+(run&&!air?Math.abs(Math.sin(phase))*.025:0),0);
 this.body.rotation.set(-Math.PI*2*roll,run&&!air?Math.sin(phase)*.035*(1-slide):0,-turn*.1-this.death*1.2);
 this.head.rotation.set(slide*.65+(run&&!air?Math.sin(phase*2)*.018:0),(-.08+Math.sin(t*1.4)*.06)*(1-slide),-.025*(1-slide));
 this.pack.rotation.set(run&&!air?Math.sin(phase*2-.6)*.035*(1-slide):0,0,run?Math.sin(phase-.5)*.035*(1-slide):0);
 this.pack.position.y=.03+(run&&!air?Math.sin(phase*2-.6)*.012*(1-slide):0);
 for(let i=0;i<this.hairLocks.length;i++)this.hairLocks[i].rotation.x=run?Math.sin(phase*2+i*.3)*.045*(1-slide):0;
 for(let i=0;i<2;i++){
 const swing=Math.sin(phase+i*Math.PI),mix=(a,b)=>T.MathUtils.lerp(a,b,slide);
 this.legs[i].leg.rotation.x=mix(air?-.35:run?swing*.63:0,-1.9);
 this.legs[i].knee.rotation.x=mix(air?.65:run?Math.max(0,-swing)*1.05:.08,2.2);
 this.arms[i].arm.rotation.x=mix(air?-.55:run?-swing*.57:0,-1.5);
 this.arms[i].arm.rotation.z=(i?1:-1)*.10*(1-slide);
 this.arms[i].elbow.rotation.x=mix(-.75,-1.6);
 }
 if(slide>0){
 // Keep the tucked silhouette above the pavement and inside the duck clearance.
 this.updateMatrixWorld(true);this.rollBounds.setFromObject(this.body);
 const height=this.rollBounds.max.y-this.rollBounds.min.y;
 this.body.scale.setScalar(Math.min(1,T.MathUtils.lerp(2.2,1.25,slide)/height));
 this.updateMatrixWorld(true);this.rollBounds.setFromObject(this.body);
 this.body.position.y+=(p.y+.055-this.rollBounds.min.y)*Math.min(1,slide/.5);
 }
 }
}
