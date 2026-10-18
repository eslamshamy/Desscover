/* ---------- Johannbau, Museum für Stadtgeschichte ---------- */

export function buildJohannbau(context) {
  const { Kit, THREE, gableRoof, glass, parkGround, person, plinth, prism, rails, rand, registerNoAO, tree } = context;

  const k = new Kit(), W = 'white', S = 'stoneLight', T = 'tilesRed';
  const P = { x0: -80, x1: 80, z0: -60, z1: 82 };
  parkGround(k, P, 'paving');
  // local axes after alignment: +x is north, +z is east (towards the Mulde), the courtyard lay east of the Johannbau
  const LX = 26.5, LZ = 7.5, E = 13.6, FL = [[1.6, 3.7], [5.7, 7.9], [9.8, 12.0]];
  // a "welscher Giebel": stepped, every step crowned by a quarter or half circle
  const welsch = (w, h1, gap) => { const s = new THREE.Shape(), a = w / 2, b = w * 0.33, c = w * 0.17, r1 = a - b, r2 = b - c;
    const y1 = h1, y2 = y1 + r1 + gap, y3 = y2 + r2 + gap * 0.7;
    s.moveTo(-a, 0); s.lineTo(a, 0); s.lineTo(a, y1); s.absarc(b, y1, r1, 0, Math.PI / 2, false); s.lineTo(b, y2); s.absarc(c, y2, r2, 0, Math.PI / 2, false); s.lineTo(c, y3); s.absarc(0, y3, c, 0, Math.PI, false);
    s.lineTo(-c, y2 + r2); s.absarc(-c, y2, r2, Math.PI / 2, Math.PI, false); s.lineTo(-b, y1 + r1); s.absarc(-b, y1, r1, Math.PI / 2, Math.PI, false); s.closePath();
    return { s, top: y3 + c, steps: [[a, y1], [b, y2], [c, y3 + c]] }; };
  const ball = (x, y, z, tag) => { const g = new THREE.SphereGeometry(0.28, 10, 8); g.translate(x, y, z); k.geo(S, g, tag); };
  /* ---------- the wing itself: three storeys, white render, stone window frames ---------- */
  k.box(S, -LX - 0.1, LX + 0.1, 0, 0.8, -LZ - 0.1, LZ + 0.1, 'wing'); k.box(W, -LX, LX, 0.8, E - 0.2, -LZ, LZ, 'wing'); k.box(S, -LX - 0.25, LX + 0.25, E - 0.35, E, -LZ - 0.25, LZ + 0.25, 'wing');
  [-1, 1].forEach(sd => { for (let x = -23.4; x <= 23.5; x += 3.9) { if (sd > 0 && x > -4 && x < 8) continue; FL.forEach((f, fi) => { if (sd > 0 && fi === 0 && Math.abs(x + 19.5) < 1) return; k.winZ(sd * LZ, sd, x - 0.8, x + 0.8, f[0], f[1], { mull: 0.8, trans: [f[0] + 1.3], frame: S, glass: 'glassDark', tag: sd > 0 ? 'museum' : 'wing' }); }); } });
  [-1, 1].forEach(sd => { [-4, 0, 4].forEach(z => FL.forEach(f => k.winX(sd * LX, sd, z - 0.8, z + 0.8, f[0], f[1], { mull: 0.8, frame: S, glass: 'glassDark', tag: 'gables' }))); });
  // museum entrance arched portal (east face, public entrance)
  { const sh = new THREE.Shape(); sh.moveTo(-1.3, 0); sh.lineTo(1.3, 0); sh.lineTo(1.3, 2.6); sh.absarc(0, 2.6, 1.3, 0, Math.PI, false); sh.closePath(); const g = new THREE.ShapeGeometry(sh, 12); g.translate(-19.5, 0.8, LZ + 0.04); k.geo('wood', g, 'museum'); const r = new THREE.RingGeometry(1.3, 1.75, 16, 1, 0, Math.PI); r.translate(-19.5, 3.4, LZ + 0.06); k.geo(S, r, 'museum'); }
  /* ---------- today, and in 1533: steep roof, round-crowned end gables and dormer gables ---------- */
  k.part = 'jbTop';
  gableRoof(k, T, -LX, LX, -LZ - 0.35, LZ + 0.35, E, 9.6, true, 'roof');
  const eg = welsch(2 * LZ + 0.6, 3.6, 2.3);
  [-1, 1].forEach(sd => { const g = new THREE.ExtrudeGeometry(eg.s, { depth: 0.7, bevelEnabled: false, curveSegments: 10 }); g.rotateY(Math.PI / 2); g.translate(sd > 0 ? LX - 0.7 : -LX, E, 0); k.geo(W, g, 'gables');
    eg.steps.forEach(st => [-1, 1].forEach(s2 => ball(sd * (LX + 0.05), E + st[1] + 0.3, s2 * st[0] * (st[0] === eg.steps[2][0] ? 0 : 1), 'gables')));
    [[1.2, 2.7], [4.8, 6.1]].forEach(y => [-2.6, 2.6].forEach(z => k.winX(sd * LX, sd, z - 0.6, z + 0.6, E + y[0], E + y[1], { frame: S, glass: 'glassDark', tag: 'gables' })));
    k.winX(sd * LX, sd, -0.6, 0.6, E + 8.6, E + 9.9, { frame: S, glass: 'glassDark', tag: 'gables' }); });
  const dg = welsch(7.2, 3.9, 1.3);
  [-1, 1].forEach(sd => [-18.5, -9.5, 10.5, 19.5].forEach(x => {
    const g = new THREE.ExtrudeGeometry(dg.s, { depth: 0.5, bevelEnabled: false, curveSegments: 10 }); if (sd < 0) g.rotateY(Math.PI); g.translate(x, E, sd > 0 ? LZ - 0.45 : -LZ + 0.45); k.geo(W, g, 'gables');
    gableRoof(k, T, x - 3.7, x + 3.7, sd > 0 ? 0 : -LZ - 0.3, sd > 0 ? LZ + 0.3 : 0, E, 5.4, false, 'roof');
    [[0.9, 2.5], [3.1, 4.5]].forEach(y => [-1.5, 1.5].forEach(dx => k.winZ(sd * (LZ + 0.06), sd, x + dx - 0.55, x + dx + 0.55, E + y[0], E + y[1], { frame: S, glass: 'glassDark', tag: 'gables' })));
    ball(x, E + dg.top + 0.3, sd * (LZ + 0.1), 'gables'); [-1, 1].forEach(s2 => ball(x + s2 * 3.6, E + 4.2, sd * (LZ + 0.1), 'gables')); }));
  k.part = '';
  /* ---------- the octagonal stair tower (Wendelstein 1531–33) and its balcony (Altan) ---------- */
  const TX = 1.6, TZ = LZ + 2.6;
  { const t = new THREE.CylinderGeometry(3.4, 3.4, 23.5, 8); t.rotateY(Math.PI / 8); t.translate(TX, 11.75, TZ); k.geo(W, t, 'tower');
    // stone banding at intervals (Renaissance detail)
    [5, 10, 15, 20].forEach(y => { const band = new THREE.CylinderGeometry(3.5, 3.5, 0.3, 8); band.rotateY(Math.PI / 8); band.translate(TX, y, TZ); k.geo(S, band, 'tower'); });
    const band2 = new THREE.CylinderGeometry(3.6, 3.6, 0.5, 8); band2.rotateY(Math.PI / 8); band2.translate(TX, 23.5, TZ); k.geo(S, band2, 'tower');
    // spiral window slots
    for (let i = 0; i < 9; i++) { const a = i * 0.9 + 0.4, y = 3 + i * 2.2; if (Math.cos(a) < -0.1) continue; const g = new THREE.PlaneGeometry(0.8, 1.3); g.rotateY(Math.PI / 2 - a); g.translate(TX + Math.cos(a) * 3.36, y, TZ - Math.sin(a) * 3.36 * -1); k.geo('glassDark', g, 'tower'); }
    // Altan balcony (cornice + rail)
    k.box(S, TX - 4.8, TX + 4.8, 22.8, 23.4, TZ - 4.8, TZ + 4.8, 'tower');
    rails(k, S, [[TX - 4.6, TZ - 4.6], [TX + 4.6, TZ - 4.6], [TX + 4.6, TZ + 4.6], [TX - 4.6, TZ + 4.6], [TX - 4.6, TZ - 4.59]], 23.4, [0.7], 'tower');
    // octagonal lantern storey
    const top = new THREE.CylinderGeometry(2.9, 3.1, 3.2, 8); top.rotateY(Math.PI / 8); top.translate(TX, 25.4, TZ); k.geo('slate', top, 'tower');
    for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; const g = new THREE.PlaneGeometry(0.9, 1.4); g.rotateY(Math.PI / 2 - a); g.translate(TX + Math.cos(a) * 2.95, 25.4, TZ - Math.sin(a) * 2.95); k.geo('glassDark', g, 'tower'); }
    // conical slate spire
    const sp = new THREE.ConeGeometry(3.1, 11.5, 8); sp.rotateY(Math.PI / 8); sp.translate(TX, 32.75, TZ); k.geo('slate', sp, 'tower');
    // iron weather vane
    k.box('steel', TX - 0.05, TX + 0.05, 38.5, 40.4, TZ - 0.05, TZ + 0.05, 'tower');
    const vb = new THREE.SphereGeometry(0.3, 10, 8); vb.translate(TX, 39.4, TZ); k.geo('copper', vb, 'tower'); }
  /* ---------- freestanding palace portal (original Renaissance gateway) ---------- */
  { const PX = -8, PZ = LZ + 2; k.box(S, PX - 3, PX - 1.6, 0, 7.5, PZ - 0.5, PZ + 0.5, 'tower'); k.box(S, PX + 1.6, PX + 3, 0, 7.5, PZ - 0.5, PZ + 0.5, 'tower'); k.box(S, PX - 3, PX + 3, 7.5, 8.2, PZ - 0.5, PZ + 0.5, 'tower');
    const ph = new THREE.Shape(); ph.moveTo(-1.6, 0); ph.lineTo(1.6, 0); ph.lineTo(1.6, 4.8); ph.absarc(0, 4.8, 1.6, 0, Math.PI, false); ph.closePath(); const pg = new THREE.ShapeGeometry(ph, 14); pg.rotateY(-Math.PI / 2); pg.translate(PX - 0.02, 0, PZ); k.geo('dark', pg, 'tower'); }
  /* ---------- historic wing reconstructions for era slider ---------- */
  const CZ1 = 36, WD = 7, wing = (x0, x1, z0, z1, h, part, wStyle, tag) => { k.part = part; const mk2 = wStyle === 'ren' ? S : (wStyle === 'bar' ? 'cream' : 'soot'); k.box(mk2, x0, x1, 0, h, z0, z1, tag); k.box(S, x0 - 0.2, x1 + 0.2, h - 0.3, h + 0.2, z0 - 0.2, z1 + 0.2, tag); if (wStyle === 'ren') { k.geo(T, prism(x0 - 0.2, x1 + 0.2, z0 - 0.2, z1 + 0.2, h + 0.2, h + 5, 4, 4), tag); } if (wStyle === 'bar') { k.geo('slate', prism(x0 - 0.2, x1 + 0.2, z0 - 0.2, z1 + 0.2, h + 0.2, h + 5, 4, 4), tag); } k.part = ''; };
  // 1533: Altan added to tower
  k.part = 'v:altan'; { const ag = new THREE.SphereGeometry(0.25, 8, 6); ag.translate(TX, 40.5, TZ); k.geo('copper', ag, 'tower'); } k.part = '';
  // c.1650: four-wing palace with round dormer gables and spired stair towers
  wing(LX - WD, LX, LZ, CZ1, E, 'v:wingN', 'ren', 'wing');
  wing(-LX, -LX + WD, LZ, CZ1, E, 'v:wingsRen', 'ren', 'wing'); wing(-LX, LX - (0), CZ1, CZ1 + WD, E, 'v:wingsRen', 'ren', 'wing');
  k.part = 'v:wingsRen'; [[-LX + WD + 1.5, CZ1 - 1.5], [LX - WD - 1.5, CZ1 - 1.5]].forEach(c => { const t = new THREE.CylinderGeometry(2.4, 2.4, 20, 8); t.translate(c[0], 10, c[1]); k.geo(W, t, 'wing'); const sp = new THREE.ConeGeometry(2.4, 9, 8); sp.translate(c[0], 24.5, c[1]); k.geo('slate', sp, 'wing'); }); k.part = '';
  // 1753: Knobelsdorff baroque remodel
  wing(-LX, -LX + WD, LZ, CZ1, 17, 'v:wingsBar', 'bar', 'wing'); wing(-LX, LX, CZ1, CZ1 + WD, 17, 'v:wingsBar', 'bar', 'wing');
  // 1813: Johannbau raised by a storey, gables removed
  k.part = 'v:jbRaised'; k.box(W, -LX, LX, E, E + 3.6, -LZ, LZ, 'wing'); k.box(S, -LX - 0.25, LX + 0.25, E + 3.3, E + 3.6, -LZ - 0.25, LZ + 0.25, 'wing'); k.geo('slate', prism(-LX - 0.3, LX + 0.3, -LZ - 0.3, LZ + 0.3, E + 3.6, E + 8.6, LZ, LZ), 'roof');
  for (let x = -23.4; x <= 23.5; x += 3.9) [-1, 1].forEach(sd => k.winZ(sd * LZ, sd, x - 0.8, x + 0.8, E + 0.8, E + 2.8, { mull: 0.8, frame: S, glass: 'glassDark', tag: 'wing' })); k.part = '';
  // 1874: neo-Renaissance stair tower in the courtyard
  k.part = 'v:tower1874'; { const cx = -LX + WD + 5, cz = CZ1 - 4; k.box('stoneLight', cx - 5, cx + 5, 0, 20, cz - 4, cz + 4, 'wing'); const g = welsch(10, 2.6, 1.6); const eg2 = new THREE.ExtrudeGeometry(g.s, { depth: 0.6, bevelEnabled: false, curveSegments: 10 }); eg2.rotateY(Math.PI / 2); eg2.translate(cx + 4.4, 20, cz); k.geo('stoneLight', eg2, 'wing');
    FL.concat([[13.8, 16.4], [17.2, 19.2]]).forEach(f => k.winX(cx + 5, 1, cz - 1.1, cz + 1.1, f[0], f[1], { mull: 0.75, frame: S, glass: 'glassDark', tag: 'wing' })); const sp = new THREE.ConeGeometry(1.4, 6, 8); sp.translate(cx - 3, 23, cz - 3); k.geo('slate', sp, 'wing'); } k.part = '';
  // 1945: wings burnt out, Johannbau a roofless shell
  k.part = 'v:ruin'; [[-LX, -LX + 1, LZ, CZ1], [-LX + WD - 1, -LX + WD, LZ, CZ1 - 10], [-LX, LX, CZ1 + WD - 1, CZ1 + WD], [-10, 12, CZ1, CZ1 + 1]].forEach(q => k.box('soot', q[0], q[1], 0, 4 + rand() * 9, q[2], q[3], 'wing'));
  for (let i = 0; i < 40; i++) { const x = -LX + rand() * 2 * LX, z = LZ + 2 + rand() * (CZ1 + WD - LZ - 4); if (x > -LX + WD + 2 && x < LX - 2 && z < CZ1 - 2) continue; k.box('soot', x, x + 1 + rand() * 3, 0, 0.5 + rand() * 1.8, z, z + 1 + rand() * 2.5, 'wing'); } k.part = '';
  /* ---------- Marienkirche (1506–23) next door ---------- */
  // nave in red brick with Gothic choir
  k.box('brick', 28, 66, 0, 16, -40, -16, 'marien'); k.geo('tilesRed', prism(28, 66, -40, -16, 16, 27, 0, 12), 'marien');
  // Gothic pointed nave windows (lancets)
  for (let x = 31; x < 64; x += 4.4) { const sh = new THREE.Shape(); sh.moveTo(-1.1, 0); sh.lineTo(1.1, 0); sh.lineTo(1.1, 9); sh.lineTo(0, 11); sh.lineTo(-1.1, 9); sh.closePath(); const g = new THREE.ShapeGeometry(sh); g.translate(x, 3, -15.97); k.geo('glassDark', g, 'marien'); }
  // high Gothic choir (polygonal apse)
  { const apsePts = [[28, -40], [22, -45], [17, -50], [22, -55], [28, -60], [34, -55], [40, -50], [34, -45]]; const apseSh = new THREE.Shape(); apsePts.forEach((p, i) => i ? apseSh.lineTo(p[0], p[1]) : apseSh.moveTo(p[0], p[1])); apseSh.closePath(); const apseG = new THREE.ExtrudeGeometry(apseSh, { depth: 20, bevelEnabled: false }); apseG.rotateX(-Math.PI / 2); apseG.translate(0, 0, 0); k.geo('brick', apseG, 'marien'); k.geo('tilesRed', (() => { const s2 = new THREE.Shape(apseSh.getPoints()); const e = new THREE.ExtrudeGeometry(s2, { depth: 2, bevelEnabled: false }); e.rotateX(-Math.PI / 2); e.translate(0, 20, 0); return e; })(), 'marien'); }
  // Marienkirche tower (brick, square, with square pyramidal spire)
  k.box('brick', 62, 72, 0, 34, -34, -22, 'marien'); { const s = new THREE.ConeGeometry(5.5, 14, 4); s.rotateY(Math.PI / 4); s.translate(67, 41, -28); k.geo('slate', s, 'marien'); }
  // Schlossplatz cobblestones
  k.box('cobble', -60, 26, 0, 0.04, -40, -12);
  // Mulde river to the east (lawn strip)
  k.box('lawn', -60, 60, 0, 0.03, 74, 82);
  [[-50, -30], [-40, 40], [-60, 20], [10, 75], [40, 75], [-30, 76]].forEach(q => tree(k, q[0], q[1], 1.1));
  for (let i = 0; i < 12; i++) person(k, -40 + rand() * 60, -30 + rand() * 14, rand() * 6.28);
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return { scene, center: new THREE.Vector3(0, 0, 18), span: 90, sunDist: 240, lamps: [], intro: { pos: [8, 16, 62], tgt: [0, 13, 6] },
    views: [{ label: 'The stair tower', cam: [8, 3.5, 40], tgt: [1, 14, 8] }, { label: 'The round gables', cam: [-55, 16, -26], tgt: [-20, 18, 0] }, { label: 'The palace courtyard', cam: [10, 30, 90], tgt: [-5, 8, 30] }],
    eras: [
      { year: '1533', title: 'A Renaissance wing', note: 'The princes Johann IV, Georg III and Joachim built the wing from about 1528; the stair tower is securely dated 1531–33. It is one of the first Renaissance buildings in central Germany.', show: ['v:altan'] },
      { year: 'c. 1650', title: 'A four-wing palace', note: 'From 1571 the palace grew into a four-wing complex around a courtyard, with rows of round dormer gables and spired stair towers. The other wings are reconstructed from a 17th-century drawing.', show: ['v:wingN', 'v:wingsRen', 'v:altan'] },
      { year: '1753', title: 'Knobelsdorff\'s baroque palace', note: 'Prince Leopold pulled down the north wing in 1708. From 1748 to 1753 Georg Wenzeslaus von Knobelsdorff remodelled the palace; the Johannbau was kept, against his plans.', show: ['v:wingsBar', 'v:altan'] },
      { year: '1900', title: 'A raised roof, a new stair tower', note: 'In 1812–13 the Johannbau got an extra storey and lost its round gables. In 1874 a neo-Renaissance stair tower was added in the courtyard.', hide: ['jbTop'], show: ['v:jbRaised', 'v:wingsBar', 'v:tower1874'] },
      { year: '1945', title: 'Destroyed', note: 'On 7 March 1945 bombs set the palace on fire. The east and south wings were almost completely destroyed and later blown up; the Johannbau survived as a ruin and got an emergency roof only in 1957.', hide: ['jbTop'], show: ['v:ruin'], mats: { white: 'soot', cream: 'soot' } },
      { year: 'today', title: 'Restored', note: 'Restored from 1990 to 1997 and 2001 to 2005 with its round-arched gables, the Johannbau has been the Museum of Town History since August 2005.' }
    ],
    facts: [
      { id: 'tower', title: 'The Wendelstein of 1531–33', year: '1528–33', pos: [TX, 41.5, TZ], cam: [8, 3.5, 40], tgt: [1, 14, 8],
        text: 'Building began around 1528 under the princely brothers Johann IV, Georg III and Joachim, and the wing is named after Johann IV. Its octagonal stair tower on the east side, rising from a balcony, is securely dated to 1531–33.',
        src: ['Wikipedia (de), Residenzschloss Dessau', 'https://de.wikipedia.org/wiki/Residenzschloss_Dessau'] },
      { id: 'gables', title: 'Round Renaissance gables', year: '16th century', pos: [-LX - 0.6, E + eg.top + 1, 0], cam: [-55, 16, -26], tgt: [-20, 18, 0],
        text: 'Balls and lily friezes on the round-arched gables, windows and portals mark the step from late Gothic to Renaissance. The gables were taken down in 1812–13, when the roof was raised, and rebuilt during the restoration.',
        src: ['Wikipedia (de), Residenzschloss Dessau', 'https://de.wikipedia.org/wiki/Residenzschloss_Dessau'] },
      { id: 'wing', title: 'The last wing of the palace', year: '1571–1945', pos: [-12, E + 2, LZ + 30], cam: [10, 30, 90], tgt: [-5, 8, 30],
        text: 'The Johannbau was the west wing of a palace that grew to four wings from 1571, became a three-wing baroque palace under Knobelsdorff, and burned on 7 March 1945. Use the time slider to see the lost wings.',
        src: ['Wikipedia (de), Residenzschloss Dessau', 'https://de.wikipedia.org/wiki/Residenzschloss_Dessau'] },
      { id: 'museum', title: 'Museum of town history', year: '2005', pos: [12, 13, LZ + 0.6], cam: [8, 16, 62], tgt: [0, 12, 0],
        text: 'After restorations from 1990 to 1997 and 2001 to 2005, the Johannbau reopened in August 2005 as the Museum of Town History. Its exhibition covers 800 years of history and culture in Dessau and Anhalt.',
        src: ['Visit Dessau', 'https://www.visitdessau.com/en/art-and-culture/museums-and-galleries/'] },
      { id: 'marien', title: 'The Marienkirche', year: '1506–23', pos: [47, 28, -28], cam: [70, 20, 20], tgt: [47, 12, -28],
        text: 'Next door stands the Marienkirche, built 1506–23. It was destroyed in the war and reconstructed in the 1990s.',
        src: ['Britannica', 'https://britannica.com/print/article/159343'] }
    ] };

}
