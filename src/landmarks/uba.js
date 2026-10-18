/* ================================================================
   Umweltbundesamt (uba)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['uba'] = {
  meta: { id: 'uba', years: '2005', name: 'Umweltbundesamt', sub: 'sauerbruch hutton, 2005', lat: 51.842443, lon: 12.239592, build: buildUBA, label: 'Umweltbundesamt (German Environment Agency)', meta: 'Sauerbruch Hutton, completed 2005', lead: 'A long, colourful office loop on the old gasworks site, built as a model of ecological construction.' },
  token(k) {
    const U = ubaPlan(); bandChunks(k, U.pts, U.W, 0, 15.6, 'larch'); extrudeXZ(k, 'glass', U.court, 15.2, 16.6); const c = new THREE.CylinderGeometry(1, 1, 16.4, 32); c.scale(17.8, 1, 12.5); c.translate(U.E[0], 8.2, U.E[1]); k.geo('pvPanel', c);
  },
  quiz: [
    { q: 'Which architects designed the Umweltbundesamt?', o: ['Sauerbruch Hutton', 'addenda architects', 'Walter Gropius', 'Zaha Hadid'], a: 0, e: 'Matthias Sauerbruch and Louisa Hutton, completed in 2005.' }
  ]
};

function buildUBA() {
  const U = ubaPlan(), { ax, az, W, pts, nor, court, axis, E } = U, k = new Kit();
  const P = { x0: ax(690), x1: ax(1660), z0: az(60), z1: az(1070) };
  const pxP = a => a.map(q => [ax(q[0]), az(q[1])]);
  const boxP = (m, u0, u1, y0, y1, v0, v1, tag) => k.box(m, ax(u0), ax(u1), y0, y1, az(v0), az(v1), tag);
  parkGround(k, P);
  const FH = 3.7, NF = 4, H = FH * NF;
  // the office snake: larch spandrels and window bands, a larch fascia and a green roof
  for (let f = 0; f < NF; f++) { bandChunks(k, pts, W, f * FH, f * FH + 1.15, 'larch', 'facade'); bandChunks(k, pts, W - 0.7, f * FH + 1.15, (f + 1) * FH, 'glassDark', 'snake'); }
  bandChunks(k, pts, W + 0.3, H, H + 0.7, 'larch', 'snake'); bandChunks(k, pts, W - 1.2, H + 0.7, H + 0.8, 'greenRoof', 'roof');
  // coloured glass: greens on the outside facing the park to the north and west, reds and oranges facing east and south, paler colours to the atrium
  const COOL = ['cgGreen', 'cgTeal', 'cgBlue', 'cgLime', 'cgViolet', 'cgWhite'], WARM = ['cgRed', 'cgOrange', 'cgYellow', 'cgWhite', 'cgOrange', 'cgRed'], INN = ['cgWhite', 'cgLime', 'cgYellow', 'cgGrey', 'cgTeal'];
  for (let i = 0; i < pts.length - 1; i++) {
    const seg = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]), cnt = Math.max(1, Math.round(seg / 2.3));
    const nx = nor[i][0], nz = nor[i][1], ang = Math.atan2(-(pts[i + 1][1] - pts[i][1]), pts[i + 1][0] - pts[i][0]);
    const warm = (-nx) * 1 + (-nz) * 0.6 > 0;          // outward face looking east or south
    for (let c = 0; c < cnt; c++) {
      const u = (c + 0.5) / cnt, x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, z = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u;
      for (let f = 0; f < NF; f++) { const h = (i * 7 + c * 3 + f * 5) % 9, y = f * FH + 1.15 + (FH - 1.15) / 2;
        if (h < 6) { const pal = warm ? WARM : COOL; rotBox(k, pal[(i * 3 + c * 5 + f * 2) % pal.length], 1.05, FH - 1.55, 0.07, x - nx * (W / 2 - 0.3), y, z - nz * (W / 2 - 0.3), ang, 'facade'); }
        if (h % 2 === 0) rotBox(k, INN[(i + c + f) % INN.length], 1.05, FH - 1.55, 0.07, x + nx * (W / 2 - 0.3), y, z + nz * (W / 2 - 0.3), ang, 'atrium'); }
      if ((i + c) % 3 === 0) rotBox(k, 'pvPanel', 1.7, 0.1, W * 0.55, x, H + 1.3, z, ang, 'roof');
    }
  }
  // the courtyard floor, and the sawtooth glass roof laid across it: low over the atrium, tall and part solar over the Forum
  extrudeXZ(k, 'paving', court, 0, 0.06, 'atrium');
  const forumZ = az(470), L = axis.getLength(), steps = Math.round(L / 4.2), yb = H + 0.4;
  const station = t => { const p = axis.getPointAt(t), d = axis.getTangentAt(t), c = [-d.z, d.x], sp = lineSpan(court, [p.x, p.z], c); return sp && { p: [p.x, p.z], c, sp, d }; };
  const end = (s, side) => [s.p[0] + s.c[0] * s.sp[side], s.p[1] + s.c[1] * s.sp[side]];
  const stations = [];
  for (let i = 0; i < steps; i++) {
    const A = station(i / steps), M = station((i + 0.5) / steps), B = station((i + 1) / steps); if (!A || !M || !B) continue;
    const forum = M.p[1] > forumZ, hR = forum ? 5.5 : 2.4, tag = forum ? 'forum' : 'atrium', yr = yb + hR;
    const a0 = end(A, 0), a1 = end(A, 1), m0 = end(M, 0), m1 = end(M, 1), b0 = end(B, 0), b1 = end(B, 1);
    k.geo(forum && i % 2 ? 'glassSmoked' : 'glass', polyGeoU([[a0[0], yb, a0[1]], [a1[0], yb, a1[1]], [m1[0], yr, m1[1]], [m0[0], yr, m0[1]]]), tag);
    k.geo('glass', polyGeoU([[m0[0], yr, m0[1]], [m1[0], yr, m1[1]], [b1[0], yb, b1[1]], [b0[0], yb, b0[1]]]), tag);
    [[a0, m0, b0], [a1, m1, b1]].forEach(([p, q, r]) => k.geo('glass', polyGeoU([[p[0], yb, p[1]], [q[0], yr, q[1]], [r[0], yb, r[1]]]), tag));
    rod3U(k, 'steel', [m0[0], yr, m0[1]], [m1[0], yr, m1[1]], 0.12, tag); rod3U(k, 'steel', [a0[0], yb, a0[1]], [a1[0], yb, a1[1]], 0.1, tag);
    stations.push({ M, forum });
  }
  // the Forum's tall glass facade, closing the open end of the U towards the path
  { const [a, b] = U.forumEdge, len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.round(len / 2.4);
    k.geo('glass', polyGeoU([[a[0], 0.3, a[1]], [b[0], 0.3, b[1]], [b[0], yb, b[1]], [a[0], yb, a[1]]]), 'forum');
    for (let i = 0; i <= n; i++) { const t = i / n, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t; rod3U(k, 'steel', [x, 0.3, z], [x, yb, z], i % 4 ? 0.06 : 0.14, 'forum'); }
    [0.3, 4.5, 9, yb].forEach(y => rod3U(k, 'steel', [a[0], y, a[1]], [b[0], y, b[1]], 0.1, 'forum')); }
  const near = (x, z) => stations.reduce((b, s) => { const d = Math.hypot(s.M.p[0] - x, s.M.p[1] - z); return d < b.d ? { s, d } : b; }, { s: null, d: 1e9 }).s;
  // cross wings linking the long sides of the loop, under the glass roof
  [[1236, 432], [1262, 344]].forEach(q => { const s = near(ax(q[0]), az(q[1])); if (!s) return; const M = s.M, len = M.sp[1] - M.sp[0] + W * 0.8, mid = M.sp[0] + (M.sp[1] - M.sp[0]) / 2, x = M.p[0] + M.c[0] * mid, z = M.p[1] + M.c[1] * mid, ang = Math.atan2(-M.c[1], M.c[0]);
    rotBox(k, 'larch', len, H, 8, x, H / 2, z, ang, 'snake'); for (let f = 0; f < NF; f++) rotBox(k, 'glassDark', len - 1, FH - 1.55, 8.2, x, f * FH + 1.15 + (FH - 1.15) / 2, z, ang, 'snake'); });
  // the free-standing lecture hall inside the Forum
  { const s = near(ax(1135), az(640)), ang = Math.atan2(-s.M.d.z, s.M.d.x); rotBox(k, 'white', 12, 5.5, 18, s.M.p[0], 2.75, s.M.p[1], ang, 'forum'); rotBox(k, 'white', 12.4, 0.4, 18.4, s.M.p[0], 5.7, s.M.p[1], ang, 'forum'); }
  [[1230, 470], [1300, 270], [1450, 215]].forEach(q => tree(k, ax(q[0]), az(q[1]), 0.85, 'poplar'));

  // Gebäude 109: the old factory joined to the south of the snake, now the library; a lower wing to the south
  boxP('brickBuff', 978, 1145, 0, 13, 850, 948, 'factory'); boxP('roofZinc', 980, 1143, 13, 13.15, 852, 946, 'factory');
  for (let u = 990; u < 1135; u += 21) for (let v = 862; v < 905; v += 15) boxP('glass', u, u + 10, 13.15, 13.7, v, v + 8, 'factory');
  for (let y = 2; y < 12; y += 3.6) { k.box('glassDark', ax(978) - 0.06, ax(1145) + 0.06, y, y + 1.9, az(850) - 0.06, az(948) + 0.06, 'factory'); }
  boxP('white', 980, 1143, 0, 8.5, 948, 1002, 'factory'); boxP('roof', 982, 1141, 8.5, 8.6, 950, 1000, 'factory');
  for (let y = 1.5; y < 8; y += 3.2) k.box('glassDark', ax(980) - 0.06, ax(1143) + 0.06, y, y + 1.6, az(948), az(1002) + 0.06, 'factory');
  // the Wörlitzer Bahnhof: small brick station house with a slate roof, beside the path to the Forum
  { const cx = ax(912), cz = az(1005); k.box('brick', cx - 7.6, cx + 7.6, 0, 7.2, cz - 5.4, cz + 5.4, 'bahnhof'); k.geo('slate', prism(cx - 7.9, cx + 7.9, cz - 5.7, cz + 5.7, 7.2, 10.6, 0.01, 5.7), 'bahnhof');
    [2.6, 5.4].forEach(y => k.box('brickBuff', cx - 7.7, cx + 7.7, y, y + 0.35, cz - 5.5, cz + 5.5, 'bahnhof'));
    for (let i = -2; i <= 2; i++) [cz - 5.4, cz + 5.4].forEach((z, j) => { k.winZ(z, j ? 1 : -1, cx + i * 2.9 - 0.7, cx + i * 2.9 + 0.7, 1.0, 2.4, { frame: 'white', glass: 'glassDark', tag: 'bahnhof' }); k.winZ(z, j ? 1 : -1, cx + i * 2.9 - 0.7, cx + i * 2.9 + 0.7, 3.4, 4.9, { frame: 'white', glass: 'glassDark', tag: 'bahnhof' }); }); }

  // the plus-energy extension: a rounded block with solar panels and windows in turn, a striped solar roof and two skylights; a small pavilion beside it
  const RX = 17.8, RZ = 12.5, EH = 16.4, eo = superEll(E[0], E[1], RX, RZ, 72, 3.2);
  extrudeXZ(k, 'dark', superEll(E[0], E[1], RX - 0.3, RZ - 0.3, 72, 3.2), 0, EH, 'extension');
  for (let f = 0; f < 4; f++) for (let j = 0; j < eo.length; j++) { const p = eo[j], q = eo[(j + 1) % eo.length], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], tang = Math.atan2(-(q[1] - p[1]), q[0] - p[0]), y = f * 4.1 + 2.1, w = Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.96;
    if ((j + f) % 2 === 0) rotBox(k, 'pvPanel', w, 3.7, 0.12, m[0], y, m[1], tang, 'extension'); else { rotBox(k, 'steelWhite', w, 3.7, 0.08, m[0], y, m[1], tang, 'extension'); rotBox(k, 'glassDark', w * 0.75, 2.6, 0.1, m[0], y + 0.2, m[1], tang, 'extension'); } }
  extrudeXZ(k, 'steelWhite', eo, EH, EH + 0.6, 'extension', superEll(E[0], E[1], RX - 0.8, RZ - 0.8, 72, 3.2));
  for (let x = -RX + 2; x <= RX - 2; x += 2.2) { const half = RZ * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x) / RX, 3.2)), 1 / 3.2) - 2; if (half < 1) continue;
    k.box(Math.round((x + RX) / 2.2) % 2 ? 'mallRed' : 'steelWhite', E[0] + x - 0.9, E[0] + x + 0.9, EH, EH + 0.35, E[1] - half, E[1] + half, 'extension'); }
  k.box('glass', ax(1372), ax(1408), EH + 0.35, EH + 1.6, az(622), az(678), 'extension'); k.box('glass', ax(1447), ax(1478), EH + 0.35, EH + 1.3, az(632), az(668), 'extension');
  k.box('steelWhite', ax(1412), ax(1443), EH + 0.35, EH + 2.4, az(637), az(658), 'extension');
  { const pv = superEll(ax(1443), az(736), 6, 6.6, 40, 2.8); extrudeXZ(k, 'dark', pv, 0, 4.4, 'extension');
    for (let x = -5; x <= 5; x += 1.6) { const h = 6.6 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x) / 6, 2.8)), 1 / 2.8) - 0.8; if (h > 0.5) k.box(Math.round(x / 1.6) % 2 ? 'mallRed' : 'steelWhite', ax(1443) + x - 0.6, ax(1443) + x + 0.6, 4.4, 4.6, az(736) - h, az(736) + h, 'extension'); } }

  // site: Roßlauer Allee to the west, the yard and plaza to the east, car parks, the street to the south-east, and an oval building in the park
  boxP('asphalt', 690, 778, 0, 0.03, 60, 1070); for (let v = 70; v < 1060; v += 30) [712, 734, 756].forEach(u => boxP('white', u, u + 1.5, 0.03, 0.04, v, v + 14));
  extrudeXZ(k, 'gravel', pxP([[1335, 322], [1580, 300], [1585, 480], [1340, 470]]), 0, 0.04);
  extrudeXZ(k, 'paving', pxP([[1240, 640], [1310, 630], [1335, 700], [1350, 840], [1300, 860], [1150, 850], [1150, 835], [1235, 790]]), 0, 0.05);
  extrudeXZ(k, 'paving', pxP([[1150, 845], [1300, 845], [1300, 990], [1150, 990]]), 0, 0.045);
  for (let u = 1170; u < 1290; u += 32) for (let v = 870; v < 985; v += 38) tree(k, ax(u), az(v), 0.7);
  extrudeXZ(k, 'asphalt', pxP([[1325, 735], [1440, 745], [1440, 925], [1330, 930]]), 0, 0.04);
  extrudeXZ(k, 'asphalt', pxP([[1290, 985], [1660, 860], [1660, 905], [1305, 1030], [1290, 1030]]), 0, 0.035);
  boxP('white', 1430, 1490, 0, 6, 830, 900); boxP('roof', 1432, 1488, 6, 6.1, 832, 898);
  extrudeXZ(k, 'paving', pxP([[925, 1070], [990, 1070], [990, 850], [1010, 790], [1070, 640], [1130, 492], [1080, 470], [1010, 560], [955, 700], [925, 850]]), 0, 0.05);
  extrudeXZ(k, 'paving', pxP([[1130, 492], [1080, 470], [1000, 440], [935, 470], [960, 495], [1060, 490]]), 0, 0.05);
  // oval building with a terrace and a wedge-shaped green roof to the west (not part of the agency in this model)
  extrudeXZ(k, 'greenRoof', pxP([[808, 495], [900, 492], [870, 545], [845, 640], [812, 690]]), 0, 2.6); extrudeXZ(k, 'white', superEll(ax(895), az(578), 9.2, 12.6, 48, 2.2), 0, 6);
  extrudeXZ(k, 'paving', superEll(ax(895), az(578), 8.4, 11.8, 48, 2.2), 6, 6.1);
  // neighbouring buildings to the north
  boxP('panelGrey', 1040, 1180, 0, 9, 95, 245); boxP('roof', 1042, 1178, 9, 9.1, 97, 243); boxP('panelGrey', 890, 1010, 0, 8, 60, 255); boxP('roof', 892, 1008, 8, 8.1, 62, 253);
  boxP('panelGrey', 965, 1310, 0, 12, 1010, 1070); boxP('roofZinc', 967, 1308, 12, 12.1, 1012, 1068);
  // trees in the park, kept clear of buildings, roads and paving
  const blocked = [court, pxP([[1335, 300], [1585, 300], [1585, 480], [1335, 480]]), pxP([[1150, 640], [1360, 640], [1360, 1000], [1150, 1000]]), pxP([[880, 440], [1135, 440], [1135, 1070], [880, 1070]]),
    pxP([[1030, 85], [1190, 85], [1190, 255], [1030, 255]]), pxP([[880, 60], [1015, 60], [1015, 265], [880, 265]]), pxP([[800, 485], [940, 485], [940, 700], [800, 700]]), pxP([[1300, 560], [1530, 560], [1530, 780], [1300, 780]]), pxP([[960, 1000], [1320, 1000], [1320, 1070], [960, 1070]]), pxP([[1290, 840], [1660, 840], [1660, 1070], [1290, 1070]])];
  const nearSnake = (x, z) => pts.some(p => Math.hypot(x - p[0], z - p[1]) < W / 2 + 4);
  for (let i = 0, n = 0; i < 600 && n < 95; i++) { const x = ax(785) + rand() * (P.x1 - ax(785) - 3), z = P.z0 + 3 + rand() * (P.z1 - P.z0 - 6);
    if (nearSnake(x, z) || blocked.some(b => ptInPoly(x, z, b))) continue; tree(k, x, z, 0.9 + rand() * 0.5); n++; }
  for (let i = 0; i < 16; i++) person(k, ax(950) + rand() * 25, az(700) + rand() * 70, rand() * 6.28, 0.05);
  for (let i = 0; i < 10; i++) person(k, ax(1250) + rand() * 15, az(680) + rand() * 25, rand() * 6.28, 0.05);
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  const fm = [(U.forumEdge[0][0] + U.forumEdge[1][0]) / 2, (U.forumEdge[0][1] + U.forumEdge[1][1]) / 2];
  const forumV = { cam: [ax(905), 3.2, az(735)], tgt: [fm[0], 9, fm[1]] }, loopV = { cam: [ax(1000), 165, az(1000)], tgt: [ax(1260), 0, az(480)] }, extV = { cam: [ax(1590), 7, az(800)], tgt: [E[0], 8, E[1]] };
  const east = [ax(1305), az(520)];
  return { scene, center: new THREE.Vector3(0, 0, 0), span: 150, sunDist: 400, lamps: [], intro: { pos: [ax(820), 120, az(1180)], tgt: [ax(1250), 6, az(500)] },
    views: [{ label: 'The Forum, from the path', cam: forumV.cam, tgt: forumV.tgt }, { label: 'Over the loop', cam: loopV.cam, tgt: loopV.tgt }, { label: 'The round extension', cam: extV.cam, tgt: extV.tgt }],
    facts: [
      { id: 'snake', title: 'An office “snake”', year: '2005', pos: [ax(1300), H + 3, az(232)], cam: loopV.cam, tgt: loopV.tgt,
        text: 'Sauerbruch Hutton designed the agency as a long, four-storey “office snake” that bends into an elongated loop around an atrium, with cross wings linking its long sides. It is a reinforced concrete frame clad in timber.',
        src: ['BauNetz Wissen', 'https://www.baunetzwissen.de/nachhaltig-bauen/objekte/buero/umweltbundesamt-in-dessau-674248'] },
      { id: 'facade', title: 'Larch and coloured glass', year: '2005', pos: [east[0] + 2, 9, east[1]], cam: [ax(1420), 6, az(470)], tgt: [east[0], 8, east[1]],
        text: 'The facades are divided into horizontal bands: coloured and clear glass alternate with larch-wood cladding. One side takes up the greens and blue-greens of the landscape, the other glows in reds, oranges and yellows.',
        src: ['BauNetz Wissen and Umweltbundesamt', 'https://www.baunetzwissen.de/nachhaltig-bauen/objekte/buero/umweltbundesamt-in-dessau-674248'] },
      { id: 'forum', title: 'The public Forum', year: '2005', pos: [ax(1110), H + 9, az(640)], cam: forumV.cam, tgt: forumV.tgt,
        text: 'The entrance hall, the Forum, is open to the public. Its folded glass roof runs down into a tall glass facade, and a free-standing lecture hall sits inside. Solar panels are built into the folded roof.',
        src: ['BauNetz Wissen and Umweltbundesamt', 'https://www.umweltbundesamt.de/en/node/3561'] },
      { id: 'atrium', title: 'A model of green building', year: '2009', pos: [ax(1440), H + 6, az(228)], cam: [ax(1640), 60, az(420)], tgt: [ax(1420), 10, az(240)],
        text: 'The building was planned as a demonstration of ecological construction: highly insulated timber-and-glass facades, an earth heat exchanger, a 100 kWp solar installation and largely natural materials. It won the German gold medal for sustainable construction in 2009. Gross floor area is about 40,000 m².',
        src: ['Umweltbundesamt, BauNetz Wissen and Structurae', 'https://www.umweltbundesamt.de/en/node/3561'] },
      { id: 'extension', title: 'A plus-energy extension', year: '2016–2023', pos: [E[0], EH + 5, E[1]], cam: extV.cam, tgt: extV.tgt,
        text: 'Opposite the Forum stands the four-storey extension by Anderhalten Architekten, with 111 workplaces. Its facade is partly made of solar modules. With about 720 m² of photovoltaics and a heat pump on some 30 geothermal probes, it is meant to produce more energy than it uses. The foundation stone was laid in 2016, but facade defects delayed the opening until September 2023.',
        src: ['Umweltbundesamt', 'https://www.umweltbundesamt.de/neuer-erweiterungsbau-am-hauptsitz-dessau-rosslau'] },
      { id: 'factory', title: 'An old factory, now the library', year: 'today', pos: [ax(1060), 17, az(900)], cam: [ax(1220), 12, az(1060)], tgt: [ax(1060), 7, az(900)],
        text: 'An old factory building, once used to make gas appliances, was kept and joined to the new building. It houses the agency’s environmental library, which is open to the public and adjoins the Forum.',
        src: ['BauNetz Wissen and Umweltbundesamt', 'https://www.baunetzwissen.de/nachhaltig-bauen/objekte/buero/umweltbundesamt-in-dessau-674248'] },
      { id: 'bahnhof', title: 'The Wörlitzer Bahnhof', year: 'today', pos: [ax(912), 13, az(1005)], cam: [ax(820), 8, az(1060)], tgt: [ax(912), 5, az(1005)],
        text: 'The listed Wörlitzer Bahnhof is part of the agency. It was once the starting point of the Dessau-Wörlitz railway and the gateway to the Wörlitz garden. Visitors reach the main entrance in the Forum along a path beside it.',
        src: ['Umweltbundesamt', 'https://www.umweltbundesamt.de/en/node/3561'] },
      { id: 'gasviertel', title: 'On the old gasworks', year: '1992–2005', pos: [ax(860), 1.4, az(860)], cam: [ax(760), 14, az(1000)], tgt: [ax(880), 2, az(820)],
        text: 'Moving the agency from Berlin to Dessau was decided in 1992. It was built in the Gasviertel, the site of the town’s old gasworks, whose contaminated soil had to be cleaned up. Disused railway land became a park linking the city centre with the Garden Realm. The agency has had its headquarters here since 2005.',
        src: ['Birgit Klauck, De Gruyter, and Umweltbundesamt', 'https://bdt.degruyter.com/?p=19265'] }
    ] };
}
function lineSpan(poly, p, d) {   // the stretch of the line p + t·d that lies inside the polygon around t = 0
  let lo = -Infinity, hi = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[j], e = [poly[i][0] - a[0], poly[i][1] - a[1]], den = d[0] * e[1] - d[1] * e[0]; if (Math.abs(den) < 1e-9) continue;
    const w = [a[0] - p[0], a[1] - p[1]], t = (w[0] * e[1] - w[1] * e[0]) / den, s = (w[0] * d[1] - w[1] * d[0]) / den;
    if (s < 0 || s > 1) continue; if (t < 0) lo = Math.max(lo, t); else hi = Math.min(hi, t);
  }
  return (isFinite(lo) && isFinite(hi)) ? [lo, hi] : null;
}
function polyGeoU(points) {
  const pos = []; for (let i = 1; i < points.length - 1; i++) [points[0], points[i], points[i + 1]].forEach(p => pos.push(p[0], p[1], p[2]));
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
}
function ptInPoly(x, z, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
function superEll(cx, cz, rx, rz, n, p) { const out = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); out.push([cx + rx * Math.sign(c) * Math.pow(Math.abs(c), 2 / p), cz + rz * Math.sign(s) * Math.pow(Math.abs(s), 2 / p)]); } return out; }
