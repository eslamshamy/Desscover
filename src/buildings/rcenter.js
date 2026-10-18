/* ---------- 4. Kornhaus ---------- */

export function buildRathausCenter(context) {
  const { Kit, THREE, glass, lamp, person, plinth, rand, registerNoAO, rod3U, signMesh, tree } = context;

  // Roof plan traced from an aerial photo (north up). ax/az turn photo pixels into metres (about 0.23 m per pixel),
  // so every number below can be checked against the image. Facades and heights are approximate.
  const k = new Kit(), S = 0.23, ax = u => (u - 502) * S, az = v => (v - 578) * S;
  const xd = v => 325 + 0.3146 * (v - 130);              // centre line of the diagonal glazed mall street, in photo pixels
  const P = { x0: ax(80), x1: ax(925), z0: az(40), z1: az(1125) };
  const HL = 11, HB = 13.5, HT = 15, HC = 15.6;          // green roofs, raised bands, the two end blocks, stair cores
  const poly = (m, pts, y0, y1, tag) => {
    const sh = new THREE.Shape(); pts.forEach((q, i) => i ? sh.lineTo(ax(q[0]), -az(q[1])) : sh.moveTo(ax(q[0]), -az(q[1])));
    const g = new THREE.ExtrudeGeometry(sh, { depth: y1 - y0, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); k.geo(m, g, tag);
  };
  const boxP = (m, u0, u1, y0, y1, v0, v1, tag) => k.box(m, ax(u0), ax(u1), y0, y1, az(v0), az(v1), tag);
  const ribbonX = (u, s, v0, v1, y0, y1, tag) => k.winX(ax(u), s, az(v0), az(v1), y0, y1, { mull: 1.5, frame: 'frame', glass: 'glassDark', tag });
  const shopsX = (u, s, v0, v1, tag) => { for (let z = az(v0) + 1; z + 5 <= az(v1) - 1; z += 6) k.winX(ax(u), s, z, z + 5, 0.5, 4.6, { mull: 1.25, trans: [3.7], frame: 'frame', glass: 'glass', tag }); };
  const shopsZ = (v, s, u0, u1, tag) => { for (let x = ax(u0) + 1; x + 5 <= ax(u1) - 1; x += 6) k.winZ(az(v), s, x, x + 5, 0.5, 4.6, { mull: 1.25, trans: [3.7], frame: 'frame', glass: 'glass', tag }); };
  boxP('paving', 80, 925, -0.12, 0, 40, 1125);

  // north block: the tallest part, with a slanted west edge along the mall street, two half-round stair heads and a grid of roof domes
  const NB = [[xd(130) + 16, 130], [650, 130], [650, 355], [xd(355) + 16, 355]];
  poly('panelGrey', NB, 0, HT, 'shops'); poly('greenRoof', NB.map(q => [q[0] + (q[0] < 500 ? 3 : -3), q[1] + (q[1] < 200 ? 3 : -3)]), HT, HT + 0.12, 'shops');
  [[440, 165], [594, 155]].forEach(([u, v]) => {
    const c = new THREE.CylinderGeometry(4.6, 4.6, 2.8, 24, 1, false, Math.PI / 2, Math.PI); c.translate(ax(u), HT + 1.4, az(v)); k.geo('panelGrey', c, 'shops');
    boxP('panelGrey', u - 20, u + 20, HT, HT + 2.8, v, v + 4, 'shops');
  });
  for (let u = 402; u <= 560; u += 38.5) for (let v = 197; v <= 315; v += 19) {
    const d = new THREE.SphereGeometry(0.55, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2); d.scale(1, 0.6, 1); d.translate(ax(u), HT + 0.12, az(v)); k.geo('frost', d, 'shops');
  }
  boxP('grey', 577, 630, HT, HT + 2.4, 297, 340, 'shops'); boxP('grey', 460, 490, HT, HT + 2.0, 335, 368, 'shops'); boxP('frost', 582, 628, HT, HT + 0.5, 188, 212, 'shops');
  for (let v = 145; v < 350; v += 9) ribbonX(650, 1, v, v + 7, 6.4, 13.4, 'shops');
  k.winZ(az(130), -1, ax(360), ax(640), 6.4, 13.4, { mull: 1.6, frame: 'frame', glass: 'glassDark', tag: 'park' });
  // pergola along the north front
  for (let u = 350; u <= 650; u += 8) boxP('steelWhite', u, u + 1.2, 3.9, 4.2, 112, 130, 'park');
  [112, 121].forEach(v => { for (let u = 352; u <= 650; u += 24) boxP('steelWhite', u, u + 1.5, 0, 3.9, v, v + 1.5, 'park'); boxP('steelWhite', 350, 652, 3.7, 3.9, v, v + 1.5, 'park'); });

  // north-west entrance hall under a gridded glass roof, where the mall street begins
  boxP('panelGrey', 300, 372, 0, 0.6, 130, 225, 'park'); boxP('glass', 301, 371, 0.6, 8.6, 131, 224, 'park'); boxP('glass', 300, 372, 8.6, 8.8, 130, 225, 'park');
  for (let u = 300; u <= 372; u += 9) boxP('frame', u, u + 0.6, 0.6, 8.95, 130, 225, 'park');
  for (let v = 130; v <= 225; v += 9) boxP('frame', 300, 372, 8.75, 8.95, v, v + 0.6, 'park');
  k.box('canopyDark', ax(300) - 4, ax(300), 4.0, 4.3, az(160), az(200), 'park');

  // west wing and the green roof between the north block and the first band
  const WW = [[315, 225], [xd(225) - 16, 225], [xd(476) - 16, 476], [318, 476]];
  poly('panelGrey', WW, 0, HL, 'shops'); poly('greenRoof', WW.map(q => [q[0] + (q[0] < 330 ? 3 : -3), q[1]]), HL, HL + 0.12, 'shops');
  const MG = [[xd(355) + 16, 355], [667, 355], [667, 476], [xd(476) + 16, 476]];
  poly('panelGrey', MG, 0, HL, 'shops'); poly('greenRoof', MG.map(q => [q[0] + (q[0] < 600 ? 3 : -3), q[1]]), HL, HL + 0.12, 'shops');
  shopsX(318, -1, 240, 470, 'shops'); ribbonX(318, -1, 240, 470, 6.2, 9.8, 'shops'); ribbonX(667, 1, 360, 470, 6.2, 9.8, 'mediamarkt');

  // four stepped bands: a north-facing sloped rooflight, a raised roof with stair cores at both ends, then a lower green roof
  const BANDS = [[476, 490, 545, 600], [600, 614, 666, 726], [726, 740, 802, 856], [856, 866, 935, 935]];
  BANDS.forEach(([w0, w1, b1, g1], i) => {
    boxP('panelGrey', 330, 680, 0, HL, w0, w1, 'shops');
    boxP('panelGrey', 322, 688, 0, HB, w1, b1, 'shops'); boxP('roof', 323, 687, HB, HB + 0.1, w1 + 1, b1 - 1, 'shops');
    const d = (w1 - w0) * S, rise = HB - HL, len = Math.hypot(d, rise), phi = -Math.atan2(rise, d), W = (688 - 330) * S;
    const sl = new THREE.BoxGeometry(W, 0.12, len); sl.rotateX(phi); sl.translate(ax(509), HL + rise / 2, az(w0) + d / 2); k.geo('frost', sl, 'shops');
    for (let x = ax(330) + 1; x < ax(688); x += 3) { const r = new THREE.BoxGeometry(0.1, 0.14, len); r.rotateX(phi); r.translate(x, HL + rise / 2 + 0.08, az(w0) + d / 2); k.geo('steelWhite', r, 'shops'); }
    [[327, 357], [662, 688]].forEach(([u0, u1]) => { boxP('panelGrey', u0, u1, HB, HC, w1 + 2, b1 - 2, 'shops'); boxP('roof', u0 + 0.5, u1 - 0.5, HC, HC + 0.08, w1 + 2.5, b1 - 2.5, 'shops'); });
    ribbonX(322, -1, w1 + 2, b1 - 2, 6.4, 12.4, 'shops'); ribbonX(688, 1, w1 + 2, b1 - 2, 6.4, 12.4, i < 2 ? 'mediamarkt' : 'shops');
    if (g1 > b1) {
      boxP('panelGrey', 340, 670, 0, HL, b1, g1, 'shops'); boxP('greenRoof', 342, 668, HL, HL + 0.12, b1 + 1, g1 - 1, 'shops');
      shopsX(340, -1, b1, g1, 'shops'); ribbonX(340, -1, b1 + 2, g1 - 2, 6.2, 9.8, 'shops');
      shopsX(670, 1, b1, g1, 'shops'); ribbonX(670, 1, b1 + 2, g1 - 2, 6.2, 9.8, i < 2 ? 'mediamarkt' : 'shops');
    }
  });
  boxP('panelGrey', 545, 580, HL, 14.6, 552, 632, 'shops'); boxP('brick', 612, 628, HL, 16.5, 678, 712, 'shops');
  for (let u = 364; u < 500; u += 23) for (let v = 886; v < 928; v += 21) boxP('grey', u, u + 18, HB, HB + 1.6, v, v + 15, 'shops');
  for (let u = 600; u < 655; u += 18) boxP('grey', u, u + 13, HB, HB + 1.2, 885, 905, 'shops');

  // south block on the main street, the second tall end, with shopfronts, the name, and a glazed corner entrance
  const SB = [[345, 935], [xd(935) - 16, 935], [xd(1030) - 16, 1030], [345, 1030]];
  poly('panelGrey', SB, 0, HT, 'opened'); poly('greenRoof', SB.map(q => [q[0] + (q[0] < 400 ? 3 : -3), q[1] + (q[1] < 950 ? 3 : -3)]), HT, HT + 0.12, 'opened');
  boxP('roof', 470, 485, HT, HT + 1.4, 1000, 1010, 'opened');
  shopsZ(1030, 1, 352, 545, 'opened'); k.winZ(az(1030), 1, ax(360), ax(540), 6.4, 11.4, { mull: 1.8, frame: 'frame', glass: 'glassDark', tag: 'opened' });
  shopsX(345, -1, 940, 1028, 'opened'); ribbonX(345, -1, 940, 1028, 6.4, 13.4, 'opened');
  const SE = [[xd(935) + 16, 935], [650, 935], [650, 975], [xd(975) + 16, 975]];
  poly('panelGrey', SE, 0, 9, 'shops'); poly('greenRoof', SE.map(q => [q[0] + (q[0] < 640 ? 3 : -3), q[1]]), 9, 9.12, 'shops');
  const VE = [[xd(965) - 16, 965], [xd(965) + 26, 965], [xd(1030) + 26, 1030], [xd(1030) - 16, 1030]];
  poly('glass', VE, 0.3, 8.2, 'opened'); poly('frame', VE, 8.2, 8.5, 'opened'); poly('stone', VE, 0, 0.3, 'opened');
  for (let v = 970; v < 1030; v += 10) { const a = [xd(v) - 16, v], b = [xd(v) + 26, v]; boxP('frame', a[0], b[0], 0.3, 8.2, v, v + 0.4, 'opened'); }
  k.box('canopyDark', ax(xd(1030) - 20), ax(xd(1030) + 30), 4.2, 4.5, az(1030), az(1030) + 4, 'opened');
  for (let i = 0; i < 3; i++) k.box('stone', ax(xd(1030) - 16) - i * 0.6, ax(xd(1030) + 26) + i * 0.6, i * 0.14, (i + 1) * 0.14, az(1030) + i * 0.6, az(1030) + 0.6 + i * 0.6, 'opened');

  // the diagonal mall street: a glass barrel vault between two round glazed nodes, running corner to corner
  { const R = 3.4, Y = HB + 0.4;
    const seg = (v0, v1) => {
      const A = new THREE.Vector2(ax(xd(v0)), az(v0)), B = new THREE.Vector2(ax(xd(v1)), az(v1));
      const dx = B.x - A.x, dz = B.y - A.y, L = Math.hypot(dx, dz); return { L, ang: Math.atan2(-dz, dx), cx: (A.x + B.x) / 2, cz: (A.y + B.y) / 2 };
    };
    const put = (m, g, s, x, y, z) => { g.rotateY(s.ang); g.translate(x, y, z); k.geo(m, g, 'shops'); };
    // between the two nodes the street rises above the roofs under a glass vault
    const M = seg(385, 830);
    put('cream', new THREE.BoxGeometry(M.L, Y, 2 * R + 1.2), M, M.cx, Y / 2, M.cz);
    const v = new THREE.CylinderGeometry(R, R, M.L, 18, 1, true, 0, Math.PI); v.rotateZ(Math.PI / 2); v.scale(1, 0.6, 1); put('glass', v, M, M.cx, Y, M.cz);
    for (let d = -M.L / 2 + 1; d <= M.L / 2 - 1; d += 3.6) {
      const r = new THREE.TorusGeometry(R, 0.09, 4, 14, Math.PI); r.rotateY(Math.PI / 2); r.scale(1, 0.6, 1);
      put('steelWhite', r, M, M.cx + Math.cos(M.ang) * d, Y, M.cz - Math.sin(M.ang) * d);
    }
    put('steelWhite', new THREE.BoxGeometry(M.L, 0.16, 0.2), M, M.cx, Y + R * 0.6, M.cz);
    // beyond the nodes it runs on as a lower, flat glazed slot towards the two corner entrances
    [seg(225, 385), seg(830, 965)].forEach(s => {
      put('cream', new THREE.BoxGeometry(s.L, HL + 0.5, 2 * R + 1.2), s, s.cx, (HL + 0.5) / 2, s.cz);
      put('glassDark', new THREE.BoxGeometry(s.L, 0.12, 2 * R), s, s.cx, HL + 0.56, s.cz);
      for (let d = -s.L / 2 + 1; d <= s.L / 2 - 1; d += 3.6) put('frame', new THREE.BoxGeometry(0.12, 0.16, 2 * R), s, s.cx + Math.cos(s.ang) * d, HL + 0.62, s.cz - Math.sin(s.ang) * d);
    });
    [[405, 385], [545, 830]].forEach(([u, w]) => {
      const x = ax(u), z = az(w);
      const base = new THREE.CylinderGeometry(7.0, 7.0, Y + 0.3, 36); base.translate(x, (Y + 0.3) / 2, z); k.geo('cream', base, 'shops');
      const dome = new THREE.SphereGeometry(6.3, 36, 8, 0, Math.PI * 2, 0, Math.PI / 2); dome.scale(1, 0.38, 1); dome.translate(x, Y + 0.3, z); k.geo('glass', dome, 'shops');
      const ring = new THREE.TorusGeometry(6.6, 0.25, 8, 36); ring.rotateX(Math.PI / 2); ring.translate(x, Y + 0.4, z); k.geo('steelWhite', ring, 'shops');
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; rod3U(k, 'steelWhite', [x + Math.cos(a) * 6.3, Y + 0.35, z + Math.sin(a) * 6.3], [x + Math.cos(a) * 2.2, Y + 2.2, z + Math.sin(a) * 2.2], 0.06, 'shops'); }
      const eye = new THREE.CylinderGeometry(1.4, 1.6, 0.6, 20); eye.translate(x, Y + 2.3, z); k.geo('steelWhite', eye, 'shops');
    });
  }

  // neighbours: GDR panel slabs on both long sides and a white block at the south-east corner (simplified, not clickable)
  const slabB = (u0, u1, v0, v1, h) => {
    boxP('panelGrey', u0, u1, 0, h, v0, v1); boxP('roof', u0 + 1, u1 - 1, h, h + 0.1, v0 + 1, v1 - 1);
    for (let y = 3.2; y < h - 1; y += 2.9) k.box('glassDark', ax(u0) - 0.05, ax(u1) + 0.05, y, y + 1.4, az(v0) - 0.05, az(v1) + 0.05);
  };
  slabB(215, 270, 285, 1040, 17.5); [[390, 455], [620, 680], [880, 930]].forEach(([v0, v1]) => slabB(192, 215, v0, v1, 17.5));
  slabB(745, 800, 195, 440, 17.5); slabB(775, 840, 420, 880, 17.5); slabB(735, 925, 95, 195, 17.5);
  boxP('white', 615, 885, 0, 11, 975, 1030); boxP('roof', 618, 882, 11, 11.1, 978, 1027);
  for (let y = 3.4; y < 10; y += 3.2) k.box('glassDark', ax(616), ax(884), y, y + 1.4, az(975) - 0.05, az(1030) + 0.05);
  // streets: the main street with tram tracks and bus shelters to the south, a service street to the east, a tree-lined walk to the west
  boxP('asphalt', 80, 925, 0, 0.03, 1045, 1082);
  [1056, 1060.5, 1067, 1071.5].forEach(v => boxP('rail', 80, 925, 0.03, 0.06, v, v + 0.3));
  [[405, 475, 1038, 1046], [470, 540, 1083, 1091]].forEach(([u0, u1, v0, v1]) => {
    boxP('canopyDark', u0, u1, 2.6, 2.75, v0, v1); boxP('glass', u0, u1, 0.1, 2.5, v1 - 1, v1 - 0.6);
    [u0 + 1, u1 - 2].forEach(u => boxP('frame', u, u + 0.5, 0, 2.6, v1 - 1.2, v1 - 0.6));
  });
  boxP('asphalt', 692, 735, 0, 0.03, 160, 1045); boxP('lawn', 800, 925, 0, 0.04, 440, 960);
  // car park ramp off the east street
  boxP('dark', 700, 722, -0.02, 0.02, 880, 935, 'parking'); boxP('concrete', 698, 700, 0, 1.1, 880, 935, 'parking'); boxP('concrete', 722, 724, 0, 1.1, 880, 935, 'parking');
  boxP('concrete', 698, 724, 3.4, 3.9, 930, 935, 'parking'); boxP('dark', 700, 722, 0.02, 3.4, 933, 934, 'parking');
  for (let v = 300; v < 1030; v += 70) tree(k, ax(300), az(v), 0.9 + rand() * 0.2);
  for (let v = 470; v < 1000; v += 60) tree(k, ax(745), az(v), 0.9 + rand() * 0.2);
  for (let u = 120; u < 920; u += 75) tree(k, ax(u), az(1110), 1.0 + rand() * 0.3);
  for (let u = 380; u < 640; u += 45) tree(k, ax(u), az(65), 1.0 + rand() * 0.3);
  const lampP = [[300, 1040], [520, 1040], [740, 1040], [290, 500], [290, 800], [690, 600]].map(q => [ax(q[0]), az(q[1])]);
  lampP.forEach(q => lamp(k, q[0], q[1]));
  for (let i = 0; i < 30; i++) person(k, ax(330) + rand() * 120 * S * 3, az(1034) + rand() * 2.5, rand() * 6.28);
  for (let i = 0; i < 14; i++) person(k, ax(280) + rand() * 8, az(320) + rand() * 160, rand() * 6.28);
  for (let i = 0; i < 8; i++) person(k, ax(330) + rand() * 10, az(110) + rand() * 15, rand() * 6.28);
  const grp = k.build();
  const sign = signMesh('RATHAUS-CENTER', 22, 2.4, '#c4c9c8', '#bd3338', 'opened'); sign.position.set(ax(450), HT - 1.7, az(1030) + 0.25); sign.userData.fact = 'opened'; grp.add(sign);
  const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  const front = { cam: [25, 5, 140], tgt: [5, 8, 104] }, street = { cam: [-75, 60, -150], tgt: [5, 12, 10] };
  return { scene, center: new THREE.Vector3(0, 0, 0), span: 165, sunDist: 380, lamps: lampP.map(q => new THREE.Vector3(q[0], 4.85, q[1])),
    intro: { pos: [150, 120, 175], tgt: [0, 8, 0] },
    views: [{ label: 'Main entrance', cam: front.cam, tgt: front.tgt }, { label: 'Along the glass street', cam: street.cam, tgt: street.tgt }, { label: 'From above', cam: [1, 290, 8], tgt: [0, 0, 6] }],
    facts: [
      { id: 'opened', title: 'Opened in September 1995', year: '1995', pos: [ax(470), HT + 3, az(1030) + 2], cam: front.cam, tgt: front.tgt,
        text: 'The Rathaus-Center opened in September 1995 at Kavalierstraße 49, in the heart of the city and named after the town hall next door. It is run by the shopping centre company ECE.',
        src: ['Deutsche EuroShop, property portfolio', 'https://deutsche-euroshop.de/Shopping-Centers/Property-Portfolio/Rathaus-Center-Dessau'] },
      { id: 'shops', title: 'About 90 shops', year: 'today', pos: [ax(475), HB + 8, az(608)], cam: street.cam, tgt: street.tgt,
        text: 'Around 90 specialist shops share about 32,900 m² of leasable space on two floors. Anchor tenants include H&M, TK Maxx, Thalia, Modehaus Fischer, REWE, Rusta and Media Markt.',
        src: ['Deutsche EuroShop, property portfolio', 'https://deutsche-euroshop.de/Shopping-Centers/Property-Portfolio/Rathaus-Center-Dessau'] },
      { id: 'parking', title: 'Parking under the shops', year: 'today', pos: [ax(711), 6, az(905)], cam: [56, 7, 118], tgt: [48, 1, 76],
        text: 'An underground car park with about 850 spaces lies beneath the centre.',
        src: ['Malls.com, Rathaus-Center Dessau', 'https://www.malls.com/malls/rathaus-center-dessau'] },
      { id: 'mediamarkt', title: 'A second MediaMarkt', year: '2023', pos: [ax(688) + 3, 10, az(640)], cam: [58, 10, 45], tgt: [43, 8, 10],
        text: 'On 23 March 2023 a second MediaMarkt for the city opened on the first floor of the Rathaus-Center, the same year the centre was extended.',
        src: ['MediaMarktSaturn press release, March 2023', 'https://mediamarktsaturn.com/sites/default/files/2023-08/Pressemitteilung_MediaMarkt_Dessau-City.pdf'] },
      { id: 'park', title: 'Between town hall and park', year: 'today', pos: [ax(336), 12, az(178)], cam: [-72, 14, -140], tgt: [ax(336), 5, az(178)],
        text: 'The centre lies between the town hall and the Stadtpark. The Bauhaus Museum tram and bus stops are a few minutes away on foot.',
        src: ['trek.zone, Rathaus-Center Dessau', 'https://trek.zone/en/germany/places/538889/rathaus-center-dessau'] }
    ] };

}
