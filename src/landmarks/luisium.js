/* ================================================================
   Luisium (luisium)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['luisium'] = {
  meta: { id: 'luisium', years: '1774–78', name: 'Luisium', sub: 'Erdmannsdorff, 1774–78', lat: 51.850711, lon: 12.272089, build: buildLuisium, label: 'Luisium', meta: 'Friedrich Wilhelm von Erdmannsdorff, 1774–78', lead: 'A small country house in an English garden, built for Princess Louise.' },
  token(k) {
    k.box('luisYellow', -7.5, 7.5, 0, 13, -7.5, 7.5); k.geo('tilesRed', prism(-7.8, 7.8, -7.8, 7.8, 13, 15.2, 5.2, 5.2)); k.box('white', -2.2, 2.2, 15, 17.5, -2.2, 2.2);
  },
  quiz: [
    { q: 'Who was the Luisium built for?', o: ['Princess Louise', 'Prince Johann Georg', 'Anna Wilhelmine', 'Duke Friedrich I'], a: 0, e: 'Prince Franz built it for his wife, 1774–78.' }
  ]
};

function buildLuisium() {
  const k = new Kit(), F = 'luisYellow', S = 'stoneLight';
  const P = { x0: -80, x1: 80, z0: -70, z1: 70 };
  const RW = realWaterLocal('luisium', P); WATER_MASK = RW;
  parkGround(k, P);
  // the 15.5 m square neoclassical cube
  k.box(S, -7.5, 7.5, 0, 1.4, -7.5, 7.5, 'house'); k.box(F, -7.5, 7.5, 1.4, 12.6, -7.5, 7.5, 'house'); k.box(S, -7.8, 7.8, 12.3, 13, -7.8, 7.8, 'house');
  // red mansard roof
  k.geo('tilesRed', prism(-7.8, 7.8, -7.8, 7.8, 13, 15.2, 5.2, 5.2), 'house');
  // white corner rustication (Ecklisenen)
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(c => k.box('white', c[0] > 0 ? 6.45 : -7.55, c[0] > 0 ? 7.55 : -6.45, 1.4, 12.3, c[1] > 0 ? 6.45 : -7.55, c[1] > 0 ? 7.55 : -6.45, 'house'));
  // square Belvedere pavilion on roof with Serliana (tripartite arched) windows
  k.box('white', -2.2, 2.2, 15, 17.4, -2.2, 2.2, 'house'); k.box(S, -2.4, 2.4, 17.4, 17.7, -2.4, 2.4, 'house');
  // Serliana on each face of the belvedere: arch flanked by two rectangular lights
  [[-2.2, -1], [2.2, 1]].forEach(e => { k.winX(e[0], e[1], -1, 1, 15.4, 17, { frame: 'whiteInt', tag: 'house' }); });
  k.winZ(-2.2, -1, -1, 1, 15.4, 17, { frame: 'whiteInt', tag: 'house' });
  k.winZ(2.2, 1, -1, 1, 15.4, 17, { frame: 'whiteInt', tag: 'house' });
  // small dome on belvedere
  { const bDm = new THREE.SphereGeometry(1.4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2); bDm.scale(1, 0.7, 1); bDm.translate(0, 17.7, 0); k.geo('copper', bDm, 'house'); }
  // main façade windows (Festsaal occupies ground + first floor)
  ['z', 'x'].forEach(f => [-1, 1].forEach(sd => winGridU(k, f, sd * 7.5, sd, -4.5, 4.5, 4.5, [[2.4, 5.0], [6.4, 8.6], [9.8, 11.4]], 1.3, { mull: 0.65, tag: 'festsaal' })));
  // entrance door on south face: arched portal
  { const sh = new THREE.Shape(); sh.moveTo(-1.0, 0); sh.lineTo(1.0, 0); sh.lineTo(1.0, 2.2); sh.absarc(0, 2.2, 1.0, 0, Math.PI, false); sh.closePath(); const g = new THREE.ShapeGeometry(sh, 12); g.translate(0, 1.4, -7.52); k.geo('wood', g, 'house'); const r = new THREE.RingGeometry(1.0, 1.4, 16, 1, 0, Math.PI); r.translate(0, 3.6, -7.54); k.geo(S, r, 'house'); }
  k.box('dark', -1.2, 1.2, 1.4, 4.4, -7.56, -7.5, 'house'); for (let i = 0; i < 4; i++) k.box(S, -2.4, 2.4, 1.4 - (i + 1) * 0.35, 1.4 - i * 0.35, -7.5 - (i + 1) * 0.4, -7.5);
  /* ---------- garden buildings ---------- */
  // Schlangenhaus (Gothic garden house / snake house): pointed arch windows, slate roof
  k.box('white', 52, 58, 0, 4, 20, 26, 'garden'); k.geo('slate', prism(51.7, 58.3, 19.7, 26.3, 4, 7.5, 0, 3.3), 'garden');
  // Gothic pointed windows on Schlangenhaus
  [[53.5, 55], [55.8, 57.3]].forEach(w => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(1.5, 0); sh.lineTo(1.5, 1.6); sh.lineTo(0.75, 2.6); sh.lineTo(0, 1.6); sh.closePath(); const g = new THREE.ShapeGeometry(sh); g.rotateY(Math.PI); g.translate(w[1], 0.8, 19.97); k.geo('glassDark', g, 'garden'); });
  // Gothic drip mouldings above windows
  [[53.5, 55], [55.8, 57.3]].forEach(w => { const mid = (w[0] + w[1]) / 2; const dm = new THREE.ConeGeometry(0.9, 0.5, 3); dm.rotateY(Math.PI); dm.translate(mid, 3.5, 20.1); k.geo(S, dm, 'garden'); });
  // 9-bay Orangery: long cream pavilion with arched windows
  k.box('cream', -40, -16, 0, 5.5, 36, 42, 'garden'); k.geo('slate', prism(-40.2, -15.8, 35.8, 42.2, 5.5, 7.2, 3, 3), 'garden'); winGridU(k, 'z', 36, -1, -38, -18, 2.5, [[0.6, 4.6]], 1.6, { glass: 'glassDark', tag: 'garden' });
  // Gatehouses flanking the south approach
  [-1, 1].forEach(sd => { k.box('cream', sd * 9 - 2.5, sd * 9 + 2.5, 0, 4.5, -60, -55); k.geo('slate', prism(sd * 9 - 2.7, sd * 9 + 2.7, -60.2, -54.8, 4.5, 6.6, 2.7, 2.7)); });
  // Ruin arch in the park
  k.box('stone', -46, -44, 0, 6, -20, -18, 'garden'); k.box('stone', -38, -36, 0, 4.4, -20, -18, 'garden'); { const r = new THREE.RingGeometry(3, 4, 16, 1, 0, Math.PI); r.translate(-41, 4.4, -18.98); k.geo('stone', r, 'garden'); }
  // Schwanenteich (swan pond) – elliptical
  // rowing boat on the pond
  { const bh = new THREE.CylinderGeometry(0.4, 0.6, 3.5, 8, 1, false, 0, Math.PI * 2); bh.scale(1, 0.35, 1); bh.rotateZ(-Math.PI / 12); bh.translate(37, 0.32, 12); k.geo('wood', bh, 'garden'); }
  // gravel paths
  k.box('gravel', -3, 3, 0, 0.04, -55, -9); k.box('gravel', -60, 60, 0, 0.04, -3, 3);
  k.box('wood', 23.5, 49.5, 0.5, 0.75, -1.7, 1.7, 'garden'); [-1.6, 1.6].forEach(z => { k.box('wood', 23.5, 49.5, 1.6, 1.72, z - 0.06, z + 0.06, 'garden'); for (let x = 24; x <= 49; x += 2.5) k.box('wood', x - 0.06, x + 0.06, 0.75, 1.6, z - 0.06, z + 0.06, 'garden'); });
  for (let i = 0; i < 34; i++) { const x = P.x0 + 6 + rand() * (P.x1 - P.x0 - 12), z = P.z0 + 6 + rand() * (P.z1 - P.z0 - 12); if (Math.abs(x) < 20 && Math.abs(z) < 20) continue; if (Math.hypot(x - 40, z + 25) < 28) continue; if (x > 48 && x < 62 && z > 16 && z < 30) continue; if (x > -44 && x < -12 && z > 32 && z < 46) continue; tree(k, x, z, 1.1 + rand() * 0.5); }
  for (let i = 0; i < 8; i++) person(k, -2 + rand() * 4, -50 + rand() * 38, rand() * 6.28);
  WATER_MASK = null; addWater(k, RW, 0.06, 'garden');
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return { scene, center: new THREE.Vector3(0, 0, 0), span: 85, sunDist: 220, lamps: [], intro: { pos: [-45, 18, -55], tgt: [0, 8, 0] },
    views: [{ label: 'From the gatehouses', cam: [0, 2.5, -62], tgt: [0, 9, 0] }, { label: 'Across the pond', cam: [70, 4, -35], tgt: [0, 8, 0] }, { label: 'Schlangenhaus', cam: [50, 8, 12], tgt: [33, 3, 23] }],
    facts: [
      { id: 'house', title: 'A gift to Louise', year: '1774–78', pos: [0, 19, 0], cam: [0, 2.5, -62], tgt: [0, 9, 0],
        text: 'Prince Franz had Friedrich Wilhelm von Erdmannsdorff build this small house from 1774 to 1778 for his wife, Louise of Brandenburg-Schwedt, in the style of an English country house. It is named after her.',
        src: ['Wikipedia (en)', 'https://en.wikipedia.org/wiki/Luisium'] },
      { id: 'festsaal', title: 'A temple of female virtues', year: '1778', pos: [7.9, 7, 0], cam: [30, 6, 10], tgt: [0, 6, 0],
        text: 'The small rooms keep much of their original stucco and wall paintings. The ceiling painting of the festive hall on the ground floor presents the house as a temple of female virtues.',
        src: ['ADAC Maps', 'https://maps.adac.de/poi/schloss-luisium-dessau-rosslau'] },
      { id: 'garden', title: 'Snake house and ruin arch', year: 'today', pos: [33, 8.6, 23], cam: [50, 8, 50], tgt: [30, 3, 22],
        text: 'The English landscape garden holds the Schlangenhaus, the orangery, gatehouses and a ruin arch. A sight line from the house leads to the church of Waldersee, whose tower, topped by an obelisk, holds the tomb of the princely couple.',
        src: ['ADAC Maps', 'https://maps.adac.de/poi/schloss-luisium-dessau-rosslau'] },
      { id: 'franz', title: 'Where Prince Franz died', year: '1817', pos: [-7.9, 9, -4], cam: [-35, 8, -20], tgt: [0, 7, 0],
        text: 'Prince Franz, the creator of the Garden Realm, died at Luisium on 9 August 1817, aged 76.',
        src: ['Wikipedia (en), Leopold III', 'https://en.wikipedia.org/wiki/Leopold_III,_Duke_of_Anhalt-Dessau'] }
    ] };
}
function winGridU(k, face, c, s, a0, a1, step, floors, w, opt) { for (let a = a0; a <= a1; a += step) floors.forEach(f => { if (face === 'z') k.winZ(c, s, a - w / 2, a + w / 2, f[0], f[1], opt); else k.winX(c, s, a - w / 2, a + w / 2, f[0], f[1], opt); }); }
