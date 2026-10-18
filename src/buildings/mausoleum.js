export function buildMausoleum(context) {
  const { Kit, THREE, addWater, bear, pedimentU, person, plinth, prism, rand, realWaterLocal, registerNoAO, rotBox, tree, tubeU } = context;

  const k = new Kit(), SS = 'sandstone', DK = 'blackstone';
  const P = { x0: -80, x1: 80, z0: -90, z1: 65 };
  const RW = realWaterLocal('mausoleum', P); context.setWaterMask(RW);
  k.box('lawn', P.x0, P.x1, -0.12, 0, P.z0, P.z1);
  const XB = 14.5, ZF = -16.0, ZB = 16.0, FL = 1.6, CT = 12.8;
  k.box(DK, -XB - 0.45, XB + 0.45, 0, FL, ZF - 0.45, ZB + 0.45, 'crypt');
  k.box(SS, -XB, XB, FL, CT, ZF, ZB, 'chapel');
  // semicircular rear apse
  const apse = new THREE.CylinderGeometry(6.4, 6.4, CT - FL, 24, 1, false, -Math.PI / 2, Math.PI);
  apse.translate(0, (FL + CT) / 2, ZB); k.geo(SS, apse, 'chapel');
  const apseR = new THREE.SphereGeometry(6.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  apseR.translate(0, CT, ZB); k.geo('roofZinc', apseR, 'chapel');
  // corner projections and dark frieze line
  [-1, 1].forEach(sd => {
    const xo = sd * XB;
    k.box(SS, xo - (sd > 0 ? 0 : 2.5), xo + (sd > 0 ? 2.5 : 0), FL, CT, ZF, ZF + 2.5, 'chapel');
    k.box(SS, xo - (sd > 0 ? 0 : 2.5), xo + (sd > 0 ? 2.5 : 0), FL, CT, ZB - 2.5, ZB, 'chapel');
    [-4.2, -1.4, 1.4, 4.2].forEach(z => {
      const c = new THREE.CylinderGeometry(0.6, 0.66, 6.2, 18); c.translate(xo - sd * 1.1, FL + 1.5 + 3.1, z); k.geo(SS, c, 'chapel');
      k.box(DK, xo - sd * 1.1 - 0.85, xo - sd * 1.1 + 0.85, FL, FL + 1.5, z - 0.85, z + 0.85, 'chapel');
      k.box(SS, xo - sd * 1.1 - 0.8, xo - sd * 1.1 + 0.8, FL + 7.7, FL + 8.2, z - 0.8, z + 0.8, 'chapel');
    });
  });
  k.box(DK, -XB - 0.08, XB + 0.08, CT, CT + 0.5, ZF - 0.08, ZB + 0.08, 'chapel');
  k.box(SS, -XB - 0.55, XB + 0.55, CT + 0.5, CT + 1.6, ZF - 0.55, ZB + 0.55, 'chapel');
  // monumental Corinthian entrance portico: four fluted columns, bronze door, carved pediment
  [-5.1, -1.7, 1.7, 5.1].forEach(x => {
    k.box(DK, x - 0.95, x + 0.95, FL, FL + 1.6, ZF + 0.2, ZF + 2.1, 'portico');
    const c = new THREE.CylinderGeometry(0.66, 0.74, 6.4, 20); c.translate(x, FL + 1.6 + 3.2, ZF + 1.15); k.geo(SS, c, 'portico');
    k.box(SS, x - 0.95, x + 0.95, FL + 8.0, FL + 8.6, ZF + 0.2, ZF + 2.1, 'portico');
  });
  k.box('bronzeDark', -1.7, 1.7, FL, FL + 5.8, ZF + 2.55, ZF + 2.62, 'portico');
  k.box(SS, -2.1, 2.1, FL + 5.8, FL + 6.3, ZF + 2.5, ZF + 2.65, 'portico');
  pedimentU(k, SS, -7.9, 7.9, CT + 1.6, 3.4, ZF + 0.2, 0.9, 'portico');
  { const c = new THREE.CircleGeometry(1.0, 20); c.rotateY(Math.PI); c.translate(0, CT + 2.8, ZF - 0.72); k.geo('stone', c, 'portico'); }
  // zinc roofs
  k.geo('roofZinc', prism(-XB - 0.55, XB + 0.55, ZF - 0.55, ZB + 0.55, CT + 1.6, CT + 5.4, 8, 8), 'chapel');
  k.geo('roofZinc', prism(-7.9, 7.9, ZF + 0.2, 0, CT + 1.6, CT + 5.0, 7.9, 0), 'portico');
  [-1, 1].forEach(sd => {
    k.geo('roofZinc', prism(Math.min(sd * XB, 0), Math.max(sd * XB, 0), -6.6, 6.6, CT + 1.6, CT + 4.6, 0, 6.6), 'chapel');
    const sh = new THREE.Shape(); sh.moveTo(-6.6, 0); sh.lineTo(6.6, 0); sh.lineTo(0, 3.0); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false }); g.rotateY(Math.PI / 2); g.translate(sd > 0 ? XB - 0.1 : -XB - 0.5, CT + 1.6, 0); k.geo(SS, g, 'chapel');
  });
  [[-XB, ZF], [XB, ZF], [-XB, ZB], [XB, ZB]].forEach(c => {
    k.box(SS, c[0] - 1.2, c[0] + 1.2, CT + 1.6, CT + 4.2, c[1] - 1.2, c[1] + 1.2, 'chapel');
    const u = new THREE.LatheGeometry([[0.01, 0], [0.7, 0], [0.75, 0.25], [0.45, 0.55], [0.8, 1.3], [0.55, 1.75], [0.3, 1.9], [0.01, 2.2]].map(p => new THREE.Vector2(p[0], p[1])), 16);
    u.translate(c[0], CT + 4.2, c[1]); k.geo(DK, u, 'chapel');
  });
  // square base, tall drum, ring of columns, relief attic and the ribbed bronze dome
  k.box(SS, -7.8, 7.8, CT + 3.5, 21.0, -7.8, 7.8, 'dome'); k.box(SS, -8.1, 8.1, 20.6, 21.2, -8.1, 8.1, 'dome');
  const cyl = (r, y0, y1, m, seg, tag) => { const g = new THREE.CylinderGeometry(r, r, y1 - y0, seg || 48); g.translate(0, (y0 + y1) / 2, 0); k.geo(m, g, tag || 'dome'); };
  cyl(7.2, 21.2, 26.0, SS); cyl(7.55, 26.0, 26.5, SS); cyl(7.6, 26.5, 26.7, DK);
  cyl(6.0, 26.7, 32.3, SS);
  for (let i = 0; i < 16; i++) {
    const a = (i + 0.5) / 16 * Math.PI * 2;
    const w = new THREE.PlaneGeometry(1.3, 4.2); w.rotateY(Math.PI / 2 - a); w.translate(Math.cos(a) * 6.03, 29.4, -Math.sin(a) * 6.03); k.geo('glassDark', w, 'dome');
  }
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * Math.PI * 2, x = Math.cos(a) * 7.0, z = -Math.sin(a) * 7.0;
    const c = new THREE.CylinderGeometry(0.34, 0.38, 5.2, 12); c.translate(x, 26.7 + 2.6, z); k.geo(SS, c, 'dome');
  }
  cyl(7.55, 31.9, 32.7, SS); cyl(7.62, 32.7, 33.0, DK); cyl(6.95, 33.0, 35.0, SS);
  for (let i = 0; i < 16; i++) {
    const a = (i + 0.5) / 16 * Math.PI * 2;
    rotBox(k, 'stone', 1.6, 1.3, 0.12, Math.cos(a) * 7.0, 34.0, -Math.sin(a) * 7.0, a + Math.PI / 2, 'dome');
  }
  cyl(7.35, 35.0, 35.5, SS);
  const prof = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16 * Math.PI / 2; prof.push(new THREE.Vector2(Math.max(1.25, 7.0 * Math.cos(t)), 35.5 + 5.6 * Math.sin(t))); }
  k.geo('domeBronze', new THREE.LatheGeometry(prof, 48), 'dome');
  for (let r = 0; r < 24; r++) {
    const a = r / 24 * Math.PI * 2, pts = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12 * Math.PI / 2 * 0.94, rr = 7.05 * Math.cos(t); pts.push([Math.cos(a) * rr, 35.5 + 5.65 * Math.sin(t), -Math.sin(a) * rr]); }
    tubeU(k, 'domeRib', pts, 0.07, 'dome');
  }
  // open green lantern with gilded cross
  cyl(1.45, 41.0, 41.4, 'copper', 20);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2; const c = new THREE.CylinderGeometry(0.08, 0.08, 1.7, 8); c.translate(Math.cos(a) * 1.2, 42.25, -Math.sin(a) * 1.2); k.geo('copper', c, 'dome');
  }
  { const d = new THREE.SphereGeometry(1.5, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2); d.scale(1, 0.8, 1); d.translate(0, 43.1, 0); k.geo('copper', d, 'dome');
    k.box('copper', -0.07, 0.07, 44.2, 45.5, -0.07, 0.07, 'dome'); k.box('copper', -0.4, 0.4, 45.0, 45.14, -0.07, 0.07, 'dome'); }
  // granite stairs, landing and the two bronze bears
  for (let i = 0; i < 8; i++) k.box(DK, -9, 9, Math.max(0, FL - (i + 1) * 0.2), FL - i * 0.2, ZF - 0.45 - (i + 1) * 0.62, ZF - 0.45, 'portico');
  k.box(DK, -13.5, 13.5, 0, 1.4, ZF - 11.5, ZF - 4.9, 'portico');
  for (let i = 0; i < 7; i++) k.box(DK, -11, 11, 1.4 - (i + 1) * 0.2, 1.4 - i * 0.2, ZF - 11.5 - (i + 1) * 0.5, ZF - 11.5, 'portico');
  [-1, 1].forEach(sd => {
    k.box(DK, sd * 13.5 - 1.9, sd * 13.5 + 1.9, 0, 3.0, ZF - 13.2, ZF - 9.6, 'portico');
    bear(k, sd * 13.5, 3.0, ZF - 11.4, Math.PI / 2 - sd * 0.3, 'portico');
    k.box(DK, sd * 9.2 - 0.3, sd * 9.2 + 0.3, 0, FL + 0.7, ZF - 4.9, ZF, 'portico');
  });
  // park: wide gravel avenue, circular fountain with water jet, pyramid yews
  k.box('gravel', -14, 14, 0, 0.04, P.z0, ZF - 20); k.box('gravel', -40, 40, 0, 0.04, ZF - 20, ZF - 15);
  const basin = new THREE.CylinderGeometry(7, 7, 0.6, 40); basin.translate(0, 0.3, -62); k.geo(SS, basin, 'park');
  const wtr = new THREE.CylinderGeometry(6.4, 6.4, 0.1, 40); wtr.translate(0, 0.62, -62); k.geo('water', wtr, 'park');
  const jet = new THREE.CylinderGeometry(0.08, 0.22, 3.2, 12); jet.translate(0, 2.2, -62); k.geo('steam', jet, 'park');
  // pyramid yews along the avenue
  for (let z = P.z0 + 10; z < ZF - 22; z += 12) {
    [-16, 16].forEach(yx => {
      const yew = new THREE.ConeGeometry(1.6, 4.8, 12); yew.translate(yx, 2.4, z); k.geo('hedge', yew, 'park');
    });
  }
  for (let i = 0; i < 40; i++) {
    const x = P.x0 + 5 + rand() * (P.x1 - P.x0 - 10), z = P.z0 + 5 + rand() * (P.z1 - P.z0 - 10);
    if (Math.abs(x) < 26 && z > -48 && z < 26) continue; if (Math.abs(x) < 16) continue;
    tree(k, x, z, 1.2 + rand() * 0.5);
  }
  for (let i = 0; i < 8; i++) person(k, -8 + rand() * 16, -70 + rand() * 30, rand() * 6.28);
  context.setWaterMask(null); addWater(k, RW, 0.06, 'park');
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return { scene, center: new THREE.Vector3(0, 0, -6), span: 95, sunDist: 250, lamps: [], intro: { pos: [-48, 22, -92], tgt: [0, 18, 0] },
    views: [{ label: 'Up the stairs', cam: [0, 2.4, -60], tgt: [0, 16, 0] }, { label: 'From above, like the drone photo', cam: [0, 62, -95], tgt: [0, 14, 0] }, { label: 'The dome', cam: [24, 40, -34], tgt: [0, 36, 0] }],
    facts: [
      { id: 'portico', title: 'A tomb for the dukes', year: '1894–98', pos: [0, CT + 5.8, ZF - 0.6], cam: [0, 2.4, -60], tgt: [0, 14, 0],
        text: 'Duke Friedrich I of Anhalt had the Mausoleum built from 1894 to 1898 to designs by the Berlin architect Franz Heinrich Schwechten. It stands on the axis of the main entrance to the Georgium, at the centre of a park laid out by August Hooff. A broad dark stair, guarded by two bear sculptures, leads up to a columned portico.',
        src: ['City of Dessau-Roßlau, monument office', 'https://verwaltung.dessau-rosslau.de/fileadmin/Verwaltungsportal_Dessau-Rosslau/Stadtentwicklung_Umwelt/Baukultur_Denkmale/Denkmalpflege/TdoD_2020/Mausoleum.pdf'] },
      { id: 'dome', title: 'A 43-metre dome', year: '1898', pos: [0, 46.5, 0], cam: [24, 40, -34], tgt: [0, 36, 0],
        text: 'The building is 43 m high, 46 m long and 38 m wide, and the dome is 14 m across. A ring of columns surrounds the drum below the ribbed dome, which is crowned by an open lantern. Inside there are two parts: a crypt below and the Resurrection Chapel under the dome.',
        src: ['City of Dessau-Roßlau, monument office', 'https://verwaltung.dessau-rosslau.de/fileadmin/Verwaltungsportal_Dessau-Rosslau/Stadtentwicklung_Umwelt/Baukultur_Denkmale/Denkmalpflege/TdoD_2020/Mausoleum.pdf'] },
      { id: 'crypt', title: 'Moved in 1958', year: '1958', pos: [-XB - 0.6, FL + 2, 0], cam: [-42, 6, -10], tgt: [-XB, 3, 0],
        text: 'In the crypt below rested Duke Leopold Friedrich, Duchess Friederike, Prince Friedrich and Duke Eduard. In 1958 the city had the coffins removed secretly by night and reburied in a mass grave in the Ziebigk cemetery, and the crypt was filled with rubble. The park has been open to the public since 1986.',
        src: ['Gartenträume Sachsen-Anhalt', 'https://gartentraeume-sachsen-anhalt.de/en/garden-dreams-parks/georgium-palace-georgengarten-and-beckerbruch-on-the-elbe.html'] },
      { id: 'park', title: 'Part of the Georgium', year: '1894–today', pos: [0, 1.2, -62], cam: [-28, 8, -75], tgt: [0, 2, -62],
        text: 'Schwechten’s mausoleum stands in a six-hectare park laid out for it by court gardener August Hooff, with a broad avenue of yews, an artificial mound and a fountain. The park forms a grand southern continuation of the Georgium.',
        src: ['Gartenträume Sachsen-Anhalt', 'https://gartentraeume-sachsen-anhalt.de/en/garden-dreams-parks/georgium-palace-georgengarten-and-beckerbruch-on-the-elbe.html'] }
    ] };

}
