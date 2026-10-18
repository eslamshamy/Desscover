/* ================= materials ================= */
const GLASSY = new Set();
// water: two tiling wave normal maps (broad swell and fine ripples) that drift in different directions
let WATER_N = null, WATER_N2 = null;
function waveNormals(seed, count, kmin, kmax, strength) {
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), img = g.createImageData(S, S), r = mulberry(seed), waves = [];
  for (let i = 0; i < count; i++) { let kx, ky; do { kx = Math.round((r() * 2 - 1) * kmax); ky = Math.round((r() * 2 - 1) * kmax); } while (Math.hypot(kx, ky) < kmin); waves.push([kx, ky, 0.5 + r() * 0.5, r() * 6.283]); }
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let gx = 0, gy = 0; for (const w of waves) { const kk = Math.hypot(w[0], w[1]), c0 = w[2] * Math.cos((w[0] * x + w[1] * y) / S * 6.2832 + w[3]) / Math.sqrt(kk); gx += c0 * w[0]; gy += c0 * w[1]; }
    const nx = -gx * strength, ny = -gy * strength, l = Math.hypot(nx, ny, 1), i = (y * S + x) * 4;
    img.data[i] = (nx / l * 0.5 + 0.5) * 255; img.data[i + 1] = (ny / l * 0.5 + 0.5) * 255; img.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function makeWater() {
  WATER_N = waveNormals(4242, 10, 2, 7, 0.075); WATER_N.repeat.set(0.07, 0.07);
  WATER_N2 = waveNormals(777, 14, 6, 18, 0.05); WATER_N2.repeat.set(0.22, 0.22);
  const m = new THREE.MeshPhysicalMaterial({ color: 0x2a6a80, roughness: 0.04, metalness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.0,
    normalMap: WATER_N, normalScale: new THREE.Vector2(1.0, 1.0), clearcoatNormalMap: WATER_N2, clearcoatNormalScale: new THREE.Vector2(0.7, 0.7),
    envMapIntensity: 2.0, transparent: true, opacity: 0.9, depthWrite: true });
  m.userData.op = 0.9; m.userData.glow = 0; return m;
}
function std(color, rough, metal, tex, extra) {
  const m = new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: rough == null ? 0.9 : rough, metalness: metal || 0 }, extra || {}));
  if (tex) { m.map = getTex(tex); const b = BUMP[tex]; if (b) { m.bumpMap = m.map; m.bumpScale = b; } }
  return m;
}
const BUMP = { render: 0.06, stone: 0.18, brick: 0.25, brickBuff: 0.25, concrete: 0.12, paving: 0.2, cobble: 0.35, roofing: 0.1, slate: 0.15, tile: 0.2, stains: 0.06, gravel: 0.25, ballast: 0.3 };
function glass(color, op, rough, metal, env, glow) {
  const m = new THREE.MeshPhysicalMaterial({ color: color, transparent: true, opacity: op, roughness: rough, metalness: metal, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: env, clearcoat: 1.0, clearcoatRoughness: 0.04 });
  m.userData.glow = glow; m.userData.op = op; return m;
}
const MAT = {
  white: std(0xeceae4, 0.92, 0, 'render'), grey: std(0x8d9093, 0.92, 0, 'render'), roof: std(0x9a9d9f, 0.95, 0, 'roofing'),
  frame: std(0x1f2022, 0.45, 0.55), dark: std(0x14171a, 0.85), wood: std(0x5d4a39, 0.85), whiteInt: std(0xe9e7e1, 0.9),
  ceilO: std(0xde7a2c, 0.9), ceilY: std(0xefc12c, 0.9), ceilB: std(0x1f4fa3, 0.9), red: std(0xc8372d, 0.6),
  lawn: std(0xffffff, 0.98, 0, 'lawn'), paving: std(0xffffff, 0.92, 0, 'paving'), asphalt: std(0xffffff, 0.95, 0, 'asphalt'),
  cobble: std(0xffffff, 0.9, 0, 'cobble'), gravel: std(0xffffff, 0.95, 0, 'gravel'), ballast: std(0xffffff, 0.95, 0, 'ballast'),
  sand: std(0xffffff, 0.95, 0, 'sand'), stone: std(0xd2c3a8, 0.88, 0, 'stone'), slate: std(0xffffff, 0.8, 0.05, 'slate'),
  copper: std(0x6f9e8b, 0.55, 0.35), blackbox: std(0x1b1c1e, 0.75, 0.05), steel: std(0x6b7075, 0.45, 0.6),
  kornBlue: std(0x2f5d9e, 0.5, 0.15), rail: std(0x7a6e66, 0.45, 0.7), sleeper: std(0x4d4339, 0.9), train: std(0xc41a24, 0.45, 0.25),
  tram: std(0xe8e2cf, 0.5, 0.2), canopy: std(0x8b9196, 0.5, 0.5), concrete: std(0xbab9b3, 0.9, 0, 'concrete'),
  bark: std(0x55463a, 0.9), leaf: std(0x5f8442, 0.95, 0, null, { flatShading: true }), leaf2: std(0x6d8c47, 0.95, 0, null, { flatShading: true }),
  pine: std(0x2f4a33, 0.95, 0, null, { flatShading: true }), pine2: std(0x3a5638, 0.95, 0, null, { flatShading: true }), leaf3: std(0x4d7036, 0.95, 0, null, { flatShading: true }), coat: std(0x3b3f46, 0.85), skin: std(0xd9b394, 0.8), soil: std(0x7a6b57, 0.95),
  renderWarm: std(0xe6dcc8, 0.92, 0, 'render'), stoneLight: std(0xe6dccb, 0.85, 0, 'stone'), tiles: std(0xb3664a, 0.85, 0, 'tile'),
  newWhite: std(0xf2f1ec, 0.75, 0, 'render'), frost: glass(0xe6edef, 0.86, 0.5, 0, 0.5, 1.0),
  soot: std(0xa29e98, 0.95, 0, 'stains'), postwar: std(0xd0c8b3, 0.95, 0, 'stains'), camo: std(0xffffff, 0.95, 0, 'camo'),
  alu: std(0xa8adb1, 0.35, 0.85), rust: std(0x7b4a33, 0.85, 0.3), ochre: std(0xc8a46a, 0.92, 0, 'render'), brick: std(0xffffff, 0.9, 0, 'brick'),
  bauRed: std(0xc8372d, 0.85, 0, 'render'), bauBlue: std(0x1f4fa3, 0.85, 0, 'render'), bauYellow: std(0xefc12c, 0.85, 0, 'render'), black: std(0x1b1b1c, 0.85, 0, 'render'),
  none: new THREE.MeshBasicMaterial({ visible: false }), glassSmoked: glass(0x1d2c35, 0.8, 0.06, 0.2, 1.2, 0.35),
  brickBuff: std(0xffffff, 0.9, 0, 'brickBuff'), sandstone: std(0xd2c6a8, 0.85, 0, 'stone'), blackstone: std(0x2f3031, 0.6, 0.1, 'stone'),
  roofZinc: std(0x7c8487, 0.45, 0.55), domeBronze: std(0xc2ad7e, 0.3, 0.85), domeRib: std(0x8d7c58, 0.4, 0.8), bronzeDark: std(0x34312c, 0.45, 0.6),
  larch: std(0x6f6052, 0.9, 0, 'wood'), pvPanel: std(0x1d2a3a, 0.25, 0.6), greenRoof: std(0x86995e, 0.95, 0, 'lawn'),
  cgViolet: glass(0x7a64b0, 0.85, 0.1, 0.1, 1.4, 0.9), cgWhite: glass(0xdfe5e6, 0.85, 0.1, 0.1, 1.4, 0.9), cgGrey: glass(0x9aa4a9, 0.85, 0.1, 0.1, 1.4, 0.9),
  steam: glass(0xffffff, 0.28, 0.9, 0, 0.6, 0),
  cgGreen: glass(0x5fae4e, 0.82, 0.1, 0.1, 1.4, 0.9), cgTeal: glass(0x2f9c8e, 0.82, 0.1, 0.1, 1.4, 0.9), cgLime: glass(0xa6cf47, 0.82, 0.1, 0.1, 1.4, 0.9), cgBlue: glass(0x3f7fc0, 0.82, 0.1, 0.1, 1.4, 0.9),
  cgYellow: glass(0xf0c93e, 0.82, 0.1, 0.1, 1.4, 0.9), cgOrange: glass(0xe8823a, 0.82, 0.1, 0.1, 1.4, 0.9), cgRed: glass(0xc9443a, 0.82, 0.1, 0.1, 1.4, 0.9), steelWhite: std(0xeceeee, 0.4, 0.45), panelGrey: std(0xd6d4cc, 0.85, 0, 'concrete'),
  dcRed: std(0xd04a3d, 0.88, 0, 'render'), dcSilver: std(0xc3c7ca, 0.5, 0.35), domeBrown: std(0x6b5641, 0.45, 0.6), mallRed: std(0x7a2a2c, 0.85, 0, 'render'), mastGreen: std(0x4f7a5a, 0.6, 0.5), sail: std(0xf5f4f0, 0.6, 0),
  lyzRender: std(0xe2d1a4, 0.9, 0, 'render'),
  baroqueYellow: std(0xe9d29a, 0.9, 0, 'render'), luisYellow: std(0xf0e0a4, 0.9, 0, 'render'), ochre: std(0xe8c35f, 0.9, 0, 'render'), pinkRender: std(0xe6cabf, 0.9, 0, 'render'), hedge: std(0x3e5e33, 0.95, 0, null, { flatShading: true }),
  corrugated: std(0xc9ced3, 0.4, 0.75, 'corrugated'), iron: std(0x2a2c2f, 0.55, 0.6), rock: std(0x6e6458, 0.95, 0, null, { flatShading: true }),
  lavaGlow: std(0xff5a1e, 0.8, 0, null, { emissive: 0xff4a10, emissiveIntensity: 1.5 }), lyzRender: std(0xddcda4, 0.9, 0, 'render'), lyzStone: std(0xd0bd94, 0.85, 0, 'stone'), tilesRed: std(0xd06a48, 0.8, 0, 'tile'), domeDark: std(0x4a4440, 0.45, 0.55),
  stationRed: std(0xc4604e, 0.9, 0, 'render'), cream: std(0xebe3cf, 0.85, 0, 'render'), tileYellow: std(0xd6b664, 0.55, 0),
  canopyDark: std(0x2f3235, 0.5, 0.45), poleGreen: std(0x4b5b52, 0.6, 0.4), steelBlue: std(0x3d5a8a, 0.5, 0.5),
  hallWall: std(0xd2ccd6, 0.92, 0, 'render'), hallCeiling: std(0x8c8781, 0.85), floorStone: std(0xbab6ae, 0.55, 0, 'paving'),
  water: makeWater(),
  lampHead: std(0xfff4d8, 0.5, 0, null, { emissive: 0xffcf7a, emissiveIntensity: 0.2 }),
  glass: glass(0x8faab2, 0.34, 0.02, 0.3, 2.0, 1), glassDark: glass(0x6e8790, 0.55, 0.05, 0.3, 1.6, 0.8),
  museumGlass: glass(0xb5cdd3, 0.2, 0.03, 0.25, 1.6, 0.9),
  glassYellow: glass(0xf2c230, 0.55, 0.1, 0, 0.6, 0.3), glassRed: glass(0xd8452f, 0.55, 0.1, 0, 0.6, 0.3), glassBlue: glass(0x3a6fd0, 0.55, 0.1, 0, 0.6, 0.3), glassGreen: glass(0x3f9a6a, 0.55, 0.1, 0, 0.6, 0.3)
};
Object.keys(MAT).forEach(k => { if (MAT[k].transparent) GLASSY.add(k); });
const CEIL = ['ceilO', 'ceilY', 'ceilB', 'hallCeiling'];
const WARM = new THREE.Color(0xffc479);

