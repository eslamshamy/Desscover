/* ================================================================
   Marienkirche (marien)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['marien'] = {
  meta: { id: 'marien', years: '1506–23', name: 'Marienkirche', sub: 'Late Gothic hall church', lat: 51.833532, lon: 12.24699, build: buildMarien, label: 'Marienkirche Dessau', meta: 'Palace and town church, 1506–23; tower 1551–54; rebuilt 1989–98', lead: 'The former palace and town church beside the Johannbau, burnt out in 1945 and rebuilt as a venue. The footprint follows OpenStreetMap and the facades follow photographs. Click the numbers to learn its story.' },
  token(k) {
    k.box('brick', -16.4, 18.6, 0, 15, -11, 12); k.box('brick', 18.6, 26.5, 0, 15, -7, 6); k.box('brick', 2.8, 11.7, 0, 8, -17.7, -11); k.box('brick', 4, 12.3, 0, 8, 12, 17.7); k.geo('tilesRed', prism(-16.7, 18.9, -11.5, 12.5, 15, 32, 3, 12)); k.box('brick', -27.4, -16.4, 0, 38, -4.3, 6.9); const o = new THREE.CylinderGeometry(4.2, 4.4, 7, 8); o.translate(-21.9, 41.5, 1.3); k.geo('white', o); const d = new THREE.SphereGeometry(4.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2); d.translate(-21.9, 45, 1.3); k.geo('slate', d);
  },
  quiz: [
    { q: 'When was the foundation stone of the Marienkirche laid?', o: ['1506', '1926', '1858', '1200'], a: 0, e: 'Prince Ernst laid it on 25 May 1506; the church was consecrated in 1523.' }
  ]
};

function buildMarien() {
  // the long axis runs along x (turned to the real footprint); the tower stands at the west end
  const k = new Kit(), B = 'redBrick', S = 'stoneLight', T = 'tilesRed';
  const P = { x0: -76, x1: 68, z0: -60, z1: 60 };
  k.box('paving', P.x0, P.x1, -0.12, 0, P.z0, P.z1);
  const NX0 = -16.4, NX1 = 18.6, HZ0 = -11, HZ1 = 12, HC = 0.5, HZ = 11.5, EH = 15;
  // the hall and the rounded ambulatory choir
  k.box(S, NX0, NX1, 0, 0.9, HZ0, HZ1, 'hall'); k.box(B, NX0, NX1, 0.9, EH, HZ0, HZ1, 'hall');
  // the two side annexes near the choir, as in the real outline
  [[2.8, 11.7, -17.7, HZ0], [4.0, 12.3, HZ1, 17.7]].forEach(q => { k.box(B, q[0], q[1], 0, 8, q[2], q[3], 'hall'); gableRoof(k, T, q[0] - 0.2, q[1] + 0.2, q[2] < 0 ? q[2] - 0.3 : q[2], q[3] > 0 ? q[3] + 0.3 : q[3], 8, 4.6, false, 'hall'); const sd = q[2] < 0 ? -1 : 1, zf = sd < 0 ? q[2] : q[3]; gothWin(k, 'z', zf, sd, (q[0] + q[1]) / 2, 1.8, 1.8, 4.6, 'hall'); [q[0] + 1.6, q[1] - 1.6].forEach(x => gothWin(k, 'z', zf, sd, x, 2.4, 0.9, 2.8, 'hall')); });
  { const c = new THREE.CylinderGeometry(9.05, 9.05, EH, 5, 1, false, 0, Math.PI); c.scale(0.93, 1, 1); c.translate(NX1, EH / 2, -0.75); k.geo(B, c, 'hall'); }
  k.part = 'roof';
  gableRoof(k, T, NX0 - 0.3, NX1 + 0.1, HZ0 - 0.5, HZ1 + 0.5, EH, 17, true, 'hall');
  { const r = new THREE.ConeGeometry(9.5, 14, 5, 1, false, 0, Math.PI); r.scale(0.93, 1, 1); r.translate(NX1, EH + 7, -0.75); k.geo(T, r, 'hall'); }
  [[-11, 4.2], [-4, 4.2], [3, 4.2], [10, 4.2], [-7.5, 7.8], [-0.5, 7.8], [6.5, 7.8]].forEach(([x, dz]) => [-1, 1].forEach(sd => { const z = HC + sd * (HZ - dz), y = EH + (17 * dz / HZ) - 1.4; k.box(B, x - 0.6, x + 0.6, y, y + 1.3, z - 0.6, z + 0.6, 'hall'); k.geo(T, prism(x - 0.8, x + 0.8, z - 0.8, z + 0.8, y + 1.3, y + 2.0, 0, 0.8), 'hall'); }));
  { const f = new THREE.CylinderGeometry(0.9, 1.0, 2.6, 8); f.translate(12, EH + 17.6, HC); k.geo('slate', f, 'hall'); const sp = new THREE.ConeGeometry(1.05, 9.5, 8); sp.translate(12, EH + 23.6, HC); k.geo('slate', sp, 'hall'); }
  k.part = '';
  // buttresses and tall pointed tracery windows round the hall and the choir
  [-13, -7, -1, 15].forEach(x => [-1, 1].forEach(sd => { const zw = sd > 0 ? HZ1 : HZ0; k.box(B, x - 0.6, x + 0.6, 0, EH - 1.5, sd > 0 ? zw : zw - 1.4, sd > 0 ? zw + 1.4 : zw, 'hall'); pinnacle(k, B, x, EH - 1.5, zw + sd * 0.7, 1.6, 0.7, 'hall'); }));
  [-10, -4, 17].forEach(x => [-1, 1].forEach(sd => gothWin(k, 'z', sd > 0 ? HZ1 : HZ0, sd, x, 3.0, x > 16 ? 2.0 : 3.0, 9.6, 'hall')));
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i + 0.5) / 5 * Math.PI, x = NX1 + Math.cos(a) * 9.05 * 0.93 * 0.95, z = -0.75 + Math.sin(a) * 9.05 * 0.95, nx = Math.cos(a) / 0.93, nz = Math.sin(a), ln = Math.hypot(nx, nz), g = new THREE.ShapeGeometry(pointedShape(2.2, 9), 8); g.rotateY(Math.atan2(nx / ln, nz / ln)); g.translate(x + nx / ln * 0.25, 3.2, z + nz / ln * 0.25); k.geo('glassDark', g, 'hall'); }
  for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i / 5 * Math.PI, x = NX1 + Math.cos(a) * (9.05 * 0.93 + 0.5), z = -0.75 + Math.sin(a) * (9.05 + 0.5); k.box(B, x - 0.6, x + 0.6, 0, EH - 1.5, z - 0.6, z + 0.6, 'hall'); }
  // the west tower: brick shaft with a clock, a white octagonal belfry, a dark bell-shaped dome and lantern
  const TX0 = -27.4, TX1 = NX0, TH = 5.6, TZC = 1.3, TC = (TX0 + TX1) / 2;
  k.box(S, TX0 - 0.1, TX1, 0, 1.0, TZC - TH - 0.1, TZC + TH + 0.1, 'tower'); k.box(B, TX0, TX1, 1.0, EH, TZC - TH, TZC + TH, 'tower');
  gothWin(k, 'x', TX0, -1, TZC, 1.0, 2.6, 5.0, 'tower', 'wood');
  // the princely crypt portal of 1850–52 on the north side
  { k.box(S, TC - 2.4, TC + 2.4, 0, 6.2, TZC - TH - 0.5, TZC - TH, 'crypt'); gothWin(k, 'z', TZC - TH - 0.5, -1, TC, 0.4, 2.2, 4.4, 'crypt', 'wood'); const gb = new THREE.Shape(); gb.moveTo(-2.4, 0); gb.lineTo(2.4, 0); gb.lineTo(0, 3.2); gb.closePath(); const g = new THREE.ExtrudeGeometry(gb, { depth: 0.5, bevelEnabled: false }); g.rotateY(Math.PI); g.translate(TC, 6.2, TZC - TH); k.geo(S, g, 'crypt'); }
  k.part = 'tower';
  k.box(B, TX0, TX1, EH, 38, TZC - TH, TZC + TH, 'tower'); [EH, 25, 33].forEach(y => k.box(S, TX0 - 0.15, TX1 + 0.1, y, y + 0.4, TZC - TH - 0.15, TZC + TZC + TH + 0.15, 'tower'));
  [[18, 2.0, 5.2], [33.8, 1.6, 3.6]].forEach(([y, w, h]) => { gothWin(k, 'x', TX0, -1, TZC, y, w, h, 'tower'); gothWin(k, 'z', TZC - TH, -1, TC, y, w, h, 'tower'); gothWin(k, 'z', TZC + TH, 1, TC, y, w, h, 'tower'); });
  clockFaces(k, TC, 28.6, TZC, TH, 1.7, 'bauRed', 'copper', 'tower');
  k.box(S, TX0 - 0.35, TX1 + 0.35, 38, 38.6, TZC - TH - 0.35, TZC + TH + 0.35, 'tower');
  { const o = new THREE.CylinderGeometry(4.2, 4.4, 7, 8); o.rotateY(Math.PI / 8); o.translate(TC, 42.1, TZC); k.geo('white', o, 'tower');
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, sh = new THREE.Shape(); sh.moveTo(-0.7, 0); sh.lineTo(0.7, 0); sh.lineTo(0.7, 2.6); sh.absarc(0, 2.6, 0.7, 0, Math.PI, false); sh.closePath(); const w = new THREE.ShapeGeometry(sh, 8); w.rotateY(Math.PI / 2 - a); w.translate(TC + Math.cos(a) * 4.16, 40.4, TZC - Math.sin(a) * 4.16); k.geo('dark', w, 'tower'); }
    k.box('white', TC - 4.6, TC + 4.6, 45.6, 46.1, TZC - 4.6, TZC + 4.6, 'tower');
    const prof = [[0, 0], [4.3, 0], [4.4, 0.6], [4.0, 1.9], [3.0, 3.4], [1.9, 4.6], [1.2, 5.4], [1.15, 5.8], [0, 5.9]].map(p => new THREE.Vector2(p[0], p[1]));
    const d = new THREE.LatheGeometry(prof, 16); d.translate(TC, 46.1, TZC); k.geo('slate', d, 'tower');
    const l = new THREE.CylinderGeometry(1.1, 1.2, 2.4, 8); l.translate(TC, 53.1, TZC); k.geo('white', l, 'tower');
    const c2 = new THREE.LatheGeometry([[0, 0], [1.3, 0], [1.0, 0.9], [0.4, 1.8], [0.15, 2.4], [0, 2.5]].map(p => new THREE.Vector2(p[0], p[1])), 12); c2.translate(TC, 54.3, TZC); k.geo('slate', c2, 'tower');
    k.box('copper', TC - 0.05, TC + 0.05, 56.8, 58.2, TZC - 0.05, TZC + 0.05, 'tower'); const bl = new THREE.SphereGeometry(0.22, 10, 8); bl.translate(TC, 57.2, TZC); k.geo('copper', bl, 'tower'); }
  k.part = '';
  // 1523: the hall consecrated, the tower still a stump under a low roof
  k.part = 'v:stump'; k.geo(T, prism(TX0 - 0.3, TX1 + 0.3, TZC - TH - 0.3, TZC + TH + 0.3, EH, EH + 4, TH, TH), 'tower'); k.part = '';
  // 1945: burnt out, the roofs gone, only the walls, the pillars and the tower left
  k.part = 'v:ruin';
  for (let x = NX0 + 4; x < NX1; x += 7) [HC - 4, HC + 4].forEach(z => k.box('soot', x - 0.7, x + 0.7, 0, 13 + rand() * 2, z - 0.7, z + 0.7, 'ruin'));
  for (let i = 0; i < 30; i++) { const x = NX0 + 1 + rand() * (NX1 - NX0 + 6), z = HZ0 + 2 + rand() * (HZ1 - HZ0 - 4); k.box('soot', x, x + 1 + rand() * 2.5, 0.9, 1.4 + rand() * 1.8, z, z + 1 + rand() * 2); }
  k.part = '';
  // the real surroundings: streets on both sides, the blocks to the north, the Johannbau to the east, the square to the south
  realContext(k, 'marien', P, { own: [-29, 29, -19, 19] });
  for (let i = 0; i < 14; i++) person(k, -10 + rand() * 30, 24 + rand() * 14, rand() * 6.28);
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return { scene, center: new THREE.Vector3(-4, 0, 0), span: 80, sunDist: 240, lamps: [], intro: { pos: [-64, 24, 52], tgt: [-6, 20, 0] },
    views: [{ label: 'The west front', cam: [-70, 4, 8], tgt: [TC, 26, 0] }, { label: 'The tower top', cam: [-44, 58, 32], tgt: [TC, 48, 0] }, { label: 'The choir', cam: [56, 8, 30], tgt: [20, 14, 0] }, { label: 'The crypt portal', cam: [TC - 4, 2.5, -28], tgt: [TC, 4, TZC - TH] }],
    eras: [
      { year: '1523', title: 'Consecrated', note: 'The hall church as consecrated in October 1523. The west tower was only built in 1551–54, so it is shown here as a stump.', hide: ['tower'], show: ['v:stump'] },
      { year: '1945', title: 'Burnt out', note: 'On 7 March 1945 fire and explosive bombs burnt the church out. Only the tower, the outer walls and the inner pillars survived; the ruin stood as a memorial for decades.', hide: ['roof'], show: ['v:ruin'] },
      { year: 'today', title: 'A place for the arts', note: 'Rebuilt in 1989–98 as a venue for concerts, theatre and exhibitions; home to the Mitteldeutsches Theater since 2022.' }
    ],
    facts: [
      { id: 'hall', title: 'A late Gothic hall church', year: '1506–23', pos: [-2, EH + 18, 0], cam: [-64, 24, 52], tgt: [-6, 20, 0],
        text: 'Prince Ernst of Anhalt-Dessau laid the foundation stone on 25 May 1506 for a three-aisled late Gothic brick hall church with an ambulatory choir and a west tower. It replaced a Romanesque church and was consecrated in October 1523 by Cardinal Albrecht of Mainz and Magdeburg.',
        src: ['L-IZ, Umnutzung in Dessau: Marienkirche', 'https://www.l-iz.de/bildung/zeitreise/2021/12/umnutzung-in-dessau-marienkirche-vom-gotteshaus-zum-musentempel-425691'] },
      { id: 'tower', title: 'The tower and the princes’ crypt', year: '1551–1852', pos: [TC, 59, 0], cam: [-70, 4, 8], tgt: [TC, 26, 0],
        text: 'The west tower followed in 1551–54. As palace and town church, St. Mary’s was the burial place of the Dessau princes: a crypt was built in the tower’s ground floor in 1848–50, and its portal on the tower’s north side in 1850–52.',
        src: ['L-IZ and komoot', 'https://www.l-iz.de/bildung/zeitreise/2021/12/umnutzung-in-dessau-marienkirche-vom-gotteshaus-zum-musentempel-425691'] },
      { id: 'ruin', title: 'Burnt out in 1945', year: '1945', pos: [18, EH + 2, HZ1 + 1.6], cam: [56, 8, 30], tgt: [20, 14, 0],
        text: 'Fire and explosive bombs on 7 March 1945 destroyed the church down to its outer walls. For decades the ruin was left as a memorial against war and destruction.',
        src: ['L-IZ, Umnutzung in Dessau: Marienkirche', 'https://www.l-iz.de/bildung/zeitreise/2021/12/umnutzung-in-dessau-marienkirche-vom-gotteshaus-zum-musentempel-425691'] },
      { id: 'venue', title: 'Bare brick and fieldstone', year: '1989–98', pos: [-4, 10, HZ0 - 1.6], cam: [-20, 6, -54], tgt: [-4, 10, HZ0],
        text: 'In 1983 the parish leased the ruin to the city for 99 years, and it was rebuilt from 1989 to 1998 as a place for concerts, theatre and exhibitions. Inside, the walls show their bare brick and fieldstone.',
        src: ['L-IZ, Umnutzung in Dessau: Marienkirche', 'https://www.l-iz.de/bildung/zeitreise/2021/12/umnutzung-in-dessau-marienkirche-vom-gotteshaus-zum-musentempel-425691'] },
      { id: 'theatre', title: 'A theatre in the church', year: '2022', pos: [TC, 8, TZC - TH - 1.2], cam: [TC - 4, 2.5, -28], tgt: [TC, 4, TZC - TH],
        text: 'Since September 2022 the church has been home to the Mitteldeutsches Theater, founded by Dessau-born Dieter Hallervorden.',
        src: ['myCityHunt, Marienkirche', 'https://www.mycityhunt.co.uk/cities/dessau-rosslau-de-946/poi/marienkirche-25562'] }
    ] };
}
