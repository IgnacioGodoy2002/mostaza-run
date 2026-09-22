import * as T from './three.module.js';
let template;
// Reusable cup geometry and printed label, shared by obstacles, tables and the combo.
export function brandedCup(){
 if(template)return template.clone(true);
 const g=new T.Group(),red=new T.MeshStandardMaterial({color:'#ef1027',roughness:.48});
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;const c=canvas.getContext('2d');
  c.fillStyle='#ef1027';c.fillRect(0,0,1024,1024);
  for(const center of [256,768]){
   c.save();c.translate(center,512);c.rotate(-Math.PI/2);c.fillStyle='#fff7e7';c.font='bold 195px Arial, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('Mostaza',0,0,780);c.restore();
   c.strokeStyle='#f7da82';c.lineWidth=10;c.beginPath();for(let y=20;y<=1004;y+=4){const x=center+137+7*Math.sin(y*.035);if(y===20)c.moveTo(x,y);else c.lineTo(x,y)}c.stroke();
  }
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=2;red.map=texture;red.color.set('#ffffff');
 }
 const lid=new T.MeshStandardMaterial({color:'#eeeae2',roughness:.36}),rim=new T.MeshStandardMaterial({color:'#fff8e9',roughness:.65});
 const add=(geo,material,y)=>{const mesh=new T.Mesh(geo,material);mesh.position.y=y;mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh};
 const body=add(new T.CylinderGeometry(.67,.50,2.9,32),red,1.48);body.rotation.y=-Math.PI/2;
 add(new T.CylinderGeometry(.506,.506,.045,32),rim,.047);
 add(new T.CylinderGeometry(.705,.705,.065,32),lid,2.945);
 add(new T.CylinderGeometry(.672,.69,.05,32),lid,3.002);
 const lip=add(new T.TorusGeometry(.68,.024,6,32),rim,3.02);lip.rotation.x=Math.PI/2;
 template=g;return g.clone(true);
}
