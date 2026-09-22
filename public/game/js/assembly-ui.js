// Animate the collected food into the tube, then into the assembled burger.
export class AssemblyUI{
 constructor(icons){this.icons=icons;this.panel=document.getElementById('assembly');this.image=document.getElementById('assemblyImage');this.counter=document.getElementById('assemblyCount');this.flights=new Set();this.generation=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches}
 reset(variant,total){this.generation++;for(const f of this.flights){f.animation.cancel();f.element.remove()}this.flights.clear();this.variant=variant;this.total=total;this.showCount(0)}
 showCount(n){this.image.src=this.icons['stack'+this.variant+'_'+n];this.image.alt=n?'Hamburguesa con '+n+' ingredientes':'Hamburguesa por armar';this.counter.textContent=n+' / '+this.total;this.panel.classList.toggle('complete',n===this.total)}
 collect(type,n,origin){
  const generation=this.generation;
  const finish=()=>{if(generation!==this.generation)return;this.showCount(n);if(!this.reduced)this.image.animate?.([{transform:'scale(.86)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:330})};
  if(this.reduced||!Element.prototype.animate){finish();return}
  const slot=document.querySelector('[data-stage="'+(n-1)+'"] img').getBoundingClientRect(),end=this.image.getBoundingClientRect();
  const element=document.createElement('img');element.className='ingredient-flight';element.alt='';element.src=this.icons[type];document.body.append(element);
  const at=(x,y,s)=>'translate('+(x-32)+'px,'+(y-32)+'px) scale('+s+')';
  const animation=element.animate([
   {transform:at(origin.x,origin.y,1.2),opacity:1},
   {transform:at(slot.x+slot.width/2,slot.y+slot.height/2,1),offset:.55,opacity:1},
   {transform:at(slot.x+slot.width/2,slot.y+slot.height/2,.82),offset:.67,opacity:1},
   {transform:at(end.x+end.width/2,end.y+end.height/2,.45),opacity:0}
  ],{duration:820,easing:'ease-in-out',fill:'forwards'});
  const flight={element,animation};this.flights.add(flight);
  animation.finished.then(()=>{this.flights.delete(flight);element.remove();finish()}).catch(()=>{this.flights.delete(flight);element.remove()});
 }
 pause(){for(const f of this.flights)f.animation.pause()}
 resume(){for(const f of this.flights)f.animation.play()}
}
