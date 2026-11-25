import {facadeMaterial,buildingGeometry,project,streets} from './neighborhood.js';
import * as T from './node_modules/three/build/three.module.js';
import {timber,fabric,soft,turned,drape,curtain,rugMaterial,rainOnGlass} from './atelier.js?v=2';

const el = id => document.getElementById(id);
const viewport = el('viewport');
const renderer = new T.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
renderer.toneMapping = T.ACESFilmicToneMapping;
viewport.append(renderer.domElement);
const scene = new T.Scene(), interior = new T.Group(), outdoor = new T.Group();
scene.add(interior, outdoor);
const eye = new T.PerspectiveCamera(65,1,.035,360);
const plan = new T.OrthographicCamera(-4,4,4,-4,.1,60);
eye.position.set(1.94,1.58,2.85);
eye.rotation.order='YXZ';
eye.rotation.set(-.12,.57,0);
plan.position.set(0,12,0); plan.up.set(0,0,-1); plan.lookAt(0,0,0);
const material = color => new T.MeshStandardMaterial({color,roughness:.79});
const cream=material('#f2ecdb'), wood=material('#956a47'), dark=material('#413c31'), linen=material('#ede4cf'), sage=material('#768c79'), brass=material('#ba9662'), tile=material('#c9d3c6');
wood.map=timber;brass.metalness=.38;brass.roughness=.3;
const ivory=fabric('#fcf5e8'),fern=fabric('#64766b'), rust=fabric('#b26147'), velvet=fabric('#cfab79');
const curtainCloth=fabric('#efe4cd'), ceramic=material('#62746c');
const cube=new T.BoxGeometry();
function box(parent,x,y,z,w,h,d,mat){
  const m=new T.Mesh(cube,mat); m.scale.set(w,h,d); m.position.set(x,y,z);
  m.receiveShadow=true; m.castShadow=true; parent.add(m); return m;
}
function group(parent,x,y,z,angle=0){
  const g=new T.Group(); g.position.set(x,y,z); g.rotation.y=angle; parent.add(g); return g;
}
const blockers=[], hinges=[], openings=[];
const drops=rainOnGlass();
const glass=new T.MeshStandardMaterial({color:'#d1ecf3',transparent:true,opacity:.17,depthWrite:false,roughness:.19,bumpMap:drops,bumpScale:0});
const half=Math.PI/2;
function wall(x,z,length,angle=0,base=0,height=2.76){
  const g=group(interior,x,0,z,angle);
  const w=box(g,0,base+height/2,0,length,height,.14,cream);
  if(base===0){blockers.push(w);box(g,0,.053,0,length,.105,.163,wood)}
}
function opening(kind,x,z,length,angle=0,sign=1){
  const win=kind==='Window', bottom=win?.84:0, top=win?2.25:2.18;
  if(win)wall(x,z,length,angle,0,bottom);
  wall(x,z,length,angle,top,2.76-top);
  const g=group(interior,x,0,z,angle), pivot=group(g,-length/2,bottom,0);
  const leaf=group(pivot,length/2,0,0), h=top-bottom;
  const pane=win?glass:wood;
  box(leaf,0,h/2,0,length-.02,h,.045,pane).castShadow=!win;
  for(const dx of [-1,1])box(leaf,dx*(length/2-.028),h/2,0,.055,h,.066,dark);
  for(const dy of [.03,h-.03])box(leaf,0,dy,0,length,.06,.066,dark);
  if(win)box(leaf,0,h/2,0,.04,h,.06,dark);
  box(leaf,length/2-.12,win?.63:.98,.05,.105,.036,.075,brass);
  const hinge={kind,pivot,leaf,open:false,sign};hinges.push(hinge); leaf.userData.hinge=hinge;openings.push(leaf);
}
// Plan coordinates follow the reference image, with north at its top.
wall(0,-3.5,5.4); wall(-1.95,3.5,1.5); opening('Window',0,3.5,2.4);wall(1.95,3.5,1.5);
for(const side of [-1,1]){
  const x=side*2.7;wall(x,2.86,1.28,-half); opening('Window',x,1.25,1.94,-half,-side);
  if(side<0){wall(x,-1.61,3.78,-half)}else{
    wall(x,-.27,1.1,-half);opening('Entry door',x,-1.52,1.4,-half,1);wall(x,-2.86,1.28,-half);
  }
}
wall(-.65,-.85,4.1);wall(-2.06,-2.21,1.28);
wall(-1.43,-3.28,.44,-half);opening('WC door',-1.43,-2.68,.76,-half,1);
wall(-1.43,-2.03,.54,-half);opening('Shower door',-1.43,-1.39,.74,-half,1);wall(-1.43,-.935,.17,-half);
const ceiling=box(interior,0,2.8,0,5.55,.08,7.14,cream);
box(interior,0,-.06,0,5.52,.11,7.12,wood);
const boards=['#c6aa88','#ccaf8d','#cbb297','#bca289','#c8b096'].map(color=>new T.MeshStandardMaterial({color,map:timber,roughness:.67}));
for(let i=0;i<25;i++)for(let j=0;j<5;j++){
  const z0=Math.max(-3.5,-4.38+j*1.8+(i%2)*.76), z1=Math.min(3.5,-2.58+j*1.8+(i%2)*.76);
  if(z1>z0){const plank=box(interior,-2.59+i*.216,-.007,(z0+z1)/2,.214,.012,z1-z0-.006,boards[(i*7+j*3)%5]);plank.castShadow=false}
}
box(interior,0,.003,-2.18,5.39,.012,2.62,tile);
function oval(parent,x,y,z,w,h,d,mat){
  const m=new T.Mesh(new T.SphereGeometry(1,20,12),mat);m.position.set(x,y,z);m.scale.set(w/2,h/2,d/2);m.castShadow=true;parent.add(m);return m;
}
function fixture(x,z,w,h,d,mat){const m=box(interior,x,h/2,z,w,h,d,mat);blockers.push(m);return m}
fixture(-.12,-3.21,1.5,.81,.50,wood);box(interior,-.12,.85,-3.21,1.56,.08,.56,cream);
for(const x of [-.52,.28]){oval(interior,x,.90,-3.2,.48,.09,.34,linen);box(interior,x,1,-3.38,.04,.20,.06,brass)}
box(interior,-.12,1.63,-3.405,1.54,.74,.028,material('#a2b6b1'));
fixture(-2.08,-3.20,.40,.72,.20,linen);oval(interior,-2.08,.33,-2.97,.45,.44,.62,cream);
box(interior,-2.1,.04,-1.52,.99,.07,1.08,linen);box(interior,-2.60,1.36,-1.43,.035,1.32,.035,brass);box(interior,-2.49,2.02,-1.43,.25,.05,.16,brass);
const furniture=[];
function buildPiece(p){
  p.g.clear();const g=p.g, alt=p.alt;
  if(p.name==='Bed'){
    const w=alt?1.18:1.80;
    soft(g,0,.16,0,w-.16,.26,1.91,.045,dark);
    soft(g,0,.30,0,w,.22,2.07,.08,fern);
    soft(g,0,.47,0,w-.03,.25,2.02,.09,ivory);
    soft(g,0,.58,-1,w+.08,1.06,.1,.048,fern);
    const channels=alt?6:9;
    for(let i=0;i<channels;i++)soft(g,(i+.5-channels/2)*w/channels,.72,-.956,w/channels-.006,.74,.085,.042,fern);
    for(const s of alt?[0]:[-.43,.43]){
      const pillow=soft(g,s,.69,-.68,alt?.77:.78,.20,.43,.096,ivory);
      pillow.rotation.set(.23,s*.12,-s*.06);
    }
    const accent=soft(g,0,.76,-.46,alt?.51:.77,.23,.17,.08,velvet);accent.rotation.x=-.15;
    drape(g,w,-.43,1.05,.625,ivory);drape(g,w+.028,.35,.87,.681,alt?fern:rust);
  }else if(p.name==='Chair'){
    const w=alt?.94:.66;soft(g,0,.46,0,w,.18,.63,.085,alt?velvet:fern);soft(g,0,.76,.27,w,.53,.13,.063,alt?velvet:fern).rotation.x=.10;
    for(const s of [-1,1])soft(g,s*(w/2-.045),.58,0,.10,.17,.58,.048,wood);
    for(const x of [-1,1])for(const z of [-1,1])box(g,x*(w/2-.055),.20,z*.24,.06,.4,.06,wood);
  }else{
    const w=alt?1.02:1.44;box(g,0,.64,0,w,.11,.36,wood);for(const s of [-1,1])box(g,s*(w/2-.08),.31,0,.08,.62,.30,dark);
    if(alt)box(g,0,.32,0,w,.06,.32,wood);else{
      for(let i=0;i<3;i++)box(g,-.28,.715+i*.036,0,.36-i*.02,.032,.23,[fern,ivory,rust][i]).rotation.y=i*.07;
      turned(g,.36,.70,0,[[.065,0],[.11,.06],[.105,.16],[.052,.22],[.046,.28],[.036,.28]],ceramic);
    }
  }
}
function piece(name,x,z,angle){const p={name,g:group(interior,x,0,z,angle),alt:false}; furniture.push(p);buildPiece(p)}
piece('Bed',-.51,.29,0);piece('Chair',-1.89,2.76,-.64);piece('Console',.12,3.21,0);
const shade=material('#f6dfba');shade.side=T.DoubleSide;
for(const x of [-1.95,.93]){
  fixture(x,-.43,.52,.39,.42,wood);
  soft(interior,x,.407,-.43,.57,.048,.46,.022,wood);
  box(interior,x,.25,-.212,.48,.012,.01,dark);box(interior,x,.31,-.207,.095,.015,.016,brass);
  turned(interior,x,.43,-.43,[[.06,0],[.096,.03],[.10,.12],[.069,.19],[.032,.21],[.030,.25]],ceramic);
  turned(interior,x,.675,-.43,[[.153,0],[.152,.012],[.11,.19],[.106,.194]],shade);
}
box(interior,-.49,.016,1.1,2.65,.013,2.58,rugMaterial());
// A print floated in a walnut frame above the upholstered bed.
box(interior,-.51,1.85,-.752,1.93,.91,.046,wood);
box(interior,-.51,1.85,-.724,1.89,.87,.009,linen);
const printMap=new T.TextureLoader().load('assets/caspian-print.png');printMap.colorSpace=T.SRGBColorSpace;printMap.anisotropy=8;
const print=new T.Mesh(new T.PlaneGeometry(1.76,.704),new T.MeshStandardMaterial({map:printMap,roughness:1}));
print.position.set(-.51,1.85,-.717);interior.add(print);
for(const side of [-1,1]){
  for(const end of [-1,1])curtain(interior,side*2.53,1.25,-half,end,curtainCloth);
}
for(const end of [-1,1])curtain(interior,end*.24,3.33,0,end,curtainCloth);
const sky=new T.HemisphereLight(0xfff5df,0xa09987,1.7); scene.add(sky);
const sun=new T.DirectionalLight(0xffe3bf,3);sun.position.set(-8,3.6,3);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.normalBias=.009;scene.add(sun);
const windowBounce=new T.PointLight(0xfff0da,14,9);windowBounce.position.set(-2.23,1.92,1.34);scene.add(windowBounce);
const lamp=new T.PointLight(0xffcf92,0,12);lamp.position.set(.25,2.36,.55);interior.add(lamp);
const bulb=turned(interior,.25,2.48,.55,[[.03,0],[.19,.025],[.28,.09],[.30,.14],[.26,.19],[.16,.235],[.04,.25]],shade.clone());
for(let i=1;i<9;i++){const t=i/10;const radius=.29*Math.sin(Math.PI*t)**.66;turned(interior,.25,2.48+t*.25,.55,[[radius,0],[radius+.001,.003]],wood)}
const colors=['#b0cfdc','#b3bbbc','#849399','#263349'];
function atmosphere(){
  const i=el('weather').selectedIndex;
  windowBounce.intensity=[14,8,6,.4][i];
  glass.bumpScale=i===2?.025:0;glass.opacity=i===2?.4:.17;
  scene.background=new T.Color(colors[i]);scene.fog=new T.FogExp2(colors[i],[.005,.013,.022,.012][i]);sun.intensity=[3,.75,.38,.07][i];sky.intensity=[1.7,1.4,1,.27][i];rain.visible=i===2;
}
const points=[];
for(let i=0;i<2400;i++){const x=Math.random()*60-30,z=Math.random()*60-30;if(Math.abs(x)>2.85||Math.abs(z)>3.62)points.push(x,Math.random()*18-5,z)}
const rainGeo=new T.BufferGeometry(); rainGeo.setAttribute('position',new T.Float32BufferAttribute(points,3));
const rain=new T.Points(rainGeo,new T.PointsMaterial({color:0xbddeea,size:.035}));outdoor.add(rain);
const ground=box(outdoor,0,-5.15,0,800,.3,800,material('#a89f8a'));
async function city(){
  const data=await (await fetch('buildings.json')).json();
  const palettes=[['#b9aa94','#dcc8a9'],['#cbbb9e','#ece1c9'],['#b5aaa0','#d5ccc1']];
  const facades=palettes.map(pair=>facadeMaterial(...pair)),roof=material('#b5aa96');
  for(const b of data){
    if(b.id===273101276)continue;
    const poly=b.points.map(project),height=b.height||8+(b.id%4)*3;
    const mesh=new T.Mesh(buildingGeometry(poly,height),[roof,facades[b.id%3]]);
    mesh.rotation.x=-half;mesh.position.y=-5;outdoor.add(mesh);
  }
  await streets(outdoor);
}
city().catch(()=>{el('status').textContent='The neighborhood map could not load.'});

const bounds=o=>{o.updateWorldMatrix(true,false);return new T.Box3().setFromObject(o)};
const fixed=blockers.map(bounds);
function footprint(p){const b=bounds(p.g);b.min.y=0;b.max.y=2;return b}
function clearLayout(p){
  const b=footprint(p);
  return b.min.x>-2.63&&b.max.x<2.63&&b.min.z>-3.43&&b.max.z<3.43&&
    !fixed.some(o=>o.intersectsBox(b))&&!furniture.some(q=>q!==p&&footprint(q).intersectsBox(b))&&
    !hinges.some(h=>h.kind!=='Window'&&bounds(h.leaf).intersectsBox(b));
}
function canWalk(x,z){
  if(Math.abs(x)>2.48||Math.abs(z)>3.27)return false;
  const p=new T.Box3(new T.Vector3(x-.14,.12,z-.14),new T.Vector3(x+.14,1.56,z+.14));
  return !fixed.some(o=>o.intersectsBox(p))&&!furniture.some(q=>footprint(q).intersectsBox(p))&&
    !hinges.some(h=>h.kind!=='Window'&&bounds(h.leaf).intersectsBox(p));
}
let editing=false, selected=furniture[0], selection=null;
function mark(){
  if(selection){scene.remove(selection);selection.geometry.dispose();selection.material.dispose();selection=null}
  if(editing){selection=new T.BoxHelper(selected.g,0x335c50);scene.add(selection)}
}
function mode(edit){
  if(edit && document.pointerLockElement===renderer.domElement)document.exitPointerLock();
  hoverLook=false;
  editing=edit;ceiling.visible=!edit;outdoor.visible=!edit;
  el('edit').setAttribute('aria-pressed',String(edit));el('walk').setAttribute('aria-pressed',String(!edit));
  el('design').hidden=!edit;el('pad').hidden=edit;el('pad').style.display=edit?'none':'flex';
  el('label').textContent=edit?'Floor plan · north up':'First person · bedroom suite';
  el('help').textContent=edit?'Select a piece, then drag, rotate or swap it. Return to Walk inside to explore your layout.':'Click once to explore. Move your mouse to look, use WASD to walk, and click to open doors or windows. Esc releases the mouse. On touch, drag to look.';
  if(!edit&&!canWalk(eye.position.x,eye.position.z)){
    outer:for(let z=2.9;z>-3.2;z-=.4)for(let x=2.2;x>-2.5;x-=.4)if(canWalk(x,z)){eye.position.set(x,1.58,z);break outer}
  }
  mark();
}
function changePiece(change,undo){
  change();
  if(!clearLayout(selected)){undo();el('status').textContent='That placement needs more room.'}
  else el('status').textContent=selected.name+' updated.';
  mark();
}
el('walk').onclick=()=>mode(false);el('edit').onclick=()=>mode(true);
el('item').onchange=()=>{selected=furniture[el('item').selectedIndex];mark()};
el('rotate').onclick=()=>changePiece(()=>selected.g.rotation.y+=half,()=>selected.g.rotation.y-=half);
function swap(){selected.alt=!selected.alt;buildPiece(selected)}
el('swap').onclick=()=>changePiece(swap,swap);
el('lights').onclick=()=>{
  const on=lamp.intensity===0;lamp.intensity=on?29:0;bulb.material.emissive.setHex(on?0xffc083:0);
  el('lights').textContent='Room lights · '+(on?'on':'off');el('lights').setAttribute('aria-pressed',String(on));
};
el('weather').onchange=atmosphere;
const keys=new Set();
const moves=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'];
window.addEventListener('keydown',e=>{if(!editing&&moves.includes(e.code)&&e.target.tagName!=='SELECT'){e.preventDefault();keys.add(e.code)}});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
for(const b of document.querySelectorAll('[data-key]')){
  b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);keys.add(b.dataset.key)};
  b.onlostpointercapture=()=>keys.delete(b.dataset.key);
}
const ray=new T.Raycaster(), floorPlane=new T.Plane(new T.Vector3(0,1,0),0), screen=new T.Vector2();
const canvas=renderer.domElement;
function aim(e){const r=canvas.getBoundingClientRect();screen.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(screen,editing?plan:eye)}
function floorPoint(){return ray.ray.intersectPlane(floorPlane,new T.Vector3())}
let drag=null,hoverLook=false;
function turn(dx,dy){
  eye.rotation.y-=dx*.003;eye.rotation.x=T.MathUtils.clamp(eye.rotation.x-dy*.003,-1.35,1.35);
}
function allowHoverLook(){if(!editing){hoverLook=true;el('status').textContent='Move the mouse inside the view to look. Esc releases it.'}}
document.addEventListener('pointerlockerror',allowHoverLook);
document.addEventListener('pointerlockchange',()=>{
  hoverLook=false;drag=null;keys.clear();viewport.classList.toggle('captured',document.pointerLockElement===canvas);
});
document.addEventListener('mousemove',e=>{if(!editing&&document.pointerLockElement===canvas)turn(e.movementX,e.movementY)});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){hoverLook=false;el('status').textContent=''}});
canvas.onpointerdown=e=>{
  if(e.button!==0)return;
  if(!editing&&e.pointerType==='mouse'){
    if(document.pointerLockElement===canvas){ray.setFromCamera(screen.set(0,0),eye);interact();return}
    if(hoverLook){aim(e);interact();return}
    try{if(canvas.requestPointerLock)canvas.requestPointerLock()?.catch(allowHoverLook);else allowHoverLook()}catch{allowHoverLook()}
    return;
  }
  aim(e);canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,dist:0};
  if(editing){
    const hit=ray.intersectObjects(furniture.map(p=>p.g),true)[0];
    if(hit){selected=furniture.find(p=>p.g===hit.object.parent);el('item').value=selected.name;drag.offset=selected.g.position.clone().sub(floorPoint());mark()}
  }
};
canvas.onpointermove=e=>{
  if(!editing&&hoverLook&&e.pointerType==='mouse'){turn(e.movementX,e.movementY);return}
  if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.dist+=Math.abs(dx)+Math.abs(dy);drag.x=e.clientX;drag.y=e.clientY;
  if(!editing){eye.rotation.y-=dx*.004;eye.rotation.x=T.MathUtils.clamp(eye.rotation.x-dy*.004,-1.35,1.35)}
  else if(drag.offset){
    aim(e);const prev=selected.g.position.clone();selected.g.position.copy(floorPoint().add(drag.offset));
    if(!clearLayout(selected))selected.g.position.copy(prev);selection.update();
  }
};
function interact(){
    const hit=ray.intersectObject(interior,true)[0];const h=hit?.object.parent?.userData.hinge;
    if(h&&hit.distance<2.8){h.open=!h.open;const before=h.pivot.rotation.y;h.pivot.rotation.y=h.open?h.sign*half:0;
      if(!canWalk(eye.position.x,eye.position.z)||furniture.some(p=>bounds(h.leaf).intersectsBox(footprint(p)))){
        h.pivot.rotation.y=before;h.open=!h.open;el('status').textContent='The swing is blocked.';
      }else el('status').textContent=h.kind+(h.open?' opened.':' closed.');
    }else if(h)el('status').textContent='Walk closer to use the '+h.kind.toLowerCase()+'.';
}
canvas.onpointerup=e=>{
  if(!editing&&drag&&drag.dist<6){aim(e);interact()}
  drag=null;
};
canvas.onlostpointercapture=()=>{drag=null};
new ResizeObserver(()=>{
  const w=viewport.clientWidth,h=viewport.clientHeight,ratio=w/h;renderer.setSize(w,h,false);eye.aspect=ratio;eye.updateProjectionMatrix();
  const span=Math.max(4,3.2/ratio);Object.assign(plan,{left:-span*ratio,right:span*ratio,top:span,bottom:-span});plan.updateProjectionMatrix();
}).observe(viewport);
atmosphere();mode(false);
let last=performance.now();
renderer.setAnimationLoop(now=>{
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(!editing){
    const down=(a,b)=>Number(keys.has(a)||keys.has(b));
    const forward=down('KeyW','ArrowUp')-down('KeyS','ArrowDown'),right=down('KeyD','ArrowRight')-down('KeyA','ArrowLeft');
    if(forward||right){
      const a=eye.rotation.y,s=dt*1.8/Math.hypot(forward,right);
      const x=eye.position.x+(right*Math.cos(a)-forward*Math.sin(a))*s,z=eye.position.z-(right*Math.sin(a)+forward*Math.cos(a))*s;
      if(canWalk(x,eye.position.z))eye.position.x=x;if(canWalk(eye.position.x,z))eye.position.z=z;
    }
    if(rain.visible){drops.offset.y=(drops.offset.y+dt*.018)%1;const pos=rainGeo.attributes.position;for(let i=0;i<pos.count;i++){const y=pos.getY(i)-dt*8;pos.setY(i,y< -5?13:y)}pos.needsUpdate=true}
  }
  renderer.render(scene,editing?plan:eye);
});
