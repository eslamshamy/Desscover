export function buildYHouses(context) {
  const { Kit, THREE, lamp, parkGround, person, plinth, rand, registerNoAO, rotBox, tree, yHouseU } = context;

  const k = new Kit(); const P = { x0: -90, x1: 130, z0: -100, z1: 115 };
  parkGround(k, P);
  const YH = [[81, -61, 0.5, 'ytower'], [0, 0, -0.25, 'core'], [-18, 76, 0.3, 'lifts']];
  YH.forEach(h => yHouseU(k, h[0], h[1], h[2], h[3]));
  k.box('asphalt', -54, -44, 0, 0.03, P.z0, P.z1); k.box('paving', -44, -40, 0, 0.05, P.z0, P.z1);
  for (let i = 0; i < 60; i++) { const x = -30 + rand() * 155, z = P.z0 + 8 + rand() * (P.z1 - P.z0 - 16); if (YH.some(h => Math.hypot(x - h[0], z - h[1]) < 24)) continue; tree(k, x, z, 1.0 + rand() * 0.4); }
  rotBox(k, 'paving', 150, 0.04, 3.5, 55, 0.04, 40, -0.5, 'park'); rotBox(k, 'paving', 120, 0.04, 3, 40, 0.04, -20, 0.35, 'park');
  [[-42, -60], [-42, -10], [-42, 40], [-42, 90]].forEach(q => lamp(k, q[0], q[1]));
  for (let i = 0; i < 18; i++) person(k, -42 + rand() * 3, P.z0 + 10 + rand() * 190, rand() * 6.28);
  // concrete bus shelter at the Stadtpark tram stop
  k.box('concrete', -56, -50, 2.6, 2.8, -28, -14, 'park'); [[-56, -28], [-50.25, -28], [-56, -14.25], [-50.25, -14.25]].forEach(q => k.box('concrete', q[0], q[0] + 0.25, 0, 2.6, q[1], q[1] + 0.25, 'park')); k.box('concrete', -56, -55.75, 0, 2.6, -27.75, -14.25, 'park'); k.box('glassDark', -55.75, -50.25, 0.4, 2.6, -27.93, -27.87, 'park'); k.box('glassDark', -55.75, -50.25, 0.4, 2.6, -14.13, -14.07, 'park');
  // Stadtpark benches beside the path
  [[-15, 15], [20, 40], [50, 10]].forEach(b => { k.box('wood', b[0] - 1.2, b[0] + 1.2, 0.45, 0.55, b[1] - 0.15, b[1] + 0.15); k.box('wood', b[0] - 1.2, b[0] + 1.2, 0.55, 1.0, b[1] + 0.1, b[1] + 0.15); });
  const grp = k.build(); const scene = new THREE.Scene(); scene.add(grp); registerNoAO(grp); plinth(scene, P.x0, P.x1, P.z0, P.z1, 3, 6);
  return { scene, center: new THREE.Vector3(20, 0, 5), span: 125, sunDist: 300,
    lamps: [[-42, -60], [-42, -10], [-42, 40], [-42, 90]].map(q => new THREE.Vector3(q[0], 4.85, q[1])),
    intro: { pos: [-120, 60, 120], tgt: [20, 20, 5] },
    views: [{ label: 'From the park', cam: [10, 2, 60], tgt: [0, 22, 0] }, { label: 'Between the towers', cam: [-40, 3, -30], tgt: [0, 30, 5] }, { label: 'Entrance foyer', cam: [15, 3, -38], tgt: [15, 4, -60] }],
    facts: [
      { id: 'ytower', title: 'Named after a letter', year: '1969–71', pos: [81, 47, -61], cam: [-120, 60, 120], tgt: [20, 20, 5],
        text: 'The Y-houses get their name from their Y-shaped plan. Built between 1969 and 1971, they are 41 m high with 14 storeys and became landmarks of the city centre at the Stadtpark.',
        src: ['Wohnungsexposé citing the building data', 'https://rentberry.com/de/apartments/165476238-two-br-willy-lohmann-strasse-26-06844-dessau-germany'] },
      { id: 'core', title: 'A slipformed core', year: '1969–72', pos: [0, 47.5, 5], cam: [-40, 3, -30], tgt: [0, 30, 5],
        text: 'Gerhard Plahnert and Gottfried Rudowsky did the urban design and Wulf Brandstädter the buildings. The central core was cast in slipform, and three prefabricated wings were attached to it.',
        src: ['Menschen am Alex (1974/75 postcards)', 'https://menschenamalex.wordpress.com/2020/06/07/zwei-ansichten-ein-y-hochhaus-in-dessau-1974-1975/'] },
      { id: 'lifts', title: 'A lift every third floor', year: 'today', pos: [-18, 46, 76], cam: [30, 20, 130], tgt: [-18, 20, 76],
        text: 'The lifts stop only on every third floor, so residents reach their flats by stairs from there. Each of the three wings holds 27 flats over 13 floors, with nine maisonettes in the core.',
        src: ['Neutecta project page', 'https://www.neutecta.com/projekte/dessau-rosslau/'] },
      { id: 'park', title: 'A monument of GDR modernism', year: 'today', pos: [-40, 2, 34], cam: [10, 2, 60], tgt: [0, 22, 0],
        text: 'There are three Y-houses in all. Today they are listed as a monument of post-war modernism in the GDR.',
        src: ['Häuserbuch der Stadt Dessau II/7', 'https://www.dessau-buch.de/catalog/product/view/_ignore_category/1/id/11145/s/hauserbuch-der-stadt-dessau-ii-7/'] }
    ] };

}
