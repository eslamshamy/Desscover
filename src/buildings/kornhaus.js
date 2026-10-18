export function buildKornhaus(context) {
  const { Kit, MAT, THREE, lamp, letterTexture, person, plinth, rails, rand, registerNoAO, tree } = context;

  const k = new Kit();
  const P = { x0: -70, x1: 60, z0: -70, z1: 45 };
  k.box('lawn', P.x0, P.x1, -0.12, 0, -8, P.z1);
  const dyke = new THREE.Shape(); dyke.moveTo(-6, 0); dyke.lineTo(0, 3.8); dyke.lineTo(9, 3.8); dyke.lineTo(22, 0); dyke.closePath();
  const dg = new THREE.ExtrudeGeometry(dyke, { depth: P.x1 - P.x0, bevelEnabled: false }); dg.translate(0, 0, -(P.x1 - P.x0) / 2); dg.rotateY(Math.PI / 2); dg.translate((P.x0 + P.x1) / 2, 0, 0);
  k.geo('lawn', dg);
  // Elbe river and dyke slope
  k.box('water', P.x0, P.x1, -1.8, -1.0, P.z0, -22, 'guests');
  const beach = new THREE.Shape(); beach.moveTo(-22, -1.0); beach.lineTo(-8, 0); beach.lineTo(-8, -2.4); beach.lineTo(-22, -2.4); beach.closePath();
  const bg = new THREE.ExtrudeGeometry(beach, { depth: P.x1 - P.x0, bevelEnabled: false }); bg.translate(0, 0, -(P.x1 - P.x0) / 2); bg.rotateY(Math.PI / 2); bg.translate((P.x0 + P.x1) / 2, 0, 0);
  k.geo('sand', bg);
  // stone riprap along dyke edge
  for (let x = -55; x <= 45; x += 4.5) {
    const rock = new THREE.DodecahedronGeometry(1.2 + rand() * 0.6); rock.translate(x, -1.8, -27); k.geo('rock', rock, 'guests');
  }
  // main building: two-storey block
  const BX0 = -20, BX1 = 28, BZ0 = -2, BZ1 = 12;
  k.box('white', BX0, BX1, 3.9, 7.8, BZ0, BZ1, 'competition');
  k.box('white', BX0, BX1, 0, 3.9, BZ0 + 4, BZ1, 'competition');
  k.roofRing('white', BX0, BX1, BZ0, BZ1, 7.8, 0.35);
  // rooftop caretaker penthouse, brick chimney and flagpole
  k.box('white', BX0 + 6, BX0 + 16, 7.8, 10.4, BZ0 + 2, BZ1 - 2, 'ship');
  k.roofRing('white', BX0 + 6, BX0 + 16, BZ0 + 2, BZ1 - 2, 10.4, 0.3);
  k.box('brick', BX0 + 14, BX0 + 15.2, 10.4, 12.2, BZ0 + 3, BZ0 + 4.2, 'ship');
  const mast = new THREE.CylinderGeometry(0.04, 0.07, 7.5, 8); mast.translate(BX0 + 7, 13.5, BZ1 - 2); k.geo('steelWhite', mast, 'ship');
  k.box('bauRed', BX0 + 7.05, BX0 + 9.2, 15.8, 17.0, BZ1 - 2.05, BZ1 - 1.95, 'ship');
  // Fieger's signature cobalt blue window frames on street facade
  for (let x = BX0 + 2; x < BX1 - 2; x += 4.2) {
    k.winZ(BZ1, 1, x, x + 2.6, 4.8, 6.8, { mull: 1.3, trans: [5.8], frame: 'kornBlue', tag: 'competition' });
    k.winZ(BZ1, 1, x, x + 2.6, 0.8, 2.8, { mull: 1.3, trans: [1.8], frame: 'kornBlue', tag: 'competition' });
  }
  // riverfront restaurant windows
  for (let x = BX0 + 2; x < BX1 - 2; x += 3.8) {
    k.winZ(BZ0, -1, x, x + 2.4, 4.6, 7.1, { mull: 1.2, frame: 'kornBlue', tag: 'competition' });
  }
  // cantilevered river terrace with ship railings
  k.box('paving', BX0 - 2, BX1 + 2, 3.78, 3.9, -10, BZ0, 'name');
  rails(k, 'steelWhite', [[BX0 - 2, BZ0], [BX0 - 2, -10], [BX1 + 2, -10], [BX1 + 2, BZ0]], 3.9, [0.55, 1.05], 'name');
  rails(k, 'kornBlue', [[BX0 - 2, BZ0], [BX0 - 2, -10], [BX1 + 2, -10], [BX1 + 2, BZ0]], 3.9, [0.25, 0.75], 'name');
  // concrete steps down the dyke to the landing stage
  for (let s = 0; s < 10; s++) k.box('concrete', -18, -14, 3.9 - s * 0.42, 4.0 - s * 0.42, -9 - s * 1.5, -7.5 - s * 1.5, 'guests');
  // landing pier on the Elbe
  k.box('wood', -42, -26, -0.6, -0.15, -28, -22, 'guests');
  rails(k, 'steelWhite', [[-42, -22.1], [-26, -22.1]], -0.15, [0.5, 0.95], 'guests');
  rails(k, 'steelWhite', [[-42, -27.9], [-26, -27.9]], -0.15, [0.5, 0.95], 'guests');
  [-38, -30].forEach(bx => {
    const bol = new THREE.CylinderGeometry(0.18, 0.22, 0.7, 10); bol.translate(bx, 0.2, -27.2); k.geo('iron', bol, 'guests');
  });
  // semicircular glazed winter garden / veranda (Rundsaal)
  const VCX = BX0, VCZ = (BZ0 + BZ1) / 2, VR = 9.2;
  // slender pilotis supporting the round veranda over the slope
  for (let a = Math.PI * 0.85; a <= Math.PI * 2.15; a += Math.PI / 4.5) {
    const cx = VCX + Math.sin(a) * (VR - 1.2), cz = VCZ + Math.cos(a) * (VR - 1.2);
    const col = new THREE.CylinderGeometry(0.24, 0.24, 3.9, 12); col.translate(cx, 1.95, cz); k.geo('white', col, 'veranda');
  }
  const vfloor = new THREE.CylinderGeometry(VR, VR, 0.35, 48, 1, false, Math.PI, Math.PI); vfloor.translate(VCX, 3.72, VCZ); k.geo('white', vfloor, 'veranda');
  const vroof = new THREE.CylinderGeometry(VR + 0.2, VR + 0.2, 0.35, 48, 1, false, Math.PI, Math.PI); vroof.translate(VCX, 7.8, VCZ); k.geo('white', vroof, 'veranda');
  k.part = 'veranda';
  const vg = new THREE.CylinderGeometry(VR - 0.1, VR - 0.1, 3.8, 48, 1, true, Math.PI, Math.PI); vg.translate(VCX, 5.9, VCZ); k.geo('glass', vg, 'veranda');
  for (let a = Math.PI; a <= Math.PI * 2 + 0.01; a += Math.PI / 14) { const x = VCX + Math.sin(a) * VR, z = VCZ + Math.cos(a) * VR; k.fr('kornBlue', x - 0.05, x + 0.05, 3.9, 7.8, z - 0.05, z + 0.05, 'veranda'); }
  rails(k, 'kornBlue', Array.from({ length: 15 }, (_, i) => { const a = Math.PI + Math.PI * i / 14; return [VCX + Math.sin(a) * (VR - 0.05), VCZ + Math.cos(a) * (VR - 0.05)]; }), 3.9, [1.0, 2.6], 'veranda'); k.part = '';
  k.part = 'v:balcony'; rails(k, 'kornBlue', Array.from({ length: 15 }, (_, i) => { const a = Math.PI + Math.PI * i / 14; return [VCX + Math.sin(a) * (VR - 0.05), VCZ + Math.cos(a) * (VR - 0.05)]; }), 3.9, [0.5, 1.0], 'veranda'); k.part = '';
  // street side
  k.box('asphalt', P.x0, P.x1, 0, 0.03, 18, 25); k.box('paving', P.x0, P.x1, 0, 0.05, 14, 18); k.box('paving', BX0 - 2, BX1 + 2, 0, 0.05, BZ1, 14);
  for (let x = -66; x <= 56; x += 9) tree(k, x, 30 + rand() * 6, 1.1, rand() < 0.5 ? 'poplar' : null);
  [[-55, 8], [-48, 4], [40, 6], [50, 9]].forEach(q2 => tree(k, q2[0], q2[1], 1.1, 'poplar'));
  for (let i = 0; i < 14; i++) person(k, BX0 + 1 + rand() * 30, -8 + rand() * 6, rand() * 6.28, 3.9);
  for (let i = 0; i < 6; i++) person(k, -50 + rand() * 100, 15 + rand() * 2.5, rand() * 6.28);
  [[-30, 16], [0, 16], [30, 16]].forEach(q2 => lamp(k, q2[0], q2[1]));
  // outdoor café tables, parasols and Bauhaus chairs on the terrace
  for (let i = 0; i < 7; i++) {
    const tx = BX0 + 5 + i * 4.6, tz = -5;
    const t = new THREE.CylinderGeometry(0.55, 0.55, 0.05, 16); t.translate(tx, 4.65, tz); k.geo('whiteInt', t, 'name');
    const leg = new THREE.CylinderGeometry(0.04, 0.04, 0.75, 6); leg.translate(tx, 4.27, tz); k.geo('steel', leg, 'name');
    const pTop = new THREE.ConeGeometry(1.6, 0.45, 12); pTop.translate(tx, 6.2, tz); k.geo(i % 2 ? 'red' : 'cream', pTop, 'name');
    const pPole = new THREE.CylinderGeometry(0.03, 0.03, 2.4, 6); pPole.translate(tx, 5.0, tz); k.geo('frame', pPole, 'name');
    [[-0.8, 0], [0.8, 0], [0, -0.8], [0, 0.8]].forEach(([cx, cz]) => {
      const seat = new THREE.BoxGeometry(0.38, 0.04, 0.38); seat.translate(tx + cx, 4.35, tz + cz); k.geo('wood', seat, 'name');
      const chLeg = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6); chLeg.translate(tx + cx, 4.12, tz + cz); k.geo('steel', chLeg, 'name');
    });
  }
  const grp = k.build();
  // red KORNHAUS neon-style letters on roof
  const tex = letterTexture('KORNHAUS', '#c8372d', 1024, 160, (g, w, h) => { g.font = '600 140px Jost, Futura, Arial, sans-serif'; g.fillText('KORNHAUS', w / 2, h / 2 + 6); });
  const letters = new THREE.Mesh(new THREE.PlaneGeometry(16, 2.5), new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6 }));
  letters.position.set(4, 9.55, 2.5); letters.castShadow = true; letters.userData.fact = 'ship';
  letters.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
  grp.add(letters);
  [[0, 8.05, 2.5], [8, 8.05, 2.5]].forEach(p => { const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.08), MAT.frame); post.position.set(p[0], p[1] + 0.3, p[2]); grp.add(post); });
  const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp);
  plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  const extra = {
    eras: [
      { year: '1929', title: 'The plan', note: 'Fieger first drew the round front as an open balcony.', hide: ['veranda'], show: ['v:balcony'] },
      { year: '1930', title: 'As built', note: 'Glazed during construction, it opened on 6 June 1930 and looks much the same today.' }
    ],
    views: [{ label: 'From the Elbe', cam: [-45, 3, -60], tgt: [0, 5, 3] }, { label: 'The terrace', cam: [26, 6, -14], tgt: [-6, 5, -2] }],
    groundAt: (x, z) => z < -22 || z > 6 ? 0 : z < -9 ? 3.8 * (z + 22) / 13 : z < 0 ? 3.9 : 3.8 * (6 - z) / 6,
    hiddenFacts: [
      { id: 'brandt', title: 'Lamps by Marianne Brandt', year: '1930', pos: [VCX - 4, 8.6, VCZ], cam: [-40, 12, 8], tgt: [VCX, 7, VCZ], hint: 'Look at the top of the round veranda.',
        text: 'The lamps in the Kornhaus are based on designs by Marianne Brandt from the Bauhaus metal workshop.',
        src: ['Vielfalt der Moderne', 'https://vielfaltdermoderne.de/en/kornhaus-2/'] }
    ]
  };
  return {
    ...extra, scene, center: new THREE.Vector3(0, 0, 0), span: 85, sunDist: 240, lamps: [[-30, 16], [0, 16], [30, 16]].map(q2 => new THREE.Vector3(q2[0], 4.85, q2[1])),
    intro: { pos: [-70, 32, -70], tgt: [0, 4, 3] },
    facts: [
      { id: 'competition', title: 'A competition in 1929', year: '1929', pos: [2, 8.6, BZ1 + 0.4], cam: [10, 9, 50], tgt: [2, 5, 6],
        text: 'In March 1929 the city of Dessau and the Schultheiss-Patzenhofer brewery held a competition for a riverside restaurant, dance hall and beer bar. Carl Fieger won the commission ahead of Hannes Meyer and the Bauhaus building department.',
        src: ['Bauhaus Kooperation', 'https://bauhauskooperation.de/en/knowledge/the-bauhaus/works/architecture/kornhaus-dessau'] },
      { id: 'veranda', title: 'A veranda that seems to float', year: '1930', pos: [VCX - VR - 0.6, 6, VCZ], cam: [-45, 10, -16], tgt: [-16, 5, 4],
        text: 'The semicircular, glass-enclosed winter garden projects so far that it almost seems to float. It was first planned as an open balcony and was glazed only halfway through construction.',
        src: ['MIT Dome (after Bauhaus Dessau)', 'https://dome.mit.edu/handle/1721.3/140794'] },
      { id: 'ship', title: 'A steamboat on the dyke', year: '1930', pos: [4, 11.2, 2.5], cam: [-30, 26, -40], tgt: [4, 6, 3],
        text: 'Fieger’s L-shaped plan seems to quote a steamboat. White plaster, blue window frames and doors, red details and the name KORNHAUS in large red letters on the flat roof all play on the maritime theme.',
        src: ['Bauhaus Dessau Foundation', 'https://bauhaus-dessau.de/en/venues/kornhaus/'] },
      { id: 'name', title: 'Why “Kornhaus”', year: 'until the 1870s', pos: [12, 5, -8.6], cam: [30, 8, -32], tgt: [10, 4, -4],
        text: 'The name recalls a granary that stood on this spot until the 1870s. The upper floor held the restaurant and dance hall, which opened onto the terraces along the Elbe.',
        src: ['Bauhaus Dessau Foundation', 'https://bauhaus-dessau.de/en/venues/kornhaus/'] },
      { id: 'guests', title: 'Room for 2,000 guests', year: '6 June 1930', pos: [-35, 1.5, -24.5], cam: [-58, 6, -45], tgt: [-25, 2, -12],
        text: 'The Kornhaus opened on 6 June 1930 next to the steamer landing stage. With its terraces and beer hall it could seat up to 2,000 guests. It is the only Bauhaus building on a waterfront site.',
        src: ['Archiweb', 'https://www.archiweb.cz/en/b/restaurace-kornhaus'] },
      { id: 'fieger', title: 'Carl Fieger', year: '1893–1960', pos: [BX1 + 5.4, 6, BZ0 + 7], cam: [42, 8, 24], tgt: [BX1, 5, 5],
        text: 'Fieger drew for Walter Gropius’s office for years and worked on the Bauhaus building and the Masters’ Houses. From 1927 to 1930 he taught technical drawing at the Bauhaus. The Kornhaus, built under his own name, is his best-known work.',
        src: ['Bauhaus Kooperation', 'https://bauhauskooperation.de/en/wissen/das-bauhaus/koepfe/biografien/biografie-detail/person-1440'] },
      { id: 'war', title: 'Through war and repair', year: '1940–2012', pos: [7.2, 3.4, BZ1 + 1.8], cam: [20, 4, 34], tgt: [6, 3, 10],
        text: 'The Kornhaus came through the bombing of Dessau undamaged and served as a military hospital from 1940 to 1945. It was restored from 1994 to 1996 and reopened as an excursion restaurant in October 2012.',
        src: ['Vielfalt der Moderne', 'https://vielfaltdermoderne.de/en/kornhaus-2/'] }
    ]
  };

}
