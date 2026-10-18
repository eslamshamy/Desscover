/* ---------- Heizkraftwerk Dessau (Stadtwerke) ---------- */

export function buildHKW(context) {
  const { Kit, THREE, plinth, prism, rails, rand, registerNoAO, rod3U, tree } = context;

  const k = new Kit(); const P = { x0: -110, x1: 110, z0: -90, z1: 85 };
  k.box('lawn', P.x0, P.x1, -0.12, 0, P.z0, P.z1);
  k.box('asphalt', P.x0, P.x1, 0, 0.04, -70, -56); k.box('asphalt', -30, 30, 0, 0.04, -56, 30);
  k.box('concrete', -42, 52, 0, 0.08, -32, 28, 'chp');
  // boiler & turbine hall: steel cassettes and Stadtwerke blue accents
  k.box('steelWhite', -26, 26, 0, 24, -22, 18, 'chp');
  k.box('steelBlue', -26.2, 26.2, 22.8, 24.2, -22.2, 18.2, 'chp');
  k.box('roofZinc', -26.5, 26.5, 24.0, 24.6, -22.5, 18.5, 'chp');
  // turbine hall monitor roof with skylights
  k.box('steelWhite', -16, 16, 24.6, 27.2, -14, 10, 'chp');
  k.box('glassDark', -15.8, 15.8, 25.2, 26.8, -14.1, 10.1, 'chp');
  k.box('roofZinc', -16.3, 16.3, 27.2, 27.6, -14.3, 10.3, 'chp');
  k.box('panelGrey', -22, 18, 24, 29.5, -16, 12, 'chp');
  // roof-mounted air-cooled condenser fans
  for (let fx = -12; fx <= 12; fx += 8) {
    const fan = new THREE.CylinderGeometry(1.6, 1.8, 1.2, 16); fan.translate(fx, 30.1, -2); k.geo('steel', fan, 'chp');
  }
  // gas turbine hall
  k.box('steelWhite', -58, -32, 0, 12, -8, 8, 'gas');
  k.box('steelBlue', -58.2, -31.8, 11.2, 12.2, -8.2, 8.2, 'gas');
  k.box('panelGrey', -58, -46, 12, 22, -6, 6, 'gas');
  { const s = new THREE.CylinderGeometry(1.6, 1.6, 12, 16); s.translate(-52, 28, 0); k.geo('steel', s, 'gas'); }
  // 105 m concrete chimney with official red & white aviation warning stripes
  const CX = -36, CZ = 26, CH = 105;
  { const c = new THREE.CylinderGeometry(2.2, 3.6, CH, 28); c.translate(CX, CH / 2, CZ); k.geo('concrete', c, 'chimney');
    // red and white aviation obstacle marking bands at the top 30 meters
    for (let i = 0; i < 6; i++) {
      const y0 = CH - 24 + i * 4.0, r0 = 3.6 - (y0 / CH) * 1.4, r1 = 3.6 - ((y0 + 4.0) / CH) * 1.4;
      const b = new THREE.CylinderGeometry(r1 + 0.06, r0 + 0.06, 4.0, 28);
      b.translate(CX, y0 + 2.0, CZ);
      k.geo(i % 2 === 1 ? 'red' : 'white', b, 'chimney');
    }
    // safety gallery rings
    [CH * 0.5, CH - 25, CH - 2].forEach(y => {
      const ring = new THREE.CylinderGeometry(3.6 - y / CH * 1.4 + 0.9, 3.6 - y / CH * 1.4 + 0.9, 0.25, 28);
      ring.translate(CX, y, CZ); k.geo('iron', ring, 'chimney');
    });
    // red aviation obstacle warning light at the top
    const beacon = new THREE.SphereGeometry(0.35, 12, 8); beacon.translate(CX, CH + 1.2, CZ); k.geo('red', beacon, 'chimney');
    // steam plume
    for (let i = 0; i < 5; i++) { const s = new THREE.SphereGeometry(3 + i * 2.2, 12, 8); s.translate(CX + 4 + i * 6, CH + 3 + i * 3.2, CZ - 2 - i * 3); k.geo('steam', s, 'chimney'); }
  }
  // flue gas duct connecting boiler hall to chimney
  rod3U(k, 'steelWhite', [-22, 26, 4], [CX, 26, CZ - 3.5], 1.8, 'chp');
  // overhead district heating pipe bridges with insulated silver pipes
  for (let x = 52; x < 106; x += 6) {
    k.box('iron', x - 0.2, x + 0.2, 0, 5.8, -2.2, -1.8, 'pipes');
    k.box('iron', x - 0.2, x + 0.2, 0, 5.8, 1.8, 2.2, 'pipes');
    k.box('iron', x - 0.2, x + 0.2, 5.8, 6.2, -2.4, 2.4, 'pipes');
  }
  [-1.1, 1.1].forEach(z => rod3U(k, 'steelWhite', [52, 6.9, z], [P.x1, 6.9, z], 0.55, 'pipes'));
  // large cylindrical thermal energy storage tank (Fernwärmespeicher)
  { const t = new THREE.CylinderGeometry(10, 10, 28, 32); t.translate(70, 14, -42); k.geo('steelWhite', t, 'future');
    const tp = new THREE.CylinderGeometry(10.2, 10.2, 0.6, 32); tp.translate(70, 28.3, -42); k.geo('iron', tp, 'future');
    // Stadtwerke blue band
    const logoBand = new THREE.CylinderGeometry(10.05, 10.05, 3.2, 32); logoBand.translate(70, 24, -42); k.geo('steelBlue', logoBand, 'future');
  }
  // substation transformers
  for (let i = 0; i < 4; i++) {
    k.box('panelGrey', -90 + i * 13, -80 + i * 13, 0, 3.4, -48, -40, 'future');
    const trans = new THREE.CylinderGeometry(0.35, 0.35, 2.2, 8); trans.translate(-85 + i * 13, 4.5, -44); k.geo('iron', trans, 'future');
  }
  // historic red-brick building of earlier municipal station
  k.part = 'oldplant';
  { const B = 'brick'; k.box(B, 64, 78, 0, 21, -78, -64, 'old'); k.geo('slate', prism(63.7, 78.3, -78.3, -63.7, 21, 25, 0, 7), 'old');
    const sg = new THREE.Shape(); sg.moveTo(-7, 0); sg.lineTo(7, 0); sg.lineTo(7, 2); sg.lineTo(4.5, 2); sg.lineTo(4.5, 4); sg.lineTo(2, 4); sg.lineTo(2, 6); sg.lineTo(-2, 6); sg.lineTo(-2, 4); sg.lineTo(-4.5, 4); sg.lineTo(-4.5, 2); sg.lineTo(-7, 2); sg.closePath();
    const g = new THREE.ExtrudeGeometry(sg, { depth: 0.6, bevelEnabled: false }); g.translate(71, 21, -64.3); k.geo(B, g, 'old');
    k.box(B, 78, 106, 0, 12, -76, -62, 'old'); k.geo('slate', prism(77.8, 106.2, -76.3, -61.7, 12, 16.5, 0, 7.2), 'old');
    k.box(B, 40, 64, 0, 9, -74, -64, 'old'); k.geo('slate', prism(39.8, 64.2, -74.3, -63.7, 9, 12, 0, 5.2), 'old');
    const arch = (x, y, z) => { const sh = new THREE.Shape(); sh.moveTo(-0.9, 0); sh.lineTo(0.9, 0); sh.lineTo(0.9, 3); sh.absarc(0, 3, 0.9, 0, Math.PI, false); sh.closePath(); const w = new THREE.ShapeGeometry(sh, 10); w.translate(x, y, z); k.geo('glassDark', w, 'old'); };
    for (let x = 81; x < 105; x += 3.6) arch(x, 2.5, -61.97); for (let x = 43; x < 63; x += 3.4) arch(x, 2, -63.67); [2.5, 8, 13.5].forEach(y => [67.5, 71, 74.5].forEach(x => arch(x, y, -63.97))); }
  k.part = '';
  [[P.x0 + 4, -70, P.x1 - 4, -70], [P.x0 + 4, 30, P.x1 - 4, 30]].forEach(f => rails(k, 'iron', [[f[0], f[1]], [f[2], f[3]]], 0, [0.9, 1.9], 'site'));
  for (let i = 0; i < 18; i++) tree(k, P.x0 + 6 + rand() * (P.x1 - P.x0 - 12), 52 + rand() * 24, 1.0 + rand() * 0.4);
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return { scene, center: new THREE.Vector3(-5, 0, 0), span: 120, sunDist: 330, lamps: [], intro: { pos: [-110, 70, 140], tgt: [-10, 30, 0] },
    views: [{ label: 'From the street', cam: [-20, 2.5, 70], tgt: [-20, 30, 0] }, { label: 'Up the chimney', cam: [-70, 8, 60], tgt: [CX, 80, CZ] }],
    facts: [
      { id: 'site', title: 'On the old fermentation works', year: '1994–96', pos: [-80, 4, -70], cam: [-110, 70, 140], tgt: [-10, 20, 0],
        text: 'The new combined heat and power plant was built on the site of the former Gärungschemie, a fermentation-chemicals works, and went into service in 1994. It first fed electricity into the grid in January 1996.',
        src: ['Wikipedia (de), DVV Stadtwerke Dessau', 'https://de.wikipedia.org/wiki/Dessauer_Versorgungs-_und_Verkehrsgesellschaft'] },
      { id: 'chp', title: 'Heat and power together', year: 'today', pos: [-7, 38.5, 0], cam: [-20, 2.5, 70], tgt: [-20, 30, 0],
        text: 'The plant, run by Kraftwerk Dessau GmbH for the Stadtwerke, uses combined heat and power: it makes electricity and, at the same time, the hot water for Dessau’s district heating network. Its capacity is given as about 53 MW.',
        src: ['KWK report for Kraftwerk Dessau and Global Energy Monitor', 'https://gem.wiki/Dessau_power_station'] },
      { id: 'gas', title: 'Out of coal in 2019', year: '2019', pos: [-50, 24, 0], cam: [-90, 20, 40], tgt: [-48, 10, 0],
        text: 'The plant burned lignite until a new Siemens gas turbine, with about 25 MW of electrical output, took over. Since 2019 it has used no coal at all, cutting carbon dioxide emissions by around 30,000 tonnes a year.',
        src: ['ZfK and DVV Stadtwerke Dessau', 'https://www.zfk.de/energie/waerme/dessau-mit-vollgas-aus-der-kohle-aussteigen'] },
      { id: 'chimney', title: 'A landmark chimney', year: 'today', pos: [CX, CH + 2, CZ], cam: [-70, 8, 60], tgt: [CX, 80, CZ],
        text: 'Its tall chimney, slender and light grey, can be seen from far across the city, for example from the platforms of the main station. The height in the model is an estimate.',
        src: ['Photographs from the station platforms', ''] },
      { id: 'future', title: 'Greener heat', year: '2024–', pos: [70, 31, -42], cam: [110, 30, -90], tgt: [60, 10, -40],
        text: 'In 2024 the Stadtwerke announced an 18-million-euro investment that combines block-type CHP units with heat pumps, the first step in turning the district heating network towards renewable sources. The buildings in the model are a stand-in for that equipment.',
        src: ['DVV Stadtwerke Dessau', 'https://www.dvv-dessau.de/stadtwerke-dessau-investieren-18-millionen-euro-in-gruene-waermeerzeugung/'] }
    ] };

}
