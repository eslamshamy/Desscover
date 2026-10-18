/* ================================================================
   Dessau-Center (dcenter)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['dcenter'] = {
  meta: { id: 'dcenter', years: 'opened 2009', name: 'Dessau-Center', sub: 'Shopping centre, 2009', lat: 51.830278, lon: 12.243333, build: buildDessauCenter, label: 'Dessau-Center', meta: 'Shopping centre at the Museumskreuzung, opened 2 May 2009', lead: 'A red shopping centre with a round membrane disc floating over its corner entrance at the Museumskreuzung. The street fronts follow photos; the car park behind is schematic. Click the numbers to learn its story.' },
  token(k) {
    k.box('dcRed', -45, 45, 0, 15.6, -35, 15); k.box('concrete', -45, 45, 0, 16.5, 15, 40); k.box('dcSilver', 33, 46, 0, 17.2, -36, -22); const d = new THREE.CylinderGeometry(13, 11, 1.4, 40); d.translate(40.5, 22, -30); k.geo('sail', d);
  },
  quiz: [
    { q: 'When did the Dessau-Center open?', o: ['2 May 2009', 'September 1995', '1 January 2000', '8 September 2019'], a: 0, e: 'Saturn opened at 6 a.m., the other shops at 8 a.m.' }
  ]
};

function buildDessauCenter() {
  // a bright red two-wing block over a grey shop plinth, a silver corner tower with the entrance, and a round membrane disc floating above it,
  // following street-level photos from the Museumskreuzung; the car park behind is schematic
  const k = new Kit(), P = { x0: -90, x1: 95, z0: -85, z1: 75 };
  const X0 = -45, X1 = 45, Z0 = -35, ZR = 15, ZP = 40, F1 = 5.4, HP = 15.6, HT = 17.2;
  k.box('lawn', P.x0, P.x1, -0.12, 0, P.z0, P.z1);
  const poly = (m, pts, y0, y1, tag) => {
    const sh = new THREE.Shape(); pts.forEach((q, i) => i ? sh.lineTo(q[0], -q[1]) : sh.moveTo(q[0], -q[1]));
    const g = new THREE.ExtrudeGeometry(sh, { depth: y1 - y0, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); k.geo(m, g, tag);
  };
  // the block: corner cut back where the tower stands, light grey shop storey, red render above, a red parapet round the roof deck
  const B = [[X0, Z0], [34, Z0], [X1, Z0 + 11], [X1, ZR], [X0, ZR]];
  poly('panelGrey', B, 0, F1, 'shops'); poly('dcRed', B, F1, HP - 0.6, 'horten'); poly('concrete', B, HP - 0.6, HP - 0.55, 'parking');
  k.box('dcRed', X0, 34, HP - 0.6, HP, Z0, Z0 + 0.3, 'horten'); k.box('dcRed', X0, X0 + 0.3, HP - 0.6, HP, Z0 + 0.3, ZR, 'horten'); k.box('dcRed', X1 - 0.3, X1, HP - 0.6, HP, Z0 + 11, ZR, 'horten');
  k.box('panelGrey', X0 - 0.1, 33, F1 - 0.35, F1, Z0 - 0.12, Z0, 'shops'); k.box('panelGrey', X1, X1 + 0.12, F1 - 0.35, F1, -22, ZR, 'shops'); k.box('panelGrey', X0 - 0.12, X0, F1 - 0.35, F1, Z0, ZR, 'shops');
  // shopfronts with a row of tenant sign panels above them
  const front = (z, s, x0, x1) => { for (let x = x0; x + 5 <= x1; x += 6) k.winZ(z, s, x, x + 5, 0.5, 4.0, { mull: 1.25, trans: [3.1], frame: 'frame', glass: 'glass', tag: 'shops' }); };
  const sideX = (x, s, z0, z1) => { for (let z = z0; z + 5 <= z1; z += 6) k.winX(x, s, z, z + 5, 0.5, 4.0, { mull: 1.25, trans: [3.1], frame: 'frame', glass: 'glass', tag: 'shops' }); };
  front(Z0, -1, X0 + 9, 32); sideX(X0, -1, Z0 + 2, ZR - 1); sideX(X1, 1, -21, 7);
  const SIGNC = ['red', 'white', 'mastGreen', 'red', 'steelBlue', 'white', 'red'];
  for (let x = X0 + 10, i = 0; x + 4 <= 31; x += 6.5, i++) k.box(SIGNC[i % SIGNC.length], x, x + 4 + (i % 2), 4.25, 5.0, Z0 - 0.26, Z0 - 0.1, 'shops');
  for (let z = -20, i = 3; z + 4 <= 6; z += 6.5, i++) k.box(SIGNC[i % SIGNC.length], X1 + 0.1, X1 + 0.26, 4.25, 5.0, z, z + 4 + (i % 2), 'shops');
  // car park entrance at the west end of the front, with its P sign
  k.box('dark', X0 + 1.5, X0 + 7.5, 0, 3.6, Z0 - 0.05, Z0 + 0.6, 'parking'); k.box('panelGrey', X0 + 1.2, X0 + 7.8, 3.6, 4.0, Z0 - 0.25, Z0, 'parking');
  // one long ribbon window in a grey band high on each wing
  k.box('panelGrey', X0 + 3, 31.5, 10.6, 13.9, Z0 - 0.1, Z0, 'horten'); k.winZ(Z0 - 0.1, -1, X0 + 3.4, 31.1, 11.0, 13.5, { mull: 2.4, frame: 'frame', glass: 'glassDark', tag: 'horten' });
  k.box('panelGrey', X1, X1 + 0.1, 10.6, 13.9, -20.5, 6, 'horten'); k.winX(X1 + 0.1, 1, -20.1, 5.6, 11.0, 13.5, { mull: 2.4, frame: 'frame', glass: 'glassDark', tag: 'horten' });
  [[-28, 9], [-6, 9.4], [4, 8.2], [24, 9], [24, 7.2], [-36, 8.6]].forEach(([x, y]) => k.box('panelGrey', x - 0.3, x + 0.3, y - 0.3, y + 0.3, Z0 - 0.08, Z0, 'horten'));
  [[-13, 9], [0, 9.4], [-4, 7.4]].forEach(([z, y]) => k.box('panelGrey', X1, X1 + 0.08, y - 0.3, y + 0.3, z - 0.3, z + 0.3, 'horten'));
  // big empty steel frames standing off the red render and rising past the roofline
  const frameFront = (x0, x1, y0, y1) => {
    const z = Z0 - 0.9, t = 0.2, bar = (a, b, c, d) => k.box('steel', a, b, c, d, z, z + t, 'horten');
    bar(x0, x1, y0, y0 + t); bar(x0, x1, y1 - t, y1); bar(x0, x0 + t, y0, y1); bar(x1 - t, x1, y0, y1); bar(x0, x1, y1 - 1.8, y1 - 1.8 + t);
    [1, 2, 3].forEach(i => { const x = x0 + (x1 - x0) * i / 4; bar(x - t / 2, x + t / 2, y0, y1); });
    [y0 + 0.6, y1 - 2.4].forEach(y => [x0 + 0.5, x1 - 0.7].forEach(x => k.box('steel', x, x + 0.2, y, y + 0.2, z + t, Z0, 'horten')));
  };
  frameFront(8, 20, 8.1, HP + 0.8);
  const frameSide = (z0, z1, y0, y1) => {
    const x = X1 + 0.9, t = 0.2, bar = (a, b, c, d) => k.box('steel', x - t, x, c, d, a, b, 'horten');
    bar(z0, z1, y0, y0 + t); bar(z0, z1, y1 - t, y1); bar(z0, z0 + t, y0, y1); bar(z1 - t, z1, y0, y1); bar(z0, z1, y1 - 1.8, y1 - 1.8 + t);
    [1, 2, 3].forEach(i => { const z = z0 + (z1 - z0) * i / 4; bar(z - t / 2, z + t / 2, y0, y1); });
    [y0 + 0.6, y1 - 2.4].forEach(y => [z0 + 0.5, z1 - 0.7].forEach(z => k.box('steel', X1, x - t, y, y + 0.2, z, z + 0.2, 'horten')));
  };
  frameSide(-19, -10, 8.1, HP + 0.8); frameSide(1, 8, 8.1, HP + 0.8);
  // silver end tower at the far end of the side wing
  k.box('dcSilver', 38, X1 + 0.6, 0, HP + 1.6, 7, 15.6, 'shops'); k.winX(X1 + 0.6, 1, 8.5, 13.5, 6, HP, { mull: 1.25, frame: 'frame', glass: 'glassDark', tag: 'shops' });
  // the corner tower: silver panels, a chamfered face to the crossing with stacked glazing, the entrance and the name
  const T = [[33, Z0 - 1.2], [37.5, Z0 - 1.2], [X1 + 1.2, -27.5], [X1 + 1.2, -22], [33, -22]];
  poly('dcSilver', T, 0, HT, 'opened'); poly('concrete', T, HT, HT + 0.05, 'opened');
  const C = [41.85, -31.85], n = [Math.SQRT1_2, -Math.SQRT1_2], tv = [Math.SQRT1_2, Math.SQRT1_2], ang = -Math.PI / 4;
  const face = (m, w, y0, y1, off, along, d) => rotBox(k, m, w, y1 - y0, d || 0.06, C[0] + n[0] * off + tv[0] * (along || 0), (y0 + y1) / 2, C[1] + n[1] * off + tv[1] * (along || 0), ang, 'opened');
  [[0.3, 4.6], [5.6, 11.0], [12.6, 15.4]].forEach(([y0, y1]) => { face('dark', 8.4, y0, y1, 0.04, 0, 0.04); face('glass', 8.4, y0, y1, 0.12); });
  for (let a = -4.2; a <= 4.21; a += 1.4) face('frame', 0.1, 0.3, 15.4, 0.2, a, 0.2);
  [2.6, 8.3, 14.0].forEach(y => face('frame', 8.4, y - 0.05, y + 0.05, 0.2, 0, 0.2));
  face('dcSilver', 9.6, 4.6, 5.6, 0.4, 0, 0.8); face('dcSilver', 9.4, 11.0, 12.6, 0.3, 0, 0.6);
  for (let i = 0; i < 3; i++) face('stone', 10 + i * 0.8, i * 0.13, (i + 1) * 0.13, 0.6 + (2 - i) * 0.45, 0, 1.2 + (2 - i) * 0.9);
  // the floating disc: a shallow membrane funnel with radial ribs and a pale rim, on a short column and splayed struts
  { const cx = 40.5, cz = -30, R = 13, yc = 19.6, rise = 3.4, yr = yc + rise, seg = 64, rings = 10;
    const funnel = (yAt, both) => {
      const pos = [cx, yAt(0), cz], idx = [];
      for (let r = 1; r <= rings; r++) { const u = r / rings; for (let i = 0; i < seg; i++) { const a = i * Math.PI * 2 / seg; pos.push(cx + Math.cos(a) * R * u, yAt(u), cz + Math.sin(a) * R * u); } }
      for (let i = 0; i < seg; i++) idx.push(...(both ? [0, 1 + i, 1 + (i + 1) % seg] : [0, 1 + (i + 1) % seg, 1 + i]));
      for (let r = 0; r < rings - 1; r++) for (let i = 0; i < seg; i++) {
        const a = 1 + r * seg + i, b = 1 + r * seg + (i + 1) % seg, c = b + seg, d = a + seg;
        idx.push(...(both ? [a, d, b, b, d, c] : [a, b, d, b, c, d]));
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
    };
    [false, true].forEach(f => k.geo('sail', funnel(u => yc + rise * u, f), 'sail'));     // underside: rises from the centre to the rim, both faces
    [false, true].forEach(f => k.geo('sail', funnel(u => yr + 0.7 * (1 - u * u), f), 'sail'));   // top: a low dome closing the disc
    const rim = new THREE.TorusGeometry(R, 0.34, 8, 80); rim.rotateX(Math.PI / 2); rim.translate(cx, yr, cz); k.geo('steelWhite', rim, 'sail');
    for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12; rod3U(k, 'steel', [cx + Math.cos(a) * 0.8, yc + rise * 0.8 / R - 0.08, cz + Math.sin(a) * 0.8], [cx + Math.cos(a) * (R - 0.3), yr - 0.1, cz + Math.sin(a) * (R - 0.3)], 0.05, 'sail'); }
    const col = new THREE.CylinderGeometry(0.45, 0.55, yc - HT, 12); col.translate(cx, (yc + HT) / 2, cz); k.geo('steel', col, 'sail');
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; rod3U(k, 'steel', [cx + Math.cos(a) * 3, HT, cz + Math.sin(a) * 3], [cx + Math.cos(a) * 7, yc + rise * 7 / R - 0.12, cz + Math.sin(a) * 7], 0.14, 'sail'); }
  }
  // the white pylon with the centre's name at the west end of the front
  k.box('white', X0 - 6, X0, 0, 10.5, Z0 - 2.6, Z0 - 1.8, 'opened');
  // the car park behind the shops: open decks with concrete parapets, cars on the roof of the shops and on the decks
  const PL = [0, 3.3, 6.6, 9.9, 13.2, 16.5];
  PL.forEach((y, i) => { if (i) k.box('concrete', X0, X1, y - 0.35, y, ZR, ZP, 'parking');
    if (i) { k.box('concrete', X0, X1, y, y + 1.0, ZP - 0.3, ZP, 'parking'); k.box('concrete', X0, X0 + 0.3, y, y + 1.0, ZR, ZP - 0.3, 'parking'); k.box('concrete', X1 - 0.3, X1, y, y + 1.0, ZR, ZP - 0.3, 'parking'); } });
  for (let x = X0 + 1; x <= X1 - 1; x += 11) [ZR + 0.4, ZP - 0.7].forEach(z => k.box('concrete', x - 0.3, x + 0.3, 0, 16.15, z - 0.3, z + 0.3, 'parking'));
  k.box('concrete', X0, X1, 0, 0.05, ZR, ZP, 'parking');
  const CARS = ['white', 'dark', 'steel', 'cgBlue', 'red', 'grey'];
  let ci = 0;
  PL.forEach(y => { for (let x = X0 + 3; x < X1 - 12; x += 2.6) [ZR + 3.5, ZP - 3.5].forEach(z => { if (rand() > 0.6) return; const m = CARS[ci++ % CARS.length]; k.box(m, x - 0.85, x + 0.85, y + 0.3, y + 1.05, z - 2.1, z + 2.1); k.box('glassDark', x - 0.75, x + 0.75, y + 1.05, y + 1.5, z - 1.0, z + 0.9); }); });
  for (let x = X0 + 3; x < 20; x += 2.6) [Z0 + 6, ZR - 6].forEach(z => { if (rand() > 0.5) return; const m = CARS[ci++ % CARS.length]; k.box(m, x - 0.85, x + 0.85, HP - 0.55, HP + 0.2, z - 2.1, z + 2.1); k.box('glassDark', x - 0.75, x + 0.75, HP + 0.2, HP + 0.65, z - 1.0, z + 0.9); });
  // site: Franzstraße and Askanische Straße meeting at the Museumskreuzung, a tram line, the square to the west
  k.box('asphalt', P.x0, P.x1, 0, 0.03, Z0 - 16, Z0 - 6); k.box('paving', P.x0, P.x1, 0, 0.05, Z0 - 6, Z0); k.box('paving', P.x0, P.x1, 0, 0.05, Z0 - 20, Z0 - 16);
  k.box('asphalt', X1 + 8, X1 + 20, 0, 0.032, P.z0, P.z1); k.box('paving', X1, X1 + 8, 0, 0.05, Z0, P.z1); k.box('paving', X1 + 20, X1 + 24, 0, 0.05, Z0, P.z1); k.box('paving', X1 + 20, X1 + 24, 0, 0.05, P.z0, Z0 - 20);
  [-0.72, 0.72].forEach(o => k.box('rail', X1 + 14 + o - 0.04, X1 + 14 + o + 0.04, 0.032, 0.07, P.z0, P.z1, 'shops'));
  [-0.72, 0.72].forEach(o => k.box('rail', P.x0, P.x1, 0.032, 0.07, Z0 - 11 + o - 0.04, Z0 - 11 + o + 0.04, 'shops'));
  k.box('concrete', X1 + 9, X1 + 11, 0, 0.25, -10, 20, 'shops');
  k.box('glassDark', X1 + 9.4, X1 + 9.46, 0.3, 2.5, -2, 6, 'shops'); k.box('steel', X1 + 9.2, X1 + 11, 2.5, 2.65, -2.4, 6.4, 'shops');
  k.box('paving', P.x0, X0, 0, 0.05, Z0, P.z1); k.box('paving', X0, X1, 0, 0.05, ZP, P.z1);
  for (let x = X0 + 10; x < 30; x += 4) for (let j = 0; j < 4; j++) k.box('steel', x + j * 0.6, x + j * 0.6 + 0.05, 0.3, 1.0, Z0 - 3.6, Z0 - 1.9, 'shops');
  for (let i = 0; i < 9; i++) tree(k, -80 + (i % 3) * 11, -20 + Math.floor(i / 3) * 18, 0.9 + rand() * 0.25);
  const lampP = [[-60, Z0 - 4.5], [-20, Z0 - 4.5], [20, Z0 - 4.5], [X1 + 6, -10], [X1 + 6, 20]];
  lampP.forEach(q => lamp(k, q[0], q[1]));
  for (let i = 0; i < 24; i++) person(k, -20 + rand() * 60, Z0 - 5 + rand() * 4, rand() * 6.28);
  for (let i = 0; i < 8; i++) person(k, X1 + 2 + rand() * 4, -25 + rand() * 40, rand() * 6.28);
  for (let i = 0; i < 10; i++) person(k, -80 + rand() * 30, -25 + rand() * 50, rand() * 6.28);
  const grp = k.build();
  const sign = signMesh('DESSAU CENTER', 8.6, 1.2, '#c9cdd0', '#3b3f44', 'opened'); sign.position.set(C[0] + n[0] * 0.62, 11.8, C[1] + n[1] * 0.62); sign.rotation.y = Math.PI * 0.75; sign.userData.fact = 'opened'; grp.add(sign);
  { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#eceae4'; g.fillRect(0, 0, 512, 256); g.fillStyle = '#c8372d'; g.font = '600 92px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('DESSAU', 256, 80); g.fillText('CENTER', 256, 184);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.5), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }));
    m.position.set(X0 - 3, 3.4, Z0 - 2.62); m.rotation.y = Math.PI; m.userData.fact = 'opened'; grp.add(m); }
  const ps = signMesh('P', 1.2, 1.2, '#1f4fa3', '#ffffff', 'parking'); ps.position.set(X0 + 4.5, 4.6, Z0 - 0.3); ps.rotation.y = Math.PI; ps.userData.fact = 'parking'; grp.add(ps);
  const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  const cross = { cam: [82, 3, -72], tgt: [41, 10, -31] }, under = { cam: [60, 2.4, -48], tgt: [40, 19, -30] };
  return { scene, center: new THREE.Vector3(5, 0, -5), span: 110, sunDist: 280, lamps: lampP.map(q => new THREE.Vector3(q[0], 4.85, q[1])),
    intro: { pos: [115, 45, -110], tgt: [10, 10, -10] },
    views: [{ label: 'The Museumskreuzung', cam: cross.cam, tgt: cross.tgt }, { label: 'Under the disc', cam: under.cam, tgt: under.tgt }, { label: 'Franzstraße', cam: [-60, 4, -78], tgt: [0, 8, -35] }],
    facts: [
      { id: 'opened', title: 'Opened on 2 May 2009', year: '2009', pos: [C[0] + n[0] * 2.5, 13.5, C[1] + n[1] * 2.5], cam: cross.cam, tgt: cross.tgt,
        text: 'The Dessau-Center opened on 2 May 2009 at the Museumskreuzung. The Saturn electronics store opened its doors at 6 a.m., the rest of the centre at 8 a.m.',
        src: ['Stadt Dessau-Roßlau, press release of 28 April 2009', 'https://verwaltung.dessau-rosslau.de/fileadmin/Verwaltungsportal_Dessau-Rosslau/Stadt_Buerger/Presse_und_Publikationen/Archiv/Presseinformationen/2009/er_ffnung_dessaucenter.pdf'] },
      { id: 'horten', title: 'On the old Horten site', year: '2007–09', pos: [-10, HP + 2, Z0 - 0.5], cam: [-60, 4, -78], tgt: [0, 8, -35],
        text: 'The centre was built on the site of the former Horten department store, at the corner of Franzstraße and Askanische Straße. A subsidiary of the Konsum association in Berlin invested around 28 million euros in the project.',
        src: ['Immobilien Zeitung', 'https://www.iz.de/translatednews/news/dessau-shopping-in-the-city-556147'] },
      { id: 'sail', title: 'A red facade and a sail', year: '2009', pos: [44.5, 25.5, -34], cam: under.cam, tgt: under.tgt,
        text: 'A red facade and a huge membrane sail over the corner make the building easy to spot from far along the street.',
        src: ['ÖffnungszeitenBuch, Dessau Center', 'https://www.oeffnungszeitenbuch.de/dessau-center.html'] },
      { id: 'shops', title: 'Three floors of shops', year: 'today', pos: [-30, 6, Z0 - 1], cam: [-30, 3, -70], tgt: [-20, 4, -35],
        text: 'About 19,000 m² on three floors hold some 40 shops, among them Saturn, C&A and a supermarket, plus around 1,500 m² of commercial space.',
        src: ['Marcol, launch of the centre', 'https://marcol.com/news/launch-of-german-shopping-centre/'] },
      { id: 'parking', title: '500 parking spaces', year: '2009', pos: [0, 18, ZP], cam: [10, 22, 90], tgt: [0, 8, ZP],
        text: 'The centre has its own car park with 500 spaces.',
        src: ['Stadt Dessau-Roßlau, press release of 28 April 2009', 'https://verwaltung.dessau-rosslau.de/fileadmin/Verwaltungsportal_Dessau-Rosslau/Stadt_Buerger/Presse_und_Publikationen/Archiv/Presseinformationen/2009/er_ffnung_dessaucenter.pdf'] }
    ] };
}
