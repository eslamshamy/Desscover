/* ================================================================
   Masters’ Houses (meister)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['meister'] = {
  meta: { id: 'meister', years: '1925–26', name: 'Masters’ Houses', sub: 'Walter Gropius, 1926', lat: 51.843122, lon: 12.221467, build: buildMeister, label: 'Masters’ Houses', meta: 'Walter Gropius, 1925–26, rebuilt in part 2014', lead: 'The houses of the Bauhaus director and masters on Ebertallee, shown as they stand today, with the 2014 reinterpretations of the lost Gropius and Moholy-Nagy houses.' },
  token(k) {
    [[-91, -71], [-41, -21], [9, 29]].forEach(q => { k.box('white', q[0], q[0] + 9, 0, 8.7, -2, 7); k.box('white', q[1], q[1] + 9, 0, 8.7, -5, 4); }); k.box('newWhite', 62, 84, 0, 6.6, -6, 6);
  },
  quiz: [
    { q: 'Who lived in the same double house as Paul Klee?', o: ['Wassily Kandinsky', 'Walter Gropius', 'Lyonel Feininger', 'Oskar Schlemmer'], a: 0, e: 'Kandinsky and Klee were neighbours from 1926.' }
  ]
};

function buildMeister() {
  const k = new Kit();
  doubleHouse(k, 20, 'feininger', 'moholy', true);
  doubleHouse(k, -30, 'muche', 'muche', false);
  doubleHouse(k, -80, 'kandinsky', 'kandinsky', false, 'gold');
  const gx = 62;
  k.box('grey', gx, gx + 22, 0, 0.9, -6, 6, 'gropius');
  k.part = 'new'; gropiusHouse(k, gx, true); k.part = '';
  k.part = 'v:orig'; gropiusHouse(k, gx, false); k.part = '';
  k.part = 'v:emmer';
  k.box('renderWarm', gx + 2, gx + 14, 0.9, 6.2, -5, 5, 'gropius'); gableRoof(k, 'tiles', gx + 1.6, gx + 14.4, -5.4, 5.4, 6.2, 4.2, true, 'gropius');
  [gx + 3.5, gx + 7, gx + 10.5].forEach(x => { k.winZ(-5, -1, x, x + 1.4, 2.0, 3.6, { frame: 'whiteInt', tag: 'gropius' }); k.winZ(-5, -1, x, x + 1.4, 4.2, 5.6, { frame: 'whiteInt', tag: 'gropius' }); });
  k.part = 'v:rubbleG'; for (let i = 0; i < 14; i++) { const x = gx + rand() * 20, z = -5 + rand() * 10; k.box('soot', x, x + 1 + rand() * 2.5, 0.9, 1.2 + rand() * 1.6, z, z + 1 + rand() * 2.5, 'gropius'); } k.part = '';
  k.box('newWhite', gx + 22, gx + 22.3, 0, 2.0, -14, -3, 'trinkhalle');
  k.box('newWhite', gx + 22, 108, 0, 2.0, -14.3, -14, 'trinkhalle'); k.box('newWhite', 107.7, 108, 0, 2.0, -14, 14, 'trinkhalle');
  k.part = 'kiosk'; k.box('newWhite', 101, 108, 0, 2.7, -14.3, -10, 'trinkhalle'); k.paneZ('frost', -14.35, 1.0, 2.2, 102.5, 106.5, 'trinkhalle'); k.box('roof', 101, 108, 2.7, 2.75, -14.3, -10); k.part = '';
  const P = { x0: -110, x1: 128, z0: -50, z1: 48 };
  k.box('gravel', P.x0, P.x1, -0.12, 0, P.z0, P.z1);
  for (let i = 0; i < 9; i++) { const x0 = P.x0 + i * 27; k.box('lawn', x0 + 1, x0 + 26, 0, 0.02, -13, 45); }
  k.box('asphalt', P.x0, 110, 0, 0.03, -27, -19); k.box('paving', P.x0, 110, 0, 0.06, -19, -16.5); k.box('asphalt', 110, 118, 0, 0.03, P.z0, P.z1);
  [20, -30, -80].forEach(cx => k.box('paving', cx - 0.8, cx + 0.8, 0, 0.05, -16.5, -5));
  k.box('paving', gx + 8, gx + 10, 0, 0.05, -16.5, -6);
  const houses = [[-92, -66, -6, 9], [-42, -16, -6, 9], [8, 34, -6, 9], [60, 86, -8, 12]];
  for (let i = 0; i < 70; i++) {
    const x = P.x0 + 4 + rand() * (P.x1 - P.x0 - 8), z = -12 + rand() * 56;
    if (houses.some(h => x > h[0] - 3 && x < h[1] + 3 && z > h[2] - 3 && z < h[3] + 6)) continue;
    if (x > 100) continue; if (x > 85 && z > -13 && z < 18) continue;
    tree(k, x, z, 1.15 + rand() * 0.45, 'pine');
  }
  for (let x = -100; x < 105; x += 12) tree(k, x + rand() * 3, -31 + rand() * 2, 1.0);
  k.box('paving', 89, 107, 0, 0.05, -8, 14, 'plot');   // the building plot: paved, so no grass grows through the blocks
  [[89, 107, -8.3, -8], [89, 107, 14, 14.3], [88.7, 89, -8.3, 14.3], [107, 107.3, -8.3, 14.3]].forEach(q => k.box('concrete', q[0], q[1], 0, 0.25, q[2], q[3], 'plot'));
  k.box('wood', 97.8, 98.0, 0, 1.6, -9.6, -9.4, 'plot'); k.box('white', 96.6, 99.2, 1.6, 2.6, -9.62, -9.38, 'plot');
  [[-60, -17.5], [-5, -17.5], [45, -17.5], [95, -17.5]].forEach(q => lamp(k, q[0], q[1]));
  for (let i = 0; i < 14; i++) person(k, -95 + rand() * 190, -18.5 + rand() * 2, rand() * 6.28);
  const grp = k.build();
  const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp);
  plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return {
    scene, center: new THREE.Vector3(10, 0, 0), span: 125, sunDist: 300, lamps: [[-60, -17.5], [-5, -17.5], [45, -17.5], [95, -17.5]].map(q => new THREE.Vector3(q[0], 4.85, q[1])),
    intro: { pos: [-20, 70, -140], tgt: [10, 2, 4] },
    eras: [
      { year: '1926', title: 'Built', note: 'Gropius’s director’s house and three double houses for the masters, in a pine wood.', hide: ['new', 'kiosk'], show: ['v:orig'] },
      { year: '1932', title: 'Mies’s kiosk', note: 'Mies van der Rohe set a small kiosk into the corner wall in 1932.', hide: ['new'], show: ['v:orig'] },
      { year: '1945', title: 'Bombed', note: 'The director’s house and Moholy-Nagy’s half were destroyed.', hide: ['new', 'kiosk'], show: ['v:rubbleG', 'v:rubbleM'] },
      { year: '1956', title: 'Haus Emmer', note: 'A house with a pitched roof was built on the surviving basement of the director’s house.', hide: ['new', 'kiosk'], show: ['v:emmer'] },
      { year: 'today', title: 'Completed again', note: 'Bruno Fioretti Marquez rebuilt the lost volumes and the kiosk, opening in May 2014.' }
    ],
    views: [{ label: 'Along Ebertallee', cam: [-120, 4, -24], tgt: [20, 4, -10] }, { label: 'The director’s house', cam: [gx - 10, 10, -40], tgt: [gx + 8, 3, 0] }, { label: 'Kandinsky and Klee', cam: [-110, 14, -36], tgt: [-80, 4, 2] }],
    facts: [
      { id: 'gropius', title: 'The director’s house, remembered', year: '2014', pos: [gx + 7, 7.6, -2], cam: [gx - 10, 10, -40], tgt: [gx + 8, 3, 0],
        text: 'The director’s house was destroyed in 1945, and in 1956 a house with a pitched roof was built on its surviving basement. In 2014 the Berlin office Bruno Fioretti Marquez rebuilt its volume as a deliberately blurred reconstruction rather than a copy, with matt glass where the windows were. Federal President Gauck reopened the houses on 16 May 2014.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Meisterh%C3%A4user_Dessau'] },
      { id: 'moholy', title: 'Moholy-Nagy’s missing half', year: '1945–2014', pos: [26.5, 9.4, -0.5], cam: [30, 9, -38], tgt: [22, 4, 0],
        text: 'The same bomb destroyed László Moholy-Nagy’s half of the first double house. Only Lyonel Feininger’s half survived. The new half joins it again, and the artist Olaf Nicolai finished its inner walls in different plasters and shades of white.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Meisterh%C3%A4user_Dessau'] },
      { id: 'feininger', title: 'Feininger’s half', year: '1926–32', pos: [13.5, 9.4, 2.5], cam: [-2, 8, -34], tgt: [14, 4, 2],
        text: 'Lyonel Feininger lived here with his family from 1926 to 1932. In 1928 Josef Albers moved into the neighbouring Moholy-Nagy half. The surviving Feininger half was restored in 1993 and 1994.',
        src: ['Vielfalt der Moderne', 'https://vielfaltdermoderne.de/en/meisterhaus-2/'] },
      { id: 'muche', title: 'Two halves, one plan', year: '1926', pos: [-30, 6.6, 1], cam: [-30, 28, -45], tgt: [-30, 3, 2],
        text: 'The three double houses share one plan: two tall cubes shifted against each other and joined by a lower block. Each half is almost a mirror image of the other turned through 90 degrees. Georg Muche and Oskar Schlemmer lived here. Rebuilt for armaments workers in the late 1930s, the house was restored from 1998 to 2002 with the traces of that history kept.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Meisterh%C3%A4user_Dessau'] },
      { id: 'kandinsky', title: 'Kandinsky and Klee', year: '1926–32', pos: [-80, 9.4, 1], cam: [-110, 14, -36], tgt: [-80, 4, 2],
        text: 'Wassily Kandinsky and Paul Klee were neighbours here. Klee mixed his own wall paints, while Kandinsky chose colours by musical principles. Klee left in 1931 and Kandinsky after the Bauhaus closed in 1932.',
        src: ['Goethe-Institut', 'https://www.goethe.de/ins/lv/de/kul/sup/bau/27166676.html'] },
      { id: 'trinkhalle', title: 'Mies van der Rohe’s kiosk', year: '1932', pos: [104.5, 3.6, -14.6], cam: [100, 4, -40], tgt: [100, 1.5, -12],
        text: 'In 1932 Ludwig Mies van der Rohe set a small kiosk into the two-metre wall that runs round the street corner. It was demolished decades later and rebuilt together with the new houses.',
        src: ['Goethe-Institut', 'https://www.goethe.de/ins/ph/de/kul/mag/20459317.html'] },
      { id: 'wood', title: 'White cubes among pines', year: '1925–26', pos: [-55, 13, 20], cam: [-140, 60, 80], tgt: [-10, 3, 0],
        text: 'The city commissioned Gropius to build a detached house for the director and three double houses for the masters in a small pine wood along Ebertallee. Almost every room has a door to the garden, a terrace or a balcony. The houses have been a UNESCO World Heritage Site since 1996.',
        src: ['MIT Dome (after Bauhaus Dessau)', 'https://dome.mit.edu/handle/1721.3/134991'] }
    ],
    hiddenFacts: [
      { id: 'gold', title: 'A wall of gold', year: 'today', pos: [-80, 6.4, 0.6], cam: [-80, 10, -24], tgt: [-80, 4, 1], hint: 'Look at the low middle block of the last double house.',
        text: 'Inside the Kandinsky house, one wall is covered in gold leaf again, reconstructed to match the original.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Meisterh%C3%A4user_Dessau'] }
    ]
  };
}
function cube(k, m, x0, x1, z0, z1, h, tag, isNew) {
  k.box('grey', x0 + 0.15, x1 - 0.15, 0, 0.6, z0 + 0.15, z1 - 0.15, tag);
  k.box(m, x0, x1, 0.6, h, z0, z1, tag); k.box(m, x0, x1, h, h + 0.5, z0, z0 + 0.25, tag); k.box(m, x0, x1, h, h + 0.5, z1 - 0.25, z1, tag);
  k.box(m, x0, x0 + 0.25, h, h + 0.5, z0, z1, tag); k.box(m, x1 - 0.25, x1, h, h + 0.5, z0, z1, tag); k.box('roof', x0 + 0.25, x1 - 0.25, h, h + 0.05, z0 + 0.25, z1 - 0.25);
}
function doubleHouse(k, cx, tagW, tagE, newE, tagLink) {
  const H = 8.2;
  const W = [cx - 11, cx - 2, -2, 7], Ec = [cx + 2, cx + 11, -5, 4];
  const half = (b, mat, nw, tg) => {
    cube(k, mat, b[0], b[1], b[2], b[3], H, tg, nw);
    win(k, 'z', b[2], b[0] + 1.2, b[1] - 1.2, 4.4, 7.6, tg, nw, { s: -1, mull: 1.1, trans: [6.0] });
    win(k, 'z', b[2], b[0] + 1.0, b[0] + 3.4, 1.4, 3.2, tg, nw, { s: -1 });
    win(k, 'z', b[3], b[0] + 1.0, b[0] + 4.2, 1.2, 3.4, tg, nw, { s: 1, mull: 1.0 });
    win(k, 'z', b[3], b[0] + 5.0, b[1] - 1.0, 4.6, 6.8, tg, nw, { s: 1 });
    win(k, 'x', b[0], b[2] + 1.0, b[2] + 1.9, 1.4, 7.6, tg, nw, { s: -1, trans: [3.2, 4.8, 6.4] });
    win(k, 'x', b[1], b[3] - 3.6, b[3] - 1.2, 4.6, 6.8, tg, nw, { s: 1 });
    k.box(mat, b[0] + 4.8, b[1] - 0.6, 3.9, 4.1, b[3], b[3] + 1.6, tg);
    if (!nw) rails(k, 'frame', [[b[0] + 4.8, b[3] + 0.02], [b[0] + 4.8, b[3] + 1.58], [b[1] - 0.6, b[3] + 1.58], [b[1] - 0.6, b[3] + 0.02]], 4.1, [0.5, 1.0], tg);
    k.box('paving', b[0] - 0.5, b[1] + 0.5, 0, 0.12, b[3], b[3] + 3.2);
  };
  half(W, 'white', false, tagW);
  cube(k, 'white', cx - 4.2, cx + 4.2, -3.6, 5.2, 5.6, tagLink || tagW, false);
  if (newE) {
    k.part = 'new'; half(Ec, 'newWhite', true, tagE); k.part = '';
    k.part = 'v:orig'; half(Ec, 'white', false, tagE); k.part = '';
    k.part = 'v:rubbleM'; for (let i = 0; i < 10; i++) { const x = Ec[0] + rand() * 8, z = Ec[2] + rand() * 8; k.box('soot', x, x + 1 + rand() * 2, 0, 0.3 + rand() * 1.4, z, z + 1 + rand() * 2, tagE); } k.box('soot', Ec[0], Ec[0] + 0.4, 0, 3.5, Ec[2], Ec[3], tagE); k.part = '';
  } else half(Ec, 'white', false, tagE);
}
function gropiusHouse(k, gx, nw) {
  const m = nw ? 'newWhite' : 'white', tg = 'gropius';
  k.box(m, gx, gx + 16, 0.9, 3.6, -6, 6, tg); k.box(m, gx + 16, gx + 22, 0.9, 3.6, -3, 6, tg);
  k.box(m, gx, gx + 14, 3.6, 6.6, -6, 2, tg); k.box(m, gx, gx + 4, 3.6, 6.6, 2, 10, tg);
  [[gx + 0.3, 9.6], [gx + 3.7, 9.6]].forEach(q => k.box(m, q[0] - 0.2, q[0] + 0.2, 0.9, 3.6, q[1] - 0.2, q[1] + 0.2, tg));
  k.box('paving', gx - 0.5, gx + 16, 0.9, 1.0, 6, 11, tg);
  k.box('roof', gx + 0.2, gx + 13.8, 6.6, 6.65, -5.8, 1.8); k.box('roof', gx + 4, gx + 21.8, 3.6, 3.65, 2, 5.8); k.box('roof', gx + 14, gx + 21.8, 3.6, 3.65, -2.8, 2);
  win(k, 'z', -6, gx + 1, gx + 13, 4.4, 6.0, tg, nw, { s: -1 }); win(k, 'z', -6, gx + 5, gx + 9, 1.4, 3.0, tg, nw, { s: -1 });
  win(k, 'z', 6, gx + 6, gx + 15, 1.4, 3.2, tg, nw, { s: 1 }); win(k, 'z', 10, gx + 0.5, gx + 3.5, 4.2, 6.0, tg, nw, { s: 1 });
  win(k, 'x', gx, -4, 0, 4.2, 6.0, tg, nw, { s: -1 }); win(k, 'x', gx + 22, -1, 4, 1.4, 3.0, tg, nw, { s: 1 });
  k.box(m, gx + 6.4, gx + 9.4, 3.0, 3.2, -8, -6, tg);
}
function win(k, face, c, a0, a1, y0, y1, tag, isNew, o) {
  o = o || {};
  if (isNew) { if (face === 'z') k.paneZ('frost', c + (o.s || 1) * 0.03, y0, y1, a0, a1, tag); else k.paneX('frost', c + (o.s || 1) * 0.03, y0, y1, a0, a1, tag); return; }
  const opt = { mull: o.mull || 0.9, trans: o.trans, tag: tag, frame: 'frame' };
  if (face === 'z') k.winZ(c, o.s || 1, a0, a1, y0, y1, opt); else k.winX(c, o.s || 1, a0, a1, y0, y1, opt);
}
