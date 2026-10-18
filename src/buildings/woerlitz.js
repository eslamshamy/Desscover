/* ---------- Wörlitz: palace, lake, the island Stein and the Gothic House ---------- */

export function buildWoerlitz(context) {
  const { Kit, THREE, colonnadeU, parkGround, pedimentU, person, plinth, prism, rails, rand, registerNoAO, tree } = context;

  const k = new Kit(), F = 'cream', S = 'stoneLight';
  const P = { x0: -120, x1: 140, z0: -170, z1: 70 };
  parkGround(k, P);
  // landscape lake (old arm of the Elbe)
  const lake = new THREE.CircleGeometry(80, 48); lake.rotateX(-Math.PI / 2); lake.scale(1.5, 1, 0.9); lake.translate(10, 0.03, -95); k.geo('water', lake, 'lake');
  // palace: 11 × 7 window axes, 4-column Corinthian portico
  k.box(S, -17, 17, 0, 1.6, -11, 11, 'palace'); k.box(F, -17, 17, 1.6, 15, -11, 11, 'palace'); k.box(S, -17.3, 17.3, 14.7, 15.6, -11.3, 11.3, 'palace');
  k.geo('slate', prism(-17.3, 17.3, -11.3, 11.3, 15.6, 18.2, 4, 4), 'palace');
  // rooftop belvedere cube with dome and urns
  k.box('white', -3, 3, 17.8, 20.4, -3, 3, 'palace'); k.box(S, -3.2, 3.2, 20.4, 20.8, -3.2, 3.2, 'palace'); rails(k, 'white', [[-3.1, -3.1], [3.1, -3.1], [3.1, 3.1], [-3.1, 3.1], [-3.1, -3.09]], 20.8, [0.7], 'palace');
  { const dm = new THREE.SphereGeometry(2.2, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2); dm.scale(1, 0.8, 1); dm.translate(0, 20.8, 0); k.geo('white', dm, 'palace'); const lt = new THREE.CylinderGeometry(0.5, 0.5, 1, 10); lt.translate(0, 23, 0); k.geo('white', lt, 'palace'); }
  [-1, 1].forEach(sd => k.winZ(sd * 3, sd, -1.2, 1.2, 18.4, 20, { frame: 'whiteInt', tag: 'palace' }));
  // urn finials on belvedere corners
  [[-3, -3], [3, -3], [3, 3], [-3, 3]].forEach(u => { const ug = new THREE.CylinderGeometry(0.2, 0.16, 0.55, 10); ug.translate(u[0], 21.1, u[1]); k.geo(S, ug, 'palace'); });
  // window grid: 11 axes on long sides, 7 on short sides, 3 floors
  const axes = Array.from({ length: 11 }, (_, i) => -15 + i * 3); axes.forEach(x => { if (Math.abs(x) < 4.5) return; [[2.6, 5.4], [6.8, 10.0], [11.4, 13.6]].forEach(f => { k.winZ(11, 1, x - 0.7, x + 0.7, f[0], f[1], { mull: 0.7, frame: 'whiteInt', tag: 'palace' }); k.winZ(-11, -1, x - 0.7, x + 0.7, f[0], f[1], { mull: 0.7, frame: 'whiteInt', tag: 'palace' }); }); });
  Array.from({ length: 7 }, (_, i) => -9 + i * 3).forEach(z => [[2.6, 5.4], [6.8, 10.0], [11.4, 13.6]].forEach(f => [-1, 1].forEach(sd => k.winX(sd * 17, sd, z - 0.7, z + 0.7, f[0], f[1], { mull: 0.7, frame: 'whiteInt', tag: 'palace' }))));
  // 4-column Corinthian portico + carved pediment
  colonnadeU(k, S, [-4.2, -1.4, 1.4, 4.2], 13.6, 3.2, 9.6, 0.45, 'portico'); k.box(S, -5.4, 5.4, 12.8, 14.0, 11, 14.6, 'portico'); pedimentU(k, S, -5.6, 5.6, 14.0, 3.0, 14.6, 3.6, 'portico');
  // portico approach steps
  for (let i = 0; i < 8; i++) k.box(S, -6 + i * 0.05, 6 - i * 0.05, 0, 3.2 - i * 0.4, 11, 14.6 + (i + 1) * 0.45, 'portico');
  k.box('dark', -1.2, 1.2, 3.2, 7.2, 11.02, 11.06, 'portico');
  /* ---------- island Stein: mini-Vesuvius volcano + Villa Hamilton ---------- */
  // island (basalt rock)
  { const isl = new THREE.CylinderGeometry(18, 22, 1.2, 16); isl.translate(70, 0.6, -115); k.geo('stone', isl, 'stein'); }
  // Vesuvius cone (basalt lava field)
  { const v = new THREE.ConeGeometry(12, 18, 16); v.translate(70, 10.2, -115); k.geo('stone', v, 'stein'); }
  // crater rim (darker basalt ring)
  { const cr = new THREE.TorusGeometry(4.5, 0.9, 10, 24); cr.translate(70, 18.2, -115); k.geo('iron', cr, 'stein'); }
  // Villa Hamilton (small square temple on island)
  { k.box(F, 58, 66, 1.2, 7.5, -108, -102, 'stein'); k.geo('slate', prism(57.8, 66.2, -108.2, -101.8, 7.5, 10.8, 4, 4), 'stein'); colonnadeU(k, S, [59.5, 62, 64.5], 5.8, 0.9, 4.2, 0.35, 'stein'); }
  // footbridge to island (timber pontoon bridge)
  for (let t = 0; t < 10; t++) { const frac = t / 9; const bx2 = THREE.MathUtils.lerp(44, 60, frac), bz2 = THREE.MathUtils.lerp(-95, -107, frac); k.box('wood', bx2 - 1.5, bx2 + 1.5, 0.4, 0.65, bz2 - 0.6, bz2 + 0.6); }
  /* ---------- Gothic House (1773–1813): tracery windows, spire ---------- */
  k.box(F, -70, -58, 0, 1.2, -132, -118, 'gothic'); k.box('white', -70, -58, 1.2, 22, -132, -118, 'gothic'); k.box(S, -70.3, -58.3, 21.6, 22.4, -132.3, -117.7, 'gothic'); k.geo('slate', prism(-70.3, -58.3, -132.3, -117.7, 22.4, 27.2, 6, 6), 'gothic');
  // corner pinnacles (Gothic Revival)
  [[-70, -132], [-58, -132], [-70, -118], [-58, -118]].forEach(c => { const pg = new THREE.ConeGeometry(0.6, 4.5, 4); pg.rotateY(Math.PI / 4); pg.translate(c[0], 27, c[1]); k.geo('slate', pg, 'gothic'); });
  // tracery window shapes on Gothic House
  [[-64, 22.5], [-64, 18], [-64, 13.5], [-64, 9], [-64, 4.5]].forEach(w => { const sh = new THREE.Shape(); sh.moveTo(-1.2, 0); sh.lineTo(1.2, 0); sh.lineTo(1.2, 1.6); sh.lineTo(0, 2.8); sh.lineTo(-1.2, 1.6); sh.closePath(); const g = new THREE.ShapeGeometry(sh, 8); g.rotateY(-Math.PI / 2); g.translate(-57.98, w[1], w[0]); k.geo('glassDark', g, 'gothic'); });
  /* ---------- Iron Bridge of 1791 ---------- */
  { const bx2 = 111, bz2 = -35, BL = 28; [-1, 1].forEach(sg => k.box('iron', bx2 + sg * 1.45 - 0.15, bx2 + sg * 1.45 + 0.15, 4.5, 5.3, bz2 - BL / 2, bz2 + BL / 2, 'iron'));
    const arc2 = new THREE.TorusGeometry(13, 0.35, 10, 30, Math.PI); arc2.rotateZ(-Math.PI / 2); arc2.translate(bx2, 5.5, bz2); k.geo('iron', arc2, 'iron');
    // deck planks
    for (let z = bz2 - BL / 2 + 1; z < bz2 + BL / 2; z += 0.7) k.box('wood', bx2 - 1.6, bx2 + 1.6, 5.3, 5.5, z - 0.25, z + 0.25, 'iron'); }
  // Venetian gondola on the lake
  { const bh = new THREE.CylinderGeometry(0.6, 0.8, 5, 10, 1, false, 0, Math.PI * 2); bh.scale(1, 0.28, 1); bh.rotateZ(-Math.PI / 14); bh.translate(-10, 0.25, -115); k.geo('iron', bh, 'lake'); }
  // park surroundings
  k.box('gravel', -40, 40, 0, 0.04, 10, 60); k.box('gravel', -100, 100, 0, 0.04, -20, -10);
  for (let i = 0; i < 40; i++) { const x = P.x0 + 8 + rand() * (P.x1 - P.x0 - 16), z = P.z0 + 8 + rand() * (P.z1 - P.z0 - 16); if (Math.abs(x) < 28 && z > -20 && z < 16) continue; if (Math.hypot(x - 10, z + 95) < 95) continue; tree(k, x, z, 1.1 + rand() * 0.6); }
  for (let i = 0; i < 10; i++) person(k, -16 + rand() * 32, -5 + rand() * 15, rand() * 6.28);
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return { scene, center: new THREE.Vector3(0, 0, 5), span: 140, sunDist: 380, lamps: [], intro: { pos: [-30, 20, 40], tgt: [0, 8, 5] },
    views: [{ label: 'The palace portico', cam: [0, 5, 35], tgt: [0, 8, 5] }, { label: 'Island Stein', cam: [10, 4, -40], tgt: [70, 10, -115] }, { label: 'The Gothic House', cam: [-40, 5, -80], tgt: [-68, 8, -125] }, { label: 'The iron bridge', cam: [130, 6, -10], tgt: [111, 2, -35] }],
    facts: [
      { id: 'palace', title: 'Germany\'s first neoclassical palace', year: '1769–73', pos: [0, 18, 0], cam: [0, 5, 35], tgt: [0, 8, 5],
        text: 'Prince Franz had Friedrich Wilhelm von Erdmannsdorff build the palace from 1769 to 1773. It was the first neoclassical palace in Germany and a landmark of the European Enlightenment.',
        src: ['UNESCO World Heritage', 'https://whc.unesco.org/en/list/534'] },
      { id: 'lake', title: 'Europe\'s first landscape garden', year: '1769', pos: [-15, 2, -60], cam: [-30, 20, 40], tgt: [0, 8, 5],
        text: 'The Wörlitz park, 112 ha around the palace and an old arm of the Elbe, was the first landscape garden in continental Europe. It is the heart of the Garden Realm Dessau-Wörlitz, about 142 km², a UNESCO World Heritage Site since 2000. The Dessau-Wörlitz railway covers the roughly 20 km from Dessau in about 35 minutes.',
        src: ['NABU and Merian', 'https://www.nabu.de/natur-und-landschaft/schutzgebiete/deutschland/welterbe/04568.html'] },
      { id: 'stein', title: 'A volcano in the lake', year: 'today', pos: [74, 24, -116], cam: [10, 4, -40], tgt: [70, 10, -115],
        text: 'On the island Stein a miniature Vesuvius stands next to the Villa Hamilton, recalling Naples. On special occasions it still breathes fire and smoke.',
        src: ['ADAC Maps', 'https://maps.adac.de/ort/woerlitz-sachsen-anhalt'] },
      { id: 'gothic', title: 'An early Gothic Revival house', year: '1773–1813', pos: [-62, 19.5, -124], cam: [-40, 5, -80], tgt: [-68, 8, -125],
        text: 'The Gothic House grew in stages from 1773 to 1813 and is one of the earliest neo-Gothic buildings in Europe. It shows stained glass from the 15th to the 17th century.',
        src: ['ADAC Maps', 'https://maps.adac.de/ort/woerlitz-sachsen-anhalt'] },
      { id: 'iron', title: 'An iron bridge', year: '1791', pos: [111, 5, -35], cam: [130, 6, -10], tgt: [111, 2, -35],
        text: 'The iron bridge of 1791 copies the famous Iron Bridge in England and is counted as the first cast-iron bridge in Germany.',
        src: ['Merian', 'https://www.merian.de/deutschland/sachsen-anhalt/dessau-woerlitz-gartenreich'] }
    ] };

}
