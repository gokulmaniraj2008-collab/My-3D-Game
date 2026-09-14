import * as THREE from 'three';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="hud">
    <div class="brand"><span class="dot"></span><div><strong>NEON ROOM</strong><small>3D GAME PROTOTYPE</small></div></div>
    <div class="stats"><span>WASD / ARROWS</span><span>DRAG TO LOOK</span><span>SHIFT SPRINT</span></div>
  </div>
  <div class="crosshair">+</div>
  <div class="hint"><b>Explore the room</b><br>Walk around and discover the glowing core.</div>
`;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050914);
scene.fog = new THREE.Fog(0x050914, 18, 42);

const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.05, 100);
camera.position.set(0, 1.65, 7.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
app.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0x9ab7ff, 0x090d18, 1.4);
scene.add(hemi);
const key = new THREE.PointLight(0x5c8dff, 22, 20, 2);
key.position.set(0, 4.5, 1);
key.castShadow = true;
scene.add(key);
const coreLight = new THREE.PointLight(0x26f6d2, 16, 10, 2);
coreLight.position.set(0, 2.4, -3.1);
scene.add(coreLight);

const mat = (color, rough = .55, metal = .1, emissive = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, emissive, emissiveIntensity: emissive ? 2.4 : 0 });
const floorMat = mat(0x121a2a, .72, .18);
const wallMat = mat(0x172235, .58, .22);
const trimMat = mat(0x263b5d, .35, .7);
const cyanMat = mat(0x25e8d1, .25, .5, 0x16b8a7);
const blueMat = mat(0x4f83ff, .22, .65, 0x315bff);

function box(name, size, pos, material, cast = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  m.name = name; m.position.set(...pos); m.castShadow = cast; m.receiveShadow = true; scene.add(m); return m;
}

box('Floor', [18, .3, 18], [0, -.15, -1], floorMat, false);
box('BackWall', [18, 6, .3], [0, 3, -9], wallMat, false);
box('LeftWall', [.3, 6, 18], [-9, 3, -1], wallMat, false);
box('RightWall', [.3, 6, 18], [9, 3, -1], wallMat, false);
box('CeilingBeam', [18, .25, .35], [0, 5.9, -8.8], trimMat, false);

for (let z = -8; z <= 6; z += 2) {
  box('FloorTrim', [16, .035, .045], [0, .025, z], trimMat, false);
}
for (let x = -8; x <= 8; x += 2) {
  box('FloorTrim', [.045, .035, 16], [x, .026, -1], trimMat, false);
}

// Hero energy core
const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 2), cyanMat);
core.name = 'HeroEnergyCore'; core.position.set(0, 2.35, -3.15); core.castShadow = true; scene.add(core);
const ring = new THREE.Mesh(new THREE.TorusGeometry(1.55, .055, 12, 64), blueMat);
ring.rotation.x = Math.PI / 2; ring.position.copy(core.position); scene.add(ring);
const ring2 = ring.clone(); ring2.scale.set(.78,.78,.78); ring2.rotation.x = .35; ring2.rotation.y = .7; scene.add(ring2);

// Side consoles / props
for (const x of [-5.5, 5.5]) {
  box('Console', [2.6, .18, 1.2], [x, 1.2, -4.2], trimMat);
  box('ConsoleBody', [2.35, 1.2, .95], [x, .58, -4.2], wallMat);
  box('Screen', [1.65, .9, .06], [x, 1.75, -4.62], blueMat);
  for (let i=0;i<4;i++) box('Control', [.22,.08,.18], [x-.75+i*.5, 1.33, -4.62], cyanMat);
}

// Pillars and ceiling lights
for (const x of [-7, 7]) {
  box('Pillar', [.5, 5.2, .5], [x, 2.6, -6.5], trimMat);
  box('PillarGlow', [.08, 4.5, .08], [x + (x < 0 ? .27 : -.27), 2.6, -6.5], cyanMat);
}
for (const x of [-4, 0, 4]) {
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(2.4,.08,.08), cyanMat);
  lamp.position.set(x,5.55,-1.5); scene.add(lamp);
}

const keys = {};
addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if (e.key === 'Shift') keys.shift = true; });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; if (e.key === 'Shift') keys.shift = false; });
let yaw = 0, pitch = 0, dragging = false, lastX = 0, lastY = 0;
renderer.domElement.addEventListener('pointerdown', e => { dragging = true; lastX=e.clientX; lastY=e.clientY; renderer.domElement.setPointerCapture(e.pointerId); });
renderer.domElement.addEventListener('pointerup', () => dragging=false);
renderer.domElement.addEventListener('pointermove', e => {
  if (!dragging) return;
  yaw -= (e.clientX-lastX)*.004; pitch -= (e.clientY-lastY)*.003;
  pitch = Math.max(-1.25, Math.min(1.25, pitch)); lastX=e.clientX; lastY=e.clientY;
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .05);
  const speed = (keys.shift ? 5.2 : 2.9) * dt;
  const forward = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0);
  const strafe = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
  const dir = new THREE.Vector3(strafe, 0, forward).normalize().multiplyScalar(speed);
  const sin=Math.sin(yaw), cos=Math.cos(yaw);
  camera.position.x += dir.x*cos + dir.z*sin;
  camera.position.z += -dir.x*sin + dir.z*cos;
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -7.8, 7.8);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -7.8, 7.2);
  camera.position.y = 1.65;
  camera.rotation.set(pitch, yaw, 0, 'YXZ');
  core.rotation.y += dt*.55; core.rotation.x += dt*.2;
  ring.rotation.z += dt*.7; ring2.rotation.z -= dt*.9;
  coreLight.intensity = 13 + Math.sin(performance.now()*.003)*3;
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => { camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); });
