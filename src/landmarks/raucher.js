/* ================================================================
   Räucherturm (raucher)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['raucher'] = {
  meta: { id: 'raucher', years: '1969 · 2008', name: 'Räucherturm', sub: 'old smokehouse tower, lookout', lat: 51.834613, lon: 12.232641, build: buildRaucher, label: 'Alter Räucherturm', meta: 'Brewery, yeast factory and smokehouse tower; lookout since 2008', lead: 'The last remnant of a brewery, a yeast factory and a smokehouse, now a lookout you climb by an external steel stair. Its look is approximate.' },
  token(k) {
    k.box('brick', -5.2, 5.2, 0, 25, -5.2, 5.2); k.box('iron', 5.4, 8.8, 0, 25, -4.2, 4.2); k.box('gravel', -24, 24, 0, 0.1, -20, 22);
  },
  quiz: [
    { q: 'What was smoked in the Räucherturm?', o: ['Meat and sausage', 'Fish', 'Tobacco', 'Cheese'], a: 0, e: 'From 1969 until reunification.' }
  ]
};

function buildRaucher() {
  const k = new Kit(), TH = 25, T = 4.8;
  const P = { x0: -60, x1: 60, z0: -50, z1: 65 };
  k.box('lawn', P.x0, P.x1, -0.12, 0, P.z0, P.z1);
  // clinker brick smokehouse tower with ventilation louvers and floor cornices
  k.box('brick', -T, T, 0, TH, -T, T, 'tower');
  [7.5, 15.0, 21.5].forEach(y => {
    k.box('concrete', -T - 0.25, T + 0.25, y - 0.2, y + 0.2, -T - 0.25, T + 0.25, 'tower');
  });
  // iron anchor tie plates on the brickwork
  [[-T - 0.05, 0], [T + 0.05, 0], [0, -T - 0.05], [0, T + 0.05]].forEach(([ax, az]) => {
    [7.5, 15.0, 21.5].forEach(y => {
      const tie = new THREE.BoxGeometry(0.35, 0.35, 0.08);
      tie.translate(ax, y, az); k.geo('iron', tie, 'tower');
    });
  });
  // ventilation slits & smoke flue openings
  for (let f = 0; f < 3; f++) {
    const y = 8.5 + f * 5.2;
    for (let i = 0; i < 3; i++) {
      const x = -T + 1.2 + i * 2.4;
      const sh = new THREE.Shape(); sh.moveTo(-0.45, 0); sh.lineTo(0.45, 0); sh.lineTo(0.45, 2.2); sh.lineTo(-0.45, 2.2); sh.closePath();
      [[0, 1], [Math.PI, -1]].forEach(([r, sg]) => { const g = new THREE.ShapeGeometry(sh, 8); g.rotateY(r); g.translate(x, y, sg * (T + 0.02)); k.geo('dark', g, 'tower'); });
      [[Math.PI / 2, 1], [-Math.PI / 2, -1]].forEach(([r, sg]) => { const g = new THREE.ShapeGeometry(sh, 8); g.rotateY(r); g.translate(sg * (T + 0.02), y, x); k.geo('dark', g, 'tower'); });
    }
  }
  // observation platform at TH = 25m with safety cage railing and telescope
  k.box('steel', -T - 0.6, T + 0.6, TH, TH + 0.25, -T - 0.6, T + 0.6, 'stairs');
  rails(k, 'iron', [[-T - 0.5, -T - 0.5], [T + 0.5, -T - 0.5], [T + 0.5, T + 0.5], [-T - 0.5, T + 0.5], [-T - 0.5, -T - 0.4]], TH + 0.25, [0.55, 1.15], 'stairs');
  // tourist telescope on platform
  const tscope = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8); tscope.translate(0, TH + 0.85, T - 0.8); k.geo('steel', tscope, 'stairs');
  const tscopeHead = new THREE.CylinderGeometry(0.08, 0.12, 0.65, 8); tscopeHead.rotateX(Math.PI / 3); tscopeHead.translate(0, TH + 1.5, T - 0.8); k.geo('iron', tscopeHead, 'stairs');
  // 2008 external galvanized steel staircase
  const SX0 = T + 0.4, SX1 = T + 3.6, FL = 8, rise = TH / FL;
  [[SX0, -4.2], [SX1, -4.2], [SX0, 4.2], [SX1, 4.2]].forEach(c => k.box('iron', c[0] - 0.12, c[0] + 0.12, 0, TH + 1.2, c[1] - 0.12, c[1] + 0.12, 'stairs'));
  for (let f = 0; f < FL; f++) {
    const y0 = f * rise, y1 = (f + 1) * rise, dir = f % 2 ? -1 : 1, zA = -dir * 2.6, zB = dir * 2.6;
    k.box('steel', SX0, SX1, y1 - 0.15, y1, dir > 0 ? 2.6 : -4.2, dir > 0 ? 4.2 : -2.6, 'stairs');
    for (let s = 0; s < 14; s++) { const t0 = s / 14, zz = zA + (zB - zA) * t0, yy = y0 + rise * t0; k.box('steel', SX0 + 0.1, SX1 - 0.1, yy, yy + 0.06, Math.min(zz, zz + dir * 0.37), Math.max(zz, zz + dir * 0.37), 'stairs'); }
    rod3U(k, 'iron', [SX1, y0 + 1.0, zA], [SX1, y1 + 1.0, zB], 0.035, 'stairs');
  }
  // street art murals
  const ART = ['bauRed', 'bauYellow', 'bauBlue', 'ochre', 'copper', 'white', 'black'];
  for (let i = 0; i < 26; i++) {
    const face = i % 3, w = 0.8 + rand() * 2.2, h = 0.6 + rand() * 2.2, a = (rand() - 0.5) * (2 * T - w), y = 0.9 + rand() * 4.5, m = ART[i % ART.length];
    const dp = 0.03 + i * 0.0015;
    if (face === 0) k.box(m, a - w / 2, a + w / 2, y, y + h, -T - dp, -T, 'art');
    else if (face === 1) k.box(m, -T - dp, -T, y, y + h, a - w / 2, a + w / 2, 'art');
    else k.box(m, a - w / 2, a + w / 2, y, y + h, T, T + dp, 'art');
  }
  // lower brewery hall covered in murals
  k.box('brick', -T - 34, -T, 0, 6.8, -6.5, 6.5, 'hall'); k.box('concrete', -T - 34.3, -T, 6.8, 7.2, -6.8, 6.8, 'hall');
  { const C = ['bauRed', 'bauYellow', 'bauBlue', 'ochre', 'copper', 'white', 'black', 'cgGreen', 'cgTeal', 'cgOrange', 'cgViolet', 'cgLime'];
    for (let i = 0; i < 70; i++) { const w = 1.5 + rand() * 4.5, h = 1 + rand() * 4.8, x = -T - 33.5 + rand() * (32 - w), y = 0.2 + rand() * (6.4 - h), m = C[(i * 7) % C.length]; const dp = 0.02 + i * 0.0015; [-1, 1].forEach(sd => k.box(m, x, x + w, y, y + h, sd * 6.5 - (sd > 0 ? 0 : dp), sd * 6.5 + (sd > 0 ? dp : 0), 'hall')); } }
  for (let x = -T - 31; x < -T - 2; x += 4.6) [-1, 1].forEach(sd => k.winZ(sd * 6.5, sd, x - 0.9, x + 0.9, 3.6, 5.6, { frame: 'iron', glass: 'glassDark', tag: 'hall' }));
  // skatepark: smooth concrete bowls with steel coping, street ramps, grinding rail
  k.part = 'skate';
  { const deck = new THREE.Shape(); deck.moveTo(-26, 12); deck.lineTo(14, 12); deck.lineTo(14, 34); deck.lineTo(-26, 34); deck.closePath(); const dg = new THREE.ShapeGeometry(deck); dg.rotateX(Math.PI / 2); dg.translate(0, 0.08, 0); k.geo('concrete', dg, 'skate');
    [[-14, 22, 5.5], [2, 26, 4], [-22, 29, 3]].forEach(b => {
      const bw = new THREE.SphereGeometry(b[2], 28, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); bw.scale(1, 0.32, 1); bw.translate(b[0], 0.1, b[1]); k.geo('concrete', bw, 'skate');
      const rim = new THREE.TorusGeometry(b[2], 0.12, 6, 28); rim.rotateX(Math.PI / 2); rim.translate(b[0], 0.12, b[1]); k.geo('steel', rim, 'skate');
    });
    rotBox(k, 'concrete', 8, 1.2, 3, 8, 0.6, 16, 0.3, 'skate');
    rotBox(k, 'steel', 6, 0.08, 0.08, 6, 0.9, 19, 0, 'skate');
  }
  k.part = '';
  // railway track beside site
  k.box('gravel', P.x0, P.x1, 0, 0.12, -48, -36, 'site');
  [-44.5, -39.5].forEach(z => {
    for (let x = P.x0 + 0.4; x < P.x1; x += 0.7) k.fr('sleeper', x - 0.13, x + 0.13, 0.12, 0.22, z - 1.3, z + 1.3);
    [-0.72, 0.72].forEach(o => k.box('rail', P.x0, P.x1, 0.22, 0.34, z + o - 0.04, z + o + 0.04));
  });
  k.box('paving', -2, 2, 0, 0.04, 22, 26); k.box('paving', -2, 2, 0, 0.04, 30, P.z1); k.box('paving', P.x0, P.x1, 0, 0.04, 26, 30);
  [[-16, 34], [14, 36], [-30, -10], [32, -12], [-40, 20], [40, 18]].forEach(q => tree(k, q[0], q[1], 1.1 + rand() * 0.3));
  [[-8, 28], [8, 28]].forEach(q => k.box('wood', q[0] - 1, q[0] + 1, 0.4, 0.5, q[1] - 0.3, q[1] + 0.3));
  for (let i = 0; i < 4; i++) person(k, -10 + rand() * 20, 24 + rand() * 6, rand() * 6.28);
  person(k, 1, -1, 0, TH + 0.25); person(k, -2, 3, 2, TH + 0.25);
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return { scene, center: new THREE.Vector3(0, 0, 0), span: 70, sunDist: 200, lamps: [], intro: { pos: [-38, 22, 48], tgt: [0, 13, 0] },
    views: [{ label: 'The stair', cam: [26, 8, 22], tgt: [6, 12, 0] }, { label: 'From the platform', cam: [-1, TH + 1.9, -2], tgt: [-30, TH - 6, -60] }],
    facts: [
      { id: 'tower', title: 'Beer, yeast and spirits', year: '1920–1969', pos: [0, TH + 3.2, 0], cam: [-38, 22, 48], tgt: [0, 13, 0],
        text: 'The tower has had several lives. A brewery made beer here until 1920. Afterwards a baker’s-yeast factory ran on the site for about 50 years, and raw spirit from it was distilled in the tower.',
        src: ['Outdooractive, WelterbeRegion Anhalt Dessau Wittenberg', 'https://www.outdooractive.com/en/poi/anhalt-wittenberg/raeucherturm-a-highlight-in-the-middle-of-nowhere/805249359/'] },
      { id: 'flak', title: 'An anti-aircraft post', year: '1944', pos: [T + 0.6, TH - 3, -T], cam: [30, 30, -30], tgt: [0, 20, 0],
        text: 'In 1944 an anti-aircraft position was set up on top of the tower, part of the air defences along the railway.',
        src: ['Waymarking, from the information board at the tower', 'https://www.waymarking.com/waymarks/WMTAMK_Rucherturm_Dessau_ST_Germany'] },
      { id: 'site', title: 'The smokehouse', year: '1969–1990', pos: [-T - 0.6, 8, 0], cam: [-34, 10, -10], tgt: [0, 8, 0],
        text: 'In 1969 the yeast factory closed and the tower became a smokehouse, with a cold-smoking plant, a lift and the stair added. Around 220 people made meat and sausage products here until German reunification.',
        src: ['Waymarking and Outdooractive', 'https://www.waymarking.com/waymarks/WMTAMK_Rucherturm_Dessau_ST_Germany'] },
      { id: 'stairs', title: 'A lookout since 2008', year: '2001–2008', pos: [SX1 + 0.6, TH * 0.6, 0], cam: [26, 8, 22], tgt: [6, 12, 0],
        text: 'The city bought the site in 2001 and demolished every building except the tower. Since 2008 you can climb an external metal staircase to the viewing platform, which offers a wide view over Dessau, but only if you have a head for heights.',
        src: ['Outdooractive and Waymarking', 'https://www.outdooractive.com/en/poi/anhalt-wittenberg/raeucherturm-a-highlight-in-the-middle-of-nowhere/805249359/'] },
      { id: 'art', title: 'A lost place with street art', year: 'today', pos: [0, 3, -T - 0.6], cam: [-6, 3, -24], tgt: [0, 4, 0],
        text: 'Today the tower stands alone on a small green space between Elisabethstraße and Bitterfelder Straße, an abandoned-looking place decorated with street art. The shapes in the model only hint at the murals. The tower’s exact look is approximate, as I modelled it from descriptions.',
        src: ['Outdooractive and Freizeitmonster', 'https://www.outdooractive.com/en/poi/anhalt-wittenberg/raeucherturm-a-highlight-in-the-middle-of-nowhere/805249359/'] }
    ] };
}
