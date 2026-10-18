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

