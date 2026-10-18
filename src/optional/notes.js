/* Visitor notes on the map: switched off for now.
   To bring them back: add this file to the CORE list in build.py right after 60-features.js, and put back the
   "Pin a note" button, <div id="notePins"> and the .npin styles in shell.html, placeNotePins() in updateOverlays,
   and the NOTE.placing checks in the pointer and key handlers. */
/* ---------- 2. Visitor notes on the map ---------- */
const NOTE = { db: null, user: null, me: null, owner: false, canWrite: null, list: [], placing: false, els: new Map(), names: {} };
const CFG = window.DESSCOVER_CONFIG || {};
// public website: notes live in a Supabase table (anyone can read and add; the owner deletes in the Supabase dashboard)
async function sbFetch(path, init) { const r = await fetch(CFG.supabaseUrl.replace(/\/$/, '') + '/rest/v1/' + path, Object.assign({}, init, { headers: Object.assign({ apikey: CFG.supabaseAnonKey, Authorization: 'Bearer ' + CFG.supabaseAnonKey, 'Content-Type': 'application/json' }, (init && init.headers) || {}) })); if (!r.ok) { const e = new Error('Supabase ' + r.status); e.code = r.status; throw e; } return r.status === 204 || r.status === 201 ? null : r.json(); }
async function sbReload() { try { const rows = await sbFetch('notes?select=id,x,z,text,t,photo,author&order=t.desc&limit=400'); NOTE.list = (rows || []).filter(r => typeof r.x === 'number' && typeof r.z === 'number' && typeof r.text === 'string').map(r => ({ owner: 'sb', id: String(r.id), x: r.x, z: r.z, text: r.text.slice(0, 300), t: Date.parse(r.t) || 0, photo: !!r.photo, author: typeof r.author === 'string' ? r.author.slice(0, 40) : '' })); renderNotes(); } catch (e) {} }
async function notePhoto(owner, id) {
  if (NOTE.sb) { const rows = await sbFetch('notes?id=eq.' + encodeURIComponent(id) + '&select=photo_data'); return rows && rows[0] ? rows[0].photo_data : null; }
  const d = await NOTE.db.doc('notes/' + owner + '/photos/' + id).get(); return d.exists ? (d.data() || {}).data : null;
}
async function initNotes() {
  NOTE.db = await capUse('db');
  if (!NOTE.db) { if (!(CFG.supabaseUrl && CFG.supabaseAnonKey)) return; NOTE.sb = true; NOTE.me = 'web'; NOTE.canWrite = true; $('noteBtn').hidden = false; await sbReload(); setInterval(sbReload, 45000); return; }
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
  if (!(NOTE.db || NOTE.sb) || !NOTE.me) return; if (curId !== 'map') { go('map'); }
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
  let nm = null; if (NOTE.sb) { nm = document.createElement('input'); nm.type = 'text'; nm.maxLength = 40; nm.placeholder = 'Your name (optional)'; nm.setAttribute('aria-label', 'Your name (optional)'); nm.className = 'noteName'; wrap.appendChild(nm); }
  const msg = document.createElement('p'); msg.className = 'muted'; wrap.appendChild(msg);
  modal('Pin a note', wrap, [{ label: 'Pin it', keep: true, fn: async () => {
    const text = ta.value.trim(); if (!text) { msg.textContent = 'Write a few words first.'; return; }
    msg.textContent = 'Saving…'; let photo = null;
    if (fi.files && fi.files[0]) { try { photo = await shrinkPhoto(fi.files[0]); } catch (e) { photo = null; } if (!photo) { msg.textContent = 'That photo could not be used. Try a smaller image, or pin the note without it.'; return; } }
    const id = 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    if (NOTE.sb) { try { await sbFetch('notes', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ x: Math.round(pt.x), z: Math.round(pt.z), text, author: (nm && nm.value.trim().slice(0, 40)) || null, photo: !!photo, photo_data: photo }) }); await sbReload(); closeModal(); toast('Your note is pinned.'); } catch (e) { msg.textContent = 'The note could not be saved. Please try again later.'; } return; }
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
    notePhoto(owner, id).then(v => { if (typeof v === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v)) { const img = document.createElement('img'); img.src = v; img.alt = 'Photo pinned with this note'; img.className = 'notePhoto'; ph.replaceWith(img); } else ph.textContent = 'The photo is no longer available.'; }).catch(() => { ph.textContent = 'The photo could not be loaded.'; }); }
  const by = document.createElement('p'); by.className = 'muted'; by.textContent = NOTE.sb ? (n.author ? 'Pinned by ' + n.author : 'Pinned by a visitor') : owner === NOTE.me ? 'Pinned by you' : 'Pinned by a visitor'; wrap.insertBefore(by, tx);
  if (NOTE.user && owner !== NOTE.me) NOTE.user.profiles([owner]).then(ps => { const nm = ps && ps[owner] && ps[owner].name; if (nm) by.textContent = 'Pinned by ' + nm; }).catch(() => {});
  const acts = [{ label: 'Close' }];
  if (!NOTE.sb && (owner === NOTE.me || NOTE.owner)) acts.unshift({ label: 'Delete note', ghost: true, fn: async () => {
    try { const rest = NOTE.list.filter(q => q.owner === owner && q.id !== id).map(q => ({ id: q.id, x: q.x, z: q.z, text: q.text, t: q.t, photo: q.photo }));
      await NOTE.db.collection('notes').doc(owner).set({ items: rest }); if (n.photo) await NOTE.db.doc('notes/' + owner + '/photos/' + id).delete().catch(() => {}); toast('Note deleted.'); }
    catch (e) { toast('The note could not be deleted.'); } } });
  modal('Visitor note', wrap, acts);
}
$('noteBtn').onclick = () => { if (NOTE.placing) stopPlacing(); else startPlacing(); };
initNotes();

