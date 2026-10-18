/* ================= renderer and post-processing ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);
const dom = renderer.domElement;
const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 4000);

let activeScene = null;
let composer = null, renderPass = null, gtao = null, bloom = null, grade = null, usePost = true;
const noAO = new Set();
try {
  const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: MOBILE ? 0 : 4 });
  composer = new EffectComposer(renderer, rt);
  renderPass = new RenderPass(new THREE.Scene(), camera);
  composer.addPass(renderPass);
  if (!MOBILE) {
    gtao = new GTAOPass(new THREE.Scene(), camera, 2, 2);
    gtao.output = GTAOPass.OUTPUT.Default;
    gtao.blendIntensity = 1.0;
    try { gtao.updateGtaoMaterial({ radius: 2.2, distanceExponent: 1, thickness: 1, scale: 1, samples: 16 }); } catch (e) {}
    try { gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, radiusExponent: 1, rings: 2, samples: 16 }); } catch (e) {}
    const orig = gtao.render.bind(gtao);
    gtao.render = function (r, w, rb, dt, mask) {
      const hidden = [];
      noAO.forEach(o => { if (o.visible) { o.visible = false; hidden.push(o); } });
      try { orig(r, w, rb, dt, mask); } finally { hidden.forEach(o => { o.visible = true; }); }
    };
    composer.addPass(gtao);
  }
  try { bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.2, 0.45, 4.0); composer.addPass(bloom); } catch (e) { bloom = null; }
  composer.addPass(new OutputPass());
  try {
    grade = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, time: { value: 0 }, res: { value: new THREE.Vector2(1, 1) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D tDiffuse; uniform float time; uniform vec2 res; varying vec2 vUv;\n' +
        'void main(){ vec4 c = texture2D(tDiffuse, vUv); vec3 col = c.rgb;\n' +
        'float l = dot(col, vec3(0.299, 0.587, 0.114)); col = mix(vec3(l), col, 1.07);\n' +
        'col = (col - 0.5) * 1.035 + 0.5; col *= vec3(1.01, 1.0, 0.985);\n' +
        'vec2 q = vUv - 0.5; col *= 1.0 - dot(q, q) * 0.5;\n' +
        'float g = fract(sin(dot(vUv * res + time, vec2(12.9898, 78.233))) * 43758.5453); col += (g - 0.5) * 0.014;\n' +
        'gl_FragColor = vec4(clamp(col, 0.0, 1.0), c.a); }'
    });
    composer.addPass(grade);
  } catch (e) { grade = null; }
} catch (e) { console.warn('Post-processing unavailable', e); usePost = false; }

function setActiveScene(s) {
  activeScene = s;
  if (renderPass) renderPass.scene = s;
  if (gtao) gtao.scene = s;
}
function render(dt) {
  if (usePost && composer) {
    try { composer.render(dt); return; } catch (e) { console.error(e); usePost = false; }
  }
  renderer.render(activeScene, camera);
}

