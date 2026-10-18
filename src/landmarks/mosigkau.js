/* ================================================================
   Schloss Mosigkau (mosigkau)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['mosigkau'] = {
  meta: { id: 'mosigkau', years: '1752–57', name: 'Schloss Mosigkau', sub: 'Rococo, 1752–57', lat: 51.806003, lon: 12.150862, build: buildMosigkau, label: 'Schloss Mosigkau', meta: 'Summer residence of Princess Anna Wilhelmine, 1752–57', lead: 'A Rococo summer palace and garden, often called Little Sanssouci.' },
  token(k) {
    k.box('ochre', -32, 32, 0, 11.2, 0, 14); k.geo('tilesRed', prism(-32.3, 32.3, -0.3, 14.3, 11.2, 17.2, 4, 4)); k.box('ochre', -36, -26, 0, 9, -32, 0); k.box('ochre', 26, 36, 0, 9, -32, 0); k.box('hedge', 30, 59, 0, 2, 64, 93);
  },
  quiz: [
    { q: 'Why is Mosigkau called “Little Sanssouci”?', o: ['The first designs probably came from Sanssouci’s architect', 'It is a copy of Sanssouci', 'Frederick the Great lived here', 'It has vineyard terraces'], a: 0, e: 'Georg Wenzeslaus von Knobelsdorff.' }
  ]
};

function buildMosigkau() {
  const k = new Kit(), F = 'ochre', S = 'whiteInt';
  const P = { x0: -90, x1: 90, z0: -70, z1: 110 };
  parkGround(k, P);
  // the corps de logis: two storeys, red mansard roof with dormers, white chimneys
  const MX = 32, MH = 11.2;
  k.box('stone', -MX, MX, 0, 0.9, 0, 14, 'corps'); k.box(F, -MX, MX, 0.9, MH, 0, 14, 'corps'); k.box(S, -MX - 0.3, MX + 0.3, MH - 0.3, MH + 0.4, -0.3, 14.3, 'corps');
  k.geo('tilesRed', prism(-MX - 0.3, MX + 0.3, -0.3, 14.3, MH + 0.4, MH + 4.2, 1.4, 1.4), 'corps'); k.geo('tilesRed', prism(-MX + 1.1, MX - 1.1, 1.1, 12.9, MH + 4.2, MH + 6.0, 5.8, 5.8), 'corps');
  for (let x = -MX + 3; x <= MX - 3; x += 5.4) [-1, 1].forEach(sd => { if (Math.abs(x) < 5) return; const z = sd > 0 ? 13.6 : 0.4; k.box(S, x - 0.8, x + 0.8, MH + 1.0, MH + 3.0, z - 0.3, z + 0.3, 'corps'); k.winZ(z + sd * 0.31, sd, x - 0.5, x + 0.5, MH + 1.3, MH + 2.7, { frame: S, glass: 'glassDark', tag: 'corps' }); k.geo('tilesRed', prism(x - 1.0, x + 1.0, z - 0.6, z + 0.6, MH + 3.0, MH + 3.7, 1.0, 0), 'corps'); });
  [-24, -12, 12, 24].forEach(x => k.box('white', x - 0.7, x + 0.7, MH + 4.0, MH + 7.6, 6.3, 7.7, 'corps'));
  for (let x = -MX + 2.2; x <= MX - 2.2; x += 3.4) { [[1.8, 5.0], [6.6, 9.8]].forEach(f => { k.winZ(0, -1, x - 0.75, x + 0.75, f[0], f[1], { mull: 0.75, trans: [f[0] + 2.2], frame: S, tag: 'corps' }); if (Math.abs(x) > 8.6) k.winZ(14, 1, x - 0.75, x + 0.75, f[0], f[1], { mull: 0.75, trans: [f[0] + 2.2], frame: S, tag: 'corps' }); }); }
  // garden front: a centre with paired white columns, tall arched French windows of the gallery hall, a cartouche on top
  k.part = 'gallery';
  k.box(F, -8.6, 8.6, 0.9, MH, 14, 14.8, 'gallery'); k.box(S, -8.9, 8.9, MH - 0.3, MH + 0.5, 14, 15.1, 'gallery');
  [-8.1, -6.9, -2.9, 2.9, 6.9, 8.1].forEach(x => { const c = new THREE.CylinderGeometry(0.34, 0.38, MH - 1.3, 14); c.translate(x, 0.9 + (MH - 1.3) / 2, 15.2); k.geo(S, c, 'gallery'); });
  [-5.0, -1.7, 1.7, 5.0].concat([-11.6, -15, 11.6, 15]).forEach(x => { const sh = new THREE.Shape(); sh.moveTo(-0.8, 0); sh.lineTo(0.8, 0); sh.lineTo(0.8, 3.9); sh.absarc(0, 3.9, 0.8, 0, Math.PI, false); sh.closePath(); const g = new THREE.ShapeGeometry(sh, 12); g.translate(x, 0.95, Math.abs(x) < 8 ? 14.84 : 14.04); k.geo('glassDark', g, 'gallery'); const r = new THREE.RingGeometry(0.8, 1.05, 12, 1, 0, Math.PI); r.translate(x, 4.85, Math.abs(x) < 8 ? 14.86 : 14.06); k.geo(S, r, 'gallery'); });
  [-5.0, -1.7, 1.7, 5.0].forEach(x => k.winZ(14.8, 1, x - 0.7, x + 0.7, 6.6, 9.8, { mull: 0.7, frame: S, tag: 'gallery' }));
  k.box(S, -3.2, 3.2, MH + 0.5, MH + 2.6, 14.4, 15.0, 'gallery'); { const c = new THREE.CircleGeometry(1.1, 18); c.translate(0, MH + 1.6, 15.02); k.geo('bronzeDark', c, 'gallery'); } k.box(S, -1.0, 1.0, MH + 2.6, MH + 3.8, 14.5, 15.0, 'gallery');
  for (let i = 0; i < 5; i++) k.box('stone', -5 + i * 0.3, 5 - i * 0.3, 0, 0.9 - i * 0.18, 14.8, 15.2 + (5 - i) * 0.45);
  k.part = '';
  k.box('dark', -1.1, 1.1, 0.9, 4.4, -0.06, -0.02, 'court'); k.box(S, -4, 4, MH - 0.3, MH + 1.8, -0.5, 0, 'court');
  // side wings framing the court of honour
  [-1, 1].forEach(sd => { const xa = sd < 0 ? -36 : 26, xb = sd < 0 ? -26 : 36; k.box(F, xa, xb, 0, 6.5, -32, 0, 'court'); k.box(S, xa - 0.2, xb + 0.2, 6.2, 6.8, -32.2, 0, 'court'); k.geo('tilesRed', prism(xa - 0.2, xb + 0.2, -32.2, 0, 6.8, 10.4, 5.2, 0), 'court'); winGrid(k, 'x', sd < 0 ? -26 : 26, -sd, -29, -4, 3.4, [[1.4, 5.2]], 1.4, { mull: 0.7, frame: S, tag: 'court' }); });
  k.box('gravel', -26, 26, 0, 0.04, -32, 0, 'court');
  // rococo garden: parterre, fish pond, maze and orangery
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const x0 = -30 + i * 15.5, z0 = 26 + j * 15; hedgeRow(k, x0, x0 + 12, z0, z0 + 0.6, 0.6, 'garden'); hedgeRow(k, x0, x0 + 12, z0 + 11.4, z0 + 12, 0.6, 'garden'); hedgeRow(k, x0, x0 + 0.6, z0, z0 + 12, 0.6, 'garden'); hedgeRow(k, x0 + 11.4, x0 + 12, z0, z0 + 12, 0.6, 'garden'); const fl = new THREE.CircleGeometry(3, 20); fl.rotateX(-Math.PI / 2); fl.translate(x0 + 6, 0.05, z0 + 6); k.geo('bauRed', fl, 'garden'); }
  k.box('gravel', -34, 34, 0, 0.03, 20, 58);

  { const N = 9, C = 3.2, ox = 30, oz = 64, rr = mulberry(1757); const vis = Array.from({ length: N * N }, () => false), walls = new Set(); for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { walls.add('h' + i + ',' + j); walls.add('v' + i + ',' + j); }
    const stack = [[0, 0]]; vis[0] = true; while (stack.length) { const [ci, cj] = stack[stack.length - 1]; const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(d => [ci + d[0], cj + d[1], d]).filter(n => n[0] >= 0 && n[1] >= 0 && n[0] < N && n[1] < N && !vis[n[0] * N + n[1]]); if (!nb.length) { stack.pop(); continue; } const n = nb[(rr() * nb.length) | 0]; vis[n[0] * N + n[1]] = true; const d = n[2]; if (d[0] === 1) walls.delete('v' + (ci + 1) + ',' + cj); if (d[0] === -1) walls.delete('v' + ci + ',' + cj); if (d[1] === 1) walls.delete('h' + ci + ',' + (cj + 1)); if (d[1] === -1) walls.delete('h' + ci + ',' + cj); stack.push([n[0], n[1]]); }
    walls.delete('h0,0');
    walls.forEach(w => { const [i, j] = w.slice(1).split(',').map(Number); if (w[0] === 'h') hedgeRow(k, ox + i * C, ox + (i + 1) * C, oz + j * C - 0.3, oz + j * C + 0.3, 1.6, 'maze'); else hedgeRow(k, ox + i * C - 0.3, ox + i * C + 0.3, oz + j * C, oz + (j + 1) * C, 1.6, 'maze'); });
    hedgeRow(k, ox, ox + N * C - C, oz + N * C - 0.3, oz + N * C + 0.3, 1.6, 'maze'); hedgeRow(k, ox + N * C - 0.3, ox + N * C + 0.3, oz, oz + N * C, 1.6, 'maze'); k.box('gravel', ox, ox + N * C, 0, 0.03, oz, oz + N * C, 'maze'); }
  k.box(F, 46, 82, 0, 6, 20, 28, 'garden'); k.geo('slate', prism(45.8, 82.2, 19.8, 28.2, 6, 8, 4, 4), 'garden'); for (let x = 48; x < 80; x += 3) { const sh = new THREE.Shape(); sh.moveTo(-0.9, 0); sh.lineTo(0.9, 0); sh.lineTo(0.9, 3.4); sh.absarc(0, 3.4, 0.9, 0, Math.PI, false); sh.closePath(); const g = new THREE.ShapeGeometry(sh, 10); g.rotateY(Math.PI); g.translate(x, 0.5, 19.97); k.geo('glassDark', g, 'garden'); }
  for (let i = 0; i < 26; i++) { const x = P.x0 + 6 + rand() * (P.x1 - P.x0 - 12), z = P.z0 + 6 + rand() * (P.z1 - P.z0 - 12); if (x > -40 && x < 86 && z > -36 && z < 98) continue; tree(k, x, z, 1.1 + rand() * 0.4); }
  for (let i = 0; i < 12; i++) person(k, -30 + rand() * 60, 20 + rand() * 38, rand() * 6.28);
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return { scene, center: new THREE.Vector3(0, 0, 25), span: 100, sunDist: 260, lamps: [], intro: { pos: [-40, 32, 120], tgt: [0, 6, 25] },
    views: [{ label: 'From the garden', cam: [0, 3, 70], tgt: [0, 7, 10] }, { label: 'Into the maze', cam: [44, 26, 110], tgt: [44, 0, 78] }, { label: 'The court of honour', cam: [0, 4, -60], tgt: [0, 6, 5] }],
    facts: [
      { id: 'corps', title: 'A princess’s summer seat', year: '1752–57', pos: [-20, 15, 7], cam: [-40, 32, 120], tgt: [0, 6, 20],
        text: 'In 1742–43 Prince Leopold I gave two estates at Mosigkau to his favourite daughter, Anna Wilhelmine (1715–1780). She had her summer residence built here from 1752 to 1757. It is one of the last largely preserved Rococo ensembles in central Germany.',
        src: ['Gartenträume Sachsen-Anhalt and ADAC', 'https://gartentraeume-sachsen-anhalt.de/en/garden-dreams-parks/mosigkau-palace-and-gardens.html'] },
      { id: 'gallery', title: 'Paintings wall to wall', year: '1750s', pos: [0, 14.2, 17.8], cam: [0, 3, 70], tgt: [0, 7, 10],
        text: 'The highlight is the gallery hall, where Baroque paintings by Flemish and Dutch masters, among them Anthony van Dyck, Peter Paul Rubens and Jan Brueghel the Elder, hang edge to edge in an arrangement that survives almost complete, a rarity in Europe.',
        src: ['Anhalt-Dessau-Wittenberg', 'https://www.anhalt-dessau-wittenberg.de/en/staedte-sehenswuerdigkeiten-landschaften/mosigkau-castle-and-park'] },
      { id: 'court', title: 'A “little Sanssouci”', year: '1752', pos: [31, 11.5, -16], cam: [0, 4, -60], tgt: [0, 6, 5],
        text: 'The first designs probably came from Georg Wenzeslaus von Knobelsdorff, the architect of Sanssouci, which is why Mosigkau is still called “Little Sanssouci”. The builder was Christian Friedrich Damm.',
        src: ['Gartenträume Sachsen-Anhalt and ADAC', 'https://maps.adac.de/poi/schloss-mosigkau-dessau-rosslau'] },
      { id: 'maze', title: 'A maze and a convent', year: '1780–1945', pos: [44, 3, 78], cam: [44, 26, 110], tgt: [44, 0, 78],
        text: 'In her will the princess founded a convent for unmarried noblewomen here, which existed from 1780 until 1945. The garden still keeps its maze, fish pond, orangeries and a Chinese pavilion. The maze in the model is a stand-in, not the real layout.',
        src: ['Anhalt-Dessau-Wittenberg', 'https://www.anhalt-dessau-wittenberg.de/en/staedte-sehenswuerdigkeiten-landschaften/mosigkau-castle-and-park'] }
    ] };
}
