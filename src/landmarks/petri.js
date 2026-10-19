/* ================================================================
   St. Petri, Wörlitz (petri)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['petri'] = {
  meta: { id: 'petri', years: 'c. 1200–1809', name: 'St. Petri, Wörlitz', sub: 'Bible tower, 66 m', lat: 51.844831, lon: 12.421936, build: buildPetri, label: 'St. Petri church, Wörlitz', meta: 'Romanesque church of about 1200, rebuilt in Tudor Gothic 1805–09; Bible tower since 1994', lead: 'The town church of Wörlitz at the edge of the park, with its 66-metre tower. The footprint follows OpenStreetMap and the facades follow photographs. Click the numbers to learn its story.' },
  token(k) {
    k.box('brick', -10.5, 10.5, 0, 11, -8, 5.5); k.box('brick', 10.5, 22.5, 0, 11, -13, 13); k.box('brick', 22.5, 30, 0, 10, -5, 6); k.geo('tilesRed', prism(-10.7, 22.7, -8.4, 5.9, 11, 19.6, 0, 6.9)); k.box('brick', -19.5, -10.5, 0, 46, -6, 2); const sp = new THREE.ConeGeometry(2.5, 20, 8); sp.translate(-15, 56, -2); k.geo('brick', sp);
  },
  quiz: [
    { q: 'How tall is the tower of St. Petri in Wörlitz?', o: ['66 metres', '41 metres', '38 metres', '100 metres'], a: 0, e: 'The rebuilding of 1805–09 raised the tower to 66 metres.' }
  ]
};

function buildPetri() {
  // outline from the map data, north up: west tower 9 × 8 m, nave, transept arms with small stair porches, choir ending in a polygonal apse
  const k = new Kit(), B = 'redBrick', S = 'stoneLight', T = 'tilesRed';
  const P = { x0: -75, x1: 70, z0: -60, z1: 60 };
  k.box('lawn', P.x0, P.x1, -0.12, 0, P.z0, P.z1);
  const NZ0 = -8, NZ1 = 5.5, NX0 = -10.5, NX1 = 10.5, CX0 = 10.5, CX1 = 22.5, CZ = 13, EH = 11;
  k.part = 'neo';
  k.box(S, NX0, NX1, 0, 0.8, NZ0, NZ1, 'tudor'); k.box(B, NX0, NX1, 0.8, EH, NZ0, NZ1, 'tudor'); gableRoof(k, T, NX0 - 0.2, NX1 + 0.4, NZ0 - 0.4, NZ1 + 0.4, EH, 8.6, true, 'tudor');
  k.box(S, CX0, CX1, 0, 0.8, -CZ, CZ, 'tudor'); k.box(B, CX0, CX1, 0.8, EH, -CZ, CZ, 'tudor'); gableRoof(k, T, CX0 - 0.2, CX1 + 0.2, -CZ - 0.4, CZ + 0.4, EH, 8.6, false, 'tudor');
  // the small stair porches on the transept ends
  [[15.5, 19.5, -16, -CZ], [13.5, 17.5, CZ, 16]].forEach(q => { k.box(B, q[0], q[1], 0, 6.5, q[2], q[3], 'tudor'); k.geo(T, prism(q[0] - 0.2, q[1] + 0.2, q[2] - 0.2, q[3] + 0.2, 6.5, 8.6, 2.2, 0), 'tudor'); gothWin(k, 'z', q[2] < 0 ? q[2] : q[3], q[2] < 0 ? -1 : 1, (q[0] + q[1]) / 2, 0.5, 1.4, 3.6, 'tudor', 'wood'); });
  // choir and the polygonal apse reaching to x 30.5
  k.box(B, CX1, 26, 0, 10, -5, 6, 'tudor'); gableRoof(k, T, CX1 - 0.1, 26, -5.4, 6.4, 10, 5.4, true, 'tudor');
  { const a = new THREE.CylinderGeometry(5.5, 5.5, 10, 6, 1, false, 0, Math.PI); a.scale(0.82, 1, 1); a.translate(26, 5, 0.5); k.geo(B, a, 'tudor'); const r = new THREE.ConeGeometry(5.9, 5.4, 6, 1, false, 0, Math.PI); r.scale(0.82, 1, 1); r.translate(26, 12.7, 0.5); k.geo(T, r, 'tudor');
    [-0.85, 0, 0.85].forEach(t => { const nx = Math.cos(t) / 0.82, nz = Math.sin(t), ln = Math.hypot(nx, nz), g = new THREE.ShapeGeometry(pointedShape(1.4, 5), 8); g.rotateY(Math.atan2(nx / ln, nz / ln)); g.translate(26 + Math.cos(t) * 4.4 + nx / ln * 0.08, 3, 0.5 + Math.sin(t) * 5.4 + nz / ln * 0.08); k.geo('glassDark', g, 'tudor'); }); }
  [-1, 1].forEach(sd => steppedGable(k, B, 'z', sd * CZ, sd, (CX0 + CX1) / 2, 12.4, EH, 9.4, 3, 'tudor', 'whiteInt'));
  // buttresses with pinnacles and tall pointed windows along the nave
  [-8, -3, 2, 7].forEach(x => [NZ0, NZ1].forEach(z => { const sd = z > 0 ? 1 : -1; k.box(B, x - 0.45, x + 0.45, 0, EH - 1, Math.min(z, z + sd * 1.1), Math.max(z, z + sd * 1.1), 'tudor'); pinnacle(k, S, x, EH - 1, z + sd * 0.55, 3.2, 0.5, 'tudor'); }));
  [-5.5, -0.5, 4.5].forEach(x => { gothWin(k, 'z', NZ1, 1, x, 2.8, 2.0, 6.8, 'tudor'); gothWin(k, 'z', NZ0, -1, x, 2.8, 2.0, 6.8, 'tudor'); });
  [12.6, 20.4].forEach(x => [-1, 1].forEach(sd => gothWin(k, 'z', sd * CZ, sd, x, 2.4, 2.0, 7.0, 'tudor')));
  [[-10, -1], [9.5, -1], [-10, 1], [9.5, 1]].forEach(([z, sd]) => gothWin(k, 'x', sd > 0 ? CX1 : CX0, sd, z, 2.6, 1.8, 6.4, 'tudor'));
  [-1, 1].forEach(sd => gothWin(k, 'z', sd > 0 ? 6 : -5, sd, 24.2, 3.0, 1.5, 5.0, 'tudor'));
  [-7, -1, 5].forEach(x => [-1, 1].forEach(sd => { const z = sd > 0 ? NZ1 - 1.8 : NZ0 + 1.8; k.box(B, x - 0.6, x + 0.6, EH + 2.2, EH + 3.4, z - 0.6, z + 0.6, 'tudor'); k.geo(T, prism(x - 0.8, x + 0.8, z - 0.8, z + 0.8, EH + 3.4, EH + 4.2, 0, 0.8), 'tudor'); }));
  { const cx = (CX0 + CX1) / 2, f = new THREE.CylinderGeometry(1.1, 1.2, 3.4, 8); f.translate(cx, EH + 9.6, -0.8); k.geo('slate', f, 'tudor'); const sp = new THREE.ConeGeometry(1.25, 8, 8); sp.translate(cx, EH + 15.3, -0.8); k.geo('slate', sp, 'tudor'); }
  // the 66 m west tower
  const TX0 = -19.5, TX1 = NX0, TZ = -2, TH = 4, TC = (TX0 + TX1) / 2, TZ0 = TZ - TH, TZ1 = TZ + TH;
  k.box(S, TX0 - 0.1, TX1, 0, 1.0, TZ0 - 0.1, TZ1 + 0.1, 'tower'); k.box(B, TX0, TX1, 1.0, 46, TZ0, TZ1, 'tower');
  [11, 20, 29, 37].forEach(y => k.box(S, TX0 - 0.15, TX1 + 0.15, y, y + 0.4, TZ0 - 0.15, TZ1 + 0.15, 'tower'));
  [[TX0, TZ0], [TX1, TZ0], [TX1, TZ1], [TX0, TZ1]].forEach(c => k.box(B, c[0] - 0.55, c[0] + 0.55, 0, 46, c[1] - 0.55, c[1] + 0.55, 'tower'));
  [[14, 1.6, 4.2], [22.6, 1.6, 4.6]].forEach(([y, w, h]) => { gothWin(k, 'x', TX0, -1, TZ, y, w, h, 'tower'); gothWin(k, 'z', TZ0, -1, TC, y, w, h, 'tower'); gothWin(k, 'z', TZ1, 1, TC, y, w, h, 'tower'); });
  [-1, 1].forEach(o => { gothWin(k, 'x', TX0, -1, TZ + o * 1.6, 38.6, 1.2, 5.6, 'tower', 'dark'); gothWin(k, 'z', TZ0, -1, TC + o * 1.6, 38.6, 1.2, 5.6, 'tower', 'dark'); gothWin(k, 'z', TZ1, 1, TC + o * 1.6, 38.6, 1.2, 5.6, 'tower', 'dark'); gothWin(k, 'x', TX1, 1, TZ + o * 1.6, 38.6, 1.2, 5.6, 'tower', 'dark'); });
  clockFaces(k, TC, 33.2, TZ, TH, 1.5, 'white', 'black', 'tower');
  gothWin(k, 'x', TX0, -1, TZ, 1.0, 2.4, 4.4, 'tower', 'wood');
  k.box(S, TX0 - 0.3, TX1 + 0.3, 46, 46.9, TZ0 - 0.3, TZ1 + 0.3, 'tower'); rails(k, S, [[TX0 - 0.2, TZ0 - 0.2], [TX1 + 0.2, TZ0 - 0.2], [TX1 + 0.2, TZ1 + 0.2], [TX0 - 0.2, TZ1 + 0.2], [TX0 - 0.2, TZ0 - 0.19]], 46.9, [0.9], 'tower');
  [[TX0, TZ0], [TX1, TZ0], [TX1, TZ1], [TX0, TZ1]].forEach(c => { k.box(B, c[0] - 0.5, c[0] + 0.5, 46.9, 50.6, c[1] - 0.5, c[1] + 0.5, 'tower'); pinnacle(k, S, c[0], 50.6, c[1], 7.4, 0.65, 'tower'); });
  { const l = new THREE.CylinderGeometry(2.4, 2.6, 5.2, 8); l.translate(TC, 49.5, TZ); k.geo(B, l, 'tower'); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8, w = new THREE.PlaneGeometry(0.8, 2.6); w.rotateY(Math.PI / 2 - a); w.translate(TC + Math.cos(a) * 2.52, 49.6, TZ - Math.sin(a) * 2.52); k.geo('dark', w, 'tower'); }
    const sp = new THREE.ConeGeometry(2.5, 13, 8); sp.translate(TC, 58.6, TZ); k.geo(B, sp, 'tower'); k.box('iron', TC - 0.06, TC + 0.06, 65, 66.2, TZ - 0.06, TZ + 0.06, 'tower'); }
  k.part = '';
  // about 1200: the Romanesque fieldstone church
  k.part = 'v:roman';
  k.box('stone', -10, 13, 0, 8, -7, 4.6, 'romanesque'); gableRoof(k, T, -10.2, 13.2, -7.4, 5, 8, 6.2, true, 'romanesque');
  { const a = new THREE.CylinderGeometry(4.6, 4.6, 7, 12, 1, false, 0, Math.PI); a.translate(13, 3.5, -1.2); k.geo('stone', a, 'romanesque'); const r = new THREE.SphereGeometry(4.8, 12, 6, 0, Math.PI, 0, Math.PI / 2); r.translate(13, 7, -1.2); k.geo(T, r, 'romanesque'); }
  k.box('stone', -19, -10, 0, 21, -6, 2, 'romanesque'); k.geo(T, prism(-19.3, -9.7, -6.3, 2.3, 21, 26, 4.3, 4.3), 'romanesque');
  [-6, 0, 6, 11].forEach(x => [-1, 1].forEach(sd => { const sh = new THREE.Shape(); sh.moveTo(-0.45, 0); sh.lineTo(0.45, 0); sh.lineTo(0.45, 1.3); sh.absarc(0, 1.3, 0.45, 0, Math.PI, false); sh.closePath(); const g = new THREE.ShapeGeometry(sh, 8); if (sd < 0) g.rotateY(Math.PI); g.translate(x, 5, sd > 0 ? 4.64 : -7.04); k.geo('dark', g, 'romanesque'); }));
  k.part = '';
  // the real surroundings: the town, its streets and the park
  realContext(k, 'petri', P, { own: [-21, 32, -18, 18] });
  for (let i = 0; i < 8; i++) person(k, -30 + rand() * 12, -6 + rand() * 8, rand() * 6.28);
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return { scene, center: new THREE.Vector3(2, 0, 0), span: 80, sunDist: 240, lamps: [], intro: { pos: [-55, 26, 50], tgt: [2, 18, 0] },
    views: [{ label: 'The west tower', cam: [-60, 4, -10], tgt: [TC, 30, TZ] }, { label: 'The stepped gables', cam: [30, 6, 50], tgt: [16.5, 14, 10] }, { label: 'The crown of the tower', cam: [-38, 62, 28], tgt: [TC, 54, TZ] }],
    eras: [
      { year: 'c. 1200', title: 'A Romanesque church', note: 'The first stone church of about 1196–1200. Its foundation walls survive; the look shown here is a simplified reconstruction.', hide: ['neo'], show: ['v:roman'] },
      { year: 'today', title: 'Tudor Gothic and the Bible tower', note: 'Rebuilt in neo-Gothic style in 1805–09, with the tower raised to 66 metres. Since 1994 the tower has been the Bibelturm, with exhibitions and a viewing platform.' }
    ],
    facts: [
      { id: 'romanesque', title: 'A church of about 1200', year: '1196–1200', pos: [2, 22, -1], cam: [-55, 26, 50], tgt: [2, 12, 0],
        text: 'The church goes back to a Romanesque building of about 1196 to 1200. Its foundation walls still survive inside today’s church.',
        src: ['ADAC, St. Petri Kirche Wörlitz', 'https://maps.adac.de/poi/st-petri-kirche-woerlitz-1'] },
      { id: 'tudor', title: 'Tudor Gothic for the Garden Realm', year: '1805–09', pos: [16.5, EH + 10.6, CZ + 0.4], cam: [30, 6, 50], tgt: [16.5, 14, 10],
        text: 'Prince Leopold III Friedrich Franz, who laid out the Wörlitz Park, had the church rebuilt in 1805–09 in a neo-Gothic style inspired by English Tudor Gothic. The architect was Georg Christoph Hesekiel.',
        src: ['komoot, St. Peter’s Church and the Bible Tower', 'https://www.komoot.com/highlight/845882'] },
      { id: 'tower', title: 'A 66-metre tower', year: '1809', pos: [TC, 67.5, TZ], cam: [-60, 4, -10], tgt: [TC, 30, TZ],
        text: 'The rebuilding raised the tower to 66 metres. It stands where the town of Wörlitz meets the park, east of the palace.',
        src: ['ADAC, Schloss Wörlitz', 'https://maps.adac.de/poi/schloss-woerlitz-wittenburg'] },
      { id: 'bibelturm', title: 'Germany’s only Bible tower', year: '1994', pos: [TX0 - 0.6, 41, TZ], cam: [-38, 62, 28], tgt: [TC, 54, TZ],
        text: 'Since 1994 the church tower has been the Bibelturm. Exhibitions about the Bible and faith fill three floors of the former tower keeper’s flat, and a viewing platform looks out over Wörlitz and its park.',
        src: ['Volksstimme, 25 Jahre Bibelturm Wörlitz', 'https://www.volksstimme.de/sachsen-anhalt/25-jahre-bibelturm-worlitz-mehr-als-300-000-menschen-kamen-1003804'] }
    ] };
}
function steppedGable(k, m, axis, plane, sd, c, w, y0, h, steps, tag, panel) {
  const s = new THREE.Shape(), sw = w / (2 * steps + 1), sh = h / (steps + 1); s.moveTo(-w / 2, 0);
  for (let i = 0; i <= steps; i++) { const x = -w / 2 + i * sw; s.lineTo(x, (i + 1) * sh); s.lineTo(x + sw, (i + 1) * sh); }
  for (let i = steps - 1; i >= 0; i--) { const x = w / 2 - i * sw; s.lineTo(x - sw, (i + 1) * sh); s.lineTo(x, (i + 1) * sh); }
  s.lineTo(w / 2, 0); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.8, bevelEnabled: false });
  if (axis === 'z') { if (sd < 0) g.rotateY(Math.PI); g.translate(c, y0, plane - sd * 0.8 + sd * 0.8); } else { g.rotateY(sd > 0 ? Math.PI / 2 : -Math.PI / 2); g.translate(plane, y0, c); }
  k.geo(m, g, tag);
  if (panel) for (let i = -steps; i <= steps; i++) { const ph = (steps + 1 - Math.abs(i)) * sh - 1.2; if (ph < 1.2) continue; gothWin(k, axis, plane, sd, c + i * sw * (axis === 'x' && sd > 0 ? -1 : 1) * (axis === 'z' && sd < 0 ? -1 : 1), y0 + 0.4, sw * 0.55, ph, tag, panel, panel); }
}
