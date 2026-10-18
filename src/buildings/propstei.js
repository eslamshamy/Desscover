/* ---------- Propsteikirche St. Peter und Paul, Dessau: neo-Gothic, Vinzenz Statz, 1854–58 ---------- */

export function buildPropstei(context) {
  const { Kit, THREE, clockFaces, gableRoof, gothWin, person, pinnacle, plinth, pointedShape, rand, realContext, registerNoAO } = context;

  // outline from the map data, long axis along x: tower at the west end on the street, a 14.4 m nave with buttresses at every bay, a polygonal apse
  const k = new Kit(), B = 'brick', S = 'stoneLight';
  const P = { x0: -64, x1: 62, z0: -48, z1: 48 };
  k.box('paving', P.x0, P.x1, -0.12, 0, P.z0, P.z1);
  const NZ0 = -6.6, NZ1 = 7.8, NC = 0.6, EH = 11.5, NX0 = -17.7, NSPLIT = -1.6, NX1 = 14;
  const BUT = [-13.5, -7.4, -2.3, 2.9, 8.6, 13.5], WIN = [-15.6, -10.4, -4.8, 0.3, 5.7, 11.1];
  const nave = (x0, x1, part) => { k.part = part; k.box(S, x0, x1, 0, 0.8, NZ0, NZ1, 'nave'); k.box(B, x0, x1, 0.8, EH, NZ0, NZ1, 'nave');
    WIN.filter(x => x > x0 && x < x1).forEach(x => [-1, 1].forEach(sd => gothWin(k, 'z', sd > 0 ? NZ1 : NZ0, sd, x, 2.6, 2.2, 7.2, 'nave')));
    BUT.filter(x => x > x0 - 0.1 && x < x1 + 0.1).forEach(x => [-1, 1].forEach(sd => { const zw = sd > 0 ? NZ1 : NZ0; k.box(B, x - 0.5, x + 0.5, 0, EH - 1.2, sd > 0 ? zw : zw - 2.0, sd > 0 ? zw + 2.0 : zw, 'nave'); pinnacle(k, S, x, EH - 1.2, zw + sd * 1.0, 1.2, 0.6, 'nave'); }));
    k.part = part === '' ? 'roof' : 'roof1912'; gableRoof(k, 'slate', x0 - 0.2, x1 + 0.2, NZ0 - 0.5, NZ1 + 0.5, EH, 9.5, true, 'nave'); k.part = ''; };
  nave(NX0, NSPLIT, ''); nave(NSPLIT, NX1, 'east1912');
  const apse = (x, r, sx, part) => { k.part = part; const a = new THREE.CylinderGeometry(r, r, EH, 6, 1, false, 0, Math.PI); a.scale(sx, 1, 1); a.translate(x, EH / 2, NC); k.geo(B, a, 'nave'); const rf = new THREE.ConeGeometry(r + 0.4, 7, 6, 1, false, 0, Math.PI); rf.scale(sx, 1, 1); rf.translate(x, EH + 3.5, NC); k.geo('slate', rf, 'nave');
    [-0.78, 0, 0.78].forEach(t => { const nx = Math.cos(t) / sx, nz = Math.sin(t), ln = Math.hypot(nx, nz), g = new THREE.ShapeGeometry(pointedShape(1.8, 6.4), 8); g.rotateY(Math.atan2(nx / ln, nz / ln)); g.translate(x + Math.cos(t) * r * sx * 0.93 + nx / ln * 0.2, 2.8, NC + Math.sin(t) * r * 0.93 + nz / ln * 0.2); k.geo('glassDark', g, 'nave'); });
    for (let i = 1; i < 6; i++) { const t = -Math.PI / 2 + i / 6 * Math.PI, xx = x + Math.cos(t) * (r * sx + 0.6), zz = NC + Math.sin(t) * (r + 0.6); k.box(B, xx - 0.5, xx + 0.5, 0, EH - 1.4, zz - 0.5, zz + 0.5, 'nave'); } k.part = ''; };
  apse(NX1, 7.2, 1.55, 'east1912'); apse(NSPLIT, 6.4, 0.8, 'v:apse1858');
  // the west tower: square brick stages with a portal, tracery window, clock and belfry; gablets and an octagonal brick spire
  const TX0 = -23.8, TX1 = NX0, TZ = 1.25, TH = 3.4, TC = (TX0 + TX1) / 2;
  k.box(S, TX0 - 0.1, TX1 + 0.1, 0, 1.0, TZ - TH - 0.1, TZ + TH + 0.1, 'tower'); k.box(B, TX0, TX1, 1.0, 22, TZ - TH, TZ + TH, 'tower');
  [[TX0, TZ - TH], [TX0, TZ + TH]].forEach(c => k.box(B, c[0] - 1.0, c[0] + 0.4, 0, 15, c[1] - 0.6, c[1] + 0.6, 'tower'));
  [7.2, 15.2].forEach(y => k.box(S, TX0 - 0.15, TX1, y, y + 0.35, TZ - TH - 0.15, TZ + TH + 0.15, 'tower'));
  gothWin(k, 'x', TX0, -1, TZ, 0.9, 2.6, 5.0, 'tower', 'wood'); gothWin(k, 'x', TX0, -1, TZ, 7.9, 2.2, 5.6, 'tower');
  clockFaces(k, TC, 16.9, TZ, TH, 1.25, 'white', 'black', 'tower');
  [-1, 1].forEach(o => { gothWin(k, 'x', TX0, -1, TZ + o * 1.0, 18.6, 0.9, 3.0, 'tower', 'dark'); gothWin(k, 'z', TZ - TH, -1, TC + o * 1.0, 18.6, 0.9, 3.0, 'tower', 'dark'); gothWin(k, 'z', TZ + TH, 1, TC + o * 1.0, 18.6, 0.9, 3.0, 'tower', 'dark'); });
  [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(d => { const gb = new THREE.Shape(); gb.moveTo(-3.4, 0); gb.lineTo(3.4, 0); gb.lineTo(0, 3.4); gb.closePath(); const g = new THREE.ExtrudeGeometry(gb, { depth: 0.4, bevelEnabled: false }); g.translate(0, 0, -0.2); g.rotateY(Math.atan2(d[0], d[1])); g.translate(TC + d[0] * (TH - 0.2), 22, TZ + d[1] * (TH - 0.2)); k.geo(B, g, 'tower'); });
  { const sp = new THREE.ConeGeometry(3.2, 16, 8); sp.rotateY(Math.PI / 8); sp.translate(TC, 30, TZ); k.geo(B, sp, 'tower'); [0, 1, 2, 3].forEach(i => { const a = i * Math.PI / 2, x = TC + Math.cos(a) * 2.5, z = TZ + Math.sin(a) * 2.5; k.box(B, x - 0.35, x + 0.35, 25.5, 27, z - 0.35, z + 0.35, 'tower'); });
    k.box('iron', TC - 0.07, TC + 0.07, 38, 41, TZ - 0.07, TZ + 0.07, 'tower'); k.box('iron', TC - 0.07, TC + 0.07, 39.6, 39.8, TZ - 0.8, TZ + 0.8, 'tower'); }
  // 1945: burnt out and roofless
  k.part = 'v:ruin'; for (let i = 0; i < 24; i++) { const x = NX0 + 1 + rand() * 38, z = NZ0 + 1 + rand() * (NZ1 - NZ0 - 2); k.box('soot', x, x + 1 + rand() * 2, 0.8, 1.2 + rand() * 1.6, z, z + 1 + rand() * 2); } k.part = '';
  // the real surroundings: the curving street in front of the tower, the parish buildings to the south, the neighbours to the north
  realContext(k, 'propstei', P, { own: [-26, 27, -11, 12] });
  for (let i = 0; i < 10; i++) person(k, -32 + rand() * 4, -30 + rand() * 60, rand() * 6.28);
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return { scene, center: new THREE.Vector3(0, 0, 0), span: 70, sunDist: 220, lamps: [], intro: { pos: [-58, 18, 42], tgt: [-4, 14, 0] },
    views: [{ label: 'The tower front', cam: [-56, 3, TZ], tgt: [TC, 20, TZ] }, { label: 'The spire', cam: [-40, 40, 24], tgt: [TC, 32, TZ] }, { label: 'The choir', cam: [44, 8, 34], tgt: [14, 8, 0] }],
    eras: [
      { year: '1858', title: 'Consecrated', note: 'The church as consecrated on 27 October 1858, before it was lengthened by three vaults to the east; the original east end is simplified here.', hide: ['east1912', 'roof1912'], show: ['v:apse1858'] },
      { year: '1945', title: 'Burnt out', note: 'The air raid of 7 March 1945 burnt the church out. Rebuilding began in 1951 and was finished in 1958.', hide: ['roof', 'roof1912'], show: ['v:ruin'] },
      { year: 'today', title: 'Provost church', note: 'Lengthened to the east in 1904–12, rebuilt in 1951–58 and a provost church since 1974; renovated from 2017 to 2023.' }
    ],
    facts: [
      { id: 'statz', title: 'Designed by Vinzenz Statz', year: '1854–58', pos: [0, EH + 11, 0], cam: [-58, 18, 40], tgt: [-6, 14, 0],
        text: 'Pastor Franz Küstner built this three-aisled neo-Gothic church in 1854–58 to plans by the Cologne architect Vinzenz Statz. Duke Leopold Friedrich gave the land, and the nuncio Flavio Chigi consecrated it on 27 October 1858.',
        src: ['Wikipedia (de), Peter-und-Paul-Kirche (Dessau)', 'https://de.wikipedia.org/wiki/Peter-und-Paul-Kirche_(Dessau)'] },
      { id: 'tower', title: '41 metres to the cross', year: '1858', pos: [TC, 42.5, TZ], cam: [-40, 40, 24], tgt: [TC, 32, TZ],
        text: 'The tower is 38 metres high, 41 metres with the cross.',
        src: ['Wikipedia (de), Peter-und-Paul-Kirche (Dessau)', 'https://de.wikipedia.org/wiki/Peter-und-Paul-Kirche_(Dessau)'] },
      { id: 'east', title: 'Three vaults longer', year: '1904–12', pos: [10, EH + 2, NZ1 + 2.2], cam: [44, 8, 34], tgt: [14, 8, 0],
        text: 'Under Heinrich Haehling von Lanzenauer the church was lengthened by three vaults to the east, in the years when the parish also built the St. Joseph hospital and a Catholic school.',
        src: ['Wikipedia (de), Peter-und-Paul-Kirche (Dessau)', 'https://de.wikipedia.org/wiki/Peter-und-Paul-Kirche_(Dessau)'] },
      { id: 'war', title: 'Burnt out and rebuilt', year: '1945–58', pos: [-6, EH + 2, NZ0 - 2.2], cam: [-10, 10, -52], tgt: [0, 8, 0],
        text: 'The air raid of 7 March 1945 burnt the church out, and its last bell melted. Rebuilding began in 1951 and was completed in 1958; four new bells were consecrated in 1956.',
        src: ['Wikipedia (de), Peter-und-Paul-Kirche (Dessau)', 'https://de.wikipedia.org/wiki/Peter-und-Paul-Kirche_(Dessau)'] },
      { id: 'altar', title: 'A new altar', year: '2023', pos: [TX0 - 1, 6, TZ], cam: [-56, 3, TZ], tgt: [TC, 20, TZ],
        text: 'The church became a provost church in 1974. After renovation from 2017 to 2023, Bishop Gerhard Feige consecrated a new altar on Easter Monday, 10 April 2023.',
        src: ['Wikipedia (de), Peter-und-Paul-Kirche (Dessau)', 'https://de.wikipedia.org/wiki/Peter-und-Paul-Kirche_(Dessau)'] }
    ] };

}
