/* ================================================================
   Tiergarten bridge (bridge)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['bridge'] = {
  meta: { id: 'bridge', years: '2000', name: 'Tiergarten bridge', sub: 'the “Eierschneider”, 2000', lat: 51.831548, lon: 12.249931, build: buildBridge, label: 'Tiergartenbrücke, the “Eierschneider”', meta: 'Footbridge over the Mulde, 2000', lead: 'A curved footbridge under a leaning steel arch, nicknamed the egg slicer.' },
  token(k) {
    k.geo('lawn', prism(30, 74, -40, 40, 0, 4.8, 9, 0)); k.geo('lawn', prism(-74, -30, -40, 40, 0, 4.8, 9, 0)); k.box('steelWhite', -54, 54, 4.8, 6, -2, 2); const a = []; for (let i = 0; i <= 12; i++) { const t = i / 12; a.push([-36 + 72 * t, 6 + 17 * Math.sin(Math.PI * t), -3]); } tubeU(k, 'steelWhite', a, 0.9); k.box('water', -30, 30, 0, 0.2, -40, 40);
  },
  quiz: [
    { q: 'Why is the Tiergarten bridge called the “Eierschneider”?', o: ['Its arch and hangers look like an egg slicer', 'It was paid for by an egg farm', 'It cuts the Mulde in two', 'It was built from old kitchen steel'], a: 0, e: 'The fan of hangers under the arch looks like an egg slicer’s wires.' }
  ]
};

function buildBridge() {
  const k = new Kit(), R = 105, DY = 3.2, W2 = 1.95, TH = 0.5136, CR = DY - 0.15;
  const P = { x0: -90, x1: 90, z0: -70, z1: 80 };
  // the Mulde in a sunken channel between grassy flood dykes
  k.box('lawn', P.x0, -68, -0.12, 0, P.z0, P.z1); k.box('lawn', 68, P.x1, -0.12, 0, P.z0, P.z1);
  k.box('water', -30, 30, -2.5, -2.2, P.z0, P.z1, 'flood');   // still water underneath; the moving surface is added after the build k.box('sand', -31, 31, -3.4, -2.6, P.z0, P.z1);
  // stone riprap along both riverbanks
  for (let z = P.z0 + 4; z < P.z1 - 4; z += 5) {
    [-30.5, 30.5].forEach(rx => {
      const rock = new THREE.DodecahedronGeometry(1.2 + rand() * 0.5);
      rock.translate(rx, -2.2, z); k.geo('rock', rock, 'flood');
    });
  }
  [-1, 1].forEach(sd => {
    const sh = new THREE.Shape(); [[29, -3.4], [29, -2.3], [44, CR], [58, CR], [68, 0], [68, -3.4]].forEach((q, i) => i ? sh.lineTo(sd * q[0], q[1]) : sh.moveTo(sd * q[0], q[1])); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: P.z1 - P.z0, bevelEnabled: false }); g.translate(0, 0, P.z0); k.geo('lawn', g, sd > 0 ? 'piers' : 'flood');
    k.box('gravel', sd > 0 ? 48 : -52, sd > 0 ? 52 : -48, CR, CR + 0.06, P.z0, P.z1, sd > 0 ? 'piers' : 'deck');
  });
  const pt = (phi, r, y) => [r * Math.sin(phi), y, R - r * Math.cos(phi)];
  // curved deck in timber on a white steel box girder
  for (let i = 0; i < 40; i++) {
    const a0 = -TH + 2 * TH * i / 40, a1 = -TH + 2 * TH * (i + 1) / 40, am = (a0 + a1) / 2, p = pt(am, R, DY), len = R * (a1 - a0) + 0.02;
    rotBox(k, 'wood', len, 0.12, W2 * 2, p[0], DY, p[2], -am, 'deck');
    rotBox(k, 'steelWhite', len, 0.7, W2 * 1.4, p[0], DY - 0.45, p[2], -am, 'deck');
  }
  // tubular stainless steel handrails with wire mesh infill
  [R - W2, R + W2].forEach(r => {
    const pts = []; for (let i = 0; i <= 40; i++) { const a = -TH + 2 * TH * i / 40; const p = pt(a, r, 0); pts.push([p[0], p[2]]); }
    rails(k, 'steelWhite', pts, DY, [0.55, 1.05], 'deck');
    rails(k, 'steel', pts, DY, [0.25, 0.8], 'deck');
  });
  // concrete abutments with steel pin hinge bearings
  [-1, 1].forEach(sd => {
    const p = pt(sd * TH, R, 0);
    k.box('concrete', p[0] - 2.5, p[0] + 2.5, CR - 0.8, DY - 0.45, p[2] - 3.2, p[2] + 3.2, 'piers');
    // pin bearing
    const hinge = new THREE.CylinderGeometry(0.35, 0.35, 2.2, 12); hinge.rotateZ(Math.PI / 2); hinge.translate(p[0], DY - 0.35, p[2]); k.geo('iron', hinge, 'piers');
    const q = pt(sd * (TH + 0.05), R, 0); rotBox(k, 'paving', 5.5, 0.12, W2 * 2, q[0], CR + 0.06, q[2], -sd * (TH + 0.05), 'deck');
  });
  // the leaning steel tube arch and its fan of twin hangers
  const lean = 17 * D2R, arch = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32, a = -TH * 0.86 + 2 * TH * 0.86 * t, h = 17 * Math.sin(Math.PI * t), base = pt(a, R - W2 - 0.3, DY);
    const nx = Math.sin(a), nz = -Math.cos(a);
    arch.push([base[0] + nx * h * Math.sin(lean), DY + h * Math.cos(lean), base[2] + nz * h * Math.sin(lean)]);
  }
  tubeU(k, 'steelWhite', arch, 0.41, 'arch');
  for (let i = 2; i <= 30; i++) {
    const t = i / 32, a = -TH * 0.86 + 2 * TH * 0.86 * t, top = arch[i], foot = pt(a, R + W2, DY + 0.1);
    rod3U(k, 'steelWhite', top, foot, 0.032, 'arch');
    // turnbuckle
    const tbMid = [(top[0] + foot[0] * 3) / 4, (top[1] + foot[1] * 3) / 4, (top[2] + foot[2] * 3) / 4];
    const tb = new THREE.CylinderGeometry(0.065, 0.065, 0.35, 8); tb.translate(tbMid[0], tbMid[1], tbMid[2]); k.geo('steel', tb, 'arch');
  }
  // trees and dyke cycle path
  for (let i = 0; i < 16; i++) tree(k, 71 + rand() * 16, P.z0 + 6 + rand() * (P.z1 - P.z0 - 12), 1.1 + rand() * 0.4);
  for (let i = 0; i < 8; i++) tree(k, -71 - rand() * 16, P.z0 + 6 + rand() * (P.z1 - P.z0 - 12), 1.0 + rand() * 0.3);
  for (let i = 0; i < 8; i++) { const a = -TH * 0.9 + rand() * TH * 1.8, p = pt(a, R + (rand() - 0.5) * 2.4, 0); person(k, p[0], p[2], rand() * 6.28, DY + 0.06); }
  const grp = k.build(); flowWater(grp, -30, 30, P.z0, P.z1, -2.05, 0, -1, 1.2); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 5, 6);
  return { scene, center: new THREE.Vector3(0, 0, 10), span: 95, sunDist: 240, lamps: [], intro: { pos: [-70, 30, -75], tgt: [0, 8, 6] },
    views: [{ label: 'From the riverbank', cam: [-34, 0.9, 52], tgt: [0, 7, 8] }, { label: 'On the deck', cam: [-40, 4.9, 12], tgt: [10, 7, 3] }, { label: 'From the dyke', cam: [-60, 4.9, 60], tgt: [0, 4, 8] }],
    facts: [
      { id: 'arch', title: 'Why “egg slicer”', year: '2000', pos: [0, 24, -5], cam: [-55, 14, -45], tgt: [0, 10, 5],
        text: 'Seen from a distance, the steel tube arch and its fan of hangers look like the wires of an egg slicer, which is how the footbridge got its nickname. The tube is 812.8 mm across and leans 17 degrees out of the vertical.',
        src: ['Structurae', 'https://structurae.net/de/bauwerke/tiergartenbruecke'] },
      { id: 'deck', title: 'A curved crossing', year: '2000', pos: [-30, DY + 2, 4.5], cam: [-40, 4.9, 12], tgt: [10, 7, 3],
        text: 'The bridge for pedestrians and cyclists is 107.65 m long and curves in plan on a radius of 105 m. It was built between March and October 2000.',
        src: ['Structurae', 'https://structurae.net/de/bauwerke/tiergartenbruecke'] },
      { id: 'flood', title: 'Above the floods', year: '2000', pos: [10, -1.4, 40], cam: [-34, 0.9, 52], tgt: [0, 5, 8],
        text: 'The bridge leaps the Mulde without piers in the river, which keeps the intervention in the floodplain small. It sits higher than the earlier bridge from 1926, so it stays usable when the river floods.',
        src: ['Outdooractive and erlebnisland.de', 'https://www.outdooractive.com/de/poi/anhalt-wittenberg/tiergartenbruecke-der-eierschneider/805249625/'] },
      { id: 'piers', title: 'Into the Tiergarten', year: 'today', pos: [56, CR + 2.4, 14], cam: [78, 10, 50], tgt: [50, 3, 12],
        text: 'The bridge links the city centre with the Vorderer Tiergarten on the right bank of the Mulde. Despite the name, the Tiergarten is not a zoo: it takes its name from the princes’ old hunting grounds.',
        src: ['Komoot', 'https://blog.komoot.es/highlight/142934'] }
    ] };
}
