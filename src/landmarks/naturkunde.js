/* ================================================================
   Natural history museum (naturkunde)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['naturkunde'] = {
  meta: { id: 'naturkunde', years: '1746–50', name: 'Natural history museum', sub: 'Leopold-Dank-Stift, 40 m tower', lat: 51.831279, lon: 12.242895, build: buildNaturkunde, label: 'Museum für Naturkunde und Vorgeschichte', meta: 'Founded 1927, in the Leopold-Dank-Stift of 1746–50', lead: 'Fossils, minerals and prehistory in a baroque foundation building with a 40-metre tower. Its front is simplified in the model.' },
  token(k) {
    const sh = new THREE.Shape(); [[16, 13], [15, 7], [14, 0], [9, -15], [-11, -14], [-13, 11], [-6, 17], [16, 13]].forEach((q, n) => n ? sh.lineTo(q[0], -q[1]) : sh.moveTo(q[0], -q[1])); const g = new THREE.ExtrudeGeometry(sh, { depth: 13, bevelEnabled: false }); g.rotateX(-Math.PI / 2); k.geo('sandstone', g); k.box('brick', -8.9, -1.7, 0, 38, 6.8, 14); const c = new THREE.ConeGeometry(4, 4, 4); c.rotateY(Math.PI / 4); c.translate(-5.3, 40, 10.4); k.geo('roof', c);
  },
  quiz: [
    { q: 'How high is the museum tower?', o: ['40 m', '15 m', '73 m', '120 m'], a: 0, e: 'Fossils are shown up in the tower.' }
  ]
};

function buildNaturkunde() {
  const k = new Kit(), SS = 'sandstone', S = 'stoneLight';
  const P = { x0: -70, x1: 70, z0: -55, z1: 60 };
  parkGround(k, P, 'paving');
  // built straight from the OpenStreetMap outline, north up; the cut-off corner faces the Kavalierstraße junction to the south-west
  const POLY = [[16, 13], [15, 7], [14, 0], [9, -15], [3, -15], [-4, -14], [-11, -14], [-13, 11], [-6, 17], [0, 16], [16, 13]];
  const H = 13.2, FL = [[1.8, 4.6], [6.8, 11.4]];
  const prismOf = (pts, y0, y1, m, tag) => { const sh = new THREE.Shape(); pts.forEach((p, i) => i ? sh.lineTo(p[0], -p[1]) : sh.moveTo(p[0], -p[1])); const g = new THREE.ExtrudeGeometry(sh, { depth: y1 - y0, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); k.geo(m, g, tag); };
  const inset = (pts, d) => { const c = [0, 0]; pts.slice(0, -1).forEach(p => { c[0] += p[0]; c[1] += p[1]; }); c[0] /= pts.length - 1; c[1] /= pts.length - 1; return pts.map(p => { const dx = p[0] - c[0], dz = p[1] - c[1], l = Math.hypot(dx, dz); return [p[0] + dx / l * d, p[1] + dz / l * d]; }); };
  const edges = (fn) => { for (let i = 0; i < POLY.length - 1; i++) { const a = POLY[i], b = POLY[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 1) continue; const tx = (b[0] - a[0]) / L, tz = (b[1] - a[1]) / L; fn(a, b, L, tx, tz, -tz, tx, i); } };
  const arched = (x, y0, w, h, z, ang, m, tag) => { const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, h - w / 2); sh.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); sh.closePath(); const g = new THREE.ShapeGeometry(sh, 10); g.rotateY(ang); g.translate(x, y0, z); k.geo(m, g, tag); };
  const CH = 7; // index of the cut-off corner edge
  /* ---------- since 1900: Teichmüller's round-arched sandstone front ---------- */
  k.part = 'nk1900'; prismOf(POLY, 0, H, SS, 'kunsthalle'); prismOf(inset(POLY, 0.35), H - 0.5, H + 0.4, S, 'kunsthalle'); prismOf(inset(POLY, -1.5), H + 0.4, H + 2.4, 'roof', 'kunsthalle');
  edges((a, b, L, tx, tz, nx, nz, i) => { const ang = Math.atan2(-nx, -nz) + Math.PI; if (i === CH) return; const n = Math.max(1, Math.floor((L - 2) / 3.4));
    for (let j = 0; j < n; j++) { const t = (j + 0.5) / n, x = a[0] + (b[0] - a[0]) * t + nx * 0.06, z = a[1] + (b[1] - a[1]) * t + nz * 0.06;
      arched(x, FL[1][0], 1.6, FL[1][1] - FL[1][0], z, ang, 'glassDark', 'collections'); k.geo('glassDark', (() => { const g = new THREE.PlaneGeometry(1.4, FL[0][1] - FL[0][0]); g.rotateY(ang); g.translate(x, (FL[0][0] + FL[0][1]) / 2, z); return g; })(), 'collections'); }
    const mid = [(a[0] + b[0]) / 2 + nx * 0.1, (a[1] + b[1]) / 2 + nz * 0.1]; rotBox(k, S, L, 0.45, 0.2, mid[0], 5.9, mid[1], Math.atan2(-tz, tx), 'kunsthalle'); });
  // Teichmüller's cut-corner portal: rose window + semicircular door arch
  { const a = POLY[CH], b = POLY[CH + 1], mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]), tx = (b[0] - a[0]) / L, tz = (b[1] - a[1]) / L, nx = -tz, nz = tx, ang = Math.atan2(-nx, -nz) + Math.PI, ra = Math.atan2(-tz, tx);
    const sh = new THREE.Shape(); sh.moveTo(-L / 2 - 0.4, 0); sh.lineTo(L / 2 + 0.4, 0); sh.lineTo(0, 2.6); sh.closePath(); const pg = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false }); pg.rotateY(ang); pg.translate(mx, H + 0.4, mz); k.geo(SS, pg, 'kunsthalle');
    // rose window (circular stained-glass disc)
    const rw = new THREE.CircleGeometry(1.5, 24); rw.rotateY(ang); rw.translate(mx + nx * 0.08, 9.3, mz + nz * 0.08); k.geo('glassDark', rw, 'kunsthalle');
    const rr = new THREE.RingGeometry(1.5, 2.0, 24); rr.rotateY(ang); rr.translate(mx + nx * 0.1, 9.3, mz + nz * 0.1); k.geo(S, rr, 'kunsthalle');
    // corbel table frieze at eaves level
    for (let j = -3; j <= 3; j++) { const cx2 = mx + tx * j * 1.3, cz2 = mz + tz * j * 1.3; const cb = new THREE.BoxGeometry(0.5, 0.4, 0.35); cb.rotateY(ang); cb.translate(cx2 + nx * 0.25, H - 0.6, cz2 + nz * 0.25); k.geo(SS, cb, 'kunsthalle'); }
    arched(mx + nx * 0.08, 0.3, 2.4, 4.6, mz + nz * 0.08, ang, 'wood', 'kunsthalle');
    const pr = new THREE.RingGeometry(1.2, 1.7, 16, 1, 0, Math.PI); pr.rotateY(ang); pr.translate(mx + nx * 0.1, 3.5, mz + nz * 0.1); k.geo(S, pr, 'kunsthalle');
    [-1, 1].forEach(sd => rotBox(k, S, 0.7, H, 0.5, mx + tx * sd * (L / 2 - 0.3) + nx * 0.2, H / 2, mz + tz * sd * (L / 2 - 0.3) + nz * 0.2, ra, 'kunsthalle'));
    k.box('stone', mx + nx * 1.4 - 2, mx + nx * 1.4 + 2, 0, 0.3, mz + nz * 1.4 - 2, mz + nz * 1.4 + 2, 'kunsthalle'); }
  k.part = '';
  /* ---------- 1750: the plain baroque Stift with its corner lookout and obelisk ---------- */
  k.part = 'v:baroque'; prismOf(POLY, 0, 11, 'cream', 'stift'); prismOf(inset(POLY, 0.3), 10.6, 11.2, 'white', 'stift'); prismOf(inset(POLY, -0.8), 11.2, 14.6, 'slate', 'stift');
  edges((a, b, L, tx, tz, nx, nz, i) => { const ra = Math.atan2(-tz, tx), n = Math.max(1, Math.floor((L - 1.5) / 3.0)); for (let j = 0; j < n; j++) { const t = (j + 0.5) / n, x = a[0] + (b[0] - a[0]) * t + nx * 0.05, z = a[1] + (b[1] - a[1]) * t + nz * 0.05; [[2.0, 4.6], [6.4, 9.2]].forEach(f => rotBox(k, 'glassDark', 1.3, f[1] - f[0], 0.06, x, (f[0] + f[1]) / 2, z, ra, 'stift')); } });
  k.part = '';
  k.part = 'v:obelisk'; { const c = [(POLY[CH][0] + POLY[CH + 1][0]) / 2 + 3, (POLY[CH][1] + POLY[CH + 1][1]) / 2 - 3]; [[-1.4, -1.4], [1.4, -1.4], [1.4, 1.4], [-1.4, 1.4]].forEach(o => { const col = new THREE.CylinderGeometry(0.25, 0.28, 2.6, 10); col.translate(c[0] + o[0], 14.6 + 1.3, c[1] + o[1]); k.geo('white', col, 'stift'); });
    k.box('white', c[0] - 1.9, c[0] + 1.9, 17.2, 17.7, c[1] - 1.9, c[1] + 1.9, 'stift'); const ob = new THREE.CylinderGeometry(0.15, 0.7, 6.5, 4); ob.rotateY(Math.PI / 4); ob.translate(c[0], 21, c[1]); k.geo('stone', ob, 'stift'); } k.part = '';
  /* ---------- the 1847 tower after Santo Spirito: banded brick shaft, three arcaded belfry storeys ---------- */
  const TC = [(POLY[CH][0] + POLY[CH + 1][0]) / 2 + 4.2, (POLY[CH][1] + POLY[CH + 1][1]) / 2 - 3.6], TS = 3.6;
  k.part = 'tower1847';
  // banded shaft: every 3rd course is stoneLight, rest brick (Santo Spirito banding)
  for (let y = 0; y < 22; y += 1.6) k.box(Math.round(y / 1.6) % 3 === 2 ? S : 'brick', TC[0] - TS, TC[0] + TS, y, Math.min(22, y + 1.6), TC[1] - TS, TC[1] + TS, 'tower');
  // corner lesenes (pilaster strips)
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(c => k.box(S, TC[0] + c[0] * TS - 0.45, TC[0] + c[0] * TS + 0.45, 0, 22, TC[1] + c[1] * TS - 0.45, TC[1] + c[1] * TS + 0.45, 'tower'));
  // three arcaded belfry storeys with biforium windows
  [[22, 27.2, 3.6], [27.6, 32.4, 3.3], [32.8, 37.2, 3.0]].forEach(([y0, y1, s], ti) => {
    k.box('brick', TC[0] - s, TC[0] + s, y0, y1, TC[1] - s, TC[1] + s, 'fossils');
    k.box(S, TC[0] - s - 0.35, TC[0] + s + 0.35, y0 - 0.4, y0, TC[1] - s - 0.35, TC[1] + s + 0.35, 'fossils');
    // corner colonettes for belfry
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(c => k.box(S, TC[0] + c[0] * s - 0.4, TC[0] + c[0] * s + 0.4, y0, y1, TC[1] + c[1] * s - 0.4, TC[1] + c[1] * s + 0.4, 'fossils'));
    // biforium: two arched openings per face (divided by a central colonnette)
    const n = ti === 2 ? 1 : 2, w = ti === 2 ? 1.6 : 1.3;
    [[0, -1, Math.PI], [0, 1, 0], [-1, 0, -Math.PI / 2], [1, 0, Math.PI / 2]].forEach(f => {
      for (let j = 0; j < n; j++) {
        const off = n === 1 ? 0 : (j - 0.5) * 2.2;
        const x = TC[0] + f[0] * (s + 0.03) + (f[0] === 0 ? off : 0), z = TC[1] + f[1] * (s + 0.03) + (f[1] === 0 ? off : 0);
        arched(x, y0 + 0.7, w, y1 - y0 - 1.4, z, f[2], 'dark', 'fossils');
      }
      // biforium dividing colonnette on wider arches (n=2)
      if (n === 2) { const mx2 = TC[0] + f[0] * (s + 0.04), mz2 = TC[1] + f[1] * (s + 0.04); const cl = new THREE.CylinderGeometry(0.12, 0.14, y1 - y0 - 2.6, 8); cl.translate(mx2, y0 + 1.3, mz2); k.geo(S, cl, 'fossils'); }
    });
  });
  // corbel table at top of banded shaft
  for (let ci = 0; ci < 4; ci++) { const ca = ci / 4 * Math.PI * 2; const cbx = TC[0] + Math.cos(ca) * (TS + 0.1), cbz = TC[1] + Math.sin(ca) * (TS + 0.1); const corbel = new THREE.BoxGeometry(0.45, 0.4, 0.3); corbel.translate(cbx, 22 - 0.5, cbz); k.geo(S, corbel, 'tower'); }
  // pyramidal lantern roof + lantern + cross
  k.box(S, TC[0] - 3.4, TC[0] + 3.4, 37.2, 37.8, TC[1] - 3.4, TC[1] + 3.4, 'fossils');
  k.geo('roof', prism(TC[0] - 3.1, TC[0] + 3.1, TC[1] - 3.1, TC[1] + 3.1, 37.8, 40, 3.1, 3.1), 'fossils');
  { const lt = new THREE.CylinderGeometry(0.5, 0.5, 0.9, 10); lt.translate(TC[0], 40.45, TC[1]); k.geo(S, lt, 'fossils'); }
  // iron cross finial
  k.box('steel', TC[0] - 0.06, TC[0] + 0.06, 41.35, 43.1, TC[1] - 0.06, TC[1] + 0.06, 'fossils');
  k.box('steel', TC[0] - 0.55, TC[0] + 0.55, 42.1, 42.22, TC[1] - 0.06, TC[1] + 0.06, 'fossils');
  k.part = '';
  // 1945: burnt out, the tower still standing
  k.part = 'v:burnt'; prismOf(POLY, 0, 9 + rand() * 3, 'soot', 'tower'); for (let i = 0; i < 12; i++) { const x = -10 + rand() * 22, z = -12 + rand() * 24; k.box('soot', x, x + 1.5, 9, 9.5 + rand() * 2, z, z + 1.5, 'tower'); } k.part = '';
  /* ---------- junction: Askanische Straße with tram tracks ---------- */
  const sa = Math.atan2(0.225, 0.974);
  rotBox(k, 'asphalt', 150, 0.06, 15, 0, 0.03, 27, sa); [-2.5, 2.5].forEach(o => [-0.72, 0.72].forEach(r => rotBox(k, 'rail', 150, 0.05, 0.08, 0 + Math.sin(sa) * (o + r), 0.07, 27 + Math.cos(sa) * (o + r), sa)));
  k.box('asphalt', -34, -20, 0, 0.05, P.z0, P.z1);
  // period tram shelter at the stop
  k.box('iron', -30, -22, 2.4, 2.6, 26, 34, 'tram'); [[-30, 26], [-22.2, 26], [-30, 33.8], [-22.2, 33.8]].forEach(q => k.box('iron', q[0], q[0] + 0.2, 0, 2.4, q[1], q[1] + 0.2, 'tram')); k.box('glassDark', -29.8, -22.2, 0.3, 2.4, 26.05, 26.11, 'tram'); k.box('glassDark', -29.8, -22.2, 0.3, 2.4, 33.89, 33.95, 'tram');
  [[-45, -40], [40, -40], [55, 45], [-50, 48]].forEach(q => tree(k, q[0], q[1], 1.1));
  [[-18, 22], [22, 12]].forEach(q => lamp(k, q[0], q[1]));
  for (let i = 0; i < 12; i++) person(k, -16 + rand() * 32, 18 + rand() * 4, rand() * 6.28);
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return { scene, center: new THREE.Vector3(0, 0, 4), span: 75, sunDist: 220,
    lamps: [[-18, 22], [22, 12]].map(q => new THREE.Vector3(q[0], 4.85, q[1])),
    intro: { pos: [-42, 16, 46], tgt: [-4, 14, 4] },
    views: [{ label: 'From the junction', cam: [-30, 2.2, 38], tgt: [-6, 16, 8] }, { label: 'The tower top', cam: [-22, 40, 26], tgt: [TC[0], 33, TC[1]] }],
    eras: [
      { year: '1750', title: 'The Leopold-Dank-Stift', note: 'Completed in 1750 under Prince Leopold Maximilian as a home for old people. Above the corner rose a lookout of four short columns crowned by an obelisk. The baroque look is reconstructed from that description.', hide: ['nk1900', 'tower1847'], show: ['v:baroque', 'v:obelisk'] },
      { year: '1847', title: 'A tower after Santo Spirito', note: 'The obelisk was pulled down in 1838 as unsafe and replaced in 1847 by the tower that still marks the city skyline.', hide: ['nk1900'], show: ['v:baroque'] },
      { year: '1945', title: 'Burnt out', note: 'The building burned out in March 1945; the museum reopened in 1948.', hide: ['nk1900'], show: ['v:burnt'] },
      { year: 'today', title: 'Museum since 1927', note: 'Remodelled in 1900 by Gustav Teichmüller for the Anhalt art gallery, the building has housed the Museum für Naturkunde und Vorgeschichte since 29 October 1927.' }
    ],
    facts: [
      { id: 'stift', title: 'A home for old people', year: '1746–50', pos: [6, 16.5, -6], cam: [-42, 16, 46], tgt: [-4, 10, 4],
        text: 'The building was completed in 1750 under Prince Leopold Maximilian as the Leopold-Dank-Stift, a home for old and needy people. Above its corner rose a lookout of four short columns crowned by an obelisk.',
        src: ['Stadtarchiv Dessau-Roßlau, "Dessau in Trümmern"', 'https://www.alb-dessau.de/old/ausstellung/truemmer2020_022/'] },
      { id: 'tower', title: 'Santo Spirito in Dessau', year: '1838–1847', pos: [TC[0] + 4, 20, TC[1]], cam: [-30, 2.2, 38], tgt: [-6, 16, 8],
        text: 'The obelisk was pulled down in 1838 because it had become unsafe. In 1847 it was replaced by the 40-metre tower, modelled on the hospital of Santo Spirito in Rome.',
        src: ['Stadtarchiv Dessau-Roßlau and Visit Dessau', 'https://www.alb-dessau.de/old/ausstellung/truemmer2020_022/'] },
      { id: 'kunsthalle', title: 'Art gallery and Bauhaus studios', year: '1900–1926', pos: [-13.5, 15, 15], cam: [-34, 6, 30], tgt: [-8, 8, 10],
        text: 'In 1900 Gustav Teichmüller remodelled the building for the Anhaltische Kunsthalle. Before the Bauhaus building was finished, Paul Klee, Oskar Schlemmer, Joost Schmidt and Xanti Schawinsky had studios here, and the Bauhaus showed Marcel Breuer\'s tubular steel chair in its first exhibition on 17 January 1926.',
        src: ['Wikipedia (de) and the museum\'s friends\' association', 'https://museumsverein-dessau.de/'] },
      { id: 'fossils', title: 'Fossils on six floors', year: 'today', pos: [TC[0], 41.5, TC[1]], cam: [-22, 40, 26], tgt: [TC[0], 33, TC[1]],
        text: 'The museum opened here on 29 October 1927. Inside the tower, six floors take visitors through the history of the Earth, from the earliest times to the Pleistocene, ending with a view over the city.',
        src: ['Stadtarchiv Dessau-Roßlau and Wikipedia (de)', 'https://de.wikipedia.org/wiki/Museum_f%C3%BCr_Naturkunde_und_Vorgeschichte'] },
      { id: 'collections', title: 'Minerals to beetles', year: 'today', pos: [16.5, 7, 5], cam: [40, 10, 20], tgt: [10, 6, 2],
        text: 'The collections cover prehistory, geology, botany and zoology. The mineral collection alone holds 18,775 specimens, and there are special collections of insects, including rove beetles.',
        src: ['Museum collection concept, 2017', 'https://verwaltung.dessau-rosslau.de/fileadmin/Verwaltungsportal_Dessau-Rosslau/Kultur_Tourismus/Museum_fuer_Naturkunde_und_Vorgeschichte/MNVD_Sammlungskonzept_und_kuratorische_Richtlinien_2017.pdf'] }
    ] };
}
