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
  stopWalk(); stopReplay(); closeDress(); stopTrail(); closeModal(); if (typeof byoClose === 'function') byoClose();
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
    $('immBack').hidden = true;
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    refreshProgress();
  } else {
    const lm = LMS.find(l => l.id === id); if (!lm) return go('map');
    if (!BUILT[id]) { await wait(30); BUILT[id] = localizeScene(lm.build()); const b = BUILT[id]; b.dress = {}; b.facts = b.facts.concat((b.hiddenFacts || []).map(f => Object.assign(f, { hidden: true }))); if (ALIGN[id]) { b.rotY = ALIGN[id][0] * D2R; b.mirror = ALIGN[id][1]; } if (b.rotY || b.mirror) { const root = new THREE.Group(); b.scene.children.slice().forEach(o => root.add(o)); root.rotation.y = b.rotY || 0; if (b.mirror) root.scale.x = -1; b.scene.add(root); } }
    cur = BUILT[id]; curId = id;
    setActiveScene(cur.scene); attachWorld(cur.scene, cur.center, cur.span, cur.sunDist);
    lampPool.forEach((l, i) => { const p = cur.lamps && cur.lamps[i]; l.userData.on = !!p; if (p) l.position.copy(toW(p.clone())); else l.position.set(0, -500, 0); });
    controls.minDistance = 4; controls.maxDistance = 330; controls.maxPolarAngle = Math.PI * 0.492; controls.minPolarAngle = 0;
    if (gtao) { try { gtao.updateGtaoMaterial({ radius: 2.2 }); } catch (e) {} }
    touchBuilt(id); showMapUI(false); buildFactUI(lm); recordCounts(id); buildEraUI(); buildViews(); buildPeople(); updateTools(); if (id === 'meister') byoEnsure();
    const ip = rotPt(cur.intro.pos), it = rotPt(cur.intro.tgt);
    camera.position.copy(ip).multiplyScalar(1.7).setY(ip.y * 2); controls.target.copy(it); controls.update();
    flyTo(ip, it, 2000);
    if (location.hash !== '#' + id) setHash('#' + id);
    $('immBack').hidden = false;
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
  const w = dom.clientWidth, h = dom.clientHeight;
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

