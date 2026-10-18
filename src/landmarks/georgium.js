/* ================================================================
   Schloss Georgium (georgium)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['georgium'] = {
  meta: { id: 'georgium', years: '1780', name: 'Schloss Georgium', sub: 'Erdmannsdorff, 1780', lat: 51.844225, lon: 12.230304, build: buildGeorgium, label: 'Schloss Georgium', meta: 'Friedrich Wilhelm von Erdmannsdorff, from 1780', lead: 'A neoclassical country house in a landscape park, home of the Anhalt picture gallery.' },
  token(k) {
    k.box('white', -19, 19, 0, 11, -7.5, 7.5); k.box('white', -19, -10, 0, 11, 7.5, 22); k.box('white', 10, 19, 0, 11, 7.5, 22); k.geo('slate', prism(-19.3, 19.3, -7.8, 7.8, 11, 14.4, 4.6, 4.6)); k.box('white', -2.1, 2.1, 14, 17.5, -2.1, 2.1);
  },
  quiz: [
    { q: 'Who was the Georgium named after?', o: ['Prince Johann Georg', 'King George III', 'Saint George', 'Georg Wenzeslaus von Knobelsdorff'], a: 0, e: 'The younger brother of Prince Franz.' }
  ]
};

function buildGeorgium() {
  const k = new Kit(), F = 'white', S = 'stoneLight';
  const P = { x0: -90, x1: 90, z0: -70, z1: 80 };
  parkGround(k, P);
  // today: long two-storey body, wings behind, pediments, domed belvedere
  const GX = 19, GZ = 7.5, GH = 11.2, WZ = 22, GFL = [[2.0, 4.8], [6.4, 9.6]];
  k.part = 'gToday';
  // rusticated plinth
  k.box(S, -GX, GX, 0, 1.0, -GZ, GZ, 'house'); k.box(F, -GX, GX, 1.0, GH, -GZ, GZ, 'house'); k.box(S, -GX - 0.3, GX + 0.3, GH - 0.4, GH + 0.2, -GZ - 0.3, GZ + 0.3, 'house');
  // piano nobile: window pediments on central bays (Erdmannsdorff detail)
  [-6, 0, 6].forEach(x => { const sh = new THREE.Shape(); sh.moveTo(-1.1, 0); sh.lineTo(1.1, 0); sh.lineTo(0, 0.5); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: 0.2, bevelEnabled: false }); g.translate(x, GFL[1][1] + 0.05, -GZ - 0.2); k.geo(S, g, 'house'); });
  // Anhalt coat-of-arms cartouche over central window on façade
  { const ca = new THREE.CircleGeometry(0.8, 16); ca.translate(0, GH - 0.5, -GZ - 0.12); k.geo('bronzeDark', ca, 'house'); const cr = new THREE.RingGeometry(0.8, 1.1, 16); cr.translate(0, GH - 0.5, -GZ - 0.13); k.geo(S, cr, 'house'); }
  // side wings reaching back
  [-1, 1].forEach(sd => { const xa = sd < 0 ? -GX : GX - 9, xb = sd < 0 ? -GX + 9 : GX; k.box(S, xa, xb, 0, 1.0, GZ, WZ, 'wings'); k.box(F, xa, xb, 1.0, GH, GZ, WZ, 'wings'); k.box(S, xa - 0.3, xb + 0.3, GH - 0.4, GH + 0.2, GZ + 0.3, WZ + 0.3, 'wings');
    k.geo('slate', prism(xa - 0.3, xb + 0.3, GZ - 4, WZ + 0.3, GH + 0.2, GH + 3.2, 4.8, 4.8), 'wings'); pedimentU(k, S, (xa + xb) / 2 - 3.2, (xa + xb) / 2 + 3.2, GH + 0.2, 2.0, WZ, 0.6, 'wings');
    for (let z = GZ + 2.2; z < WZ - 1; z += 3.3) GFL.forEach(f => k.winX(sd < 0 ? xa : xb, sd, z - 0.7, z + 0.7, f[0], f[1], { mull: 0.7, trans: [f[0] + 2], frame: S, tag: 'wings' }));
    for (let x = xa + 1.6; x < xb - 1; x += 2.9) GFL.forEach(f => k.winZ(WZ, 1, x - 0.65, x + 0.65, f[0], f[1], { mull: 0.65, frame: S, tag: 'wings' })); });
  k.geo('slate', prism(-GX - 0.3, GX + 0.3, -GZ - 0.3, GZ + 0.3, GH + 0.2, GH + 3.6, 4.6, 4.6), 'house');
  rails(k, S, [[-GX, -GZ - 0.2], [-6, -GZ - 0.2]], GH + 0.2, [0.7], 'house'); rails(k, S, [[6, -GZ - 0.2], [GX, -GZ - 0.2]], GH + 0.2, [0.7], 'house');
  [-1, 1].forEach(sd => { const z = sd * GZ; for (let x = -GX + 1.8; x < GX - 1; x += 3.0) { if (sd < 0 && Math.abs(x) < 1.6) continue; if (sd > 0 && Math.abs(x) + 0.65 > GX - 9) continue; GFL.forEach((f, fi) => k.winZ(z, sd, x - 0.65, x + 0.65, f[0], f[1], { mull: 0.65, trans: [f[0] + 2], frame: S, tag: 'house' })); if (sd < 0) { const hd = new THREE.Shape(); hd.moveTo(-0.95, 0); hd.lineTo(0.95, 0); hd.lineTo(0, 0.45); hd.closePath(); const g = new THREE.ExtrudeGeometry(hd, { depth: 0.25, bevelEnabled: false }); g.translate(x, GFL[0][1] + 0.15, z - 0.25); k.geo(S, g, 'house'); } } });
  pedimentU(k, S, -5.6, 5.6, GH + 0.2, 2.4, -GZ, 0.7, 'house'); k.box('dark', -1.1, 1.1, 1.0, 4.4, -GZ - 0.06, -GZ - 0.02, 'house'); for (let i = 0; i < 4; i++) k.box(S, -2.4, 2.4, 1.0 - (i + 1) * 0.25, 1.0 - i * 0.25, -GZ - (i + 1) * 0.4, -GZ);
  // rooftop octagonal belvedere with copper cupola
  k.box(F, -2.1, 2.1, GH + 3.0, GH + 6.2, -2.1, 2.1, 'house'); k.box(S, -2.3, 2.3, GH + 6.2, GH + 6.5, -2.3, 2.3, 'house');
  [[-1, 'z'], [1, 'z'], [-1, 'x'], [1, 'x']].forEach(d => { const sh = new THREE.Shape(); sh.moveTo(-0.55, 0); sh.lineTo(0.55, 0); sh.lineTo(0.55, 1.6); sh.absarc(0, 1.6, 0.55, 0, Math.PI, false); sh.closePath(); const g = new THREE.ShapeGeometry(sh, 10); if (d[1] === 'x') g.rotateY(Math.PI / 2); g.translate(d[1] === 'x' ? d[0] * 2.12 : 0, GH + 3.6, d[1] === 'z' ? d[0] * 2.12 : 0); k.geo('glassDark', g, 'house'); });
  { const dm = new THREE.SphereGeometry(1.8, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2); dm.scale(1, 0.75, 1); dm.translate(0, GH + 6.5, 0); k.geo('copper', dm, 'house'); }
  // urn finials on corners of main block
  [[-GX + 1, GZ + 0.1], [GX - 1, GZ + 0.1], [-GX + 1, -GZ - 0.1], [GX - 1, -GZ - 0.1]].forEach(u => { const ug = new THREE.CylinderGeometry(0.22, 0.18, 0.6, 10); ug.translate(u[0], GH + 0.5, u[1]); k.geo(S, ug, 'house'); });
  k.part = '';
  // 1780: Erdmannsdorff's compact cube
  k.part = 'v:cube'; k.box(S, -9, 9, 0, 1.2, -8, 8, 'house'); k.box(F, -9, 9, 1.2, 12.5, -8, 8, 'house'); k.box(S, -9.3, 9.3, 12.2, 13, -8.3, 8.3, 'house'); k.geo('slate', prism(-9.3, 9.3, -8.3, 8.3, 13, 16.5, 4, 4), 'house'); pedimentU(k, S, -3.8, 3.8, 13, 2.2, -8, 0.6, 'house');
  [-1, 1].forEach(sd => { for (let x = -7; x <= 7; x += 3.5) [[2.2, 5.2], [7.0, 9.6]].forEach(f => k.winZ(sd * 8, sd, x - 0.65, x + 0.65, f[0], f[1], { mull: 0.65, frame: S, tag: 'house' })); for (let z = -5; z <= 5; z += 3.3) [[2.2, 5.2], [7.0, 9.6]].forEach(f => k.winX(sd * 9, sd, z - 0.65, z + 0.65, f[0], f[1], { mull: 0.65, frame: S, tag: 'house' })); }); k.part = '';
  // parkland: Ionic monopteros round temple, Roman ruin arch, serpentine pond
  k.box(F, -22, 22, 0, 6.5, 48, 56, 'orangery'); k.geo('slate', prism(-22.2, 22.2, 47.8, 56.2, 6.5, 8.6, 4, 4), 'orangery');
  for (let x = -19; x <= 19; x += 4.2) { const sh = new THREE.Shape(); sh.moveTo(-1.1, 0); sh.lineTo(1.1, 0); sh.lineTo(1.1, 3.6); sh.absarc(0, 3.6, 1.1, 0, Math.PI, false); sh.closePath(); const g = new THREE.ShapeGeometry(sh, 12); g.rotateY(Math.PI); g.translate(x, 0.6, 47.97); k.geo('glassDark', g, 'orangery'); }
  // Ionic monopteros: 8 columns, entablature, copper dome
  const tc = [-52, 28]; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const c = new THREE.CylinderGeometry(0.28, 0.3, 5, 12); c.translate(tc[0] + Math.cos(a) * 3, 3.2, tc[1] + Math.sin(a) * 3); k.geo('whiteInt', c, 'park'); }
  { const b = new THREE.CylinderGeometry(3.8, 3.8, 0.7, 24); b.translate(tc[0], 0.35, tc[1]); k.geo(S, b, 'park'); const e = new THREE.CylinderGeometry(3.6, 3.6, 0.6, 24); e.translate(tc[0], 6.0, tc[1]); k.geo('whiteInt', e, 'park'); const d = new THREE.SphereGeometry(3.4, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2); d.translate(tc[0], 6.3, tc[1]); k.geo('copper', d, 'park'); }
  // Roman ruin arch (two piers + half-arch)
  k.box('stone', 48, 50, 0, 7, -40, -38, 'park'); k.box('stone', 56, 58, 0, 5.2, -40, -38, 'park'); { const r = new THREE.RingGeometry(3, 4, 16, 1, 0, Math.PI); r.translate(53, 5, -38.98); k.geo('stone', r, 'park'); }
  // serpentine park pond

  // gravel paths
  k.box('gravel', -4, 4, 0, 0.04, P.z0, -9); k.box('gravel', -24, 24, 0, 0.04, 20, 47);
  for (let i = 0; i < 36; i++) { const x = P.x0 + 6 + rand() * (P.x1 - P.x0 - 12), z = P.z0 + 6 + rand() * (P.z1 - P.z0 - 12); if (Math.abs(x) < 32 && z > -16 && z < 60) continue; if (Math.hypot(x - 48, z - 20) < 26 || Math.hypot(x + 52, z - 28) < 8) continue; tree(k, x, z, 1.1 + rand() * 0.5); }
  for (let i = 0; i < 10; i++) person(k, -20 + rand() * 40, 22 + rand() * 20, rand() * 6.28);
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return { scene, center: new THREE.Vector3(0, 0, 5), span: 95, sunDist: 240, lamps: [], intro: { pos: [-55, 22, -70], tgt: [0, 8, 5] },
    eras: [
      { year: '1780', title: 'Erdmannsdorff\'s cube', note: 'Friedrich Wilhelm von Erdmannsdorff built a compact neoclassical country house for Prince Johann Georg from 1780. Its exact early form is reconstructed here from that description.', hide: ['gToday'], show: ['v:cube'] },
      { year: 'today', title: 'The enlarged house', note: 'The house got its long body, back wings and lookout when it was remodelled for the widowed Hereditary Princess Elisabeth, in the years the Mausoleum park next door was laid out. It has held the Anhaltische Gemäldegalerie since 1959.' }
    ],
    views: [{ label: 'Up the avenue', cam: [0, 2.5, -60], tgt: [0, 9, 0] }, { label: 'From the orangery', cam: [10, 4, 44], tgt: [0, 8, 0] }, { label: 'The round temple', cam: [-38, 6, 16], tgt: [-52, 4, 28] }],
    facts: [
      { id: 'house', title: 'A prince\'s country house', year: '1780', pos: [0, 17.5, -2], cam: [0, 2.5, -60], tgt: [0, 9, 0],
        text: 'From 1780 Prince Johann Georg, younger brother of Prince Franz, had Friedrich Wilhelm von Erdmannsdorff build a neoclassical country house north of the town, and named the park after himself.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Georgium'] },
      { id: 'wings', title: 'Wings for a widow', year: '1890s', pos: [-17, 11, -6.6], cam: [-50, 12, -40], tgt: [-15, 6, 0],
        text: 'The house was first a compact cube. The two side wings were added when the Georgium was remodelled for the widowed Hereditary Princess Elisabeth, at the time the neighbouring Mausoleum park was laid out.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Georgium'] },
      { id: 'orangery', title: 'Old Masters since 1959', year: '1927–2023', pos: [0, 9.5, 47.5], cam: [10, 4, 44], tgt: [0, 8, 0],
        text: 'The house holds the Anhaltische Gemäldegalerie, founded in 1927, with about 1,800 paintings including major works by Lucas Cranach the Elder. In 1946 the Soviet trophy commission took 800 paintings; 600 came back in 1958–59. A long renovation was completed in 2023.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Georgium'] },
      { id: 'park', title: 'Open to the public', year: '1780', pos: [-52, 10.5, 28], cam: [-70, 8, 50], tgt: [-50, 4, 28],
        text: 'The prince commissioned the gardeners Johann Georg Schoch and Johann Friedrich Eyserbeck to create an English landscape park that was open to the public, with an Ionic round temple, a Roman ruin and copies of ancient gateways. Georgium has been part of the UNESCO World Heritage Site since 2000.',
        src: ['Gartenträume Sachsen-Anhalt', 'https://gartentraeume-sachsen-anhalt.de/en/garden-dreams-parks/georgium-palace-georgengarten-and-beckerbruch-on-the-elbe.html'] }
    ] };
}
