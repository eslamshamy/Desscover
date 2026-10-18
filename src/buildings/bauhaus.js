/* ---------- 1. Bauhaus building ---------- */

export function buildBauhaus(context) {
  const { Kit, THREE, glass, lamp, letterTexture, person, plinth, rails, rand, registerNoAO, rng2, tree } = context;

  const k = new Kit(), O = new THREE.Vector3(-22, 0, -4);
  // plan from the aerial view: workshop wing; a junction block on its north side carrying the bridge west over the street
  // to the vocational school; the low festive wing running north from the junction to the studio building
  const JX1 = 32.5, JZ1 = 18.5, BZ0 = -26, SCX0 = -9.7, SCZ0 = -45;
  // workshop wing x 0..18, z 0..46
  k.box('grey', 0.45, 17.55, 0, 1.9, 0.45, 45.55, 'survey');
  for (let z = 2.0; z + 3.0 <= 44.6; z += 4.6) { k.winX(0.45, -1, z, z + 3.0, 0.3, 1.7, { mull: 0.75, trans: [1.0] }); if (z > JZ1) k.winX(17.55, 1, z, z + 3.0, 0.3, 1.7, { mull: 0.75, trans: [1.0] }); }
  k.box('white', 0, 18, 1.9, 3.0, 0, 46, 'curtain'); k.box('white', 0, 18, 12.7, 14.2, 0, 46, 'curtain');
  k.roofRing('white', 0, 18, 0, 46, 14.2, 0.4);
  // workshop wing roof skylight monitors and vents
  for (let rz = 6; rz < 42; rz += 8) {
    k.box('white', 5.5, 12.5, 14.2, 15.0, rz, rz + 3.6, 'curtain');
    k.box('glassDark', 5.8, 12.2, 15.0, 15.08, rz + 0.2, rz + 3.4, 'curtain');
  }
  const curtain = (axis, c, o, a0, a1) => {
    const y0 = 3.0, y1 = 12.7, f = rng2(c + o * 0.005, c + o * 0.1);
    if (axis === 'x') k.paneX('glass', c + o * 0.035, y0, y1, a0, a1, 'curtain'); else k.paneZ('glass', c + o * 0.035, y0, y1, a0, a1, 'curtain');
    const fh = rng2(c + o * 0.01, c + o * 0.095);
    const put = (aa, ab, ya, yb, h) => { const d = h ? fh : f; return axis === 'x' ? k.fr('frame', d[0], d[1], ya, yb, aa, ab, 'curtain') : k.fr('frame', aa, ab, ya, yb, d[0], d[1], 'curtain'); };
    const len = a1 - a0, n = Math.round(len / 2.3), st = len / n;
    for (let i = 0; i <= n; i++) { const a = a0 + i * st; put(a - 0.04, a + 0.04, y0, y1); if (i < n) { const b = a + st / 2; put(b - 0.018, b + 0.018, y0, y1); } }
    [[3.0, 6.15], [6.15, 10.25], [10.25, 12.7]].forEach(fl => { put(a0, a1, fl[0] - 0.05, fl[0] + 0.05, true); const nn = Math.max(1, Math.round((fl[1] - fl[0]) / 0.82)); for (let j = 1; j < nn; j++) { const yy = fl[0] + (fl[1] - fl[0]) * j / nn; put(a0, a1, yy - 0.018, yy + 0.018, true); } });
    put(a0, a1, y1 - 0.06, y1, true);
  };
  k.part = 'curtain'; curtain('x', 0, -1, 0, 46); curtain('x', 18, 1, JZ1, 46); curtain('z', 0, -1, 0, 18); curtain('z', 46, 1, 0, 18); k.part = '';
  k.part = 'v:punched';
  const punched = (axis, c, o, a0, a1) => {
    const r = rng2(c + o * 0.06, c - o * 0.24), rows = [[3.1, 5.2], [7.2, 9.3], [10.95, 12.3]], wins = [];
    for (let a = a0 + 2.3; a < a1 - 1; a += 4.6) wins.push(a);
    const wb = (p0, p1, y0, y1) => axis === 'x' ? k.box('white', r[0], r[1], y0, y1, p0, p1) : k.box('white', p0, p1, y0, y1, r[0], r[1]);
    let yp = 2.25;
    rows.forEach(rw => {
      wb(a0, a1, yp, rw[0]); let pp = a0; wins.forEach(w => { wb(pp, w - 1, rw[0], rw[1]); pp = w + 1; }); wb(pp, a1, rw[0], rw[1]);
      wins.forEach(w => { const o2 = { back: false, mull: 1.0, trans: [rw[0] + (rw[1] - rw[0]) * 0.62] }; if (axis === 'x') k.winX(c + o * 0.06, o, w - 1, w + 1, rw[0], rw[1], o2); else k.winZ(c + o * 0.06, o, w - 1, w + 1, rw[0], rw[1], o2); });
      yp = rw[1];
    });
    wb(a0, a1, yp, 12.7);
  };
  punched('x', 0, -1, 0, 46); punched('x', 18, 1, JZ1, 46); punched('z', 0, -1, 0, 18); punched('z', 46, 1, 0, 18);
  k.part = '';
  k.box('ceilO', 0.2, 17.8, 6.0, 6.3, 0.2, 45.8, 'colour'); k.box('ceilY', 0.2, 17.8, 10.1, 10.4, 0.2, 45.8, 'colour'); k.box('ceilB', 0.2, 17.8, 12.58, 12.7, 0.2, 45.8, 'colour');
  const FL = [[2.25, 6.0], [6.3, 10.1], [10.4, 12.58]];
  [4.5, 13.5].forEach(cx => { for (let i = 0; i < 10; i++) { const cz = 2.3 + 4.6 * i; FL.forEach(fl => {
    const sh = new THREE.CylinderGeometry(0.25, 0.25, fl[1] - 0.5 - fl[0], 12); sh.translate(cx, (fl[0] + fl[1] - 0.5) / 2, cz); k.geo('whiteInt', sh, 'colour');
    const cap = new THREE.CylinderGeometry(0.85, 0.25, 0.5, 16); cap.translate(cx, fl[1] - 0.25, cz); k.geo('whiteInt', cap, 'colour');
  }); } });
  FL.forEach(fl => {
    const y0 = fl[0], y1 = fl[0] + 0.9;
    k.box('dark', 0.3, 0.55, y0, y1, 0.6, 45.4); k.box('dark', 17.45, 17.7, y0, y1, 0.6, 45.4); k.box('dark', 0.6, 17.4, y0, y1, 0.3, 0.55); k.box('dark', 0.6, 17.4, y0, y1, 45.45, 45.7);
    for (let i = 0; i < 11; i++) { const x = 2 + rand() * 12, z = 2 + rand() * 40; if (rand() < 0.5) k.box('wood', x, x + 1.0, y0, y0 + 0.85, z, z + 2.4); else k.box('wood', x, x + 2.4, y0, y0 + 0.85, z, z + 1.0); }
  });
  // stair tower, canopy, door, lettering rods
  k.box('grey', 0.45, 7.6, 0, 16.0, 45.6, 50, 'tower'); k.roofRing('grey', 0.45, 7.6, 45.6, 50, 16.0, 0.3);
  [[0.6, 2.05, 'bauRed'], [5.2, 6.7, 'bauRed'], [8.5, 10.0, 'frame'], [11.8, 13.3, 'frame']].forEach(w => {
    k.winZ(50, 1, 4.1, 6.9, w[0], w[1], { mull: 0.47, trans: [w[0] + 0.5, w[0] + 1.0], frame: w[2], glass: 'glassDark', tag: 'tower' });
    k.box('grey', 4.0, 7.0, w[0] - 0.12, w[0] - 0.02, 50, 50.12, 'tower');
  });
  // red entrance door with transom and steps
  k.box('bauRed', 0.36, 0.46, 0.5, 2.85, 48.0, 49.2, 'tower'); k.box('frame', 0.34, 0.46, 2.85, 2.95, 47.9, 49.3, 'tower');
  k.box('glassDark', 0.35, 0.47, 2.4, 2.85, 48.1, 49.1, 'tower');
  k.box('paving', -0.3, 0.45, 0, 0.45, 47.5, 49.7); k.box('paving', -0.95, -0.3, 0, 0.3, 47.5, 49.7); k.box('paving', -1.6, -0.95, 0, 0.15, 47.5, 49.7);
  k.box('canopyDark', -2.0, 0.45, 3.0, 3.22, 47.2, 51.2, 'tower'); k.box('canopyDark', 0.45, 3.2, 3.0, 3.22, 50.0, 51.2, 'tower');
  // bicycle stands near the entrance
  for (let i = 0; i < 7; i++) {
    const bz = 46.2 + i * 0.75;
    rails(k, 'steel', [[-4.2, bz], [-3.1, bz]], 0, [0.45, 0.88], 'tower');
  }
  k.box('dark', 7.7, 12.5, 0.06, 0.075, 50.0, 51.4); rails(k, 'frame', [[7.7, 51.45], [12.5, 51.45], [12.5, 50.0]], 0, [0.55, 1.0], 'tower');
  for (let i = 0; i < 7; i++) { const yc = 13.0 - 1.38 * i; k.box('whiteInt', 1.73, 1.77, yc + 0.3, yc + 0.34, 50.0, 50.3); k.box('whiteInt', 1.73, 1.77, yc - 0.34, yc - 0.3, 50.0, 50.3); }
  // junction block on the workshop wing's north side, where the bridge and the festive wing meet
  k.box('grey', 18, JX1 - 0.35, 0, 1.9, 0.35, JZ1 - 0.35, 'bridge'); k.box('white', 18, JX1, 1.9, 14.2, 0, JZ1, 'bridge'); k.roofRing('white', 18, JX1, 0, JZ1, 14.2, 0.4);
  [[6.6, 8.9], [10.7, 13.0]].forEach((b, bi) => {
    k.winZ(JZ1, 1, 19.0, JX1 - 1.0, b[0], b[1], { mull: 1.05, tag: 'bridge' });
    k.winX(JX1, 1, bi ? 0.8 : 13.3, JZ1 - 0.8, b[0], b[1], { mull: 1.05, tag: 'bridge' });
  });
  k.winZ(JZ1, 1, 19.0, JX1 - 1.0, 2.2, 4.4, { mull: 1.15, trans: [2.85], tag: 'bridge' });
  k.winZ(0, -1, 22.6, JX1 - 1.0, 2.6, 4.6, { mull: 1.15, trans: [3.25], tag: 'bridge' });
  // workshop entrance facing the lane: red door, flat canopy, steps
  k.box('bauRed', 19.1, 20.5, 1.0, 3.3, -0.1, 0, 'bridge'); k.box('frame', 18.95, 20.65, 3.3, 3.42, -0.12, 0, 'bridge');
  k.box('glassDark', 20.7, 21.9, 1.0, 3.3, -0.06, 0, 'bridge');
  k.box('canopyDark', 18.4, 22.6, 3.6, 3.78, -2.4, 0, 'bridge');
  for (let i = 0; i < 4; i++) k.box('concrete', 18.6 - i * 0.15, 22.4 + i * 0.15, 1.0 - (i + 1) * 0.25, 1.0 - i * 0.25, -0.9 - i * 0.35, 0, 'bridge');
  // the bridge over the street, two storeys of ribbon windows on four slender piers
  k.box('white', 18, JX1, 5.5, 14.2, BZ0, 0, 'bridge'); k.roofRing('white', 18, JX1, BZ0, 0, 14.2, 0.4);
  [18.55, JX1 - 0.55].forEach(x => [-4.5, -21.0].forEach(z => k.box('white', x - 0.3, x + 0.3, 0, 4.8, z - 0.3, z + 0.3, 'bridge')));
  [-4.5, -21.0].forEach(z => k.box('white', 18.25, JX1 - 0.25, 4.8, 5.5, z - 0.4, z + 0.4, 'bridge'));   // downstand beams carrying the bridge
  [[6.6, 8.9], [10.7, 13.0]].forEach(b => { k.winX(18, -1, BZ0 + 0.8, -0.8, b[0], b[1], { mull: 1.05, tag: 'bridge' }); k.winX(JX1, 1, BZ0 + 0.8, -0.8, b[0], b[1], { mull: 1.05, tag: 'bridge' }); });
  // vocational school: a long three-storey block west of the street, glass skylights on the roof
  const WX0 = SCX0, WX1 = JX1, WZ0 = SCZ0, WZ1 = BZ0;
  k.box('grey', WX0 + 0.35, WX1 - 0.35, 0, 2.0, WZ0 + 0.35, WZ1 - 0.35, 'school'); k.box('white', WX0, WX1, 2.0, 13.55, WZ0, WZ1, 'school'); k.roofRing('white', WX0, WX1, WZ0, WZ1, 13.55, 0.4);
  for (let x = WX0 + 1.2; x + 3.4 <= WX1 - 1; x += 4.6) { k.winZ(WZ0 + 0.35, -1, x, x + 3.4, 0.35, 1.75, { mull: 0.85, trans: [1.05] }); if (x + 3.4 < 13.6) k.winZ(WZ1 - 0.35, 1, x, x + 3.4, 0.35, 1.75, { mull: 0.85, trans: [1.05] }); }
  [[2.8, 4.9], [6.2, 8.3], [9.6, 11.7]].forEach((b, bi) => {
    k.winZ(WZ0, -1, WX0 + 1.0, WX1 - 1.0, b[0], b[1], { mull: 1.15, trans: [b[0] + 0.65], protrude: 0.15, tag: 'school' });
    k.winZ(WZ1, 1, WX0 + 1.0, 13.4, b[0], b[1], { mull: 1.15, trans: [b[0] + 0.65], protrude: 0.15, tag: 'school' });
    k.winX(WX0, -1, WZ1 - 12.6, WZ1 - 1.6, b[0], b[1], { mull: 1.1, trans: [b[0] + 0.65], protrude: 0.15, tag: 'school' });   // street end: one band on the lane side
    k.winX(WX1, 1, WZ0 + 1.5, WZ1 - 1.5, b[0], b[1], { mull: 1.15, trans: [b[0] + 0.65], protrude: 0.15, tag: 'school' });
  });
  // glazed stair tower on the lane side next to the bridge, with the school entrance at its foot
  k.box('glassDark', 14.0, 17.6, 3.6, 13.2, WZ1, WZ1 + 0.06, 'school');
  for (let y = 3.6; y <= 13.2; y += 0.8) k.box('frame', 14.0, 17.6, y - 0.03, y + 0.03, WZ1 + 0.06, WZ1 + 0.12, 'school');
  [14.0, 14.9, 15.8, 16.7, 17.6].forEach(x => k.box('frame', x - 0.04, x + 0.04, 3.6, 13.2, WZ1 + 0.06, WZ1 + 0.14, 'school'));
  k.box('bauRed', 15.1, 16.5, 1.0, 3.2, WZ1, WZ1 + 0.1, 'school'); k.box('frame', 14.95, 16.65, 3.2, 3.32, WZ1, WZ1 + 0.12, 'school');
  k.box('canopyDark', 13.6, 18, 3.4, 3.58, WZ1, WZ1 + 2.2, 'school');
  for (let i = 0; i < 4; i++) k.box('concrete', 14.2 - i * 0.15, 17.4 + i * 0.15, 1.0 - (i + 1) * 0.25, 1.0 - i * 0.25, WZ1, WZ1 + 0.9 + i * 0.35, 'school');
  for (let gx = 0.5; gx < 26; gx += 2.6) for (let gz = WZ0 + 4.5; gz < WZ1 - 4; gz += 2.6) k.box('glassDark', gx, gx + 1.8, 13.55, 13.7, gz, gz + 1.8, 'school');
  // festive wing (auditorium, stage, canteen): single storey from the junction north to the studio building
  const FX0 = JX1, FX1 = 49.5, FZ0 = 1.0, FZ1 = 12.5;
  k.box('grey', FX0, FX1 - 0.3, 0, 1.6, FZ0 + 0.35, FZ1 - 0.35, 'festive'); k.box('white', FX0, FX1, 1.6, 8.55, FZ0, FZ1, 'festive'); k.roofRing('white', FX0, FX1, FZ0, FZ1, 8.55, 0.4);
  k.box('glassDark', 38.5, 44.5, 8.55, 8.7, 4.2, 9.3, 'festive');   // roof light over the hall
  for (let x = FX0 + 1.5; x + 3.0 <= FX1 - 1; x += 4.6) { k.winZ(FZ0 + 0.35, -1, x, x + 3.0, 0.42, 1.3, { mull: 1.0 }); k.winZ(FZ1 - 0.35, 1, x, x + 3.0, 0.42, 1.3, { mull: 1.0 }); }
  k.winZ(FZ0, -1, FX0 + 1.0, FX1 - 1.0, 2.2, 7.8, { mull: 1.1, trans: [3.8, 5.8], frame: 'frame', glass: 'glass', tag: 'festive' });
  k.winZ(FZ1, 1, FX0 + 1.0, FX1 - 1.0, 2.2, 7.8, { mull: 1.1, trans: [3.8, 5.8], frame: 'frame', glass: 'glass', tag: 'festive' });
  // low annex at the far end of the workshop wing
  k.box('white', 12.8, 17.9, 0, 4.2, 46, 61.5, 'tower'); k.roofRing('white', 12.8, 17.9, 46, 61.5, 4.2, 0.3);
  [[13.8, 52], [13.8, 56]].forEach(q => k.box('glassDark', q[0] + 0.4, q[0] + 2.0, 4.2, 4.32, q[1], q[1] + 1.6, 'tower'));
  k.winX(17.9, 1, 51, 60.5, 1.2, 3.4, { mull: 1.2, tag: 'tower' }); k.winZ(61.5, 1, 13.6, 17.2, 1.2, 3.4, { mull: 1.2, tag: 'tower' });
  // studio building (Prellerhaus): five storeys, 28 studio apartments
  const SX0 = 49.5, SX1 = 61.77, SZ0 = -1.0, SZ1 = 17.14, SF = [0, 1, 2, 3, 4].map(i => 1.8 + 3.36 * i);
  k.box('grey', SX0 + 0.3, SX1 - 0.3, 0, 1.8, SZ0 + 0.3, SZ1 - 0.3, 'studio'); k.box('white', SX0, SX1, 1.8, 19.1, SZ0, SZ1, 'studio'); k.roofRing('white', SX0, SX1, SZ0, SZ1, 19.1, 0.4);
  // Prellerhaus rooftop elevator/tank penthouse & chimney
  k.box('white', 53.2, 59.2, 19.1, 21.6, SZ0 + 1.2, SZ0 + 5.8, 'studio');
  k.roofRing('white', 53.2, 59.2, SZ0 + 1.2, SZ0 + 5.8, 21.6, 0.3);
  k.box('steel', 57.5, 58.1, 21.6, 23.2, SZ0 + 2.4, SZ0 + 3.0, 'studio');
  for (let a = 0; a < 4; a++) {
    const zs = SZ0 + 4.535 * a, zd0 = zs + 0.3, zd1 = zs + 1.45, zw0 = zs + 1.65, zw1 = zs + 4.535 - 0.35;
    k.winX(SX1 - 0.3, 1, zw0 + 0.2, zw1, 0.5, 1.4, { mull: 1.2 });
    SF.forEach((y, i) => {
      k.winX(SX1, 1, zw0, zw1, y + 0.95, y + 2.55, { mull: 0.95, trans: [y + 1.75], tag: 'studio' });
      if (i === 0) { k.winX(SX1, 1, zd0, zd1, y + 0.95, y + 2.55, { trans: [y + 1.75], tag: 'studio' }); return; }
      k.winX(SX1, 1, zd0, zd1, y + 0.05, y + 2.55, { trans: [y + 1.75], tag: 'studio' });
      const zc = (zd0 + zd1) / 2;
      k.box('white', SX1, SX1 + 1.3, y - 0.16, y, zc - 0.85, zc + 0.85, 'studio');
      rails(k, 'frame', [[SX1 + 0.02, zc - 0.82], [SX1 + 1.27, zc - 0.82], [SX1 + 1.27, zc + 0.82], [SX1 + 0.02, zc + 0.82]], y, null, 'studio');
    });
  }
  k.winZ(SZ0, -1, 54.9, 56.3, 2.4, 18.4, { trans: Array.from({ length: 19 }, (_, i) => 3.2 + i * 0.8), tag: 'studio' });
  SF.forEach((y, i) => {
    k.winZ(SZ1, 1, 54.9, 56.3, y + 0.9, y + 2.5, { trans: [y + 1.7], tag: 'studio' });
    if (i === 0) { k.winX(SX0, -1, 13.4, 16.7, y + 0.95, y + 2.55, { mull: 1.1, tag: 'studio' }); return; }
    k.winX(SX0, -1, 13.4, 14.5, y + 0.05, y + 2.55, { trans: [y + 1.75], tag: 'studio' }); k.winX(SX0, -1, 14.75, 16.7, y + 0.95, y + 2.55, { mull: 1.0, tag: 'studio' });
    k.box('white', 48.15, 57.6, y - 0.16, y, SZ1, 18.5, 'studio'); k.box('white', 48.15, SX0, y - 0.16, y, 12.7, SZ1, 'studio');
    rails(k, 'frame', [[57.6, SZ1 + 0.02], [57.6, 18.47], [48.18, 18.47], [48.18, 12.73], [SX0 - 0.02, 12.73]], y, null, 'studio');
    if (i >= 2) [[1.0, 3.6], [5.4, 8.0], [9.2, 11.8]].forEach(z => k.winX(SX0, -1, z[0], z[1], y + 0.95, y + 2.55, { mull: 1.3, tag: 'studio' }));
  });
  // site, laid out from the close aerial view: Gropiusallee with a wide tree-pit promenade on the north side, a paved
  // pedestrian lane under the bridge, a light-paved car park with two islands west of the school, paths around the
  // north-west lawn, paved courts east of the studio building and the workshop wing, lawns and the open meadow
  const P = { x0: -40, x1: 84, z0: -84, z1: 80 };
  k.box('lawn', P.x0, P.x1, -0.12, 0, P.z0, P.z1);
  k.box('asphalt', -27, -17, 0, 0.03, P.z0, P.z1);
  for (let z = P.z0 + 2; z < P.z1 - 2; z += 4.5) k.box('white', -22.1, -21.9, 0.032, 0.04, z, z + 2.6);
  k.box('paving', -17, -11, 0, 0.06, P.z0, P.z1); k.box('paving', -29.5, -27, 0, 0.06, P.z0, P.z1);
  k.box('paving', -37, -29.5, 0, 0.05, -10.5, 38);                       // forecourt across the road
  // pedestrian lane under the bridge: darker centre strip between lighter edges
  k.box('paving', -11, P.x1, 0, 0.05, -16.7, -13.6); k.box('concrete', -11, P.x1, 0, 0.05, -13.6, -7.6); k.box('paving', -11, P.x1, 0, 0.05, -7.6, -4.5);
  // entrance paths at the workshop wing's far end
  k.box('paving', -11, -1.6, 0, 0.06, 47.5, 49.7); k.box('paving', -11, 0.45, 0, 0.06, 50.0, 52.0); k.box('paving', 0.45, 12.6, 0, 0.06, 50.0, 52.0); k.box('paving', 0, 18, 0, 0.06, -2.5, 0);
  // car park: light paving with two rounded islands of parking bays
  k.box('concrete', 2, 34, 0, 0.04, -82, -49);
  k.box('paving', 1.5, 32.5, 0, 0.05, -49, -45.3);
  [[-82, -64.6], [-63, -49.6]].forEach(([z0, z1]) => { const c = new THREE.CylinderGeometry(1, 1, 0.02, 32); c.scale(13, 1, (z1 - z0) / 2 - 0.3); c.translate(18, 0.05, (z0 + z1) / 2); k.geo('paving', c); });
  const BAYS = [-77.2, -69.4, -59.2, -53.4];
  BAYS.forEach(z => { for (let x = 7; x <= 30; x += 2.6) k.box('white', x - 0.05, x + 0.05, 0.062, 0.07, z - 2.3, z + 2.3); });
  const CARS = ['dark', 'white', 'dark', 'steel', 'bauRed', 'dark', 'white', 'steel'];
  let ci = 0;
  BAYS.forEach((z, bi) => { for (let x = 8.3; x < 30; x += 2.6) { if (rand() > [0.25, 0.3, 0.55, 0.6][bi]) continue; const m = CARS[ci++ % CARS.length];
    k.box(m, x - 0.85, x + 0.85, 0.3, 1.05, z - 2.1, z + 2.1); k.box('glassDark', x - 0.75, x + 0.75, 1.05, 1.5, z - 1.0, z + 0.9); } });
  // paths round the north-west lawn, and the paved court north of the bridge
  k.box('paving', 32.5, 37.4, 0, 0.05, P.z0, -16.7); k.box('paving', 62.6, 66.7, 0, 0.05, P.z0, -16.7);
  k.box('paving', 34, 37.4, 0, 0.05, -4.5, 1.0); k.box('paving', 32.5, 34, 0, 0.05, -4.5, 1.0);
  // paved courts east of the studio building and the festive wing, and round the workshop wing's far end
  k.box('paving', 18, P.x1, 0, 0.05, 18.6, 29.5); k.box('paving', 18, 28, 0, 0.05, 29.5, P.z1);
  k.box('paving', 3, 18, 0, 0.05, 45.5, P.z1); k.box('paving', -11, 3, 0, 0.05, 45.5, 53.5);
  // young trees in round pits along the promenade, with the gap where the lane comes out
  [-66, -58.6, -53, -40.5, -35, -28, 5, 14.6, 23.2, 31.8, 42.4, 52.5, 61.1, 70].forEach(z => {
    const pit = new THREE.CylinderGeometry(0.7, 0.7, 0.02, 16); pit.translate(-14.6, 0.07, z); k.geo('soil', pit); tree(k, -14.6, z, 0.65 + rand() * 0.1); });
  // larger trees on the lawn in front of the workshop wing and the school
  [[-7, -61], [-7, 12], [-7, 22.7], [-7, 30.8], [-7, 40]].forEach(q => tree(k, q[0], q[1], 0.9 + rand() * 0.15));
  // avenue trees on the far side of Gropiusallee
  for (let z = P.z0 + 4; z < P.z1 - 2; z += 8.5) { if (z > -52 && z < 45) continue; tree(k, -31.5, z, 0.95 + rand() * 0.3); }
  [[69, 68, 1.4], [74, -50, 1.0]].forEach(q => tree(k, q[0], q[1], q[2]));
  [[-10, -6.8], [8, -6.8], [42, -6.8], [66, -6.8]].forEach(q => lamp(k, q[0], q[1]));
  [[-3.2, 48.4, 1.2], [-4.4, 47.4, 2.4], [9, -6.4, 0.4], [10.2, -6.0, 3.6], [40, 23, 3.0], [58.5, -3.8, 1.6]].forEach(q => person(k, q[0], q[1], q[2]));
  const grp = k.build(); grp.position.copy(O);
  // lettering on the stair tower
  const lt = letterTexture('BAUHAUS', '#ffffff', 256, 256 * 7, (g, w) => { g.font = '500 214px Jost, Futura, Arial, sans-serif'; 'BAUHAUS'.split('').forEach((ch, i) => g.fillText(ch, 128, 256 * i + 138)); });
  const lg = new THREE.PlaneGeometry(1.25, 9.66);
  const lm = new THREE.Mesh(lg, new THREE.MeshStandardMaterial({ map: lt, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6 }));
  lm.position.set(1.75, 8.86, 50.31); lm.castShadow = true; lm.userData.fact = 'tower';
  lm.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: lt, alphaTest: 0.5 });
  grp.add(lm);
  const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp);
  plinth(scene, P.x0 + O.x, P.x1 + O.x, P.z0 + O.z, P.z1 + O.z, 3, 6);
  const L = v => [v[0] + O.x, v[1], v[2] + O.z];
  const lampPos = [[-10, -6.8], [8, -6.8], [42, -6.8], [66, -6.8]].map(q => new THREE.Vector3(q[0] + O.x, 4.85, q[1] + O.z));
  const extra = {
    eras: [
      { year: '1926', title: 'Opening day', note: 'Crystal mirror glass in black steel frames, white and grey mineral paint.' },
      { year: '1941', title: 'Camouflage', note: 'Painted over between July and October 1941 to hide it from bombers.', mats: { white: 'camo', grey: 'camo', glass: 'glassDark' } },
      { year: '1945', title: 'After the raid', note: 'An incendiary bomb destroyed the curtain wall on 7 March 1945.', mats: { white: 'soot', grey: 'soot', glass: 'none', ceilO: 'soot', ceilY: 'soot', ceilB: 'soot' }, thin: { curtain: 0.42 } },
      { year: 'post-war', title: 'Rebuilt without the glass', note: 'Repaired in a simpler form, with a punched wall where the curtain wall had been.', hide: ['curtain'], show: ['v:punched'], mats: { white: 'postwar', frame: 'whiteInt' } },
      { year: 'today', title: 'Restored', note: 'The curtain wall was rebuilt in aluminium in 1976 and the building restored from 1996 to 2006.', mats: { frame: 'alu' } }
    ],
    views: [
      { label: 'The glass corner', cam: L([-17, 2.8, -11.5]), tgt: L([9, 8.5, 13]), note: 'Lucia Moholy’s photographs of the new buildings shaped how the world saw the Bauhaus, and this glass corner is one of its most photographed views.' },
      { label: 'Under the bridge', cam: L([60, 2.2, -12.5]), tgt: L([20, 8.5, -12.5]) },
      { label: 'The balconies', cam: L([86, 9, -16]), tgt: L([59, 10, 8]) },
      { label: 'From above', cam: L([22, 190, 52]), tgt: L([22, 0, 4]) }
    ],
    hiddenFacts: [
      { id: 'survey', title: 'Measured in 1964', year: '1964', pos: L([9, 1, -0.6]), cam: L([-10, 3, -12]), tgt: L([6, 1.5, 4]), hint: 'Look low, below the glass.',
        text: 'In 1964 the city building office had the whole complex surveyed and measured in detail, led by Karl-Heinz Schlesier and the former Bauhaus student Konrad Püschel. That record later helped the restorations.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Bauhausgeb%C3%A4ude_Dessau'] }
    ]
  };
  return {
    ...extra, scene, center: new THREE.Vector3(0, 0, 0), span: 92, sunDist: 240, lamps: lampPos,
    intro: { pos: L([-78, 62, 112]), tgt: L([20, 4, 6]) },
    facts: [
      { id: 'pinwheel', title: 'A pinwheel of functions', year: '1925–26', pos: L([9.75, 16.5, -9]), cam: L([-60, 70, -70]), tgt: L([20, 4, 0]),
        text: 'Walter Gropius gave each function its own block: workshops, a vocational school, student studios, a festive area and offices. He joined them in an asymmetric pinwheel, so the building has no main front. Building began in September 1925, and more than 1,000 guests came to the opening on 4 December 1926.',
        src: ['Bauhaus Kooperation', 'https://bauhauskooperation.de/wissen/das-bauhaus/werke/architektur/bauhausgebaeude-dessau'] },
      { id: 'curtain', title: 'The glass curtain wall', year: '1926', pos: L([-0.4, 8, 23]), cam: L([-26, 7, 30]), tgt: L([2, 7.5, 18]),
        text: 'The concrete columns stand back from the edge, so the glass runs unbroken across three floors. It wraps the corners with no masonry at all. The original panes were crystal mirror glass in steel frames. The wall caused a sensation, but it also overheated the workshops in summer and chilled them in winter.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Bauhausgeb%C3%A4ude_Dessau'] },
      { id: 'colour', title: 'Colour on the inside', year: '1926', pos: L([9, 8.2, 23]), cam: L([-14, 9, 16]), tgt: L([9, 7, 22]),
        text: 'Outside, the building is strictly white and grey mineral paint. Inside, Hinnerk Scheper and the mural painting workshop gave every floor its own scheme: mainly orange and blue on the raised ground floor, primary colours on the floors above. At night the coloured ceilings glow through the glass.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Bauhausgeb%C3%A4ude_Dessau'] },
      { id: 'tower', title: 'BAUHAUS in white letters', year: '1926', pos: L([1.75, 9, 50.9]), cam: L([-22, 4, 66]), tgt: L([3, 8.5, 47]),
        text: 'The lettering came from the school’s own advertising workshop. Each white letter stands off the grey stair tower on metal rods. A canopy over the red door at the south-west corner forms the bottom of the word.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Bauhausgeb%C3%A4ude_Dessau'] },
      { id: 'raid', title: 'Destroyed and rebuilt', year: '1945–2006', pos: L([18.4, 9, 30]), cam: L([45, 18, 52]), tgt: L([10, 7, 30]),
        text: 'On 7 March 1945 an incendiary bomb destroyed the curtain wall. After the war the building was patched up in a simpler form without it. The glass wall returned in 1976, rebuilt in aluminium instead of steel, and a full restoration followed between 1996 and 2006. It has been a UNESCO World Heritage Site since 1996.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Bauhausgeb%C3%A4ude_Dessau'] },
      { id: 'bridge', title: 'Gropius’s office on a bridge', year: '1926', pos: L([32.9, 10, -13]), cam: L([62, 2.4, -12.5]), tgt: L([25, 8.5, -12.5]),
        text: 'Two storeys of offices stand on four pillars over Bauhausstraße, linking the workshops to the school. The lower floor held the administration. Gropius’s private architecture office was here until he left in 1928, and the architecture department moved in later.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Bauhausgeb%C3%A4ude_Dessau'] },
      { id: 'school', title: 'A second school', year: '1926', pos: L([11, 9, -45.6]), cam: L([11, 12, -85]), tgt: L([11, 6, -36]),
        text: 'The city made one condition: the new building had to house its own arts and crafts school too, later the technical schools. Its ribbon windows stand slightly proud of the white wall. Today Anhalt University of Applied Sciences teaches in this wing.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Bauhausgeb%C3%A4ude_Dessau'] },
      { id: 'festive', title: 'Stage, hall and canteen', year: '1926', pos: L([41, 8.6, 0.6]), cam: L([41, 6, -4.5]), tgt: L([41, 4, 6]),
        text: 'The one-storey festive wing holds the auditorium, the stage and the canteen. The stage could open on both sides, and for celebrations every wall could be opened so that dining hall, stage, auditorium and vestibule became one large hall.',
        src: ['Karel Teige, 1926 (Archiweb)', 'https://www.archiweb.cz/en/news/karel-teige-novostavby-bauhausu-v-dessave'] },
      { id: 'studio', title: 'Twenty-eight studios', year: '1926', pos: L([63.4, 12.5, 8]), cam: L([86, 9, -16]), tgt: L([59, 10, 8]),
        text: 'The studio house, 18.14 m wide, 12.27 m deep and 19.5 m high, held 28 studio flats of about 20 m² for students and junior masters. Josef and Anni Albers, Marcel Breuer, Marianne Brandt and Gunta Stölzl lived here. Its name, Prellerhaus, comes from the studio building in Weimar.',
        src: ['Bauhaus Kooperation', 'https://bauhauskooperation.de/reisen/orte/ortsdetailseite/ort-19'] }
    ]
  };

}
