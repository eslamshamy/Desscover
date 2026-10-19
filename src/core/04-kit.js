/* ================= geometry kit ================= */
function mbox(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const dm = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dm[f][0], uv.getY(i) * dm[f][1]); }
  return g;
}
function bx(x0, x1, y0, y1, z0, z1) { const g = mbox(Math.max(x1 - x0, 0.001), Math.max(y1 - y0, 0.001), Math.max(z1 - z0, 0.001)); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); return g; }
// textured masonry, render and roofs get texture coordinates in metres on any shape, projected along its main axis
const WORLD_UV_TEX = new Set(['render', 'stone', 'brick', 'brickBuff', 'concrete', 'paving', 'cobble', 'roofing', 'slate', 'tile', 'stains', 'gravel']);
function worldUV(g) {
  const p = g.attributes.position; if (!g.attributes.normal) g.computeVertexNormals(); const n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    if (ay >= ax && ay >= az) uv.setXY(i, p.getX(i), p.getZ(i)); else if (ax >= az) uv.setXY(i, p.getZ(i), p.getY(i)); else uv.setXY(i, p.getX(i), p.getY(i)); }
  uv.needsUpdate = true;
}
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
  geo(m, geo, t) { const keep = geo.userData && geo.userData.keepUV, k = this.key(m, t), c = clean(geo); const mt = MAT[m]; if (!keep && mt && mt.userData && WORLD_UV_TEX.has(mt.userData.tex)) worldUV(c); if (!this.noGrass) this.ground(m, c); (this.g[k] || (this.g[k] = [])).push(c); }
  ground(m, g) {
    g.computeBoundingBox(); const b = g.boundingBox; if (b.min.y > 0.35 || b.max.y < -0.05) return;
    if (m === 'lawn') { if (b.max.y - b.min.y < 0.6) (this.lawns || (this.lawns = [])).push([b.min.x, b.max.x, b.min.z, b.max.z, b.max.y]); return; }
    if (m.indexOf('leaf') === 0 || m === 'needle') return;
    (this.blocks || (this.blocks = [])).push([b.min.x, b.max.x, b.min.z, b.max.z, b.max.y]);
  }
  box(m, x0, x1, y0, y1, z0, z1, t) { const g = bx(x0, x1, y0, y1, z0, z1); g.userData.keepUV = true; this.geo(m, g, t); }
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

