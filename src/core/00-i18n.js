/* ================= languages: English and German ================= */
// The page is written in English; src/i18n/de.json maps each English text to its German version.
// tr() translates one text: an exact entry first, then the patterns below (for texts built from parts), then by its parts.
const LANG_KEY = 'dessau-lang';
const LANG = (() => { try { const s = localStorage.getItem(LANG_KEY); if (s === 'de' || s === 'en') return s; } catch (e) {} return /^de\b/i.test(navigator.language || '') ? 'de' : 'en'; })();
document.documentElement.lang = LANG;
const DE = /*@I18N_DE*/{};
const DE_RX = [
  [/^(\d+) stories and (\d+) hidden details? found\. (\d+) of (\d+) stamps earned\.$/, '$1 Geschichten und $2 versteckte Details gefunden. $3 von $4 Stempeln gesammelt.'],
  [/^(\d+) of (\d+) stamps$/, '$1 von $2 Stempeln'],
  [/^(\d+) stories found$/, '$1 Geschichten gefunden'],
  [/^(\d+) of (\d+) stories$/, '$1 von $2 Geschichten'],
  [/^Question: see (\d+) more stor(?:y|ies) to unlock$/, 'Frage: noch $1 Geschichten bis zur Freischaltung'],
  [/^Saved (.+)\.$/, (m, f) => f + ' gespeichert.'],
  [/^Open (.+)$/, (m, n) => tr(n) + ' öffnen'],
  [/^Opening (?:the )?(.+)…$/, (m, n) => tr(n) + ' wird geöffnet…'],
  [/^Building (?:the )?(.+)…$/, (m, n) => tr(n) + ' wird gebaut…'],
  [/^Move the (.+) panel: use the arrow keys, or double-click to put it back$/, (m, n) => 'Fenster „' + tr(n) + '“ verschieben: Pfeiltasten verwenden oder doppelklicken, um es zurückzusetzen'],
  [/^Collapse or expand the (.+) panel$/, (m, n) => 'Fenster „' + tr(n) + '“ ein- oder ausklappen'],
  [/^Source: (.+)$/, (m, n) => 'Quelle: ' + tr(n)],
  [/^Right\. ([\s\S]+)$/, (m, n) => 'Richtig. ' + tr(n)],
  [/^Not quite\. ([\s\S]+)$/, (m, n) => 'Nicht ganz. ' + tr(n)],
  [/^Right! The (.+) is stamped in your passport\.( That is every stamp\.)?$/, (m, n, all) => 'Richtig! ' + tr(n) + ' ist in Ihrem Pass gestempelt.' + (all ? ' Das sind alle Stempel.' : '')],
  [/^(?:(\d+) blocks?\. )?Placing a (\S+) (\S+)(, turned)?\. Click the plot or a block to stack\.$/, (m, n, c, s, t) => (n ? n + ' Bausteine. ' : '') + 'Sie setzen: ' + tr(c) + ' ' + tr(s) + (t ? ', gedreht' : '') + '. Klicken Sie auf das Grundstück oder einen Baustein zum Stapeln.'],
  [/^Collected on (.+)\.$/, (m, d) => 'Zusammengestellt am ' + d + '.'],
  [/^Updated automatically on (.+) from Google News\.$/, (m, d) => 'Automatisch aktualisiert am ' + d + ' über Google News.']
];
const TR_CACHE = new Map();
function trWhole(s) {
  if (DE[s] !== undefined) return DE[s];
  for (const [rx, rep] of DE_RX) if (rx.test(s)) { const r = s.replace(rx, rep); if (r !== s) return r; }
  return null;
}
function tr(s) {
  if (LANG !== 'de' || typeof s !== 'string' || !s.trim()) return s;
  if (TR_CACHE.has(s)) return TR_CACHE.get(s);
  const lead = s.match(/^\s*/)[0], trail = s.match(/\s*$/)[0], core = s.trim();
  let out = trWhole(core);
  if (out === null) {   // a number in front of a known text, as in lists
    const m = core.match(/^(\d+)(\.?)(\s+)([\s\S]+)$/); if (m) { const t = trWhole(m[4]); if (t !== null) out = m[1] + m[2] + m[3] + t; }
  }
  if (out === null) {   // a title and a note joined by a full stop
    const i = core.indexOf('. '); if (i > 0) { const a = trWhole(core.slice(0, i)), b = trWhole(core.slice(i + 2)); if (a !== null && b !== null) out = a + '. ' + b; }
  }
  if (out === null) for (const sep of [' · ', ', ']) {   // short status texts made of known parts
    if (!core.includes(sep)) continue; const parts = core.split(sep).map(p => /^[\d\s.,:–-]*$/.test(p) ? p : trWhole(p));
    if (parts.every(p => p !== null)) { out = parts.join(sep); break; }
  }
  const res = out === null ? s : lead + out + trail; TR_CACHE.set(s, res); return res;
}
function trObj(o, keys) { if (LANG === 'de' && o) keys.forEach(k => { if (typeof o[k] === 'string') o[k] = tr(o[k]); }); return o; }
// a scene's stories, periods and views
function localizeScene(b) {
  if (LANG !== 'de' || !b) return b;
  (b.facts || []).concat(b.hiddenFacts || []).forEach(f => trObj(f, ['title', 'text', 'year']));
  (b.eras || []).forEach(e => trObj(e, ['year', 'title', 'note'])); (b.views || []).forEach(v => trObj(v, ['label']));
  return b;
}
// the visible page: text, tooltips and screen-reader labels, now and whenever something new appears
const TR_ATTRS = ['title', 'aria-label', 'placeholder', 'alt'];
function trNode(n) {
  if (n.nodeType === 3) { const p = n.parentElement; if (!p || p.closest('script,style,textarea,[data-no-tr]')) return; const v = n.nodeValue, t = tr(v); if (t !== v) n.nodeValue = t; }
  else if (n.nodeType === 1 && !n.closest('script,style,[data-no-tr]')) TR_ATTRS.forEach(a => { const v = n.getAttribute(a); if (v) { const t = tr(v); if (t !== v) n.setAttribute(a, t); } });
}
function trTree(root) { trNode(root); if (!root.querySelectorAll && root.nodeType !== 1) return; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT); let n; while ((n = w.nextNode())) trNode(n); }
if (LANG === 'de') {
  document.title = tr(document.title);
  const md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', 'DESSCOVER online: eine Karte von Dessau mit sechsundzwanzig Sehenswürdigkeiten. Öffnen Sie jede als 3D-Modell, gehen Sie im echten Dessauer Sonnenlicht herum und klicken Sie sich durch ihre Geschichte.');
  trTree(document.body);
  new MutationObserver(ms => ms.forEach(m => { if (m.type === 'childList') m.addedNodes.forEach(trTree); else trNode(m.target); }))
    .observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: TR_ATTRS });
}
