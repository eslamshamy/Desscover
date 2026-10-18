/* ================================================================
   Anhaltisches Theater (theater)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['theater'] = {
  meta: { id: 'theater', years: '1935–38', name: 'Anhaltisches Theater', sub: 'Lipp & Roth, 1938', lat: 51.83683, lon: 12.237066, build: buildTheater, label: 'Anhaltisches Theater', meta: 'Friedrich Lipp and Werry Roth, 1935–38, rebuilt 1947–49', lead: 'Dessau’s large theatre on Friedensplatz, with one of Germany’s biggest revolving stages. The front is simplified in the model.' },
  token(k) {
    k.box('renderWarm', -30, 30, 0, 17, 0, 18); k.box('renderWarm', -46, 46, 0, 14, 6, 60); k.box('renderWarm', -30, 30, 0, 21, 18, 55); k.box('renderWarm', -22, 22, 0, 34, 55, 82); k.box('renderWarm', -44, 44, 0, 17, 55, 82); k.box('stoneLight', -23, 23, 1, 16.6, -8, 0);
  },
  quiz: [
    { q: 'Which opera opened the theatre in 1938?', o: ['Der Freischütz', 'The Magic Flute', 'Fidelio', 'Lohengrin'], a: 0, e: 'The Magic Flute reopened it in 1949.' }
  ]
};

function buildTheater() {
  const k = new Kit();
  // monumental entrance steps across the front
  for (let s = 0; s < 6; s++) {
    k.box('stoneLight', -28.5 - s * 0.3, 28.5 + s * 0.3, 1.0 - s * 0.2, 1.2 - s * 0.2, -12.6 - (s + 1) * 0.55, 0, 'portico');
  }
  // main auditorium block
  k.box('renderWarm', -30, 30, 0, 17, 0, 18, 'built'); k.roofRing('renderWarm', -30, 30, 0, 18, 17, 0.5);
  // 10 monumental fluted square pillars forming the colonnade portico
  for (let i = 0; i < 10; i++) {
    const x = -22.5 + i * 5;
    k.box('stoneLight', x - 0.8, x + 0.8, 1.2, 14.2, -7.6, -6.0, 'portico');
    k.box('stoneLight', x - 0.95, x + 0.95, 1.2, 1.6, -7.8, -5.8, 'portico');
    k.box('stoneLight', x - 0.95, x + 0.95, 13.8, 14.2, -7.8, -5.8, 'portico');
  }
  // monumental entablature and stepped attic
  k.box('stoneLight', -24, 24, 14.2, 16.8, -8.2, 0, 'portico');
  k.box('stoneLight', -24.4, 24.4, 16.8, 17.3, -8.6, 0.4, 'portico');
  k.box('stoneLight', -18, 18, 17.3, 21.0, -7.2, 0.8, 'portico');
  k.box('stoneLight', -18.3, 18.3, 21.0, 21.4, -7.5, 1.1, 'portico');
  // 5 grand bronze entrance portals behind the pillars
  for (let i = 2; i <= 6; i++) {
    const x = -22.5 + i * 5 + 2.5;
    k.box('bronzeDark', x - 1.3, x + 1.3, 1.2, 4.4, -0.15, 0, 'portico');
    k.box('dark', x - 1.2, x + 1.2, 1.3, 4.3, -0.18, -0.15, 'portico');
    const sh = new THREE.Shape(); sh.moveTo(-1.2, 0); sh.lineTo(1.2, 0); sh.lineTo(1.2, 1.2); sh.absarc(0, 1.2, 1.2, 0, Math.PI, false); sh.closePath();
    const g = new THREE.ShapeGeometry(sh, 12); g.rotateY(Math.PI); g.translate(x, 4.4, -0.05); k.geo('glassDark', g, 'portico');
    const r = new THREE.RingGeometry(1.2, 1.5, 14, 1, 0, Math.PI); r.translate(x, 5.6, -0.08); k.geo('stoneLight', r, 'portico');
  }
  // bronze lantern pylons flanking the steps
  [-26, 26].forEach(lx => {
    k.box('bronzeDark', lx - 0.4, lx + 0.4, 0, 4.2, -11.6, -10.8, 'portico');
    const lHead = new THREE.BoxGeometry(0.9, 1.2, 0.9); lHead.translate(lx, 4.8, -11.2); k.geo('lampHead', lHead, 'portico');
  });
  // glazed bays behind the pillars: tall windows illuminating the foyer
  for (let i = 0; i < 9; i++) {
    const x = -20 + i * 5;
    k.winZ(0, -1, x - 1.1, x + 1.1, 6.4, 9.4, { mull: 1.1, tag: 'portico', frame: 'whiteInt' });
    k.winZ(0, -1, x - 1.1, x + 1.1, 10.4, 13.4, { mull: 1.1, tag: 'portico', frame: 'whiteInt' });
  }
  // side wings
  [-1, 1].forEach(sd => {
    const xa = sd < 0 ? -46 : 30, xb = sd < 0 ? -30 : 46, xf = sd < 0 ? -46 : 46;
    k.box('renderWarm', xa, xb, 0, 14, 6, 60, 'wings'); k.roofRing('renderWarm', xa, xb, 6, 60, 14, 0.4);
    k.box('stoneLight', xa - 0.2, xb + 0.2, 0, 1.0, 5.8, 60.2, 'trial');
    [[2.2, 4.6], [6.2, 8.6], [10.2, 12.4]].forEach(f => { for (let z = 9; z < 57; z += 4) k.winX(xf, sd, z, z + 1.8, f[0], f[1], { mull: 0.9, trans: [f[0] + (f[1] - f[0]) * 0.65], tag: 'wings', frame: 'whiteInt' }); });
    for (let x = xa + 2.5; x < xb - 2; x += 4) [[2.2, 4.6], [6.2, 8.6], [10.2, 12.4]].forEach(f => k.winZ(6, -1, x, x + 1.8, f[0], f[1], { mull: 0.9, frame: 'whiteInt', tag: 'wings' }));
  });
  k.box('renderWarm', -30, 30, 0, 21, 18, 55, 'auditorium'); k.roofRing('renderWarm', -30, 30, 18, 55, 21, 0.5);
  // stage house (Bühnenturm): 34 m high with vertical window strips and machinery penthouse
  k.part = 'stagehouse';
  k.box('renderWarm', -22, 22, 0, 34, 55, 82, 'stage'); k.roofRing('renderWarm', -22, 22, 55, 82, 34, 0.6);
  k.box('renderWarm', -44, -22, 0, 17, 55, 82, 'stage'); k.box('renderWarm', 22, 44, 0, 17, 55, 82, 'stage');
  k.roofRing('renderWarm', -44, -22, 55, 82, 17, 0.4); k.roofRing('renderWarm', 22, 44, 55, 82, 17, 0.4);
  k.box('renderWarm', -26, 26, 0, 19, 82, 100, 'stage'); k.roofRing('renderWarm', -26, 26, 82, 100, 19, 0.4);
  // vertical window strips for the fly lofts
  [-1, 1].forEach(sd => {
    const sx = sd < 0 ? -22.05 : 22.05;
    [61, 69, 76].forEach(sz => {
      k.winX(sx, sd, sz - 0.8, sz + 0.8, 8, 30, { mull: 0.8, trans: [14, 20, 26], frame: 'whiteInt', tag: 'stage' });
    });
  });
  for (let rx = -14; rx <= 14; rx += 7) {
    k.winZ(82.05, 1, rx - 0.8, rx + 0.8, 12, 30, { trans: [18, 24], frame: 'whiteInt', tag: 'stage' });
  }
  // rooftop stage machinery penthouse
  k.box('renderWarm', -14, 14, 34, 37.5, 62, 75, 'stage');
  k.roofRing('renderWarm', -14, 14, 62, 75, 37.5, 0.4);
  // artist stage door and load-in bay
  k.box('iron', -6, 6, 0, 4.8, 82, 82.2, 'stage');
  k.box('canopyDark', -7.5, 7.5, 5.0, 5.25, 82, 85, 'stage');
  k.part = '';
  // 1944 ruin
  k.part = 'v:ruinStage';
  for (let x = -44; x < 44; x += 3) { k.box('soot', x, x + 3, 0, 4 + rand() * 14, 55, 55.6, 'auditorium'); k.box('soot', x, x + 3, 0, 3 + rand() * 9, 81.4, 82, 'auditorium'); }
  for (let z = 55; z < 100; z += 3) { k.box('soot', -44, -43.4, 0, 3 + rand() * 10, z, z + 3, 'auditorium'); k.box('soot', 43.4, 44, 0, 3 + rand() * 10, z, z + 3, 'auditorium'); }
  for (let i = 0; i < 30; i++) { const x = -40 + rand() * 80, z = 58 + rand() * 38; k.box('soot', x, x + 1 + rand() * 3, 0, 0.5 + rand() * 2, z, z + 1 + rand() * 3, 'auditorium'); }
  k.part = '';
  // Friedensplatz plaza, tram stop and park parterres
  const P = { x0: -80, x1: 80, z0: -66, z1: 112 };
  k.box('lawn', P.x0, P.x1, -0.12, 0, P.z0, P.z1);
  k.box('paving', -62, 62, 0, 0.05, -44, -11.4, 'tradition'); k.box('paving', -62, 62, 0, 0.05, -11.4, 6);
  k.box('asphalt', P.x0, P.x1, 0, 0.03, -58, -44);
  [-52, -49.5].forEach(z => [-0.72, 0.72].forEach(o => k.box('rail', P.x0, P.x1, 0.03, 0.08, z + o - 0.04, z + o + 0.04)));
  k.box('tram', -10, 18, 0.4, 3.6, -53.2, -50.8, 'tradition'); k.box('dark', -9, 17, 1.8, 2.8, -53.22, -50.78, 'tradition');
  // tram shelter
  k.box('canopyDark', -4, 12, 3.0, 3.15, -48, -44, 'tradition');
  k.box('steel', -3.8, -3.6, 0, 3.0, -47.8, -47.6, 'tradition');
  k.box('steel', 11.6, 11.8, 0, 3.0, -47.8, -47.6, 'tradition');
  k.box('glassDark', -3.6, 11.6, 0.3, 2.9, -44.2, -44.1, 'tradition');
  // trimmed hedges on plaza
  [-28, 28].forEach(hx => hedgeRow(k, hx - 4, hx + 4, -36, -20, 0.65, 'tradition'));
  for (let x = -56; x <= 56; x += 14) { tree(k, x, -40, 1.05); }
  [[-60, 20], [-62, 50], [-60, 85], [60, 20], [62, 50], [60, 85]].forEach(q => tree(k, q[0], q[1], 1.1));
  [[-36, -30], [-12, -30], [12, -30], [36, -30]].forEach(q => lamp(k, q[0], q[1]));
  for (let i = 0; i < 26; i++) person(k, -40 + rand() * 80, -36 + rand() * 22, rand() * 6.28);
  const grp = k.build();
  { const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 64; const g = cv.getContext('2d'); g.fillStyle = '#3a3226'; g.font = '600 46px Jost, Futura, "Century Gothic", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (g.letterSpacing !== undefined) g.letterSpacing = '6px'; g.fillText('ANHALTISCHES THEATER', 512, 34); const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(26, 1.6), new THREE.MeshStandardMaterial({ map: tx, transparent: true, roughness: 0.8 })); sign.rotation.y = Math.PI; sign.position.set(0, 15.4, -8.53); sign.userData.noAO = true; grp.add(sign); }
  const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp);
  plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  const extra = {
    eras: [
      { year: '1938', title: 'Opening', note: 'Opened on 29 May 1938 with the largest stage north of the Alps.' },
      { year: '1944', title: 'Bombed', note: 'Almost completely destroyed in the air raid of 30 May 1944.', hide: ['stagehouse'], show: ['v:ruinStage'], mats: { renderWarm: 'soot', glass: 'none' } },
      { year: 'today', title: 'Rebuilt 1947–49', note: 'Reopened in August 1949, renamed Anhaltisches Theater in 1994.' }
    ],
    views: [{ label: 'The front', cam: [8, 6, -48], tgt: [0, 9, -4] }, { label: 'The stage tower', cam: [70, 40, 110], tgt: [0, 18, 70] }],
    hiddenFacts: [
      { id: 'trial', title: 'A show trial on stage', year: '1950', pos: [46.5, 1.4, 12], cam: [75, 5, 0], tgt: [44, 2, 12], hint: 'Look at the stone base of the side wings.',
        text: 'In April 1950 the theatre was the venue for the first show trial in the GDR, known as the DCGG trial.',
        src: ['CanonBase', 'https://canonbase.eu/wiki/Item:Q8021'] }
    ]
  };
  return {
    ...extra, scene, center: new THREE.Vector3(0, 0, 30), span: 100, sunDist: 280, lamps: [[-36, -30], [-12, -30], [12, -30], [36, -30]].map(q => new THREE.Vector3(q[0], 4.85, q[1])),
    intro: { pos: [-80, 45, -95], tgt: [0, 10, 30] },
    facts: [
      { id: 'built', title: 'A prestige project of 1938', year: '1935–38', pos: [-26, 18, -1], cam: [-60, 20, -60], tgt: [-10, 10, 10],
        text: 'Friedrich Lipp and Werry Roth designed the theatre, built over three years. It opened on 29 May 1938 with Weber’s Der Freischütz, with Adolf Hitler and Joseph Goebbels in the audience. With 1,250 seats it was then the largest stage north of the Alps.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Anhaltisches_Theater_Dessau'] },
      { id: 'portico', title: 'The pillared front', year: '1938', pos: [0, 17.8, -8.6], cam: [8, 6, -48], tgt: [0, 9, -4],
        text: 'The monumental entrance with its row of square pillars is typical of the theatre architecture of the Nazi period. The model shows the front in simplified form.',
        src: ['Kulturreise-Ideen', 'https://www.kulturreise-ideen.de/kulturregion/kultur-in-drei-tagen/Tour-dessau-in-drei-tagen.html'] },
      { id: 'stage', title: 'A giant stage', year: 'today', pos: [0, 35.5, 68], cam: [70, 40, 110], tgt: [0, 18, 70],
        text: 'The stage house towers over everything else. The main stage covers 490 m², with side stages of 280 m² and 250 m² and a rear stage of 450 m², and the fly loft is 25 m high. Its revolving stage is one of the largest in Germany.',
        src: ['DTP Planungsbüro', 'https://www.dtp-planung.com/Anhaltisches-Theater-Dessau-DTP-Planungsbuero.html'] },
      { id: 'auditorium', title: 'Bombed and reopened', year: '1944–49', pos: [0, 22, 36], cam: [-55, 45, 45], tgt: [0, 12, 40],
        text: 'An air raid on 30 May 1944 almost completely destroyed the theatre. The remaining company was rehearsing again in a makeshift space by November 1945 and staged Beethoven’s Fidelio that December. After rebuilding from 1947, the house reopened in August 1949 with Mozart’s The Magic Flute.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Anhaltisches_Theater_Dessau'] },
      { id: 'wings', title: 'The Bayreuth of the North', year: '1953', pos: [46.6, 10, 30], cam: [80, 12, 20], tgt: [40, 8, 30],
        text: 'In 1953 the artistic director Willy Bodenstein launched the Dessau Richard Wagner Festival, and Dessau became known as the Bayreuth of the North. Since 1993 the Kurt Weill Fest has honoured the composer, who was born in Dessau.',
        src: ['Broadview TV', 'https://www.broadview.tv/en/?p=6559'] },
      { id: 'tradition', title: 'Theatre since 1794', year: '1794–today', pos: [-20, 4.6, -52], cam: [-30, 10, -75], tgt: [-5, 4, -40],
        text: 'Dessau has had a permanent theatre company since 1794, and its first theatre building went up by 1798 to plans by Friedrich Wilhelm von Erdmannsdorff. The Landestheater was renamed Anhaltisches Theater in 1994. With about 1,100 seats it is the largest theatre in Saxony-Anhalt.',
        src: ['Wikipedia (de)', 'https://de.wikipedia.org/wiki/Anhaltisches_Theater_Dessau'] }
    ]
  };
}
