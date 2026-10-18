/* ================================================================
   Hauptbahnhof (hbf)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['hbf'] = {
  meta: { id: 'hbf', years: 'rebuilt by 1952', name: 'Hauptbahnhof', sub: 'Main station, since 1840', lat: 51.839972, lon: 12.234975, build: buildHbf, label: 'Dessau Hauptbahnhof', meta: 'Railway station since 1840, rebuilt after 1945', lead: 'Dessau’s main station sits on lines to Berlin, Leipzig and Magdeburg. Click the numbers or the building to learn its story.' },
  token(k) {
    k.box('stationRed', -50, 64, 0, 12.6, 3, 19); k.box('stationRed', -15, 15, 0, 20, 7, 25); k.box('cream', -15.5, 15.5, 20, 20.6, 6.5, 25.5); k.box('canopy', -60, 60, 4, 4.4, -26, -2); k.box('train', -40, 39, 0.7, 4.1, -13.4, -10.6); k.box('ballast', -80, 80, 0, 0.3, -30, 2);
  },
  quiz: [
    { q: 'When did Dessau’s first railway open?', o: ['1840', '1857', '1876', '1911'], a: 0, e: 'The Berlin-Anhalt Railway Company opened it on 1 September 1840.' }
  ]
};

function buildHbf() {
  const k = new Kit();
  const L0 = -80, L1 = 80;
  const R = 'stationRed', CR = 'cream', IN = 'hallWall';
  const HX = 15, HZ0 = 3, HZ1 = 25, HH = 16.5, WH = 11, WZL = 23.5, WZR = 23.5, WL0 = -57, WR1 = 57;
  const surround = (face, c, sgn, a0, a1, y0, y1, w, tag) => {
    const d = rng2(c, c + sgn * 0.12), t = w || 0.2;
    if (face === 'z') { k.box(CR, a0 - t, a1 + t, y1, y1 + t, d[0], d[1], tag); k.box(CR, a0 - t, a1 + t, y0 - t, y0, d[0], d[1], tag); k.box(CR, a0 - t, a0, y0, y1, d[0], d[1], tag); k.box(CR, a1, a1 + t, y0, y1, d[0], d[1], tag); }
    else { k.box(CR, d[0], d[1], y1, y1 + t, a0 - t, a1 + t, tag); k.box(CR, d[0], d[1], y0 - t, y0, a0 - t, a1 + t, tag); k.box(CR, d[0], d[1], y0, y1, a0 - t, a0, tag); k.box(CR, d[0], d[1], y0, y1, a1, a1 + t, tag); }
  };
  const rod = (a, b, r, m) => { const A = new THREE.Vector3().fromArray(a), B = new THREE.Vector3().fromArray(b), d = B.clone().sub(A); const g = new THREE.CylinderGeometry(r, r, d.length(), 6); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())); const mm = A.clone().add(B).multiplyScalar(0.5); g.translate(mm.x, mm.y, mm.z); k.geo(m || 'canopyDark', g, 'gateway'); };
  const wallZ = (zo, zi, x0, x1, y0, y1, tag) => { const zm = (zo + zi) / 2, a = rng2(zo, zm), b = rng2(zm, zi); k.box(R, x0, x1, y0, y1, a[0], a[1], tag); const i0 = Math.max(x0, -HX + 0.6), i1 = Math.min(x1, HX - 0.6); if (i1 > i0) k.box(IN, i0, i1, y0, y1, b[0], b[1], 'hall'); };
  const wallX = (xo, xi, z0, z1, y0, y1, tag) => { const xm = (xo + xi) / 2, a = rng2(xo, xm), b = rng2(xm, xi); k.box(R, a[0], a[1], y0, y1, Math.max(z0, HZ0 + 0.3), Math.min(z1, HZ1 - 0.3), tag); k.box(IN, b[0], b[1], y0, y1, Math.max(z0, HZ0 + 0.6), Math.min(z1, HZ1 - 0.6), 'hall'); };
  const piers = (xs, half, lo, hi) => { const out = []; let p = lo; xs.forEach(c => { out.push([p, c - half]); p = c + half; }); out.push([p, hi]); return out; };

  k.part = 'station';
  // hipped roof that can butt straight against a taller wall at either end (ixa / ixb = 0)
  const hip = (x0, x1, z0, z1, y0, y1, ixa, ixb, iz) => {
    const bb = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], tt = [[x0 + ixa, y1, z0 + iz], [x1 - ixb, y1, z0 + iz], [x1 - ixb, y1, z1 - iz], [x0 + ixa, y1, z1 - iz]];
    const quads = [[bb[0], bb[1], tt[1], tt[0]], [bb[1], bb[2], tt[2], tt[1]], [bb[2], bb[3], tt[3], tt[2]], [bb[3], bb[0], tt[0], tt[3]], [tt[0], tt[1], tt[2], tt[3]]], pos = [], uv = [];
    const put = v => { pos.push(v[0], v[1], v[2]); uv.push(v[0] + v[2], v[1] * 1.6); };
    quads.forEach(q => { [q[0], q[2], q[1], q[0], q[3], q[2]].forEach(put); });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals(); return g;
  };
  /* ---------- the entrance hall: tall block, cream portal frame, seven tall windows, steel canopy ---------- */
  const FX = 10.8, FI = 9.4;                         // portal frame: outer and inner half-width
  const OPEN = [[-FI, -3.6], [-2.6, 2.6], [3.6, FI]]; // the three entrance bays under the canopy
  const WIN = Array.from({ length: 7 }, (_, i) => -8.2 + i * 2.733);
  const WY0 = 5.8, WY1 = 10.4, CY = 5.2, ZD = HZ1 - 2.4;
  k.box('concrete', -HX - 0.1, HX + 0.1, 0, 0.9, HZ0, HZ1, 'raid');
  // street front, built round the openings
  [[-HX, -FX], [FX, HX]].forEach(q => wallZ(HZ1, HZ1 - 0.6, q[0], q[1], 0.9, CY + 0.1, 'gateway'));
  wallZ(HZ1, HZ1 - 0.6, -HX, HX, CY + 0.1, WY0, 'gateway');
  piers(WIN, 0.9, -HX, HX).forEach(q => wallZ(HZ1, HZ1 - 0.6, q[0], q[1], WY0, WY1, 'gateway'));
  wallZ(HZ1, HZ1 - 0.6, -HX, HX, WY1, HH, 'raid');
  // platform front
  wallZ(HZ0, HZ0 + 0.6, -HX, HX, 0.9, 6.8, 'platform');
  piers(WIN, 0.9, -HX, HX).forEach(q => wallZ(HZ0, HZ0 + 0.6, q[0], q[1], 6.8, 11.6, 'platform'));
  wallZ(HZ0, HZ0 + 0.6, -HX, HX, 11.6, HH, 'platform');
  [-1, 1].forEach(sd => wallX(sd * HX, sd * (HX - 0.6), HZ0, HZ1, 0.9, HH, 'raid'));
  // deep cream eave and a low hipped grey roof with two brick chimneys
  k.box(CR, -HX - 0.6, HX + 0.6, HH - 0.35, HH + 0.35, HZ0 - 0.6, HZ1 + 0.6, 'raid');
  k.geo('roof', prism(-HX - 0.6, HX + 0.6, HZ0 - 0.6, HZ1 + 0.6, HH + 0.35, HH + 3.2, 5.0, 5.0), 'raid');
  [[-6, HZ0 + 6], [7, HZ1 - 7]].forEach(c => k.box('brick', c[0] - 0.6, c[0] + 0.6, HH + 1.0, HH + 4.4, c[1] - 0.6, c[1] + 0.6, 'raid'));
  // the cream portal frame: two side piers, a head band and a fine inner line
  [-1, 1].forEach(sd => { const xa = sd < 0 ? -FX : FI, xb = sd < 0 ? -FI : FX; k.box(CR, xa, xb, 0.9, CY + 0.1, ZD, HZ1 + 0.35, 'gateway'); k.box(CR, xa, xb, CY + 0.1, 10.9, HZ1, HZ1 + 0.35, 'gateway'); });
  k.box(CR, -FX, FX, 10.9, 11.6, HZ1, HZ1 + 0.35, 'gateway');
  k.box(CR, -FI, FI, 10.62, 10.9, HZ1, HZ1 + 0.14, 'gateway');
  // seven tall windows with cream surrounds
  WIN.forEach(cx => { k.winZ(HZ1, 1, cx - 0.9, cx + 0.9, WY0, WY1, { mull: 0.6, trans: [6.9, 8.0, 9.1], frame: 'whiteInt', glass: 'glassDark', back: false, tag: 'gateway' }); surround('z', HZ1, 1, cx - 0.9, cx + 0.9, WY0, WY1, 0.14, 'gateway'); });
  // entrance bays: recessed vestibules with yellow-tiled walls and glazed doors
  [[-3.6, -2.6], [2.6, 3.6]].forEach(q => k.box(CR, q[0], q[1], 0.9, CY + 0.1, ZD, HZ1 + 0.35, 'gateway'));
  OPEN.forEach(o => {
    k.box('tileYellow', o[0], o[0] + 0.04, 0.9, CY, ZD, HZ1, 'gateway'); k.box('tileYellow', o[1] - 0.04, o[1], 0.9, CY, ZD, HZ1, 'gateway');
    k.box('hallCeiling', o[0], o[1], CY, CY + 0.1, ZD, HZ1, 'gateway');
    k.box('tileYellow', o[0] + 0.04, o[1] - 0.04, 3.4, CY, ZD - 0.3, ZD, 'gateway');
    k.box('tileYellow', o[0] + 0.04, o[0] + 0.5, 0.9, 3.4, ZD - 0.3, ZD, 'gateway'); k.box('tileYellow', o[1] - 0.5, o[1] - 0.04, 0.9, 3.4, ZD - 0.3, ZD, 'gateway');
    k.winZ(ZD, 1, o[0] + 0.5, o[1] - 0.5, 0.9, 3.4, { mull: 1.1, trans: [2.7], frame: 'canopyDark', glass: 'glassDark', back: false, tag: 'gateway' });
  });
  // flat steel canopy, longer to the east, hung from the facade on tie rods
  k.box('canopyDark', -FX - 0.1, 14.6, CY, CY + 0.25, HZ1, HZ1 + 4.0, 'gateway'); k.box('canopyDark', -FX - 0.2, 14.7, CY - 0.12, CY + 0.32, HZ1 + 3.85, HZ1 + 4.1, 'gateway');
  [-8.7, -3.1, 3.1, 8.7, 13.4].forEach(x => rod([x, x > FX ? 10.4 : 10.8, HZ1 + 0.38], [x, CY + 0.3, HZ1 + 3.9], 0.045));
  // a broad flight of five steps down to the forecourt
  for (let i = 0; i < 5; i++) k.box('concrete', -12.2 - i * 0.2, 15.2 + i * 0.2, 0.9 - (i + 1) * 0.18, 0.9 - i * 0.18, HZ1, HZ1 + 0.9 + i * 0.5, 'gateway');
  // platform side: tall windows with round lights above
  WIN.forEach(cx => {
    k.winZ(HZ0, -1, cx - 0.9, cx + 0.9, 6.8, 11.6, { mull: 0.6, trans: [9.2], frame: 'whiteInt', glass: 'glassDark', back: false, tag: 'platform' });
    surround('z', HZ0, -1, cx - 0.9, cx + 0.9, 6.8, 11.6, 0.14, 'platform');
    const og = new THREE.CircleGeometry(0.55, 24); og.rotateY(Math.PI); og.translate(cx, 14.0, HZ0 - 0.04); k.geo('glassDark', og, 'platform');
    const og2 = new THREE.CircleGeometry(0.55, 24); og2.translate(cx, 14.0, HZ0 + 0.64); k.geo('glassDark', og2, 'hall');
    const rg = new THREE.RingGeometry(0.55, 0.74, 24); rg.rotateY(Math.PI); rg.translate(cx, 14.0, HZ0 - 0.06); k.geo(CR, rg, 'platform');
  });
  /* ---------- inside the hall ---------- */
  const IX = HX - 0.6, IZ0 = HZ0 + 0.6, IZ1 = ZD - 0.3;
  k.box('floorStone', -IX, IX, 0.88, 0.92, IZ0, IZ1, 'hall');
  k.box('hallCeiling', -IX, IX, 14.96, 15.0, IZ0, HZ1 - 0.6, 'hall');
  for (let ix = -10.5; ix <= 10.5; ix += 3.5) for (let iz = IZ0 + 3; iz <= IZ1 - 2; iz += 4) { const lg = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 16); lg.translate(ix, 14.92, iz); k.geo('lampHead', lg, 'hall'); }
  k.box('dark', -IX, -IX + 0.5, 0.9, 3.2, 11, 20, 'hall'); k.box('dark', IX - 0.5, IX, 0.9, 3.2, 11, 20, 'hall');
  k.box('dark', -3.2, 3.2, 0.9, 1.25, 13, 17, 'hall'); k.box('wood', -3.3, 3.3, 1.25, 1.35, 12.9, 17.1, 'hall');
  /* ---------- the two wings: three rows of windows, cream cornice, low hipped roof ---------- */
  // both wings alike, mirrored about the hall: a stretch next to the hall, then a deep end block reaching out towards the tracks
  const wwin = (face, c, sg, a, w, y0, y1, o, t) => {
    const opt = Object.assign({ frame: 'whiteInt', glass: 'glassDark', tag: t }, o || {});
    if (face === 'z') k.winZ(c, sg, a - w / 2, a + w / 2, y0, y1, opt); else k.winX(c, sg, a - w / 2, a + w / 2, y0, y1, opt);
    surround(face, c, sg, a - w / 2, a + w / 2, y0, y1, (o && o.sw) || 0.16, t);
  };
  const ROWS = [[1.3, 4.3, 1.6, { mull: 0.8, trans: [3.3] }], [6.6, 8.6, 1.5, { mull: 0.75, trans: [7.8] }], [9.4, 10.2, 0.8, { mull: 0.8, sw: 0.12 }]];
  const AX0 = -41, AX1 = 41, AZ0 = -4;              // single-storey platform building in front of the hall
  const NB = 41, NBZ = -4;                          // north end block: starts at x = NB, reaches back to z = NBZ
  const wingBlock = (x0, x1, z0, z1, cx0, cx1, hipA, hipB) => {
    k.box('concrete', x0, x1, 0, 0.5, z0, z1, 'built');
    k.box(R, x0, x1, 0.5, WH, z0, z1, 'built');
    k.box(CR, x0 - cx0, x1 + cx1, WH - 0.3, WH + 0.3, z0 - 0.4, z1 + 0.4, 'built');
    k.geo('roof', hip(x0 - cx0, x1 + cx1, z0 - 0.4, z1 + 0.4, WH + 0.3, WH + 3.0, hipA, hipB, 4.2), 'built');
  };
  wingBlock(-NB, -HX, HZ0, WZL, 0, 0, 0, 0);           // south wing, stretch next to the hall
  wingBlock(WL0, -NB, NBZ, WZL, 0.4, 0, 4.2, 0);       // south end block
  k.box(CR, -NB, -NB + 0.4, WH - 0.3, WH + 0.3, NBZ - 0.4, HZ0 - 0.4, 'built');
  wingBlock(HX, NB, HZ0, WZR, 0, 0, 0, 0);             // north wing, stretch next to the hall
  wingBlock(NB, WR1, NBZ, WZR, 0, 0.4, 0, 4.2);        // north end block
  k.box(CR, NB - 0.4, NB, WH - 0.3, WH + 0.3, NBZ - 0.4, HZ0 - 0.4, 'built');   // cornice returns round the exposed south corner
  [[30, 12], [49, 8], [-30, 12], [-49, 8]].forEach(c => k.box('brick', c[0] - 0.5, c[0] + 0.5, WH + 1.5, WH + 4.2, c[1] - 0.5, c[1] + 0.5, 'built'));
  const underAnnex = (cx, ri) => ri < 2 && ri === 0 && cx > AX0 - 1 && cx < AX1 + 1;
  // street fronts and platform faces, mirrored for both wings
  [-1, 1].forEach(sd => {
    const WZ = sd < 0 ? WZL : WZR;
    for (let i = 0; i < 11; i++) { const cx = sd * (17.8 + i * 3.6);
      ROWS.forEach((r, ri) => {
        if (sd < 0 && i === 0 && ri === 0) { wwin('z', WZ, 1, cx, 1.8, 0.5, 3.2, { mull: 0.9, trans: [2.6] }, 'built'); return; }   // side door
        if (sd < 0 && i === 0 && ri === 1) { surround('z', WZ, 1, cx - 0.95, cx + 0.95, 6.6, 8.9, 0.16, 'built'); return; }        // framed blank panel
        wwin('z', WZ, 1, cx, r[2], r[0], r[1], r[3], 'built');
        if (Math.abs(cx) + 0.9 < NB && !underAnnex(cx, ri)) wwin('z', HZ0, -1, cx, r[2], r[0], r[1], r[3], 'platform');
      }); }
    // platform face of the end block, its flank above the low building, and the outer end
    [43.6, 47.4, 51.2, 55.0].forEach(c => ROWS.forEach(r => wwin('z', NBZ, -1, sd * c, r[2], r[0], r[1], r[3], 'platform')));
    ROWS.slice(1).forEach(r => wwin('x', sd * NB, -sd, -0.5, r[2], r[0], r[1], r[3], 'platform'));
    [-1.2, 3.4, 8.0, 12.6, 17.2, 21.0].forEach(z => ROWS.forEach(r => wwin('x', sd * WR1, sd, z, r[2], r[0], r[1], r[3], 'built')));
  });
  /* ---------- the single-storey building along the house platform ---------- */
  k.box('concrete', AX0, AX1, 0, 0.9, AZ0, HZ0, 'platform');
  k.box(R, AX0, AX1, 0.9, 6.2, AZ0, HZ0, 'platform');
  k.box('roofZinc', AX0 - 0.15, AX1, 6.2, 6.45, AZ0 - 0.2, HZ0, 'platform');
  k.box('steel', AX0 - 0.2, AX1, 6.12, 6.5, AZ0 - 0.26, AZ0 - 0.2, 'platform');
  const AW = [35.9, 32.0, 28.1, 24.2, 20.3, 16.4, 12.6, 4.2, 1.4, -1.4, -4.2, -9.0, -12.8, -16.7, -20.6, -24.5, -28.4, -32.3, -36.2];
  AW.forEach(cx => { k.winZ(AZ0, -1, cx - 0.9, cx + 0.9, 1.7, 5.4, { mull: 0.9, trans: [2.9, 4.2], frame: 'whiteInt', glass: 'glassDark', tag: 'platform' }); surround('z', AZ0, -1, cx - 0.9, cx + 0.9, 1.7, 5.4, 0.24, 'platform'); });
  surround('z', AZ0, -1, 8.4, 10.4, 1.7, 5.4, 0.24, 'platform');   // framed blank panel
  /* ---------- platforms: the narrow house platform, then three long covered islands reached through a tunnel ---------- */
  const TX0 = -88, TX1 = 88;
  k.box('paving', L0, L1, 0, 0.9, -9, AZ0, 'platform');
  k.box('paving', L0, WL0, 0, 0.9, AZ0, HZ0, 'platform'); k.box('paving', WR1, L1, 0, 0.9, AZ0, HZ0, 'platform');
  k.box('concrete', L0 - 0.02, L1 + 0.02, 0.86, 0.92, -9.1, -8.85, 'platform');
  k.box('tileYellow', L0, L1, 0.902, 0.912, -8.3, -8.1, 'platform');
  [[-30, -18], [-52, -40], [-74, -62]].forEach(([z0, z1]) => {
    const zc = (z0 + z1) / 2;
    k.box('concrete', L0, L1, 0, 0.9, z0, z1, 'platform');
    k.box('tileYellow', L0, L1, 0.902, 0.912, z0 + 0.8, z0 + 1.0, 'platform'); k.box('tileYellow', L0, L1, 0.902, 0.912, z1 - 1.0, z1 - 0.8, 'platform');
    // canopy on a single row of columns, as seen from the road bridge
    for (let x = -66; x <= 66; x += 12) k.box('steelBlue', x - 0.15, x + 0.15, 0.9, 5.3, zc - 0.15, zc + 0.15, 'platform');
    k.box('canopyDark', -70, 70, 5.3, 5.5, zc - 0.25, zc + 0.25, 'platform');
    k.box('roofZinc', -70, 70, 5.5, 5.75, z0 + 1.0, z1 - 1.0, 'platform');
    // stairs down to the pedestrian tunnel, with a glass lift beside them
    k.box('dark', -4.5, 4.5, 0.9, 0.915, zc - 1.6, zc + 1.6, 'bridge');
    [-1, 1].forEach(s2 => k.box('glassDark', -4.5, 4.5, 0.92, 2.0, zc + s2 * 1.6 - 0.03, zc + s2 * 1.6 + 0.03, 'bridge'));
    k.box('glassDark', 4.5, 4.56, 0.92, 2.0, zc - 1.57, zc + 1.57, 'bridge');
    k.box('glassDark', 7.0, 9.0, 0.9, 4.5, zc - 1.0, zc + 1.0, 'bridge'); k.box('steel', 6.9, 9.1, 4.5, 4.7, zc - 1.1, zc + 1.1, 'bridge');
    [-40, 16, 45].forEach(dx => { k.box('dark', dx - 1.2, dx + 1.2, 3.8, 4.4, zc - 0.2, zc + 0.2, 'platform'); k.box('cgBlue', dx - 1.1, dx + 1.1, 3.9, 4.3, zc - 0.22, zc + 0.22, 'platform'); });
    // tall platform lamps on the open ends
    [-76, 76].forEach(x => { k.box('steel', x - 0.08, x + 0.08, 0.9, 6.4, zc - 0.08, zc + 0.08, 'platform'); k.box('steel', x - 0.5, x + 0.5, 6.4, 6.5, zc - 0.3, zc + 0.3, 'platform'); });
  });
  [-60, -40, -20, 0, 20, 40, 60].forEach(x => { if (x > AX0 && x < AX1) return; k.box('steel', x - 0.08, x + 0.08, 0.9, 6.4, -7.5, -7.34, 'platform'); k.box('steel', x - 0.5, x + 0.5, 6.4, 6.5, -7.72, -7.12, 'platform'); });
  k.part = '';   // tracks and catenary stand in every period
  // tracks: two between the house platform and the first island, two beside each island, freight tracks to the west
  const trackZ = [-10.8, -16.2, -31.8, -38.2, -53.8, -60.2, -75.8, -81.6, -86.4];
  trackZ.forEach(z => {
    k.box('ballast', TX0, TX1, 0, 0.35, z - 1.3, z + 1.3, 'electrified');
    for (let x = TX0 + 0.4; x < TX1; x += 0.65) k.fr('sleeper', x - 0.13, x + 0.13, 0.35, 0.48, z - 1.25, z + 1.25);
    [-0.72, 0.72].forEach(o => k.box('rail', TX0, TX1, 0.48, 0.62, z + o - 0.04, z + o + 0.04, 'electrified'));
  });
  // green lattice catenary masts between the tracks, each with cantilever arms out to the contact wires
  const MASTS = [[-13.5, [-10.8, -16.2]], [-35, [-31.8, -38.2]], [-57, [-53.8, -60.2]], [-78.7, [-75.8, -81.6, -86.4]]];
  [-75, -45, -15, 15, 45, 75].forEach(x => MASTS.forEach(([mz, ws]) => {
    k.box('mastGreen', x - 0.18, x + 0.18, 0, 8.4, mz - 0.18, mz + 0.18, 'platform');
    ws.forEach(wz => { rod3U(k, 'steel', [x, 7.4, mz], [x, 6.3, wz], 0.04, 'platform'); rod3U(k, 'steel', [x, 6.3, mz], [x, 6.3, wz], 0.035, 'platform'); });
  }));
  trackZ.forEach(wz => k.box('steel', TX0, TX1, 6.2, 6.25, wz - 0.02, wz + 0.02, 'platform'));
  k.part = 'station';
  // trains standing at the islands
  k.box('train', -60, 40, 0.62, 4.2, -16.2 - 1.3, -16.2 + 1.3, 'electrified');
  k.box('train', -30, 70, 0.62, 4.2, -53.8 - 1.3, -53.8 + 1.3, 'electrified');
  k.part = '';
  /* ---------- 1945 ruin ---------- */
  /* ---------- the first station building (1874–76), as photographed before 1945 ---------- */
  k.part = 'v:hist';
  const HB = 'brickBuff', RB = 'brick', ST = 'stoneLight';
  const archZ = (z, s, cx, w, y0, ys, fill, tag) => {
    const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, ys - y0); sh.absarc(0, ys - y0, w / 2, 0, Math.PI, false); sh.closePath();
    const g = new THREE.ShapeGeometry(sh, 16); if (s < 0) g.rotateY(Math.PI); g.translate(cx, y0, z + s * 0.03); k.geo(fill, g, tag);
    const r = new THREE.RingGeometry(w / 2, w / 2 + 0.38, 20, 1, 0, Math.PI); if (s < 0) r.rotateY(Math.PI); r.translate(cx, ys, z + s * 0.06); k.geo(ST, r, tag);
    const d = rng2(z, z + s * 0.08); k.box(ST, cx - w / 2 - 0.3, cx - w / 2, y0, ys, d[0], d[1], tag); k.box(ST, cx + w / 2, cx + w / 2 + 0.3, y0, ys, d[0], d[1], tag);
    if (fill === 'glassDark') { const f = rng2(z + s * 0.02, z + s * 0.09); k.fr('frame', cx - 0.03, cx + 0.03, y0, ys + w / 2 - 0.1, f[0], f[1], tag); [0.35, 0.7].forEach(t => k.fr('frame', cx - w / 2, cx + w / 2, y0 + (ys - y0) * t, y0 + (ys - y0) * t + 0.06, f[0], f[1], tag)); }
  };
  const roundel = (z, s, x, y, tag) => { const r = new THREE.RingGeometry(0.32, 0.55, 20); if (s < 0) r.rotateY(Math.PI); r.translate(x, y, z + s * 0.05); k.geo(ST, r, tag); const c = new THREE.CircleGeometry(0.32, 20); if (s < 0) c.rotateY(Math.PI); c.translate(x, y, z + s * 0.04); k.geo(RB, c, tag); };
  const balustrade = (x0, x1, z0, z1, y, tag) => {
    k.box(ST, x0, x1, y, y + 0.25, z0, z1, tag); k.box(ST, x0, x1, y + 1.0, y + 1.2, z0, z1, tag);
    const along = (x1 - x0) > (z1 - z0), len = along ? x1 - x0 : z1 - z0, n = Math.floor(len / 0.45);
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; if (along) { const x = x0 + t * len; k.fr(ST, x - 0.08, x + 0.08, y + 0.25, y + 1.0, z0 + 0.05, z1 - 0.05, tag); } else { const z = z0 + t * len; k.fr(ST, x0 + 0.05, x1 - 0.05, y + 0.25, y + 1.0, z - 0.08, z + 0.08, tag); } }
    const piers = Math.max(2, Math.round(len / 6)); for (let i = 0; i <= piers; i++) { const t = i / piers; const px = along ? x0 + t * len : (x0 + x1) / 2, pz = along ? (z0 + z1) / 2 : z0 + t * len; k.box(ST, px - 0.3, px + 0.3, y, y + 1.4, pz - 0.3, pz + 0.3, tag); const u = new THREE.SphereGeometry(0.28, 10, 8); u.scale(1, 1.3, 1); u.translate(px, y + 1.75, pz); k.geo(ST, u, tag); }
  };
  // raised central hall block with clerestory windows, heavy cornice and corner ornaments
  k.box(HB, -14, 14, 0, 19, 6, 24, 'built'); k.box(ST, -14.6, 14.6, 18.2, 19.4, 5.4, 24.6, 'built'); k.box(ST, -14.3, 14.3, 19.4, 20.0, 5.7, 24.3, 'built');
  k.box(RB, -14.02, 14.02, 16.6, 17.4, 5.98, 24.02, 'built');
  k.box('roof', -14, 14, 20.0, 20.3, 6, 24);
  [[-14, 5.4], [14, 5.4], [-14, 24.6], [14, 24.6]].forEach(c => { k.box(ST, c[0] - 0.5, c[0] + 0.5, 20, 21, c[1] - 0.5, c[1] + 0.5, 'built'); const o = new THREE.ConeGeometry(0.55, 1.4, 6); o.translate(c[0], 21.7, c[1]); k.geo(ST, o, 'built'); });
  [-8, -4, 0, 4, 8].forEach(x => { archZ(24, 1, x, 1.9, 12.6, 14.8, 'glassDark', 'built'); archZ(6, -1, x, 1.9, 12.6, 14.8, 'glassDark', 'built'); });
  [9, 15, 21].forEach(z => [-1, 1].forEach(sd => { const g = new THREE.CircleGeometry(0.7, 20); g.rotateY(sd * Math.PI / 2); g.translate(sd * 14.04, 15, z); k.geo('glassDark', g, 'built'); }));
  // clock aedicule on the roof
  k.box(ST, -2.2, 2.2, 20, 23.4, 22, 24.2, 'built'); { const t = new THREE.CylinderGeometry(2.2, 2.2, 2.2, 20, 1, false, -Math.PI / 2, Math.PI); t.rotateX(Math.PI / 2); t.translate(0, 23.4, 23.1); k.geo(ST, t, 'built'); }
  [-1.8, 1.8].forEach(x => { k.box(ST, x - 0.35, x + 0.35, 20, 24.6, 23.9, 24.5, 'built'); });
  // lower entrance range with six arches, roundels and a balustrade with urns
  k.box(HB, -21, 21, 0, 10.2, 22, 30, 'built'); k.box(RB, -21, 21, 0, 1.2, 22, 30.05, 'built');
  k.box(ST, -21.4, 21.4, 9.6, 10.4, 21.6, 30.4, 'built'); k.box(RB, -21.02, 21.02, 8.9, 9.6, 21.98, 30.02, 'built');
  balustrade(-21, 21, 29.6, 30.2, 10.4, 'built'); balustrade(-21, -20.4, 22, 30, 10.4, 'built'); balustrade(20.4, 21, 22, 30, 10.4, 'built');
  k.box('roof', -21, 21, 10.2, 10.35, 22, 29.6);
  const AX = [-15, -9, -3, 3, 9, 15];
  AX.forEach((x, i) => { const door = i > 0 && i < 5; archZ(30, 1, x, door ? 3.6 : 3.2, door ? 1.2 : 2.2, 6.6, door ? 'dark' : 'glassDark', 'built'); if (door) k.box('wood', x - 1.2, x + 1.2, 1.2, 4.0, 30.02, 30.06, 'built'); });
  [-12, -6, 0, 6, 12].forEach(x => roundel(30, 1, x, 8.2, 'built'));
  k.box(ST, -12, 12, 0, 0.4, 30, 32.4, 'built'); k.box(ST, -12, 12, 0, 0.8, 30, 31.6, 'built'); k.box(ST, -12, 12, 0, 1.2, 30, 30.8, 'built');
  // long side wings in red brick with tall round-arched windows and a frieze
  [[-60, -21], [21, 62]].forEach(([xa, xb]) => {
    k.box(RB, xa, xb, 0, 9.4, 10, 26, 'built'); k.box(ST, xa - 0.4, xb + 0.4, 8.8, 9.7, 9.6, 26.4, 'built'); k.box(HB, xa - 0.02, xb + 0.02, 7.9, 8.8, 9.98, 26.02, 'built');
    k.geo('slate', prism(xa - 0.4, xb + 0.4, 9.6, 26.4, 9.7, 12.2, 8.4, 8.4), 'built');
    for (let x = xa + 3; x < xb - 2; x += 4.6) { archZ(26, 1, x, 2.4, 1.8, 6.2, 'glassDark', 'built'); archZ(10, -1, x, 2.4, 1.8, 6.2, 'glassDark', 'built'); if (Math.abs(x - (xa + xb) / 2) > 2) roundel(26, 1, x + 2.3, 7.3, 'built'); }
  });
  // low glazed waiting hall at the front right, as in the 1930s photograph
  k.box('wood', 26, 46, 0, 1.2, 30, 37, 'built'); k.box('cream', 26, 46, 1.2, 3.6, 30, 37, 'built'); k.box('wood', 26, 46, 3.6, 4.1, 30, 37, 'built');
  for (let x = 27; x < 45; x += 2.2) k.winZ(37, 1, x, x + 1.8, 1.6, 3.4, { frame: 'wood', glass: 'glassDark', tag: 'built' });
  k.geo('slate', prism(25.6, 46.4, 29.6, 37.4, 4.1, 5.6, 2.8, 2.8), 'built');
  // a tram and a 1930s motor bus of the Dessau tramway
  k.box('ochre', -36, -24, 0.4, 3.3, 34.2, 36.4); k.box('dark', -35.6, -24.4, 1.7, 2.7, 34.18, 36.42); k.box('ochre', -35.4, -24.6, 3.3, 3.8, 34.6, 36);
  k.box('frame', -33, -27, 3.8, 4.4, 35.2, 35.4);
  k.box('bauRed', 8, 18, 0.5, 3.0, 40.2, 42.6); k.box('dark', 8.6, 17.6, 1.7, 2.6, 40.18, 42.62); { const rf = new THREE.CylinderGeometry(1.2, 1.2, 10, 12, 1, false, 0, Math.PI); rf.rotateZ(Math.PI / 2); rf.scale(1, 0.4, 1); rf.translate(13, 3.0, 41.4); k.geo('bauRed', rf); }
  k.part = '';

  /* ---------- 1945: ruins on the same footprint ---------- */
  k.part = 'v:ruin';
  [[-50, -36, 18.4, 19], [-30, -18, 18.4, 19], [-15, -6, 24.4, 25], [5, 15, 24.4, 25], [22, 36, 18.4, 19], [44, 64, 18.4, 19], [-36, 0, 1, 1.6], [20, 40, 1, 1.6]].forEach(q => k.box('soot', q[0], q[1], 0, 2 + rand() * 5, q[2], q[3], 'raid'));
  [[-50, -49.4, 3, 19], [63.4, 64, 1, 19], [-15, -14.4, 7, 25], [14.4, 15, 7, 25]].forEach(q => k.box('soot', q[0], q[1], 0, 4 + rand() * 9, q[2], q[3], 'raid'));
  for (let i = 0; i < 30; i++) { const x = -48 + rand() * 110, z = 3 + rand() * 15; k.box('soot', x, x + 1 + rand() * 2.5, 0, 0.4 + rand() * 1.4, z, z + 1 + rand() * 2, 'raid'); }
  k.part = '';
  // forecourt, laid out from the aerial view: paved square, the tram curve in grass, the tram and bus stop to the north-east, a wooded park beyond
  const P = { x0: -90, x1: 90, z0: -90, z1: 122 };
  k.box('lawn', P.x0, P.x1, -0.12, 0, P.z0, P.z1);
  k.part = 'modernCourt';
  k.box('paving', -62, 40, 0, 0.04, WZL, 38);
  k.box('paving', 18, 40, 0, 0.04, 38, 120);
  k.box('asphalt', 40, 90, 0, 0.03, 30, 122);
  { const isl = new THREE.CylinderGeometry(1, 1, 0.06, 40); isl.scale(10, 1, 26); isl.translate(66, 0.06, 90); k.geo('greenRoof', isl); }
  // tram: double track coming in from the stop, swinging round in front of the station and away to the south-east
  const TRAM = [[24, 120], [24, 64], [21, 52], [13, 45], [0, 42], [-14, 42], [-28, 44], [-42, 50], [-53, 59], [-60, 72], [-64, 88], [-66, 104], [-67, 120]];
  const offs = (pts, d) => pts.map((q, i) => { const a2 = pts[Math.max(0, i - 1)], b2 = pts[Math.min(pts.length - 1, i + 1)], dx = b2[0] - a2[0], dz = b2[1] - a2[1], L = Math.hypot(dx, dz) || 1; return [q[0] - dz / L * d, q[1] + dx / L * d]; });
  [-1.6, 1.6].forEach(t => [-0.72, 0.72].forEach(r2 => tubeU(k, 'rail', offs(TRAM, t + r2).map(q => [q[0], 0.07, q[1]]), 0.05, 'gateway')));
  TRAM.forEach((q, i) => { if (i % 2) return; const nx = offs([TRAM[Math.max(0, i - 1)], q, TRAM[Math.min(TRAM.length - 1, i + 1)]], 4.2)[1];
    const pole = new THREE.CylinderGeometry(0.15, 0.19, 7, 10); pole.translate(nx[0], 3.5, nx[1]); k.geo('iron', pole, 'gateway'); });
  // tram and bus stop: a long glazed shelter
  k.box('glassDark', 27, 33, 3.3, 3.42, 64, 116, 'gateway');
  for (let z = 66; z <= 114; z += 8) [27.4, 32.6].forEach(x => k.box('steel', x - 0.08, x + 0.08, 0, 3.3, z - 0.08, z + 0.08, 'gateway'));
  // round kiosk with a green copper roof
  { const KX = 36, KZ = 46; const base = new THREE.CylinderGeometry(2.6, 2.6, 2.9, 8); base.translate(KX, 1.45, KZ); k.geo('glassDark', base, 'gateway');
    const plinthK = new THREE.CylinderGeometry(2.75, 2.75, 0.3, 8); plinthK.translate(KX, 0.15, KZ); k.geo('concrete', plinthK, 'gateway');
    const eave = new THREE.CylinderGeometry(3.3, 3.3, 0.25, 8); eave.translate(KX, 3.03, KZ); k.geo('copper', eave, 'gateway');
    const cone = new THREE.ConeGeometry(3.3, 1.5, 8); cone.translate(KX, 3.9, KZ); k.geo('copper', cone, 'gateway'); }
  // steel bike shelters in front of the south wing
  k.box('canopyDark', -40, -22, 2.9, 3.05, 30, 35, 'gateway');
  [-39.6, -31, -22.4].forEach(x => [30.4, 34.6].forEach(z => k.box('steel', x - 0.1, x + 0.1, 0, 2.9, z - 0.1, z + 0.1, 'gateway')));
  for (let x = -39; x < -23; x += 1.1) k.box('steel', x - 0.02, x + 0.02, 0.04, 0.85, 31.8, 33.2);
  // the park: a ring path under tall trees
  { const ring = new THREE.RingGeometry(30, 31.6, 64); ring.rotateX(-Math.PI / 2); ring.translate(-17, 0.03, 88); k.geo('paving', ring); }
  k.part = '';
  const PK = [[-17, 88], [-4, 78], [-28, 76], [-8, 100], [-30, 100], [-19, 64], [3, 94], [-40, 88], [-12, 112], [5, 73], [-36, 66], [-26, 112], [12, 104]];
  PK.forEach((q, i) => tree(k, q[0], q[1], 1.2 + (i % 3) * 0.2));
  tree(k, -52, 32, 1.6);   // the old oak at the south corner of the forecourt
  [[56, 64], [52, 112], [80, 52], [80, 118]].forEach(q => tree(k, q[0], q[1], 1.1));
  [[-35, 36], [35, 36], [-55, 36], [10, 36]].forEach(q => lamp(k, q[0], q[1]));
  for (let i = 0; i < 22; i++) person(k, -30 + rand() * 60, 28 + rand() * 8, rand() * 6.28);
  for (let i = 0; i < 8; i++) person(k, 28 + rand() * 4, 70 + rand() * 40, rand() * 6.28);

  const grp = k.build();
  const cc = document.createElement('canvas'); cc.width = cc.height = 256; const ct = new THREE.CanvasTexture(cc); ct.colorSpace = THREE.SRGBColorSpace;
  HBF_CLOCK = { canvas: cc, tex: ct };
  const face = new THREE.Mesh(new THREE.CircleGeometry(1.2, 48), new THREE.MeshStandardMaterial({ map: ct, roughness: 0.5 })); face.position.set(0, 12.9, HZ1 + 0.06); face.userData.fact = 'raid'; face.userData.part = 'station'; grp.add(face);
  const rim = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.36, 48), MAT.cream); rim.position.set(0, 12.9, HZ1 + 0.07); rim.userData.part = 'station'; grp.add(rim);
  const sg = document.createElement('canvas'); sg.width = 256; sg.height = 180; const sx = sg.getContext('2d');
  sx.fillStyle = '#ec0016'; sx.fillRect(0, 0, 256, 180); sx.fillStyle = '#ffffff'; sx.fillRect(18, 18, 220, 144); sx.fillStyle = '#ec0016'; sx.font = 'bold 118px Arial, Helvetica, sans-serif'; sx.textAlign = 'center'; sx.textBaseline = 'middle'; sx.fillText('DB', 128, 96);
  const st2 = new THREE.CanvasTexture(sg); st2.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.62), new THREE.MeshStandardMaterial({ map: st2, roughness: 0.4 })); sign.position.set(-12.9, 11.6, HZ1 + 0.06); sign.userData.part = 'station'; grp.add(sign);
  drawClock(timeNow);
  const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp);
  plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  const inHall = (x, z) => Math.abs(x) < IX && z > IZ0 && z < IZ1;
  const extra = {
    eras: [
      { year: 'before 1945', title: 'The first station', note: 'The brick station of 1874 to 1876, with its arched entrances, balustrades and a clock on the roof, as photographed before the war.', hide: ['station', 'modernCourt'], show: ['v:hist'] },
      { year: '1945', title: 'Destroyed', note: 'The station building was destroyed in the air raid of 7 March 1945.', hide: ['station', 'modernCourt'], show: ['v:ruin'] },
      { year: '1952', title: 'Rebuilt', note: 'Rebuilt by 1952, retaining only parts of the earlier fabric, in a restrained post-war form.' },
      { year: 'today', title: 'Rebuilt', note: 'Rebuilt between 2008 and 2011 with a new signal box and today’s colour scheme; the platforms are reached through a pedestrian tunnel.' }
    ],
    views: [
      { label: 'The entrance front', cam: [0, 4.5, 62], tgt: [0, 11, HZ1] },
      { label: 'Inside the hall', cam: [0, 2.2, 12], tgt: [0, 5, 20] },
      { label: 'The platforms', cam: [-45, 3.4, -24], tgt: [0, 2.6, -24] },
      { label: 'From above the tracks', cam: [-30, 34, -70], tgt: [0, 4, -10] }
    ],
    groundAt: (x, z) => inHall(x, z) ? 0.9 : 0,
    ceilingAt: (x, z) => inHall(x, z) ? 15.0 : Infinity,
    hiddenFacts: [
      { id: 'tile', title: 'Yellow tiles on the portal', year: '1952', pos: [-6.5, 4.2, HZ1 - 0.6], cam: [-8, 2.6, 33], tgt: [-6.5, 3.8, HZ1 - 2], hint: 'Look between the entrance doors.',
        text: 'The recesses between the main entrance doors are lined with yellow glazed ceramic tiles, a warm decorative touch on the otherwise restrained post-war facade.',
        src: ['Photographs of the entrance portal', ''] }
    ]
  };
  return {
    ...extra, scene, center: new THREE.Vector3(0, 0, 0), span: 150, sunDist: 280, lamps: [[-35, 36], [35, 36], [-55, 36], [10, 36]].map(q => new THREE.Vector3(q[0], 4.85, q[1])),
    intro: { pos: [-95, 55, 135], tgt: [0, 6, 5] },
    facts: [
      { id: 'built', title: 'On the line since 1840', year: '1840', pos: [-31, 12, WZL + 0.8], cam: [-62, 12, 72], tgt: [-20, 8, 20],
        text: 'Dessau got its first railway connection on 1 September 1840 on the Berlin-Anhalt line. The present station building was completed by 1952, replacing the historic station that was destroyed in the Second World War.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Dessau_Hauptbahnhof'] },
      { id: 'hall', title: 'The post-war ticket hall', year: '1952', pos: [0, 13.8, 16], cam: [0, 2.2, 12], tgt: [0, 8, 19],
        text: 'The high, light-filled booking hall is a prime example of early GDR post-war modernism, with simple classical proportions, round ceiling lights and tall windows on both sides.',
        src: ['Denkmalpflege Sachsen-Anhalt', ''] },
      { id: 'raid', title: 'Bombed in March 1945', year: '1945', pos: [0, 14.9, HZ1 + 0.8], cam: [0, 4.5, 62], tgt: [0, 12, HZ1],
        text: 'The air raid of 7 March 1945 destroyed much of the station along with the city centre. A temporary service kept trains running until the new building went up between 1948 and 1952.',
        src: ['Stadtarchiv Dessau-Roßlau', ''] },
      { id: 'shelter', title: 'Air-raid shelter inside', year: '1940–45', pos: [HX + 8, 3.5, 16], cam: [42, 4, 38], tgt: [25, 3, 18],
        text: 'Deep in the cellars of the station wings, air-raid shelters protected travellers and railway workers during the bombing.',
        src: ['Stadtarchiv Dessau-Roßlau', ''] },
      { id: 'bridge', title: 'Down to the platforms', year: '2008–11', pos: [0, 2.6, -24], cam: [-16, 4.2, -8], tgt: [0, 1.4, -24],
        text: 'The platforms are reached through a pedestrian tunnel under the tracks. Between 2008 and 2011 the station was rebuilt, apart from parts of the platforms, with a new electronic signal box and its present colour.',
        src: ['Station visit report, ice-treff.de (2014)', 'https://www.ice-treff.de/index.php?id=273828'] },
      { id: 'electrified', title: 'Early electric traction', year: '1911–1923', pos: [-12, 2.2, -24], cam: [-45, 3.4, -24], tgt: [0, 2.6, -24],
        text: 'The railway line from Dessau to Bitterfeld was electrified as early as 1911, making it one of the earliest electrified main lines in Germany. Electric operations resumed after the First World War in 1922–23.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Bahnstrecke_Dessau%E2%80%93Bitterfeld'] },
      { id: 'tunnel', title: 'Through lines and connections', year: 'today', pos: [55, 2.2, -24], cam: [78, 8, 6], tgt: [40, 2, -16],
        text: 'Dessau Hauptbahnhof connects passenger and freight services towards Magdeburg, Berlin, Leipzig and Halle. It is served by Regional-Express lines and the S-Bahn Mitteldeutschland.',
        src: ['Wikipedia (en) and the aerial photograph', 'https://en.wikipedia.org/wiki/Dessau_Hauptbahnhof'] }
    ]
  };
}
