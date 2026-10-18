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

