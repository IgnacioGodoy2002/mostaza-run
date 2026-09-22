// Changing shadowMap.enabled alone can leave a compiled material sampling an
// old shadow texture. Invalidate receivers and lights together, never freeze it.
export function setShadowQuality(renderer,scene,sun,resolution){
 const enabled=resolution>0;
 sun.castShadow=enabled;
 renderer.shadowMap.enabled=enabled;
 renderer.shadowMap.autoUpdate=true;
 renderer.shadowMap.needsUpdate=true;
 if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}
 if(sun.shadow.mapPass){sun.shadow.mapPass.dispose();sun.shadow.mapPass=null;}
 if(enabled){sun.shadow.mapSize.set(resolution,resolution);sun.shadow.needsUpdate=true;}
 const materials=new Set();
 scene.traverse(object=>{
  if(!object.material)return;
  for(const material of (Array.isArray(object.material)?object.material:[object.material]))materials.add(material);
 });
 for(const material of materials)material.needsUpdate=true;
}
