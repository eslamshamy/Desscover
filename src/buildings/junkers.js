export function buildJunkers(context) {
  const { Kit, THREE, glass, ju52, parkGround, person, plinth, rails, rand, registerNoAO, rod3, rotBox, tree, winGrid } = context;

  const k = new Kit(); const P = { x0: -90, x1: 100, z0: -60, z1: 110 };
  parkGround(k, P, 'gravel'); k.box('lawn', P.x0, P.x1, 0, 0.02, 30, P.z1);
  // restored works hall, light brick with shed roofs and a glazed front
  const HX0 = -40, HX1 = 40, HZ0 = -30, HZ1 = 22;
  k.box('steelWhite', HX0, HX1, 0, 9, HZ0, HZ0 + 0.5, 'hall');
  [HX0, HX1 - 0.5].forEach(x => k.box('steelWhite', x, x + 0.5, 0, 9, HZ0, HZ1, 'hall'));
  k.box('steelWhite', HX0, HX1, 7.6, 9, HZ1 - 0.5, HZ1, 'hall'); k.box('steelWhite', HX0, HX1, 0, 1.2, HZ1 - 0.5, HZ1, 'hall');
  { let px = HX0; for (let c = HX0 + 5; c <= HX1 - 5 + 0.01; c += 7.5) { k.box('steelWhite', px, c - 2.6, 1.2, 7.6, HZ1 - 0.5, HZ1, 'hall'); px = c + 2.6; } k.box('steelWhite', px, HX1, 1.2, 7.6, HZ1 - 0.5, HZ1, 'hall'); }
  k.box('roof', HX0, HX1, 8.9, 9.0, HZ0, HZ1, 'hall');
  for (let x = HX0; x < HX1; x += 8) { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(8, 0); sh.lineTo(8, 3.2); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: HZ1 - HZ0, bevelEnabled: false }); g.translate(x, 9, HZ0); k.geo('roof', g, 'hall'); k.paneX('glassDark', x + 7.98, 9.05, 12.1, HZ0 + 0.3, HZ1 - 0.3, 'hall'); }
  winGrid(k, 'z', HZ1, 1, HX0 + 5, HX1 - 5, 7.5, [[1.2, 7.6]], 5.2, { glass: 'glass', mull: 1.3, trans: [4.4], frame: 'frame', back: false, tag: 'hall' });
  winGrid(k, 'x', HX1, 1, HZ0 + 5, HZ1 - 5, 7, [[2.5, 7.5]], 4.6, { glass: 'glassDark', mull: 1.15, frame: 'frame', tag: 'hall' });
  k.box('concrete', HX0 + 1, HX1 - 1, 0, 0.1, HZ0 + 1, HZ1 - 1, 'hall');
  ju52(k, -2, 0.1, 6, 0.25, 'ju52');
  // F 13 replica beside it
  k.box('corrugated', 18, 27, 1.2, 2.4, 10, 11.6, 'f13'); k.box('corrugated', 20, 22.4, 1.0, 1.5, 3.2, 18.4, 'f13'); k.box('corrugated', 17.5, 18.4, 1.6, 3.4, 10.6, 11.0, 'f13'); { const n = new THREE.CylinderGeometry(0.5, 0.55, 0.9, 12); n.rotateZ(Math.PI / 2); n.translate(27.4, 1.8, 10.8); k.geo('iron', n, 'f13'); }
  // the Junkers steel house outside
  k.box('steelWhite', 50, 59, 0, 3.4, 30, 39, 'stahlhaus'); for (let x = 50.5; x < 59; x += 1.0) k.fr('frame', x - 0.03, x + 0.03, 0, 3.4, 39, 39.06, 'stahlhaus'); k.winZ(39, 1, 52, 55, 1.0, 2.6, { frame: 'frame', tag: 'stahlhaus' }); k.box('frame', 49.6, 59.4, 3.4, 3.6, 29.6, 39.4, 'stahlhaus');
  k.box('asphalt', P.x0, P.x1, 0, 0.03, 42, 52); k.box('paving', -10, 10, 0, 0.05, 22, 42);
  for (let i = 0; i < 12; i++) { const tx = P.x0 + 6 + rand() * (P.x1 - P.x0 - 12), tz = 98 + rand() * 8; tree(k, tx, tz, 1.0 + rand() * 0.3); }
  // an Interflug Ilyushin Il-18 on the apron, with boarding stairs
  k.part = 'il18'; { const FX = -22, FZ = 72, L = 35.9, R = 1.65;
    const fu = new THREE.CylinderGeometry(R, R, L - 6, 24); fu.rotateZ(Math.PI / 2); fu.translate(FX, 3.6, FZ); k.geo('steelWhite', fu, 'il18');
    const nose = new THREE.SphereGeometry(R, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2); nose.scale(1, 2.0, 1); nose.rotateZ(-Math.PI / 2); nose.translate(FX + (L - 6) / 2, 3.6, FZ); k.geo('steelWhite', nose, 'il18');
    const tl = new THREE.ConeGeometry(R, 6, 24); tl.rotateZ(Math.PI / 2); tl.translate(FX - (L - 6) / 2 - 3, 3.9, FZ); k.geo('steelWhite', tl, 'il18');
    rotBox(k, 'bauBlue', L - 7, 0.35, 2 * R + 0.06, FX, 3.9, FZ, 0, 'il18'); rotBox(k, 'panelGrey', L - 8, 0.8, 2 * R - 0.3, FX, 2.2, FZ, 0, 'il18');
    for (let x = FX - 12; x < FX + 13; x += 1.3) [-1, 1].forEach(sd => k.box('glassDark', x - 0.25, x + 0.25, 4.25, 4.75, FZ + sd * (R + 0.02) - 0.02, FZ + sd * (R + 0.02) + 0.02, 'il18'));
    const wing = new THREE.Shape(); wing.moveTo(0, -18.7); wing.lineTo(2.2, -18.7); wing.lineTo(4.6, 0); wing.lineTo(2.2, 18.7); wing.lineTo(0, 18.7); wing.lineTo(-0.6, 0); wing.closePath(); const wg = new THREE.ExtrudeGeometry(wing, { depth: 0.35, bevelEnabled: false }); wg.rotateX(Math.PI / 2); wg.translate(FX - 1, 2.9, FZ); k.geo('steelWhite', wg, 'il18');
    [-12.5, -6.2, 6.2, 12.5].forEach(z => { const n = new THREE.CylinderGeometry(0.75, 0.6, 5.5, 14); n.rotateZ(Math.PI / 2); n.translate(FX + 2.5, 2.6, FZ + z); k.geo('panelGrey', n, 'il18'); [0, 1, 2, 3].forEach(b => rotBox(k, 'black', 0.08, 4.4, 0.25, FX + 5.3, 2.6, FZ + z, 0, 'il18')); });
    const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(5.5, 0); fin.lineTo(2.2, 6.8); fin.lineTo(0, 6.8); fin.closePath(); const fg = new THREE.ExtrudeGeometry(fin, { depth: 0.3, bevelEnabled: false }); fg.translate(FX - (L - 6) / 2 - 5.6, 4.4, FZ - 0.15); k.geo('steelWhite', fg, 'il18');
    const hs = new THREE.Shape(); hs.moveTo(0, -6); hs.lineTo(2, -6); hs.lineTo(3.4, 0); hs.lineTo(2, 6); hs.lineTo(0, 6); hs.closePath(); const hg = new THREE.ExtrudeGeometry(hs, { depth: 0.25, bevelEnabled: false }); hg.rotateX(Math.PI / 2); hg.translate(FX - (L - 6) / 2 - 5.4, 4.6, FZ); k.geo('steelWhite', hg, 'il18');
    [[FX + 9, FZ + 1.4], [FX + 9, FZ - 1.4], [FX - 1, FZ + 4.5], [FX - 1, FZ - 4.5]].forEach(w => { k.box('iron', w[0] - 0.1, w[0] + 0.1, 0.5, 2.6, w[1] - 0.1, w[1] + 0.1, 'il18'); const t = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 14); t.rotateX(Math.PI / 2); t.translate(w[0], 0.55, w[1]); k.geo('black', t, 'il18'); });
    for (let i = 0; i < 12; i++) k.box('steelWhite', FX + 6, FX + 7.6, i * 0.32, i * 0.32 + 0.12, FZ + R + 0.5 + (11 - i) * 0.42, FZ + R + 0.9 + (11 - i) * 0.42, 'il18'); rails(k, 'steelWhite', [[FX + 6, FZ + R + 0.4], [FX + 6, FZ + R + 5.4]], 4.0, [0.9], 'il18'); } k.part = '';
  // the Großer Windkanal of 1934: a shell-concrete tunnel on piers, an intake ring, a long ribbed tube and a flow straightener
  const WY = 5.2, wtube = (x0, x1, r0, r1, part) => { const g = new THREE.CylinderGeometry(r1, r0, x1 - x0, 32, 1, true); g.rotateZ(-Math.PI / 2); const gi = g.clone(); gi.scale(1, 0.94, -0.94); g.translate((x0 + x1) / 2, WY, 86); gi.translate((x0 + x1) / 2, WY, 86); k.geo('concrete', g, 'windkanal'); k.geo('soot', gi, 'windkanal'); };
  const wring = (x, r, w, m) => { const t = new THREE.TorusGeometry(r, w, 8, 36); t.rotateY(Math.PI / 2); t.translate(x, WY, 86); k.geo(m || 'concrete', t, 'windkanal'); };
  wtube(30, 36, 4.6, 3.4); wring(30, 4.6, 0.45); for (let a = 0; a < 16; a++) { const an = a / 16 * Math.PI * 2; rod3(k, 'concrete', [30, WY + Math.sin(an) * 1.2, 86 + Math.cos(an) * 1.2], [30, WY + Math.sin(an) * 4.4, 86 + Math.cos(an) * 4.4], 0.12, 'windkanal'); }
  wtube(41, 58, 3.5, 3.5); for (let x = 42; x < 58; x += 3) wring(x, 3.55, 0.22); wtube(58, 64, 3.9, 3.9); wring(58, 4.0, 0.4); wring(64, 4.0, 0.4);
  k.part = 'v:tunnelFull'; wtube(36, 41, 3.4, 3.5); wtube(64, 80, 3.9, 5.0); wring(80, 5.1, 0.5); k.part = '';
  k.part = 'tunnelToday'; wtube(70, 76, 4.3, 4.8); wring(76, 4.9, 0.5); for (let a = 0; a < 12; a++) { const an = a / 12 * Math.PI * 2; rod3(k, 'concrete', [76, WY, 86], [76, WY + Math.sin(an) * 4.7, 86 + Math.cos(an) * 4.7], 0.14, 'windkanal'); } k.part = '';
  [32, 44, 50, 56, 61, 72].forEach(x => k.box('concrete', x - 0.6, x + 0.6, 0, WY - 3, 84.6, 87.4, 'windkanal'));
  // the tall Junkers administration building of 1934–35 behind the tunnel
  k.box('brickBuff', 20, 90, 0, 16, 96, 108, 'windkanal'); for (let x = 22; x < 89; x += 3.4) [[2, 4.8], [6.4, 9.2], [10.8, 13.6]].forEach(f => k.winZ(96, -1, x - 1.2, x + 1.2, f[0], f[1], { mull: 1.2, frame: 'frame', tag: 'windkanal' }));
  for (let i = 0; i < 10; i++) person(k, -30 + rand() * 60, -10 + rand() * 25, rand() * 6.28, 0.1);
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return { scene, center: new THREE.Vector3(0, 0, 5), span: 95, sunDist: 240, lamps: [], intro: { pos: [40, 22, 75], tgt: [0, 4, 0] },
    views: [{ label: 'Through the glass front', cam: [8, 3, 40], tgt: [-2, 3, 6] }, { label: 'The steel house', cam: [70, 4, 55], tgt: [54, 2, 34] }, { label: 'The wind tunnel', cam: [55, 6, 62], tgt: [55, 5, 86] }, { label: 'The Il-18', cam: [10, 4, 55], tgt: [-22, 3, 72] }],
    eras: [{ year: '1934', title: 'The Großer Windkanal', note: 'The wind tunnel as built in 1934, complete from intake to diffuser. Its full length is reconstructed from the surviving parts.', show: ['v:tunnelFull'], hide: ['tunnelToday', 'il18'] }, { year: 'today', title: 'A technical monument', note: 'Partly destroyed in 1946, the wind tunnel became a protected technical monument in 1984. The museum opened beside it in 2001.' }],
    facts: [
      { id: 'ju52', title: 'A Ju 52 from a Norwegian lake', year: '1937–1995', pos: [-2, 7.4, 6], cam: [8, 3, 40], tgt: [-2, 3, 6],
        text: 'The star exhibit is a three-engined Ju 52/3m with a corrugated duralumin skin, built in 1937. It was recovered in 1986 from Lake Hartvikvann in Norway and came to Dessau in 1995. It is 18.9 m long with a span of 29.25 m.',
        src: ['museum-digital Sachsen-Anhalt', 'https://st.museum-digital.de/pdf/object/1794.pdf?lang=en'] },
      { id: 'hall', title: 'On the old Junkers site', year: '2001', pos: [HX0 - 0.6, 6, 0], cam: [-80, 20, 30], tgt: [-30, 6, 0],
        text: 'Volunteers founded an association in August 1992 to preserve the region’s industrial heritage. In 2001 they opened the museum in a restored works hall of about 4,200 m² on the site of the former Junkers aircraft works.',
        src: ['ERIH and Afterburner', 'https://www.erih.net/i-want-to-go-there/dessau-technical-museum'] },
      { id: 'f13', title: 'J 1, F 13 and Ju 52', year: 'today', pos: [22, 5, 10.8], cam: [32, 4, 30], tgt: [22, 2, 10],
        text: 'Three Junkers aircraft mark the aviation exhibition near the entrance: the J 1, a replica of the F 13 and the Ju 52. Hugo Junkers (1859–1935) held more than 300 patents, and the museum also shows his gas appliances and heating technology.',
        src: ['Afterburner', 'https://afterburner.com.pl/visionary-engineer-and-aviation-pioneer-the-world-of-hugo-junkers-by-technikmuseum-hugo-junkers-dessau/'] },
      { id: 'windkanal', title: 'The Großer Windkanal', year: '1934', pos: [52, 11, 86], cam: [55, 6, 62], tgt: [55, 5, 86],
        text: 'The large Junkers wind tunnel of 1934 was designed by the aerodynamicist Philipp von Doepp with Junkers-Stahlbau, an early building in shell concrete. It served as a prototype for wind tunnels in Warsaw and Moscow, was partly destroyed in 1946 and has been a technical monument since 1984.',
        src: ['Walpersberg association, visit report 2020', 'https://www.walpersberg.de/news/3549/1118408/kategorie/visit-to-the-museum-of-technology-hugo-junkers-dessau-october-8-2020.html'] },
      { id: 'il18', title: 'An Il-18 on the apron', year: 'today', pos: [-22, 9, 72], cam: [10, 4, 55], tgt: [-22, 3, 72],
        text: 'Outside the hall stands a four-engined Ilyushin Il-18 airliner in the colours of Interflug, the East German airline, with boarding stairs. The museum’s open-air area also shows aircraft of the former East German army.',
        src: ['Walpersberg association, visit report 2020', 'https://www.walpersberg.de/news/3549/1118408/kategorie/visit-to-the-museum-of-technology-hugo-junkers-dessau-october-8-2020.html'] },
      { id: 'stahlhaus', title: 'A steel house', year: '1920s', pos: [54.5, 5, 34.5], cam: [70, 4, 55], tgt: [54, 2, 34],
        text: 'One of the surprises is the only surviving experimental steel house by Hugo Junkers, from a line of research that led to fruitful work with the Bauhaus.',
        src: ['ERIH', 'https://www.erih.net/i-want-to-go-there/dessau-technical-museum'] }
    ] };

}
