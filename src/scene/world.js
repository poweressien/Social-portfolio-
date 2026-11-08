import * as THREE from 'three';

// The living background. Everything is one WebGL canvas behind the page:
// a neon grid floor flowing toward you, fireflies that dodge the cursor, radar rings,
// a wireframe globe (a nod to the logo), aurora curtains and a 3D flock of birds.

const BG = 0x090d11;
const GREEN = new THREE.Color('#2ce28a');
const CHALK = new THREE.Color('#b9c6ca');

export function createWorld(canvas, { reduced = false, mobile = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance', alpha: false });
  let pr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(BG, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BG, 0.034);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 140);
  camera.position.set(0, 2.4, 7);

  const U = {
    time: { value: 0 },
    scroll: { value: 0 },
    mouse: { value: new THREE.Vector2(9, 9) },
    px: { value: renderer.getPixelRatio() },
  };

  /* ------------------------------------------------------------- grid floor */
  const grid = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: U.time, uScroll: U.scroll, uCol: { value: CHALK }, uAcc: { value: GREEN } },
      vertexShader: `varying vec2 vUv; varying float vD;
        void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uTime, uScroll; uniform vec3 uCol, uAcc; varying vec2 vUv; varying float vD;
        float ln(float x, float w){ float d = abs(fract(x - .5) - .5) / fwidth(x); return 1. - clamp(d - w, 0., 1.); }
        void main(){
          vec2 p = vUv * 100.; p.y += uTime * .9 + uScroll;
          float g = max(ln(p.x, .35), ln(p.y, .35));
          float g2 = max(ln(p.x / 5., .6), ln(p.y / 5., .6));
          float f = exp(-vD * .05);
          float a = (g * .06 + g2 * .17) * f;
          gl_FragColor = vec4(mix(uCol, uAcc, g2), a);
        }`,
    })
  );
  grid.rotation.x = -Math.PI / 2;
  grid.position.set(0, -1.7, -30);
  scene.add(grid);

  /* ------------------------------------------------------------- horizon glow + aurora */
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 80),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: U.time },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `uniform float uTime; varying vec2 vUv;
        void main(){
          float d = distance(vUv, vec2(.5, .12));
          float a = smoothstep(.55, 0., d) * (.13 + .02 * sin(uTime * .5));
          gl_FragColor = vec4(.26, .5, .45, a);
        }`,
    })
  );
  glow.position.set(0, 8, -60);
  scene.add(glow);

  const aurora = new THREE.Mesh(
    new THREE.PlaneGeometry(130, 34, 1, 1),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uTime: U.time },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `uniform float uTime; varying vec2 vUv;
        void main(){
          float w = sin(vUv.x * 9. + uTime * .25 + sin(vUv.y * 5. + uTime * .2) * 2.) * .5 + .5;
          float w2 = sin(vUv.x * 17. - uTime * .18 + vUv.y * 3.) * .5 + .5;
          float a = (w * .7 + w2 * .3) * smoothstep(0., .45, vUv.y) * smoothstep(1., .55, vUv.y) * .13;
          gl_FragColor = vec4(mix(vec3(.1,1.,.5), vec3(.2,.7,1.), vUv.x), a);
        }`,
    })
  );
  aurora.position.set(0, 14, -42);
  aurora.rotation.x = 0.18;
  aurora.visible = false; // the studio mark has no aurora: ground stays powder black
  scene.add(aurora);

  /* ------------------------------------------------------------- fireflies */
  const N = mobile ? 520 : 1300;
  const pos = new Float32Array(N * 3);
  const seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 46;
    pos[i * 3 + 1] = Math.random() * 16;
    pos[i * 3 + 2] = -Math.random() * 34 + 6;
    seed[i] = Math.random();
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const flies = new THREE.Points(
    pg,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: U.time, uMouse: U.mouse, uPx: U.px, uScroll: U.scroll },
      vertexShader: `uniform float uTime, uPx, uScroll; uniform vec2 uMouse; attribute float aSeed; varying float vA;
        void main(){
          vec3 p = position;
          p.x += sin(uTime * .2 + aSeed * 20.) * .9;
          p.y = mod(p.y + uTime * .14 * (.4 + aSeed) + uScroll * .35, 16.) - 1.5;
          p.z += cos(uTime * .15 + aSeed * 10.) * .7;
          vec4 mv = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * mv;
          vec2 nd = gl_Position.xy / gl_Position.w;
          vec2 d = nd - uMouse;
          float m = smoothstep(.38, 0., length(d));
          gl_Position.xy += normalize(d + 1e-4) * m * .14 * gl_Position.w;
          gl_PointSize = uPx * (1. + aSeed * 2.2) * (9. / -mv.z);
          vA = .3 + .7 * (.5 + .5 * sin(uTime * (1. + aSeed * 3.) + aSeed * 40.)) + m * .6;
        }`,
      fragmentShader: `varying float vA;
        void main(){
          float d = length(gl_PointCoord - .5);
          float a = smoothstep(.5, 0., d) * vA;
          vec3 c = mix(vec3(.94, .96, .96), vec3(.17, .89, .54), step(.72, fract(vA * 7.)));
          gl_FragColor = vec4(c, a * .8);
        }`,
    })
  );
  flies.frustumCulled = false;
  scene.add(flies);

  /* ------------------------------------------------------------- radar rings on the floor */
  const rings = [0, 1, 2].map((i) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.985, 1, 96), new THREE.MeshBasicMaterial({ color: CHALK, transparent: true, depthWrite: false, opacity: 0 }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, -1.68, -16);
    scene.add(m);
    return { m, off: i / 3 };
  });

  /* ------------------------------------------------------------- wireframe globe */
  const globe = new THREE.Group();
  const gw = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(3.4, 2)), new THREE.LineBasicMaterial({ color: CHALK, transparent: true, opacity: 0.09 }));
  globe.add(gw);
  for (let i = 0; i < 2; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(4.6 + i * 0.7, 0.012, 6, 140), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.28 }));
    ring.rotation.x = Math.PI / 2 + i * 0.5;
    ring.rotation.y = i * 0.6;
    globe.add(ring);
  }
  globe.position.set(9, 3.4, -17);
  scene.add(globe);

  /* ------------------------------------------------------------- 3D birds */
  const birdGeo = (() => {
    // forward is -z. Body plus two wings; wing tips flap in the vertex shader.
    const v = new Float32Array([
      // body
      0, 0.02, -0.7, -0.09, 0, 0.1, 0.09, 0, 0.1,
      -0.09, 0, 0.1, 0.09, 0, 0.1, 0, 0, 0.62,
      // left wing
      -0.06, 0, -0.18, -1.35, 0, 0.12, -0.06, 0, 0.38,
      // right wing
      0.06, 0, -0.18, 1.35, 0, 0.12, 0.06, 0, 0.38,
    ]);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(v, 3));
    return g;
  })();
  const FLOCKS = [
    { n: 9, c: [0, 3.2, -9], r: [15, 2.2, 5], w: 0.11, ph: 0, s: 0.4 },
    { n: 8, c: [2, 5.4, -15], r: [18, 1.6, 4], w: 0.08, ph: 2.1, s: 0.5 },
    { n: 7, c: [-3, 1.8, -7], r: [12, 1.2, 3], w: 0.14, ph: 4.0, s: 0.34 },
  ];
  const BN = FLOCKS.reduce((a, f) => a + f.n, 0);
  const birds = new THREE.InstancedMesh(
    birdGeo,
    new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: { uTime: U.time },
      vertexShader: `uniform float uTime; varying vec3 vCol; varying float vD; varying float vTip;
        void main(){
          vec3 p = position;
          float id = float(gl_InstanceID);
          float f = sin(uTime * (6.5 + mod(id, 5.) * .6) + id * 1.7);
          p.y += f * abs(p.x) * .7;
          p.z += abs(p.x) * .12 * f;
          vTip = abs(position.x) / 1.35;
          #ifdef USE_INSTANCING_COLOR
            vCol = instanceColor;
          #else
            vCol = vec3(1.);
          #endif
          vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.);
          vD = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `varying vec3 vCol; varying float vD; varying float vTip;
        void main(){
          vec3 c = vCol * (.62 + .38 * vTip) + vec3(.17, .89, .54) * vTip * .18;
          float fog = 1. - exp(-vD * vD * .0011);
          c = mix(c, vec3(.035, .05, .066), fog);
          gl_FragColor = vec4(c, 1.);
        }`,
    }),
    BN
  );
  birds.frustumCulled = false;
  const dove = new THREE.Color('#f0f5f4');
  const emerald = new THREE.Color('#2ce28a');
  for (let i = 0; i < BN; i++) birds.setColorAt(i, Math.random() < 0.55 ? dove : emerald);
  scene.add(birds);

  const tmpM = new THREE.Matrix4();
  const tmpQ = new THREE.Quaternion();
  const tmpS = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const pa = new THREE.Vector3();
  const pb = new THREE.Vector3();
  const lead = (f, t, out) => {
    const a = f.w * t + f.ph;
    out.set(f.c[0] + f.r[0] * Math.sin(a), f.c[1] + f.r[1] * Math.sin(a * 2.3) + Math.sin(t * 0.6 + f.ph) * 0.4, f.c[2] + f.r[2] * Math.cos(a * 0.9));
    return out;
  };
  function updateBirds(t) {
    let k = 0;
    for (const f of FLOCKS) {
      for (let i = 0; i < f.n; i++) {
        const lag = i * 0.55;
        lead(f, t - lag, pa);
        lead(f, t - lag + 0.08, pb);
        const side = (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.35;
        pa.x += Math.sin(i * 7.1) * 0.4;
        pa.y += side * 0.6 + Math.sin(t * 1.1 + i) * 0.12;
        pb.x += Math.sin(i * 7.1) * 0.4;
        pb.y += side * 0.6 + Math.sin(t * 1.1 + i + 0.1) * 0.12;
        tmpM.lookAt(pa, pb, up);
        tmpQ.setFromRotationMatrix(tmpM);
        const s = f.s * (0.85 + (i % 3) * 0.12);
        tmpS.set(s, s, s);
        tmpM.compose(pa, tmpQ, tmpS);
        birds.setMatrixAt(k++, tmpM);
      }
    }
    birds.instanceMatrix.needsUpdate = true;
  }

  /* ------------------------------------------------------------- frame loop */
  let prev = performance.now();
  const delta = () => {
    const n = performance.now();
    const d = (n - prev) / 1000;
    prev = n;
    return d;
  };
  let t = 0;
  let mx = 0, my = 0, tx = 0, ty = 0;
  let scrollY = 0, scrollSmooth = 0;
  let raf = 0;
  let slow = 0;

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    U.px.value = renderer.getPixelRatio();
    if (reduced) draw(0);
  }

  function draw(dt) {
    t += dt;
    U.time.value = t;
    scrollSmooth += (scrollY - scrollSmooth) * 0.08;
    U.scroll.value = scrollSmooth * 0.004;

    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;
    camera.position.x = mx * 1.2;
    camera.position.y = 2.4 + my * 0.5 - Math.min(scrollSmooth * 0.0012, 1.2);
    camera.lookAt(mx * 0.4, 1.3, -10);

    globe.rotation.y = t * 0.08;
    globe.rotation.x = Math.sin(t * 0.15) * 0.15;
    globe.position.y = 3.4 + Math.sin(t * 0.3) * 0.25 - scrollSmooth * 0.0006;
    aurora.position.x = Math.sin(t * 0.05) * 4;

    rings.forEach(({ m, off }) => {
      const p = (t * 0.09 + off) % 1;
      m.scale.setScalar(1 + p * 38);
      m.material.opacity = (1 - p) * (1 - p) * 0.16;
    });

    updateBirds(t);
    renderer.render(scene, camera);
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(delta(), 0.05);
    draw(dt);
    // if the device struggles, drop resolution once
    if (dt > 0.034) slow++;
    else slow = Math.max(0, slow - 1);
    if (slow > 80 && pr > 1) {
      pr = 1;
      renderer.setPixelRatio(1);
      resize();
      slow = 0;
    }
  }

  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth) * 2 - 1;
    ty = -((e.clientY / innerHeight) * 2 - 1);
    U.mouse.value.set(tx, ty);
  });
  addEventListener('pointerleave', () => U.mouse.value.set(9, 9));
  addEventListener('scroll', () => (scrollY = window.scrollY), { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!reduced) {
      delta();
      loop();
    }
  });

  resize();
  if (reduced) draw(2);
  else loop();

  return { renderer, scene, camera };
}
