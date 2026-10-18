import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import mapDataUrl from './data/map-data.json?url';

window.__started = true;
const $ = id => document.getElementById(id);
const stage = $('stage');
main().catch(err => { console.error(err); stage.innerHTML = '<div class="fail">This browser could not start the 3D view.</div>'; $('veil').classList.add('out'); });

async function main() {
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const sstep = (a, b, x) => smooth((x - a) / (b - a));
const D2R = Math.PI / 180;
const MOBILE = window.matchMedia('(max-width:900px)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent);
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rng2 = (a, b) => a < b ? [a, b] : [b, a];
function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const rand = mulberry(1926);
const wait = ms => new Promise(r => setTimeout(r, ms));
const mapDataPromise = fetch(mapDataUrl).then(response => {
  if (!response.ok) throw new Error('Failed to load map data: HTTP ' + response.status);
  return response.json();
});

/* ================= renderer and post-processing ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);
const dom = renderer.domElement;
const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 4000);

let activeScene = null;
let composer = null, renderPass = null, gtao = null, bloom = null, grade = null, usePost = true;
const noAO = new Set();
try {
  const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: MOBILE ? 0 : 4 });
  composer = new EffectComposer(renderer, rt);
  renderPass = new RenderPass(new THREE.Scene(), camera);
  composer.addPass(renderPass);
  if (!MOBILE) {
    gtao = new GTAOPass(new THREE.Scene(), camera, 2, 2);
    gtao.output = GTAOPass.OUTPUT.Default;
    gtao.blendIntensity = 1.0;
    try { gtao.updateGtaoMaterial({ radius: 2.2, distanceExponent: 1, thickness: 1, scale: 1, samples: 16 }); } catch (e) {}
    try { gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, radiusExponent: 1, rings: 2, samples: 16 }); } catch (e) {}
    const orig = gtao.render.bind(gtao);
    gtao.render = function (r, w, rb, dt, mask) {
      const hidden = [];
      noAO.forEach(o => { if (o.visible) { o.visible = false; hidden.push(o); } });
      try { orig(r, w, rb, dt, mask); } finally { hidden.forEach(o => { o.visible = true; }); }
    };
    composer.addPass(gtao);
  }
  try { bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.2, 0.45, 4.0); composer.addPass(bloom); } catch (e) { bloom = null; }
  composer.addPass(new OutputPass());
  try {
    grade = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, time: { value: 0 }, res: { value: new THREE.Vector2(1, 1) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D tDiffuse; uniform float time; uniform vec2 res; varying vec2 vUv;\n' +
        'void main(){ vec4 c = texture2D(tDiffuse, vUv); vec3 col = c.rgb;\n' +
        'float l = dot(col, vec3(0.299, 0.587, 0.114)); col = mix(vec3(l), col, 1.07);\n' +
        'col = (col - 0.5) * 1.035 + 0.5; col *= vec3(1.01, 1.0, 0.985);\n' +
        'vec2 q = vUv - 0.5; col *= 1.0 - dot(q, q) * 0.5;\n' +
        'float g = fract(sin(dot(vUv * res + time, vec2(12.9898, 78.233))) * 43758.5453); col += (g - 0.5) * 0.014;\n' +
        'gl_FragColor = vec4(clamp(col, 0.0, 1.0), c.a); }'
    });
    composer.addPass(grade);
  } catch (e) { grade = null; }
} catch (e) { console.warn('Post-processing unavailable', e); usePost = false; }

function setActiveScene(s) {
  activeScene = s;
  if (renderPass) renderPass.scene = s;
  if (gtao) gtao.scene = s;
}
function render(dt) {
  if (usePost && composer) {
    try { composer.render(dt); return; } catch (e) { console.error(e); usePost = false; }
  }
  renderer.render(activeScene, camera);
}

/* ================= textures ================= */
const TILE = { corrugated: 0.6, brickBuff: 1, stains: 7, camo: 16, tile: 1.2, render: 3, brick: 1, concrete: 2.4, stone: 2.4, lawn: 4, gravel: 2, paving: 3, asphalt: 4, cobble: 1.2, sand: 3, roofing: 4, ballast: 1.5, slate: 2 };
const TSIZE = { lawn: 512, stains: 512, camo: 512 };
const TEXC = {}, TEXT = {};
function texCanvas(type) {
  if (TEXC[type]) return TEXC[type];
  const S = TSIZE[type] || 256, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), R = Math.random;
  const rgba = (r, gg, b, a) => 'rgba(' + (r | 0) + ',' + (gg | 0) + ',' + (b | 0) + ',' + a + ')';
  const speck = (n, sz, v, amax) => { for (let i = 0; i < n; i++) { g.fillStyle = rgba(v, v, v, amax * R()); g.fillRect(R() * S, R() * S, sz * (0.4 + R()), sz * (0.4 + R())); } };
  const blob = (x, y, rx, ry, rot, col) => { [-S, 0, S].forEach(ox => [-S, 0, S].forEach(oy => { g.beginPath(); g.ellipse(x + ox, y + oy, rx, ry, rot, 0, Math.PI * 2); g.fillStyle = col; g.fill(); })); };
  let i;
  if (type === 'render') {
    g.fillStyle = '#f2f2f0'; g.fillRect(0, 0, S, S);
    for (i = 0; i < 40; i++) blob(R() * S, R() * S, 10 + R() * 30, 10 + R() * 30, R() * 3, R() < 0.5 ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.05)');
    speck(2600, 1.4, 0, 0.07); speck(1600, 1.3, 255, 0.15);
  } else if (type === 'stone') {
    g.fillStyle = '#ece6dc'; g.fillRect(0, 0, S, S);
    for (let r = 0; r < 8; r++) { const off = (r % 2) * 48; for (let k = -1; k < 4; k++) { const v = 222 + R() * 26; g.fillStyle = rgba(v, v - 6, v - 16, 1); g.fillRect(k * 96 + off + 1.5, r * 32 + 1.5, 93, 29); } }
    speck(3000, 1.3, 0, 0.1); speck(1500, 1.3, 255, 0.12);
  } else if (type === 'brick') {
    g.fillStyle = '#bdb5a6'; g.fillRect(0, 0, S, S);
    for (let r = 0; r < 10; r++) { const off = (r % 2) * 25.6; for (let k = -1; k < 6; k++) { g.fillStyle = rgba(140 + R() * 45, 66 + R() * 28, 44 + R() * 20, 1); g.fillRect(k * 51.2 + off + 1.5, r * 25.6 + 1.5, 48.2, 22.6); } }
    speck(2600, 1.4, 0, 0.18);
  } else if (type === 'concrete') {
    g.fillStyle = '#e6e6e3'; g.fillRect(0, 0, S, S);
    for (let r = 0; r < 8; r++) { const v = 200 + R() * 40; g.fillStyle = rgba(v, v, v - 2, 0.45); g.fillRect(0, r * 32, S, 32); g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(0, r * 32, S, 1.5); }
    speck(3000, 1.5, 0, 0.13); speck(1500, 1.3, 255, 0.13);
  } else if (type === 'lawn') {
    g.fillStyle = '#5d8238'; g.fillRect(0, 0, S, S);
    for (i = 0; i < 46; i++) blob(R() * S, R() * S, 25 + R() * 80, 25 + R() * 80, R() * 3, R() < 0.45 ? 'rgba(34,52,18,0.10)' : R() < 0.7 ? 'rgba(160,170,80,0.08)' : 'rgba(110,150,60,0.09)');
    for (i = 0; i < 26000; i++) { const t = R(); g.fillStyle = t < 0.4 ? rgba(84 + R() * 34, 122 + R() * 40, 50 + R() * 14, 0.55) : t < 0.8 ? rgba(52 + R() * 20, 86 + R() * 32, 34, 0.55) : rgba(132 + R() * 30, 140 + R() * 26, 70, 0.4); g.save(); g.translate(R() * S, R() * S); g.rotate((R() - 0.5) * 0.9); g.fillRect(0, 0, 1.1, 2.5 + R() * 3.5); g.restore(); }
    for (i = 0; i < 60; i++) { g.fillStyle = R() < 0.6 ? 'rgba(245,245,235,0.85)' : 'rgba(240,210,70,0.85)'; g.beginPath(); g.arc(R() * S, R() * S, 0.9 + R() * 0.8, 0, 7); g.fill(); }
  } else if (type === 'gravel' || type === 'ballast') {
    g.fillStyle = type === 'ballast' ? '#7d776e' : '#a19c92'; g.fillRect(0, 0, S, S);
    for (i = 0; i < 3400; i++) { const v = (type === 'ballast' ? 90 : 120) + R() * 90; g.fillStyle = rgba(v, v - 4, v - 10, 0.9); g.beginPath(); g.ellipse(R() * S, R() * S, 1 + R() * 2.4, 1 + R() * 1.9, R() * 3, 0, 7); g.fill(); }
  } else if (type === 'paving') {
    g.fillStyle = '#d9d6cf'; g.fillRect(0, 0, S, S);
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) { const t = 196 + R() * 40; g.fillStyle = rgba(t, t - 2, t - 6, 0.6); g.fillRect(a * 64, b * 64, 64, 64); }
    g.fillStyle = 'rgba(0,0,0,0.28)'; for (let k = 0; k < 4; k++) { g.fillRect(0, k * 64, S, 1.6); g.fillRect(k * 64, 0, 1.6, S); }
    speck(3000, 1.3, 0, 0.12);
  } else if (type === 'asphalt') {
    g.fillStyle = '#3a3c3e'; g.fillRect(0, 0, S, S); speck(5200, 1.6, 255, 0.12); speck(4200, 1.4, 0, 0.25);
  } else if (type === 'cobble') {
    g.fillStyle = '#4a4846'; g.fillRect(0, 0, S, S);
    for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) { const v = 100 + R() * 70, off = (b % 2) * 10.6; g.fillStyle = rgba(v, v - 3, v - 8, 1); g.beginPath(); g.ellipse(a * 21.33 + 10.6 + off, b * 21.33 + 10.6, 9, 8.6, 0, 0, 7); g.fill(); if (a === 0) { g.beginPath(); g.ellipse(-10.6 + off, b * 21.33 + 10.6, 9, 8.6, 0, 0, 7); g.fill(); } }
  } else if (type === 'sand') {
    g.fillStyle = '#cdb98f'; g.fillRect(0, 0, S, S); speck(5000, 1.3, 0, 0.12); speck(3000, 1.2, 255, 0.18);
  } else if (type === 'corrugated') {
    for (let x = 0; x < S; x++) { const v = 150 + 70 * (0.5 + 0.5 * Math.cos(x / S * Math.PI * 2 * 16)); g.fillStyle = rgba(v, v, v + 4, 1); g.fillRect(x, 0, 1, S); }
    speck(1500, 1.2, 0, 0.1);
  } else if (type === 'brickBuff') {
    g.fillStyle = '#d9cfb8'; g.fillRect(0, 0, S, S);
    for (let r = 0; r < 10; r++) { const off = (r % 2) * 25.6; for (let k2 = -1; k2 < 6; k2++) { g.fillStyle = rgba(196 + R() * 30, 166 + R() * 26, 108 + R() * 22, 1); g.fillRect(k2 * 51.2 + off + 1.5, r * 25.6 + 1.5, 48.2, 22.6); } }
    speck(2600, 1.4, 0, 0.14);
  } else if (type === 'stains') {
    g.fillStyle = '#d8d6d1'; g.fillRect(0, 0, S, S);
    for (i = 0; i < 70; i++) { const x = R() * S, w = 3 + R() * 22, h = 80 + R() * 420, y = R() * 120 - 60; const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, rgba(25, 22, 20, 0.28 * R() + 0.05)); gr.addColorStop(1, rgba(25, 22, 20, 0)); g.fillStyle = gr; [-S, 0, S].forEach(o => g.fillRect(x + o, y, w, h)); }
    for (i = 0; i < 26; i++) blob(R() * S, R() * S, 20 + R() * 70, 14 + R() * 50, R() * 3, rgba(20, 18, 16, 0.06 + R() * 0.1));
    speck(5000, 1.8, 0, 0.2); speck(1500, 1.6, 255, 0.1);
  } else if (type === 'camo') {
    g.fillStyle = '#857a60'; g.fillRect(0, 0, S, S);
    const cols = ['#4b5338', '#6b5640', '#a08a5e', '#7a7b72', '#3f4235', '#5d6448'];
    for (i = 0; i < 46; i++) blob(R() * S, R() * S, 30 + R() * 80, 18 + R() * 50, R() * 3, cols[(R() * cols.length) | 0]);
    speck(4000, 1.6, 0, 0.12); speck(2000, 1.4, 255, 0.08);
  } else if (type === 'tile') {
    g.fillStyle = '#ddd2c9'; g.fillRect(0, 0, S, S);
    for (let r = 0; r < 16; r++) for (let k2 = 0; k2 < 9; k2++) { const v = 205 + R() * 40; g.fillStyle = rgba(v, v - 8, v - 14, 1); g.fillRect(k2 * 32 + (r % 2) * 16 - 16 + 1, r * 16 + 1, 30, 14); }
    speck(2500, 1.3, 0, 0.12);
  } else if (type === 'roofing' || type === 'slate') {
    g.fillStyle = type === 'slate' ? '#55585f' : '#5a5d60'; g.fillRect(0, 0, S, S);
    g.fillStyle = 'rgba(0,0,0,0.3)';
    if (type === 'slate') { for (let r = 0; r < 16; r++) { g.fillRect(0, r * 16, S, 1.5); for (let k = 0; k < 8; k++) g.fillRect(k * 32 + (r % 2) * 16, r * 16, 1.2, 16); } }
    else for (let k = 0; k < 4; k++) g.fillRect(0, k * 64, S, 2);
    speck(4000, 1.5, 255, 0.07); speck(3000, 1.4, 0, 0.2);
  }
  TEXC[type] = c; return c;
}
function getTex(type) {
  if (TEXT[type]) return TEXT[type];
  const t = new THREE.CanvasTexture(texCanvas(type));
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / TILE[type], 1 / TILE[type]);
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); t.colorSpace = THREE.SRGBColorSpace;
  TEXT[type] = t; return t;
}

/* ================= materials ================= */
const GLASSY = new Set();
// water: two tiling wave normal maps (broad swell and fine ripples) that drift in different directions
let WATER_N = null, WATER_N2 = null;
function waveNormals(seed, count, kmin, kmax, strength) {
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), img = g.createImageData(S, S), r = mulberry(seed), waves = [];
  for (let i = 0; i < count; i++) { let kx, ky; do { kx = Math.round((r() * 2 - 1) * kmax); ky = Math.round((r() * 2 - 1) * kmax); } while (Math.hypot(kx, ky) < kmin); waves.push([kx, ky, 0.5 + r() * 0.5, r() * 6.283]); }
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let gx = 0, gy = 0; for (const w of waves) { const kk = Math.hypot(w[0], w[1]), c0 = w[2] * Math.cos((w[0] * x + w[1] * y) / S * 6.2832 + w[3]) / Math.sqrt(kk); gx += c0 * w[0]; gy += c0 * w[1]; }
    const nx = -gx * strength, ny = -gy * strength, l = Math.hypot(nx, ny, 1), i = (y * S + x) * 4;
    img.data[i] = (nx / l * 0.5 + 0.5) * 255; img.data[i + 1] = (ny / l * 0.5 + 0.5) * 255; img.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function makeWater() {
  WATER_N = waveNormals(4242, 10, 2, 7, 0.075); WATER_N.repeat.set(0.07, 0.07);
  WATER_N2 = waveNormals(777, 14, 6, 18, 0.05); WATER_N2.repeat.set(0.22, 0.22);
  const m = new THREE.MeshPhysicalMaterial({ color: 0x2a6a80, roughness: 0.04, metalness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.0,
    normalMap: WATER_N, normalScale: new THREE.Vector2(1.0, 1.0), clearcoatNormalMap: WATER_N2, clearcoatNormalScale: new THREE.Vector2(0.7, 0.7),
    envMapIntensity: 2.0, transparent: true, opacity: 0.9, depthWrite: true });
  m.userData.op = 0.9; m.userData.glow = 0; return m;
}
function std(color, rough, metal, tex, extra) {
  const m = new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: rough == null ? 0.9 : rough, metalness: metal || 0 }, extra || {}));
  if (tex) { m.map = getTex(tex); const b = BUMP[tex]; if (b) { m.bumpMap = m.map; m.bumpScale = b; } }
  return m;
}
const BUMP = { render: 0.06, stone: 0.18, brick: 0.25, brickBuff: 0.25, concrete: 0.12, paving: 0.2, cobble: 0.35, roofing: 0.1, slate: 0.15, tile: 0.2, stains: 0.06, gravel: 0.25, ballast: 0.3 };
function glass(color, op, rough, metal, env, glow) {
  const m = new THREE.MeshPhysicalMaterial({ color: color, transparent: true, opacity: op, roughness: rough, metalness: metal, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: env, clearcoat: 1.0, clearcoatRoughness: 0.04 });
  m.userData.glow = glow; m.userData.op = op; return m;
}
const MAT = {
  white: std(0xeceae4, 0.92, 0, 'render'), grey: std(0x8d9093, 0.92, 0, 'render'), roof: std(0x9a9d9f, 0.95, 0, 'roofing'),
  frame: std(0x1f2022, 0.45, 0.55), dark: std(0x14171a, 0.85), wood: std(0x5d4a39, 0.85), whiteInt: std(0xe9e7e1, 0.9),
  ceilO: std(0xde7a2c, 0.9), ceilY: std(0xefc12c, 0.9), ceilB: std(0x1f4fa3, 0.9), red: std(0xc8372d, 0.6),
  lawn: std(0xffffff, 0.98, 0, 'lawn'), paving: std(0xffffff, 0.92, 0, 'paving'), asphalt: std(0xffffff, 0.95, 0, 'asphalt'),
  cobble: std(0xffffff, 0.9, 0, 'cobble'), gravel: std(0xffffff, 0.95, 0, 'gravel'), ballast: std(0xffffff, 0.95, 0, 'ballast'),
  sand: std(0xffffff, 0.95, 0, 'sand'), stone: std(0xd2c3a8, 0.88, 0, 'stone'), slate: std(0xffffff, 0.8, 0.05, 'slate'),
  copper: std(0x6f9e8b, 0.55, 0.35), blackbox: std(0x1b1c1e, 0.75, 0.05), steel: std(0x6b7075, 0.45, 0.6),
  kornBlue: std(0x2f5d9e, 0.5, 0.15), rail: std(0x7a6e66, 0.45, 0.7), sleeper: std(0x4d4339, 0.9), train: std(0xc41a24, 0.45, 0.25),
  tram: std(0xe8e2cf, 0.5, 0.2), canopy: std(0x8b9196, 0.5, 0.5), concrete: std(0xbab9b3, 0.9, 0, 'concrete'),
  bark: std(0x55463a, 0.9), leaf: std(0x5f8442, 0.95, 0, null, { flatShading: true }), leaf2: std(0x6d8c47, 0.95, 0, null, { flatShading: true }),
  pine: std(0x2f4a33, 0.95, 0, null, { flatShading: true }), pine2: std(0x3a5638, 0.95, 0, null, { flatShading: true }), leaf3: std(0x4d7036, 0.95, 0, null, { flatShading: true }), coat: std(0x3b3f46, 0.85), skin: std(0xd9b394, 0.8), soil: std(0x7a6b57, 0.95),
  renderWarm: std(0xe6dcc8, 0.92, 0, 'render'), stoneLight: std(0xe6dccb, 0.85, 0, 'stone'), tiles: std(0xb3664a, 0.85, 0, 'tile'),
  newWhite: std(0xf2f1ec, 0.75, 0, 'render'), frost: glass(0xe6edef, 0.86, 0.5, 0, 0.5, 1.0),
  soot: std(0xa29e98, 0.95, 0, 'stains'), postwar: std(0xd0c8b3, 0.95, 0, 'stains'), camo: std(0xffffff, 0.95, 0, 'camo'),
  alu: std(0xa8adb1, 0.35, 0.85), rust: std(0x7b4a33, 0.85, 0.3), ochre: std(0xc8a46a, 0.92, 0, 'render'), brick: std(0xffffff, 0.9, 0, 'brick'),
  bauRed: std(0xc8372d, 0.85, 0, 'render'), bauBlue: std(0x1f4fa3, 0.85, 0, 'render'), bauYellow: std(0xefc12c, 0.85, 0, 'render'), black: std(0x1b1b1c, 0.85, 0, 'render'),
  none: new THREE.MeshBasicMaterial({ visible: false }), glassSmoked: glass(0x1d2c35, 0.8, 0.06, 0.2, 1.2, 0.35),
  brickBuff: std(0xffffff, 0.9, 0, 'brickBuff'), sandstone: std(0xd2c6a8, 0.85, 0, 'stone'), blackstone: std(0x2f3031, 0.6, 0.1, 'stone'),
  roofZinc: std(0x7c8487, 0.45, 0.55), domeBronze: std(0xc2ad7e, 0.3, 0.85), domeRib: std(0x8d7c58, 0.4, 0.8), bronzeDark: std(0x34312c, 0.45, 0.6),
  larch: std(0x6f6052, 0.9, 0, 'wood'), pvPanel: std(0x1d2a3a, 0.25, 0.6), greenRoof: std(0x86995e, 0.95, 0, 'lawn'),
  cgViolet: glass(0x7a64b0, 0.85, 0.1, 0.1, 1.4, 0.9), cgWhite: glass(0xdfe5e6, 0.85, 0.1, 0.1, 1.4, 0.9), cgGrey: glass(0x9aa4a9, 0.85, 0.1, 0.1, 1.4, 0.9),
  steam: glass(0xffffff, 0.28, 0.9, 0, 0.6, 0),
  cgGreen: glass(0x5fae4e, 0.82, 0.1, 0.1, 1.4, 0.9), cgTeal: glass(0x2f9c8e, 0.82, 0.1, 0.1, 1.4, 0.9), cgLime: glass(0xa6cf47, 0.82, 0.1, 0.1, 1.4, 0.9), cgBlue: glass(0x3f7fc0, 0.82, 0.1, 0.1, 1.4, 0.9),
  cgYellow: glass(0xf0c93e, 0.82, 0.1, 0.1, 1.4, 0.9), cgOrange: glass(0xe8823a, 0.82, 0.1, 0.1, 1.4, 0.9), cgRed: glass(0xc9443a, 0.82, 0.1, 0.1, 1.4, 0.9), steelWhite: std(0xeceeee, 0.4, 0.45), panelGrey: std(0xd6d4cc, 0.85, 0, 'concrete'),
  dcRed: std(0xd04a3d, 0.88, 0, 'render'), dcSilver: std(0xc3c7ca, 0.5, 0.35), domeBrown: std(0x6b5641, 0.45, 0.6), mallRed: std(0x7a2a2c, 0.85, 0, 'render'), mastGreen: std(0x4f7a5a, 0.6, 0.5), sail: std(0xf5f4f0, 0.6, 0),
  lyzRender: std(0xe2d1a4, 0.9, 0, 'render'),
  baroqueYellow: std(0xe9d29a, 0.9, 0, 'render'), luisYellow: std(0xf0e0a4, 0.9, 0, 'render'), ochre: std(0xe8c35f, 0.9, 0, 'render'), pinkRender: std(0xe6cabf, 0.9, 0, 'render'), hedge: std(0x3e5e33, 0.95, 0, null, { flatShading: true }),
  corrugated: std(0xc9ced3, 0.4, 0.75, 'corrugated'), iron: std(0x2a2c2f, 0.55, 0.6), rock: std(0x6e6458, 0.95, 0, null, { flatShading: true }),
  lavaGlow: std(0xff5a1e, 0.8, 0, null, { emissive: 0xff4a10, emissiveIntensity: 1.5 }), lyzRender: std(0xddcda4, 0.9, 0, 'render'), lyzStone: std(0xd0bd94, 0.85, 0, 'stone'), tilesRed: std(0xd06a48, 0.8, 0, 'tile'), domeDark: std(0x4a4440, 0.45, 0.55),
  stationRed: std(0xc4604e, 0.9, 0, 'render'), cream: std(0xebe3cf, 0.85, 0, 'render'), tileYellow: std(0xd6b664, 0.55, 0),
  canopyDark: std(0x2f3235, 0.5, 0.45), poleGreen: std(0x4b5b52, 0.6, 0.4), steelBlue: std(0x3d5a8a, 0.5, 0.5),
  hallWall: std(0xd2ccd6, 0.92, 0, 'render'), hallCeiling: std(0x8c8781, 0.85), floorStone: std(0xbab6ae, 0.55, 0, 'paving'),
  water: makeWater(),
  lampHead: std(0xfff4d8, 0.5, 0, null, { emissive: 0xffcf7a, emissiveIntensity: 0.2 }),
  glass: glass(0x8faab2, 0.34, 0.02, 0.3, 2.0, 1), glassDark: glass(0x6e8790, 0.55, 0.05, 0.3, 1.6, 0.8),
  museumGlass: glass(0xb5cdd3, 0.2, 0.03, 0.25, 1.6, 0.9),
  glassYellow: glass(0xf2c230, 0.55, 0.1, 0, 0.6, 0.3), glassRed: glass(0xd8452f, 0.55, 0.1, 0, 0.6, 0.3), glassBlue: glass(0x3a6fd0, 0.55, 0.1, 0, 0.6, 0.3), glassGreen: glass(0x3f9a6a, 0.55, 0.1, 0, 0.6, 0.3)
};
Object.keys(MAT).forEach(k => { if (MAT[k].transparent) GLASSY.add(k); });
const CEIL = ['ceilO', 'ceilY', 'ceilB', 'hallCeiling'];
const WARM = new THREE.Color(0xffc479);

/* ================= geometry kit ================= */
function mbox(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const dm = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dm[f][0], uv.getY(i) * dm[f][1]); }
  return g;
}
function bx(x0, x1, y0, y1, z0, z1) { const g = mbox(Math.max(x1 - x0, 0.001), Math.max(y1 - y0, 0.001), Math.max(z1 - z0, 0.001)); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); return g; }
function clean(g) {
  let n = g.index ? g.toNonIndexed() : g;
  if (n !== g) g.dispose();
  Object.keys(n.attributes).forEach(k => { if (k !== 'position' && k !== 'normal' && k !== 'uv') n.deleteAttribute(k); });
  if (!n.attributes.uv) n.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2));
  n.clearGroups(); return n;
}
const unitBox = new THREE.BoxGeometry(1, 1, 1);
class Kit {
  constructor() { this.g = {}; this.f = {}; this.part = ''; }
  key(m, t) { return m + '|' + (t || '') + '|' + (this.part || ''); }
  geo(m, geo, t) { const k = this.key(m, t), c = clean(geo); if (!this.noGrass) this.ground(m, c); (this.g[k] || (this.g[k] = [])).push(c); }
  ground(m, g) {
    g.computeBoundingBox(); const b = g.boundingBox; if (b.min.y > 0.35 || b.max.y < -0.05) return;
    if (m === 'lawn') { if (b.max.y - b.min.y < 0.6) (this.lawns || (this.lawns = [])).push([b.min.x, b.max.x, b.min.z, b.max.z, b.max.y]); return; }
    if (m.indexOf('leaf') === 0 || m === 'needle') return;
    (this.blocks || (this.blocks = [])).push([b.min.x, b.max.x, b.min.z, b.max.z, b.max.y]);
  }
  box(m, x0, x1, y0, y1, z0, z1, t) { this.geo(m, bx(x0, x1, y0, y1, z0, z1), t); }
  paneX(m, x, y0, y1, z0, z1, t) { const g = new THREE.PlaneGeometry(z1 - z0, y1 - y0); g.rotateY(Math.PI / 2); g.translate(x, (y0 + y1) / 2, (z0 + z1) / 2); this.geo(m, g, t); }
  paneZ(m, z, y0, y1, x0, x1, t) { const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0); g.translate((x0 + x1) / 2, (y0 + y1) / 2, z); this.geo(m, g, t); }
  fr(m, x0, x1, y0, y1, z0, z1, t) { const k = this.key(m, t); (this.f[k] || (this.f[k] = [])).push([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0) || 0.001, Math.abs(y1 - y0) || 0.001, Math.abs(z1 - z0) || 0.001]); }
  winX(x, s, z0, z1, y0, y1, o) {
    o = o || {}; const t = o.tag, p = o.protrude || 0, fw = o.fw || 0.06, fm = o.frame || 'frame', gm = o.glass || 'glass';
    if (o.back !== false) { const r = rng2(x + s * 0.004, x + s * (0.018 + p)); this.box('dark', r[0], r[1], y0, y1, z0, z1, t); }
    this.paneX(gm, x + s * (0.05 + p), y0, y1, z0, z1, t);
    const f = rng2(x + s * (0.02 + p), x + s * (0.1 + p));
    const fb = (ya, yb, za, zb) => this.fr(fm, f[0], f[1], ya, yb, za, zb, t);
    const fi = rng2(x + s * (0.025 + p), x + s * (0.095 + p)), fm2 = (ya, yb, za, zb) => this.fr(fm, fi[0], fi[1], ya, yb, za, zb, t);
    fb(y1 - fw, y1, z0, z1); fb(y0, y0 + fw, z0, z1); fb(y0 + fw, y1 - fw, z0, z0 + fw); fb(y0 + fw, y1 - fw, z1 - fw, z1);
    if (o.mull) { const n = Math.max(1, Math.round((z1 - z0) / o.mull)); for (let i = 1; i < n; i++) { const zc = z0 + (z1 - z0) * i / n; fm2(y0 + fw, y1 - fw, zc - fw * 0.4, zc + fw * 0.4); } }
    (o.trans || []).forEach(ty => fb(ty - fw * 0.4, ty + fw * 0.4, z0 + fw, z1 - fw));
  }
  winZ(z, s, x0, x1, y0, y1, o) {
    o = o || {}; const t = o.tag, p = o.protrude || 0, fw = o.fw || 0.06, fm = o.frame || 'frame', gm = o.glass || 'glass';
    if (o.back !== false) { const r = rng2(z + s * 0.004, z + s * (0.018 + p)); this.box('dark', x0, x1, y0, y1, r[0], r[1], t); }
    this.paneZ(gm, z + s * (0.05 + p), y0, y1, x0, x1, t);
    const f = rng2(z + s * (0.02 + p), z + s * (0.1 + p));
    const fb = (xa, xb, ya, yb) => this.fr(fm, xa, xb, ya, yb, f[0], f[1], t);
    const fi = rng2(z + s * (0.025 + p), z + s * (0.095 + p)), fm2 = (xa, xb, ya, yb) => this.fr(fm, xa, xb, ya, yb, fi[0], fi[1], t);
    fb(x0, x1, y1 - fw, y1); fb(x0, x1, y0, y0 + fw); fb(x0, x0 + fw, y0 + fw, y1 - fw); fb(x1 - fw, x1, y0 + fw, y1 - fw);
    if (o.mull) { const n = Math.max(1, Math.round((x1 - x0) / o.mull)); for (let i = 1; i < n; i++) { const xc = x0 + (x1 - x0) * i / n; fm2(xc - fw * 0.4, xc + fw * 0.4, y0 + fw, y1 - fw); } }
    (o.trans || []).forEach(ty => fb(x0 + fw, x1 - fw, ty - fw * 0.4, ty + fw * 0.4));
  }
  roofRing(m, x0, x1, z0, z1, y, h, roofM) {
    const t = 0.3;
    this.box(m, x0, x1, y, y + h, z0, z0 + t); this.box(m, x0, x1, y, y + h, z1 - t, z1); this.box(m, x0, x0 + t, y, y + h, z0 + t, z1 - t); this.box(m, x1 - t, x1, y, y + h, z0 + t, z1 - t);
    this.box(roofM || 'roof', x0 + t, x1 - t, y, y + 0.06, z0 + t, z1 - t);
  }
  build() {
    const grp = new THREE.Group();
    Object.keys(this.g).forEach(k => {
      const [m, t, pt] = k.split('|'); const g = mergeGeometries(this.g[k], false);
      if (!g) { console.warn('merge failed', k); return; }
      g.computeBoundingSphere();
      const mesh = new THREE.Mesh(g, MAT[m]);
      const gl = GLASSY.has(m);
      mesh.castShadow = !gl && m !== 'lawn' && m !== 'paving' && m !== 'asphalt' && m !== 'cobble' && m !== 'gravel' && m !== 'water' && m !== 'sand';
      mesh.receiveShadow = !gl || m === 'water';
      if (gl) { mesh.renderOrder = m === 'water' ? 1 : 3; mesh.userData.noAO = true; }
      if (m === 'water') mesh.userData.noAO = true;
      if (t) mesh.userData.fact = t;
      if (pt) mesh.userData.part = pt;
      grp.add(mesh);
    });
    Object.keys(this.f).forEach(k => {
      const [m, t, pt] = k.split('|'), list = this.f[k];
      if (pt) { for (let i = list.length - 1; i > 0; i--) { const j = (rand() * (i + 1)) | 0; const tmp = list[i]; list[i] = list[j]; list[j] = tmp; } }
      const im = new THREE.InstancedMesh(unitBox, MAT[m], list.length);
      const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), Sc = new THREE.Vector3();
      list.forEach((q, i) => { M4.compose(P.set(q[0], q[1], q[2]), Q, Sc.set(q[3], q[4], q[5])); im.setMatrixAt(i, M4); });
      im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere();
      im.castShadow = true; im.receiveShadow = true; if (t) im.userData.fact = t; if (pt) im.userData.part = pt;
      grp.add(im);
    });
    if (this.lawns && !this.noGrass) { const gf = grassField(this.lawns, this.blocks || []); if (gf) grp.add(gf); }
    return grp;
  }
}
function roundedPath(pts, y, r) {
  const path = new THREE.CurvePath(); let prev = new THREE.Vector3(pts[0][0], y, pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const cur = new THREE.Vector3(pts[i][0], y, pts[i][1]);
    if (i < pts.length - 1) {
      const nxt = new THREE.Vector3(pts[i + 1][0], y, pts[i + 1][1]);
      const d1 = cur.clone().sub(prev).normalize(), d2 = nxt.clone().sub(cur).normalize();
      const rr = Math.min(r, cur.distanceTo(prev) * 0.45, nxt.distanceTo(cur) * 0.45);
      const a = cur.clone().addScaledVector(d1, -rr), b = cur.clone().addScaledVector(d2, rr);
      if (prev.distanceTo(a) > 1e-3) path.add(new THREE.LineCurve3(prev.clone(), a));
      path.add(new THREE.QuadraticBezierCurve3(a, cur, b)); prev = b;
    } else if (prev.distanceTo(cur) > 1e-3) path.add(new THREE.LineCurve3(prev.clone(), cur));
  }
  return path;
}
function prism(x0, x1, z0, z1, y0, y1, ix, iz) {
  const b = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]];
  const t = [[x0 + ix, y1, z0 + iz], [x1 - ix, y1, z0 + iz], [x1 - ix, y1, z1 - iz], [x0 + ix, y1, z1 - iz]];
  const quads = [[b[0], b[1], t[1], t[0]], [b[1], b[2], t[2], t[1]], [b[2], b[3], t[3], t[2]], [b[3], b[0], t[0], t[3]], [t[0], t[1], t[2], t[3]]];
  const pos = [], uv = [];
  const put = v => { pos.push(v[0], v[1], v[2]); uv.push(v[0] + v[2], v[1] * 1.6); };
  quads.forEach(q => { [q[0], q[2], q[1], q[0], q[3], q[2]].forEach(put); });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
  return g;
}
function rails(k, m, pts, y0, hs, tag) { (hs || [0.38, 0.66, 0.95]).forEach(h => k.geo(m, new THREE.TubeGeometry(roundedPath(pts, y0 + h, 0.2), pts.length * 18, 0.022, 6, false), tag)); }

/* reusable small pieces */
function lumpy(g, amt, seed) {
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed) * 43758.5453, n = (h - Math.floor(h)) - 0.5, f = 1 + n * amt;
    p.setXYZ(i, x * f, y * f, z * f);
  }
  g.computeVertexNormals(); return g;
}
/* ---------- realistic vegetation: leaf-card trees, wind, 3D grass ---------- */
const WIND = { value: 0 };
function windify(m, kind) {
  m.onBeforeCompile = sh => {
    sh.uniforms.uWind = WIND;
    const disp = kind === 'grass'
      ? '{ float h = clamp(position.y / 0.6, 0.0, 1.0); vec2 ip = vec2(instanceMatrix[3][0], instanceMatrix[3][2]); float w = sin(uWind * 1.8 + ip.x * 0.31 + ip.y * 0.23) * 0.6 + sin(uWind * 3.1 + ip.x * 0.9 - ip.y * 0.4) * 0.3; transformed.x += w * 0.1 * h * h; transformed.z += w * 0.06 * h * h; }'
      : '{ float h = smoothstep(2.0, 7.0, position.y); float w = sin(uWind * 1.3 + position.x * 0.21 + position.z * 0.17) + 0.5 * sin(uWind * 2.3 + position.y * 0.6 + position.x * 0.4); transformed.x += w * 0.07 * h; transformed.z += w * 0.05 * h; transformed.y += w * 0.02 * h; }';
    sh.vertexShader = 'uniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + disp);
    sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>', THREE.ShaderChunk.normal_fragment_begin.replace('gl_FrontFacing ? 1.0 : - 1.0', '1.0'));
  };
  m.customProgramCacheKey = () => 'wind-' + kind;
  return m;
}
function vegTexture(kind) {
  const S = kind === 'grass' ? 256 : 512, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), R = mulberry(kind === 'leaf' ? 57 : kind === 'needle' ? 91 : 23);
  if (kind === 'leaf') {
    g.strokeStyle = 'rgba(74,58,42,1)'; g.lineCap = 'round';
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283 + R(); g.lineWidth = 2.5; g.beginPath(); g.moveTo(S / 2, S / 2); g.quadraticCurveTo(S / 2 + Math.cos(a + 0.3) * S * 0.2, S / 2 + Math.sin(a + 0.3) * S * 0.2, S / 2 + Math.cos(a) * S * 0.42, S / 2 + Math.sin(a) * S * 0.42); g.stroke(); }
    for (let i = 0; i < 1500; i++) {
      const a = R() * 6.283, r = Math.pow(R(), 0.6) * S * 0.47, x = S / 2 + Math.cos(a) * r, y = S / 2 + Math.sin(a) * r;
      const top = 1 - y / S, hue = 84 + R() * 30, sat = 28 + R() * 20, lit = 16 + R() * 18 + top * 12;
      g.fillStyle = 'hsl(' + hue + ',' + sat + '%,' + lit + '%)'; g.beginPath(); g.ellipse(x, y, 8 + R() * 6, 4 + R() * 2.6, R() * 3.14, 0, 7); g.fill();
      if (R() < 0.3) { g.fillStyle = 'hsla(' + (hue + 4) + ',' + (sat + 2) + '%,' + (lit + 10) + '%,0.55)'; g.beginPath(); g.ellipse(x - 1.5, y - 1.5, 3.5, 1.4, R() * 3.14, 0, 7); g.fill(); }
    }
  } else if (kind === 'needle') {
    g.lineCap = 'round';
    for (let i = 0; i < 18; i++) { const a = R() * 6.283, r = R() * S * 0.17; g.fillStyle = 'rgba(24,44,26,0.6)'; g.beginPath(); g.ellipse(S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r, 18 + R() * 18, 10 + R() * 12, a, 0, 7); g.fill(); }
    for (let b = 0; b < 14; b++) { const a = b / 14 * 6.283 + R() * 0.3, len = S * (0.32 + R() * 0.14); g.strokeStyle = 'rgba(70,52,36,1)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(S / 2, S / 2); g.lineTo(S / 2 + Math.cos(a) * len, S / 2 + Math.sin(a) * len); g.stroke();
      for (let i = 0; i < 170; i++) { const t = Math.sqrt(R()), px = S / 2 + Math.cos(a) * len * t, py = S / 2 + Math.sin(a) * len * t, na = a + (R() < 0.5 ? 1 : -1) * (0.45 + R() * 0.7), nl = (14 + R() * 16) * (1.15 - t * 0.4);
        g.strokeStyle = 'hsl(' + (122 + R() * 26) + ',' + (26 + R() * 18) + '%,' + (12 + R() * 16) + '%)'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(na) * nl, py + Math.sin(na) * nl); g.stroke(); } }
  } else {
    for (let i = 0; i < 70; i++) {
      const x0 = S * (0.12 + R() * 0.76), h = S * (0.4 + R() * 0.56), bend = (R() - 0.5) * S * 0.35, w = 3 + R() * 4;
      const gr = g.createLinearGradient(0, S, 0, S - h); gr.addColorStop(0, 'hsl(' + (88 + R() * 14) + ',38%,' + (14 + R() * 8) + '%)'); gr.addColorStop(1, 'hsl(' + (78 + R() * 26) + ',' + (40 + R() * 16) + '%,' + (34 + R() * 16) + '%)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0 - w, S); g.quadraticCurveTo(x0 - w * 0.3 + bend * 0.4, S - h * 0.55, x0 + bend, S - h); g.quadraticCurveTo(x0 + w * 0.3 + bend * 0.4, S - h * 0.55, x0 + w, S); g.closePath(); g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const VEG_TEX = {};
function vegMaterial(kind, tint) {
  const m = new THREE.MeshStandardMaterial({ map: VEG_TEX[kind] || (VEG_TEX[kind] = vegTexture(kind)), color: tint, alphaTest: kind === 'grass' ? 0.5 : 0.42, side: THREE.DoubleSide, roughness: 0.92, metalness: 0 });
  if (!MOBILE) m.alphaToCoverage = true;
  return windify(m, kind === 'grass' ? 'grass' : 'leaf');
}
MAT.leafA = vegMaterial('leaf', 0xffffff); MAT.leafB = vegMaterial('leaf', 0xe8efc6); MAT.leafC = vegMaterial('leaf', 0xc9d8bd); MAT.needle = vegMaterial('needle', 0xffffff);
const MAT_GRASS = vegMaterial('grass', 0xffffff);

// one leaf card, its normal pointing out of the crown so the whole tree shades like a soft volume
function leafCard(k, m, p, sz, c, rad, up) {
  const g = new THREE.PlaneGeometry(sz, sz);
  g.rotateX(rand() * Math.PI); g.rotateY(rand() * Math.PI * 2); g.rotateZ((rand() - 0.5) * 1.2); g.translate(p[0], p[1], p[2]);
  const pos = g.attributes.position, nor = g.attributes.normal;
  for (let i = 0; i < pos.count; i++) { const nx = (pos.getX(i) - c[0]) / rad[0], ny = (pos.getY(i) - c[1]) / rad[1] + up, nz = (pos.getZ(i) - c[2]) / rad[2], l = Math.hypot(nx, ny, nz) || 1; nor.setXYZ(i, nx / l, ny / l, nz / l); }
  k.geo(m, g);
}
function crown(k, m, c, rad, clusters, perCluster, size) {
  for (let i = 0; i < clusters; i++) {
    let dx, dy, dz; do { dx = rand() * 2 - 1; dy = rand() * 2 - 1; dz = rand() * 2 - 1; } while (dx * dx + dy * dy + dz * dz > 1);
    const f = i < clusters * 0.25 ? 0.35 : 0.72 + rand() * 0.25, l = Math.hypot(dx, dy, dz) || 1;
    const q = [c[0] + dx / l * rad[0] * f, c[1] + (dy / l * 0.9 + 0.05) * rad[1] * f, c[2] + dz / l * rad[2] * f];
    for (let j = 0; j < perCluster; j++) leafCard(k, m, [q[0] + (rand() - 0.5) * size * 0.5, q[1] + (rand() - 0.5) * size * 0.4, q[2] + (rand() - 0.5) * size * 0.5], size * (0.75 + rand() * 0.5), c, rad, 0.35);
  }
}
function tree(k, x, z, s, kind) {
  if (WATER_MASK && WATER_MASK.some(q => inPoly(x, z, q))) return;
  s = s || 1; const lean = (rand() - 0.5) * 0.08, M = MOBILE ? 0.6 : 1;
  if (kind === 'pine') {
    const H = 11 * s, t = new THREE.CylinderGeometry(0.12 * s, 0.3 * s, H, 8); t.translate(x, H / 2, z); k.geo('bark', t);
    const tiers = 8;
    for (let i = 0; i < tiers; i++) { const y = (4.2 + i * 0.95) * s, r = (2.5 - i * 0.27) * s, n = Math.round((7 - i * 0.4) * M);
      for (let j = 0; j < n; j++) { const a = j / n * 6.283 + rand() * 0.6, d = r * (0.45 + rand() * 0.35); rod3(k, 'bark', [x, y + 0.3 * s, z], [x + Math.cos(a) * d, y - 0.25 * s, z + Math.sin(a) * d], 0.04 * s);
        leafCard(k, 'needle', [x + Math.cos(a) * d * 0.85, y - 0.1 * s, z + Math.sin(a) * d * 0.85], r * 1.0, [x, y + 0.6 * s, z], [r, r * 0.6, r], 0.6); } }
    leafCard(k, 'needle', [x, (4.2 + tiers * 0.95) * s, z], 1.2 * s, [x, (4.2 + tiers * 0.95) * s - 0.5, z], [1, 1, 1], 0.6);
    return;
  }
  const poplar = kind === 'poplar', TH = (poplar ? 4.2 : 3.4 + rand() * 0.9) * s;
  const tg = new THREE.CylinderGeometry(0.16 * s, 0.3 * s, TH + 1.6 * s, 8); tg.rotateZ(lean); tg.translate(x, (TH + 1.6 * s) / 2, z); k.geo('bark', tg);
  const rad = poplar ? [1.9 * s, 5.4 * s, 1.9 * s] : [(2.8 + rand() * 0.7) * s, (2.4 + rand() * 0.5) * s, (2.8 + rand() * 0.7) * s];
  const c = [x + Math.sin(lean) * TH, TH + rad[1] * (poplar ? 0.9 : 0.85), z];
  const nb = poplar ? 6 : 5 + (rand() * 2 | 0);
  for (let i = 0; i < nb; i++) { const a = i / nb * 6.283 + rand() * 0.5, h0 = TH * (0.8 + rand() * 0.25), end = [c[0] + Math.cos(a) * rad[0] * 0.7, c[1] + (rand() - 0.2) * rad[1] * 0.6, c[2] + Math.sin(a) * rad[2] * 0.7];
    rod3(k, 'bark', [x + Math.sin(lean) * h0, h0, z], end, 0.08 * s); const sub = [end[0] + Math.cos(a + 0.8) * rad[0] * 0.3, end[1] + rad[1] * 0.25, end[2] + Math.sin(a + 0.8) * rad[2] * 0.3]; rod3(k, 'bark', end, sub, 0.045 * s); }
  const m = ['leafA', 'leafB', 'leafC'][(rand() * 3) | 0];
  crown(k, m, c, rad, Math.round((poplar ? 26 : 22) * M), 4, (poplar ? 1.7 : 2.1) * s);
}

// grass: tufts scattered over every open lawn, skipping anything standing on it
let GRASS_GEO = null;
function grassGeo() {
  if (GRASS_GEO) return GRASS_GEO;
  const a = new THREE.PlaneGeometry(0.9, 0.6); a.translate(0, 0.3, 0); const b = a.clone(); b.rotateY(Math.PI / 2); const c2 = a.clone(); c2.rotateY(Math.PI / 4);
  const g = mergeGeometries([a, b, c2].map(x => x.toNonIndexed()), false); const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0);
  return (GRASS_GEO = g);
}
function grassField(lawns, blocks) {
  const CELL = 8, grid = new Map(), key = (i, j) => i * 100003 + j;
  blocks.forEach(b => { for (let i = Math.floor(b[0] / CELL); i <= Math.floor(b[1] / CELL); i++) for (let j = Math.floor(b[2] / CELL); j <= Math.floor(b[3] / CELL); j++) { const kk = key(i, j); let l = grid.get(kk); if (!l) grid.set(kk, l = []); l.push(b); } });
  const area = lawns.reduce((a, l) => a + (l[1] - l[0]) * (l[3] - l[2]), 0), cap = MOBILE ? 9000 : 38000, dens = Math.min(1.6, cap / Math.max(1, area)), r = mulberry(1234), pts = [];
  lawns.forEach(l => { const n = Math.round((l[1] - l[0]) * (l[3] - l[2]) * dens);
    for (let i = 0; i < n; i++) { const x = l[0] + r() * (l[1] - l[0]), z = l[2] + r() * (l[3] - l[2]), cell = grid.get(key(Math.floor(x / CELL), Math.floor(z / CELL))); let ok = true;
      if (cell) for (const b of cell) if (x >= b[0] - 0.2 && x <= b[1] + 0.2 && z >= b[2] - 0.2 && z <= b[3] + 0.2 && b[4] > l[4] + 0.005) { ok = false; break; }
      if (ok) pts.push(x, l[4], z); } });
  const N = pts.length / 3; if (!N) return null;
  const im = new THREE.InstancedMesh(grassGeo(), MAT_GRASS, N), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S3 = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0), C = new THREE.Color();
  for (let i = 0; i < N; i++) { const s = 0.65 + r() * 0.75; Q.setFromAxisAngle(UP, r() * 6.283); M4.compose(P.set(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]), Q, S3.set(s, s * (0.75 + r() * 0.6), s)); im.setMatrixAt(i, M4); const d = r(); C.setRGB(0.82 + d * 0.3, 0.86 + r() * 0.22, 0.68 + r() * 0.25); im.setColorAt(i, C); }
  im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; im.computeBoundingSphere();
  im.receiveShadow = true; im.castShadow = false; im.raycast = () => {}; im.userData.grass = true;
  return im;
}

function person(k, x, z, rot, y) {
  if (WATER_MASK && WATER_MASK.some(q => inPoly(x, z, q))) return;
  y = y || 0;
  const c = Math.cos(rot || 0), sn = Math.sin(rot || 0);
  const P = (dx, dz) => [x + dx * c - dz * sn, z + dx * sn + dz * c];
  let p = P(-0.11, 0); k.box('coat', p[0] - 0.07, p[0] + 0.07, y, y + 0.85, p[1] - 0.09, p[1] + 0.09);
  p = P(0.11, 0); k.box('coat', p[0] - 0.07, p[0] + 0.07, y, y + 0.85, p[1] - 0.09, p[1] + 0.09);
  const b = new THREE.CylinderGeometry(0.2, 0.27, 0.8, 10); b.translate(x, y + 1.24, z); k.geo(rand() < 0.5 ? 'coat' : 'kornBlue', b);
  const h = new THREE.SphereGeometry(0.13, 12, 10); h.translate(x, y + 1.76, z); k.geo('skin', h);
}
function lamp(k, x, z) {
  const p = new THREE.CylinderGeometry(0.07, 0.1, 4.6, 8); p.translate(x, 2.3, z); k.geo('frame', p);
  const h = new THREE.SphereGeometry(0.28, 16, 12); h.translate(x, 4.85, z); k.geo('lampHead', h);
}
function letterTexture(word, color, w, h, font) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const draw = () => { g.clearRect(0, 0, w, h); g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; font(g, word, w, h); tex.needsUpdate = true; };
  draw(); if (document.fonts && document.fonts.load) document.fonts.load('500 120px Jost').then(draw).catch(() => {});
  return tex;
}

/* ================= world: sky, sun, environment ================= */
const skyU = { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunColor: { value: new THREE.Color() }, time: { value: 0 }, night: { value: 0 }, glowCol: { value: new THREE.Color(0xff9a55) } };
const skyMat = new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
  fragmentShader: [
    'uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; uniform vec3 sunDir; uniform vec3 sunColor; uniform vec3 glowCol; uniform float time; uniform float night; varying vec3 vW;',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }',
    'float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.03 + vec2(17.0, 9.0); a *= 0.5; } return v; }',
    'void main(){',
    '  vec3 d = normalize(vW - cameraPosition); float h = d.y; vec3 sd = normalize(sunDir); float s = max(dot(d, sd), 0.0);',
    '  vec3 c = h > 0.0 ? mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.5)) : mix(horizon, bottom, pow(clamp(-h * 3.0, 0.0, 1.0), 0.6));',
    '  float lowSun = 1.0 - smoothstep(0.0, 0.45, sd.y);',
    '  c += glowCol * pow(s, 4.0) * 0.35 * lowSun * (1.0 - night) * smoothstep(-0.2, 0.25, h + 0.1);',
    '  c += sunColor * (pow(s, 8.0) * 0.22 + pow(s, 80.0) * 0.4);',
    '  if (h > 0.0) {',
    '    vec2 uv = d.xz / (h + 0.14) * 0.9 + vec2(time * 0.006, time * 0.0025);',
    '    float n = fbm(uv * 1.7); float n2 = fbm(uv * 4.3 + 3.1);',
    '    float cov = smoothstep(0.5, 0.82, n * 0.82 + n2 * 0.28) * smoothstep(0.0, 0.18, h);',
    '    float lit = 0.55 + 0.45 * clamp(sd.y * 2.0 + 0.3, 0.0, 1.0);',
    '    vec3 cl = mix(horizon * 0.9, vec3(1.0, 0.99, 0.97), lit) * (1.0 - 0.18 * n2);',
    '    cl += glowCol * lowSun * 0.45 * (1.0 - night) + sunColor * pow(s, 5.0) * 0.6;',
    '    cl = mix(cl, horizon * 0.35 + vec3(0.012, 0.014, 0.022), night);',
    '    c = mix(c, cl, cov * 0.88);',
    '    vec2 sp = floor(d.xz / (h + 0.25) * 260.0); float st = step(0.9975, hash(sp)) * (0.5 + 0.5 * hash(sp + 7.0));',
    '    c += vec3(st) * night * 0.9 * smoothstep(0.05, 0.35, h) * (1.0 - cov);',
    '  }',
    '  c += sunColor * pow(s, 900.0) * 4.0;',
    '  gl_FragColor = vec4(c, 1.0);',
    '#include <tonemapping_fragment>',
    '#include <colorspace_fragment>',
    '}'
  ].join('\n')
});
const skyMesh = new THREE.Mesh(new THREE.SphereGeometry(1800, 32, 16), skyMat); skyMesh.frustumCulled = false; skyMesh.renderOrder = -10; noAO.add(skyMesh);
const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), skyMat));
const pmrem = new THREE.PMREMGenerator(renderer);
let envRT = null;
function regenEnv() { const rt = pmrem.fromScene(envScene, 0.04); if (envRT) envRT.dispose(); envRT = rt; if (activeScene) activeScene.environment = rt.texture; }
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.castShadow = true; const SMAP = MOBILE ? 2048 : 4096; sun.shadow.mapSize.set(SMAP, SMAP);
sun.shadow.bias = -0.00025; sun.shadow.normalBias = 0.03;
const moon = new THREE.DirectionalLight(0x9db4ff, 0);
const lampPool = []; for (let i = 0; i < 4; i++) { const l = new THREE.PointLight(0xffc98a, 0, 30, 2); lampPool.push(l); }
const world = new THREE.Group(); world.add(skyMesh, hemi, sun, sun.target, moon, moon.target); lampPool.forEach(l => world.add(l));
function attachWorld(scene, center, span, sunDist) {
  scene.add(world);
  sun.target.position.copy(center); moon.target.position.copy(center);
  const c = sun.shadow.camera; c.left = -span; c.right = span; c.top = span; c.bottom = -span; c.near = 1; c.far = sunDist * 2.2; c.updateProjectionMatrix();
  W.center = center.clone(); W.sunDist = sunDist;
  scene.fog = scene.fog || new THREE.Fog(0xffffff, span * 4, span * 14);
}
const W = { center: new THREE.Vector3(), sunDist: 240 };

/* ================= sun for Dessau ================= */
const DATES = { dec: { doy: 338, note: 'opening day of the Bauhaus' }, mar: { doy: 80, note: 'spring equinox' }, jun: { doy: 172, note: 'midsummer' } };
let dateKey = 'mar', timeNow = 15.5;
function sunAt(doy, h) {
  const lat = 51.84 * D2R, lon = 12.23;
  const g = 2 * Math.PI / 365 * (doy - 1 + (h - 12) / 24);
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const tst = h * 60 + eqt + 4 * lon - 60, ha = (tst / 4 - 180) * D2R;
  const cz = clamp(Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha), -1, 1);
  const alt = Math.PI / 2 - Math.acos(cz);
  const az = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(lat) - Math.tan(decl) * Math.cos(lat)) + Math.PI;
  return { alt: alt, dir: new THREE.Vector3(Math.cos(alt) * Math.sin(az), Math.sin(alt), -Math.cos(alt) * Math.cos(az)) };
}
const LIGHT = { day: 1, night: 0 };
let envT = -99, envKey = '';
const C = {
  topN: new THREE.Color(0x0a1226), topD: new THREE.Color(0x3d78c2), horN: new THREE.Color(0x1a2338), horD: new THREE.Color(0xd7e3ec),
  tw: new THREE.Color(0xf0a06c), tw2: new THREE.Color(0x6a6fa0), botN: new THREE.Color(0x07090e), botD: new THREE.Color(0x40454c),
  sunLo: new THREE.Color(0xffa25e), sunHi: new THREE.Color(0xfff3e2), gnd: new THREE.Color(0x4a4a3e), disc: new THREE.Color(0xffdcae)
};
function applyLighting(t, force) {
  const s = sunAt(DATES[dateKey].doy, t), altD = s.alt / D2R;
  const day = sstep(-4, 8, altD), night = 1 - sstep(-9, 1, altD);
  LIGHT.day = day; LIGHT.night = night;
  sun.position.copy(W.center).addScaledVector(s.dir, W.sunDist);
  sun.intensity = 3.2 * day * (0.35 + 0.65 * sstep(0, 30, altD));
  sun.color.copy(C.sunLo).lerp(C.sunHi, sstep(2, 32, altD));
  moon.position.copy(W.center).addScaledVector(s.dir, -W.sunDist); moon.intensity = 0.35 * night;
  const tw = clamp(1 - Math.abs(altD - 2) / 12, 0, 1);
  skyU.top.value.copy(C.topN).lerp(C.topD, day).lerp(C.tw2, tw * 0.3);
  skyU.horizon.value.copy(C.horN).lerp(C.horD, day).lerp(C.tw, tw * 0.75);
  skyU.bottom.value.copy(C.botN).lerp(C.botD, day);
  skyU.sunDir.value.copy(s.dir); skyU.sunColor.value.copy(C.disc).multiplyScalar(day);
  if (activeScene && activeScene.fog) activeScene.fog.color.copy(skyU.horizon.value);
  hemi.color.copy(skyU.horizon.value); hemi.groundColor.copy(C.gnd); hemi.intensity = 0.08 + 0.25 * day;
  skyU.night.value = night;
  if (bloom) { bloom.threshold = 4.0 - 3.45 * night; bloom.strength = 0.18 + 0.55 * night; bloom.radius = 0.45 + 0.2 * night; }
  renderer.toneMappingExposure = 1.0 + 0.35 * night;
  const key = dateKey + (activeScene ? activeScene.uuid : '');
  if (force || Math.abs(t - envT) > 0.07 || envKey !== key) { regenEnv(); envT = t; envKey = key; }
  GLASSY.forEach(k => { const m = MAT[k]; m.emissive.copy(WARM).multiplyScalar(night * (m.userData.glow || 0) * 0.8); m.opacity = Math.min(1, m.userData.op + night * 0.2 * (m.userData.glow || 0)); });
  CEIL.forEach(k => { MAT[k].emissive.copy(MAT[k].color).multiplyScalar(night * 0.9); });
  MAT.dark.emissive.copy(WARM).multiplyScalar(night * 0.7);
  MAT.lampHead.emissiveIntensity = 0.2 + night * 2.4;
  lampPool.forEach(l => { l.intensity = l.userData.on ? night * 25 : 0; });
  if (cur && cur.onLight) cur.onLight(night);
  return s;
}
function fmt(t) { let h = Math.floor(t), m = Math.round((t - h) * 60); if (m === 60) { h++; m = 0; } if (h >= 24) { h = 24; m = 0; } return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
function dayTimes() {
  const doy = DATES[dateKey].doy; let rise = 6, set = 18, noon = 12, best = -9, prev = sunAt(doy, 0).alt;
  for (let h = 0.05; h <= 24; h += 0.05) { const a = sunAt(doy, h).alt; if (prev < 0 && a >= 0) rise = h; if (prev >= 0 && a < 0) set = h; if (a > best) { best = a; noon = h; } prev = a; }
  return [['morning', rise + 1.3], ['midday', noon], ['evening', set - 0.7], ['night', Math.min(set + 3, 23.6)]];
}

/* ================= plinth helper ================= */
function plinth(scene, x0, x1, z0, z1, depth, under) {
  const c = document.createElement('canvas'); c.width = 16; c.height = 256; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#3a2f27'); gr.addColorStop(0.1, '#4d3f33'); gr.addColorStop(0.12, '#8b7a62'); gr.addColorStop(0.55, '#7a6b57'); gr.addColorStop(1, '#5d5246');
  g.fillStyle = gr; g.fillRect(0, 0, 16, 256); g.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = 40; y < 256; y += 18 + Math.random() * 20) g.fillRect(0, y, 16, 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const w = x1 - x0, d = z1 - z0;
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, depth, d), new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }));
  m.position.set((x0 + x1) / 2, -0.12 - depth / 2, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m);
  const sc = document.createElement('canvas'); sc.width = sc.height = 256; const sg = sc.getContext('2d');
  const rg = sg.createRadialGradient(128, 128, 40, 128, 128, 128); rg.addColorStop(0, 'rgba(0,0,0,0.5)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
  sg.fillStyle = rg; sg.fillRect(0, 0, 256, 256);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.9, d * 1.9), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.set((x0 + x1) / 2, -depth - (under || 6), (z0 + z1) / 2); sh.userData.noAO = true; scene.add(sh); noAO.add(sh);
}
function registerNoAO(root) { root.traverse(o => { if (o.userData && o.userData.noAO) noAO.add(o); }); }

/* ================================================================
   BUILDINGS
   Each builder returns { scene, center, span, sunDist, facts, views }
   ================================================================ */
const BUILT = {};
const BUILDING_LOADS = new Map();



/* ---------- 3. Rathaus ---------- */
function gableRoof(k, m, x0, x1, z0, z1, y, h, alongX, tag) {
  const w = alongX ? (z1 - z0) : (x1 - x0), L = alongX ? (x1 - x0) : (z1 - z0);
  const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, h); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: L, bevelEnabled: false });
  g.translate(0, 0, -L / 2);
  if (alongX) g.rotateY(Math.PI / 2);
  g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  k.geo(m, g, tag);
}






/* ---------- shared pieces for the three churches ---------- */
/* real surroundings for a scene: neighbouring buildings, streets, green areas and water from the map data, in the scene's frame */
const _DECL = {};
function decL(key) { return _DECL[key] || (_DECL[key] = decodeLayer(MAPDATA[key])); }
function toLocalFn(lid) { const l = LMS.find(q => q.id === lid), al = ALIGN[lid] || [0, false], th = al[0] * D2R, c = Math.cos(th), s = Math.sin(th);
  return q => { const vx = q[0] - l.x, vz = q[1] - l.z, x = vx * c - vz * s, z = vx * s + vz * c; return [al[1] ? -x : x, z]; }; }
function polyArea(q) { let a = 0; for (let i = 0; i < q.length; i++) { const p = q[i], r = q[(i + 1) % q.length]; a += p[0] * r[1] - r[0] * p[1]; } return Math.abs(a / 2); }
function clipSeg(a, b, P) { let t0 = 0, t1 = 1; const dx = b[0] - a[0], dz = b[1] - a[1];
  for (const [p, q] of [[-dx, a[0] - P.x0], [dx, P.x1 - a[0]], [-dz, a[1] - P.z0], [dz, P.z1 - a[1]]]) { if (p === 0) { if (q < 0) return null; continue; } const r = q / p; if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; } }
  return [[a[0] + t0 * dx, a[1] + t0 * dz], [a[0] + t1 * dx, a[1] + t1 * dz]]; }
function realContext(k, lid, P, opt) {
  opt = opt || {}; const loc = toLocalFn(lid), pad = 30, own = opt.own || [-1, 1, -1, 1];
  const near = q => q.some(p => p[0] > P.x0 - pad && p[0] < P.x1 + pad && p[1] > P.z0 - pad && p[1] < P.z1 + pad);
  const shapeOf = q => { const sh = new THREE.Shape(); q.forEach((p, i) => i ? sh.lineTo(p[0], -p[1]) : sh.moveTo(p[0], -p[1])); return sh; };
  const flat = (q, m, y) => { const g = new THREE.ShapeGeometry(shapeOf(q)); g.rotateX(-Math.PI / 2); g.translate(0, y, 0); k.geo(m, g, 'context'); };
  const inOwn = p => p[0] > own[0] && p[0] < own[1] && p[1] > own[2] && p[1] < own[3];
  // green areas, with trees in parks and woods
  const trees = [];
  closedRings(decL('green')).forEach(o => { const q = o.p.map(loc); if (!near(q)) return; const cq = clipRect(q, P); if (cq.length < 3) return; flat(cq, o.c === 'F' ? 'lawnDry' in MAT ? 'lawnDry' : 'lawn' : 'lawn', 0.025);
    if (o.c === 'f' || o.c === 'g' || o.c === 'c') { const ar = polyArea(cq), n = Math.min(40, Math.round(ar / (o.c === 'f' ? 160 : 420))); let xs = cq.map(p => p[0]), zs = cq.map(p => p[1]); const bx = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
      for (let i = 0, tries = 0; i < n && tries < n * 6; tries++) { const x = bx[0] + rand() * (bx[1] - bx[0]), z = bx[2] + rand() * (bx[3] - bx[2]); if (!inPoly(x, z, cq) || inOwn([x, z])) continue; trees.push([x, z]); i++; } } });
  // water
  addWater(k, closedRings(decL('water')).map(o => clipRect(o.p.map(loc), P)).filter(q => q.length > 2), 0.06, 'context');
  // streets at their real widths
  const W = { m: 16, p: 13, s: 11, t: 9, r: 7, w: 5 };
  ['streets', 'roads'].forEach(key => decL(key).forEach(o => { const q = o.p.map(loc); if (!near(q)) return; const w = W[o.c] || 7;
    for (let i = 1; i < q.length; i++) { const s = clipSeg(q[i - 1], q[i], P); if (!s) continue; const L = Math.hypot(s[1][0] - s[0][0], s[1][1] - s[0][1]); if (L < 0.2) continue; if (inOwn([(s[0][0] + s[1][0]) / 2, (s[0][1] + s[1][1]) / 2])) continue; if (opt.skipPt && opt.skipPt([(s[0][0] + s[1][0]) / 2, (s[0][1] + s[1][1]) / 2])) continue;
      rotBox(k, o.c === 'w' ? 'paving' : 'asphalt', L + w * 0.6, 0.06, w, (s[0][0] + s[1][0]) / 2, 0.04 + (o.c === 'w' ? 0.005 : 0), (s[0][1] + s[1][1]) / 2, Math.atan2(-(s[1][1] - s[0][1]), s[1][0] - s[0][0]), 'context'); } }));
  // neighbouring buildings, extruded to heights that suit their size
  const MATS = ['cream', 'white', 'lyzRender', 'luisYellow', 'whiteInt', 'cream'];
  closedRings(decL('bld')).forEach((o, idx) => { let q = o.p.map(loc); if (!near(q)) return; if (q.some(inOwn) || inPoly(0, 0, q)) return;
    if (q.length > 3 && Math.abs(q[0][0] - q[q.length - 1][0]) < 0.5 && Math.abs(q[0][1] - q[q.length - 1][1]) < 0.5) q = q.slice(0, -1);
    if (opt.skip && opt.skip(q)) return; const cq = clipRect(q, P); if (cq.length < 3) return; const ar = polyArea(cq); if (ar < 12) return;
    const h = opt.height ? opt.height(ar) : (ar < 60 ? 3.6 : ar < 220 ? 8.5 : ar < 700 ? 12 : 15.5);
    const g = new THREE.ExtrudeGeometry(shapeOf(cq), { depth: h, bevelEnabled: false }); g.rotateX(-Math.PI / 2); k.geo(MATS[idx % MATS.length], g, 'context');
    const r = new THREE.ShapeGeometry(shapeOf(cq)); r.rotateX(-Math.PI / 2); r.translate(0, h + 0.02, 0); k.geo(ar < 220 ? 'tilesRed' : 'concrete', r, 'context');
    for (let i = 0; i < cq.length; i++) { const a = cq[i], b = cq[(i + 1) % cq.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 3 || h < 6) continue; const tx = (b[0] - a[0]) / L, tz = (b[1] - a[1]) / L, n = Math.floor(L / 3.2), ang = Math.atan2(-tz, tx);
      for (let j = 0; j < n; j++) { const t = (j + 0.5) / n; for (let y = 2.2; y < h - 1.5; y += 3.3) rotBox(k, 'glassDark', 1.1, 1.5, 0.08, a[0] + (b[0] - a[0]) * t + tz * 0.04, y + 0.75, a[1] + (b[1] - a[1]) * t - tx * 0.04, ang, 'context'); } } });
  // trees after the buildings, so none stands inside a house
  const blds = closedRings(decL('bld')).map(o => o.p.map(loc)).filter(near);
  trees.forEach(t => { if (opt.skipPt && opt.skipPt(t)) return; if (!blds.some(q => inPoly(t[0], t[1], q))) tree(k, t[0], t[1], 0.9 + rand() * 0.4); });
}

function pointedShape(w, h) { const s = new THREE.Shape(), hs = h - w * 0.8; s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, hs); s.quadraticCurveTo(w / 2, hs + w * 0.55, 0, h); s.quadraticCurveTo(-w / 2, hs + w * 0.55, -w / 2, hs); s.closePath(); return s; }
// a pointed window or door lying in the plane x = plane (axis 'x') or z = plane (axis 'z'), facing sd, centred at c
function gothWin(k, axis, plane, sd, c, y0, w, h, tag, glass, frame) {
  const put = (g, off) => { if (axis === 'z') { if (sd < 0) g.rotateY(Math.PI); g.translate(c, y0, plane + sd * off); } else { g.rotateY(sd > 0 ? Math.PI / 2 : -Math.PI / 2); g.translate(plane + sd * off, y0, c); } return g; };
  const f = new THREE.ShapeGeometry(pointedShape(w + 0.5, h + 0.35), 8); f.translate(0, -0.15, 0); k.geo(frame || 'stoneLight', put(f, 0.03), tag);
  k.geo(glass || 'glassDark', put(new THREE.ShapeGeometry(pointedShape(w, h), 8), 0.05), tag);
  if (w > 1.5 && !glass) { const m = new THREE.PlaneGeometry(0.12, h - w * 0.5); m.translate(0, (h - w * 0.5) / 2, 0); k.geo(frame || 'stoneLight', put(m, 0.07), tag); }
}
function pinnacle(k, m, x, y, z, h, r, tag) { const c = new THREE.ConeGeometry(r, h, 4); c.rotateY(Math.PI / 4); c.translate(x, y + h / 2, z); k.geo(m, c, tag); }
// a crow-stepped gable on the end wall at plane, spanning width w about c, from y0 with height h
function steppedGable(k, m, axis, plane, sd, c, w, y0, h, steps, tag, panel) {
  const s = new THREE.Shape(), sw = w / (2 * steps + 1), sh = h / (steps + 1); s.moveTo(-w / 2, 0);
  for (let i = 0; i <= steps; i++) { const x = -w / 2 + i * sw; s.lineTo(x, (i + 1) * sh); s.lineTo(x + sw, (i + 1) * sh); }
  for (let i = steps - 1; i >= 0; i--) { const x = w / 2 - i * sw; s.lineTo(x - sw, (i + 1) * sh); s.lineTo(x, (i + 1) * sh); }
  s.lineTo(w / 2, 0); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.8, bevelEnabled: false });
  if (axis === 'z') { if (sd < 0) g.rotateY(Math.PI); g.translate(c, y0, plane - sd * 0.8 + sd * 0.8); } else { g.rotateY(sd > 0 ? Math.PI / 2 : -Math.PI / 2); g.translate(plane, y0, c); }
  k.geo(m, g, tag);
  if (panel) for (let i = -steps; i <= steps; i++) { const ph = (steps + 1 - Math.abs(i)) * sh - 1.2; if (ph < 1.2) continue; gothWin(k, axis, plane, sd, c + i * sw * (axis === 'x' && sd > 0 ? -1 : 1) * (axis === 'z' && sd < 0 ? -1 : 1), y0 + 0.4, sw * 0.55, ph, tag, panel, panel); }
}
function clockFaces(k, cx, cy, cz, half, r, face, hand, tag) {
  [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(d => { const g = new THREE.CircleGeometry(r, 28), ang = Math.atan2(d[0], d[1]); g.rotateY(ang); g.translate(cx + d[0] * (half + 0.05), cy, cz + d[1] * (half + 0.05)); k.geo(face, g, tag);
    [[0.08, r * 0.55, 0.6], [0.06, r * 0.8, -1.9]].forEach(hd => { const p = new THREE.PlaneGeometry(hd[0] * 2, hd[1]); p.translate(0, hd[1] / 2, 0); p.rotateZ(hd[2]); p.rotateY(ang); p.translate(cx + d[0] * (half + 0.08), cy, cz + d[1] * (half + 0.08)); k.geo(hand, p, tag); }); });
}
function townHouses(k, list) { list.forEach(h => { k.box(h[5] || 'cream', h[0], h[1], 0, h[4], h[2], h[3]); k.geo(h[6] || 'tilesRed', prism(h[0] - 0.3, h[1] + 0.3, h[2] - 0.3, h[3] + 0.3, h[4], h[4] + 4.5, (h[1] - h[0]) > (h[3] - h[2]) ? 1.5 : (h[1] - h[0]) / 2, (h[1] - h[0]) > (h[3] - h[2]) ? (h[3] - h[2]) / 2 : 1.5));
  const along = (h[1] - h[0]) > (h[3] - h[2]); for (let a = (along ? h[0] : h[2]) + 1.6; a < (along ? h[1] : h[3]) - 1; a += 2.8) [[1.4, 3.2], [4.4, 6.2]].forEach(f => { if (f[1] > h[4] - 0.6) return; [-1, 1].forEach(sd => { if (along) k.winZ(sd > 0 ? h[3] : h[2], sd, a - 0.55, a + 0.55, f[0], f[1], { frame: 'whiteInt' }); else k.winX(sd > 0 ? h[1] : h[0], sd, a - 0.55, a + 0.55, f[0], f[1], { frame: 'whiteInt' }); }); }); }); }

/* ---------- St. Petri, Wörlitz: Romanesque church of about 1200, rebuilt in Tudor Gothic 1805–09 ---------- */





/* ---------- 5. Hauptbahnhof ---------- */
/* helpers carried over from the updated building set */
function extrudeXZ(k, m, pts, y0, y1, tag, hole) {
  const sh = new THREE.Shape(); pts.forEach((q, i) => i ? sh.lineTo(q[0], -q[1]) : sh.moveTo(q[0], -q[1]));
  if (hole) { const h = new THREE.Path(); hole.forEach((q, i) => i ? h.lineTo(q[0], -q[1]) : h.moveTo(q[0], -q[1])); sh.holes.push(h); }
  const g = new THREE.ExtrudeGeometry(sh, { depth: y1 - y0, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); k.geo(m, g, tag);
}
function lineSpan(poly, p, d) {   // the stretch of the line p + t·d that lies inside the polygon around t = 0
  let lo = -Infinity, hi = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[j], e = [poly[i][0] - a[0], poly[i][1] - a[1]], den = d[0] * e[1] - d[1] * e[0]; if (Math.abs(den) < 1e-9) continue;
    const w = [a[0] - p[0], a[1] - p[1]], t = (w[0] * e[1] - w[1] * e[0]) / den, s = (w[0] * d[1] - w[1] * d[0]) / den;
    if (s < 0 || s > 1) continue; if (t < 0) lo = Math.max(lo, t); else hi = Math.min(hi, t);
  }
  return (isFinite(lo) && isFinite(hi)) ? [lo, hi] : null;
}
function polyGeoU(points) {
  const pos = []; for (let i = 1; i < points.length - 1; i++) [points[0], points[i], points[i + 1]].forEach(p => pos.push(p[0], p[1], p[2]));
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
}
function ptInPoly(x, z, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
function rod3U(k, m, a, b, r, tag) { const A = new THREE.Vector3().fromArray(a), B = new THREE.Vector3().fromArray(b), d = B.clone().sub(A); const g = new THREE.CylinderGeometry(r || 0.05, r || 0.05, d.length(), 6); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())); const mm = A.clone().add(B).multiplyScalar(0.5); g.translate(mm.x, mm.y, mm.z); k.geo(m, g, tag); }
function signMesh(text, w, h, bg, fg, part) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w); const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); g.fillStyle = fg; g.font = 'bold ' + Math.round(c.height * 0.62) + 'px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, c.width / 2, c.height * 0.54);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 })); m.userData.part = part; return m;
}
function superEll(cx, cz, rx, rz, n, p) { const out = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); out.push([cx + rx * Math.sign(c) * Math.pow(Math.abs(c), 2 / p), cz + rz * Math.sign(s) * Math.pow(Math.abs(s), 2 / p)]); } return out; }
function tubeU(k, m, pts, r, tag) { const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3().fromArray(p))); const g = new THREE.TubeGeometry(c, pts.length * 4, r || 0.1, 10, false); k.geo(m, g, tag); }
function ubaPlan() {
  const S = 0.21, ax = u => (u - 1175) * S, az = v => (v - 565) * S, W = 9.5;
  const V = q => new THREE.Vector3(ax(q[0]), 0, az(q[1]));
  // centre line of the office snake: from the west wing's end at the Forum, north and round the loop, back down the east side, then west along the south
  const SNAKE = [[1162, 480], [1186, 395], [1222, 322], [1282, 252], [1360, 200], [1450, 165], [1528, 160], [1566, 190], [1558, 235], [1510, 262], [1430, 284],
    [1352, 312], [1300, 355], [1278, 425], [1272, 520], [1268, 620], [1255, 700], [1222, 770], [1160, 808], [1070, 818], [990, 820]];
  const curve = new THREE.CatmullRomCurve3(SNAKE.map(V), false, 'centripetal');
  const pts = curve.getSpacedPoints(150).map(p => [p.x, p.z]);
  const nor = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [-dz / l, dx / l]; });   // points into the courtyard
  const inner = pts.map((p, i) => [p[0] + nor[i][0] * W / 2, p[1] + nor[i][1] * W / 2]), outer = pts.map((p, i) => [p[0] - nor[i][0] * W / 2, p[1] - nor[i][1] * W / 2]);
  const court = inner.concat([outer[0]]);              // atrium plus Forum, closed on the west by the Forum's glass facade
  const axis = new THREE.CatmullRomCurve3([[1095, 720], [1150, 580], [1200, 480], [1234, 400], [1268, 332], [1330, 274], [1420, 234], [1500, 213], [1538, 206]].map(V), false, 'centripetal');
  const E = [ax(1420), az(642)];                       // the round extension
  return { S, ax, az, W, pts, nor, inner, outer, court, axis, E, forumEdge: [inner[inner.length - 1], outer[0]] };
}

function colonnadeU(k, m, xs, z, y0, h, r, tag) { xs.forEach(x => { const c = new THREE.CylinderGeometry(r || 0.45, r || 0.45, h, 16); c.translate(x, y0 + h / 2, z); k.geo(m, c, tag); }); }
function pedimentU(k, m, x0, x1, y, h, z, depth, tag) { const sh = new THREE.Shape(), w = x1 - x0; sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, h); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: depth || 0.6, bevelEnabled: false }); g.translate((x0 + x1) / 2, y, z); k.geo(m, g, tag); }
function winGridU(k, face, c, s, a0, a1, step, floors, w, opt) { for (let a = a0; a <= a1; a += step) floors.forEach(f => { if (face === 'z') k.winZ(c, s, a - w / 2, a + w / 2, f[0], f[1], opt); else k.winX(c, s, a - w / 2, a + w / 2, f[0], f[1], opt); }); }
function yHouseU(k, cx, cz, rot, tag) {
  // hexagonal concrete core (slipform) – hex rotated to match each tower
  const core = new THREE.CylinderGeometry(6.2, 6.2, 43.5, 6); core.rotateY(rot); core.translate(cx, 21.75, cz); k.geo('panelGrey', core, tag);
  // skip-stop lift shaft on every 3rd floor: a glazed slot on the south face of the core
  for (let f = 1; f < 14; f += 3) {
    const y0 = f * 3.0 + 0.3, y1 = y0 + 2.2;
    const g = new THREE.PlaneGeometry(1.2, y1 - y0); g.rotateY(rot); g.translate(cx + Math.cos(rot) * 6.18, (y0 + y1) / 2, cz - Math.sin(rot) * 6.18); k.geo('glassDark', g, tag);
  }
  // three prefabricated wings at 120° – coloured loggia privacy panels
  const COLORS = ['bauRed', 'bauYellow', 'bauBlue'];
  for (let i = 0; i < 3; i++) {
    const a = rot + i * Math.PI * 2 / 3, dx = Math.cos(a), dz = -Math.sin(a), L = 18, Wd = 11.5, mid = 4.5 + L / 2;
    rotBox(k, 'panelGrey', L, 41, Wd, cx + dx * mid, 20.5, cz + dz * mid, a, tag);
    // roof slab per wing
    rotBox(k, 'panelGrey', L + 0.4, 0.6, Wd + 0.4, cx + dx * mid, 41.1, cz + dz * mid, a, tag);
    // windows both sides, loggias (inset 0.6 m) with coloured panel
    for (let f = 0; f < 14; f++) {
      const y = 2.2 + f * 2.8;
      [-1, 1].forEach(sd => {
        const ox = -dz * sd * (Wd / 2 + 0.03), oz = dx * sd * (Wd / 2 + 0.03);
        rotBox(k, 'dark', L - 1.2, 1.35, 0.06, cx + dx * mid + ox, y, cz + dz * mid + oz, a, tag);
        rotBox(k, 'whiteInt', L - 1.2, 0.08, 0.1, cx + dx * mid + ox, y - 0.68, cz + dz * mid + oz, a, tag);
      });
      // recessed loggia slab and coloured panel on the outboard face of each wing
      const ex = cx + dx * (4.5 + L + 0.03), ez = cz + dz * (4.5 + L + 0.03);
      rotBox(k, 'dark', 0.06, 1.35, 3.2, ex, y, ez, a, tag);
      // coloured privacy panel on loggia (every floor)
      const panMat = COLORS[i];
      const logX = cx + dx * (4.5 + L - 1.0), logZ = cz + dz * (4.5 + L - 1.0);
      const pg = new THREE.PlaneGeometry(2.6, 0.9); pg.rotateY(a); pg.translate(logX, y + 0.6, logZ); k.geo(panMat, pg, tag);
    }
  }
  // rooftop mechanical room + antena mast
  const mk = new THREE.BoxGeometry(4, 2.4, 4); mk.translate(cx, 44.7, cz); k.geo('panelGrey', mk, tag);
  const ant = new THREE.CylinderGeometry(0.06, 0.06, 5, 6); ant.translate(cx, 48.1, cz); k.geo('steel', ant, tag);
  // glazed ground-floor entrance foyer (each wing tip)
  for (let i = 0; i < 3; i++) {
    const a = rot + i * Math.PI * 2 / 3, dx = Math.cos(a), dz = -Math.sin(a);
    const fx = cx + dx * (4.5 + 18.5), fz = cz + dz * (4.5 + 18.5);
    rotBox(k, 'glassDark', 4, 3.8, 3, fx, 1.9, fz, a, tag);
    rotBox(k, 'frame', 4.1, 0.12, 3.1, fx, 1.9, fz, a, tag);
  }
}

/* real water inside a scene: OpenStreetMap lakes and ponds around the landmark, turned into the scene's frame and clipped to its ground */
let WATER_MASK = null;
function clipRect(poly, P) {
  let out = poly;
  [[0, P.x0, 1], [0, P.x1, -1], [1, P.z0, 1], [1, P.z1, -1]].forEach(([ax, v, sg]) => { const inp = out; out = []; if (!inp.length) return;
    for (let i = 0; i < inp.length; i++) { const a = inp[i], b = inp[(i + 1) % inp.length], ia = sg * (a[ax] - v) >= 0, ib = sg * (b[ax] - v) >= 0;
      if (ia) out.push(a); if (ia !== ib) { const t = (v - a[ax]) / (b[ax] - a[ax]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); } } });
  return out;
}
function realWaterLocal(lid, P) {
  const l = LMS.find(q => q.id === lid); if (!l || !MAPDATA.water) return [];
  const al = ALIGN[lid] || [0, false], th = al[0] * D2R, c = Math.cos(th), s = Math.sin(th);
  const loc = q => { const vx = q[0] - l.x, vz = q[1] - l.z, x = vx * c - vz * s, z = vx * s + vz * c; return [al[1] ? -x : x, z]; };
  return closedRings(decodeLayer(MAPDATA.water)).map(o => clipRect(o.p.map(loc), P)).filter(q => q.length > 2);
}
function addWater(k, polys, y, tag) {
  polys.forEach(q => { const sh = new THREE.Shape(); q.forEach((p, i) => i ? sh.lineTo(p[0], -p[1]) : sh.moveTo(p[0], -p[1]));
    const bed = new THREE.ShapeGeometry(sh); bed.rotateX(-Math.PI / 2); bed.translate(0, y - 0.04, 0); k.geo('sand', bed, tag);
    const w = new THREE.ShapeGeometry(sh); w.rotateX(-Math.PI / 2); w.translate(0, y, 0); k.geo('water', w, tag); });
}



let HBF_CLOCK = null;
let RATHAUS_CLOCK = null;
let LYZ_CLOCK = null;
function drawClock(t) { [HBF_CLOCK, LYZ_CLOCK, RATHAUS_CLOCK].forEach(c => { if (c) drawClockOn(c, t); }); }
function drawClockOn(CK, t) {
  const g = CK.canvas.getContext('2d');
  g.fillStyle = '#f6f4ee'; g.fillRect(0, 0, 256, 256); g.save(); g.translate(128, 128);
  g.fillStyle = '#222'; for (let i = 0; i < 12; i++) { g.save(); g.rotate(i * Math.PI / 6); g.fillRect(-5, -122, 10, i % 3 === 0 ? 34 : 24); g.restore(); }
  const h = Math.floor(t) % 12, m = (t - Math.floor(t)) * 60;
  g.lineCap = 'round'; g.strokeStyle = '#222';
  g.save(); g.rotate((h + m / 60) * Math.PI / 6); g.lineWidth = 11; g.beginPath(); g.moveTo(0, 12); g.lineTo(0, -62); g.stroke(); g.restore();
  g.save(); g.rotate(m * Math.PI / 30); g.lineWidth = 7; g.beginPath(); g.moveTo(0, 16); g.lineTo(0, -96); g.stroke(); g.restore();
  g.restore(); CK.tex.needsUpdate = true;
}



/* ---------- 8. Masters' Houses ---------- */
function cube(k, m, x0, x1, z0, z1, h, tag, isNew) {
  k.box('grey', x0 + 0.15, x1 - 0.15, 0, 0.6, z0 + 0.15, z1 - 0.15, tag);
  k.box(m, x0, x1, 0.6, h, z0, z1, tag); k.box(m, x0, x1, h, h + 0.5, z0, z0 + 0.25, tag); k.box(m, x0, x1, h, h + 0.5, z1 - 0.25, z1, tag);
  k.box(m, x0, x0 + 0.25, h, h + 0.5, z0, z1, tag); k.box(m, x1 - 0.25, x1, h, h + 0.5, z0, z1, tag); k.box('roof', x0 + 0.25, x1 - 0.25, h, h + 0.05, z0 + 0.25, z1 - 0.25);
}
function win(k, face, c, a0, a1, y0, y1, tag, isNew, o) {
  o = o || {};
  if (isNew) { if (face === 'z') k.paneZ('frost', c + (o.s || 1) * 0.03, y0, y1, a0, a1, tag); else k.paneX('frost', c + (o.s || 1) * 0.03, y0, y1, a0, a1, tag); return; }
  const opt = { mull: o.mull || 0.9, trans: o.trans, tag: tag, frame: 'frame' };
  if (face === 'z') k.winZ(c, o.s || 1, a0, a1, y0, y1, opt); else k.winX(c, o.s || 1, a0, a1, y0, y1, opt);
}
function doubleHouse(k, cx, tagW, tagE, newE, tagLink) {
  const H = 8.2;
  const W = [cx - 11, cx - 2, -2, 7], Ec = [cx + 2, cx + 11, -5, 4];
  const half = (b, mat, nw, tg) => {
    cube(k, mat, b[0], b[1], b[2], b[3], H, tg, nw);
    win(k, 'z', b[2], b[0] + 1.2, b[1] - 1.2, 4.4, 7.6, tg, nw, { s: -1, mull: 1.1, trans: [6.0] });
    win(k, 'z', b[2], b[0] + 1.0, b[0] + 3.4, 1.4, 3.2, tg, nw, { s: -1 });
    win(k, 'z', b[3], b[0] + 1.0, b[0] + 4.2, 1.2, 3.4, tg, nw, { s: 1, mull: 1.0 });
    win(k, 'z', b[3], b[0] + 5.0, b[1] - 1.0, 4.6, 6.8, tg, nw, { s: 1 });
    win(k, 'x', b[0], b[2] + 1.0, b[2] + 1.9, 1.4, 7.6, tg, nw, { s: -1, trans: [3.2, 4.8, 6.4] });
    win(k, 'x', b[1], b[3] - 3.6, b[3] - 1.2, 4.6, 6.8, tg, nw, { s: 1 });
    k.box(mat, b[0] + 4.8, b[1] - 0.6, 3.9, 4.1, b[3], b[3] + 1.6, tg);
    if (!nw) rails(k, 'frame', [[b[0] + 4.8, b[3] + 0.02], [b[0] + 4.8, b[3] + 1.58], [b[1] - 0.6, b[3] + 1.58], [b[1] - 0.6, b[3] + 0.02]], 4.1, [0.5, 1.0], tg);
    k.box('paving', b[0] - 0.5, b[1] + 0.5, 0, 0.12, b[3], b[3] + 3.2);
  };
  half(W, 'white', false, tagW);
  cube(k, 'white', cx - 4.2, cx + 4.2, -3.6, 5.2, 5.6, tagLink || tagW, false);
  if (newE) {
    k.part = 'new'; half(Ec, 'newWhite', true, tagE); k.part = '';
    k.part = 'v:orig'; half(Ec, 'white', false, tagE); k.part = '';
    k.part = 'v:rubbleM'; for (let i = 0; i < 10; i++) { const x = Ec[0] + rand() * 8, z = Ec[2] + rand() * 8; k.box('soot', x, x + 1 + rand() * 2, 0, 0.3 + rand() * 1.4, z, z + 1 + rand() * 2, tagE); } k.box('soot', Ec[0], Ec[0] + 0.4, 0, 3.5, Ec[2], Ec[3], tagE); k.part = '';
  } else half(Ec, 'white', false, tagE);
}
function gropiusHouse(k, gx, nw) {
  const m = nw ? 'newWhite' : 'white', tg = 'gropius';
  k.box(m, gx, gx + 16, 0.9, 3.6, -6, 6, tg); k.box(m, gx + 16, gx + 22, 0.9, 3.6, -3, 6, tg);
  k.box(m, gx, gx + 14, 3.6, 6.6, -6, 2, tg); k.box(m, gx, gx + 4, 3.6, 6.6, 2, 10, tg);
  [[gx + 0.3, 9.6], [gx + 3.7, 9.6]].forEach(q => k.box(m, q[0] - 0.2, q[0] + 0.2, 0.9, 3.6, q[1] - 0.2, q[1] + 0.2, tg));
  k.box('paving', gx - 0.5, gx + 16, 0.9, 1.0, 6, 11, tg);
  k.box('roof', gx + 0.2, gx + 13.8, 6.6, 6.65, -5.8, 1.8); k.box('roof', gx + 4, gx + 21.8, 3.6, 3.65, 2, 5.8); k.box('roof', gx + 14, gx + 21.8, 3.6, 3.65, -2.8, 2);
  win(k, 'z', -6, gx + 1, gx + 13, 4.4, 6.0, tg, nw, { s: -1 }); win(k, 'z', -6, gx + 5, gx + 9, 1.4, 3.0, tg, nw, { s: -1 });
  win(k, 'z', 6, gx + 6, gx + 15, 1.4, 3.2, tg, nw, { s: 1 }); win(k, 'z', 10, gx + 0.5, gx + 3.5, 4.2, 6.0, tg, nw, { s: 1 });
  win(k, 'x', gx, -4, 0, 4.2, 6.0, tg, nw, { s: -1 }); win(k, 'x', gx + 22, -1, 4, 1.4, 3.0, tg, nw, { s: 1 });
  k.box(m, gx + 6.4, gx + 9.4, 3.0, 3.2, -8, -6, tg);
}


/* ================================================================
   MORE LANDMARKS: Tiergarten bridge, Mausoleum, Y-houses, Junkers museum,
   natural history museum, Georgium, Luisium, Mosigkau, Wörlitz, Johannbau
   ================================================================ */
function rotBox(k, m, w, h, d, x, y, z, ang, tag) { const g = mbox(w, h, d); g.rotateY(ang); g.translate(x, y, z); k.geo(m, g, tag); }
function tube(k, m, pts, r, tag) { const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2]))); k.geo(m, new THREE.TubeGeometry(c, Math.max(24, pts.length * 8), r, 8, false), tag); }
function rod3(k, m, a, b, r, tag) { const A = new THREE.Vector3().fromArray(a), B = new THREE.Vector3().fromArray(b), d = B.clone().sub(A); const g = new THREE.CylinderGeometry(r, r, d.length(), 6); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())); const mm = A.clone().add(B).multiplyScalar(0.5); g.translate(mm.x, mm.y, mm.z); k.geo(m, g, tag); }
function colonnade(k, m, xs, z, y0, h, r, tag) { xs.forEach(x => { const c = new THREE.CylinderGeometry(r, r * 1.1, h, 14); c.translate(x, y0 + h / 2, z); k.geo(m, c, tag); k.box(m, x - r * 1.4, x + r * 1.4, y0 + h - 0.35, y0 + h, z - r * 1.4, z + r * 1.4, tag); k.box(m, x - r * 1.4, x + r * 1.4, y0, y0 + 0.3, z - r * 1.4, z + r * 1.4, tag); }); }
function pediment(k, m, x0, x1, y, h, z, depth, tag) { const sh = new THREE.Shape(); sh.moveTo(x0, 0); sh.lineTo(x1, 0); sh.lineTo((x0 + x1) / 2, h); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false }); g.translate(0, y, z - depth); k.geo(m, g, tag); }
function winGrid(k, face, c, s, a0, a1, step, floors, w, opt) { for (let a = a0; a <= a1 + 0.01; a += step) floors.forEach(f => { const o = Object.assign({ frame: 'whiteInt' }, opt || {}); if (face === 'z') k.winZ(c, s, a - w / 2, a + w / 2, f[0], f[1], o); else k.winX(c, s, a - w / 2, a + w / 2, f[0], f[1], o); }); }
function parkGround(k, P, mat) { k.box(mat || 'lawn', P.x0, P.x1, -0.12, 0, P.z0, P.z1); }
function hedgeRow(k, x0, x1, z0, z1, h, tag) { k.box('hedge', x0, x1, 0, h || 1.1, z0, z1, tag); }


/* ---------- the Ducal Mausoleum, after photographs ---------- */
function bear(k, x, y, z, ang, tag) {
  const m = new THREE.Matrix4().makeRotationY(ang).setPosition(x, y, z), add = g => { g.applyMatrix4(m); k.geo('bronzeDark', g, tag); };
  const body = new THREE.SphereGeometry(1, 16, 12); body.scale(1.35, 0.78, 0.68); body.translate(0, 1.35, 0); add(body);
  const head = new THREE.SphereGeometry(0.5, 14, 10); head.scale(1.2, 0.95, 0.9); head.translate(1.5, 1.55, 0); add(head);
  const snout = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 10); snout.rotateZ(Math.PI / 2); snout.translate(2.05, 1.45, 0); add(snout);
  [[-0.2, 0.32], [-0.2, -0.32]].forEach(e => { const ear = new THREE.SphereGeometry(0.14, 8, 6); ear.translate(1.35, 1.98, e[1]); add(ear); });
  [[0.8, 0.35], [0.8, -0.35], [-0.85, 0.35], [-0.85, -0.35]].forEach(l => { const g = new THREE.CylinderGeometry(0.2, 0.24, 1.05, 10); g.translate(l[0], 0.52, l[1]); add(g); });
}


/* ---------- Umweltbundesamt (German Environment Agency), after aerial and ground photographs ---------- */
// a solid band of width w following a polyline [[x,z],...]; capped at the ends unless told otherwise
function bandAlong(k, pts, w, y0, y1, m, tag, capA, capB) {
  const n = pts.length, pos = [], uv = [];
  const nor = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [-dz / l, dx / l]; });
  const O = pts.map((p, i) => [p[0] + nor[i][0] * w / 2, p[1] + nor[i][1] * w / 2]), I = pts.map((p, i) => [p[0] - nor[i][0] * w / 2, p[1] - nor[i][1] * w / 2]);
  const quad = (a, b, c, d, want, u) => {
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const nn = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
    let q = [a, b, c, d], uu = u; if (nn[0] * want[0] + nn[1] * want[1] + nn[2] * want[2] < 0) { q = [a, d, c, b]; uu = [u[0], u[3], u[2], u[1]]; }
    [0, 1, 2, 0, 2, 3].forEach(i => { pos.push(q[i][0], q[i][1], q[i][2]); uv.push(uu[i][0], uu[i][1]); });
  };
  let s = 0;
  for (let i = 0; i < n - 1; i++) {
    const s1 = s + Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]), nm = [(nor[i][0] + nor[i + 1][0]) / 2, 0, (nor[i][1] + nor[i + 1][1]) / 2], wu = [[s, y0], [s1, y0], [s1, y1], [s, y1]];
    quad([O[i][0], y0, O[i][1]], [O[i + 1][0], y0, O[i + 1][1]], [O[i + 1][0], y1, O[i + 1][1]], [O[i][0], y1, O[i][1]], nm, wu);
    quad([I[i][0], y0, I[i][1]], [I[i + 1][0], y0, I[i + 1][1]], [I[i + 1][0], y1, I[i + 1][1]], [I[i][0], y1, I[i][1]], [-nm[0], 0, -nm[2]], wu);
    const tu = [[O[i][0], O[i][1]], [O[i + 1][0], O[i + 1][1]], [I[i + 1][0], I[i + 1][1]], [I[i][0], I[i][1]]];
    quad([O[i][0], y1, O[i][1]], [O[i + 1][0], y1, O[i + 1][1]], [I[i + 1][0], y1, I[i + 1][1]], [I[i][0], y1, I[i][1]], [0, 1, 0], tu);
    quad([O[i][0], y0, O[i][1]], [O[i + 1][0], y0, O[i + 1][1]], [I[i + 1][0], y0, I[i + 1][1]], [I[i][0], y0, I[i][1]], [0, -1, 0], tu);
    s = s1;
  }
  [[0, 1, capA], [n - 1, n - 2, capB]].forEach(([i, j, on]) => { if (on === false) return; quad([O[i][0], y0, O[i][1]], [I[i][0], y0, I[i][1]], [I[i][0], y1, I[i][1]], [O[i][0], y1, O[i][1]], [pts[i][0] - pts[j][0], 0, pts[i][1] - pts[j][1]], [[0, y0], [w, y0], [w, y1], [0, y1]]); });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals(); k.geo(m, g, tag);
}
// split a long band into chunks so the grass can still grow right up to the building
function bandChunks(k, pts, w, y0, y1, m, tag) { const C = 10; for (let i = 0; i < pts.length - 1; i += C) bandAlong(k, pts.slice(i, Math.min(pts.length, i + C + 1)), w, y0, y1, m, tag, i === 0, i + C >= pts.length - 1); }
function polyGeo(points) { // convex polygon of [x,y,z] points as a triangle fan
  const pos = []; for (let i = 1; i < points.length - 1; i++) [points[0], points[i], points[i + 1]].forEach(p => pos.push(p[0], p[1], p[2]));
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
}
const UBA_SPINE = () => new THREE.CatmullRomCurve3([[-120, 0, 30], [-62, 0, 20], [-2, 0, 3], [58, 0, -10], [118, 0, -5]].map(p => new THREE.Vector3(p[0], p[1], p[2])));
function ubaRing(spine, D, gap) {
  const S = t => { const p = spine.getPointAt(t), d = spine.getTangentAt(t); return { x: p.x, z: p.z, nx: -d.z, nz: d.x, tx: d.x, tz: d.z }; };
  const side = (t, sg) => { const s = S(t); return [s.x + sg * s.nx * D, s.z + sg * s.nz * D]; };
  const N = 70, out = [];
  if (gap) { for (let i = 0; i <= N; i++) { const t = gap[0] - gap[0] * i / N; out.push(side(t, -1)); } }
  else for (let i = 0; i <= N; i++) out.push(side(1 - i / N, -1));
  const s0 = S(0); for (let i = 1; i < 16; i++) { const a = i / 16 * Math.PI; out.push([s0.x + D * (-s0.nx * Math.cos(a) - s0.tx * Math.sin(a)), s0.z + D * (-s0.nz * Math.cos(a) - s0.tz * Math.sin(a))]); }
  for (let i = 0; i <= N; i++) out.push(side(i / N, 1));
  const s1 = S(1); for (let i = 1; i < 16; i++) { const a = i / 16 * Math.PI; out.push([s1.x + D * (s1.nx * Math.cos(a) + s1.tx * Math.sin(a)), s1.z + D * (s1.nz * Math.cos(a) + s1.tz * Math.sin(a))]); }
  const end = gap ? gap[1] : 0; for (let i = 0; i <= Math.round(N * (1 - end)); i++) out.push(side(1 - i / N, -1));
  return { pts: out, S };
}




/* ---------- the Y-houses at the Stadtpark ---------- */
function yHouse(k, cx, cz, rot, tag) {
  const core = new THREE.CylinderGeometry(6.2, 6.2, 43.5, 6); core.rotateY(rot); core.translate(cx, 21.75, cz); k.geo('panelGrey', core, tag);
  for (let i = 0; i < 3; i++) {
    const a = rot + i * Math.PI * 2 / 3, dx = Math.cos(a), dz = -Math.sin(a), L = 18, Wd = 11.5, mid = 4.5 + L / 2;
    rotBox(k, 'panelGrey', L, 41, Wd, cx + dx * mid, 20.5, cz + dz * mid, a, tag);
    rotBox(k, 'panelGrey', L + 0.4, 0.6, Wd + 0.4, cx + dx * mid, 41.1, cz + dz * mid, a, tag);
    for (let f = 0; f < 14; f++) { const y = 2.2 + f * 2.8; [-1, 1].forEach(sd => { const ox = -dz * sd * (Wd / 2 + 0.03), oz = dx * sd * (Wd / 2 + 0.03); rotBox(k, 'dark', L - 1.2, 1.35, 0.06, cx + dx * mid + ox, y, cz + dz * mid + oz, a, tag); rotBox(k, 'whiteInt', L - 1.2, 0.08, 0.1, cx + dx * mid + ox, y - 0.68, cz + dz * mid + oz, a, tag); }); }
    for (let f = 0; f < 14; f++) { const y = 2.2 + f * 2.8, ex = cx + dx * (4.5 + L + 0.03), ez = cz + dz * (4.5 + L + 0.03); rotBox(k, 'dark', 0.06, 1.35, 3.2, ex, y, ez, a, tag); }
  }
  k.box('panelGrey', cx - 2.5, cx + 2.5, 43.5, 46, cz - 2.5, cz + 2.5, tag);
}


/* ---------- Technikmuseum Hugo Junkers, with its Ju 52 ---------- */
function ju52(k, x, y, z, ang, tag) {
  const m = new THREE.Matrix4().makeRotationY(ang).setPosition(x, y, z);
  const add = (g, mat) => { g.applyMatrix4(m); k.geo(mat, g, tag); };
  const fus = new THREE.CylinderGeometry(0.9, 1.25, 12, 12); fus.rotateZ(Math.PI / 2); fus.scale(1, 1.15, 0.85); fus.translate(1.5, 2.2, 0); add(fus, 'corrugated');
  const tail = new THREE.CylinderGeometry(0.2, 0.9, 6.5, 10); tail.rotateZ(Math.PI / 2); tail.scale(1, 1.1, 0.75); tail.translate(-7.7, 2.5, 0); add(tail, 'corrugated');
  add(bx(-11, -8.6, 2.6, 5.6, -0.12, 0.12), 'corrugated'); add(bx(-11.2, -8.8, 2.6, 2.8, -4.5, 4.5), 'corrugated');
  add(bx(-0.5, 3.5, 1.4, 1.9, -14.6, 14.6), 'corrugated');
  add(bx(4.6, 6.0, 2.6, 3.4, -0.9, 0.9), 'glassDark');
  [[7.6, 2.2, 0], [1.6, 1.8, -5.2], [1.6, 1.8, 5.2]].forEach(e => { const n = new THREE.CylinderGeometry(0.75, 0.8, 1.8, 14); n.rotateZ(Math.PI / 2); n.translate(e[0], e[1], e[2]); add(n, 'iron'); for (let b = 0; b < 3; b++) { const p = bx(-0.05, 0.05, -1.4, 1.4, -0.12, 0.12); p.rotateX(b * Math.PI * 2 / 3); p.translate(e[0] + 1.0, e[1], e[2]); add(p, 'iron'); } });
  [-2.4, 2.4].forEach(zz => { const w = new THREE.CylinderGeometry(0.55, 0.55, 0.35, 16); w.rotateX(Math.PI / 2); w.translate(2.4, 0.55, zz); add(w, 'iron'); add(bx(2.3, 2.5, 0.55, 1.5, zz - 0.1, zz + 0.1), 'iron'); });
  const tw = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 12); tw.rotateX(Math.PI / 2); tw.translate(-9.5, 0.3, 0); add(tw, 'iron');
}










/* ================================================================
   MAP OF DESSAU
   ================================================================ */
const LMS = [
  { id: 'hbf', years: 'rebuilt by 1952', name: 'Hauptbahnhof', sub: 'Main station, since 1840', lat: 51.839972, lon: 12.234975, build: () => import('./buildings/hbf.js').then(({ buildHbf }) => buildHbf(BUILDING_CONTEXT)), label: 'Dessau Hauptbahnhof', meta: 'Railway station since 1840, rebuilt after 1945', lead: 'Dessau’s main station sits on lines to Berlin, Leipzig and Magdeburg. Click the numbers or the building to learn its story.' },
  { id: 'bauhaus', years: '1925–26', name: 'Bauhaus building', sub: 'Walter Gropius, 1926', lat: 51.839336, lon: 12.227008, build: () => import('./buildings/bauhaus.js').then(({ buildBauhaus }) => buildBauhaus(BUILDING_CONTEXT)), label: 'Bauhaus building', meta: 'Walter Gropius, 1925–26, UNESCO World Heritage', lead: 'The school building that made the Bauhaus famous, modelled from its published dimensions. Click a number, a wing or the glass to explore.' },
  { id: 'museum', years: '2016–19', name: 'Bauhaus Museum', sub: 'addenda architects, 2019', lat: 51.834491, lon: 12.242153, build: () => import('./buildings/museum.js').then(({ buildMuseum }) => buildMuseum(BUILDING_CONTEXT)), label: 'Bauhaus Museum Dessau', meta: 'addenda architects, opened 8 September 2019', lead: 'A glass hall with a black box floating inside, home to the Bauhaus Dessau Foundation’s collection.' },
  { id: 'rathaus', years: '1898–1901', name: 'Rathaus', sub: 'Reinhardt & Süßenguth, 1901', lat: 51.834554, lon: 12.246864, build: () => import('./buildings/rathaus.js').then(({ buildRathaus }) => buildRathaus(BUILDING_CONTEXT)), label: 'Rathaus Dessau', meta: 'Reinhardt & Süßenguth, 1898–1901, rebuilt 1949–52', lead: 'The town hall and its 73 m tower, the tallest in the city. Shown in its post-war form, with a flatter roof and no gables.' },
  { id: 'theater', years: '1935–38', name: 'Anhaltisches Theater', sub: 'Lipp & Roth, 1938', lat: 51.83683, lon: 12.237066, build: () => import('./buildings/theater.js').then(({ buildTheater }) => buildTheater(BUILDING_CONTEXT)), label: 'Anhaltisches Theater', meta: 'Friedrich Lipp and Werry Roth, 1935–38, rebuilt 1947–49', lead: 'Dessau’s large theatre on Friedensplatz, with one of Germany’s biggest revolving stages. The front is simplified in the model.' },
  { id: 'lyzeum', years: 'about 1912', name: 'Design faculty, Lyzeum', sub: 'Anhalt University, position approximate', lat: 51.840434, lon: 12.232238, build: () => import('./buildings/lyzeum.js').then(({ buildLyzeum }) => buildLyzeum(BUILDING_CONTEXT)), label: 'Lyzeum, Design faculty', meta: 'Hochschule Anhalt, Fachbereich Design, Schwabestraße 3', lead: 'A 1912 girls’ school that now houses the Design faculty of Anhalt University of Applied Sciences. Its map position is estimated from the campus layout.' },
  { id: 'meister', years: '1925–26', name: 'Masters’ Houses', sub: 'Walter Gropius, 1926', lat: 51.843122, lon: 12.221467, build: () => import('./buildings/meister.js').then(({ buildMeister }) => buildMeister(BUILDING_CONTEXT)), label: 'Masters’ Houses', meta: 'Walter Gropius, 1925–26, rebuilt in part 2014', lead: 'The houses of the Bauhaus director and masters on Ebertallee, shown as they stand today, with the 2014 reinterpretations of the lost Gropius and Moholy-Nagy houses.' },
  { id: 'johannbau', years: '1528–33', name: 'Johannbau', sub: 'Museum of town history', lat: 51.832473, lon: 12.247853, build: () => import('./buildings/johannbau.js').then(({ buildJohannbau }) => buildJohannbau(BUILDING_CONTEXT)), label: 'Johannbau, Museum für Stadtgeschichte', meta: 'Early Renaissance palace wing, 1528–33, museum since 2005', lead: 'The last surviving wing of the princes’ palace, now the museum of town history.' },
  { id: 'naturkunde', years: '1746–50', name: 'Natural history museum', sub: 'Leopold-Dank-Stift, 40 m tower', lat: 51.831279, lon: 12.242895, build: () => import('./buildings/naturkunde.js').then(({ buildNaturkunde }) => buildNaturkunde(BUILDING_CONTEXT)), label: 'Museum für Naturkunde und Vorgeschichte', meta: 'Founded 1927, in the Leopold-Dank-Stift of 1746–50', lead: 'Fossils, minerals and prehistory in a baroque foundation building with a 40-metre tower. Its front is simplified in the model.' },
  { id: 'yhouses', years: '1969–71', name: 'Y-houses', sub: 'GDR high-rises, position approximate', lat: 51.83374, lon: 12.238241, build: () => import('./buildings/yhouses.js').then(({ buildYHouses }) => buildYHouses(BUILDING_CONTEXT)), label: 'Y-Häuser', meta: 'Y-shaped high-rises at the Stadtpark, 1969–71', lead: 'Three 14-storey towers with a Y-shaped plan, a landmark of post-war modernism. Their exact spots are estimated.' },
  { id: 'bridge', years: '2000', name: 'Tiergarten bridge', sub: 'the “Eierschneider”, 2000', lat: 51.831548, lon: 12.249931, build: () => import('./buildings/bridge.js').then(({ buildBridge }) => buildBridge(BUILDING_CONTEXT)), label: 'Tiergartenbrücke, the “Eierschneider”', meta: 'Footbridge over the Mulde, 2000', lead: 'A curved footbridge under a leaning steel arch, nicknamed the egg slicer.' },
  { id: 'uba', years: '2005', name: 'Umweltbundesamt', sub: 'sauerbruch hutton, 2005', lat: 51.842443, lon: 12.239592, build: () => import('./buildings/uba.js').then(({ buildUBA }) => buildUBA(BUILDING_CONTEXT)), label: 'Umweltbundesamt (German Environment Agency)', meta: 'Sauerbruch Hutton, completed 2005', lead: 'A long, colourful office loop on the old gasworks site, built as a model of ecological construction.' },
  { id: 'raucher', years: '1969 · 2008', name: 'Räucherturm', sub: 'old smokehouse tower, lookout', lat: 51.834613, lon: 12.232641, build: () => import('./buildings/raucher.js').then(({ buildRaucher }) => buildRaucher(BUILDING_CONTEXT)), label: 'Alter Räucherturm', meta: 'Brewery, yeast factory and smokehouse tower; lookout since 2008', lead: 'The last remnant of a brewery, a yeast factory and a smokehouse, now a lookout you climb by an external steel stair. Its look is approximate.' },
  { id: 'hkw', years: '1994–96', name: 'Heizkraftwerk', sub: 'Stadtwerke Dessau power plant', lat: 51.827154, lon: 12.230522, build: () => import('./buildings/hkw.js').then(({ buildHKW }) => buildHKW(BUILDING_CONTEXT)), label: 'Heizkraftwerk Dessau (Stadtwerke)', meta: 'Combined heat and power plant, coal-free since 2019', lead: 'The plant that heats much of Dessau and makes electricity at the same time, with a chimney seen across the city. The buildings are simplified.' },
  { id: 'mausoleum', years: '1894–98', name: 'Mausoleum', sub: 'Franz Heinrich Schwechten, 1898', lat: 51.845129, lon: 12.235829, build: () => import('./buildings/mausoleum.js').then(({ buildMausoleum }) => buildMausoleum(BUILDING_CONTEXT)), label: 'Ducal Mausoleum', meta: 'Franz Heinrich Schwechten, 1894–98', lead: 'The domed burial place of the dukes of Anhalt, on the axis of the Georgium.' },
  { id: 'georgium', years: '1780', name: 'Schloss Georgium', sub: 'Erdmannsdorff, 1780', lat: 51.844225, lon: 12.230304, build: () => import('./buildings/georgium.js').then(({ buildGeorgium }) => buildGeorgium(BUILDING_CONTEXT)), label: 'Schloss Georgium', meta: 'Friedrich Wilhelm von Erdmannsdorff, from 1780', lead: 'A neoclassical country house in a landscape park, home of the Anhalt picture gallery.' },
  { id: 'junkers', years: '2001', name: 'Junkers museum', sub: 'Technikmuseum Hugo Junkers', lat: 51.835474, lon: 12.207943, build: () => import('./buildings/junkers.js').then(({ buildJunkers }) => buildJunkers(BUILDING_CONTEXT)), label: 'Technikmuseum Hugo Junkers', meta: 'Opened 2001 on the former Junkers works site', lead: 'Aviation and engineering on the old Junkers site, with a Ju 52 recovered from a Norwegian lake.' },
  { id: 'luisium', years: '1774–78', name: 'Luisium', sub: 'Erdmannsdorff, 1774–78', lat: 51.850711, lon: 12.272089, build: () => import('./buildings/luisium.js').then(({ buildLuisium }) => buildLuisium(BUILDING_CONTEXT)), label: 'Luisium', meta: 'Friedrich Wilhelm von Erdmannsdorff, 1774–78', lead: 'A small country house in an English garden, built for Princess Louise.' },
  { id: 'mosigkau', years: '1752–57', name: 'Schloss Mosigkau', sub: 'Rococo, 1752–57', lat: 51.806003, lon: 12.150862, build: () => import('./buildings/mosigkau.js').then(({ buildMosigkau }) => buildMosigkau(BUILDING_CONTEXT)), label: 'Schloss Mosigkau', meta: 'Summer residence of Princess Anna Wilhelmine, 1752–57', lead: 'A Rococo summer palace and garden, often called Little Sanssouci.' },
  { id: 'woerlitz', years: '1769–73', name: 'Wörlitz', sub: 'Garden Realm, 13 km east', lat: 51.846007, lon: 12.42126, build: () => import('./buildings/woerlitz.js').then(({ buildWoerlitz }) => buildWoerlitz(BUILDING_CONTEXT)), label: 'Wörlitz, Garden Realm Dessau-Wörlitz', meta: 'Palace 1769–73, park and lake, UNESCO since 2000', lead: 'The heart of the Garden Realm: Germany’s first neoclassical palace, a lake with a little volcano and the Gothic House.' },
  { id: 'rcenter', years: 'opened 1995', name: 'Rathaus-Center', sub: 'Shopping centre, 1995', lat: 51.834167, lon: 12.244722, build: () => import('./buildings/rcenter.js').then(({ buildRathausCenter }) => buildRathausCenter(BUILDING_CONTEXT)), label: 'Rathaus-Center Dessau', meta: 'Shopping centre on Kavalierstraße, opened September 1995', lead: 'The city’s largest shopping centre, between the town hall and the Stadtpark. The roof plan follows aerial imagery; facades are approximate. Click the numbers to learn its story.' },
  { id: 'dcenter', years: 'opened 2009', name: 'Dessau-Center', sub: 'Shopping centre, 2009', lat: 51.830278, lon: 12.243333, build: () => import('./buildings/dcenter.js').then(({ buildDessauCenter }) => buildDessauCenter(BUILDING_CONTEXT)), label: 'Dessau-Center', meta: 'Shopping centre at the Museumskreuzung, opened 2 May 2009', lead: 'A red shopping centre with a round membrane disc floating over its corner entrance at the Museumskreuzung. The street fronts follow photos; the car park behind is schematic. Click the numbers to learn its story.' },
  { id: 'propstei', years: '1854–58', name: 'St. Peter und Paul', sub: 'Catholic provost church, 1858', lat: 51.839041, lon: 12.245536, build: () => import('./buildings/propstei.js').then(({ buildPropstei }) => buildPropstei(BUILDING_CONTEXT)), label: 'Propsteikirche St. Peter und Paul', meta: 'Neo-Gothic church by Vinzenz Statz, 1854–58; rebuilt 1951–58', lead: 'Dessau’s Catholic provost church, with its 41-metre brick spire. The footprint follows OpenStreetMap and the facades follow photographs. Click the numbers to learn its story.' },
  { id: 'marien', years: '1506–23', name: 'Marienkirche', sub: 'Late Gothic hall church', lat: 51.833532, lon: 12.24699, build: () => import('./buildings/marien.js').then(({ buildMarien }) => buildMarien(BUILDING_CONTEXT)), label: 'Marienkirche Dessau', meta: 'Palace and town church, 1506–23; tower 1551–54; rebuilt 1989–98', lead: 'The former palace and town church beside the Johannbau, burnt out in 1945 and rebuilt as a venue. The footprint follows OpenStreetMap and the facades follow photographs. Click the numbers to learn its story.' },
  { id: 'petri', years: 'c. 1200–1809', name: 'St. Petri, Wörlitz', sub: 'Bible tower, 66 m', lat: 51.844831, lon: 12.421936, build: () => import('./buildings/petri.js').then(({ buildPetri }) => buildPetri(BUILDING_CONTEXT)), label: 'St. Petri church, Wörlitz', meta: 'Romanesque church of about 1200, rebuilt in Tudor Gothic 1805–09; Bible tower since 1994', lead: 'The town church of Wörlitz at the edge of the park, with its 66-metre tower. The footprint follows OpenStreetMap and the facades follow photographs. Click the numbers to learn its story.' },
  { id: 'kornhaus', years: '1929–30', name: 'Kornhaus', sub: 'Carl Fieger, 1930', lat: 51.856445, lon: 12.216982, build: () => import('./buildings/kornhaus.js').then(({ buildKornhaus }) => buildKornhaus(BUILDING_CONTEXT)), label: 'Kornhaus', meta: 'Carl Fieger, 1929–30, on the Elbe', lead: 'A Bauhaus restaurant and dance hall on the Elbe dyke, shaped like a steamboat.' }
];
const LAT0 = 51.840, LON0 = 12.235, MX = Math.cos(LAT0 * D2R) * 111320, MZ = 110540;
LMS.forEach(l => { l.x = (l.lon - LON0) * MX; l.z = -(l.lat - LAT0) * MZ; });
const MAP = { x0: -7200, x1: 14200, z0: -4200, z1: 5600 }, MS = 0.1;
const ELBE = [[13466,-4168],[12802,-3973],[12374,-3753],[12111,-3432],[12040,-3161],[11914,-2924],[11659,-2695],[11293,-2553],[10571,-2574],[10270,-2455],[10056,-2061],[10074,-1301],[9999,-1053],[9705,-835],[9366,-741],[8968,-778],[8614,-899],[8498,-1000],[8261,-1402],[7978,-2135],[7787,-2393],[7566,-2583],[7137,-2820],[6549,-2992],[6162,-3174],[5957,-3419],[5893,-3571],[5774,-4243],[4246,-4489],[3647,-4155],[3282,-3810],[3045,-3737],[2476,-3828],[1885,-4162],[1172,-4419],[54,-4544],[-189,-4496],[-312,-4415],[-487,-4174],[-520,-3909],[-237,-2864],[-221,-2569],[-324,-2285],[-418,-2170],[-668,-1954],[-798,-1910],[-1016,-1885],[-1337,-1931],[-1614,-2089],[-1774,-2288],[-1872,-2525],[-1895,-2855],[-1790,-3367],[-1794,-3856],[-1956,-4127],[-2205,-4260],[-2350,-4269],[-2789,-4230],[-3243,-4055],[-3410,-4052],[-3784,-3918],[-4839,-3732],[-5095,-3710],[-5718,-3779],[-7391,-3410]];
const MULDE = [[4161,5927],[4200,5810],[4184,5687],[4127,5622],[4021,5582],[3532,5643],[3318,5565],[3269,5452],[3299,5298],[3535,4977],[3566,4877],[3543,4765],[3428,4579],[3309,4458],[3161,4404],[3002,4400],[2547,4545],[2346,4460],[2220,4314],[2096,3943],[1926,3633],[1938,3499],[2099,3155],[2053,2887],[1919,2772],[1323,2639],[1084,2422],[1076,2273],[1323,1851],[1334,1719],[1227,1624],[912,1514],[762,1390],[750,1260],[960,982],[1127,855],[1228,539],[1327,393],[1437,321],[1798,202],[1870,101],[1955,-232],[1931,-398],[1835,-568],[1662,-730],[1375,-917],[1308,-1024],[1315,-1149],[1385,-1280],[1635,-1512],[1671,-1726],[1620,-1921],[1335,-2351],[904,-2686],[887,-2803],[935,-2993],[1156,-3254],[1162,-3351],[1111,-3440],[874,-3563],[650,-3901],[527,-3959],[339,-3861],[173,-3549],[-200,-3313],[-323,-3165]];
const RAIL1 = [[-120, 1700], [-40, 800], [0, 0], [60, -900], [120, -1800], [170, -2900]];
const RAIL2 = [[0, 0], [-500, 650], [-1100, 1250], [-2600, 2300], [-4600, 3400], [-7200, 4600]];
const RAIL3 = [[0, 0], [600, -150], [2600, 100], [5500, 350], [8500, 250], [11000, 100], [12700, 120]];
const ROADS = [
  { n: 'Gropiusallee', p: [[-580, -1100], [-575, -300], [-570, 400], [-560, 1300]] },
  { n: 'Kornhausstraße', p: [[-575, -800], [-850, -1250], [-1100, -1600], [-1240, -1760]] },
  { n: 'Ebertallee', p: [[-575, -290], [-800, -320], [-1150, -380], [-1500, -430]] },
  { n: 'Kavalierstraße', p: [[440, 150], [455, 700], [470, 1400]] },
  { n: 'Zerbster Straße', p: [[880, 250], [885, 800], [890, 1500]] },
  { n: 'Fritz-Hesse-Straße', p: [[-430, 900], [70, 60], [240, -800]] },
  { n: '', p: [[-575, 30], [-60, 30]] }, { n: '', p: [[70, 60], [440, 300], [880, 420], [1400, 520]] }, { n: '', p: [[-2400, 200], [-1200, 160], [-575, 120]] },
  { n: '', p: [[455, 1000], [880, 1000], [1450, 1050]] }, { n: '', p: [[-570, 700], [-40, 760], [455, 760]] },
  { n: 'Kühnauer Straße', p: [[-575, 120], [-1200, 260], [-1813, 330], [-3200, 200]] }, { n: '', p: [[880, 420], [1600, 300], [2552, -1100]] }, { n: '', p: [[1400, 520], [4000, 600], [8000, 400], [12886, -100]] }, { n: '', p: [[-430, 900], [-2500, 2400], [-5800, 3790]] }
];
const PARKS = [ { n: 'Stadtpark', poly: [[390, 650], [720, 650], [740, 1060], [400, 1080]] }, { n: '', poly: [[-1160, -335], [-840, -300], [-840, -200], [-1160, -230]] }, { n: 'Georgium', poly: [[-650, -1500], [250, -1600], [260, -380], [-150, -330], [-640, -420]] }, { n: 'Tiergarten', poly: [[1080, 300], [2100, 250], [2300, 1900], [1150, 2000]] }, { n: 'Luisium', poly: [[2250, -1450], [2850, -1450], [2850, -900], [2250, -900]] }, { n: 'Wörlitz park', poly: [[11800, -1500], [13800, -1600], [14000, 300], [11900, 400]] }, { n: 'Mosigkau', poly: [[-6000, 3700], [-5600, 3700], [-5600, 4050], [-6000, 4050]] }, { n: 'Mosigkauer Heide', poly: [[-7200, 4400], [-4200, 4300], [-3800, 5600], [-7200, 5600]] } ];
function distSeg(px, pz, ax, az, bx2, bz) { const dx = bx2 - ax, dz = bz - az, l = dx * dx + dz * dz; let t = l ? ((px - ax) * dx + (pz - az) * dz) / l : 0; t = clamp(t, 0, 1); return Math.hypot(px - ax - t * dx, pz - az - t * dz); }
function distLine(px, pz, line) { let d = 1e9; for (let i = 0; i < line.length - 1; i++) d = Math.min(d, distSeg(px, pz, line[i][0], line[i][1], line[i + 1][0], line[i + 1][1])); return d; }
function inPoly(px, pz, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if (((a[1] > pz) !== (b[1] > pz)) && (px < (b[0] - a[0]) * (pz - a[1]) / (b[1] - a[1]) + a[0])) c = !c; } return c; }
// real map data from OpenStreetMap (© OpenStreetMap contributors, ODbL), compressed: every line is delta-encoded whole metres
let MAPDATA;
function decodeLayer(str) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', V = {}; for (let i = 0; i < 64; i++) V[A[i]] = i;
  const out = []; if (!str) return out;
  str.split('.').forEach(f => { if (f.length < 2) return; const nums = []; let v = 0, sh = 0;
    for (let i = 1; i < f.length; i++) { const d = V[f[i]]; if (d >= 32) { v += (d - 32) * Math.pow(2, sh); sh += 5; } else { v += d * Math.pow(2, sh); nums.push(v % 2 ? -(v + 1) / 2 : v / 2); v = 0; sh = 0; } }
    const pts = []; let x = 0, z = 0; for (let i = 0; i + 1 < nums.length; i += 2) { x += nums[i]; z += nums[i + 1]; pts.push([x, z]); }
    if (pts.length > 1) out.push({ c: f[0], p: pts }); });
  return out;
}
// areas stored as several open pieces (multipolygon members) are joined end to end; pieces that never close are left out
function closedRings(feats) {
  const out = [], near = (a, b) => Math.abs(a[0] - b[0]) < 4 && Math.abs(a[1] - b[1]) < 4; let ch = null;
  const flush = () => { if (ch && ch.p.length > 3 && near(ch.p[0], ch.p[ch.p.length - 1])) out.push(ch); ch = null; };
  feats.forEach(f => { const p = f.p, closed = near(p[0], p[p.length - 1]);
    if (closed) { flush(); out.push(f); return; }
    if (ch && ch.c === f.c) { const e = ch.p[ch.p.length - 1];
      if (near(e, p[0])) ch.p = ch.p.concat(p.slice(1)); else if (near(e, p[p.length - 1])) ch.p = ch.p.concat(p.slice(0, -1).reverse());
      else if (near(ch.p[0], p[p.length - 1])) ch.p = p.slice(0, -1).concat(ch.p); else if (near(ch.p[0], p[0])) ch.p = p.slice(1).reverse().concat(ch.p);
      else { flush(); ch = { c: f.c, p: p.slice() }; }
    } else { flush(); ch = { c: f.c, p: p.slice() }; }
    if (ch && near(ch.p[0], ch.p[ch.p.length - 1]) && ch.p.length > 3) flush(); });
  flush(); return out;
}
function drawMap() {
  const Wm = MAP.x1 - MAP.x0, Hm = MAP.z1 - MAP.z0, N = MOBILE ? 4096 : 6144, NZ = Math.round(N * Hm / Wm), c = document.createElement('canvas'); c.width = N; c.height = NZ; const g = c.getContext('2d');
  const sx = x => (x - MAP.x0) / Wm * N, sz = z => (z - MAP.z0) / Hm * NZ, sl = m => m / Wm * N;
  const path = pts => { g.beginPath(); g.moveTo(sx(pts[0][0]), sz(pts[0][1])); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, mz = (pts[i][1] + pts[i + 1][1]) / 2; g.quadraticCurveTo(sx(pts[i][0]), sz(pts[i][1]), sx(mx), sz(mz)); } const l = pts[pts.length - 1]; g.lineTo(sx(l[0]), sz(l[1])); };
  const line = pts => { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(sx(q[0]), sz(q[1])) : g.moveTo(sx(q[0]), sz(q[1]))); };
  const area = pts => { line(pts); g.closePath(); };
  g.fillStyle = '#ebe6da'; g.fillRect(0, 0, N, NZ);
  for (let i = 0; i < 16000; i++) { g.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.03) + ')'; g.fillRect(Math.random() * N, Math.random() * NZ, 2, 2); }
  g.lineCap = 'round'; g.lineJoin = 'round';
  const real = !!MAPDATA.roads;
  if (real) {
    const GREEN = { F: '#e4e0c8', m: '#d8dfba', g: '#c9d5ad', a: '#cdd4ab', c: '#c3ceaa', f: '#adbf8f' };
    const green = closedRings(decodeLayer(MAPDATA.green)); ['F', 'm', 'a', 'g', 'c', 'f'].forEach(k => { g.fillStyle = GREEN[k]; green.forEach(o => { if (o.c === k) { area(o.p); g.fill(); } }); });
    g.fillStyle = '#9fb3c2'; closedRings(decodeLayer(MAPDATA.water)).forEach(o => { area(o.p); g.fill(); });
  } else {
    { const lk = [[12760, -1030, 760, 230]]; lk.forEach(l => { g.fillStyle = '#9fb3c2'; g.beginPath(); g.ellipse(sx(l[0]), sz(l[1]), sl(l[2]), sl(l[3]), -0.15, 0, 7); g.fill(); }); }
    g.strokeStyle = '#d3dbbd'; g.lineWidth = sl(1000); path(ELBE); g.stroke(); g.strokeStyle = '#d3dbbd'; g.lineWidth = sl(360); path(MULDE); g.stroke();
    PARKS.forEach(p => { g.fillStyle = p.n === 'Mosigkauer Heide' ? '#b7c79c' : '#c9d5ad'; g.beginPath(); p.poly.forEach((q, i) => i ? g.lineTo(sx(q[0]), sz(q[1])) : g.moveTo(sx(q[0]), sz(q[1]))); g.closePath(); g.fill(); });
  }
  g.strokeStyle = '#9fb3c2'; g.lineWidth = sl(real ? 140 : 170); path(ELBE); g.stroke();
  g.strokeStyle = '#9fb3c2'; g.lineWidth = sl(real ? 45 : 55); path(MULDE); g.stroke();
  if (real) {
    g.fillStyle = '#d5cdbf'; g.strokeStyle = '#c3baa9'; g.lineWidth = Math.max(1, sl(1.2)); decodeLayer(MAPDATA.bld).forEach(o => { area(o.p); g.fill(); g.stroke(); });
    const st = decodeLayer(MAPDATA.streets); g.strokeStyle = '#d9d1c2'; st.forEach(o => { g.lineWidth = sl(o.c === 'w' ? 7 : 11); line(o.p); g.stroke(); });
    st.forEach(o => { g.strokeStyle = o.c === 'w' ? '#f7f3ea' : '#ffffff'; g.lineWidth = sl(o.c === 'w' ? 5 : 8); line(o.p); g.stroke(); });
    const rd = decodeLayer(MAPDATA.roads), W = { t: 12, s: 15, p: 18, m: 22 }, FILL = { t: '#ffffff', s: '#fffbea', p: '#fff3cf', m: '#fbe2ad' };
    ['t', 's', 'p', 'm'].forEach(k => { g.strokeStyle = '#c9bfad'; g.lineWidth = sl(W[k] + 5); rd.forEach(o => { if (o.c === k) { line(o.p); g.stroke(); } }); g.strokeStyle = FILL[k]; g.lineWidth = sl(W[k]); rd.forEach(o => { if (o.c === k) { line(o.p); g.stroke(); } }); });
    const rl = decodeLayer(MAPDATA.rail);
    rl.forEach(o => { if (o.c !== 'R') return; g.strokeStyle = '#55595e'; g.lineWidth = sl(8); line(o.p); g.stroke(); g.strokeStyle = '#ebe6da'; g.setLineDash([sl(28), sl(28)]); g.lineWidth = sl(3.4); line(o.p); g.stroke(); g.setLineDash([]); });
    rl.forEach(o => { if (o.c !== 'T') return; g.strokeStyle = '#8a7a8e'; g.lineWidth = sl(3); line(o.p); g.stroke(); });
  } else {
    const zones = [[-1900, -950, -400, 1500], [-950, 1300, -700, 1500], [-500, 300, -1300, -700], [-3800, -1900, -100, 900], [1300, 2400, -900, 700], [-6300, -5300, 3300, 4200], [12100, 13300, 0, 700], [2200, 3200, -700, -200], [-2600, -1300, 1500, 2600]];
    const rr = mulberry(7);
    zones.forEach(zn => { for (let x = zn[0]; x < zn[1]; x += 105) for (let z = zn[2]; z < zn[3]; z += 95) { const cx = x + 52, cz = z + 47; if (rr() < 0.18) continue; if (distLine(cx, cz, ELBE) < 520 || distLine(cx, cz, MULDE) < 230) continue; if (distLine(cx, cz, RAIL1) < 70 || distLine(cx, cz, RAIL2) < 60 || distLine(cx, cz, RAIL3) < 50) continue; if (PARKS.some(p => inPoly(cx, cz, p.poly))) continue; if (LMS.some(l => Math.hypot(cx - l.x, cz - l.z) < 110)) continue; const w = 60 + rr() * 30, d = 50 + rr() * 30, t = 205 + rr() * 18; g.fillStyle = 'rgb(' + (t | 0) + ',' + ((t - 6) | 0) + ',' + ((t - 16) | 0) + ')'; g.fillRect(sx(cx - w / 2), sz(cz - d / 2), sl(w), sl(d)); } });
    ROADS.forEach(r => { g.strokeStyle = '#ffffff'; g.lineWidth = sl(r.n ? 26 : 18); path(r.p); g.stroke(); });
    [RAIL1, RAIL2, RAIL3].forEach(r => { g.strokeStyle = '#4f5257'; g.lineWidth = sl(16); path(r); g.stroke(); g.strokeStyle = '#ebe6da'; g.setLineDash([sl(40), sl(40)]); g.lineWidth = sl(7); path(r); g.stroke(); g.setLineDash([]); });
  }
  g.fillStyle = '#5c6f7e'; g.font = 'italic 500 ' + Math.round(sl(90)) + 'px Jost, Futura, Arial, sans-serif'; g.textAlign = 'center';
  g.save(); g.translate(sx(400), sz(-2380)); g.rotate(-0.1); g.fillText('Elbe', 0, 0); g.restore(); g.save(); g.translate(sx(7600), sz(-3240)); g.fillText('Elbe', 0, 0); g.restore();
  g.save(); g.translate(sx(1420), sz(-700)); g.rotate(-1.5); g.fillText('Mulde', 0, 0); g.restore(); g.save(); g.translate(sx(2500), sz(3500)); g.rotate(-1.0); g.fillText('Mulde', 0, 0); g.restore();
  g.fillText('Wörlitzer See', sx(12700), sz(-1010));
  g.fillStyle = '#6a7350'; g.font = '500 ' + Math.round(sl(48)) + 'px Jost, Futura, Arial, sans-serif'; g.fillText('Stadtpark', sx(565), sz(880));
  g.font = '500 ' + Math.round(sl(90)) + 'px Jost, Futura, Arial, sans-serif'; [['Georgium', -250, -1300], ['Tiergarten', 1700, 1500], ['Mosigkauer Heide', -5600, 5100], ['Wörlitzer Park', 13450, -1250], ['Mosigkau', -5800, 3550], ['Wörlitz', 12780, -120], ['Roßlau', 300, -3700], ['Kühnau', -2900, -350]].forEach(t => g.fillText(t[0], sx(t[1]), sz(t[2])));
  g.font = '500 ' + Math.round(sl(48)) + 'px Jost, Futura, Arial, sans-serif';
  g.fillStyle = '#6e6a63'; g.font = '500 ' + Math.round(sl(36)) + 'px Jost, Futura, Arial, sans-serif';
  if (!MAPDATA.labels) ROADS.forEach(r => { if (!r.n) return; const a = r.p[0], b = r.p[1]; const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2; g.save(); g.translate(sx(mx), sz(mz)); let ang = Math.atan2(sz(b[1]) - sz(a[1]), sx(b[0]) - sx(a[0])); if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI; g.rotate(ang); g.fillText(r.n, 0, -sl(22)); g.restore(); });
  if (MAPDATA.labels) { g.fillStyle = '#6e6a63'; g.font = '500 ' + Math.round(sl(30)) + 'px Jost, Futura, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    MAPDATA.labels.forEach(l => { g.save(); g.translate(sx(l[1]), sz(l[2])); let a = l[3]; if (a > Math.PI / 2) a -= Math.PI; if (a < -Math.PI / 2) a += Math.PI; g.rotate(a); g.fillText(l[0], 0, 0); g.restore(); }); }
  g.fillStyle = 'rgba(80,80,80,0.75)'; g.font = '400 ' + Math.round(sl(26)) + 'px Jost, Arial, sans-serif'; g.textAlign = 'right'; g.textBaseline = 'alphabetic'; if (real) g.fillText('Map data © OpenStreetMap contributors', N - sl(60), NZ - sl(40));
  return c;
}
function token(id) {
  const k = new Kit(); k.noGrass = true;
  if (id === 'hbf') { k.box('stationRed', -50, 64, 0, 12.6, 3, 19); k.box('stationRed', -15, 15, 0, 20, 7, 25); k.box('cream', -15.5, 15.5, 20, 20.6, 6.5, 25.5); k.box('canopy', -60, 60, 4, 4.4, -26, -2); k.box('train', -40, 39, 0.7, 4.1, -13.4, -10.6); k.box('ballast', -80, 80, 0, 0.3, -30, 2); }
  else if (id === 'bauhaus') { k.box('glassDark', 0, 18, 0, 14.6, 0, 46); k.box('white', 6.5, 18, 5.5, 14.6, -18.6, 0); k.box('white', -14.2, 18, 0, 14, -34.6, -18.6); k.box('white', 18, 49.5, 0, 8, 0.5, 12.5); k.box('white', 49.5, 61.8, 0, 19.5, -1, 17.1); k.box('grey', 0.45, 7.6, 0, 16.3, 45.6, 50); }
  else if (id === 'museum') { k.box('museumGlass', -52.5, 52.5, 0, 12, -12.5, 12.5); k.box('blackbox', -50, 50, 5, 11.3, -9, 9); k.box('white', -52.7, 52.7, 11.6, 12.1, -12.7, 12.7); }
  else if (id === 'rathaus') { k.box('stone', -30, 30, 0, 18.5, -24, -12); k.box('stone', -30, 30, 0, 18.5, 12, 24); k.box('stone', -30, -18, 0, 18.5, -12, 12); k.box('stone', 18, 30, 0, 18.5, -12, 12); k.box('stone', -16.5, -7.5, 0, 41, -24.5, -15.5); const d = new THREE.ConeGeometry(4, 30, 8); d.translate(-12, 56, -20); k.geo('copper', d); }
  else if (id === 'theater') { k.box('renderWarm', -30, 30, 0, 17, 0, 18); k.box('renderWarm', -46, 46, 0, 14, 6, 60); k.box('renderWarm', -30, 30, 0, 21, 18, 55); k.box('renderWarm', -22, 22, 0, 34, 55, 82); k.box('renderWarm', -44, 44, 0, 17, 55, 82); k.box('stoneLight', -23, 23, 1, 16.6, -8, 0); }
  else if (id === 'lyzeum') { k.box('lyzRender', -22, 22, 0, 14.4, -9, 9); k.box('lyzRender', 8, 22, 0, 14.4, 9, 21); k.box('lyzRender', 6, 22, 0, 14.4, -9.8, -9); k.box('lyzRender', -36, -22, 0, 9.2, 1, 14); k.geo('tilesRed', prism(-22.4, 22.4, -9.4, 9.4, 14.4, 22.4, 9.4, 9.4)); k.box('slate', 0.4, 3.6, 20, 26.5, -1.6, 1.6); const d = new THREE.SphereGeometry(1.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2); d.translate(2, 28.7, 0); k.geo('domeDark', d); }
  else if (id === 'meister') { [[-91, -71], [-41, -21], [9, 29]].forEach(q => { k.box('white', q[0], q[0] + 9, 0, 8.7, -2, 7); k.box('white', q[1], q[1] + 9, 0, 8.7, -5, 4); }); k.box('newWhite', 62, 84, 0, 6.6, -6, 6); }
  else if (id === 'bridge') { k.geo('lawn', prism(30, 74, -40, 40, 0, 4.8, 9, 0)); k.geo('lawn', prism(-74, -30, -40, 40, 0, 4.8, 9, 0)); k.box('steelWhite', -54, 54, 4.8, 6, -2, 2); const a = []; for (let i = 0; i <= 12; i++) { const t = i / 12; a.push([-36 + 72 * t, 6 + 17 * Math.sin(Math.PI * t), -3]); } tubeU(k, 'steelWhite', a, 0.9); k.box('water', -30, 30, 0, 0.2, -40, 40); }
  else if (id === 'uba') { const U = ubaPlan(); bandChunks(k, U.pts, U.W, 0, 15.6, 'larch'); extrudeXZ(k, 'glass', U.court, 15.2, 16.6); const c = new THREE.CylinderGeometry(1, 1, 16.4, 32); c.scale(17.8, 1, 12.5); c.translate(U.E[0], 8.2, U.E[1]); k.geo('pvPanel', c); }
  else if (id === 'raucher') { k.box('brick', -5.2, 5.2, 0, 25, -5.2, 5.2); k.box('iron', 5.4, 8.8, 0, 25, -4.2, 4.2); k.box('gravel', -24, 24, 0, 0.1, -20, 22); }
  else if (id === 'hkw') { k.box('panelGrey', -22, 8, 0, 36, -15, 15); k.box('steelWhite', 8, 52, 0, 19, -12, 12); const c = new THREE.CylinderGeometry(2.2, 3.6, 105, 16); c.translate(-36, 52.5, 26); k.geo('concrete', c); const b = new THREE.CylinderGeometry(2.3, 2.6, 18, 16); b.translate(-36, 94, 26); k.geo('bauRed', b); }
  else if (id === 'mausoleum') { k.box('sandstone', -15, 15, 0, 15, -16, 15); k.box('sandstone', -7.8, 7.8, 15, 26, -7.8, 7.8); const c = new THREE.CylinderGeometry(7.2, 7.2, 9, 24); c.translate(0, 30.5, 0); k.geo('sandstone', c); const d = new THREE.SphereGeometry(7, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2); d.scale(1, 0.85, 1); d.translate(0, 35, 0); k.geo('domeBronze', d); k.box('blackstone', -11, 11, 0, 1.4, -28, -16); }
  else if (id === 'yhouses') { [[81, -61], [0, 0], [-18, 76]].forEach(c => [0, 1, 2].forEach(i => { const a = i * Math.PI * 2 / 3 + 0.3; rotBox(k, 'panelGrey', 22, 41, 11.5, c[0] + Math.cos(a) * 11, 20.5, c[1] - Math.sin(a) * 11, a); })); }
  else if (id === 'junkers') { k.box('brickBuff', -40, 40, 0, 12, -30, 22); k.box('corrugated', -12, 12, 12, 14, -14, 14); }
  else if (id === 'naturkunde') { const sh = new THREE.Shape(); [[16, 13], [15, 7], [14, 0], [9, -15], [-11, -14], [-13, 11], [-6, 17], [16, 13]].forEach((q, n) => n ? sh.lineTo(q[0], -q[1]) : sh.moveTo(q[0], -q[1])); const g = new THREE.ExtrudeGeometry(sh, { depth: 13, bevelEnabled: false }); g.rotateX(-Math.PI / 2); k.geo('sandstone', g); k.box('brick', -8.9, -1.7, 0, 38, 6.8, 14); const c = new THREE.ConeGeometry(4, 4, 4); c.rotateY(Math.PI / 4); c.translate(-5.3, 40, 10.4); k.geo('roof', c); }
  else if (id === 'georgium') { k.box('white', -19, 19, 0, 11, -7.5, 7.5); k.box('white', -19, -10, 0, 11, 7.5, 22); k.box('white', 10, 19, 0, 11, 7.5, 22); k.geo('slate', prism(-19.3, 19.3, -7.8, 7.8, 11, 14.4, 4.6, 4.6)); k.box('white', -2.1, 2.1, 14, 17.5, -2.1, 2.1); }
  else if (id === 'luisium') { k.box('luisYellow', -7.5, 7.5, 0, 13, -7.5, 7.5); k.geo('tilesRed', prism(-7.8, 7.8, -7.8, 7.8, 13, 15.2, 5.2, 5.2)); k.box('white', -2.2, 2.2, 15, 17.5, -2.2, 2.2); }
  else if (id === 'mosigkau') { k.box('ochre', -32, 32, 0, 11.2, 0, 14); k.geo('tilesRed', prism(-32.3, 32.3, -0.3, 14.3, 11.2, 17.2, 4, 4)); k.box('ochre', -36, -26, 0, 9, -32, 0); k.box('ochre', 26, 36, 0, 9, -32, 0); k.box('hedge', 30, 59, 0, 2, 64, 93); }
  else if (id === 'woerlitz') { k.box('cream', -17, 17, 0, 18, -11, 11); k.box('water', -110, 130, 0, 0.3, -170, -20); const v = new THREE.ConeGeometry(14, 22, 12); v.translate(74, 11, -116); k.geo('rock', v); }
  else if (id === 'johannbau') { k.box('cream', -21, 21, 0, 14, -7.5, 7.5); gableRoof(k, 'tilesRed', -21, 21, -7.8, 7.8, 14, 9, true); const t = new THREE.CylinderGeometry(3.4, 3.4, 26, 8); t.translate(0, 13, 10.5); k.geo('cream', t); }
  else if (id === 'petri') { k.box('brick', -10.5, 10.5, 0, 11, -8, 5.5); k.box('brick', 10.5, 22.5, 0, 11, -13, 13); k.box('brick', 22.5, 30, 0, 10, -5, 6); k.geo('tilesRed', prism(-10.7, 22.7, -8.4, 5.9, 11, 19.6, 0, 6.9)); k.box('brick', -19.5, -10.5, 0, 46, -6, 2); const sp = new THREE.ConeGeometry(2.5, 20, 8); sp.translate(-15, 56, -2); k.geo('brick', sp); }
  else if (id === 'marien') { k.box('brick', -16.4, 18.6, 0, 15, -11, 12); k.box('brick', 18.6, 26.5, 0, 15, -7, 6); k.box('brick', 2.8, 11.7, 0, 8, -17.7, -11); k.box('brick', 4, 12.3, 0, 8, 12, 17.7); k.geo('tilesRed', prism(-16.7, 18.9, -11.5, 12.5, 15, 32, 3, 12)); k.box('brick', -27.4, -16.4, 0, 38, -4.3, 6.9); const o = new THREE.CylinderGeometry(4.2, 4.4, 7, 8); o.translate(-21.9, 41.5, 1.3); k.geo('white', o); const d = new THREE.SphereGeometry(4.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2); d.translate(-21.9, 45, 1.3); k.geo('slate', d); }
  else if (id === 'propstei') { k.box('brick', -17.7, 14, 0, 11.5, -6.6, 7.8); k.box('brick', 14, 24, 0, 11.5, -4, 5); k.geo('slate', prism(-17.9, 14.2, -7.1, 8.3, 11.5, 21, 0, 7.7)); k.box('brick', -23.8, -17.7, 0, 22, -2.15, 4.65); const sp = new THREE.ConeGeometry(3.2, 18, 8); sp.translate(-20.75, 31, 1.25); k.geo('brick', sp); }
  else if (id === 'kornhaus') { k.box('white', -18, 22, 0, 7.6, 0, 11); const v = new THREE.CylinderGeometry(8.5, 8.5, 4.4, 32, 1, false, Math.PI, Math.PI); v.translate(-18, 5.8, 4.5); k.geo('glass', v); k.box('red', -4, 12, 7.6, 9.6, 2.4, 2.6); }
  else if (id === 'rcenter') { k.box('panelGrey', -36.1, 34.0, 0, 15, -103.0, -51.3); k.box('panelGrey', -41.9, 42.8, 0, 12, -51.3, 82.1); k.box('panelGrey', -36.1, 22.5, 0, 15, 82.1, 104.0); rotBox(k, 'glass', 178.4, 2.4, 7, -7.1, 13.8, 3.9, -1.2660); }
  else if (id === 'dcenter') { k.box('dcRed', -45, 45, 0, 15.6, -35, 15); k.box('concrete', -45, 45, 0, 16.5, 15, 40); k.box('dcSilver', 33, 46, 0, 17.2, -36, -22); const d = new THREE.CylinderGeometry(13, 11, 1.4, 40); d.translate(40.5, 22, -30); k.geo('sail', d); }
  const grp = k.build(); grp.traverse(o => { if (o.isMesh) { o.userData.lm = id; } });
  if (id === 'bauhaus') grp.children.forEach(c => c.position.set(-22, 0, -4));
  return grp;
}
let mapData = null;
let MAP_PLANE = null;
function buildMap() {
  const scene = new THREE.Scene();
  const tex = new THREE.CanvasTexture(drawMap()); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const Wm = (MAP.x1 - MAP.x0) * MS, Hm = (MAP.z1 - MAP.z0) * MS, cx = (MAP.x0 + MAP.x1) / 2 * MS, cz = (MAP.z0 + MAP.z1) / 2 * MS;
  const mapMesh = new THREE.Mesh(new THREE.PlaneGeometry(Wm, Hm), new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }));
  mapMesh.rotation.x = -Math.PI / 2; mapMesh.position.set(cx, 0, cz); mapMesh.receiveShadow = true; scene.add(mapMesh); MAP_PLANE = mapMesh;
  if (document.fonts && document.fonts.load) document.fonts.load('500 40px Jost').then(() => { tex.image = drawMap(); tex.needsUpdate = true; }).catch(() => {});
  plinth(scene, MAP.x0 * MS, MAP.x1 * MS, MAP.z0 * MS, MAP.z1 * MS, 8, 14);
  waterRibbon(scene, ELBE, 16, 0.14); waterRibbon(scene, MULDE, 7, 0.13);
  const tokens = {};
  LMS.forEach(l => {
    const g = token(l.id); const s = MS * 1.6; g.scale.set(s, s, s); if (ALIGN[l.id]) { g.rotation.y = ALIGN[l.id][0] * D2R; if (ALIGN[l.id][1]) g.scale.x = -s; }
    g.position.set(l.x * MS, 0.05, l.z * MS); scene.add(g); registerNoAO(g); tokens[l.id] = g;
    const ring = new THREE.Mesh(new THREE.RingGeometry(9, 10.5, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xc8372d, transparent: true, opacity: 0, depthWrite: false }));
    ring.position.set(l.x * MS, 0.2, l.z * MS); ring.userData.noAO = true; noAO.add(ring); scene.add(ring); g.userData.ring = ring;
  });
  const ctr = new THREE.Vector3(-25, 0, -55);
  mapData = { scene, tokens, center: ctr, span: 700, sunDist: 600, plane: MAP_PLANE };
}

function waterRibbon(scene, pts, width, y) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0] * MS, y, p[1] * MS)), false, 'centripetal');
  const N = Math.max(80, pts.length * 40), sp = curve.getSpacedPoints(N), pos = [], uv = [], idx = []; let dist = 0;
  for (let i = 0; i <= N; i++) {
    const a = sp[Math.max(0, i - 1)], b = sp[Math.min(N, i + 1)], dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz) || 1, nx = -dz / L, nz = dx / L, q = sp[i];
    if (i) dist += q.distanceTo(sp[i - 1]);
    pos.push(q.x + nx * width / 2, y, q.z + nz * width / 2, q.x - nx * width / 2, y, q.z - nz * width / 2); uv.push(0, dist, width, dist);
    if (i < N) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, MAT.water); m.receiveShadow = true; m.renderOrder = 1; m.userData.noAO = true; noAO.add(m); scene.add(m);
}

/* ================================================================
   UI: pins, landmark list, facts, markers
   ================================================================ */
const labels = $('labels'), markers = $('markers'), tip = $('tip');
let hotLm = null;
function setHot(id) {
  hotLm = id;
  LMS.forEach(l => { const on = l.id === id; l.pinEl.classList.toggle('hot', on); l.listEl.classList.toggle('hot', on); });
}
LMS.forEach((l, i) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'lm';
  b.innerHTML = '<span class="n">' + (i + 1) + '</span><b></b><span></span><em class="pg"></em>';
  b.querySelector('b').textContent = l.name; b.querySelectorAll('span')[1].textContent = l.sub; l.pgEl = b.querySelector('.pg');
  b.onclick = () => go(l.id); b.onmouseenter = () => setHot(l.id); b.onmouseleave = () => setHot(null);
  $('lmButtons').appendChild(b); l.listEl = b;
  const p = document.createElement('button'); p.type = 'button'; p.className = 'pin';
  p.innerHTML = '<b></b><span></span>'; p.querySelector('b').textContent = (i + 1) + '  ' + l.name; p.querySelector('span').textContent = l.sub;
  p.onclick = () => go(l.id); p.onmouseenter = () => setHot(l.id); p.onmouseleave = () => setHot(null);
  labels.appendChild(p); l.pinEl = p;
});
let cur = null, curId = 'map', factIdx = -1;
const PKEY = 'dessau-landmarks-progress-v1';
const PROG = (() => { try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch (e) { return {}; } })();
PROG.seen = PROG.seen || {}; PROG.quiz = PROG.quiz || {}; PROG.counts = PROG.counts || {};
function saveProg() { try { localStorage.setItem(PKEY, JSON.stringify(PROG)); } catch (e) {} }
const seen = PROG.seen;
function showMapUI(on) {
  ['intro', 'lmlist'].forEach(id => { $(id).hidden = !on; }); labels.hidden = !on;
  if (!on && typeof infoClose === 'function') { infoClose('newsPanel'); infoClose('aboutPanel'); }
  ['bhead', 'bpanel'].forEach(id => { $(id).hidden = on; }); markers.hidden = on;
  if (on) { $('card').hidden = true; $('people').hidden = true; $('dressTray').hidden = true; $('walkHud').hidden = true; }
}
function buildFactUI(lm) {
  $('bName').textContent = lm.label; $('bMeta').textContent = lm.meta; $('bLead').textContent = lm.lead;
  const list = $('factList'); list.innerHTML = ''; markers.innerHTML = '';
  seen[lm.id] = seen[lm.id] || {};
  cur.facts.forEach((f, i) => {
    const li = document.createElement('li'); const b = document.createElement('button'); b.type = 'button';
    b.innerHTML = '<span class="n">' + (i + 1) + '</span><span></span>'; b.querySelectorAll('span')[1].textContent = f.title;
    b.onclick = () => openFact(i); li.appendChild(b); list.appendChild(li); f.listEl = b; if (seen[lm.id][f.id]) li.classList.add('seen'); f.li = li;
    if (f.hidden) { li.classList.add('hiddenfact'); b.querySelector('.n').textContent = '?'; if (!seen[lm.id][f.id]) { b.querySelectorAll('span')[1].textContent = 'Hidden detail: click around the building to find it'; b.onclick = () => toast(f.hint || 'Look closely and click the parts of the building.'); } }
    const m = document.createElement('button'); m.type = 'button'; m.className = 'mk' + (seen[lm.id][f.id] ? ' seen' : ''); m.textContent = String(i + 1);
    m.setAttribute('aria-label', (i + 1) + '. ' + f.title); m.onclick = () => openFact(i); markers.appendChild(m); f.mk = m;
    f.v = new THREE.Vector3().fromArray(f.pos);
  });
}
function openFact(i) {
  if ($('card').classList.contains('collapsed')) uipCollapse($('card'), false);
  if (!cur) return;
  const n = cur.facts.length, prevIdx = factIdx, dir = (prevIdx >= 0 && i < prevIdx) ? -1 : 1;
  let j = ((i % n) + n) % n, guard = 0;
  while (cur.facts[j].hidden && !seen[curId][cur.facts[j].id] && !cur.facts[j]._fromClick && guard++ < n) j = (j + dir + n) % n;
  factIdx = j; const f = cur.facts[factIdx];
  const before = factsDone(curId); const wasNew = !seen[curId][f.id];
  seen[curId][f.id] = true; f.li.classList.add('seen'); f.mk.classList.add('seen'); saveProg();
  if (f.hidden && wasNew) { f.listEl.querySelectorAll('span')[1].textContent = f.title; const idx = factIdx; f.listEl.onclick = () => openFact(idx); toast('You found a hidden detail.'); }
  const after = factsDone(curId); if (wasNew && before && after && after.found >= after.total && before.found < before.total) toast('All stories found here. The quiz for this stamp is unlocked.', 'Take the quiz', startQuiz, 6000);
  refreshProgress(); updateTools();
  $('prevFact').hidden = false; $('nextFact').hidden = false;
  cur.facts.forEach((g, j) => { g.mk.classList.toggle('on', j === factIdx); g.listEl.setAttribute('aria-current', j === factIdx ? 'true' : 'false'); });
  $('cNum').textContent = f.hidden ? '?' : String(factIdx + 1); $('cTitle').textContent = f.title; $('cYear').textContent = f.year; $('cText').textContent = f.text;
  const src = $('cSrc'); src.innerHTML = 'Source: '; if (f.src[1]) { const a = document.createElement('a'); a.href = f.src[1]; a.target = '_blank'; a.rel = 'noopener'; a.textContent = f.src[0]; src.appendChild(a); } else src.appendChild(document.createTextNode(f.src[0]));
  $('card').hidden = false;
  flyTo(rotPt(f.cam), rotPt(f.tgt), 1500);
}
function closeFact() { factIdx = -1; $('card').hidden = true; if (cur) cur.facts.forEach(g => { g.mk.classList.remove('on'); g.listEl.setAttribute('aria-current', 'false'); }); }
$('prevFact').onclick = () => openFact(factIdx - 1); $('nextFact').onclick = () => openFact(factIdx + 1); $('closeCard').onclick = closeFact;
$('backBtn').onclick = () => go('map');
// real-world orientation of each model (degrees anticlockwise from its modelling axes) and whether it is mirrored, from OpenStreetMap footprints
const ALIGN = { hbf: [79.5, false], bauhaus: [22.2, false], museum: [88.5, false], rathaus: [90.0, true], theater: [-63.4, false], lyzeum: [159.2, true], meister: [-4.0, false], johannbau: [93.3, false], naturkunde: [0, false], yhouses: [0, false], bridge: [-84.0, false], uba: [0, false], raucher: [-80.7, false], hkw: [0.0, false], mausoleum: [116.0, false], georgium: [-156.5, false], junkers: [85.3, false], luisium: [-87.4, false], mosigkau: [0.0, false], woerlitz: [-34.2, false], kornhaus: [-26.8, false], rcenter: [0, false], dcenter: [0, false], petri: [0, false], marien: [6.9, false], propstei: [10.6, false] };
const UPV = new THREE.Vector3(0, 1, 0);
function toW(v) { if (cur && cur.mirror) v.x = -v.x; if (cur && cur.rotY) v.applyAxisAngle(UPV, cur.rotY); return v; }
function fromW(v) { if (cur && cur.rotY) v.applyAxisAngle(UPV, -cur.rotY); if (cur && cur.mirror) v.x = -v.x; return v; }
function rotPt(a) { return toW(new THREE.Vector3().fromArray(a)); }

/* daylight controls */
function setTime(t) { timeNow = clamp(t, 0, 24); applyLighting(timeNow, false); drawClock(timeNow); $('timeSlider').value = timeNow; $('timeLabel').textContent = fmt(timeNow); }
function setDate(d) { dateKey = d; document.querySelectorAll('[data-date]').forEach(b => b.setAttribute('aria-pressed', b.getAttribute('data-date') === d ? 'true' : 'false')); $('dateNote').textContent = DATES[d].note; buildQuick(); setTime(timeNow); }
function buildQuick() { const q = $('quick'); q.innerHTML = ''; dayTimes().forEach(p => { const b = document.createElement('button'); b.type = 'button'; b.textContent = p[0]; b.title = fmt(p[1]); b.onclick = () => setTime(p[1]); q.appendChild(b); }); }
document.querySelectorAll('[data-date]').forEach(b => b.addEventListener('click', () => setDate(b.getAttribute('data-date'))));
$('timeSlider').addEventListener('input', e => setTime(parseFloat(e.target.value)));

/* ================= camera, controls, navigation ================= */
const controls = new OrbitControls(camera, dom);
controls.enableDamping = true; controls.dampingFactor = 0.08; controls.screenSpacePanning = true;
let tween = null;
controls.addEventListener('start', () => { tween = null; });
function flyTo(pos, tgt, dur) { tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos.clone(), t1: tgt.clone(), s: performance.now(), d: REDUCED ? 1 : (dur || 1600) }; }
const veil = $('veil');
// shareable links: opening a landmark puts #id in the address, and an address with #id opens that landmark
function setHash(h) { try { history.replaceState(null, '', h); } catch (e) { /* sandboxed preview: the address bar cannot change */ } }
async function go(id) {
  if (id === curId && activeScene) return;
  try { await goInner(id); }
  catch (err) {
    console.error('Could not open ' + id, err);
    veil.classList.add('out');
    if (id !== 'map') { delete BUILT[id]; cur = null; curId = ''; toast('This view could not open: ' + (err && err.message || err)); go('map'); }
  }
}
async function goInner(id) {
  $('veilText').textContent = id === 'map' ? 'Back to the map…' : 'Opening the ' + LMS.find(l => l.id === id).name + '…';
  veil.classList.remove('out'); await wait(REDUCED ? 0 : 420);
  stopWalk(); stopReplay(); closeDress(); stopTrail(); closeModal(); if (typeof byoClose === 'function') byoClose(); if (typeof stopPlacing === 'function' && id !== 'map') stopPlacing();
  closeFact(); hideTip(); setHot(null);
  if (id === 'map') {
    cur = null; curId = 'map';
    setActiveScene(mapData.scene); attachWorld(mapData.scene, mapData.center, mapData.span, mapData.sunDist);
    lampPool.forEach(l => { l.userData.on = false; });
    controls.minDistance = 60; controls.maxDistance = 1800; controls.maxPolarAngle = 1.15; controls.minPolarAngle = 0.12;
    if (gtao) { try { gtao.updateGtaoMaterial({ radius: 4 }); } catch (e) {} }
    showMapUI(true);
    camera.position.set(-25, 330, 245); controls.target.copy(mapData.center); controls.update();
    flyTo(new THREE.Vector3(-25, 250, 170), mapData.center, 1600);
    if (location.hash) setHash(location.pathname + location.search);
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    refreshProgress();
  } else {
    const lm = LMS.find(l => l.id === id); if (!lm) return go('map');
    if (!BUILT[id]) {
      let load = BUILDING_LOADS.get(id);
      if (!load) {
        load = (async () => {
          await wait(30);
          const b = await lm.build();
          b.dress = {};
          b.facts = b.facts.concat((b.hiddenFacts || []).map(f => Object.assign(f, { hidden: true })));
          if (ALIGN[id]) { b.rotY = ALIGN[id][0] * D2R; b.mirror = ALIGN[id][1]; }
          if (b.rotY || b.mirror) {
            const root = new THREE.Group();
            b.scene.children.slice().forEach(o => root.add(o));
            root.rotation.y = b.rotY || 0;
            if (b.mirror) root.scale.x = -1;
            b.scene.add(root);
          }
          return b;
        })();
        BUILDING_LOADS.set(id, load);
      }
      try {
        BUILT[id] = await load;
      } finally {
        if (BUILDING_LOADS.get(id) === load) BUILDING_LOADS.delete(id);
      }
    }
    cur = BUILT[id]; curId = id;
    setActiveScene(cur.scene); attachWorld(cur.scene, cur.center, cur.span, cur.sunDist);
    lampPool.forEach((l, i) => { const p = cur.lamps && cur.lamps[i]; l.userData.on = !!p; if (p) l.position.copy(toW(p.clone())); else l.position.set(0, -500, 0); });
    controls.minDistance = 4; controls.maxDistance = 330; controls.maxPolarAngle = Math.PI * 0.492; controls.minPolarAngle = 0;
    if (gtao) { try { gtao.updateGtaoMaterial({ radius: 2.2 }); } catch (e) {} }
    showMapUI(false); buildFactUI(lm); recordCounts(id); buildEraUI(); buildViews(); buildPeople(); updateTools(); if (id === 'meister') byoEnsure();
    const ip = rotPt(cur.intro.pos), it = rotPt(cur.intro.tgt);
    camera.position.copy(ip).multiplyScalar(1.7).setY(ip.y * 2); controls.target.copy(it); controls.update();
    flyTo(ip, it, 2000);
    if (location.hash !== '#' + id) setHash('#' + id);
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
  }
  applyLighting(timeNow, true);
  veil.classList.add('out');
}
window.addEventListener('hashchange', () => { const h = location.hash.replace('#', ''); go(LMS.some(l => l.id === h) ? h : 'map'); });
window.addEventListener('hashchange', () => { const h = location.hash.replace('#', ''); go(LMS.some(l => l.id === h) ? h : 'map'); });

/* ================= picking ================= */
const rc = new THREE.Raycaster(), ndc = new THREE.Vector2();
function setRay(cx, cy) { const r = dom.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height * 2 - 1)); rc.setFromCamera(ndc, camera); }
function pick() {
  const hits = rc.intersectObjects(activeScene.children, true);
  for (const h of hits) { const o = h.object; if (o === skyMesh || !visChain(o) || (REPLAY.sheet && o === REPLAY.sheet) || (o.userData && o.userData.noAO && !o.userData.fact && !o.userData.lm && !GLASSY.has(matName(o)))) continue; return h; }
  return null;
}
const MATNAME = new Map(); Object.keys(MAT).forEach(k => MATNAME.set(MAT[k], k));
function matName(o) { return MATNAME.get((o.userData && o.userData.baseMat) || o.material) || ''; }
function findTag(o, key) { while (o) { if (o.userData && o.userData[key] != null) return o.userData[key]; o = o.parent; } return null; }
let down = null, lastHover = 0;
dom.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; hideTip(); if (WALK.on) { WALK.drag = { x: e.clientX, y: e.clientY }; try { dom.setPointerCapture(e.pointerId); } catch (_) {} } });
dom.addEventListener('pointerup', e => {
  WALK.drag = null;
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) { down = null; return; }
  down = null;
  if (NOTE.placing && curId === 'map') { const pt = mapPointAt(e.clientX, e.clientY); stopPlacing(); if (pt) composeNote(pt); return; }
  if (BYO.on) { byoClick(e); return; }
  setRay(e.clientX, e.clientY); const h = pick(); if (!h) return;
  if (curId === 'map') { const id = findTag(h.object, 'lm'); if (id) go(id); return; }
  if (DRESS.on) { dressPick(h); return; }
  const tag = findTag(h.object, 'fact'); if (tag && cur) { const i = cur.facts.findIndex(f => f.id === tag); if (i >= 0) { cur.facts[i]._fromClick = true; openFact(i); cur.facts[i]._fromClick = false; } }
});
dom.addEventListener('pointermove', e => {
  if (WALK.on && WALK.drag) { WALK.yaw -= (e.clientX - WALK.drag.x) * 0.004; WALK.pitch = clamp(WALK.pitch - (e.clientY - WALK.drag.y) * 0.003, -1.1, 1.1); WALK.drag = { x: e.clientX, y: e.clientY }; return; }
  if (e.pointerType !== 'mouse' || down) return;
  const now = performance.now(); if (now - lastHover < 50) return; lastHover = now;
  if (BYO.on) { byoHover(e); return; }
  if (NOTE.placing && curId === 'map') { dom.style.cursor = 'crosshair'; hideTip(); return; }
  setRay(e.clientX, e.clientY); const h = pick();
  if (curId === 'map') { const id = h ? findTag(h.object, 'lm') : null; setHot(id); dom.style.cursor = id ? 'pointer' : ''; if (id) { const l = LMS.find(q => q.id === id); showTip(e, l.name, 'click to open in 3D'); } else hideTip(); return; }
  if (DRESS.on) { const key = h ? MATNAME.get(h.object.userData.baseMat || h.object.material) : null; dom.style.cursor = key ? 'pointer' : ''; if (key) showTip(e, LABEL[key] || key, 'click to select'); else hideTip(); return; }
  const tag = h ? findTag(h.object, 'fact') : null; const f = tag && cur ? cur.facts.find(q => q.id === tag) : null;
  const hid = f && f.hidden && !seen[curId][f.id];
  dom.style.cursor = f ? 'pointer' : ''; if (f) showTip(e, hid ? 'Something here…' : f.title, hid ? 'click to find out' : 'click for the story'); else hideTip();
});
dom.addEventListener('pointerleave', () => { hideTip(); if (curId === 'map') setHot(null); });
function showTip(e, a, b) { tip.innerHTML = ''; const bb = document.createElement('b'); bb.textContent = a; tip.appendChild(bb); tip.appendChild(document.createTextNode(b)); tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; tip.style.display = 'block'; }
function hideTip() { tip.style.display = 'none'; }
window.addEventListener('keydown', e => {
  const t = e.target; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && t.type !== 'range') return;
  if (modalOpen()) { if (e.key === 'Escape') closeModal(); return; }
  if (WALK.on && WALK_CODES.has(e.code)) { WALK.keys.add(e.code); e.preventDefault(); return; }
  if (BYO.on && (e.key === 'r' || e.key === 'R')) { $('byoRot').click(); return; }
  if (e.key === 'Escape' && NOTE.placing) { stopPlacing(); return; }
  if (e.key === 'Escape' && BYO.on) { byoClose(); return; }
  if (e.key === 'Escape') { if (WALK.on) stopWalk(); else if (DRESS.on) closeDress(); else if (TR.on) stopTrail(); else if (!$('card').hidden) closeFact(); else if (curId !== 'map') go('map'); }
  else if (e.key === 'ArrowRight' && curId !== 'map') openFact(factIdx + 1);
  else if (e.key === 'ArrowLeft' && curId !== 'map') openFact(factIdx - 1);
  else if (e.key === '[') setTime(timeNow - 0.25); else if (e.key === ']') setTime(timeNow + 0.25);
  else if (e.key === '/') { e.preventDefault(); document.body.classList.toggle('ui-hidden'); }
  else if (/^[1-9]$/.test(e.key) && curId === 'map' && LMS[+e.key - 1]) go(LMS[+e.key - 1].id);
});

/* ================= resize ================= */
function resize() {
  const w = stage.clientWidth || window.innerWidth, h = stage.clientHeight || window.innerHeight;
  renderer.setSize(w, h); if (composer) composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
}
if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
window.addEventListener('resize', resize); resize();

/* ================= overlay positioning ================= */
const V = new THREE.Vector3(), occRay = new THREE.Raycaster();
let lastOcc = 0;
function updateOverlays(now) {
  const w = dom.clientWidth, h = dom.clientHeight; placeNotePins();
  if (curId === 'map') {
    const items = [];
    LMS.forEach(l => {
      const g = mapData.tokens[l.id]; const lift = l.id === hotLm ? 1 : 0;
      g.position.y += ((lift ? 1.8 : 0.05) - g.position.y) * 0.18; g.userData.ring.material.opacity += ((lift ? 0.9 : 0) - g.userData.ring.material.opacity) * 0.18;
      V.set(l.x * MS, (l.id === 'rathaus' ? 22 : l.id === 'theater' ? 10 : 9) + g.position.y, l.z * MS).project(camera);
      const vis = V.z < 1; l.pinEl.style.display = vis ? '' : 'none';
      if (vis) items.push({ l: l, x: (V.x + 1) / 2 * w, y: (1 - V.y) / 2 * h });
    });
    items.sort((a, b) => b.y - a.y);
    const placed = [];
    items.forEach(it => {
      const el = it.l.pinEl, pw = el.offsetWidth, ph = el.offsetHeight; let y = it.y - 10, guard = 0, moved = true;
      while (moved && guard++ < 12) { moved = false; for (const p of placed) { if (Math.abs(p.x - it.x) < (p.w + pw) / 2 + 4 && y > p.y - p.h - 4 && y - ph < p.y + 4) { y = p.y - p.h - 4; moved = true; } } }
      placed.push({ x: it.x, y: y, w: pw, h: ph });
      el.style.left = it.x + 'px'; el.style.top = y + 'px'; el.style.setProperty('--stem', Math.max(10, it.y - y) + 'px');
      el.style.zIndex = it.l.id === hotLm ? 3 : 1;
    });
    return;
  }
  if (!cur) return;
  const doOcc = now - lastOcc > 250; if (doOcc) lastOcc = now;
  if (showPeople && RESIDENTS[curId]) RESIDENTS[curId].forEach(r => {
    toW(V.copy(r.v)).project(camera);
    if (V.z > 1 || Math.abs(V.x) > 1.2 || Math.abs(V.y) > 1.2) { r.el.style.display = 'none'; return; }
    r.el.style.display = ''; r.el.style.left = ((V.x + 1) / 2 * w) + 'px'; r.el.style.top = ((1 - V.y) / 2 * h) + 'px';
  });
  cur.facts.forEach(f => {
    if (f.hidden || DRESS.on) { f.mk.style.display = 'none'; return; }
    const p = toW(f.v.clone());
    V.copy(p).project(camera);
    if (V.z > 1 || Math.abs(V.x) > 1.2 || Math.abs(V.y) > 1.2) { f.mk.style.display = 'none'; return; }
    f.mk.style.display = ''; f.mk.style.left = ((V.x + 1) / 2 * w) + 'px'; f.mk.style.top = ((1 - V.y) / 2 * h) + 'px';
    if (doOcc) {
      const dir = p.clone().sub(camera.position), dist = dir.length(); occRay.set(camera.position, dir.normalize()); occRay.far = dist - 1.2;
      const hits = occRay.intersectObjects(cur.scene.children, true).filter(hh => !GLASSY.has(matName(hh.object)) && hh.object !== skyMesh && visChain(hh.object) && !(hh.object.userData && hh.object.userData.noAO));
      f.mk.classList.toggle('hid', hits.length > 0);
    }
  });
}

/* ================================================================
   FEATURES: eras, stamps, quizzes, certificate, views, residents,
   walking, the Bauhaus trail, build replay, postcards, redesign
   ================================================================ */
function visChain(o) { while (o) { if (o.visible === false) return false; o = o.parent; } return true; }

/* ---------- toast and modal ---------- */
function toast(msg, actionLabel, action, ms) {
  const t = $('toast'); $('toastText').textContent = msg; const b = $('toastBtn');
  if (actionLabel) { b.hidden = false; b.textContent = actionLabel; b.onclick = () => { t.hidden = true; action(); }; } else b.hidden = true;
  t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, ms || 4500);
}
function modal(title, body, actions) {
  $('mTitle').textContent = title; const mb = $('mBody'); mb.innerHTML = '';
  if (typeof body === 'string') { const p = document.createElement('p'); p.textContent = body; mb.appendChild(p); } else mb.appendChild(body);
  const ma = $('mActions'); ma.innerHTML = '';
  (actions || [{ label: 'Close' }]).forEach(a => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (a.ghost ? ' ghost' : ''); b.textContent = a.label; b.onclick = () => { if (!a.keep) closeModal(); if (a.fn) a.fn(); }; ma.appendChild(b); });
  $('modalBack').hidden = false; const f = ma.querySelector('button'); if (f) f.focus();
}
function closeModal() { $('modalBack').hidden = true; }
function modalOpen() { return !$('modalBack').hidden; }

/* ---------- downloads (postcards, certificate) ---------- */
let DL = null;
(async () => { try { if (window.claude && window.claude.use) DL = await window.claude.use('downloads'); } catch (e) { DL = null; } })();
async function offerFile(filename, blob, url) {
  if (DL) {
    try { await DL.save({ filename: filename, data: blob }); toast('Saved ' + filename + '.'); return; }
    catch (e) { if (e && (e.code === 'declined' || e.code === 'rate_limited')) return; }
  }
  const wrap = document.createElement('div'); const img = document.createElement('img'); img.src = url; img.alt = filename; img.className = 'shot'; wrap.appendChild(img);
  const p = document.createElement('p'); p.textContent = 'Right-click or long-press the image to save it.'; wrap.appendChild(p);
  modal('Your image', wrap);
}
function canvasOut(c, filename) { c.toBlob(b => { if (b) offerFile(filename, b, c.toDataURL('image/png')); }, 'image/png'); }

/* ---------- eras ---------- */
function applyOverrides() {
  if (!cur) return;
  const eff = Object.assign({}, cur.eraMats || {}, cur.dress || {});
  cur.scene.traverse(o => {
    if (!o.isMesh || o === skyMesh) return;
    if (!o.userData.baseMat) o.userData.baseMat = o.material;
    const key = MATNAME.get(o.userData.baseMat);
    o.material = (key && eff[key]) ? eff[key] : o.userData.baseMat;
  });
}
function buildEraUI() {
  const bar = $('eraBar'), note = $('eraNote'); bar.innerHTML = '';
  if (!cur.eras) { bar.hidden = true; note.hidden = true; cur.eraMats = {}; applyOverrides(); return; }
  bar.hidden = false; note.hidden = false;
  cur.eras.forEach((e, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = e.year; b.title = e.title; b.onclick = () => applyEra(i); bar.appendChild(b); });
  applyEra(cur.eraIdx == null ? cur.eras.length - 1 : cur.eraIdx);
}
function applyEra(i) {
  stopReplay();
  cur.eraIdx = i; const e = cur.eras[i]; const hide = new Set(e.hide || []), show = new Set(e.show || []);
  cur.scene.traverse(o => {
    const p = o.userData && o.userData.part; if (!p) return;
    o.visible = p.indexOf('v:') === 0 ? show.has(p) : !hide.has(p);
    if (o.isInstancedMesh) { if (o.userData.full == null) o.userData.full = o.count; const f = e.thin && e.thin[p] != null ? e.thin[p] : 1; o.count = Math.max(0, Math.floor(o.userData.full * f)); }
  });
  cur.eraMats = {}; Object.keys(e.mats || {}).forEach(k => { if (MAT[e.mats[k]]) cur.eraMats[k] = MAT[e.mats[k]]; });
  applyOverrides();
  [...$('eraBar').children].forEach((b, j) => b.setAttribute('aria-pressed', j === i ? 'true' : 'false'));
  $('eraNote').textContent = e.title + '. ' + e.note;
}

/* ---------- stamps and progress ---------- */
function recordCounts(id) {
  PROG.counts = PROG.counts || {};
  PROG.counts[id] = { ids: cur.facts.filter(f => !f.hidden).map(f => f.id), hidden: cur.facts.filter(f => f.hidden).map(f => f.id) };
  saveProg();
}
function factsDone(id) {
  const c = PROG.counts && PROG.counts[id]; if (!c) return null; const s = seen[id] || {};
  return { found: c.ids.filter(f => s[f]).length, total: c.ids.length, hFound: c.hidden.filter(f => s[f]).length, hTotal: c.hidden.length };
}
function passed(id) { return (PROG.quiz[id] || 0) >= 2; }
function allPassed() { return LMS.every(l => passed(l.id)); }
function refreshProgress() {
  let found = 0, hidden = 0, quizzes = 0;
  LMS.forEach(l => {
    const d = factsDone(l.id); let t;
    if (!d) t = 'not explored yet';
    else { found += d.found; hidden += d.hFound; t = d.found + ' of ' + d.total + ' stories' + (d.hFound ? ', hidden detail found' : ''); }
    if (passed(l.id)) { quizzes++; t += ', stamped'; }
    l.pgEl.textContent = t; l.listEl.classList.toggle('done', passed(l.id));
  });
  $('progressLine').textContent = found + ' stories and ' + hidden + ' hidden details found. ' + quizzes + ' of ' + LMS.length + ' stamps earned.';
  $('certBtn').classList.toggle('ghost', !allPassed());
}
function updateTools() {
  if (!cur) return;
  const d = factsDone(curId), q = $('quizBtn');
  if (passed(curId)) { q.textContent = 'Quiz passed, take it again'; q.disabled = false; }
  else if (d && d.found >= d.total) { q.textContent = 'Take the quiz for your stamp'; q.disabled = false; }
  else { q.textContent = 'Quiz: find ' + (d ? d.total - d.found : '') + ' more stories to unlock'; q.disabled = true; }
  $('peopleBtn').hidden = !RESIDENTS[curId];
  $('byoBtn').hidden = curId !== 'meister';
}

/* ---------- quiz ---------- */
const QUIZ = {
  hbf: [
    { q: 'When did Dessau’s first railway open?', o: ['1840', '1857', '1876', '1911'], a: 0, e: 'The Berlin-Anhalt Railway Company opened it on 1 September 1840.' },
    { q: 'What made the line to Bitterfeld special in 1911?', o: ['It became Germany’s first fully electrified long-distance line', 'It ran the first sleeper train', 'It crossed the Elbe on a steel bridge', 'It had the first underground station'], a: 0, e: 'It was electrified in 1911, the first fully electrified long-distance railway in Germany.' },
    { q: 'Which air raid destroyed the station building?', o: ['7 March 1945', '30 May 1944', '16 January 1945', '2 April 1910'], a: 0, e: 'The same raid of 7 March 1945 hit the Bauhaus and the Rathaus.' }
  ],
  bauhaus: [
    { q: 'When did the Bauhaus building open?', o: ['4 December 1926', '1 April 1925', '7 March 1926', '8 September 2019'], a: 0, e: 'More than 1,000 guests came to the opening on 4 December 1926.' },
    { q: 'Why can the glass run unbroken across three floors?', o: ['The columns stand back inside', 'Steel cables hang it from the roof', 'The glass carries the floors', 'There are no floors behind it'], a: 0, e: 'The concrete columns are set back, so the curtain wall carries no load.' },
    { q: 'How many studio flats did the studio house have?', o: ['28', '16', '12', '40'], a: 0, e: 'Twenty-eight studios of about 20 m² each.' }
  ],
  museum: [
    { q: 'How many entries did the 2015 competition receive?', o: ['831', '105', '49', '2,019'], a: 0, e: 'Barcelona’s addenda architects won from 831 entries.' },
    { q: 'How high does the Black Box float above the ground floor?', o: ['About 5 m', 'About 1 m', 'About 12 m', 'About 25 m'], a: 0, e: 'It hovers five metres above the visitors.' },
    { q: 'What does the Black Box rest on?', o: ['Two stair cores 50 m apart', 'A forest of columns', 'Cables from the roof', 'The glass facade'], a: 0, e: 'The structure borrows from bridge building.' }
  ],
  rathaus: [
    { q: 'How tall is the town hall tower?', o: ['73 m', '41 m', '105 m', '159 m'], a: 0, e: 'It is the tallest tower in Dessau-Roßlau. 159 is the number of steps.' },
    { q: 'What happened on 2 April 1910?', o: ['A fire destroyed large parts of the building', 'Lightning struck the tower', 'The Duke opened the building', 'An air raid hit the market'], a: 0, e: 'Archives back to the Thirty Years’ War burned too.' },
    { q: 'What has stood in front of the town hall since 2002?', o: ['A peace bell', 'A statue of Gropius', 'A fountain', 'A tram stop shelter'], a: 0, e: 'It remembers the peaceful revolution of 1989.' }
  ],
  theater: [
    { q: 'Which opera opened the theatre in 1938?', o: ['Der Freischütz', 'The Magic Flute', 'Fidelio', 'Lohengrin'], a: 0, e: 'The Magic Flute reopened it in 1949.' },
    { q: 'What nickname did Dessau earn from 1953?', o: ['The Bayreuth of the North', 'The Vienna of the Elbe', 'Little Berlin', 'The Garden of Europe'], a: 0, e: 'Because of its Richard Wagner Festival.' },
    { q: 'Since when has Dessau had a permanent theatre company?', o: ['1794', '1898', '1938', '1949'], a: 0, e: 'Its first theatre building followed by 1798.' }
  ],
  lyzeum: [
    { q: 'What was the Lyzeum built as?', o: ['A secondary school for girls', 'A railway office', 'A museum', 'A hospital'], a: 0, e: 'The ducal upper lyceum also trained future women teachers.' },
    { q: 'Which faculty uses the building today?', o: ['Design', 'Architecture', 'Computer science', 'Law'], a: 0, e: 'The Design faculty’s dean’s office and workshops are here.' },
    { q: 'When was Anhalt University founded?', o: ['1992', '1926', '1945', '2007'], a: 0, e: 'With sites in Dessau, Köthen and Bernburg.' }
  ],
  meister: [
    { q: 'Who lived in the same double house as Paul Klee?', o: ['Wassily Kandinsky', 'Walter Gropius', 'Lyonel Feininger', 'Oskar Schlemmer'], a: 0, e: 'Kandinsky and Klee were neighbours from 1926.' },
    { q: 'Which buildings were destroyed in 1945?', o: ['Gropius’s house and Moholy-Nagy’s half', 'The Kandinsky and Klee house', 'The Muche and Schlemmer house', 'Feininger’s half and the kiosk'], a: 0, e: 'They were rebuilt as reinterpretations in 2014.' },
    { q: 'Who designed the kiosk in the corner wall?', o: ['Ludwig Mies van der Rohe', 'Marcel Breuer', 'Hannes Meyer', 'Carl Fieger'], a: 0, e: 'He added it in 1932.' }
  ],
  rcenter: [
    { q: 'When did the Rathaus-Center open?', o: ['September 1995', 'May 2009', '1926', '2019'], a: 0, e: 'It opened in September 1995 on Kavalierstraße.' },
    { q: 'About how many shops does it have?', o: ['About 90', 'About 10', 'About 300', 'About 900'], a: 0, e: 'Around 90 specialist shops on two floors.' },
    { q: 'What opened on its first floor in March 2023?', o: ['A MediaMarkt', 'A cinema', 'An ice rink', 'A library'], a: 0, e: 'A second MediaMarkt for the city opened there on 23 March 2023.' }
  ],
  dcenter: [
    { q: 'When did the Dessau-Center open?', o: ['2 May 2009', 'September 1995', '1 January 2000', '8 September 2019'], a: 0, e: 'Saturn opened at 6 a.m., the other shops at 8 a.m.' },
    { q: 'Which department store stood on the site before?', o: ['Horten', 'Karstadt', 'Kaufhof', 'Wertheim'], a: 0, e: 'It was built on the old Horten site at the corner of Franzstraße and Askanische Straße.' },
    { q: 'What makes the building easy to spot?', o: ['A dark red facade and a membrane sail', 'A golden dome', 'A clock tower', 'A glass pyramid'], a: 0, e: 'The sail spans the corner at the Museumskreuzung.' }
  ],
  petri: [
    { q: 'How tall is the tower of St. Petri in Wörlitz?', o: ['66 metres', '41 metres', '38 metres', '100 metres'], a: 0, e: 'The rebuilding of 1805–09 raised the tower to 66 metres.' },
    { q: 'Which style inspired the rebuilding of 1805–09?', o: ['English Tudor Gothic', 'Italian Baroque', 'Bauhaus modernism', 'Romanesque'], a: 0, e: 'Prince Franz had it rebuilt in a neo-Gothic style inspired by English Tudor Gothic.' },
    { q: 'What has the tower been since 1994?', o: ['Germany’s only Bible tower', 'A lighthouse', 'A water tower', 'A radio mast'], a: 0, e: 'It is the Bibelturm, with exhibitions about the Bible and a viewing platform.' }
  ],
  marien: [
    { q: 'When was the foundation stone of the Marienkirche laid?', o: ['1506', '1926', '1858', '1200'], a: 0, e: 'Prince Ernst laid it on 25 May 1506; the church was consecrated in 1523.' },
    { q: 'What happened to the church on 7 March 1945?', o: ['It burnt out in an air raid', 'It was moved', 'It became a museum', 'Nothing'], a: 0, e: 'Only the tower, the outer walls and the inner pillars survived.' },
    { q: 'What is the church used for today?', o: ['Concerts, theatre and exhibitions', 'A railway station', 'A hospital', 'A school'], a: 0, e: 'Rebuilt in 1989–98, it is a venue and since 2022 home to the Mitteldeutsches Theater.' }
  ],
  propstei: [
    { q: 'Who designed St. Peter und Paul?', o: ['Vinzenz Statz', 'Walter Gropius', 'Karl Friedrich Schinkel', 'Ludwig Mies van der Rohe'], a: 0, e: 'The Cologne architect Vinzenz Statz drew the plans; it was built in 1854–58.' },
    { q: 'How tall is its tower including the cross?', o: ['41 metres', '66 metres', '20 metres', '100 metres'], a: 0, e: 'The tower is 38 metres high, 41 metres with the cross.' },
    { q: 'When was the rebuilding after the war finished?', o: ['1958', '1945', '1990', '2023'], a: 0, e: 'Rebuilding began in 1951 and was completed in 1958.' }
  ],
  kornhaus: [
    { q: 'Who designed the Kornhaus?', o: ['Carl Fieger', 'Walter Gropius', 'Hannes Meyer', 'Marianne Brandt'], a: 0, e: 'Fieger won the 1929 competition ahead of Hannes Meyer.' },
    { q: 'What was the glass veranda first planned as?', o: ['An open balcony', 'A boathouse', 'A bandstand', 'A greenhouse'], a: 0, e: 'It was glazed halfway through construction.' },
    { q: 'How many guests could it seat with its terraces and beer hall?', o: ['Up to 2,000', 'About 200', 'About 500', 'About 10,000'], a: 0, e: 'It was a popular excursion spot from the start.' }
  ],
  bridge: [
    { q: 'Why is the Tiergarten bridge called the “Eierschneider”?', o: ['Its arch and hangers look like an egg slicer', 'It was paid for by an egg farm', 'It cuts the Mulde in two', 'It was built from old kitchen steel'], a: 0, e: 'The fan of hangers under the arch looks like an egg slicer’s wires.' },
    { q: 'How long is the bridge?', o: ['About 108 m', 'About 40 m', 'About 250 m', 'About 1 km'], a: 0, e: '107.65 m, curving on a radius of 105 m.' },
    { q: 'When was it built?', o: ['2000', '1926', '1975', '2015'], a: 0, e: 'Between March and October 2000.' }
  ],
  uba: [
    { q: 'Which architects designed the Umweltbundesamt?', o: ['Sauerbruch Hutton', 'addenda architects', 'Walter Gropius', 'Zaha Hadid'], a: 0, e: 'Matthias Sauerbruch and Louisa Hutton, completed in 2005.' },
    { q: 'What used to stand on the site?', o: ['The town’s gasworks', 'A royal stable', 'A football stadium', 'An airfield'], a: 0, e: 'The contaminated soil was cleaned up first.' },
    { q: 'Which historic building is part of the agency?', o: ['The Wörlitzer Bahnhof', 'The Kornhaus', 'The Johannbau', 'The Lyzeum'], a: 0, e: 'Once the start of the Dessau-Wörlitz railway, now an information centre.' }
  ],
  raucher: [
    { q: 'What was smoked in the Räucherturm?', o: ['Meat and sausage', 'Fish', 'Tobacco', 'Cheese'], a: 0, e: 'From 1969 until reunification.' },
    { q: 'How do you reach its viewing platform?', o: ['An external metal staircase', 'A lift only', 'A spiral stair inside', 'You cannot'], a: 0, e: 'Open since 2008, for those with a head for heights.' },
    { q: 'What was made on the site until 1920?', o: ['Beer', 'Aircraft', 'Bread', 'Porcelain'], a: 0, e: 'Later came a baker’s-yeast factory.' }
  ],
  hkw: [
    { q: 'What does a combined heat and power plant make?', o: ['Electricity and heat at the same time', 'Only electricity', 'Only hot water', 'Natural gas'], a: 0, e: 'The heat goes into Dessau’s district heating network.' },
    { q: 'Since when has the plant used no coal?', o: ['2019', '1996', '1945', '2030'], a: 0, e: 'A new gas turbine took over.' },
    { q: 'What stood on the site before?', o: ['A fermentation-chemicals works', 'A royal park', 'The old station', 'A brewery'], a: 0, e: 'The Gärungschemie.' }
  ],
  mausoleum: [
    { q: 'Who designed the Mausoleum?', o: ['Franz Heinrich Schwechten', 'Walter Gropius', 'Friedrich Wilhelm von Erdmannsdorff', 'Karl Friedrich Schinkel'], a: 0, e: 'The same architect is credited with the old brick station of 1874–76.' },
    { q: 'How high is the dome?', o: ['43 m', '18 m', '73 m', '100 m'], a: 0, e: 'Its dome is 14 m across.' },
    { q: 'What happened to the ducal remains in 1958?', o: ['They were moved to a mass grave in Ziebigk', 'They went to Berlin', 'They stayed in the crypt', 'They went to the Marienkirche'], a: 0, e: 'The building was then used as a store.' }
  ],
  yhouses: [
    { q: 'Where does the name Y-house come from?', o: ['Their Y-shaped plan', 'The architect’s initial', 'A street called Y', 'The 1970s brand of panels'], a: 0, e: 'A central core with three wings.' },
    { q: 'How high are they?', o: ['About 41 m', 'About 15 m', 'About 90 m', 'About 25 m'], a: 0, e: '14 storeys, built 1969–71.' },
    { q: 'Where do the lifts stop?', o: ['Every third floor', 'Every floor', 'Only at the top', 'There are no lifts'], a: 0, e: 'Residents take the stairs from there.' }
  ],
  junkers: [
    { q: 'Where was the museum’s Ju 52 recovered from?', o: ['A lake in Norway', 'The Elbe', 'A field near Leipzig', 'A barn in Dessau'], a: 0, e: 'Lake Hartvikvann, in 1986; it reached Dessau in 1995.' },
    { q: 'When did the museum open?', o: ['2001', '1935', '1965', '2019'], a: 0, e: 'On the site of the former Junkers works.' },
    { q: 'How many patents did Hugo Junkers hold?', o: ['More than 300', 'About 12', 'About 50', 'None'], a: 0, e: 'From aircraft to gas appliances.' }
  ],
  naturkunde: [
    { q: 'How high is the museum tower?', o: ['40 m', '15 m', '73 m', '120 m'], a: 0, e: 'Fossils are shown up in the tower.' },
    { q: 'When was the museum founded?', o: ['1927', '1746', '1990', '1871'], a: 0, e: 'On the initiative of the local natural science society.' },
    { q: 'What building does it occupy?', o: ['The Leopold-Dank-Stift', 'The old station', 'A former brewery', 'The Rathaus'], a: 0, e: 'Built between 1746 and 1750.' }
  ],
  georgium: [
    { q: 'Who was the Georgium named after?', o: ['Prince Johann Georg', 'King George III', 'Saint George', 'Georg Wenzeslaus von Knobelsdorff'], a: 0, e: 'The younger brother of Prince Franz.' },
    { q: 'What collection does the house hold?', o: ['The Anhalt picture gallery', 'A car museum', 'The city archive', 'A natural history museum'], a: 0, e: 'Old Masters, including Lucas Cranach the Elder.' },
    { q: 'When were the side wings added?', o: ['In the 1890s', 'In 1780', 'In 1959', 'In 2023'], a: 0, e: 'For the widowed Hereditary Princess Elisabeth.' }
  ],
  luisium: [
    { q: 'Who was the Luisium built for?', o: ['Princess Louise', 'Prince Johann Georg', 'Anna Wilhelmine', 'Duke Friedrich I'], a: 0, e: 'Prince Franz built it for his wife, 1774–78.' },
    { q: 'Which style was it modelled on?', o: ['An English country house', 'A Gothic castle', 'A Chinese pagoda', 'A Roman temple'], a: 0, e: 'By Friedrich Wilhelm von Erdmannsdorff.' },
    { q: 'What happened at Luisium in 1817?', o: ['Prince Franz died there', 'It burned down', 'It became a school', 'It was sold'], a: 0, e: 'On 9 August 1817.' }
  ],
  mosigkau: [
    { q: 'Why is Mosigkau called “Little Sanssouci”?', o: ['The first designs probably came from Sanssouci’s architect', 'It is a copy of Sanssouci', 'Frederick the Great lived here', 'It has vineyard terraces'], a: 0, e: 'Georg Wenzeslaus von Knobelsdorff.' },
    { q: 'What is special about the gallery hall?', o: ['Its paintings hang edge to edge, almost as they always did', 'It has no windows', 'It is underground', 'It is a theatre'], a: 0, e: 'Works by van Dyck, Rubens and Jan Brueghel the Elder.' },
    { q: 'What did the palace become after Anna Wilhelmine died?', o: ['A convent for unmarried noblewomen', 'A barracks', 'A brewery', 'A railway station'], a: 0, e: 'It existed from 1780 to 1945.' }
  ],
  woerlitz: [
    { q: 'What is Schloss Wörlitz regarded as?', o: ['The first neoclassical palace in Germany', 'The oldest castle in Anhalt', 'A Bauhaus building', 'A Gothic cathedral'], a: 0, e: 'By Erdmannsdorff, 1769–73.' },
    { q: 'What stands on the island Stein?', o: ['A miniature Vesuvius', 'A lighthouse', 'A windmill', 'A pyramid'], a: 0, e: 'Next to the Villa Hamilton.' },
    { q: 'Since when is the Garden Realm a UNESCO World Heritage Site?', o: ['2000', '1996', '1773', '2019'], a: 0, e: 'It covers about 142 km².' }
  ],
  johannbau: [
    { q: 'What is the Johannbau?', o: ['The last surviving wing of the princes’ palace', 'A railway building', 'A Bauhaus workshop', 'A city gate'], a: 0, e: 'The former west wing.' },
    { q: 'When was its stair tower built?', o: ['1531–33', '1745', '1898', '2005'], a: 0, e: 'Early German Renaissance.' },
    { q: 'What does it house today?', o: ['The Museum of Town History', 'The Bauhaus archive', 'A hotel', 'The theatre workshops'], a: 0, e: 'Opened in August 2005.' }
  ]
};
function startQuiz() {
  const qs = QUIZ[curId]; if (!qs) return; stopWalk();
  let i = 0, score = 0;
  const run = () => {
    if (i >= qs.length) {
      const pass = score >= 2; PROG.quiz[curId] = Math.max(PROG.quiz[curId] || 0, score); saveProg(); refreshProgress(); updateTools();
      const lm = LMS.find(l => l.id === curId);
      if (pass) modal('Stamp earned', 'You got ' + score + ' of ' + qs.length + '. The ' + lm.name + ' is stamped in your passport.' + (allPassed() ? ' That is every stamp.' : ''), allPassed() ? [{ label: 'Get your certificate', fn: certificate }, { label: 'Close', ghost: true }] : [{ label: 'Close' }]);
      else modal('Almost there', 'You got ' + score + ' of ' + qs.length + '. Read the stories again and try once more.', [{ label: 'Try again', fn: startQuiz }, { label: 'Close', ghost: true }]);
      return;
    }
    const q = qs[i], order = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    const wrap = document.createElement('div'); const p = document.createElement('p'); p.className = 'qq'; p.textContent = q.q; wrap.appendChild(p);
    const opts = document.createElement('div'); opts.className = 'qopts'; const btns = [];
    const next = document.createElement('button'); next.type = 'button'; next.className = 'btn'; next.textContent = i < qs.length - 1 ? 'Next question' : 'See your result'; next.hidden = true; next.onclick = () => { i++; run(); };
    order.forEach(j => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'qopt'; b.textContent = q.o[j]; btns.push([b, j]);
      b.onclick = () => {
        const ok = j === q.a; if (ok) score++;
        btns.forEach(([bb, jj]) => { bb.disabled = true; if (jj === q.a) bb.classList.add('right'); else if (bb === b) bb.classList.add('wrong'); });
        const fb = document.createElement('p'); fb.className = 'qfb'; fb.textContent = (ok ? 'Right. ' : 'Not quite. ') + q.e; wrap.insertBefore(fb, next); next.hidden = false; next.focus();
      };
      opts.appendChild(b);
    });
    wrap.appendChild(opts); wrap.appendChild(next);
    modal('Question ' + (i + 1) + ' of ' + qs.length, wrap, [{ label: 'Stop the quiz', ghost: true }]);
  };
  run();
}

/* ---------- certificate ---------- */
function certificate() {
  if (!allPassed()) { const n = LMS.filter(l => passed(l.id)).length; toast('Earn all ' + LMS.length + ' stamps for your certificate. You have ' + n + ' so far: find every story in a building, then take its quiz.'); return; }
  const wrap = document.createElement('div'); const lab = document.createElement('label'); lab.textContent = 'Name on the certificate'; lab.className = 'lbl'; lab.htmlFor = 'certName';
  const inp = document.createElement('input'); inp.id = 'certName'; inp.type = 'text'; inp.maxLength = 40; inp.value = PROG.name || ''; inp.className = 'txt';
  wrap.appendChild(lab); wrap.appendChild(inp);
  modal('Your Dessau explorer certificate', wrap, [{ label: 'Create certificate', fn: () => { PROG.name = inp.value.trim(); saveProg(); drawCertificate(PROG.name); } }, { label: 'Cancel', ghost: true }]);
  setTimeout(() => inp.focus(), 50);
}
function drawCertificate(name) {
  const W = 1600, H = 1130, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const F = s => s + 'px Jost, Futura, "Century Gothic", Arial, sans-serif';
  g.fillStyle = '#eceeed'; g.fillRect(0, 0, W, H); g.fillStyle = '#16171a'; g.fillRect(0, 0, W, 18);
  g.fillStyle = '#c8372d'; g.fillRect(90, 90, 46, 46); g.fillStyle = '#efc12c'; g.beginPath(); g.arc(178, 113, 23, 0, 7); g.fill();
  g.fillStyle = '#1f4fa3'; g.beginPath(); g.moveTo(214, 136); g.lineTo(240, 90); g.lineTo(266, 136); g.closePath(); g.fill();
  g.fillStyle = '#16171a'; g.font = '500 ' + F(108); g.fillText('dessau explorer', 90, 260);
  g.font = '400 ' + F(32); g.fillStyle = '#5b6064'; g.fillText('This certifies that', 92, 340);
  g.font = '500 ' + F(76); g.fillStyle = '#16171a'; g.fillText(name || 'an explorer', 90, 430);
  g.font = '400 ' + F(32); g.fillStyle = '#5b6064'; g.fillText('discovered the stories of ' + LMS.length + ' Dessau landmarks and earned every stamp.', 92, 490);
  const cols = 6, cw = (W - 160) / cols;
  LMS.forEach((l, i) => {
    const cx = 80 + cw * (i % cols + 0.5), cy = 620 + Math.floor(i / cols) * 170;
    g.strokeStyle = '#c8372d'; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, 48, 0, 7); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 40, 0, 7); g.stroke();
    g.fillStyle = '#c8372d'; g.font = '600 ' + F(30); g.textAlign = 'center'; g.fillText(String(i + 1), cx, cy + 10);
    g.fillStyle = '#16171a'; g.font = '500 ' + F(17); g.fillText(l.name, cx, cy + 72); g.textAlign = 'left';
  });
  g.fillStyle = '#5b6064'; g.font = '400 ' + F(24); g.fillText(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), 92, H - 60);
  g.textAlign = 'right'; g.fillText('DESSCOVER online', W - 92, H - 60); g.textAlign = 'left';
  canvasOut(c, 'desscover-certificate.png');
}

/* ---------- postcards ---------- */
function postcard(caption) {
  render(0);
  const shot = dom.toDataURL('image/png');
  const img = new Image();
  img.onload = () => {
    const W = 1800, H = 1240, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, W, H);
    const bw = W - 120, bh = 900, r = Math.max(bw / img.width, bh / img.height), sw = bw / r, sh = bh / r;
    g.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 60, 60, bw, bh);
    const F = s => s + 'px Jost, Futura, "Century Gothic", Arial, sans-serif';
    g.fillStyle = '#c8372d'; g.fillRect(60, 1010, 34, 34); g.fillStyle = '#efc12c'; g.beginPath(); g.arc(128, 1027, 17, 0, 7); g.fill();
    g.fillStyle = '#1f4fa3'; g.beginPath(); g.moveTo(152, 1044); g.lineTo(171, 1010); g.lineTo(190, 1044); g.closePath(); g.fill();
    g.fillStyle = '#16171a'; g.font = '500 ' + F(70); g.fillText('greetings from dessau', 60, 1135);
    const lm = cur ? LMS.find(l => l.id === curId) : null;
    g.font = '400 ' + F(30); g.fillStyle = '#5b6064';
    const era = cur && cur.eras && cur.eraIdx != null ? cur.eras[cur.eraIdx].year + ', ' : '';
    g.fillText(typeof caption === 'string' ? caption : (lm ? lm.label + ', ' + era : 'The map of Dessau, ') + fmt(timeNow) + ' on ' + { dec: '4 December', mar: '21 March', jun: '21 June' }[dateKey], 60, 1190);
    g.textAlign = 'right'; g.font = '500 ' + F(28); g.fillStyle = '#16171a'; g.fillText('DESSCOVER online', W - 60, 1135); g.textAlign = 'left';
    canvasOut(c, 'desscover-postcard' + (lm ? '-' + lm.id : '') + '.png');
  };
  img.src = shot;
}

/* ---------- famous views ---------- */
function buildViews() {
  const el = $('viewChips'); el.innerHTML = '';
  [{ label: 'Overview', cam: cur.intro.pos, tgt: cur.intro.tgt }].concat(cur.views || []).forEach(v => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = v.label;
    b.onclick = () => { stopWalk(); flyTo(rotPt(v.cam), rotPt(v.tgt), 1700); if (v.note) toast(v.note, null, null, 7000); };
    el.appendChild(b);
  });
}

/* ---------- residents ---------- */
const RESIDENTS = {
  bauhaus: [
    { ini: 'MB', name: 'Marianne Brandt', years: 'at the Bauhaus 1924–29', pos: [63.8, 9.6, -0.1], off: [-22, -4], text: 'Marianne Brandt (1893–1983) joined the metal workshop and designed some of its best-known lamps and tea and coffee pieces. In 1928 and 1929 she ran the workshop. The Kornhaus lamps follow her designs.' },
    { ini: 'MB', name: 'Marcel Breuer', years: 'workshop head 1925–28', pos: [63.8, 13, 4.4], off: [-22, -4], text: 'Marcel Breuer (1902–1981) studied at the Bauhaus in Weimar and ran the furniture workshop in Dessau from 1925 to 1928, where he developed his tubular steel chairs.' },
    { ini: 'GS', name: 'Gunta Stölzl', years: 'master from 1927', pos: [63.8, 16.4, 9], off: [-22, -4], text: 'Gunta Stölzl (1897–1983) led the weaving workshop and in 1927 became the only woman to hold the rank of Bauhaus master.' },
    { ini: 'JA', name: 'Josef and Anni Albers', years: 'in Dessau from 1925', pos: [63.8, 6.2, 13.5], off: [-22, -4], text: 'Josef Albers (1888–1976) taught the preliminary course, and Anni Albers (1899–1994) became one of the weaving workshop’s leading designers. In 1928 Josef moved into the Masters’ House left by Moholy-Nagy.' }
  ],
  meister: [
    { ini: 'WG', name: 'Walter and Ise Gropius', years: '1926–28', pos: [69, 9, 0], text: 'Walter Gropius founded the Bauhaus in Weimar in 1919 and directed it until 1928. This detached house was built for the director.' },
    { ini: 'LM', name: 'László Moholy-Nagy', years: '1926–28', pos: [26.5, 10.4, -0.5], text: 'The Hungarian artist ran the metal workshop and the preliminary course and championed photography. Josef Albers moved into this half after him in 1928.' },
    { ini: 'LF', name: 'Lyonel Feininger', years: '1926–32', pos: [13.5, 10.4, 2.5], text: 'The painter was the first master Gropius appointed in 1919, and his woodcut of a cathedral illustrated the Bauhaus manifesto. He lived here with his family until 1932.' },
    { ini: 'MS', name: 'Georg Muche and Oskar Schlemmer', years: '1926–29', pos: [-30, 10.4, 1], text: 'Georg Muche, form master of the weaving workshop, designed the Haus am Horn in Weimar; Hinnerk Scheper of the mural workshop took over his half in 1927. Oskar Schlemmer led the stage workshop and created the Triadic Ballet; Alfred Arndt followed him in 1929.' },
    { ini: 'KK', name: 'Wassily Kandinsky and Paul Klee', years: '1926–32', pos: [-80, 10.4, 1], text: 'Kandinsky taught at the Bauhaus from 1922 and published Point and Line to Plane as a Bauhaus book in 1926. Klee taught from 1921 and lived here with Lily and Felix until he left for Düsseldorf in 1931.' }
  ]
};
let showPeople = false;
function buildPeople() {
  const box = $('people'); box.innerHTML = ''; showPeople = false; box.hidden = true; $('peopleBtn').setAttribute('aria-pressed', 'false');
  (RESIDENTS[curId] || []).forEach(r => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'rp';
    const i = document.createElement('span'); i.className = 'ini'; i.textContent = r.ini; const t = document.createElement('span'); t.textContent = r.name;
    b.appendChild(i); b.appendChild(t); b.onclick = () => showResident(r); box.appendChild(b); r.el = b;
    r.v = new THREE.Vector3(r.pos[0] + (r.off ? r.off[0] : 0), r.pos[1], r.pos[2] + (r.off ? r.off[1] : 0));
  });
}
function togglePeople() { showPeople = !showPeople; $('people').hidden = !showPeople; $('peopleBtn').setAttribute('aria-pressed', showPeople ? 'true' : 'false'); if (showPeople) toast('Click a name to meet the people who lived here.'); }
function showResident(r) {
  closeFact(); $('cNum').textContent = r.ini; $('cTitle').textContent = r.name; $('cYear').textContent = r.years; $('cText').textContent = r.text;
  $('cSrc').textContent = 'Resident'; $('prevFact').hidden = true; $('nextFact').hidden = true; $('card').hidden = false;
}

/* ---------- walking ---------- */
const WALK = { on: false, yaw: 0, pitch: 0, pos: new THREE.Vector3(), keys: new Set(), drag: null };
const WALK_CODES = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight']);
function startWalk() {
  if (!cur) return; stopReplay(); closeDress(); tween = null;
  const dir = controls.target.clone().sub(camera.position); dir.y = 0; if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1); dir.normalize();
  const lim = cur.span * 1.05; let p = camera.position.clone();
  if (Math.abs(p.x - cur.center.x) > lim * 0.8 || Math.abs(p.z - cur.center.z) > lim * 0.8) p = controls.target.clone().addScaledVector(dir, -30);
  WALK.pos.set(clamp(p.x, cur.center.x - lim, cur.center.x + lim), 1.7, clamp(p.z, cur.center.z - lim, cur.center.z + lim));
  WALK.yaw = Math.atan2(dir.x, dir.z); WALK.pitch = 0; WALK.on = true; controls.enabled = false;
  $('walkHud').hidden = false; $('walkBtn').setAttribute('aria-pressed', 'true'); hideTip();
}
function stopWalk() {
  if (!WALK.on) return; WALK.on = false; WALK.keys.clear(); WALK.drag = null; controls.enabled = true;
  const f = new THREE.Vector3(Math.sin(WALK.yaw), 0, Math.cos(WALK.yaw));
  controls.target.copy(camera.position).addScaledVector(f, 12); controls.target.y = Math.max(1, camera.position.y - 1); controls.update();
  $('walkHud').hidden = true; $('walkBtn').setAttribute('aria-pressed', 'false');
}
function updateWalk(dt) {
  const k = WALK.keys, sp = (k.has('ShiftLeft') || k.has('ShiftRight') ? 9 : 4) * dt;
  if (k.has('KeyQ')) WALK.yaw += 1.6 * dt; if (k.has('KeyE')) WALK.yaw -= 1.6 * dt;
  const fw = new THREE.Vector3(Math.sin(WALK.yaw), 0, Math.cos(WALK.yaw)), rt = new THREE.Vector3(-Math.cos(WALK.yaw), 0, Math.sin(WALK.yaw));
  if (k.has('KeyW') || k.has('ArrowUp')) WALK.pos.addScaledVector(fw, sp);
  if (k.has('KeyS') || k.has('ArrowDown')) WALK.pos.addScaledVector(fw, -sp);
  if (k.has('KeyD') || k.has('ArrowRight')) WALK.pos.addScaledVector(rt, sp);
  if (k.has('KeyA') || k.has('ArrowLeft')) WALK.pos.addScaledVector(rt, -sp);
  const lim = cur.span * 1.05;
  WALK.pos.x = clamp(WALK.pos.x, cur.center.x - lim, cur.center.x + lim); WALK.pos.z = clamp(WALK.pos.z, cur.center.z - lim, cur.center.z + lim);
  let gy = 0; if (cur.groundAt) { const lp = fromW(WALK.pos.clone()); gy = cur.groundAt(lp.x, lp.z); }
  WALK.pos.y += ((1.7 + gy) - WALK.pos.y) * 0.25;
  camera.position.copy(WALK.pos);
  const look = new THREE.Vector3(Math.sin(WALK.yaw) * Math.cos(WALK.pitch), Math.sin(WALK.pitch), Math.cos(WALK.yaw) * Math.cos(WALK.pitch));
  camera.lookAt(WALK.pos.clone().add(look));
}
document.querySelectorAll('#walkPad button').forEach(b => {
  const code = b.getAttribute('data-code');
  const on = e => { e.preventDefault(); WALK.keys.add(code); }, off = () => WALK.keys.delete(code);
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
});
window.addEventListener('keyup', e => { WALK.keys.delete(e.code); });
window.addEventListener('blur', () => WALK.keys.clear());

/* ---------- build replay ---------- */
const GROUNDMATS = new Set(['lawn', 'paving', 'asphalt', 'cobble', 'gravel', 'ballast', 'sand', 'water', 'soil']);
const REPLAY = { on: false, t0: 0, dur: 9000, plane: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), maxY: 30, mats: [], sheet: null };
function startReplay() {
  if (!cur || REPLAY.on) return; stopWalk(); closeDress(); closeFact();
  renderer.localClippingEnabled = true;
  const mats = new Set(); let maxY = 5; const bb = new THREE.Box3();
  cur.scene.traverse(o => {
    if (!o.isMesh || o === skyMesh || !visChain(o)) return;
    const key = MATNAME.get(o.userData.baseMat || o.material); if (!key || GROUNDMATS.has(key)) return;
    mats.add(o.material);
    if (!o.isInstancedMesh) { bb.setFromObject(o); if (bb.max.y < 120) maxY = Math.max(maxY, bb.max.y); }
  });
  REPLAY.mats = [...mats]; REPLAY.mats.forEach(m => { m.clippingPlanes = [REPLAY.plane]; m.clipShadows = true; m.needsUpdate = true; });
  REPLAY.maxY = maxY + 0.5; REPLAY.plane.constant = 0; REPLAY.on = true; REPLAY.t0 = performance.now(); REPLAY.dur = REDUCED ? 1500 : 9000;
  if (gtao) gtao.enabled = false;
  const sz = cur.span * 2.3;
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz), new THREE.MeshBasicMaterial({ color: 0xf2b705, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
  sheet.rotation.x = -Math.PI / 2; sheet.position.copy(cur.center); sheet.userData.noAO = true; cur.scene.add(sheet); REPLAY.sheet = sheet;
  const lm = LMS.find(l => l.id === curId); toast('Building the ' + lm.name + ', ' + lm.years + '.', null, null, REPLAY.dur);
  $('buildBtn').setAttribute('aria-pressed', 'true');
}
function updateReplay(now) {
  if (!REPLAY.on) return;
  const u = clamp((now - REPLAY.t0) / REPLAY.dur, 0, 1), h = REPLAY.maxY * smooth(u);
  REPLAY.plane.constant = h; if (REPLAY.sheet) REPLAY.sheet.position.y = h;
  if (u >= 1) stopReplay();
}
function stopReplay() {
  if (!REPLAY.on) return; REPLAY.on = false;
  REPLAY.mats.forEach(m => { m.clippingPlanes = null; m.needsUpdate = true; }); REPLAY.mats = [];
  if (REPLAY.sheet) { if (REPLAY.sheet.parent) REPLAY.sheet.parent.remove(REPLAY.sheet); REPLAY.sheet.geometry.dispose(); REPLAY.sheet.material.dispose(); REPLAY.sheet = null; }
  if (gtao) gtao.enabled = true; $('buildBtn').setAttribute('aria-pressed', 'false');
}

/* ---------- redesign ---------- */
const SWATCHES = [
  ['white', 'mineral white', '#eceae4'], ['renderWarm', 'warm render', '#e6dcc8'], ['grey', 'grey render', '#8d9093'], ['ochre', 'ochre', '#c8a46a'],
  ['bauRed', 'vermilion', '#c8372d'], ['bauBlue', 'cobalt blue', '#1f4fa3'], ['bauYellow', 'barium yellow', '#efc12c'], ['black', 'black', '#1b1b1c'],
  ['brick', 'brick', '#a4583c'], ['concrete', 'concrete', '#bab9b3'], ['stone', 'sandstone', '#d2c3a8'], ['camo', 'camouflage', '#6b6a4e'],
  ['glass', 'crystal glass', '#8faab2'], ['glassSmoked', 'smoked glass', '#1d2c35'], ['frost', 'frosted glass', '#e6edef'],
  ['frame', 'black steel', '#1f2022'], ['alu', 'aluminium', '#a8adb1'], ['copper', 'copper', '#6f9e8b'], ['rust', 'rust', '#7b4a33']
];
const LABEL = { white: 'white render', grey: 'grey render', renderWarm: 'warm render', stone: 'sandstone', stoneLight: 'pale stone', glass: 'glass', glassDark: 'glass', museumGlass: 'glass', frame: 'steel frames', whiteInt: 'white details', slate: 'slate', tiles: 'roof tiles', copper: 'copper', blackbox: 'black concrete', red: 'red details', kornBlue: 'blue details', newWhite: 'new white render', frost: 'frosted glass', roof: 'flat roofs', ceilO: 'ceiling colour', ceilY: 'ceiling colour', ceilB: 'ceiling colour', concrete: 'concrete', canopy: 'canopies', train: 'train', tram: 'tram', steel: 'steel', wood: 'wood' };
const DRESS = { on: false, key: null };
(function () {
  const el = $('swatches');
  SWATCHES.forEach(sw => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sw';
    const c = document.createElement('i'); c.style.background = sw[2]; const t = document.createElement('span'); t.textContent = sw[1];
    b.appendChild(c); b.appendChild(t); b.onclick = () => dressApply(sw[0]); el.appendChild(b);
  });
})();
function openDress() { stopWalk(); stopReplay(); closeFact(); DRESS.on = true; DRESS.key = null; $('dressTray').hidden = false; $('dressSel').textContent = 'Click a surface of the building, then a swatch.'; $('dressBtn').setAttribute('aria-pressed', 'true'); }
function closeDress() { DRESS.on = false; DRESS.key = null; $('dressTray').hidden = true; $('dressBtn').setAttribute('aria-pressed', 'false'); }
function dressPick(h) { const key = MATNAME.get(h.object.userData.baseMat || h.object.material); if (!key) return; DRESS.key = key; $('dressSel').textContent = 'Selected: ' + (LABEL[key] || key) + '. Now choose a swatch.'; }
function dressApply(id) { if (!cur) return; if (!DRESS.key) { toast('Click a surface of the building first.'); return; } cur.dress = cur.dress || {}; cur.dress[DRESS.key] = MAT[id]; applyOverrides(); }
function dressReset() { if (!cur) return; cur.dress = {}; applyOverrides(); toast('Back to the real materials.'); }

/* ---------- the Bauhaus trail on the map ---------- */
const TRAIL = [[0, 0, 'hbf'], [-140, 40], [-200, -140, 'lyzeum'], [-260, 20], [-470, 40, 'bauhaus'], [-575, -60], [-575, -290], [-800, -320], [-990, -345, 'meister']];
const TR = { on: false, s: 0, cum: [0], total: 0, line: null, dot: null, pause: 0, next: 1, done: false };
for (let i = 1; i < TRAIL.length; i++) TR.cum.push(TR.cum[i - 1] + Math.hypot(TRAIL[i][0] - TRAIL[i - 1][0], TRAIL[i][1] - TRAIL[i - 1][1]));
TR.total = TR.cum[TR.cum.length - 1];
function trailPoint(s) {
  for (let i = 1; i < TRAIL.length; i++) if (s <= TR.cum[i]) { const u = (s - TR.cum[i - 1]) / ((TR.cum[i] - TR.cum[i - 1]) || 1), a = TRAIL[i - 1], b = TRAIL[i]; return { x: a[0] + (b[0] - a[0]) * u, z: a[1] + (b[1] - a[1]) * u, dx: b[0] - a[0], dz: b[1] - a[1] }; }
  const l = TRAIL[TRAIL.length - 1], p = TRAIL[TRAIL.length - 2]; return { x: l[0], z: l[1], dx: l[0] - p[0], dz: l[1] - p[1] };
}
function startTrail() {
  if (curId !== 'map') { go('map').then(() => setTimeout(startTrail, 700)); return; }
  if (!TR.line) {
    const pts = TRAIL.map(p => new THREE.Vector3(p[0] * MS, 1.2, p[1] * MS)), path = new THREE.CurvePath();
    for (let i = 1; i < pts.length; i++) path.add(new THREE.LineCurve3(pts[i - 1], pts[i]));
    TR.line = new THREE.Mesh(new THREE.TubeGeometry(path, 240, 0.7, 6, false), new THREE.MeshStandardMaterial({ color: 0xc8372d, emissive: 0x5a120c, roughness: 0.6 }));
    TR.dot = new THREE.Mesh(new THREE.SphereGeometry(2.4, 20, 14), new THREE.MeshStandardMaterial({ color: 0xefc12c, emissive: 0x6a5000 }));
    [TR.line, TR.dot].forEach(m => { m.userData.noAO = true; noAO.add(m); mapData.scene.add(m); });
  }
  TR.line.visible = true; TR.dot.visible = true; TR.on = true; TR.done = false; TR.s = 0; TR.next = 1; TR.pause = performance.now() + 1500; tween = null;
  $('trailBtn').textContent = 'Stop the trail';
  toast('The Bauhaus trail starts at the station: ' + (TR.total / 1000).toFixed(1) + ' km, about ' + Math.round(TR.total / 80) + ' minutes on foot. Routes are simplified.', null, null, 4000);
}
function stopTrail() { if (!TR.on) return; TR.on = false; if (TR.dot) TR.dot.visible = false; $('trailBtn').textContent = 'Walk the Bauhaus trail'; }
function updateTrail(dt, now) {
  if (!TR.on) return;
  if (now >= TR.pause) {
    if (TR.done) { TR.on = false; $('trailBtn').textContent = 'Walk the Bauhaus trail'; toast('Trail complete: ' + (TR.total / 1000).toFixed(1) + ' km from the station to the Masters’ Houses, about ' + Math.round(TR.total / 80) + ' minutes on foot.', 'Open the Masters’ Houses', () => go('meister'), 7000); return; }
    TR.s = Math.min(TR.total, TR.s + dt * 130);
    for (let i = TR.next; i < TRAIL.length; i++) {
      if (TRAIL[i][2] && TR.cum[i] <= TR.s + 0.01) {
        TR.next = i + 1; TR.pause = now + 2800; const id = TRAIL[i][2], lm = LMS.find(l => l.id === id);
        toast('Stop: ' + lm.name + ', about ' + Math.max(1, Math.round(TR.cum[i] / 80)) + ' minutes on foot from the station.', 'Open in 3D', () => { stopTrail(); go(id); }, 2800);
        if (i === TRAIL.length - 1) TR.done = true;
        break;
      }
    }
  }
  const pt = trailPoint(TR.s); TR.dot.position.set(pt.x * MS, 3, pt.z * MS);
  const d = new THREE.Vector3(pt.dx, 0, pt.dz); if (d.lengthSq() < 1e-6) d.set(0, 0, -1); d.normalize();
  const tgt = new THREE.Vector3(pt.x * MS, 0, pt.z * MS), want = tgt.clone().addScaledVector(d, -60); want.y = 52;
  camera.position.lerp(want, 0.035); controls.target.lerp(tgt, 0.08);
}

/* ---------- wiring ---------- */
$('postcardBtn').onclick = postcard;

/* ---------- movable, collapsible panels ---------- */
const UIP = { key: 'dessau-ui-v1', st: {}, top: null };
try { UIP.st = JSON.parse(localStorage.getItem(UIP.key) || '{}') || {}; } catch (e) { UIP.st = {}; }
function uipSave() { try { localStorage.setItem(UIP.key, JSON.stringify(UIP.st)); } catch (e) {} }
function uipClamp(el) {
  if (!el.style.left) return; const r = el.getBoundingClientRect(), w = r.width || 120;
  const l = Math.min(Math.max(parseFloat(el.style.left), 40 - w), innerWidth - 60), t = Math.min(Math.max(parseFloat(el.style.top), 0), innerHeight - 28);
  el.style.left = l + 'px'; el.style.top = t + 'px';
}
function uipPlace(el, l, t) { el.style.left = l + 'px'; el.style.top = t + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.transform = 'none'; uipClamp(el); }
function uipRemember(el) { const s = UIP.st[el.id] = UIP.st[el.id] || {}; s.l = parseFloat(el.style.left); s.t = parseFloat(el.style.top); uipSave(); }
function uipReset(el) { ['left', 'top', 'right', 'bottom', 'transform', 'zIndex'].forEach(p => { el.style[p] = ''; }); if (UIP.st[el.id]) { delete UIP.st[el.id].l; delete UIP.st[el.id].t; } uipSave(); }
function uipCollapse(el, on) {
  el.classList.toggle('collapsed', on); const b = el.querySelector(':scope > .ptab .pcol');
  if (b) { b.textContent = on ? '+' : '–'; b.setAttribute('aria-expanded', on ? 'false' : 'true'); b.title = on ? 'Expand' : 'Collapse'; }
  (UIP.st[el.id] = UIP.st[el.id] || {}).c = on; uipSave(); if (el.style.left) uipClamp(el);
}
function uipFront(el) { if (UIP.top && UIP.top !== el) UIP.top.style.zIndex = ''; el.style.zIndex = 8; UIP.top = el; }
[['newsPanel', 'City news'], ['aboutPanel', 'About'], ['intro', 'DESSCOVER online'], ['lmlist', 'Landmarks'], ['bhead', 'Building'], ['bpanel', 'Tools and stories'], ['card', 'Story'], ['dressTray', 'Redesign'], ['walkHud', 'Walk'], ['byoTray', 'Build your own house']].forEach(([id, name]) => {
  const el = $(id); if (!el) return;
  const tab = document.createElement('div'); tab.className = 'ptab';
  const grip = document.createElement('button'); grip.type = 'button'; grip.className = 'grip' + (id === 'intro' ? ' keepcase' : ''); grip.title = 'Drag to move. Double-click to put it back.';
  grip.setAttribute('aria-label', 'Move the ' + name + ' panel: use the arrow keys, or double-click to put it back');
  const dots = document.createElement('span'); dots.className = 'dots'; dots.setAttribute('aria-hidden', 'true'); dots.textContent = '⠿'; grip.appendChild(dots); grip.appendChild(document.createTextNode(name));
  const col = document.createElement('button'); col.type = 'button'; col.className = 'pcol'; col.textContent = '–'; col.title = 'Collapse'; col.setAttribute('aria-expanded', 'true'); col.setAttribute('aria-label', 'Collapse or expand the ' + name + ' panel');
  tab.appendChild(grip); tab.appendChild(col); el.insertBefore(tab, el.firstChild);
  const fit = () => { const cs = getComputedStyle(el); tab.style.margin = '-' + cs.paddingTop + ' -' + cs.paddingRight + ' 10px -' + cs.paddingLeft; tab.style.top = '-' + cs.paddingTop; if (cs.display === 'flex') { el.style.flexWrap = 'wrap'; tab.style.flexBasis = 'calc(100% + ' + cs.paddingLeft + ' + ' + cs.paddingRight + ')'; } };
  fit(); new MutationObserver(() => { if (!el.hidden && !tab.style.margin.startsWith('-')) fit(); }).observe(el, { attributes: true, attributeFilter: ['hidden'] });
  col.addEventListener('click', e => { e.stopPropagation(); uipCollapse(el, !el.classList.contains('collapsed')); });
  let drag = null;
  grip.addEventListener('pointerdown', e => { if (e.button !== 0) return; const r = el.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, moved: false }; grip.setPointerCapture(e.pointerId); uipFront(el); e.preventDefault(); e.stopPropagation(); });
  grip.addEventListener('pointermove', e => { if (!drag) return; if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 4) return; drag.moved = true; el.classList.add('dragging'); uipPlace(el, e.clientX - drag.dx, e.clientY - drag.dy); });
  const end = () => { if (!drag) return; el.classList.remove('dragging'); if (drag.moved) uipRemember(el); drag = null; };
  grip.addEventListener('pointerup', end); grip.addEventListener('pointercancel', end);
  grip.addEventListener('dblclick', e => { e.preventDefault(); uipReset(el); });
  grip.addEventListener('keydown', e => { const d = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }[e.key]; if (!d) return; e.preventDefault(); e.stopPropagation(); const r = el.getBoundingClientRect(); uipFront(el); uipPlace(el, r.left + d[0], r.top + d[1]); uipRemember(el); });
  el.addEventListener('pointerdown', () => uipFront(el));
  const st = UIP.st[id]; if (st) { if (st.l != null && isFinite(st.l)) uipPlace(el, st.l, st.t); if (st.c) uipCollapse(el, true); }
});
addEventListener('resize', () => document.querySelectorAll('.ui').forEach(el => { if (el.style.left && el.querySelector(':scope > .ptab')) uipClamp(el); }));
$('layoutBtn').onclick = () => { document.querySelectorAll('.ui').forEach(el => { if (el.querySelector(':scope > .ptab')) { uipReset(el); if (el.classList.contains('collapsed')) uipCollapse(el, false); } }); UIP.st = {}; uipSave(); toast('All panels are back in place.'); };

/* ================================================================
   ACTIVITIES: build your own Masters' House, visitor notes, ask the building
   ================================================================ */
async function capUse(name) {
  for (let i = 0; i < 20 && !(window.claude && window.claude.use); i++) await wait(250);
  if (!(window.claude && window.claude.use)) return null;
  try { return await window.claude.use(name); } catch (e) { return null; }
}

/* ---------- 1. Build your own Masters' House ---------- */
const BYO = { on: false, grp: null, plane: null, grid: null, ghost: null, size: 0, color: 0, erase: false, rot: false, blocks: [], key: 'dessau-byo-v1' };
const BYO_PLOT = { x0: 89, x1: 107, z0: -8, z1: 14 }, BYO_G = 1.5;
const BYO_SIZES = [['Cube', 3, 3, 3], ['Slab', 6, 0.6, 3], ['Tower', 3, 6, 3], ['Wing', 6, 3, 3], ['Balcony', 4.5, 0.3, 1.5], ['Pillar', 0.6, 3, 0.6], ['Window', 3, 1.5, 0.3]];
const BYO_COLS = [['white', 'White', '#eceae4'], ['grey', 'Grey', '#8d9093'], ['black', 'Black', '#1b1b1c'], ['bauRed', 'Red', '#c8372d'], ['bauYellow', 'Yellow', '#efc12c'], ['bauBlue', 'Blue', '#1f4fa3'], ['glass', 'Glass', '#8faab2']];
function byoEnsure() {
  if (curId !== 'meister' || !cur) return;
  if (BYO.grp && BYO.grp.parent === cur.scene) return;
  BYO.grp = new THREE.Group(); BYO.grp.rotation.y = cur.rotY || 0; if (cur.mirror) BYO.grp.scale.x = -1; cur.scene.add(BYO.grp);
  const W = BYO_PLOT.x1 - BYO_PLOT.x0, Dp = BYO_PLOT.z1 - BYO_PLOT.z0, cx = (BYO_PLOT.x0 + BYO_PLOT.x1) / 2, cz = (BYO_PLOT.z0 + BYO_PLOT.z1) / 2;
  const pg = new THREE.PlaneGeometry(W, Dp); pg.rotateX(-Math.PI / 2); pg.translate(cx, 0.08, cz);
  BYO.plane = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); BYO.grp.add(BYO.plane);
  const gl = []; for (let x = BYO_PLOT.x0; x <= BYO_PLOT.x1 + 0.01; x += BYO_G) gl.push(x, 0.1, BYO_PLOT.z0, x, 0.1, BYO_PLOT.z1); for (let z = BYO_PLOT.z0; z <= BYO_PLOT.z1 + 0.01; z += BYO_G) gl.push(BYO_PLOT.x0, 0.1, z, BYO_PLOT.x1, 0.1, z);
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(gl, 3));
  BYO.grid = new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })); BYO.grid.visible = false; BYO.grp.add(BYO.grid);
  BYO.ghost = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false })); BYO.ghost.visible = false; BYO.grp.add(BYO.ghost);
  [BYO.plane, BYO.grid, BYO.ghost].forEach(o => { o.userData.noAO = true; noAO.add(o); });
  BYO.blocks = []; let saved = []; try { saved = JSON.parse(localStorage.getItem(BYO.key) || '[]') || []; } catch (e) { saved = []; }
  saved.slice(0, 400).forEach(b => { if (b && Array.isArray(b.d) && BYO_COLS.some(c => c[0] === b.c)) byoAdd(b, false); });
}
function byoAdd(b, save) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(b.d[0], b.d[1], b.d[2]), MAT[b.c]); m.position.set(b.x, b.y, b.z);
  m.castShadow = b.c !== 'glass'; m.receiveShadow = true; m.userData.byo = b; BYO.grp.add(m); BYO.blocks.push({ b, mesh: m });
  if (save !== false) byoSave();
}
function byoRemove(entry) { const i = BYO.blocks.indexOf(entry); if (i < 0) return; BYO.grp.remove(entry.mesh); entry.mesh.geometry.dispose(); BYO.blocks.splice(i, 1); byoSave(); }
function byoSave() { try { localStorage.setItem(BYO.key, JSON.stringify(BYO.blocks.map(e => e.b))); } catch (e) {} byoStatus(); }
function byoStatus() {
  const n = BYO.blocks.length, s = BYO_SIZES[BYO.size], c = BYO_COLS[BYO.color];
  $('byoSel').textContent = BYO.erase ? 'Remove: click a block to take it away.' : (n ? n + (n === 1 ? ' block' : ' blocks') + '. ' : '') + 'Placing a ' + c[1].toLowerCase() + ' ' + s[0].toLowerCase() + (BYO.rot ? ', turned' : '') + '. Click the plot or a block to stack.';
}
function byoDims() { const s = BYO_SIZES[BYO.size]; return BYO.rot ? [s[3], s[2], s[1]] : [s[1], s[2], s[3]]; }
function byoTarget(cx, cy) {
  setRay(cx, cy); const hits = rc.intersectObjects([BYO.plane].concat(BYO.blocks.map(e => e.mesh)), false); if (!hits.length) return null;
  const h = hits[0], entry = BYO.blocks.find(e => e.mesh === h.object) || null, p = BYO.grp.worldToLocal(h.point.clone());
  if (entry && h.face && Math.abs(h.face.normal.y) < 0.5) { p.x += h.face.normal.x * 0.8; p.z += h.face.normal.z * 0.8; }
  const [w, hh, d] = byoDims(), sn = (v, o, len, lo, hi) => Math.min(Math.max(o + Math.round((v - o - len / 2) / BYO_G) * BYO_G + len / 2, lo + len / 2), hi - len / 2);
  const x = sn(p.x, BYO_PLOT.x0, w, BYO_PLOT.x0, BYO_PLOT.x1), z = sn(p.z, BYO_PLOT.z0, d, BYO_PLOT.z0, BYO_PLOT.z1);
  let base = 0; BYO.blocks.forEach(e => { const b = e.b; if (Math.abs(b.x - x) < (b.d[0] + w) / 2 - 0.01 && Math.abs(b.z - z) < (b.d[2] + d) / 2 - 0.01) base = Math.max(base, b.y + b.d[1] / 2); });
  return { entry, x, z, y: base + hh / 2, w, h: hh, d, tooHigh: base + hh > 24 };
}
function byoHover(e) {
  const t = byoTarget(e.clientX, e.clientY); if (!t) { BYO.ghost.visible = false; dom.style.cursor = ''; return; }
  dom.style.cursor = 'crosshair';
  if (BYO.erase || e.shiftKey) { if (t.entry) { const b = t.entry.b; BYO.ghost.visible = true; BYO.ghost.scale.set(b.d[0] + 0.1, b.d[1] + 0.1, b.d[2] + 0.1); BYO.ghost.position.set(b.x, b.y, b.z); BYO.ghost.material.color.set(0xc8372d); } else BYO.ghost.visible = false; return; }
  BYO.ghost.visible = !t.tooHigh; BYO.ghost.scale.set(t.w, t.h, t.d); BYO.ghost.position.set(t.x, t.y, t.z); BYO.ghost.material.color.set(BYO_COLS[BYO.color][2]);
}
function byoClick(e) {
  const t = byoTarget(e.clientX, e.clientY); if (!t) return;
  if (BYO.erase || e.shiftKey) { if (t.entry) byoRemove(t.entry); return; }
  if (t.tooHigh) { toast('That is as high as the plot allows.'); return; }
  if (BYO.blocks.length >= 400) { toast('That is the most blocks one plot can hold.'); return; }
  byoAdd({ d: [t.w, t.h, t.d], c: BYO_COLS[BYO.color][0], x: +t.x.toFixed(2), y: +t.y.toFixed(2), z: +t.z.toFixed(2) });
}
function byoStart() {
  if (curId !== 'meister' || !cur) return;
  stopWalk(); stopReplay(); closeDress(); closeFact(); byoEnsure();
  BYO.on = true; BYO.grid.visible = true; $('byoTray').hidden = false; $('byoBtn').setAttribute('aria-pressed', 'true');
  const cx = (BYO_PLOT.x0 + BYO_PLOT.x1) / 2, cz = (BYO_PLOT.z0 + BYO_PLOT.z1) / 2;
  flyTo(rotPt([cx - 24, 17, cz - 30]), rotPt([cx, 3, cz]), 1500); byoStatus();
}
function byoClose() { if (!BYO.on) return; BYO.on = false; if (BYO.ghost) BYO.ghost.visible = false; if (BYO.grid) BYO.grid.visible = false; $('byoTray').hidden = true; $('byoBtn').setAttribute('aria-pressed', 'false'); dom.style.cursor = ''; }
(function byoUI() {
  const sz = $('byoSizes'); BYO_SIZES.forEach((s, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = s[0]; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); b.onclick = () => { BYO.size = i; [...sz.children].forEach((c, j) => c.setAttribute('aria-pressed', j === i ? 'true' : 'false')); BYO.erase = false; $('byoErase').setAttribute('aria-pressed', 'false'); byoStatus(); }; sz.appendChild(b); });
  const cl = $('byoCols'); BYO_COLS.forEach((c, i) => { const b = document.createElement('button'); b.type = 'button'; b.title = c[1]; b.setAttribute('aria-label', c[1]); b.style.background = c[2]; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); b.onclick = () => { BYO.color = i; [...cl.children].forEach((x, j) => x.setAttribute('aria-pressed', j === i ? 'true' : 'false')); BYO.erase = false; $('byoErase').setAttribute('aria-pressed', 'false'); byoStatus(); }; cl.appendChild(b); });
  $('byoRot').onclick = () => { BYO.rot = !BYO.rot; $('byoRot').setAttribute('aria-pressed', BYO.rot ? 'true' : 'false'); byoStatus(); };
  $('byoErase').onclick = () => { BYO.erase = !BYO.erase; $('byoErase').setAttribute('aria-pressed', BYO.erase ? 'true' : 'false'); byoStatus(); };
  $('byoUndo').onclick = () => { const e = BYO.blocks[BYO.blocks.length - 1]; if (e) byoRemove(e); };
  $('byoClear').onclick = () => { if (!BYO.blocks.length) return; modal('Clear the plot?', 'This removes every block you placed on this device.', [{ label: 'Clear', fn: () => { BYO.blocks.slice().forEach(e => { BYO.grp.remove(e.mesh); e.mesh.geometry.dispose(); }); BYO.blocks = []; byoSave(); } }, { label: 'Keep building', ghost: true }]); };
  $('byoCard').onclick = () => {
    if (!BYO.blocks.length) { toast('Place a few blocks first, then make your postcard.'); return; }
    const cx = (BYO_PLOT.x0 + BYO_PLOT.x1) / 2, cz = (BYO_PLOT.z0 + BYO_PLOT.z1) / 2, top = Math.max(...BYO.blocks.map(e => e.b.y + e.b.d[1] / 2));
    BYO.ghost.visible = false; BYO.grid.visible = false; flyTo(rotPt([cx - 22, 6 + top * 0.6, cz - 26]), rotPt([cx, top * 0.45, cz]), 1200);
    setTimeout(() => { postcard('My own Masters’ House, next to the real ones'); if (BYO.on) BYO.grid.visible = true; }, 1350);
  };
  $('byoClose').onclick = byoClose; $('byoBtn').onclick = () => { if (BYO.on) byoClose(); else byoStart(); };
})();

/* ---------- 2. Visitor notes on the map ---------- */
const NOTE = { db: null, user: null, me: null, owner: false, canWrite: null, list: [], placing: false, els: new Map(), names: {} };
async function initNotes() {
  NOTE.db = await capUse('db'); if (!NOTE.db) return;
  NOTE.user = await capUse('user');
  if (NOTE.user) { try { NOTE.me = await NOTE.user.id(); NOTE.owner = await NOTE.user.isOwner(); NOTE.canWrite = await NOTE.user.can('data.write'); } catch (e) {} }
  $('noteBtn').hidden = !(NOTE.me && NOTE.canWrite !== false);
  try {
    NOTE.db.collection('notes').onSnapshot(snap => {
      const all = []; snap.docs.forEach(d => { const b = d.data() || {}; (Array.isArray(b.items) ? b.items : []).slice(0, 40).forEach(it => { if (it && typeof it.id === 'string' && typeof it.x === 'number' && typeof it.z === 'number' && typeof it.text === 'string') all.push({ owner: d.id, id: it.id.slice(0, 40), x: it.x, z: it.z, text: it.text.slice(0, 300), t: +it.t || 0, photo: !!it.photo }); }); });
      NOTE.list = all; renderNotes();
    }, () => {});
  } catch (e) {}
}
function renderNotes() {
  const box = $('notePins'), keep = new Set();
  NOTE.list.forEach(n => {
    const key = n.owner + '/' + n.id; keep.add(key); let el = NOTE.els.get(key);
    if (!el) { el = document.createElement('button'); el.type = 'button'; el.className = 'npin'; el.onclick = ev => { ev.stopPropagation(); openNote(n.owner, n.id); }; box.appendChild(el); NOTE.els.set(key, el); }
    el.textContent = n.photo ? '📷' : '✎'; el.title = n.text.slice(0, 60); el.setAttribute('aria-label', 'Visitor note: ' + n.text.slice(0, 60)); el._n = n;
  });
  [...NOTE.els.keys()].forEach(k => { if (!keep.has(k)) { NOTE.els.get(k).remove(); NOTE.els.delete(k); } });
  $('noteCount').textContent = NOTE.list.length ? NOTE.list.length + (NOTE.list.length === 1 ? ' visitor note' : ' visitor notes') + ' on the map.' : '';
}
function placeNotePins() {
  const show = curId === 'map', w = dom.clientWidth, h = dom.clientHeight;
  NOTE.els.forEach(el => { if (!show) { el.style.display = 'none'; return; } const n = el._n; V.set(n.x * MS, 2.5, n.z * MS).project(camera); if (V.z > 1 || Math.abs(V.x) > 1.05 || Math.abs(V.y) > 1.05) { el.style.display = 'none'; return; } el.style.display = ''; el.style.left = ((V.x + 1) / 2 * w) + 'px'; el.style.top = ((1 - V.y) / 2 * h) + 'px'; });
}
function startPlacing() {
  if (!NOTE.db || !NOTE.me) return; if (curId !== 'map') { go('map'); }
  NOTE.placing = true; document.body.classList.add('placing'); toast('Click a spot on the map for your note. Press Esc to cancel.', null, null, 6000);
}
function stopPlacing() { NOTE.placing = false; document.body.classList.remove('placing'); }
function mapPointAt(cx, cy) { setRay(cx, cy); const h = rc.intersectObject(mapData.plane, false)[0]; return h ? { x: h.point.x / MS, z: h.point.z / MS } : null; }
function nearestLm(x, z) { let best = null, bd = 1e9; LMS.forEach(l => { const d = Math.hypot(l.x - x, l.z - z); if (d < bd) { bd = d; best = l; } }); return bd < 400 ? best : null; }
async function shrinkPhoto(file) {
  const url = URL.createObjectURL(file); try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    for (const [max, q] of [[720, 0.72], [560, 0.66], [420, 0.6], [320, 0.55]]) {
      const r = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); const d = c.toDataURL('image/jpeg', q); if (d.length < 150000) return d;
    }
    return null;
  } finally { URL.revokeObjectURL(url); }
}
function composeNote(pt) {
  const near = nearestLm(pt.x, pt.z), wrap = document.createElement('div'); wrap.className = 'noteForm';
  const p = document.createElement('p'); p.textContent = near ? 'Near the ' + near.name + '. Your note will be visible to everyone who opens this page.' : 'Your note will be visible to everyone who opens this page.'; wrap.appendChild(p);
  const ta = document.createElement('textarea'); ta.maxLength = 280; ta.rows = 4; ta.placeholder = 'A memory, a tip or a story about this spot'; ta.setAttribute('aria-label', 'Your note'); wrap.appendChild(ta);
  const fl = document.createElement('label'); fl.className = 'fileLbl'; fl.textContent = 'Add a photo (optional) '; const fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/*'; fl.appendChild(fi); wrap.appendChild(fl);
  const msg = document.createElement('p'); msg.className = 'muted'; wrap.appendChild(msg);
  modal('Pin a note', wrap, [{ label: 'Pin it', keep: true, fn: async () => {
    const text = ta.value.trim(); if (!text) { msg.textContent = 'Write a few words first.'; return; }
    msg.textContent = 'Saving…'; let photo = null;
    if (fi.files && fi.files[0]) { try { photo = await shrinkPhoto(fi.files[0]); } catch (e) { photo = null; } if (!photo) { msg.textContent = 'That photo could not be used. Try a smaller image, or pin the note without it.'; return; } }
    const id = 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const mine = NOTE.list.filter(n => n.owner === NOTE.me).map(n => ({ id: n.id, x: n.x, z: n.z, text: n.text, t: n.t, photo: n.photo }));
    if (mine.length >= 40) { msg.textContent = 'You have pinned the maximum of 40 notes. Delete one to add another.'; return; }
    try {
      if (photo) await NOTE.db.doc('notes/' + NOTE.me + '/photos/' + id).set({ data: photo });
      await NOTE.db.collection('notes').doc(NOTE.me).set({ items: mine.concat([{ id, x: Math.round(pt.x), z: Math.round(pt.z), text, t: Date.now(), photo: !!photo }]) });
      closeModal(); toast('Your note is pinned.');
    } catch (e) { msg.textContent = e && e.code === 'quota_exceeded' ? 'The notes storage is full. The page owner can free space.' : e && e.code === 'invalid_argument' ? 'You can read notes here but not add them with your current access.' : 'The note could not be saved. Please try again.'; }
  } }, { label: 'Cancel', ghost: true }]);
  setTimeout(() => ta.focus(), 50);
}
async function openNote(owner, id) {
  const n = NOTE.list.find(q => q.owner === owner && q.id === id); if (!n) return;
  const wrap = document.createElement('div'); wrap.className = 'noteView';
  const meta = document.createElement('p'); meta.className = 'muted'; const near = nearestLm(n.x, n.z); meta.textContent = (near ? 'Near the ' + near.name + ' · ' : '') + (n.t ? new Date(n.t).toLocaleDateString() : ''); wrap.appendChild(meta);
  const tx = document.createElement('p'); tx.className = 'noteText'; tx.textContent = n.text; wrap.appendChild(tx);
  if (n.photo) { const ph = document.createElement('p'); ph.className = 'muted'; ph.textContent = 'Loading photo…'; wrap.appendChild(ph);
    NOTE.db.doc('notes/' + owner + '/photos/' + id).get().then(d => { const v = d.exists ? (d.data() || {}).data : null; if (typeof v === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v)) { const img = document.createElement('img'); img.src = v; img.alt = 'Photo pinned with this note'; img.className = 'notePhoto'; ph.replaceWith(img); } else ph.textContent = 'The photo is no longer available.'; }).catch(() => { ph.textContent = 'The photo could not be loaded.'; }); }
  const by = document.createElement('p'); by.className = 'muted'; by.textContent = owner === NOTE.me ? 'Pinned by you' : 'Pinned by a visitor'; wrap.insertBefore(by, tx);
  if (NOTE.user && owner !== NOTE.me) NOTE.user.profiles([owner]).then(ps => { const nm = ps && ps[owner] && ps[owner].name; if (nm) by.textContent = 'Pinned by ' + nm; }).catch(() => {});
  const acts = [{ label: 'Close' }];
  if (owner === NOTE.me || NOTE.owner) acts.unshift({ label: 'Delete note', ghost: true, fn: async () => {
    try { const rest = NOTE.list.filter(q => q.owner === owner && q.id !== id).map(q => ({ id: q.id, x: q.x, z: q.z, text: q.text, t: q.t, photo: q.photo }));
      await NOTE.db.collection('notes').doc(owner).set({ items: rest }); if (n.photo) await NOTE.db.doc('notes/' + owner + '/photos/' + id).delete().catch(() => {}); toast('Note deleted.'); }
    catch (e) { toast('The note could not be deleted.'); } } });
  modal('Visitor note', wrap, acts);
}
$('noteBtn').onclick = () => { if (NOTE.placing) stopPlacing(); else startPlacing(); };
initNotes();

/* ---------- city news, the Lonely Planet badge and the About panel ---------- */
const PROFILE_LINKS = { website: 'https://www.eslamshamy.com', linkedin: 'https://www.linkedin.com/in/eslamshamy' };
const NEWS_STAMP = 'Collected on 13 October 2026.';
const NEWS_LOCAL = [
  { d: '23 Sep 2026', id: 'lp', title: 'Lonely Planet picks Dessau for 2027', text: 'Lonely Planet’s Best in Travel 2027 names Dessau among its 25 places to visit, the only German destination on the list. It singles out the Bauhaus building, the Masters’ Houses and the Törten housing estate.', src: 'Euronews', url: 'https://www.euronews.com/2026/09/23/where-to-travel-in-europe-in-2027-lonely-planet-reveals-its-best-destinations-and-experien', lm: 'bauhaus' },
  { d: '4–5 Dec 2026', id: 'bh100', title: '100 years of the Bauhaus building', text: 'The Bauhaus building opened on 4 December 1926. The Stiftung Bauhaus Dessau marks the centenary with “Projections | Promises | Echo” at the building on 4 and 5 December, closing two years of jubilee events.', src: 'Stiftung Bauhaus Dessau', url: 'https://bauhaus-dessau.de/en/welcome/', lm: 'bauhaus' },
  { d: 'until 10 Jan 2027', id: 'gbm', title: 'Exhibition: Glas | Beton | Metall', text: 'In the historic workshop wing, an exhibition looks at the industrial materials the Bauhaus building is made of, which Gropius saw replacing traditional ones.', src: 'Deutsche Bahn regional travel tips', url: 'https://regional.bahn.de/regionen/sachsen-anhalt/ausflugstipps/kultur/dessau', lm: 'bauhaus' },
  { d: '7 Oct 2026', id: 'eco', title: 'City environmental prize for a kindergarten', text: 'This year’s environmental prize of Dessau-Roßlau focused on species diversity in kindergartens. Five childcare centres were honoured at the zoo, and the prize went to the Kita “Buratino”.', src: 'City of Dessau-Roßlau', url: 'https://verwaltung.dessau-rosslau.de/startseite.html' },
  { d: '6 Oct 2026', id: 'rh125', title: 'The Rathaus in another 125 years', text: 'For the town hall’s 125th birthday, the city asked children how it might look 125 years from now. A ten-year-old won the drawing competition.', src: 'City of Dessau-Roßlau', url: 'https://verwaltung.dessau-rosslau.de/startseite.html', lm: 'rathaus' }
];
let NEWS = NEWS_LOCAL.slice(), NEWS_STAMP_NOW = NEWS_STAMP;
function safeUrl(u) { try { const x = new URL(u); return x.protocol === 'https:' ? x.href : null; } catch (e) { return null; } }
function renderNews(hot) {
  const ol = $('newsList'); ol.innerHTML = ''; $('newsStamp').textContent = NEWS_STAMP_NOW;
  NEWS.forEach(n => {
    const li = document.createElement('li'); if (hot && n.id === hot) li.className = 'hot';
    const d = document.createElement('span'); d.className = 'nd'; d.textContent = n.d; li.appendChild(d);
    const b = document.createElement('b'); b.textContent = n.title; li.appendChild(b);
    const p = document.createElement('p'); p.textContent = n.text; li.appendChild(p);
    const na = document.createElement('div'); na.className = 'na';
    const u = safeUrl(n.url); if (u) { const a = document.createElement('a'); a.href = u; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Source: ' + n.src; na.appendChild(a); } else if (n.src) na.appendChild(document.createTextNode('Source: ' + n.src));
    if (n.lm && LMS.some(l => l.id === n.lm)) { const g = document.createElement('button'); g.type = 'button'; g.textContent = 'Open in 3D'; g.onclick = () => go(n.lm); na.appendChild(g); }
    li.appendChild(na); ol.appendChild(li);
  });
}
function infoOpen(id, hot) {
  infoClose(id === 'newsPanel' ? 'aboutPanel' : 'newsPanel');
  if (id === 'newsPanel') renderNews(hot);
  $(id).hidden = false; if ($(id).classList.contains('collapsed')) uipCollapse($(id), false); uipFront($(id));
  $(id === 'newsPanel' ? 'newsBtn' : 'aboutBtn').setAttribute('aria-pressed', 'true');
  if (hot) { const el = $('newsList').querySelector('li.hot'); if (el) el.scrollIntoView({ block: 'nearest' }); }
}
function infoClose(id) { const el = $(id); if (!el) return; el.hidden = true; const b = $(id === 'newsPanel' ? 'newsBtn' : 'aboutBtn'); if (b) b.setAttribute('aria-pressed', 'false'); }
$('newsBtn').onclick = () => { if ($('newsPanel').hidden) infoOpen('newsPanel'); else infoClose('newsPanel'); };
$('aboutBtn').onclick = () => { if ($('aboutPanel').hidden) infoOpen('aboutPanel'); else infoClose('aboutPanel'); };
$('newsClose').onclick = () => infoClose('newsPanel'); $('aboutClose').onclick = () => infoClose('aboutPanel');
$('lpBadge').onclick = () => infoOpen('newsPanel', 'lp');
(function aboutLinks() {
  const row = $('aboutLinks'); row.innerHTML = '';
  [['website', 'Website'], ['linkedin', 'LinkedIn']].forEach(([k, label]) => { const u = safeUrl(PROFILE_LINKS[k]); if (!u) return; const a = document.createElement('a'); a.className = 'btn'; a.href = u; a.target = '_blank'; a.rel = 'noopener'; a.textContent = label; row.appendChild(a); });
  row.hidden = !row.children.length;
})();
// news can later be refreshed without republishing: a "news/feed" document, written by the owner, replaces the built-in list
(async () => {
  const db = NOTE.db || await capUse('db'); if (!db) return;
  try {
    const d = await db.doc('news/feed').get(); const b = d.exists ? d.data() : null;
    if (b && Array.isArray(b.items) && b.items.length) {
      const items = b.items.filter(n => n && typeof n.title === 'string' && typeof n.text === 'string').slice(0, 12).map(n => ({ d: String(n.d || '').slice(0, 40), id: String(n.id || '').slice(0, 40), title: n.title.slice(0, 120), text: n.text.slice(0, 600), src: String(n.src || '').slice(0, 80), url: String(n.url || ''), lm: String(n.lm || '') }));
      if (items.length) { NEWS = items; if (typeof b.stamp === 'string') NEWS_STAMP_NOW = b.stamp.slice(0, 80); if (!$('newsPanel').hidden) renderNews(); }
    }
  } catch (e) {}
})();

$('trailBtn').onclick = () => { if (TR.on) stopTrail(); else startTrail(); };
$('certBtn').onclick = certificate;
$('resetProg').onclick = () => modal('Start your passport again?', 'This clears the stories you have found and your stamps on this device.', [{ label: 'Clear progress', fn: () => { Object.keys(seen).forEach(k => delete seen[k]); PROG.quiz = {}; saveProg(); refreshProgress(); toast('Progress cleared.'); } }, { label: 'Cancel', ghost: true }]);
$('buildBtn').onclick = () => { if (REPLAY.on) stopReplay(); else startReplay(); };
$('walkBtn').onclick = () => { if (WALK.on) stopWalk(); else startWalk(); };
$('walkExit').onclick = stopWalk;
$('peopleBtn').onclick = togglePeople;
$('dressBtn').onclick = () => { if (DRESS.on) closeDress(); else openDress(); };
$('dressReset').onclick = dressReset; $('dressClose').onclick = closeDress;
$('quizBtn').onclick = startQuiz;
$('modalBack').addEventListener('click', e => { if (e.target === $('modalBack')) closeModal(); });
controls.addEventListener('start', () => { stopTrail(); });

/* ================= start ================= */
MAPDATA = await mapDataPromise;
buildMap();
refreshProgress();
setDate(dateKey);
setActiveScene(mapData.scene); attachWorld(mapData.scene, mapData.center, mapData.span, mapData.sunDist);
controls.minDistance = 60; controls.maxDistance = 1800; controls.maxPolarAngle = 1.15;
camera.position.set(-25, 330, 245); controls.target.copy(mapData.center); controls.update();
setTime(timeNow); applyLighting(timeNow, true);
const startHash = location.hash.replace('#', '');
let last = performance.now(), first = true;
const ease = u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
// live compass: the needle shows where north lies on screen, from the camera's heading
const CMP = { el: null, last: 999, f: new THREE.Vector3(), u: new THREE.Vector3() };
function updateCompass() {
  if (!CMP.el) CMP.el = $('compassRose'); if (!CMP.el) return;
  CMP.f.set(0, 0, -1).applyQuaternion(camera.quaternion); CMP.u.set(0, 1, 0).applyQuaternion(camera.quaternion);
  const hx = CMP.f.x + CMP.u.x, hz = CMP.f.z + CMP.u.z; if (Math.abs(hx) + Math.abs(hz) < 1e-6) return;
  const bearing = Math.atan2(hx, -hz) * 180 / Math.PI; if (Math.abs(bearing - CMP.last) < 0.2) return;
  CMP.last = bearing; CMP.el.style.transform = 'rotate(' + (-bearing).toFixed(1) + 'deg)';
}
$('compass').onclick = () => { if (WALK.on) return; const t = controls.target.clone(), v = camera.position.clone().sub(t), hd = Math.hypot(v.x, v.z);
  flyTo(new THREE.Vector3(t.x, camera.position.y, t.z + Math.max(hd, 0.001)), t, REDUCED ? 1 : 700); };
function loop(now) {
  requestAnimationFrame(loop);
  updateCompass();
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (tween) { const u = clamp((now - tween.s) / tween.d, 0, 1), e = ease(u); camera.position.lerpVectors(tween.p0, tween.p1, e); controls.target.lerpVectors(tween.t0, tween.t1, e); if (u >= 1) tween = null; }
  updateTrail(dt, now); updateReplay(now);
  if (WALK.on && cur) updateWalk(dt);
  else {
    if (curId === 'map') { controls.target.x = clamp(controls.target.x, MAP.x0 * MS, MAP.x1 * MS); controls.target.z = clamp(controls.target.z, MAP.z0 * MS, MAP.z1 * MS); controls.target.y = 0; }
    else if (cur) { const s = cur.span * 1.2; controls.target.x = clamp(controls.target.x, -s, s); controls.target.z = clamp(controls.target.z, -s, s); controls.target.y = clamp(controls.target.y, -2, 60); }
    controls.update();
  }
  skyMesh.position.copy(camera.position); skyU.time.value = now * 0.001; WIND.value = now * 0.001;
  if (WATER_N) { WATER_N.offset.set((now * 0.000016) % 1, (now * 0.000009) % 1); WATER_N2.offset.set((-now * 0.000035) % 1, (now * 0.000041) % 1); }
  if (grade) { grade.uniforms.time.value = (now * 0.001) % 100; grade.uniforms.res.value.set(dom.width, dom.height); }
  render(dt);
  updateOverlays(now);
  if (first) {
    first = false;
    if (LMS.some(l => l.id === startHash)) { go(startHash); }
    else { setTimeout(() => veil.classList.add('out'), 150); flyTo(new THREE.Vector3(-25, 250, 170), mapData.center, REDUCED ? 1 : 2200); }
  }
}
const BUILDING_CONTEXT = { C, D2R, Kit, MAT, THREE, W, WARM, addWater, bandChunks, bear, clockFaces, colonnadeU, doubleHouse, drawClock, extrudeXZ, gableRoof, glass, gothWin, gropiusHouse, hedgeRow, ju52, lamp, letterTexture, lineSpan, mbox, mulberry, noAO, parkGround, pedimentU, person, pinnacle, plinth, pointedShape, polyGeoU, prism, ptInPoly, rails, rand, realContext, realWaterLocal, registerNoAO, rng2, rod3, rod3U, rotBox, signMesh, steppedGable, superEll, tree, tubeU, ubaPlan, winGrid, winGridU, yHouseU,
  setWaterMask(value) { WATER_MASK = value; },
  setHbfClock(value) { HBF_CLOCK = value; },
  setLyzeumClock(value) { LYZ_CLOCK = value; },
  setRathausClock(value) { RATHAUS_CLOCK = value; },
  getTime() { return timeNow; }
};
requestAnimationFrame(loop);
}
