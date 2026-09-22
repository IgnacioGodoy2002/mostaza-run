// Distance and simulation-time based: pausing never advances a hazard or the finale.
export const ZONE_LENGTH=240;
export const ZONES=[{id:'neighborhood',name:'Barrio arbolado'},{id:'plaza',name:'Plaza del encuentro'},{id:'restaurants',name:'Paseo Mostaza'}];
export function zoneAt(distance){return ZONES[Math.floor(Math.max(0,distance)/ZONE_LENGTH)%ZONES.length]}
export function smooth01(v){v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)}
// Obstacles move from spawn, even far ahead; phase is frozen while paused.
export function advanceHazard(o,dt){
 o.oldX=o.x;o.motionAge+=dt;
 const k=.5-.5*Math.cos(o.phase+o.motionAge*Math.PI*2/o.period);
 o.x=o.fromX+(o.toX-o.fromX)*k;return k;
}
export const ARRIVAL_DURATION=8.8;
export function arrivalPhase(t){return t<1.1?'assembled':t<4.6?'approach':t<6.6?'delivery':'celebrate'}
