/* ================================================================
   BUILDINGS
   Each builder returns { scene, center, span, sunDist, facts, views }
   ================================================================ */
const BUILT = {}, BUILT_ORDER = [], BUILT_KEEP = MOBILE ? 2 : 4;
// free the geometry of scenes visited long ago; they are rebuilt if opened again
function touchBuilt(id) {
  const i = BUILT_ORDER.indexOf(id); if (i >= 0) BUILT_ORDER.splice(i, 1); BUILT_ORDER.push(id);
  while (BUILT_ORDER.length > BUILT_KEEP) { const old = BUILT_ORDER.shift(); const b = BUILT[old]; if (!b || old === curId) continue;
    b.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      ms.forEach(m => { if (m.map && m.map.isCanvasTexture) { m.map.dispose(); m.dispose(); } }); });
    delete BUILT[old]; }
}
// if the frame rate stays low for a few seconds, switch off ambient occlusion, then render at a lower resolution
const PERF = { n: 0, sum: 0, done: false };
function perfWatch(dt) { if (PERF.done || MOBILE || dt > 500) return; PERF.sum += dt; PERF.n++; if (PERF.sum < 4000) return;
  const avg = PERF.sum / PERF.n; PERF.sum = 0; PERF.n = 0;
  if (avg > 30) { if (gtao && gtao.enabled !== false) { gtao.enabled = false; return; } renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25)); composer.setSize(innerWidth, innerHeight); PERF.done = true; } }

/* ---------- 1. Bauhaus building ---------- */

/* ---------- 2. Bauhaus Museum Dessau ---------- */

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

/* ---------- 4. Kornhaus ---------- */



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
  closedRings(decL('green')).forEach(o => { const q = o.p.map(loc); if (!near(q)) return; const cq = clipRect(q, P); if (cq.length < 3) return; flat(cq, 'lawnReal', 0.025);
    if (o.c === 'f' || o.c === 'g' || o.c === 'c') { const ar = polyArea(cq), n = Math.min(40, Math.round(ar / (o.c === 'f' ? 160 : 420))); let xs = cq.map(p => p[0]), zs = cq.map(p => p[1]); const bx = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
      for (let i = 0, tries = 0; i < n && tries < n * 6; tries++) { const x = bx[0] + rand() * (bx[1] - bx[0]), z = bx[2] + rand() * (bx[3] - bx[2]); if (!inPoly(x, z, cq) || inOwn([x, z])) continue; trees.push([x, z]); i++; } } });
  // water
  if (!opt.noWater) addWater(k, closedRings(decL('water')).map(o => clipRect(o.p.map(loc), P)).filter(q => q.length > 2), 0.06, 'context');
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
function clockFaces(k, cx, cy, cz, half, r, face, hand, tag) {
  [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(d => { const g = new THREE.CircleGeometry(r, 28), ang = Math.atan2(d[0], d[1]); g.rotateY(ang); g.translate(cx + d[0] * (half + 0.05), cy, cz + d[1] * (half + 0.05)); k.geo(face, g, tag);
    [[0.08, r * 0.55, 0.6], [0.06, r * 0.8, -1.9]].forEach(hd => { const p = new THREE.PlaneGeometry(hd[0] * 2, hd[1]); p.translate(0, hd[1] / 2, 0); p.rotateZ(hd[2]); p.rotateY(ang); p.translate(cx + d[0] * (half + 0.08), cy, cz + d[1] * (half + 0.08)); k.geo(hand, p, tag); }); });
}
function townHouses(k, list) { list.forEach(h => { k.box(h[5] || 'cream', h[0], h[1], 0, h[4], h[2], h[3]); k.geo(h[6] || 'tilesRed', prism(h[0] - 0.3, h[1] + 0.3, h[2] - 0.3, h[3] + 0.3, h[4], h[4] + 4.5, (h[1] - h[0]) > (h[3] - h[2]) ? 1.5 : (h[1] - h[0]) / 2, (h[1] - h[0]) > (h[3] - h[2]) ? (h[3] - h[2]) / 2 : 1.5));
  const along = (h[1] - h[0]) > (h[3] - h[2]); for (let a = (along ? h[0] : h[2]) + 1.6; a < (along ? h[1] : h[3]) - 1; a += 2.8) [[1.4, 3.2], [4.4, 6.2]].forEach(f => { if (f[1] > h[4] - 0.6) return; [-1, 1].forEach(sd => { if (along) k.winZ(sd > 0 ? h[3] : h[2], sd, a - 0.55, a + 0.55, f[0], f[1], { frame: 'whiteInt' }); else k.winX(sd > 0 ? h[1] : h[0], sd, a - 0.55, a + 0.55, f[0], f[1], { frame: 'whiteInt' }); }); }); }); }

/* ---------- St. Petri, Wörlitz: Romanesque church of about 1200, rebuilt in Tudor Gothic 1805–09 ---------- */
/* ---------- St. Petri, Wörlitz: Romanesque church of about 1200, rebuilt in Tudor Gothic 1805–09 ---------- */

/* ---------- Marienkirche, Dessau: late Gothic hall church, 1506–23; tower 1551–54; burnt 1945; rebuilt 1989–98 ---------- */

/* ---------- Propsteikirche St. Peter und Paul, Dessau: neo-Gothic, Vinzenz Statz, 1854–58 ---------- */


/* ---------- 5. Hauptbahnhof ---------- */
/* helpers carried over from the updated building set */
function extrudeXZ(k, m, pts, y0, y1, tag, hole) {
  const sh = new THREE.Shape(); pts.forEach((q, i) => i ? sh.lineTo(q[0], -q[1]) : sh.moveTo(q[0], -q[1]));
  if (hole) { const h = new THREE.Path(); hole.forEach((q, i) => i ? h.lineTo(q[0], -q[1]) : h.moveTo(q[0], -q[1])); sh.holes.push(h); }
  const g = new THREE.ExtrudeGeometry(sh, { depth: y1 - y0, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); k.geo(m, g, tag);
}
function rod3U(k, m, a, b, r, tag) { const A = new THREE.Vector3().fromArray(a), B = new THREE.Vector3().fromArray(b), d = B.clone().sub(A); const g = new THREE.CylinderGeometry(r || 0.05, r || 0.05, d.length(), 6); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())); const mm = A.clone().add(B).multiplyScalar(0.5); g.translate(mm.x, mm.y, mm.z); k.geo(m, g, tag); }
function signMesh(text, w, h, bg, fg, part) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w); const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); g.fillStyle = fg; g.font = 'bold ' + Math.round(c.height * 0.62) + 'px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, c.width / 2, c.height * 0.54);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 })); m.userData.part = part; return m;
}
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

function pedimentU(k, m, x0, x1, y, h, z, depth, tag) { const sh = new THREE.Shape(), w = x1 - x0; sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, h); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: depth || 0.6, bevelEnabled: false }); g.translate((x0 + x1) / 2, y, z); k.geo(m, g, tag); }

/* a moving river surface: waves travelling downstream and ripples drifting with the current, computed each frame */
const FLOWS = [];
function flowWater(parent, x0, x1, z0, z1, y, dx, dz, speed) {
  const w = x1 - x0, d = z1 - z0, g = new THREE.PlaneGeometry(w, d, Math.min(120, Math.max(8, Math.round(w / 1.4))), Math.min(120, Math.max(8, Math.round(d / 1.4))));
  g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  const m = MAT.water.clone(), n1 = WATER_N.clone(), n2 = WATER_N2.clone(); n1.needsUpdate = n2.needsUpdate = true; m.normalMap = n1; m.clearcoatNormalMap = n2;
  const mesh = new THREE.Mesh(g, m); mesh.receiveShadow = true; mesh.renderOrder = 1; mesh.userData.noAO = true; mesh.userData.flow = true; mesh.frustumCulled = false; noAO.add(mesh); parent.add(mesh);
  const f = { n1, n2, dir: new THREE.Vector2(dx, dz).normalize(), speed: speed || 1, mesh, y, tick: 0 }; FLOWS.push(f); return mesh;
}
function updateFlows(now) {
  const t = now * 0.001;
  for (let i = FLOWS.length - 1; i >= 0; i--) { const f = FLOWS[i]; if (!f.mesh.geometry || !f.mesh.geometry.attributes.position) { FLOWS.splice(i, 1); continue; }
    let root = f.mesh; for (let d = 0; d < 50 && root.parent; d++) root = root.parent; if (!cur || root !== cur.scene) continue;
    const o = t * 0.03 * f.speed; f.n1.offset.set(-f.dir.x * o * 1.6, -f.dir.y * o * 1.6); f.n2.offset.set(-f.dir.x * o * 3.1 + 0.3, -f.dir.y * o * 3.1);
    const p = f.mesh.geometry.attributes.position, ux = f.dir.x, uz = f.dir.y;
    const cnt = p.count | 0; for (let v = 0; v < cnt; v++) { const x = p.getX(v), z = p.getZ(v), a = x * ux + z * uz, b = -x * uz + z * ux;
      p.setY(v, f.y + 0.09 * Math.sin(a * 0.45 - t * 1.9 * f.speed) + 0.05 * Math.sin(a * 1.2 + b * 0.6 - t * 2.9 * f.speed) + 0.03 * Math.sin(b * 1.7 + a * 0.3 - t * 1.6)); }
    p.needsUpdate = true; if ((f.tick++ & 1) === 0) f.mesh.geometry.computeVertexNormals(); }
}

/* the real landscape around a landmark: keep the landmark itself (its tagged parts and period variants, plus a margin),
   drop the invented surroundings, lay a neutral ground and add the real streets, neighbours, green areas and water */
const LAND_KEEP = new Set(['water', 'sand']);
function realLandscape(k, lid, P, opt) {
  opt = opt || {}; const margin = opt.margin == null ? 8 : opt.margin;
  const own = key => { const [m, t, pt] = key.split('|'); return (t && t !== 'context') || !!pt; };
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  const grow = (a, b, c, d) => { x0 = Math.min(x0, a); x1 = Math.max(x1, b); z0 = Math.min(z0, c); z1 = Math.max(z1, d); };
  Object.keys(k.g).forEach(key => { if (!own(key)) return; k.g[key].forEach(g => { g.computeBoundingBox(); const b = g.boundingBox; grow(b.min.x, b.max.x, b.min.z, b.max.z); }); });
  Object.keys(k.f).forEach(key => { if (!own(key)) return; k.f[key].forEach(q => grow(q[0] - q[3] / 2, q[0] + q[3] / 2, q[2] - q[5] / 2, q[2] + q[5] / 2)); });
  if (x0 > x1) { x0 = -20; x1 = 20; z0 = -20; z1 = 20; }
  const Z = [Math.max(P.x0, x0 - margin), Math.min(P.x1, x1 + margin), Math.max(P.z0, z0 - margin), Math.min(P.z1, z1 + margin)];
  const inZ = (x, z) => x >= Z[0] && x <= Z[1] && z >= Z[2] && z <= Z[3], PA = (P.x1 - P.x0) * (P.z1 - P.z0);
  Object.keys(k.g).forEach(key => { if (own(key) || LAND_KEEP.has(key.split('|')[0])) return;
    k.g[key] = k.g[key].filter(g => { g.computeBoundingBox(); const b = g.boundingBox, area = (b.max.x - b.min.x) * (b.max.z - b.min.z);
      if (area > PA * 0.45 && b.max.y < 0.35) return false;   // the old ground sheet
      return inZ((b.min.x + b.max.x) / 2, (b.min.z + b.max.z) / 2); });
    if (!k.g[key].length) delete k.g[key]; });
  Object.keys(k.f).forEach(key => { if (own(key)) return; k.f[key] = k.f[key].filter(q => inZ(q[0], q[2])); if (!k.f[key].length) delete k.f[key]; });
  if (k.lawns) k.lawns = k.lawns.filter(l => (l[1] - l[0]) * (l[3] - l[2]) < PA * 0.45 && inZ((l[0] + l[1]) / 2, (l[2] + l[3]) / 2));
  k.box('ground', P.x0, P.x1, -0.16, -0.03, P.z0, P.z1);
  realContext(k, lid, P, { own: Z, noWater: opt.noWater });
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
/* ---------- 6. Anhaltisches Theater ---------- */

/* ---------- 7. Lyzeum, Design faculty of Anhalt University ---------- */


/* ---------- 8. Masters' Houses ---------- */

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

/* ---------- Tiergarten bridge, the "Eierschneider" ---------- */

/* ---------- the Ducal Mausoleum, after photographs ---------- */

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

/* ---------- Alter Räucherturm ---------- */

/* ---------- Heizkraftwerk Dessau (Stadtwerke) ---------- */

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

/* ---------- Museum für Naturkunde und Vorgeschichte (Leopold-Dank-Stift) ---------- */


/* ---------- Schloss Georgium ---------- */

/* ---------- Luisium ---------- */

/* ---------- Schloss Mosigkau ---------- */

/* ---------- Wörlitz: palace, lake, the island Stein and the Gothic House ---------- */

/* ---------- Johannbau, Museum für Stadtgeschichte ---------- */


