import * as T from './node_modules/three/build/three.module.js';
import { RoundedBoxGeometry } from './node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Local, repeatable surface samples shared by all of the room meshes.
function sample(draw, width=512, height=512) {
  const canvas=document.createElement('canvas');
  canvas.width=width; canvas.height=height;
  draw(canvas.getContext('2d'),width,height);
  const map=new T.CanvasTexture(canvas);
  map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=8;
  return map;
}
let seed=211;
const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
export const timber=sample((c,w,h)=>{
  c.fillStyle='#d9b799';c.fillRect(0,0,w,h);
  for(let i=0;i<1500;i++){
    const x=random()*w,phase=random()*6,amp=random()*6;
    c.strokeStyle=random()<.5?'rgba(55,24,10,.16)':'rgba(254,232,204,.29)';
    c.lineWidth=.3+random()*1.6;c.beginPath();
    for(let y=0;y<=h;y+=8)c.lineTo(x+amp*Math.sin(phase+y/h*Math.PI*2),y);
    c.stroke();
  }
});
const weave=sample((c,w,h)=>{
  c.fillStyle='#f4eadd';c.fillRect(0,0,w,h);
  for(let i=0;i<w;i+=3){c.fillStyle='rgba(69,52,31,.14)';c.fillRect(i,0,1,h);c.fillRect(0,i,w,1)}
  for(let i=0;i<12000;i++){c.fillStyle='rgba(73,54,38,.08)';c.fillRect(random()*w,random()*h,2,1)}
},256,256);weave.repeat.set(4,3);
export function fabric(color){return new T.MeshStandardMaterial({color,map:weave,bumpMap:weave,bumpScale:.0018,roughness:.98,side:T.DoubleSide})}
export function rainOnGlass(){
  const drops=sample((c,w,h)=>{
    c.fillStyle='#555';c.fillRect(0,0,w,h);
    for(let i=0;i<850;i++){
      const x=random()*w,y=random()*h,r=.4+random()**3*3;
      const grad=c.createRadialGradient(x-r*.22,y-r*.3,0,x,y,r);
      grad.addColorStop(0,'#eee');grad.addColorStop(.65,'#888');grad.addColorStop(1,'#555');
      c.fillStyle=grad;c.fillRect(x-r,y-r,2*r,2*r);
      if(r>2.5){c.fillStyle='#777';c.fillRect(x,y-7*r,.8,7*r)}
    }
  });
  drops.colorSpace=T.NoColorSpace;return drops;
}
export function mesh(g,geo,mat,x,y,z){
  const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;
}
export function soft(g,x,y,z,w,h,d,r,mat){return mesh(g,new RoundedBoxGeometry(w,h,d,3,r),mat,x,y,z)}
export function turned(g,x,y,z,profile,mat){
  return mesh(g,new T.LatheGeometry(profile.map(([r,h])=>new T.Vector2(r,h)),48),mat,x,y,z);
}
function sheet(g,cols,rows,point,mat){
  const geo=new T.PlaneGeometry(1,1,cols,rows),pos=geo.attributes.position;
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)pos.setXYZ(j*(cols+1)+i,...point(i/cols,j/rows));
  geo.computeVertexNormals();return mesh(g,geo,mat,0,0,0);
}
export function drape(g,w,start,end,level,mat){
  sheet(g,80,50,(u,v)=>{
    const s=2*u-1,edge=Math.max(0,(Math.abs(s)-.84)/.16);
    const x=Math.sign(s)*(Math.min(Math.abs(s),.84)/.84*w/2+Math.sin(edge*Math.PI/2)*.048);
    const ripple=.011*Math.sin(17*u+5*v)+.009*Math.sin(28*v+10*u)+.006*Math.cos(54*u-11*v);
    const foot=Math.max(0,(v-.93)/.07);
    return [x,level+ripple-.17*(1-Math.cos(edge*Math.PI/2))-.058*foot*foot,start+(end-start)*v];
  },mat);
}
export function curtain(g,x,z,angle,side,mat){
  const part=new T.Group();part.position.set(x,0,z);part.rotation.y=angle;g.add(part);
  sheet(part,64,20,(u,v)=>[side*(.98-(.31+.12*v)*u),2.53-2.42*v+.012*Math.cos(30*u)*v,.047*Math.cos(u*Math.PI*10)+.012*Math.sin(8*v+14*u)],mat);
}
export function rugMaterial(){
  const map=sample((c,w,h)=>{
    c.fillStyle='#9d4a36';c.fillRect(0,0,w,h);
    const bands=['#312f2b','#c8a16c','#544f42','#dfc499','#783a30','#d0a57b'];
    bands.forEach((col,i)=>{c.strokeStyle=col;c.lineWidth=5;c.strokeRect(4+i*5,4+i*5,w-8-i*10,h-8-i*10)});
    function diamond(x,y,r,color){c.fillStyle=color;c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r,y);c.lineTo(x,y+r);c.lineTo(x-r,y);c.fill()}
    for(let row=0;row<7;row++)for(let col=0;col<5;col++){
      const x=71+col*92,y=67+row*86;
      diamond(x,y,29,'#ddba87');diamond(x,y,23,'#374b46');diamond(x,y,13,'#d0966b');diamond(x,y,6,'#703c31');
      if(col<4&&row<6){diamond(x+46,y+43,13,'#cba97b');diamond(x+46,y+43,8,'#694233')}
    }
    for(let y=0;y<h;y+=2){c.fillStyle='rgba(232,208,173,.13)';c.fillRect(0,y,w,1)}
  },512,654);
  return new T.MeshStandardMaterial({map,roughness:1});
}
