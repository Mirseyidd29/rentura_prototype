import * as T from './node_modules/three/build/three.module.js';

// One facade bay and one storey per repeat. Geometry uses local metres.
export function facadeMaterial(stone,trim){
  const tile=document.createElement('canvas');tile.width=256;tile.height=256;
  const c=tile.getContext('2d');
  function rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h)}
  rect(0,0,256,256,stone);
  for(let y=0;y<256;y+=24){
    rect(0,y,256,1,'#0002');
    for(let x=(y%48?32:0);x<256;x+=64)rect(x,y,1,24,'#0002');
  }
  rect(0,4,256,6,trim);rect(0,10,256,4,'#0003');
  rect(49,40,158,161,trim);rect(55,48,146,146,'#403e37');
  const glass=c.createLinearGradient(0,50,68,192);
  glass.addColorStop(0,'#829a9f');glass.addColorStop(.56,'#64777a');glass.addColorStop(1,'#414a4b');
  rect(61,53,134,135,glass);
  for(const x of [64,174])rect(x,55,17,131,'#c7bba496');
  rect(126,50,5,142,trim);rect(57,94,140,4,trim);rect(43,194,169,8,trim);rect(48,202,160,6,'#0004');
  const texture=new T.CanvasTexture(tile);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=8;
  return new T.MeshStandardMaterial({map:texture,roughness:.76});
}
export function buildingGeometry(poly,height){
  const geometry=new T.ExtrudeGeometry(new T.Shape(poly),{depth:height,bevelEnabled:false});
  const pos=geometry.attributes.position,uv=geometry.attributes.uv;
  const sides=geometry.groups.find(g=>g.materialIndex===1);
  for(let i=sides.start;i<sides.start+sides.count;i+=6){
    const x=pos.getX(i),y=pos.getY(i);
    const length=Math.hypot(pos.getX(i+1)-x,pos.getY(i+1)-y);
    const bays=Math.max(1,Math.round(length/3.8)),floors=Math.max(1,Math.round(height/3.1));
    for(let j=i;j<i+6;j++)uv.setXY(j,Math.hypot(pos.getX(j)-x,pos.getY(j)-y)>.001?bays:0,pos.getZ(j)/height*floors);
  }
  return geometry;
}
export function project([lon,lat]){return new T.Vector2((lon-49.836080575)*84800,(lat-40.370587975)*111100)}
export async function streets(group){
  const roads=await (await fetch('assets/baku-streets.json')).json();
  const widths={primary:12,residential:6,service:3.8,pedestrian:4,steps:1.6,footway:1.6,cycleway:2.2};
  const positions=[],colors=[];
  for(const road of roads){
    const w=widths[road.kind];if(!w)continue;
    const path=road.points.map(project);
    const color=new T.Color(w<4.1?'#beb4a0':'#666764');
    for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i],dir=b.clone().sub(a).normalize(),n=new T.Vector2(-dir.y,dir.x).multiplyScalar(w/2);
      const left=a.clone().add(n),right=a.clone().sub(n),nextLeft=b.clone().add(n),nextRight=b.clone().sub(n);
      for(const p of [left,right,nextLeft,nextLeft,right,nextRight]){positions.push(p.x,-4.975,-p.y);colors.push(color.r,color.g,color.b)}
    }
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
  group.add(new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide})));
}
