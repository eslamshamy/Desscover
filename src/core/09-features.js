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
  if (!(window.claude && window.claude.use)) { try { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); toast('Saved ' + filename + '.'); return; } catch (e) {} }
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
    if (!o.isMesh || o === skyMesh || o.userData.byo || (BYO.grp && o.parent === BYO.grp)) return;
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
function passed(id) { return (PROG.quiz[id] || 0) >= 1; }
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
  if ($('passportPanel') && !$('passportPanel').hidden) renderPassport();
}
function updateTools() {
  if (!cur) return;
  const d = factsDone(curId), q = $('quizBtn');
  if (passed(curId)) { q.textContent = 'Stamped. Try the question again'; q.disabled = false; }
  else if (d && d.found >= d.total) { q.textContent = 'Answer one question for your stamp'; q.disabled = false; }
  else { q.textContent = 'Question: see ' + (d ? d.total - d.found : '') + ' more stories to unlock'; q.disabled = true; }
  $('peopleBtn').hidden = !RESIDENTS[curId];
  $('byoBtn').hidden = curId !== 'meister';
}

/* ---------- quiz ---------- */
const QUIZ = {};
LANDMARK_ORDER.forEach(id => { if (REG[id].quiz) QUIZ[id] = REG[id].quiz.map(q => LANG === 'de' ? Object.assign({}, q, { q: tr(q.q), o: q.o.map(tr), e: tr(q.e) }) : q); });   // each landmark's quiz lives in its own file;
// the quiz pops up by itself once every story of a landmark has been seen (once per visit; the Quiz button stays for another try)
const QUIZ_PROMPTED = {}; let QUIZ_AUTO = false;
function maybeAutoQuiz() {
  if (!cur || !QUIZ[curId] || passed(curId) || QUIZ_PROMPTED[curId]) return;
  const d = factsDone(curId); if (!d || d.found < d.total) return;
  QUIZ_PROMPTED[curId] = true; setTimeout(() => { if (!cur || !$('modalBack').hidden) return; QUIZ_AUTO = true; startQuiz(); QUIZ_AUTO = false; }, 450);
}
function startQuiz() {
  const qs = QUIZ[curId]; if (!qs) return; stopWalk();
  let i = 0, score = 0;
  const run = () => {
    if (i >= qs.length) {
      const pass = score >= 1; PROG.quiz[curId] = Math.max(PROG.quiz[curId] || 0, score); saveProg(); refreshProgress(); updateTools();
      const lm = LMS.find(l => l.id === curId);
      if (pass) modal('Stamp earned', 'Right! The ' + lm.name + ' is stamped in your passport.' + (allPassed() ? ' That is every stamp.' : ''), allPassed() ? [{ label: 'Get your certificate', fn: certificate }, { label: 'Close', ghost: true }] : [{ label: 'Close' }]);
      else modal('Not this time', 'Have another look at the stories and try again. You can retake the question from the Quiz button.', [{ label: 'Try again', fn: startQuiz }, { label: 'Close', ghost: true }]);
      return;
    }
    const q = qs[i], order = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    const wrap = document.createElement('div'); const p = document.createElement('p'); p.className = 'qq'; p.textContent = q.q; wrap.appendChild(p);
    const opts = document.createElement('div'); opts.className = 'qopts'; const btns = [];
    const next = document.createElement('button'); next.type = 'button'; next.className = 'btn'; next.textContent = i < qs.length - 1 ? 'Next question' : 'See your stamp'; next.hidden = true; next.onclick = () => { i++; run(); };
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
    modal(qs.length > 1 ? 'Question ' + (i + 1) + ' of ' + qs.length : (QUIZ_AUTO ? 'You have seen every story: one question for your stamp' : 'One question for your stamp'), wrap, [{ label: 'Not now', ghost: true }]);
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
  g.fillStyle = '#16171a'; g.font = '500 ' + F(108); g.fillText(tr('dessau explorer'), 90, 260);
  g.font = '400 ' + F(32); g.fillStyle = '#5b6064'; g.fillText(tr('This certifies that'), 92, 340);
  g.font = '500 ' + F(76); g.fillStyle = '#16171a'; g.fillText(name || tr('an explorer'), 90, 430);
  g.font = '400 ' + F(32); g.fillStyle = '#5b6064'; g.fillText(LANG === 'de' ? 'hat die Geschichten von ' + LMS.length + ' Dessauer Sehenswürdigkeiten entdeckt und alle Stempel gesammelt.' : 'discovered the stories of ' + LMS.length + ' Dessau landmarks and earned every stamp.', 92, 490);
  const cols = 6, cw = (W - 160) / cols;
  LMS.forEach((l, i) => {
    const cx = 80 + cw * (i % cols + 0.5), cy = 620 + Math.floor(i / cols) * 170;
    g.strokeStyle = '#c8372d'; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, 48, 0, 7); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 40, 0, 7); g.stroke();
    g.fillStyle = '#c8372d'; g.font = '600 ' + F(30); g.textAlign = 'center'; g.fillText(String(i + 1), cx, cy + 10);
    g.fillStyle = '#16171a'; g.font = '500 ' + F(17); g.fillText(l.name, cx, cy + 72); g.textAlign = 'left';
  });
  g.fillStyle = '#5b6064'; g.font = '400 ' + F(24); g.fillText(new Date().toLocaleDateString(LANG === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), 92, H - 60);
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
    g.fillStyle = '#16171a'; g.font = '500 ' + F(70); g.fillText(tr('greetings from dessau'), 60, 1135);
    const lm = cur ? LMS.find(l => l.id === curId) : null;
    g.font = '400 ' + F(30); g.fillStyle = '#5b6064';
    const era = cur && cur.eras && cur.eraIdx != null ? cur.eras[cur.eraIdx].year + ', ' : '';
    g.fillText(typeof caption === 'string' ? caption : (lm ? lm.label + ', ' + era : tr('The map of Dessau') + ', ') + fmt(timeNow) + (LANG === 'de' ? ' am ' + { dec: '4. Dezember', mar: '21. März', jun: '21. Juni' }[dateKey] : ' on ' + { dec: '4 December', mar: '21 March', jun: '21 June' }[dateKey]), 60, 1190);
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
Object.values(RESIDENTS).forEach(list => list.forEach(r => trObj(r, ['name', 'years', 'text'])));
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
const PHONE = window.matchMedia('(max-width:700px)');
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
[['newsPanel', 'City news'], ['aboutPanel', 'About'], ['passportPanel', 'My passport'], ['intro', 'DESSCOVER online'], ['lmlist', 'Landmarks'], ['bhead', 'Building'], ['bpanel', 'Tools and stories'], ['card', 'Story'], ['dressTray', 'Redesign'], ['walkHud', 'Walk'], ['byoTray', 'Build your own house']].forEach(([id, name]) => {
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
  grip.addEventListener('pointerdown', e => { if (e.button !== 0 || PHONE.matches) return; const r = el.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, moved: false }; grip.setPointerCapture(e.pointerId); uipFront(el); e.preventDefault(); e.stopPropagation(); });
  grip.addEventListener('pointermove', e => { if (!drag) return; if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 4) return; drag.moved = true; el.classList.add('dragging'); uipPlace(el, e.clientX - drag.dx, e.clientY - drag.dy); });
  const end = () => { if (!drag) return; el.classList.remove('dragging'); if (drag.moved) uipRemember(el); drag = null; };
  grip.addEventListener('pointerup', end); grip.addEventListener('pointercancel', end);
  grip.addEventListener('dblclick', e => { e.preventDefault(); uipReset(el); });
  grip.addEventListener('keydown', e => { const d = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }[e.key]; if (!d) return; e.preventDefault(); e.stopPropagation(); const r = el.getBoundingClientRect(); uipFront(el); uipPlace(el, r.left + d[0], r.top + d[1]); uipRemember(el); });
  el.addEventListener('pointerdown', () => uipFront(el));
  const st = UIP.st[id]; if (st) { if (st.l != null && isFinite(st.l) && !PHONE.matches) uipPlace(el, st.l, st.t); if (st.c) uipCollapse(el, true); }
  else if (PHONE.matches && id === 'intro') { el.classList.add('collapsed'); const b = col; b.textContent = '+'; b.setAttribute('aria-expanded', 'false'); b.title = 'Expand'; }
});
addEventListener('resize', () => document.querySelectorAll('.ui').forEach(el => { if (el.style.left && el.querySelector(':scope > .ptab')) uipClamp(el); }));
// on a phone the panels sit in fixed places: drop any position dragged on a larger screen
PHONE.addEventListener('change', () => { if (PHONE.matches) document.querySelectorAll('.ui').forEach(el => { if (el.querySelector(':scope > .ptab')) ['left', 'top', 'right', 'bottom', 'transform'].forEach(p => { el.style[p] = ''; }); }); });
// light and dark mode: follows the device until chosen, then remembers the choice
// language switch: the page reloads in the other language and keeps the landmark that is open
{ const b = $('langBtn'); if (b) { b.textContent = LANG === 'de' ? 'EN' : 'DE'; b.setAttribute('lang', LANG === 'de' ? 'en' : 'de'); b.title = LANG === 'de' ? 'Switch to English' : 'Auf Deutsch umschalten'; b.setAttribute('aria-label', b.title);
  b.onclick = () => { try { localStorage.setItem(LANG_KEY, LANG === 'de' ? 'en' : 'de'); } catch (e) {} location.reload(); }; } }
const THEME_KEY = 'dessau-theme';
function effectiveTheme() { const t = document.documentElement.dataset.theme; return t || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
function applyTheme(t) { if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; const e = effectiveTheme(), b = $('themeBtn'); if (b) { b.textContent = e === 'dark' ? '☀' : '☾'; b.title = e === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'; b.setAttribute('aria-label', b.title); } }
try { applyTheme(localStorage.getItem(THEME_KEY) || ''); } catch (e) { applyTheme(''); }
$('themeBtn').onclick = () => { const next = effectiveTheme() === 'dark' ? 'light' : 'dark'; applyTheme(next); try { localStorage.setItem(THEME_KEY, next); } catch (e) {} };
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(document.documentElement.dataset.theme || ''));
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
const BYO = { on: false, grp: null, plane: null, grid: null, ghost: null, size: 0, color: 0, erase: false, rot: false, blocks: [], key: 'dessau-byo-v2' };
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
  BYO.grp.userData.byo = true; BYO.ghost = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false })); BYO.ghost.visible = false; BYO.grp.add(BYO.ghost);
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
NEWS_LOCAL.forEach(n => trObj(n, ['d', 'title', 'text', 'src']));
let NEWS = NEWS_LOCAL.slice(), NEWS_STAMP_NOW = tr(NEWS_STAMP);
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
const INFO_BTN = { newsPanel: 'newsBtn', aboutPanel: 'railAbout', passportPanel: 'railPassport' };
function infoOpen(id, hot) {
  Object.keys(INFO_BTN).forEach(o => { if (o !== id) infoClose(o); });
  if (id === 'newsPanel') renderNews(hot);
  $(id).hidden = false; if ($(id).classList.contains('collapsed')) uipCollapse($(id), false); uipFront($(id));
  $(INFO_BTN[id]).setAttribute('aria-pressed', 'true');
  if (hot) { const el = $('newsList').querySelector('li.hot'); if (el) el.scrollIntoView({ block: 'nearest' }); }
}
function infoClose(id) { const el = $(id); if (!el) return; el.hidden = true; const b = $(INFO_BTN[id]); if (b) b.setAttribute('aria-pressed', 'false'); }
$('newsBtn').onclick = () => { if ($('newsPanel').hidden) infoOpen('newsPanel'); else infoClose('newsPanel'); };
$('railAbout').onclick = () => { if ($('aboutPanel').hidden) infoOpen('aboutPanel'); else infoClose('aboutPanel'); };
$('newsClose').onclick = () => infoClose('newsPanel'); $('aboutClose').onclick = () => infoClose('aboutPanel');
$('lpBadge').onclick = () => infoOpen('newsPanel', 'lp');
(function aboutLinks() {
  const row = $('aboutLinks'); row.innerHTML = '';
  [['website', 'Website'], ['linkedin', 'LinkedIn']].forEach(([k, label]) => { const u = safeUrl(PROFILE_LINKS[k]); if (!u) return; const a = document.createElement('a'); a.className = 'btn'; a.href = u; a.target = '_blank'; a.rel = 'noopener'; a.textContent = label; row.appendChild(a); });
  row.hidden = !row.children.length;
})();
// news can later be refreshed without republishing: a "news/feed" document, written by the owner, replaces the built-in list
(async () => {
  const db = await capUse('db');
  if (!db) { try { const r = await fetch('news.json', { cache: 'no-store' }); if (!r.ok) return; const b = await r.json();
      if (b && Array.isArray(b.items) && b.items.length) { const items = b.items.filter(n => n && typeof n.title === 'string').slice(0, 12).map(n => ({ d: String(n.d || '').slice(0, 40), id: String(n.id || '').slice(0, 40), title: n.title.slice(0, 160), text: String(n.text || '').slice(0, 600), src: String(n.src || '').slice(0, 80), url: String(n.url || ''), lm: String(n.lm || '') }));
        NEWS = items; if (typeof b.stamp === 'string') NEWS_STAMP_NOW = b.stamp.slice(0, 120); if (!$('newsPanel').hidden) renderNews(); } } catch (e) {} return; }
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
function renderPassport() {
  const box = $('passportList'); box.innerHTML = ''; let st = 0, found = 0, total = 0;
  LMS.forEach((l, i) => { const d = factsDone(l.id), ok = passed(l.id); if (ok) st++; if (d) { found += d.found; total += d.total; }
    const li = document.createElement('li'); li.className = 'pp' + (ok ? ' ok' : '');
    const sp = document.createElement('span'); sp.className = 'stamp'; sp.setAttribute('aria-hidden', 'true'); sp.textContent = ok ? '✓' : String(i + 1); li.appendChild(sp);
    const tx = document.createElement('div'); const b = document.createElement('b'); b.textContent = l.name; tx.appendChild(b);
    const s2 = document.createElement('span'); s2.textContent = (d ? d.found + ' of ' + d.total + ' stories' : 'not explored yet') + (d && d.hFound ? ' · hidden detail found' : '') + ' · ' + (ok ? 'stamped' : 'no stamp yet'); tx.appendChild(s2); li.appendChild(tx);
    const go2 = document.createElement('button'); go2.type = 'button'; go2.className = 'btn ghost'; go2.textContent = 'Open'; go2.setAttribute('aria-label', 'Open ' + l.name); go2.onclick = () => { infoClose('passportPanel'); go(l.id); }; li.appendChild(go2);
    box.appendChild(li); });
  $('passportSum').textContent = st + ' of ' + LMS.length + ' stamps · ' + found + ' stories found' + (allPassed() ? ' · every stamp collected!' : '');
}
$('railPassport').onclick = () => { if ($('passportPanel').hidden) { renderPassport(); infoOpen('passportPanel'); } else infoClose('passportPanel'); };
$('passportClose').onclick = () => infoClose('passportPanel'); $('passportCert').onclick = certificate;
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
let LAST_T = 0;
function loop(now) {
  requestAnimationFrame(loop);
  updateCompass();
  if (LAST_T) perfWatch(now - LAST_T); LAST_T = now;
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
requestAnimationFrame(loop);
}
