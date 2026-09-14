import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = '<div class="topbar"><strong>REAL SOLAR SYSTEM</strong><small>NASA/JPL DATA • KEPLERIAN ORRERY</small></div><aside class="panel"><h3>Solar System</h3><div id="planetList"></div><label>Simulation speed <span id="speedValue">100 days/s</span><input id="speed" type="range" min="1" max="5000" value="100"></label><button id="pause">Pause</button><button id="reset">Reset view</button></aside><section id="info" class="info"><button id="closeInfo">×</button><h2 id="infoName"></h2><div id="infoBody"></div></section><div id="loading">Loading planetary maps…</div>';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x01030a);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.01, 5000);
camera.position.set(0, 48, 78);
const renderer = new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05; app.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.minDistance=2; controls.maxDistance=600;
scene.add(new THREE.AmbientLight(0x202838,.22)); scene.add(new THREE.PointLight(0xffffff,250,0,2));

const starGeo=new THREE.BufferGeometry(), starPos=new Float32Array(7000*3);
for(let i=0;i<starPos.length;i+=3){const r=900+Math.random()*1800,a=Math.random()*Math.PI*2,z=Math.random()*2-1,s=Math.sqrt(1-z*z);starPos[i]=r*s*Math.cos(a);starPos[i+1]=r*z;starPos[i+2]=r*s*Math.sin(a)}
starGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:1.1})));

const P=[
['Mercury',.387,.2056,7.005,.2408467,2439.4,0x9b9b91,0],['Venus',.723,.0068,3.3947,.61519726,6051.8,0xd9b38c,0],['Earth',1,.0167,0,1,6371,0x3b79c9,1],['Mars',1.524,.0934,1.85,1.8808,3390,0xb85f39,2],['Jupiter',5.2038,.0489,1.303,11.862,69911,0xcaa77b,95],['Saturn',9.537,.0565,2.485,29.457,58232,0xd6b56b,83],['Uranus',19.191,.0472,.773,84.017,25362,0x6cc7d7,28],['Neptune',30.069,.0086,1.77,164.79,24622,0x4778c9,16]
];
const EARTH_R=6371, AU=a=>3+Math.log1p(a)*7.2, BR=r=>.13*Math.pow(r/EARTH_R,.55), orbitObjects=[],clickable=[];
function lineOrbit(a,e,inc){const pts=[];for(let i=0;i<=160;i++){const t=i/160*Math.PI*2,r=AU(a)*(1-e*e)/(1+e*Math.cos(t));pts.push(new THREE.Vector3(r*Math.cos(t),0,r*Math.sin(t)))}const g=new THREE.BufferGeometry().setFromPoints(pts),l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0x364154,transparent:true,opacity:.45}));l.rotation.x=THREE.MathUtils.degToRad(inc);scene.add(l)}
function addPlanet(d,i){const [name,a,e,inc,period,radius,color,moons]=d;lineOrbit(a,e,inc);const pivot=new THREE.Object3D();pivot.rotation.x=THREE.MathUtils.degToRad(inc);pivot.rotation.y=i*1.37;scene.add(pivot);const mat=new THREE.MeshStandardMaterial({color,roughness:.82}),mesh=new THREE.Mesh(new THREE.SphereGeometry(BR(radius),40,24),mat);mesh.name=name;mesh.userData.planet={name,a,e,inc,period,radius,moons};mesh.position.x=AU(a)*(1-e);pivot.add(mesh);clickable.push(mesh);if(name==='Saturn'){const rg=new THREE.RingGeometry(BR(radius)*1.35,BR(radius)*2.25,96),rm=new THREE.MeshBasicMaterial({color:0xd9c49a,side:THREE.DoubleSide,transparent:true,opacity:.78});const ring=new THREE.Mesh(rg,rm);ring.rotation.x=Math.PI/2.15;mesh.add(ring)}if(name==='Earth'){const mp=new THREE.Object3D();mesh.add(mp);const moon=new THREE.Mesh(new THREE.SphereGeometry(.035,24,16),new THREE.MeshStandardMaterial({color:0x999999,roughness:1}));moon.position.x=.42;mp.add(moon);orbitObjects.push({pivot:mp,periodDays:27.3217})}orbitObjects.push({pivot,periodDays:period*365.256,mesh,planet:{name,a,e,inc,period,radius,moons}})}
const sun=new THREE.Mesh(new THREE.SphereGeometry(1.75,64,40),new THREE.MeshBasicMaterial({color:0xffd36a}));sun.userData.planet={name:'Sun',radius:696340,mass:332946,moons:0};scene.add(sun);const glow=new THREE.Mesh(new THREE.SphereGeometry(2.05,48,32),new THREE.MeshBasicMaterial({color:0xff9a35,transparent:true,opacity:.16,side:THREE.BackSide}));scene.add(glow);clickable.push(sun);P.forEach(addPlanet);

const beltGeo=new THREE.BufferGeometry(),bp=new Float32Array(1600*3);for(let i=0;i<1600;i++){const a=Math.random()*Math.PI*2,r=AU(2.2+Math.random()),j=i*3;bp[j]=r*Math.cos(a);bp[j+1]=(Math.random()-.5)*.25;bp[j+2]=r*Math.sin(a)}beltGeo.setAttribute('position',new THREE.BufferAttribute(bp,3));scene.add(new THREE.Points(beltGeo,new THREE.PointsMaterial({color:0x8a755d,size:.025})));

const list=document.querySelector('#planetList');[['Sun'],...P].forEach(d=>{const b=document.createElement('button');b.textContent=d[0];b.onclick=()=>focus(d[0]);list.appendChild(b)});
let speed=100,paused=false;document.querySelector('#speed').oninput=e=>{speed=+e.target.value;document.querySelector('#speedValue').textContent=`${speed} days/s`};document.querySelector('#pause').onclick=e=>{paused=!paused;e.target.textContent=paused?'Resume':'Pause'};document.querySelector('#reset').onclick=()=>{camera.position.set(0,48,78);controls.target.set(0,0,0)};document.querySelector('#closeInfo').onclick=()=>document.querySelector('#info').classList.remove('show');
function info(p){document.querySelector('#infoName').textContent=p.name;document.querySelector('#infoBody').innerHTML=`<div><b>Radius</b><span>${p.radius?.toLocaleString()||'—'} km</span></div><div><b>Mean distance</b><span>${p.a?p.a+' AU':'Center star'}</span></div>${p.period?`<div><b>Orbital period</b><span>${(p.period*365.256).toFixed(2)} days</span></div><div><b>Eccentricity</b><span>${p.e}</span></div><div><b>Inclination</b><span>${p.inc}°</span></div>`:''}<div><b>Known moons</b><span>${p.moons??'—'}</span></div>`;document.querySelector('#info').classList.add('show')}
function focus(name){const o=clickable.find(x=>x.userData.planet?.name===name);if(!o)return;info(o.userData.planet);const w=new THREE.Vector3();o.getWorldPosition(w);controls.target.copy(w);camera.position.copy(w.clone().add(new THREE.Vector3(3,2.2,5)))}
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();renderer.domElement.onclick=e=>{mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;ray.setFromCamera(mouse,camera);const h=ray.intersectObjects(clickable,false)[0];if(h)info(h.object.userData.planet)};
let t=0,last=performance.now();function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;if(!paused){t+=dt*speed;orbitObjects.forEach(o=>{o.pivot.rotation.y=t/o.periodDays*Math.PI*2;if(o.mesh)o.mesh.rotation.y+=dt*.35})}sun.rotation.y+=dt*.05;glow.rotation.y-=dt*.02;controls.update();renderer.render(scene,camera);document.querySelector('#loading').classList.add('hidden')}requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
