/* ---------- 7. Lyzeum, Design faculty of Anhalt University ---------- */

export function buildLyzeum(context) {
  const { Kit, THREE, drawClock, hedgeRow, lamp, mbox, person, plinth, rails, rand, registerNoAO, rng2, tree } = context;

  const k = new Kit();
  let ANNEX = null;
  const X = 22, Z = 12.75, E = 14.4, F = 'lyzRender', S = 'lyzStone', T = 'tilesRed';
  const sur = (z, s, x0, x1, y0, y1, w, tag) => { const d = rng2(z, z + s * 0.1), t = w || 0.18; k.box(S, x0 - t, x1 + t, y1, y1 + t, d[0], d[1], tag); k.box(S, x0 - t - 0.06, x1 + t + 0.06, y0 - t - 0.06, y0, d[0], rng2(z, z + s * 0.16)[1] * (s > 0 ? 1 : 1), tag); k.box(S, x0 - t, x0, y0, y1, d[0], d[1], tag); k.box(S, x1, x1 + t, y0, y1, d[0], d[1], tag); };
  const surX = (x, s, z0, z1, y0, y1, w, tag) => { const d = rng2(x, x + s * 0.1), t = w || 0.18; k.box(S, d[0], d[1], y1, y1 + t, z0 - t, z1 + t, tag); k.box(S, d[0], d[1], y0 - t, y0, z0 - t, z1 + t, tag); k.box(S, d[0], d[1], y0, y1, z0 - t, z0, tag); k.box(S, d[0], d[1], y0, y1, z1, z1 + t, tag); };
  const wz = (z, s, x0, x1, y0, y1, tag) => { k.winZ(z, s, x0, x1, y0, y1, { mull: (x1 - x0) / 2, trans: [y0 + (y1 - y0) * 0.68], frame: 'whiteInt', tag }); sur(z, s, x0, x1, y0, y1, 0.18, tag); };
  const wx = (x, s, z0, z1, y0, y1, tag) => { k.winX(x, s, z0, z1, y0, y1, { mull: (z1 - z0) / 2, trans: [y0 + (y1 - y0) * 0.68], frame: 'whiteInt', tag }); surX(x, s, z0, z1, y0, y1, 0.18, tag); };
  const gableShape = (w, hs, ht) => { const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, hs); sh.quadraticCurveTo(w / 2, ht, 0, ht); sh.quadraticCurveTo(-w / 2, ht, -w / 2, hs); sh.closePath(); return sh; };
  const halfDisc = (r, x, y, z, ry, m, tag) => { const g = new THREE.CircleGeometry(r, 16, 0, Math.PI); if (ry) g.rotateY(ry); g.translate(x, y, z); k.geo(m, g, tag); };
  const FY = [[3.0, 5.7], [6.9, 9.6], [10.85, 13.4]];

  /* ---------- main block: sandstone basement, three rendered storeys, stone bands ---------- */
  k.box('stone', -X, X, 0, 1.8, -Z, Z, 'built'); k.box(F, -X, X, 1.8, E - 0.3, -Z, Z, 'built');
  [[1.8, 2.05], [6.3, 6.55], [10.3, 10.55]].forEach(b => k.box(S, -X - 0.08, X + 0.08, b[0], b[1], -Z - 0.08, Z + 0.08, 'built'));
  k.box(S, -X - 0.4, X + 0.4, E - 0.55, E, -Z - 0.4, Z + 0.4, 'roof');
  [[-X, -Z], [X, -Z], [-X, Z], [X, Z]].forEach(c => k.box(S, c[0] - 0.45, c[0] + 0.45, 1.8, E - 0.55, c[1] - 0.45, c[1] + 0.45, 'built'));
  // front: six bays, the arched entrance, a projecting bay with tall stair windows and a curved gable
  const FB = [-18.8, -13.6, -8.4, -3.2];   // window pairs between the west corner and the entrance
  FB.forEach(c => [-0.9, 0.9].forEach(o => { const x = c + o;
    k.winZ(-Z, -1, x - 0.6, x + 0.6, 0.4, 1.3, { mull: 0.6, frame: 'whiteInt', tag: 'built' });
    FY.forEach(y => wz(-Z, -1, x - 0.6, x + 0.6, y[0], y[1], 'built')); }));
  FY.slice(1).forEach(y => wz(-Z, -1, 1.5 - 0.7, 1.5 + 0.7, y[0], y[1], 'built'));   // above the entrance
  k.box('bronzeDark', -0.6, 3.6, 7.0, 7.4, -Z - 1.0, -Z, 'campus10');               // dark canopy cornice over the portal
  { const sh = new THREE.Shape(); sh.moveTo(-1.2, 0); sh.lineTo(1.2, 0); sh.lineTo(1.2, 2.9); sh.absarc(0, 2.9, 1.2, 0, Math.PI, false); sh.closePath();
    const g = new THREE.ShapeGeometry(sh, 16); g.rotateY(Math.PI); g.translate(1.5, 1.85, -Z - 0.03); k.geo('dark', g, 'campus10');
    const r = new THREE.RingGeometry(1.2, 1.65, 20, 1, 0, Math.PI); r.rotateY(Math.PI); r.translate(1.5, 4.75, -Z - 0.08); k.geo(S, r, 'campus10');
    k.box(S, -0.15, 0.3, 1.8, 4.75, -Z - 0.12, -Z, 'campus10'); k.box(S, 2.7, 3.15, 1.8, 4.75, -Z - 0.12, -Z, 'campus10');
    { const c = new THREE.CylinderGeometry(0.55, 0.55, 0.16, 16); c.rotateX(Math.PI / 2); c.translate(1.5, 5.35, -Z - 0.1); k.geo(S, c, 'campus10'); }
    k.box('wood', 0.4, 2.6, 1.85, 4.3, -Z - 0.05, -Z - 0.02, 'campus10'); }
  [[0, 1.8, -Z - 1.2], [0, 1.2, -Z - 1.8], [0, 0.6, -Z - 2.4]].forEach((st, i) => k.box(S, -0.8, 3.8, st[1] - 0.6, st[1], st[2], -Z, 'campus10'));
  // corner pavilion
  const PZ = -Z - 0.8, GX = 11.4;
  k.box(F, 6, X, 1.8, E - 0.3, PZ, -Z, 'girls'); k.box('stone', 6, X, 0, 1.8, PZ, -Z, 'girls');
  [[5.7, 6.5], [X - 0.45, X + 0.45]].forEach(p => k.box(S, p[0], p[1], 1.8, E - 0.55, PZ - 0.15, PZ + 0.3, 'girls'));
  [[1.8, 2.05], [6.6, 6.85], [12.6, 12.85]].forEach(bd => k.box(S, 5.92, X + 0.08, bd[0], bd[1], PZ - 0.08, -Z - 0.08, 'girls'));
  k.box(S, 5.6, X + 0.4, E - 0.55, E, PZ - 0.4, -Z - 0.4, 'roof');
  [8.0, 11.4, 14.8, 18.8].forEach(x => k.winZ(PZ, -1, x - 0.8, x + 0.8, 0.4, 1.3, { mull: 0.8, frame: 'whiteInt', tag: 'girls' }));
  wz(PZ, -1, GX - 1.0, GX + 1.0, 3.0, 6.0, 'girls');
  { const r = new THREE.RingGeometry(1.2, 1.55, 18, 1, 0, Math.PI); r.rotateY(Math.PI); r.translate(GX, 6.25, PZ - 0.12); k.geo(S, r, 'girls');
    const t = new THREE.CircleGeometry(1.2, 18, 0, Math.PI); t.rotateY(Math.PI); t.translate(GX, 6.25, PZ - 0.1); k.geo(S, t, 'girls');
    k.box(S, GX - 1.55, GX + 1.55, 6.05, 6.25, PZ - 0.2, PZ, 'girls'); }
  wz(PZ, -1, 7.2, 8.8, 3.0, 6.0, 'girls'); wz(PZ, -1, 14.4, 16.0, 3.0, 6.0, 'girls');
  [8.0, 11.4, 14.8, 18.8].forEach(x => wz(PZ, -1, x - 0.8, x + 0.8, 8.4, 12.0, 'girls'));
  // stair-hall window
  { const g = gableShape(10.8, 5.6, 9.2), opening = new THREE.Path();
    opening.moveTo(-2.9, 0.35); opening.lineTo(-2.9, 5.6); opening.quadraticCurveTo(0, 8.45, 2.9, 5.6); opening.lineTo(2.9, 0.35); opening.closePath(); g.holes.push(opening);
    const wall = new THREE.ExtrudeGeometry(g, { depth: 0.6, bevelEnabled: false, curveSegments: 20 }); wall.translate(GX, E, PZ - 0.05); k.geo(F, wall, 'girls');
    const glassShape = new THREE.Shape(); glassShape.moveTo(-2.89, 0); glassShape.lineTo(2.89, 0); glassShape.lineTo(2.89, 5.6); glassShape.quadraticCurveTo(0, 8.44, -2.89, 5.6); glassShape.closePath();
    const glazing = new THREE.ShapeGeometry(glassShape, 20); glazing.rotateY(Math.PI); glazing.translate(GX, E + 0.35, PZ - 0.12); k.geo('glassDark', glazing, 'girls');
    [-1.85, 0, 1.85].forEach(dx => k.box('whiteInt', GX + dx - 0.08, GX + dx + 0.08, E + 0.4, E + (dx === 0 ? 8.0 : 5.6), PZ - 0.28, PZ - 0.14, 'girls'));
    [2.2, 4.2, 5.6].forEach(y => k.box('whiteInt', GX - 2.75, GX + 2.75, E + y - 0.08, E + y + 0.08, PZ - 0.28, PZ - 0.14, 'girls')); }
  // square slate-clad clock tower behind the corner gable, with a white drum, a railed balcony and a bronze dome
  const trX = 4.2, trZ = -2.0, TS = 2.2, TT = 26.6;
  k.box('slate', trX - TS, trX + TS, E, TT - 0.25, trZ - TS, trZ + TS, 'roof');
  k.box(S, trX - TS - 0.15, trX + TS + 0.15, TT - 0.25, TT, trZ - TS - 0.15, trZ + TS + 0.15, 'roof');
  { const deck = new THREE.CylinderGeometry(2.55, 2.55, 0.18, 24); deck.translate(trX, TT + 0.09, trZ); k.geo(S, deck, 'roof');
    const drum = new THREE.CylinderGeometry(1.95, 1.95, 1.5, 24); drum.translate(trX, TT + 0.93, trZ); k.geo('whiteInt', drum, 'roof');
    const rim = new THREE.CylinderGeometry(2.1, 2.1, 0.2, 24); rim.translate(trX, TT + 1.78, trZ); k.geo(S, rim, 'roof');
    const dome = new THREE.SphereGeometry(2.0, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2); dome.translate(trX, TT + 1.88, trZ); k.geo('domeBrown', dome, 'roof');
    const fin = new THREE.SphereGeometry(0.16, 8, 6); fin.translate(trX, TT + 3.95, trZ); k.geo('domeBrown', fin, 'roof');
    for (let a = 0; a < 8; a++) { const th = a * Math.PI / 4 + Math.PI / 8; const g = new THREE.PlaneGeometry(0.55, 0.8); g.rotateY(th); g.translate(trX + 1.97 * Math.sin(th), TT + 0.95, trZ + 1.97 * Math.cos(th)); k.geo('glassDark', g, 'roof'); } }
  rails(k, 'frame', Array.from({ length: 17 }, (_, i) => [trX + 2.45 * Math.sin(i * Math.PI / 8), trZ + 2.45 * Math.cos(i * Math.PI / 8)]), TT + 0.18, [0.9], 'roof');
  /* ---------- the north side, from the photo taken from the north-west: the full north facade of the main block is
     visible, with a round tile-roofed turret at the eaves; a low hip-roofed annex with a glazed roof stands at the
     north-west corner; behind the main block a two-storey wing with dormers runs north along the street to a two-storey end block; roof layout checked against an aerial view ---------- */
  const CX0 = -4.2, BX0 = 4, BZ1 = 36, AX0 = -4.7, AX1 = 21, AZ1 = 53.2;
  const BANDS = [[1.8, 2.05], [6.3, 6.55], [10.3, 10.55]];
  // north facade windows: pairs and singles in the west part, a group of three and a group of three in the east part
  [[-16.8, 1.0], [-15.3, 1.0], [-8.7, 1.0], [-7.2, 1.0], [-5.6, 1.0], [-4.1, 1.0], [1.2, 1.1], [2.8, 1.1], [4.4, 1.1], [6.5, 1.2], [8.3, 1.2], [10.1, 1.2]].forEach(([x, w]) =>
    FY.forEach((y, fi) => { if (fi === 0 && x < -5) return; wz(Z, 1, x - w / 2, x + w / 2, y[0], y[1], 'faculty'); }));
  wz(Z, 1, -2.6, 0.2, FY[1][0], FY[1][1], 'faculty');                                   // three-light window under the turret
  { const md = new THREE.RingGeometry(0.55, 0.85, 20); md.translate(-1.2, 12.1, Z + 0.07); k.geo(S, md, 'faculty'); }
  // round-arched stair windows near the east corner
  [FY[1]].forEach(y => { wz(Z, 1, 16.2, 17.4, y[0], y[1] - 0.6, 'faculty'); halfDisc(0.6, 16.8, y[1] - 0.6, Z + 0.06, 0, 'glassDark', 'faculty'); });
  wz(Z, 1, 16.1, 17.5, FY[2][0], FY[2][1], 'faculty');
  // broad two-storey wing along the street, forming the long leg of the rear L-shaped footprint; the aerial shows dormers on both roof slopes
  k.box('stone', BX0, X, 0, 1.8, Z, BZ1, 'faculty'); k.box(F, BX0, X, 1.8, 7.2, Z, BZ1, 'faculty');
  k.box(S, BX0 - 0.08, X + 0.08, 1.8, 2.05, Z, BZ1, 'faculty'); k.box(S, BX0 - 0.4, X + 0.4, 7.2, 7.5, Z, BZ1, 'faculty');
  for (let z = Z + 2.6; z < BZ1 - 1; z += 4.2) [[2.3, 4.5], [5.1, 6.9]].forEach(y => { wx(X, 1, z - 0.8, z + 0.8, y[0], y[1], 'faculty'); wx(BX0, -1, z - 0.8, z + 0.8, y[0], y[1], 'faculty'); });
  // two-storey end block with a glazed roof light along its ridge
  const AR = [[2.3, 4.5], [5.1, 6.9]];
  k.box('stone', AX0, AX1, 0, 1.8, BZ1, AZ1, 'faculty'); k.box(F, AX0, AX1, 1.8, 7.2, BZ1, AZ1, 'faculty');
  k.box(S, AX0 - 0.08, AX1 + 0.08, 1.8, 2.05, BZ1 - 0.08, AZ1 + 0.08, 'faculty');
  k.box(S, AX0 - 0.4, AX1 + 0.4, 7.2, 7.5, BZ1, AZ1 + 0.4, 'roof');
  for (let x = AX0 + 2.6; x < AX1 - 1; x += 4.2) { k.winZ(AZ1, 1, x - 0.9, x + 0.9, 0.5, 1.3, { mull: 0.9, frame: 'whiteInt', tag: 'faculty' }); AR.forEach(y => wz(AZ1, 1, x - 0.8, x + 0.8, y[0], y[1], 'faculty')); if (x < BX0 - 1) AR.forEach(y => wz(BZ1, -1, x - 0.8, x + 0.8, y[0], y[1], 'faculty')); }
  [BZ1 + 3.2, BZ1 + 7.4, BZ1 + 11.6, BZ1 + 15.0].forEach(z => AR.forEach(y => { wx(AX1, 1, z - 0.8, z + 0.8, y[0], y[1], 'faculty'); wx(AX0, -1, z - 0.8, z + 0.8, y[0], y[1], 'faculty'); }));
  k.box('glassDark', 1.6, 14.6, 12.0, 12.12, 42.6, 46.8, 'roof'); k.box(S, 1.4, 14.8, 11.95, 12.0, 42.4, 47.0, 'roof');
  // east front of the main block: regular windows, a tall curved gable towards the south corner, a pedimented frontispiece
  const EGZ = -3.5;
  [-3.4, 0.6, 4.6, 8.6, 11.4].forEach(z => { k.winX(X, 1, z - 0.9, z + 0.9, 0.5, 1.3, { mull: 0.9, frame: 'whiteInt', tag: 'faculty' }); FY.forEach(y => wx(X, 1, z - 0.8, z + 0.8, y[0], y[1], 'faculty')); });
  wx(X, 1, -8.4, -6.8, FY[2][0], FY[2][1], 'faculty');
  { const g = gableShape(13, 5.6, 9.6), opening = new THREE.Path();
    opening.moveTo(-4.1, 0.35); opening.lineTo(-4.1, 5.6); opening.quadraticCurveTo(0, 8.6, 4.1, 5.6); opening.lineTo(4.1, 0.35); opening.closePath(); g.holes.push(opening);
    const wall = new THREE.ExtrudeGeometry(g, { depth: 0.6, bevelEnabled: false, curveSegments: 20 }); wall.rotateY(Math.PI / 2); wall.translate(X - 0.55, E, EGZ); k.geo(F, wall, 'faculty');
    const glassShape = new THREE.Shape(); glassShape.moveTo(-4.09, 0); glassShape.lineTo(4.09, 0); glassShape.lineTo(4.09, 5.6); glassShape.quadraticCurveTo(0, 8.59, -4.09, 5.6); glassShape.closePath();
    const glazing = new THREE.ShapeGeometry(glassShape, 20); glazing.rotateY(Math.PI / 2); glazing.translate(X + 0.12, E + 0.35, EGZ); k.geo('glassDark', glazing, 'faculty');
    [-2, 0, 2].forEach(dz => { const z = EGZ - dz; k.box('whiteInt', X + 0.14, X + 0.28, E + 0.4, E + (dz === 0 ? 8.2 : 5.6), z - 0.09, z + 0.09, 'faculty'); });
    [2.2, 4.2, 5.6].forEach(y => k.box('whiteInt', X + 0.14, X + 0.28, E + y - 0.08, E + y + 0.08, EGZ - 3.95, EGZ + 3.95, 'faculty'));
    const oc = new THREE.RingGeometry(0.55, 0.85, 20); oc.rotateY(Math.PI / 2); oc.translate(X + 0.12, E + 7.2, EGZ); k.geo(S, oc, 'faculty');
    const og = new THREE.CircleGeometry(0.55, 20); og.rotateY(Math.PI / 2); og.translate(X + 0.1, E + 7.2, EGZ); k.geo('glassDark', og, 'faculty'); }
  // frontispiece near the south corner: stone pilasters, a ground-floor window and a tall triangular pediment
  { const PX = X, PZ0 = -9.6, PZ1 = -5.6, pc = (PZ0 + PZ1) / 2;
    k.box(S, PX, PX + 0.35, 0, 8.1, PZ0, PZ0 + 0.55, 'faculty'); k.box(S, PX, PX + 0.35, 0, 8.1, PZ1 - 0.55, PZ1, 'faculty'); k.box(S, PX, PX + 0.35, 7.6, 8.1, PZ0 + 0.55, PZ1 - 0.55, 'faculty');
    const sh = new THREE.Shape(); sh.moveTo(-(PZ1 - PZ0) / 2 - 0.25, 0); sh.lineTo((PZ1 - PZ0) / 2 + 0.25, 0); sh.lineTo(0, 4.2); sh.closePath();
    const pd = new THREE.ExtrudeGeometry(sh, { depth: 0.45, bevelEnabled: false }); pd.rotateY(Math.PI / 2); pd.translate(PX - 0.1, 8.1, pc); k.geo(S, pd, 'faculty');
    const orn = new THREE.CircleGeometry(0.55, 16); orn.rotateY(Math.PI / 2); orn.translate(PX + 0.37, 9.4, pc); k.geo('stone', orn, 'faculty');
    wx(PX, 1, pc - 0.8, pc + 0.8, FY[0][0], FY[0][1], 'faculty');
    k.winX(PX, 1, pc - 0.8, pc + 0.8, 0.4, 1.3, { mull: 0.8, frame: 'whiteInt', tag: 'faculty' }); }
  // round turret at the eaves of the north facade, with a bell-shaped tile roof between the two roof sections
  { const tx = -1.5, tz = Z - 0.9, R = 2.1;
    const dr = new THREE.CylinderGeometry(R, R, 2.0, 24); dr.translate(tx, E + 0.5, tz); k.geo(F, dr, 'faculty');
    const rb = new THREE.CylinderGeometry(R + 0.15, R + 0.15, 0.25, 24); rb.translate(tx, E + 1.55, tz); k.geo(S, rb, 'faculty');
    for (let a = -2; a <= 2; a++) { const th = a * 0.55; const g = new THREE.PlaneGeometry(0.6, 0.9); g.rotateY(th); g.translate(tx + (R + 0.02) * Math.sin(th), E + 0.6, tz + (R + 0.02) * Math.cos(th)); k.geo('glassDark', g, 'faculty'); }
    const prof = [[R + 0.3, 0], [R + 0.15, 0.35], [R * 0.85, 1.1], [R * 0.6, 2.1], [R * 0.32, 3.0], [0.12, 3.6], [0, 3.7]].map(q => new THREE.Vector2(q[0], q[1]));
    const bell = new THREE.LatheGeometry(prof, 24); bell.translate(tx, E + 1.65, tz); k.geo(T, bell, 'roof');
    const fin = new THREE.ConeGeometry(0.12, 1.0, 8); fin.translate(tx, E + 5.8, tz); k.geo('bronzeDark', fin, 'roof'); }
  // round-topped dormers along the roof slopes
  const dormer = (x, z, dir, yb) => {
    const Y = yb == null ? E : yb, w = 1.5, d = 1.8, ry = { s: Math.PI, n: 0, e: Math.PI / 2, w: -Math.PI / 2 }[dir];
    const body = mbox(w, 1.5, d); body.translate(0, Y + 0.55, -d / 2); body.rotateY(ry); body.translate(x, 0, z); k.geo(F, body, 'roof');
    const cap = new THREE.CylinderGeometry(w / 2 + 0.08, w / 2 + 0.08, d + 0.1, 12, 1, false, -Math.PI / 2, Math.PI); cap.rotateX(Math.PI / 2); cap.translate(0, Y + 1.3, -d / 2); cap.rotateY(ry); cap.translate(x, 0, z); k.geo('roofZinc', cap, 'roof');
    const gl = new THREE.PlaneGeometry(0.9, 0.9); gl.translate(0, Y + 0.75, 0.02); gl.rotateY(ry); gl.translate(x, 0, z); k.geo('glassDark', gl, 'roof');
  };
  // dormer positions follow the aerial view: three on the front slope, two on the rear slope, one on the western hip
  [-14.8, -7.7, 3.6].forEach(x => dormer(x, -Z + 0.3, 's'));
  [-14.8, -7.7].forEach(x => dormer(x, Z - 0.3, 'n'));
  dormer(-X + 0.3, -0.5, 'w');
  [16.2, 19.0, 24.6, 28.2].forEach(z => dormer(X - 1.6, z, 'e', 7.9)); [19.0, 24.0, 31.5].forEach(z => dormer(BX0 + 1.6, z, 'w', 7.9));   // street wing
  dormer(7.7, AZ1 - 1.4, 'n', 8.0); dormer(AX1 - 1.4, 44.5, 'e', 8.0); dormer(AX0 + 1.4, 44.5, 'w', 8.0);                                   // end block
  // hip roof
  const hip = (x0, x1, z0, z1, y, h, m, rr, ins) => {
    const w = x1 - x0, d = z1 - z0, r = rr || Math.min(w, d) / 2 * 0.7;
    const [il, ir, iF, iB] = ins || [r, r, r, r];
    const b = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], t = [[x0 + il, z0 + iF], [x1 - ir, z0 + iF], [x1 - ir, z1 - iB], [x0 + il, z1 - iB]];
    const pos = [], uv = [];
    const tri = (p1, p2, p3) => { const ux = p2[0] - p1[0], uy = p2[1] - p1[1], uz = p2[2] - p1[2], vx = p3[0] - p1[0], vy = p3[1] - p1[1], vz = p3[2] - p1[2];
      if (Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) < 1e-6) return;
      [p1, p3, p2].forEach(p => { pos.push(p[0], p[1], p[2]); uv.push((p[0] + p[2]) * 0.3, p[1] * 0.45); }); };
    const quad = (p1, p2, p3, p4) => { tri(p1, p2, p3); tri(p1, p3, p4); };
    quad([b[0][0], y, b[0][1]], [b[1][0], y, b[1][1]], [t[1][0], y + h, t[1][1]], [t[0][0], y + h, t[0][1]]);
    quad([b[1][0], y, b[1][1]], [b[2][0], y, b[2][1]], [t[2][0], y + h, t[2][1]], [t[1][0], y + h, t[1][1]]);
    quad([b[2][0], y, b[2][1]], [b[3][0], y, b[3][1]], [t[3][0], y + h, t[3][1]], [t[2][0], y + h, t[2][1]]);
    quad([b[3][0], y, b[3][1]], [b[0][0], y, b[0][1]], [t[0][0], y + h, t[0][1]], [t[3][0], y + h, t[3][1]]);
    quad([t[0][0], y + h, t[0][1]], [t[1][0], y + h, t[1][1]], [t[2][0], y + h, t[2][1]], [t[3][0], y + h, t[3][1]]);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals(); k.geo(m || T, g, 'roof');
  };
  // main block: two steep hipped roofs with ridges running east-west, the western one lower and shorter
  const HZ = Z + 0.4;
  hip(-X - 0.4, -2.0, -HZ, HZ, E, 7.4, T, 0, [8.2, 8.2, HZ - 0.05, HZ - 0.05]);
  hip(-3.6, X + 0.4, -HZ, HZ, E, 9.0, T, 0, [6.5, 6.5, HZ - 0.05, HZ - 0.05]);
  // corner pavilion: a ridge running back from the top of the curved gable, hipped where it meets the main roof
  hip(6.0, 16.8, PZ + 0.6, 1.5, E, 9.2, T, 0, [5.35, 5.35, 0, 5.4]);
  // east gable: a ridge running in from the gable, hipped at its inner end
  hip(X - 14, X - 0.6, EGZ - 6.5, EGZ + 6.5, E, 9.6, T, 0, [6.5, 0, 6.45, 6.45]);
  hip(BX0 - 0.4, X + 0.4, Z, BZ1, 7.5, 4.6, T, 0, [9.35, 9.35, 0.1, 0.1]);
  hip(AX0 - 0.4, AX1 + 0.4, BZ1, AZ1 + 0.4, 7.5, 4.5);
  // site, from the aerial view: a street on each side, a paved forecourt with parking to the west, a planted garden
  // behind the annex, and a tree-planted square in front
  const P = { x0: -60, x1: 60, z0: -45, z1: 66 };
  k.box('lawn', P.x0, P.x1, -0.12, 0, P.z0, P.z1);
  k.box('asphalt', 27.3, 34.8, 0, 0.03, P.z0, P.z1); k.box('paving', 34.8, 37.4, 0, 0.05, P.z0, P.z1);
  k.box('asphalt', -48.7, -41.2, 0, 0.03, P.z0, P.z1); k.box('paving', -52, -48.7, 0, 0.05, P.z0, P.z1);
  k.box('paving', -39, 27.3, 0, 0.05, P.z0, -Z - 0.01);                     // square in front
  k.box('paving', X, 27.3, 0, 0.05, -Z - 0.01, P.z1);                        // pavement along the east front
  k.box('paving', -39, -X, 0, 0.05, -Z - 0.01, P.z1);                        // forecourt along the west side
  k.box('paving', -X, CX0, 0, 0.05, Z + 3.4, P.z1);                          // court behind the annex
  k.box('paving', CX0, X, 0, 0.05, AZ1, P.z1); k.box('paving', CX0, BX0, 0, 0.05, Z, AZ1);
  k.box('hedge', -41.2, -40.2, 0, 0.9, P.z0 + 2, P.z1 - 2);
  // planted garden west of the wing
  k.box('lawn', -23.7, -8.2, 0, 0.08, 25.2, 52.4);
  [[-20, 30], [-12, 33], [-18, 41], [-11, 46], [-21, 49]].forEach(q => hedgeRow(k, q[0] - 1.2, q[0] + 1.2, q[1] - 1.2, q[1] + 1.2, 0.8, 'faculty'));
  k.box('concrete', -16.5, -13.5, 0.08, 1.2, 37, 40, 'faculty');
  const artObj = new THREE.DodecahedronGeometry(1.1); artObj.translate(-15, 2.3, 38.5); k.geo('bauYellow', artObj, 'faculty');
  for (let i = 0; i < 8; i++) { const bz = 18.5 + i * 1.6; rails(k, 'steel', [[-30, bz], [-28, bz]], 0.05, [0.45, 0.85], 'faculty'); }
  // cars parked on the west forecourt
  [[-35, 15.5, 'steel'], [-35, 19.5, 'dark'], [-35, 23.5, 'white']].forEach(c => { k.box(c[2], c[0] - 2.2, c[0] + 2.2, 0.3, 1.05, c[1] - 0.85, c[1] + 0.85); k.box('glassDark', c[0] - 1.0, c[0] + 1.1, 1.05, 1.5, c[1] - 0.75, c[1] + 0.75); });
  // trees: rows on the front square, the street trees to the east, big trees on the west side
  [-29, -19, -6.7, 3.3, 14.8].forEach(x => { tree(k, x, -30, 1.0 + rand() * 0.15); tree(k, x + 1, -39, 0.95 + rand() * 0.15); });
  for (let z = -40; z <= 62; z += 7) tree(k, 39, z, 0.95 + rand() * 0.2);
  [[-34, -0.8, 1.3], [-33, 58, 1.2], [-55, 20, 1.1], [-55, -20, 1.1]].forEach(q => tree(k, q[0], q[1], q[2]));
  [[-30, -15], [26, -15], [0, -16]].forEach(q => lamp(k, q[0], q[1]));
  for (let i = 0; i < 14; i++) person(k, -15 + rand() * 30, -17 + rand() * 3, rand() * 6.28);
  const grp = k.build();
  // clock on the stair hall facade
  const cc = document.createElement('canvas'); cc.width = cc.height = 256; const ct = new THREE.CanvasTexture(cc); ct.colorSpace = THREE.SRGBColorSpace;
  context.setLyzeumClock({ canvas: cc, tex: ct });
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.9, 32), new THREE.MeshStandardMaterial({ map: ct, roughness: 0.5 }));
  face.rotation.y = Math.PI; face.position.set(trX, TT - 2.0, trZ - TS - 0.02); face.userData.part = 'roof'; grp.add(face);
  const face2 = new THREE.Mesh(face.geometry, face.material); face2.rotation.y = Math.PI / 2; face2.position.set(trX + TS + 0.02, TT - 2.0, trZ); face2.userData.part = 'roof'; grp.add(face2);
  const face3 = new THREE.Mesh(face.geometry, face.material); face3.position.set(trX, TT - 2.0, trZ + TS + 0.02); face3.userData.part = 'roof'; grp.add(face3);
  drawClock(context.getTime());
  const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp);
  plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return {
    scene, center: new THREE.Vector3(0, 0, 12), span: 95, sunDist: 220, lamps: [[-30, -15], [26, -15], [0, -16]].map(q => new THREE.Vector3(q[0], 4.85, q[1])),
    intro: { pos: [-55, 34, -62], tgt: [2, 8, 8] },
    views: [{ label: 'The curved gable', cam: [14, 5, -34], tgt: [11.4, 12, -Z] }, { label: 'The entrance', cam: [-2, 3.5, -28], tgt: [1.5, 4.5, -Z] }, { label: 'The north side', cam: [-38, 20, 62], tgt: [0, 12, Z] }],
    hiddenFacts: [{ id: 'medallion', title: 'The stone medallions', year: 'about 1912', pos: [GX, E + 7.0, PZ - 0.6], cam: [14, 12, -26], tgt: [GX, E + 7.0, PZ], hint: 'Look high on the curved gable.',
      text: 'Stone relief medallions decorate the gable and the portal, carved with wreaths and children’s heads in the Reform style of the 1910s.',
      src: ['Architectural observations on site', ''] }],
    facts: [
      { id: 'girls', title: 'A school for girls', year: 'about 1912', pos: [11.4, E + 7.2, -Z - 1.4], cam: [14, 5, -34], tgt: [11.4, 12, -Z],
        text: 'Built around 1912 as the Städtisches Lyzeum, a higher school for girls, in a picturesque mix of Jugendstil and Reform architecture. Its high hip roof, curved gables and stone bands stand out on Schwabestraße.',
        src: ['Denkmalpflege Sachsen-Anhalt', ''] },
      { id: 'campus10', title: 'Campus 10: Faculty of Design', year: 'today', pos: [1.5, 5.5, -Z - 0.6], cam: [-2, 3.5, -28], tgt: [1.5, 4.5, -Z],
        text: 'Today the Lyzeum is Building 10 of Anhalt University of Applied Sciences, home to the Design department (Fachbereich Design). Students study integrated design here, continuing Dessau’s design teaching tradition.',
        src: ['Hochschule Anhalt', 'https://www.hs-anhalt.de/hochschule-anhalt/fachbereich-4.html'] },
      { id: 'roof', title: 'The high tile roof', year: 'about 1912', pos: [trX, TT + 4.2, trZ], cam: [-32, 26, -36], tgt: [trX, TT - 1, trZ],
        text: 'The steep hipped roof with red tiles is crowned by a square clock tower with a railed balcony and a bronze dome, which gave the school its civic presence.',
        src: ['Denkmalpflege Sachsen-Anhalt', ''] },
      { id: 'faculty', title: 'Studios, workshops and labs', year: 'today', pos: [-1.5, E + 6.4, Z - 0.9], cam: [-38, 20, 62], tgt: [-1.5, E + 2, Z],
        text: 'Inside, former classrooms serve as design studios, computer labs, photo studios and prototyping workshops. On the north side a round turret with a bell-shaped tile roof rises from the eaves between the two sections of the roof.',
        src: ['Hochschule Anhalt', 'https://www.hs-anhalt.de/hochschule-anhalt/fachbereich-4.html'] },
      { id: 'bauhaus', title: 'Near the Bauhaus campus', year: '1925–today', pos: [X + 1.5, 9, 0], cam: [48, 12, -18], tgt: [X, 9, 0],
        text: 'The Lyzeum stands only a few hundred metres from the Bauhaus building. In 1925–26, when Walter Gropius built the Bauhaus on the neighbouring fields, the girls’ school was already a familiar landmark.',
        src: ['Bauhaus Dessau Foundation', ''] }
    ]
  };

}
