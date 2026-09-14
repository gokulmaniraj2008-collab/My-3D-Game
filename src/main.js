import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="topbar"><strong>REAL SOLAR SYSTEM</strong><small>REALISTIC 3D • NASA/JPL TEXTURES • KEPLERIAN MOTION</small></div>
  <aside class="panel"><h3>Solar System</h3><div id="planetList"></div><label>Simulation speed <span id="speedValue">100 days/s</span><input id="speed" type="range" min="1" max="5000" value="100"></label><button id="pause">Pause</button><button id="reset">Reset view</button></aside>
  <section id="info" class="info"><button id="closeInfo">×</button><h2 id="infoName"></h2><div id="infoBody"></div></section>
  <div id="loading">Loading real planetary maps…</div>
  <div class="hint">Drag: orbit • Wheel/pinch: zoom • Click: inspect</div>`;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010208);
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.01, 10000);
camera.position.set(0, 32, 62);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .055;
controls.minDistance = .15;
controls.maxDistance = 900;
controls.zoomToCursor = true;

scene.add(new THREE.AmbientLight(0x172033, .08));
const sunLight = new THREE.PointLight(0xffffff, 1800, 0, 2);
scene.add(sunLight);

// Deep-space star field.
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(9000 * 3);
for (let i = 0; i < starPos.length; i += 3) {
  const r = 1200 + Math.random() * 2600;
  const a = Math.random() * Math.PI * 2;
  const z = Math.random() * 2 - 1;
  const s = Math.sqrt(1 - z * z);
  starPos[i] = r * s * Math.cos(a);
  starPos[i + 1] = r * z;
  starPos[i + 2] = r * s * Math.sin(a);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.25, sizeAttenuation: true }))); 

const P = [
  ['Mercury', .387, .2056, 7.005, .2408467, 2439.4, 0x9b9b91, 0, 'https://space.jpl.nasa.gov/tmaps/pix/mer0muu2.jpg'],
  ['Venus', .723, .0068, 3.3947, .61519726, 6051.8, 0xd9b38c, 0, 'https://space.jpl.nasa.gov/tmaps/pix/ven0aaa2.jpg'],
  ['Earth', 1, .0167, 0, 1, 6371, 0x3b79c9, 1, 'https://space.jpl.nasa.gov/tmaps/pix/ear0xuu2.jpg'],
  ['Mars', 1.524, .0934, 1.85, 1.8808, 3390, 0xb85f39, 2, 'https://space.jpl.nasa.gov/tmaps/pix/mar0kuu2.jpg'],
  ['Jupiter', 5.2038, .0489, 1.303, 11.862, 69911, 0xcaa77b, 95, 'https://space.jpl.nasa.gov/tmaps/pix/jup0vss1.jpg'],
  ['Saturn', 9.537, .0565, 2.485, 29.457, 58232, 0xd6b56b, 83, 'https://space.jpl.nasa.gov/tmaps/pix/sat0fds1.jpg'],
  ['Uranus', 19.191, .0472, .773, 84.017, 25362, 0x6cc7d7, 28, 'https://space.jpl.nasa.gov/tmaps/pix/ura0fss1.jpg'],
  ['Neptune', 30.069, .0086, 1.77, 164.79, 24622, 0x4778c9, 16, 'https://space.jpl.nasa.gov/tmaps/pix/nep0fds1.jpg']
];

const EARTH_R = 6371;
const AU = a => 3 + Math.log1p(a) * 7.2;
const BR = r => .13 * Math.pow(r / EARTH_R, .55);
const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');
const orbitObjects = [];
const clickable = [];
const assets = new Map();

function loadTexture(url) {
  if (!url) return null;
  return loader.load(url, tex => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }, undefined, () => {});
}

function lineOrbit(a, e, inc) {
  const pts = [];
  for (let i = 0; i <= 220; i++) {
    const theta = i / 220 * Math.PI * 2;
    const r = AU(a) * (1 - e * e) / (1 + e * Math.cos(theta));
    pts.push(new THREE.Vector3(r * Math.cos(theta), 0, r * Math.sin(theta)));
  }
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x4b586d, transparent: true, opacity: .32 }));
  line.rotation.x = THREE.MathUtils.degToRad(inc);
  scene.add(line);
}

function createAtmosphere(radius, color, opacity) {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false });
  return new THREE.Mesh(new THREE.SphereGeometry(radius * 1.055, 48, 32), mat);
}

function addPlanet(d, i) {
  const [name, a, e, inc, period, radius, fallbackColor, moons, textureUrl] = d;
  lineOrbit(a, e, inc);
  const pivot = new THREE.Object3D();
  pivot.rotation.x = THREE.MathUtils.degToRad(inc);
  pivot.rotation.y = i * 1.37;
  scene.add(pivot);

  const texture = loadTexture(textureUrl);
  if (texture) assets.set(name, texture);
  const mat = new THREE.MeshStandardMaterial({
    map: texture || null,
    color: texture ? 0xffffff : fallbackColor,
    roughness: name === 'Venus' ? .95 : .82,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(BR(radius), 64, 40), mat);
  mesh.name = name;
  mesh.userData.planet = { name, a, e, inc, period, radius, moons };
  mesh.position.x = AU(a) * (1 - e);
  pivot.add(mesh);
  clickable.push(mesh);

  if (name === 'Earth') {
    const atmosphere = createAtmosphere(BR(radius), 0x4aa9ff, .11);
    mesh.add(atmosphere);
    const moonPivot = new THREE.Object3D();
    mesh.add(moonPivot);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(.035, 32, 20), new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 1 }));
    moon.position.x = .42;
    moonPivot.add(moon);
    orbitObjects.push({ pivot: moonPivot, periodDays: 27.3217 });
  }

  if (name === 'Venus') mesh.add(createAtmosphere(BR(radius), 0xffc77d, .14));
  if (name === 'Mars') mesh.add(createAtmosphere(BR(radius), 0xff6b3d, .025));
  if (name === 'Jupiter') mesh.add(createAtmosphere(BR(radius), 0xd8a16f, .025));
  if (name === 'Saturn') {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(BR(radius) * 1.35, BR(radius) * 2.55, 192),
      new THREE.MeshStandardMaterial({ color: 0xd7c29d, roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: .86 })
    );
    ring.rotation.x = Math.PI / 2.15;
    mesh.add(ring);
  }
  orbitObjects.push({ pivot, periodDays: period * 365.256, mesh, planet: mesh.userData.planet });
}

// Solar photosphere + layered glow for a more natural close-up.
const sun = new THREE.Mesh(new THREE.SphereGeometry(1.75, 96, 64), new THREE.MeshBasicMaterial({ color: 0xffb52e }));
sun.userData.planet = { name: 'Sun', radius: 696340, mass: 332946, moons: 0 };
scene.add(sun);
clickable.push(sun);
for (const [r, opacity] of [[1.9, .11], [2.15, .055], [2.5, .025]]) {
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(r, 64, 40), new THREE.MeshBasicMaterial({ color: 0xff8a18, transparent: true, opacity, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })));
}

P.forEach(addPlanet);

// Main asteroid belt.
const beltGeo = new THREE.BufferGeometry();
const bp = new Float32Array(2200 * 3);
for (let i = 0; i < 2200; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = AU(2.15 + Math.random() * 1.25);
  const j = i * 3;
  bp[j] = r * Math.cos(a);
  bp[j + 1] = (Math.random() - .5) * .3;
  bp[j + 2] = r * Math.sin(a);
}
beltGeo.setAttribute('position', new THREE.BufferAttribute(bp, 3));
scene.add(new THREE.Points(beltGeo, new THREE.PointsMaterial({ color: 0x9a8067, size: .025 })));

const list = document.querySelector('#planetList');
[['Sun'], ...P].forEach(d => { const b = document.createElement('button'); b.textContent = d[0]; b.onclick = () => focus(d[0]); list.appendChild(b); });

let speed = 100, paused = false;
document.querySelector('#speed').oninput = e => { speed = +e.target.value; document.querySelector('#speedValue').textContent = `${speed} days/s`; };
document.querySelector('#pause').onclick = e => { paused = !paused; e.target.textContent = paused ? 'Resume' : 'Pause'; };
document.querySelector('#reset').onclick = () => { camera.position.set(0, 32, 62); controls.target.set(0, 0, 0); };
document.querySelector('#closeInfo').onclick = () => document.querySelector('#info').classList.remove('show');

function info(p) {
  document.querySelector('#infoName').textContent = p.name;
  document.querySelector('#infoBody').innerHTML = `<div><b>Radius</b><span>${p.radius?.toLocaleString() || '—'} km</span></div><div><b>Mean distance</b><span>${p.a ? p.a + ' AU' : 'Center star'}</span></div>${p.period ? `<div><b>Orbital period</b><span>${(p.period * 365.256).toFixed(2)} days</span></div><div><b>Eccentricity</b><span>${p.e}</span></div><div><b>Inclination</b><span>${p.inc}°</span></div>` : ''}<div><b>Known moons</b><span>${p.moons ?? '—'}</span></div>`;
  document.querySelector('#info').classList.add('show');
}
function focus(name) {
  const o = clickable.find(x => x.userData.planet?.name === name);
  if (!o) return;
  info(o.userData.planet);
  const w = new THREE.Vector3(); o.getWorldPosition(w);
  controls.target.copy(w);
  camera.position.copy(w.clone().add(new THREE.Vector3(3, 2.2, 5)));
}

const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();
renderer.domElement.addEventListener('pointerup', e => {
  if (Math.abs(e.clientX - (window.__downX ?? e.clientX)) > 5 || Math.abs(e.clientY - (window.__downY ?? e.clientY)) > 5) return;
  mouse.x = e.clientX / innerWidth * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  ray.setFromCamera(mouse, camera);
  const h = ray.intersectObjects(clickable, false)[0];
  if (h) info(h.object.userData.planet);
});
renderer.domElement.addEventListener('pointerdown', e => { window.__downX = e.clientX; window.__downY = e.clientY; });

let t = 0, last = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - last) / 1000, .05); last = now;
  if (!paused) {
    t += dt * speed;
    orbitObjects.forEach(o => {
      o.pivot.rotation.y = t / o.periodDays * Math.PI * 2;
      if (o.mesh) o.mesh.rotation.y += dt * .22;
    });
  }
  sun.rotation.y += dt * .035;
  controls.update();
  renderer.render(scene, camera);
  document.querySelector('#loading').classList.toggle('hidden', assets.size >= P.length || now > 5000);
}
requestAnimationFrame(animate);

addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
