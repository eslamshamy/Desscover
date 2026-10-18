/* ================================================================
   MAP OF DESSAU
   ================================================================ */
/*@LANDMARKS*/
const LMS = LANDMARK_ORDER.map(id => trObj(REG[id].meta, ['name', 'sub', 'meta', 'lead', 'label', 'years']));
const LAT0 = 51.840, LON0 = 12.235, MX = Math.cos(LAT0 * D2R) * 111320, MZ = 110540;
LMS.forEach(l => { l.x = (l.lon - LON0) * MX; l.z = -(l.lat - LAT0) * MZ; });
const MAP = { x0: -7200, x1: 14200, z0: -4200, z1: 5600 }, MS = 0.1;
const ELBE = [[13466,-4168],[12802,-3973],[12374,-3753],[12111,-3432],[12040,-3161],[11914,-2924],[11659,-2695],[11293,-2553],[10571,-2574],[10270,-2455],[10056,-2061],[10074,-1301],[9999,-1053],[9705,-835],[9366,-741],[8968,-778],[8614,-899],[8498,-1000],[8261,-1402],[7978,-2135],[7787,-2393],[7566,-2583],[7137,-2820],[6549,-2992],[6162,-3174],[5957,-3419],[5893,-3571],[5774,-4243],[4246,-4489],[3647,-4155],[3282,-3810],[3045,-3737],[2476,-3828],[1885,-4162],[1172,-4419],[54,-4544],[-189,-4496],[-312,-4415],[-487,-4174],[-520,-3909],[-237,-2864],[-221,-2569],[-324,-2285],[-418,-2170],[-668,-1954],[-798,-1910],[-1016,-1885],[-1337,-1931],[-1614,-2089],[-1774,-2288],[-1872,-2525],[-1895,-2855],[-1790,-3367],[-1794,-3856],[-1956,-4127],[-2205,-4260],[-2350,-4269],[-2789,-4230],[-3243,-4055],[-3410,-4052],[-3784,-3918],[-4839,-3732],[-5095,-3710],[-5718,-3779],[-7391,-3410]];
const MULDE = [[4161,5927],[4200,5810],[4184,5687],[4127,5622],[4021,5582],[3532,5643],[3318,5565],[3269,5452],[3299,5298],[3535,4977],[3566,4877],[3543,4765],[3428,4579],[3309,4458],[3161,4404],[3002,4400],[2547,4545],[2346,4460],[2220,4314],[2096,3943],[1926,3633],[1938,3499],[2099,3155],[2053,2887],[1919,2772],[1323,2639],[1084,2422],[1076,2273],[1323,1851],[1334,1719],[1227,1624],[912,1514],[762,1390],[750,1260],[960,982],[1127,855],[1228,539],[1327,393],[1437,321],[1798,202],[1870,101],[1955,-232],[1931,-398],[1835,-568],[1662,-730],[1375,-917],[1308,-1024],[1315,-1149],[1385,-1280],[1635,-1512],[1671,-1726],[1620,-1921],[1335,-2351],[904,-2686],[887,-2803],[935,-2993],[1156,-3254],[1162,-3351],[1111,-3440],[874,-3563],[650,-3901],[527,-3959],[339,-3861],[173,-3549],[-200,-3313],[-323,-3165]];
function distSeg(px, pz, ax, az, bx2, bz) { const dx = bx2 - ax, dz = bz - az, l = dx * dx + dz * dz; let t = l ? ((px - ax) * dx + (pz - az) * dz) / l : 0; t = clamp(t, 0, 1); return Math.hypot(px - ax - t * dx, pz - az - t * dz); }
function distLine(px, pz, line) { let d = 1e9; for (let i = 0; i < line.length - 1; i++) d = Math.min(d, distSeg(px, pz, line[i][0], line[i][1], line[i + 1][0], line[i + 1][1])); return d; }
function inPoly(px, pz, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if (((a[1] > pz) !== (b[1] > pz)) && (px < (b[0] - a[0]) * (pz - a[1]) / (b[1] - a[1]) + a[0])) c = !c; } return c; }
// real map data from OpenStreetMap (© OpenStreetMap contributors, ODbL), compressed: every line is delta-encoded whole metres
/*@MAPDATA*/
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
  const real = true;
  if (real) {
    const GREEN = { F: '#e4e0c8', m: '#d8dfba', g: '#c9d5ad', a: '#cdd4ab', c: '#c3ceaa', f: '#adbf8f' };
    const green = closedRings(decodeLayer(MAPDATA.green)); ['F', 'm', 'a', 'g', 'c', 'f'].forEach(k => { g.fillStyle = GREEN[k]; green.forEach(o => { if (o.c === k) { area(o.p); g.fill(); } }); });
    g.fillStyle = '#9fb3c2'; closedRings(decodeLayer(MAPDATA.water)).forEach(o => { area(o.p); g.fill(); });
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
  }
  g.fillStyle = '#5c6f7e'; g.font = 'italic 500 ' + Math.round(sl(90)) + 'px Jost, Futura, Arial, sans-serif'; g.textAlign = 'center';
  g.save(); g.translate(sx(400), sz(-2380)); g.rotate(-0.1); g.fillText('Elbe', 0, 0); g.restore(); g.save(); g.translate(sx(7600), sz(-3240)); g.fillText('Elbe', 0, 0); g.restore();
  g.save(); g.translate(sx(1420), sz(-700)); g.rotate(-1.5); g.fillText('Mulde', 0, 0); g.restore(); g.save(); g.translate(sx(2500), sz(3500)); g.rotate(-1.0); g.fillText('Mulde', 0, 0); g.restore();
  g.fillText('Wörlitzer See', sx(12700), sz(-1010));
  g.fillStyle = '#6a7350'; g.font = '500 ' + Math.round(sl(48)) + 'px Jost, Futura, Arial, sans-serif'; g.fillText('Stadtpark', sx(565), sz(880));
  g.font = '500 ' + Math.round(sl(90)) + 'px Jost, Futura, Arial, sans-serif'; [['Georgium', -250, -1300], ['Tiergarten', 1700, 1500], ['Mosigkauer Heide', -5600, 5100], ['Wörlitzer Park', 13450, -1250], ['Mosigkau', -5800, 3550], ['Wörlitz', 12780, -120], ['Roßlau', 300, -3700], ['Kühnau', -2900, -350]].forEach(t => g.fillText(t[0], sx(t[1]), sz(t[2])));
  g.font = '500 ' + Math.round(sl(48)) + 'px Jost, Futura, Arial, sans-serif';
  g.fillStyle = '#6e6a63'; g.font = '500 ' + Math.round(sl(36)) + 'px Jost, Futura, Arial, sans-serif';
  if (false) [].forEach(r => { if (!r.n) return; const a = r.p[0], b = r.p[1]; const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2; g.save(); g.translate(sx(mx), sz(mz)); let ang = Math.atan2(sz(b[1]) - sz(a[1]), sx(b[0]) - sx(a[0])); if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI; g.rotate(ang); g.fillText(r.n, 0, -sl(22)); g.restore(); });
  if (MAPDATA.labels) { g.fillStyle = '#6e6a63'; g.font = '500 ' + Math.round(sl(30)) + 'px Jost, Futura, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    MAPDATA.labels.forEach(l => { g.save(); g.translate(sx(l[1]), sz(l[2])); let a = l[3]; if (a > Math.PI / 2) a -= Math.PI; if (a < -Math.PI / 2) a += Math.PI; g.rotate(a); g.fillText(l[0], 0, 0); g.restore(); }); }
  g.fillStyle = 'rgba(80,80,80,0.75)'; g.font = '400 ' + Math.round(sl(26)) + 'px Jost, Arial, sans-serif'; g.textAlign = 'right'; g.textBaseline = 'alphabetic'; if (real) g.fillText(tr('Map data © OpenStreetMap contributors'), N - sl(60), NZ - sl(40));
  return c;
}
function token(id) {
  const k = new Kit(); k.noGrass = true;
  if (REG[id] && REG[id].token) REG[id].token(k);   // each landmark's map token lives in its own file
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
  if (!on && typeof infoClose === 'function') { infoClose('newsPanel'); infoClose('aboutPanel'); infoClose('passportPanel'); }
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
function closeFact() { factIdx = -1; $('card').hidden = true; if (cur) cur.facts.forEach(g => { g.mk.classList.remove('on'); g.listEl.setAttribute('aria-current', 'false'); }); maybeAutoQuiz(); }
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

