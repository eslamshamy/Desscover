/* ================================================================
   Bauhaus Museum (museum)
   Its entry on the map, its 3D model, its map token and its quiz.
   ================================================================ */
REG['museum'] = {
  meta: { id: 'museum', years: '2016–19', name: 'Bauhaus Museum', sub: 'addenda architects, 2019', lat: 51.834491, lon: 12.242153, build: buildMuseum, label: 'Bauhaus Museum Dessau', meta: 'addenda architects, opened 8 September 2019', lead: 'A glass hall with a black box floating inside, home to the Bauhaus Dessau Foundation’s collection.' },
  token(k) {
    k.box('museumGlass', -52.5, 52.5, 0, 12, -12.5, 12.5); k.box('blackbox', -50, 50, 5, 11.3, -9, 9); k.box('white', -52.7, 52.7, 11.6, 12.1, -12.7, 12.7);
  },
  quiz: [
    { q: 'How many entries did the 2015 competition receive?', o: ['831', '105', '49', '2,019'], a: 0, e: 'Barcelona’s addenda architects won from 831 entries.' }
  ]
};

function buildMuseum() {
  const k = new Kit();
  const X = 52.5, Z = 12.5, H = 12;
  k.box('concrete', -X, X, 0, 0.3, -Z, Z, 'ground');
  k.part = 'shell'; k.box('white', -X - 0.2, X + 0.2, H - 0.45, H, -Z - 0.2, Z + 0.2, 'shell'); k.box('greenRoof', -X, X, H, H + 0.05, -Z, Z); k.part = '';
  // the hovering black box: steel truss exhibition hall
  k.part = 'box'; k.box('blackbox', -50, 50, 5.0, 11.3, -9, 9, 'box');
  // soffit lighting reveals under the black box
  [-5, 5].forEach(z => { k.box('lampHead', -47, 47, 4.96, 5.02, z - 0.25, z + 0.25, 'box'); });
  // rooftop HVAC equipment on top of the black box enclosed in acoustic louvers
  [-30, -5, 20].forEach(x => {
    k.box('panelGrey', x - 6, x + 6, 11.3, 11.85, -5.5, 5.5, 'box');
    k.box('steel', x - 5.8, x + 5.8, 11.85, 11.95, -5.3, 5.3, 'box');
  });
  k.part = '';
  // the two massive black stair/elevator cores that carry the bridge truss
  [-25, 25].forEach(x => {
    k.box('blackbox', x - 3.5, x + 3.5, 0.3, 5.0, -4.5, 4.5, 'cores');
    // fire doors and elevator doors on the cores
    [-1, 1].forEach(sd => {
      k.box('dark', x - 1.2, x + 1.2, 0.3, 2.6, sd * 4.5 - (sd > 0 ? 0 : 0.04), sd * 4.5 + (sd > 0 ? 0.04 : 0), 'cores');
    });
  });
  // revolving doors at south-west and north-east entrances
  [[-X + 1.6, -Z + 3.5], [X - 1.6, Z - 3.5]].forEach(([rx, rz]) => {
    const drum = new THREE.CylinderGeometry(1.6, 1.6, 3.2, 24, 1, true);
    drum.translate(rx, 1.8, rz); k.geo('glass', drum, 'shell');
    for (let a = 0; a < 3; a++) rotBox(k, 'steel', 3.0, 3.1, 0.06, rx, 1.8, rz, a * Math.PI / 3, 'shell');
  });
  k.part = 'shell';
  k.paneX('museumGlass', -X, 0.3, H - 0.45, -Z, Z, 'shell'); k.paneX('museumGlass', X, 0.3, H - 0.45, -Z, Z, 'shell');
  k.paneZ('museumGlass', -Z, 0.3, H - 0.45, -X, X, 'shell'); k.paneZ('museumGlass', Z, 0.3, H - 0.45, -X, X, 'shell');
  for (let x = -X; x <= X; x += 2.1) { k.fr('steel', x - 0.03, x + 0.03, 0.3, H - 0.45, -Z - 0.12, -Z + 0.12, 'shell'); k.fr('steel', x - 0.03, x + 0.03, 0.3, H - 0.45, Z - 0.12, Z + 0.12, 'shell'); }
  for (let z = -Z; z <= Z; z += 2.1) { k.fr('steel', -X - 0.12, -X + 0.12, 0.3, H - 0.45, z - 0.03, z + 0.03, 'shell'); k.fr('steel', X - 0.12, X + 0.12, 0.3, H - 0.45, z - 0.03, z + 0.03, 'shell'); }
  for (let y = 2.1; y < H - 0.2; y += 2.1) {
    k.fr('steel', -X, X, y - 0.03, y + 0.03, Z + 0.06, Z + 0.2, 'shell');
    k.fr('steel', -X, X, y - 0.03, y + 0.03, -Z - 0.2, -Z - 0.06, 'shell');
    k.fr('steel', -X - 0.2, -X - 0.06, y - 0.03, y + 0.03, -Z, Z, 'shell');
    k.fr('steel', X + 0.06, X + 0.2, y - 0.03, y + 0.03, -Z, Z, 'shell');
  }
  k.part = 'life';
  // Open Stage: reception & ticket desk, museum shop, café
  k.box('wood', -14, -4, 0.3, 1.35, -3.2, -1.8, 'life');
  k.box('whiteInt', -14.1, -3.9, 1.3, 1.42, -3.3, -1.7, 'life');
  for (let i = 0; i < 3; i++) {
    const sx = 10 + i * 4.5;
    k.box('wood', sx, sx + 2.8, 0.3, 1.2, -7, -4.5, 'life');
    k.box('whiteInt', sx + 0.2, sx + 2.6, 1.2, 1.8, -6.8, -4.7, 'life');
  }
  k.box('dark', 24, 38, 0.3, 1.4, 4.5, 6.2, 'life');
  k.box('steelWhite', 23.8, 38.2, 1.35, 1.45, 4.3, 6.4, 'life');
  for (let i = 0; i < 5; i++) {
    const bx = 26 + i * 2.8;
    const seat = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 16); seat.translate(bx, 0.95, 3.6); k.geo('whiteInt', seat, 'life');
    const leg = new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8); leg.translate(bx, 0.62, 3.6); k.geo('frame', leg, 'life');
  }
  for (let i = 0; i < 10; i++) { const x = 30 + (i % 5) * 3.5, z = -6 + Math.floor(i / 5) * 4; const t = new THREE.CylinderGeometry(0.45, 0.45, 0.05, 16); t.translate(x, 1.05, z); k.geo('whiteInt', t); const l = new THREE.CylinderGeometry(0.04, 0.04, 0.75, 6); l.translate(x, 0.67, z); k.geo('frame', l); }
  // Lucy Raven: Lichtspielhaus kinetic colored glass panels
  const cols = ['glassYellow', 'glassRed', 'glassBlue', 'glassGreen'];
  for (let i = 0; i < 10; i++) { const x = -40 + i * 3.2, z = -2 + Math.sin(i) * 3; k.box(cols[i % 4], x, x + 2.4, 0.4, 4.4, z, z + 0.04, 'raven'); }
  for (let i = 0; i < 16; i++) person(k, -45 + rand() * 90, -10 + rand() * 20, rand() * 6.28);
  k.part = 'v:site';
  k.box('steel', 0, 1.6, 0, 46, -16, -14.4); k.box('steel', -28, 22, 44, 45.6, -16, -14.4); k.box('steel', 18, 22, 40, 44, -16.4, -14);
  k.box('steel', -26, -25.6, 30, 44, -15.3, -15.1); k.box('concrete', -4, 6, 0, 1.2, -18, -12);
  for (let x = -70; x <= 70; x += 2.5) { k.box('steel', x, x + 0.06, 0, 2, -20.06, -20); k.box('steel', x, x + 0.06, 0, 2, 20, 20.06); }
  k.box('steel', -70, 70, 1.9, 2.0, -20.06, -20); k.box('steel', -70, 70, 1.9, 2.0, 20, 20.06);
  k.part = '';
  // site: plaza and park
  const P = { x0: -80, x1: 80, z0: -55, z1: 55 };
  k.box('lawn', P.x0, P.x1, -0.12, 0, P.z0, P.z1);
  k.box('paving', -70, 70, 0, 0.05, -26, -Z); k.box('paving', -70, 70, 0, 0.05, Z, 20); k.box('paving', -66, -X, 0, 0.05, -Z, Z); k.box('paving', X, 66, 0, 0.05, -Z, Z);
  k.box('asphalt', P.x0, P.x1, 0, 0.03, -40, -30); k.box('paving', P.x0, P.x1, 0, 0.06, -30, -26); k.box('paving', P.x0, P.x1, 0, 0.06, -44, -40);
  // plaza concrete benches and bicycle stands
  for (let i = -4; i <= 4; i += 2) {
    k.box('concrete', i * 14 - 3, i * 14 + 3, 0.05, 0.55, -25, -23.8);
    k.box('wood', i * 14 - 2.8, i * 14 + 2.8, 0.55, 0.62, -24.8, -24.0);
  }
  for (let i = 0; i < 10; i++) {
    const bx = -50 + i * 2.2;
    rails(k, 'steel', [[bx, -28.5], [bx, -26.8]], 0.05, [0.45, 0.85]);
  }
  for (let x = -70; x <= 70; x += 14) { tree(k, x + rand() * 4, 30 + rand() * 18, 1 + rand() * 0.35); }
  for (let x = -63; x <= 63; x += 18) tree(k, x, 46 + rand() * 4, 1.1);
  [-60, -30, 0, 30, 60].forEach(x => lamp(k, x, -27.5));
  for (let i = 0; i < 10; i++) person(k, -60 + rand() * 120, -24 + rand() * 6, rand() * 6.28);
  const grp = k.build();
  // light band with the museum's name
  const tex = letterTexture('bauhaus museum dessau', '#ffffff', 2048, 128, (g, w, h) => { g.font = '500 78px Jost, Futura, Arial, sans-serif'; g.fillText('bauhaus museum dessau', w / 2, h / 2 + 4); });
  const band = new THREE.Mesh(new THREE.PlaneGeometry(24, 1.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false }));
  band.position.set(-20, 10.4, -Z - 0.4); band.rotation.y = Math.PI; band.userData.noAO = true; band.userData.fact = 'band'; band.userData.part = 'shell'; grp.add(band);
  const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp);
  plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  const extra = {
    eras: [
      { year: '2016', title: 'Foundation stone', note: 'Work began after the foundation stone was laid on 4 December 2016, ninety years after the Bauhaus opened.', hide: ['shell', 'box', 'life'], show: ['v:site'] },
      { year: '2019', title: 'Open', note: 'Opened on 8 September 2019 for the Bauhaus centenary.' }
    ],
    views: [{ label: 'Through the glass', cam: [30, 3.5, -30], tgt: [5, 7, 0] }, { label: 'Under the box', cam: [-24, 2.5, -24], tgt: [-26, 2.5, 0] }],
    hiddenFacts: [
      { id: 'band', title: 'Only a band of light', year: '2019', pos: [-20, 10.4, -Z - 0.9], cam: [-22, 8, -40], tgt: [-20, 9, -12], hint: 'Read the facade carefully.',
        text: 'Apart from a band of light spelling bauhaus museum dessau, nothing on the outside tells you what the building is for. By day the glass mostly mirrors the city and the park around it.',
        src: ['Baunetz Wissen', 'https://www.baunetzwissen.de/drucken/bauhaus-museum-in-dessau-7079082'] }
    ]
  };
  return {
    ...extra, scene, center: new THREE.Vector3(0, 0, 0), span: 90, sunDist: 240, lamps: [-60, -30, 0, 30].map(x => new THREE.Vector3(x, 4.85, -27.5)),
    intro: { pos: [-70, 45, -95], tgt: [0, 4, 0] },
    facts: [
      { id: 'shell', title: 'A black box in a coat of glass', year: '2019', pos: [-20, 13.2, -Z - 0.5], cam: [-40, 12, -70], tgt: [-5, 6, 0],
        text: 'Architect Roberto González described the building as a black box wearing a winter coat of glass. The glass shell is about 105 m long, 25 m wide and 12 m tall. Depending on the light it reflects the city and the park, or lets you see straight through.',
        src: ['Azure Magazine', 'https://www.azuremagazine.com/article/dessau-finally-gets-the-bauhaus-museum-it-deserves/'] },
      { id: 'box', title: 'A box that floats like a bridge', year: '2019', pos: [10, 11.8, 0], cam: [30, 3.5, -30], tgt: [5, 7, 0],
        text: 'The Black Box is about 100 m long and 18 m wide. It hovers five metres above the visitors and rests only on two stair cores 50 m apart, a structure the architects borrowed from bridge building.',
        src: ['Baunetz Wissen', 'https://www.baunetzwissen.de/drucken/bauhaus-museum-in-dessau-7079082'] },
      { id: 'cores', title: 'Two cores carry it all', year: '2019', pos: [25, 2.6, -4.8], cam: [38, 2.2, -22], tgt: [25, 3, 0],
        text: 'The ground floor has no columns at all. Everything above rests on the two black stair cores, which also take visitors up into the collection.',
        src: ['Azure Magazine', 'https://www.azuremagazine.com/article/dessau-finally-gets-the-bauhaus-museum-it-deserves/'] },
      { id: 'collection', title: 'The second-largest Bauhaus collection', year: '1976–today', pos: [-30, 8, -9.5], cam: [-48, 9, -34], tgt: [-28, 7, 0],
        text: 'Inside the Black Box is the collection of the Bauhaus Dessau Foundation, around 49,000 objects, second only to the Bauhaus-Archiv in Berlin. The first purchase was made in 1976, when the Bauhaus building reopened in the GDR. More than 1,000 pieces are on show.',
        src: ['Archilovers (Bauhaus Dessau press office)', 'https://www.archilovers.com/stories/28050'] },
      { id: 'raven', title: 'Coloured light below', year: '2019', pos: [-26, 4.8, -2], cam: [-24, 2.5, -24], tgt: [-26, 2.5, 0],
        text: 'The open ground floor hosts temporary exhibitions, workshops, a café and a shop. An installation of coloured glass panels by the New York artist Lucy Raven, called Lichtspielhaus, throws prismatic light into the hall.',
        src: ['Azure Magazine', 'https://www.azuremagazine.com/article/dessau-finally-gets-the-bauhaus-museum-it-deserves/'] },
      { id: 'ground', title: 'From 831 entries', year: '2015–2019', pos: [-X - 1, 6, 0], cam: [-90, 18, 30], tgt: [-30, 5, 0],
        text: 'An open international competition in 2015 drew 831 entries. Barcelona’s addenda architects won. The foundation stone was laid on 4 December 2016, 90 years after the Bauhaus building opened, and the museum opened on 8 September 2019 for the Bauhaus centenary. Critics named it Museum of the Year 2020.',
        src: ['Structurae / Wikipedia', 'https://structurae.net/de/bauwerke/bauhaus-museum-dessau'] }
    ]
  };
}
