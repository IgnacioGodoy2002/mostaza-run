import * as T from './three.module.js';

// Direction-based clouds remain at infinity while the street scrolls underneath.
export function makeSky(){
 const material=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{time:{value:0}},
 vertexShader:`varying vec3 direction; void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`varying vec3 direction; uniform float time;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 float fbm(vec2 p){float n=0.,a=.55;for(int i=0;i<5;i++){n+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p+7.1;a*=.48;}return n;}
 void main(){vec3 d=normalize(direction);float h=max(d.y,0.);vec3 col=mix(vec3(.76,.85,.84),vec3(.055,.38,.67),pow(h,.40));
 vec3 sun=normalize(vec3(-.5,.65,.20));float glow=pow(max(0.,dot(d,sun)),14.);col+=vec3(.24,.18,.075)*glow;
 vec2 uv=d.xz/(max(d.y,.04)+.22)*2.3+vec2(time*.002,0.);
 float n=fbm(uv),detail=fbm(uv*2.8+12.);float density=smoothstep(.48,.66,n+detail*.16);
 float edges=smoothstep(.025,.13,h);float light=clamp(.5+(fbm(uv+vec2(-.12,.08))-n)*4.,0.,1.);
 vec3 cloud=mix(vec3(.53,.65,.71),vec3(1.,.96,.81),light);cloud=mix(cloud,vec3(1.,.97,.86),smoothstep(.40,.55,n)*.28);
 col=mix(col,cloud,density*edges);gl_FragColor=vec4(col,1.);}`});
 const sky=new T.Mesh(new T.SphereGeometry(235,24,16),material);sky.renderOrder=-10;return sky;
}

// Uniform dark-gray asphalt: no screen-aliased procedural grain.
export function streetMaterial(){return new T.MeshStandardMaterial({color:'#4c5553',roughness:1,metalness:0});}
