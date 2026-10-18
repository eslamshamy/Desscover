/* ================================================================
   Rathaus (rathaus)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['rathaus'] = {
  meta: { id: 'rathaus', years: '1898–1901', name: 'Rathaus', sub: 'Reinhardt & Süßenguth, 1901', lat: 51.834554, lon: 12.246864, build: buildRathaus, label: 'Rathaus Dessau', meta: 'Reinhardt & Süßenguth, 1898–1901, rebuilt 1949–52', lead: 'The town hall and its 73 m tower, the tallest in the city. Shown in its post-war form, with a flatter roof and no gables.' },
  token(k) {
    k.box('stone', -30, 30, 0, 18.5, -24, -12); k.box('stone', -30, 30, 0, 18.5, 12, 24); k.box('stone', -30, -18, 0, 18.5, -12, 12); k.box('stone', 18, 30, 0, 18.5, -12, 12); k.box('stone', -16.5, -7.5, 0, 41, -24.5, -15.5); const d = new THREE.ConeGeometry(4, 30, 8); d.translate(-12, 56, -20); k.geo('copper', d);
  },
  quiz: [
    { q: 'How tall is the town hall tower?', o: ['73 m', '41 m', '105 m', '159 m'], a: 0, e: 'It is the tallest tower in Dessau-Roßlau. 159 is the number of steps.' }
  ]
};

function buildRathaus() {
  const k = new Kit();
  const X0 = -30, X1 = 30, Z0 = -24, Z1 = 24, D = 12, EAVE = 18.5;
  const wings = [[X0, X1, Z0, Z0 + D, true], [X0, X1, Z1 - D, Z1, true], [X0, X0 + D, Z0 + D, Z1 - D, false], [X1 - D, X1, Z0 + D, Z1 - D, false]];
  wings.forEach((w, i) => { const tag = i === 0 ? 'built' : i === 3 ? 'police' : i === 1 ? 'fire1910' : 'oldhall';
    k.box('stone', w[0], w[1], 0, EAVE - 0.3, w[2], w[3], tag);
    k.box('stone', w[0] - 0.4, w[1] + 0.4, EAVE - 0.6, EAVE, w[4] ? w[2] - 0.4 : w[2] + 0.4, w[4] ? w[3] + 0.4 : w[3] - 0.4, tag);
  });
  // rusticated ground floor arcade for Ratskeller
  for (let x = -26; x <= 26; x += 4.5) {
    if (Math.abs(x) < 5.5) continue;
    const ash = new THREE.Shape(); ash.moveTo(-1.1, 0); ash.lineTo(1.1, 0); ash.lineTo(1.1, 2.0); ash.absarc(0, 2.0, 1.1, 0, Math.PI, false); ash.closePath();
    const ag = new THREE.ShapeGeometry(ash, 12); ag.translate(x, 1.2, Z0 - 0.08); k.geo('glassDark', ag, 'ratskeller');
    const ar = new THREE.RingGeometry(1.1, 1.45, 14, 1, 0, Math.PI); ar.translate(x, 3.2, Z0 - 0.12); k.geo('stone', ar, 'ratskeller');
  }
  // polygonal corner bay oriels (Erker) on the market facade
  [-20, 20].forEach(ex => {
    k.box('stone', ex - 1.8, ex + 1.8, 4.8, 5.8, Z0 - 1.6, Z0, 'built');
    for (let f = 0; f < 3; f++) {
      const y0 = 5.8 + f * 4.0, y1 = y0 + 3.6;
      k.box('stone', ex - 1.6, ex + 1.6, y0, y1, Z0 - 1.8, Z0, 'built');
      k.winZ(Z0 - 1.8, -1, ex - 1.2, ex + 1.2, y0 + 0.6, y1 - 0.3, { mull: 0.6, frame: 'stoneLight', tag: 'built' });
      k.winX(ex - 1.6, -1, Z0 - 1.5, Z0 - 0.3, y0 + 0.6, y1 - 0.3, { frame: 'stoneLight', tag: 'built' });
      k.winX(ex + 1.6, 1, Z0 - 1.5, Z0 - 0.3, y0 + 0.6, y1 - 0.3, { frame: 'stoneLight', tag: 'built' });
    }
    k.geo('copper', prism(ex - 1.8, ex + 1.8, Z0 - 2.0, Z0, 17.8, 20.8, 1.8, 1.8), 'built');
  });
  // grand neo-Renaissance entrance portal on Zerbster Straße
  k.box('stone', -4.2, 4.2, 0, 7.4, Z0 - 1.8, Z0, 'built');
  { const sh = new THREE.Shape(); sh.moveTo(-1.6, 0); sh.lineTo(1.6, 0); sh.lineTo(1.6, 3.8); sh.absarc(0, 3.8, 1.6, 0, Math.PI, false); sh.closePath();
    const g = new THREE.ShapeGeometry(sh, 16); g.translate(0, 0.4, Z0 - 1.84); k.geo('dark', g, 'built');
    const r = new THREE.RingGeometry(1.6, 2.2, 20, 1, 0, Math.PI); r.translate(0, 4.2, Z0 - 1.88); k.geo('stone', r, 'built');
  }
  k.box('wood', -1.4, 1.4, 0.4, 3.8, Z0 - 1.82, Z0 - 1.76, 'built');
  pedimentU(k, 'stone', -4.6, 4.6, 7.4, 2.6, Z0 - 1.8, 0.8, 'built');
  { const shield = new THREE.CircleGeometry(0.9, 16); shield.translate(0, 8.7, Z0 - 1.86); k.geo('copper', shield, 'built'); }
  for (let i = 0; i < 5; i++) k.box('stone', -5.2 - i * 0.3, 5.2 + i * 0.3, 0.9 - (i + 1) * 0.18, 0.9 - i * 0.18, Z0 - 2.2 - (i + 1) * 0.45, Z0, 'built');
  // courtyard historic 1563 Renaissance portal
  k.box('stone', -2.8, 2.8, 0, 5.4, Z0 + D, Z0 + D + 0.6, 'oldhall');
  { const sh = new THREE.Shape(); sh.moveTo(-1.2, 0); sh.lineTo(1.2, 0); sh.lineTo(1.2, 2.8); sh.absarc(0, 2.8, 1.2, 0, Math.PI, false); sh.closePath();
    const g = new THREE.ShapeGeometry(sh, 12); g.translate(0, 0.2, Z0 + D + 0.64); k.geo('dark', g, 'oldhall');
    const r = new THREE.RingGeometry(1.2, 1.6, 16, 1, 0, Math.PI); r.translate(0, 3.0, Z0 + D + 0.66); k.geo('stoneLight', r, 'oldhall');
  }
  pedimentU(k, 'stoneLight', -3.0, 3.0, 5.4, 1.8, Z0 + D + 0.6, 0.5, 'oldhall');
  // window grid across the four storeys
  const FL = [[1.2, 4.2], [5.6, 8.8], [10.0, 13.2], [14.4, 17.6]];
  for (let x = X0 + 2.6; x <= X1 - 2.6; x += 3.8) {
    if (Math.abs(x) < 4.2) continue;
    FL.forEach((f, fi) => {
      if (!(f[0] >= 5.6 && [-20, 20].some(ex => Math.abs(x - ex) < 1.8 + 0.95))) k.winZ(Z0, -1, x - 0.95, x + 0.95, f[0], f[1], { mull: 0.95, trans: [f[0] + 1.8], frame: 'stoneLight', glass: 'glassDark', tag: 'built' });
      k.winZ(Z1, 1, x - 0.95, x + 0.95, f[0], f[1], { mull: 0.95, trans: [f[0] + 1.8], frame: 'stoneLight', glass: 'glassDark', tag: 'fire1910' });
      const inCourt = x - 0.95 > X0 + D && x + 0.95 < X1 - D;
      if (inCourt) k.winZ(Z0 + D, 1, x - 0.95, x + 0.95, f[0], f[1], { mull: 0.95, frame: 'stoneLight', glass: 'glassDark', tag: 'oldhall' });
      if (inCourt) k.winZ(Z1 - D, -1, x - 0.95, x + 0.95, f[0], f[1], { mull: 0.95, frame: 'stoneLight', glass: 'glassDark', tag: 'fire1910' });
    });
  }
  for (let z = Z0 + D + 2; z <= Z1 - D - 2; z += 3.8) {
    FL.forEach(f => {
      k.winX(X0, -1, z - 0.95, z + 0.95, f[0], f[1], { mull: 0.95, frame: 'stoneLight', glass: 'glassDark', tag: 'oldhall' });
      k.winX(X1, 1, z - 0.95, z + 0.95, f[0], f[1], { mull: 0.95, frame: 'stoneLight', glass: 'glassDark', tag: 'police' });
      k.winX(X0 + D, 1, z - 0.95, z + 0.95, f[0], f[1], { mull: 0.95, frame: 'stoneLight', glass: 'glassDark', tag: 'oldhall' });
      k.winX(X1 - D, -1, z - 0.95, z + 0.95, f[0], f[1], { mull: 0.95, frame: 'stoneLight', glass: 'glassDark', tag: 'police' });
    });
  }
  // roofs: 1901 high pitched roofs vs 1949 flatter roofs
  k.part = 'v:roof1901';
  gableRoof(k, 'slate', X0 - 0.5, X1 + 0.5, Z0 - 0.5, Z0 + D + 0.5, EAVE, 11, true, 'built');
  gableRoof(k, 'slate', X0 - 0.5, X1 + 0.5, Z1 - D - 0.5, Z1 + 0.5, EAVE, 11, true, 'fire1910');
  gableRoof(k, 'slate', X0 - 0.5, X0 + D + 0.5, Z0 + D - 0.5, Z1 - D + 0.5, EAVE, 11, false, 'oldhall');
  gableRoof(k, 'slate', X1 - D - 0.5, X1 + 0.5, Z0 + D - 0.5, Z1 - D + 0.5, EAVE, 11, false, 'police');
  [-16, 0, 16].forEach(gx => {
    pedimentU(k, 'stone', gx - 3.4, gx + 3.4, EAVE, 7.8, Z0 - 0.3, 0.8, 'built');
    for (let f = 0; f < 2; f++) k.winZ(Z0 - 0.3, -1, gx - 1.0, gx + 1.0, EAVE + 1.5 + f * 3, EAVE + 3.8 + f * 3, { frame: 'stoneLight', glass: 'glassDark', tag: 'built' });
  });
  k.part = '';
  k.part = 'roofNow';
  gableRoof(k, 'slate', X0 - 0.4, X1 + 0.4, Z0 - 0.4, Z0 + D + 0.4, EAVE, 5.2, true, 'raid');
  gableRoof(k, 'slate', X0 - 0.4, X1 + 0.4, Z1 - D - 0.4, Z1 + 0.4, EAVE, 5.2, true, 'raid');
  gableRoof(k, 'slate', X0 - 0.4, X0 + D + 0.4, Z0 + D - 0.4, Z1 - D + 0.4, EAVE, 5.2, false, 'raid');
  gableRoof(k, 'slate', X1 - D - 0.4, X1 + 0.4, Z0 + D - 0.4, Z1 - D + 0.4, EAVE, 5.2, false, 'raid');
  k.part = '';
  // 1945 ruin
  k.part = 'v:ruin';
  for (let x = X0; x < X1; x += 3.2) { k.box('soot', x, x + 3.2, EAVE - 2, EAVE + 0.5 + rand() * 2.5, Z0 - 0.4, Z0 + 0.4, 'raid'); k.box('soot', x, x + 3.2, EAVE - 2, EAVE + 0.5 + rand() * 2.5, Z1 - 0.4, Z1 + 0.4, 'raid'); }
  for (let z = Z0; z < Z1; z += 3.2) { k.box('soot', X0 - 0.4, X0 + 0.4, EAVE - 2, EAVE + 0.5 + rand() * 2.5, z, z + 3.2, 'raid'); k.box('soot', X1 - 0.4, X1 + 0.4, EAVE - 2, EAVE + 0.5 + rand() * 2.5, z, z + 3.2, 'raid'); }
  k.part = '';
  // 73 m town hall tower
  const TX = X0 + 6, TZ = Z0 + 6, TS = 4.8;
  k.box('stone', TX - TS, TX + TS, 0, 41.2, TZ - TS, TZ + TS, 'tower');
  for (let y = 14; y < 34; y += 7) {
    if (y < EAVE) continue;
    k.winZ(TZ - TS, -1, TX - 1.1, TX + 1.1, y, y + 4.2, { mull: 1.1, frame: 'stoneLight', tag: 'tower' });
    k.winX(TX - TS, -1, TZ - 1.1, TZ + 1.1, y, y + 4.2, { mull: 1.1, frame: 'stoneLight', tag: 'tower' });
  }
  // belfry arched sound louvers
  [[-1, 0, Math.PI / 2, TX - TS - 0.04, TZ], [1, 0, -Math.PI / 2, TX + TS + 0.04, TZ],
   [0, -1, 0, TX, TZ - TS - 0.04], [0, 1, Math.PI, TX, TZ + TS + 0.04]].forEach(([dx, dz, ry, cx, cz]) => {
    const sh = new THREE.Shape(); sh.moveTo(-1.2, 0); sh.lineTo(1.2, 0); sh.lineTo(1.2, 3.6); sh.absarc(0, 3.6, 1.2, 0, Math.PI, false); sh.closePath();
    const g = new THREE.ShapeGeometry(sh, 12); g.rotateY(ry); g.translate(cx, 35.8, cz); k.geo('dark', g, 'tower');
  });
  // viewing platform at 41.24 m with corner turrets and balustrade
  k.box('stone', TX - TS - 0.5, TX + TS + 0.5, 41.2, 41.8, TZ - TS - 0.5, TZ + TS + 0.5, 'tower');
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(c => {
    const x = TX + c[0] * (TS + 0.1), z = TZ + c[1] * (TS + 0.1);
    const t = new THREE.CylinderGeometry(0.7, 0.7, 4.2, 10); t.translate(x, 43.9, z); k.geo('stone', t, 'tower');
    const cn = new THREE.ConeGeometry(0.9, 3.0, 10); cn.translate(x, 47.5, z); k.geo('copper', cn, 'tower');
  });
  rails(k, 'frame', [[TX - TS, TZ - TS], [TX + TS, TZ - TS], [TX + TS, TZ + TS], [TX - TS, TZ + TS], [TX - TS, TZ - TS + 0.01]], 41.8, [0.5, 1.0], 'tower');
  // octagonal belfry & clock level
  const oct = new THREE.CylinderGeometry(3.4, 3.6, 6.5, 8); oct.translate(TX, 45.1, TZ); k.geo('stone', oct, 'tower');
  // copper dome, lantern and spire reaching 73 m
  const prof = [[3.7, 48.3], [3.9, 49.0], [3.6, 51.0], [2.8, 53.2], [1.6, 55.0], [1.2, 55.6], [1.2, 59.0], [1.6, 59.4], [1.3, 61.0], [0.6, 62.5], [0.25, 64], [0.08, 72.6], [0.0, 73.0]].map(p => new THREE.Vector2(p[0], p[1]));
  const dome = new THREE.LatheGeometry(prof, 24); dome.translate(TX, 0, TZ); k.geo('copper', dome, 'tower');
  // the peace bell on the square
  const bellProf = [[0.05, 0], [0.55, 0.05], [0.5, 0.25], [0.4, 0.7], [0.32, 1.0], [0.0, 1.05]].map(p => new THREE.Vector2(p[0], p[1]));
  const bell = new THREE.LatheGeometry(bellProf, 20); bell.translate(12, 1.6, Z0 - 10); k.geo('copper', bell, 'bell');
  k.box('frame', 10.6, 10.8, 0, 3.0, Z0 - 10.1, Z0 - 9.9, 'bell'); k.box('frame', 13.2, 13.4, 0, 3.0, Z0 - 10.1, Z0 - 9.9, 'bell'); k.box('frame', 10.6, 13.4, 3.0, 3.2, Z0 - 10.1, Z0 - 9.9, 'bell');
  // market square and streetscape
  const P = { x0: -70, x1: 70, z0: -70, z1: 60 };
  k.box('lawn', P.x0, P.x1, -0.12, 0, P.z0, P.z1);
  k.box('cobble', P.x0, P.x1, 0, 0.04, P.z0, Z0 - 2); k.box('paving', X0 - 6, X1 + 6, 0, 0.05, Z0 - 2, Z1 + 6);
  k.box('asphalt', X1 + 6, X1 + 16, 0, 0.03, Z0 - 2, P.z1); k.box('asphalt', P.x0, X0 - 6, 0, 0.03, Z0 - 2, P.z1);
  for (let x = -60; x <= 60; x += 15) tree(k, x, -60 + rand() * 4, 1);
  [[-50, 30], [-48, 45], [52, 40], [55, 25]].forEach(q => tree(k, q[0], q[1], 1.1));
  [[-20, -38], [20, -38], [-40, -50], [40, -50]].forEach(q => lamp(k, q[0], q[1]));
  for (let i = 0; i < 22; i++) person(k, -55 + rand() * 110, -64 + rand() * 34, rand() * 6.28);
  const grp = k.build();
  // 4 clock dials on the four faces of the tower
  const rc = document.createElement('canvas'); rc.width = rc.height = 256; const rt = new THREE.CanvasTexture(rc); rt.colorSpace = THREE.SRGBColorSpace;
  RATHAUS_CLOCK = { canvas: rc, tex: rt };
  [[-1, 0, Math.PI / 2, TX - TS - 0.06, TZ], [1, 0, -Math.PI / 2, TX + TS + 0.06, TZ],
   [0, -1, 0, TX, TZ - TS - 0.06], [0, 1, Math.PI, TX, TZ + TS + 0.06]].forEach(([dx, dz, ry, cx, cz]) => {
    const dial = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshStandardMaterial({ map: rt, roughness: 0.5 }));
    dial.rotation.y = ry; dial.position.set(cx, 44.2, cz); dial.userData.fact = 'tower'; dial.userData.part = 'tower'; grp.add(dial);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.75, 32), MAT.stone);
    ring.rotation.y = ry; ring.position.set(cx + dx * 0.01, 44.2, cz + dz * 0.01); ring.userData.part = 'tower'; grp.add(ring);
  });
  drawClock(timeNow);
  const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp);
  plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  const extra = {
    eras: [
      { year: '1901', title: 'As built', note: 'Completed in 1901 with high pitched roofs and gables towards the market.', hide: ['roofNow'], show: ['v:roof1901'] },
      { year: '1945', title: 'Burnt out', note: 'The upper floor burned out in the air raid of 7 March 1945.', hide: ['roofNow'], show: ['v:ruin'], mats: { stone: 'soot', glass: 'none', slate: 'soot' } },
      { year: 'today', title: 'Rebuilt 1949–52', note: 'Rebuilt without the gables and with a flatter roof.' }
    ],
    views: [{ label: 'From the market', cam: [10, 8, -70], tgt: [0, 14, -10] }, { label: 'The tower', cam: [-40, 50, -55], tgt: [TX, 42, TZ] }, { label: 'The courtyard', cam: [0, 22, 10], tgt: [-2, 2, -10] }],
    hiddenFacts: [
      { id: 'ratskeller', title: 'The Ratskeller', year: '1949', pos: [16, 0.9, Z0 - 0.5], cam: [22, 3, -42], tgt: [14, 1.5, -24], hint: 'Look at the foot of the front wing.',
        text: 'The Ratskeller in the basement reopened on 1 March 1949 as Dessau’s first state-run HO restaurant, called Freie Gaststätte am Markt, and later took back its old name.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Rathaus_Dessau'] }
    ]
  };
  return {
    ...extra, scene, center: new THREE.Vector3(0, 0, 0), span: 90, sunDist: 260, lamps: [[-20, -38], [20, -38], [-40, -50], [40, -50]].map(q => new THREE.Vector3(q[0], 4.85, q[1])),
    intro: { pos: [-75, 60, -110], tgt: [-4, 14, 0] },
    facts: [
      { id: 'built', title: 'A new town hall for 1901', year: '1898–1901', pos: [0, 7, Z0 - 1.2], cam: [10, 8, -70], tgt: [0, 14, -10],
        text: 'The council decided on a new town hall in April 1895. The foundation stone was laid on 29 April 1899, the birthday of Duke Friedrich I. The Charlottenburg architects Reinhardt and Süßenguth designed it in the neo-Renaissance style, and it cost about 1.25 million marks.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Rathaus_Dessau'] },
      { id: 'tower', title: '159 steps up', year: '1901', pos: [TX, 45, TZ - 4.9], cam: [-40, 50, -55], tgt: [TX, 42, TZ],
        text: 'At 73 m the tower is the tallest in Dessau-Roßlau. 159 steps lead to a viewing platform at 41.24 m. It was originally 75 m tall, but after storms damaged the building in 1901 lighter copper ornaments replaced the heavier ones, and it lost some height.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Rathaus_Dessau'] },
      { id: 'fire1910', title: 'The fire of 1910', year: '1910–12', pos: [10, 24, Z1 - 6], cam: [40, 45, 70], tgt: [0, 15, 10],
        text: 'On the evening of 2 April 1910, less than ten years after completion, fire destroyed large parts of the building. Thousands of files stored in the attic burned, including records back to the Thirty Years’ War and the town hall’s own drawings. The same architects rebuilt it, and the council chamber reopened on 3 May 1912.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Rathaus_Dessau'] },
      { id: 'raid', title: 'Rebuilt in a simpler form', year: '1945–52', pos: [-18, 24, Z1 - 6], cam: [-55, 40, 65], tgt: [-5, 16, 8],
        text: 'In the heaviest air raid on Dessau, on 7 March 1945, the upper floor burned out, but the ground floor and the Ratskeller survived. The city administration started work here again in July 1945. The rebuild of 1949 to 1952 left out the gables and replaced the high roof with a flatter one.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Rathaus_Dessau'] },
      { id: 'oldhall', title: 'Older town halls', year: '1323–1563', pos: [-4, 4.4, Z0 + D + 0.9], cam: [0, 22, 10], tgt: [-2, 2, -10],
        text: 'A town council is first documented in Dessau in 1323. The town hall that stood here before this one dated from 1563. When it was demolished in 1899, its tower portal and the Ratskeller portal were rebuilt in the courtyard of the new building.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Rathaus_Dessau'] },
      { id: 'police', title: 'Fire station and police', year: '1934–35', pos: [X1 + 0.6, 9, 4], cam: [62, 10, 12], tgt: [X1, 9, 2],
        text: 'In 1934 and 1935 the east wing was extended. The building then also housed the savings bank, the fire station and a police station. Firefighters’ helmets over the old courtyard gates and iron grilles on the ground floor still recall them.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Rathaus_Dessau'] },
      { id: 'bell', title: 'The peace bell', year: '2002', pos: [12, 4, Z0 - 10], cam: [18, 3, Z0 - 22], tgt: [12, 2.2, Z0 - 10],
        text: 'Since 9 November 2002 a peace bell has stood in front of the town hall, remembering the peaceful revolution of 1989 in the GDR. It carries the words “Keine Gewalt”, no violence, and has become a meeting point for peace prayers.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Rathaus_Dessau'] }
    ]
  };
}
