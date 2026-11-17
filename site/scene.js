// The world behind the page: sky + sun/moon + stars (one shader), a wireframe valley
// scrolling toward you, laser beams fanning out of the sun, drifting motes, and bloom.
// Everything is driven by uniforms so a set change is a tween, not a rebuild.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const SKY_VERT = /* glsl */ `
varying vec3 vPos;
void main() { vPos = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vPos, 1.0); }`;

const SKY_FRAG = /* glsl */ `
uniform vec3 uTop, uMid, uHorizon, uSunA, uSunB, uStar;
uniform float uSunY, uSunR, uStripes, uStars, uGlow, uTime;
varying vec3 vPos;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  float h = clamp((vPos.y + 1.0) / 46.0, 0.0, 1.0);
  vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.32, h));
  col = mix(col, uTop, smoothstep(0.28, 0.95, h));

  // stars, twinkling, fading toward the horizon glow
  vec2 cell = floor(vPos.xy * 1.15);
  float s = hash(cell);
  vec2 f = fract(vPos.xy * 1.15) - 0.5 - (vec2(hash(cell + 7.0), hash(cell + 3.0)) - 0.5) * 0.6;
  float tw = 0.55 + 0.45 * sin(uTime * (1.0 + s * 3.0) + s * 60.0);
  float star = step(0.982, s) * smoothstep(0.12, 0.0, length(f)) * smoothstep(0.08, 0.45, h) * tw;
  col += uStar * star * uStars;

  // sun / moon with a halo; stripes cut the lower half (synthwave)
  vec2 d = vPos.xy - vec2(0.0, uSunY);
  float r = length(d);
  float halo = exp(-max(r - uSunR, 0.0) / (uSunR * 0.75)) * uGlow;
  col += mix(uSunB, uSunA, 0.35) * halo * 0.3;
  float disc = 1.0 - smoothstep(uSunR - 0.06, uSunR + 0.06, r);
  float t = clamp((vPos.y - (uSunY - uSunR)) / (2.0 * uSunR), 0.0, 1.0);
  vec3 sunCol = mix(uSunB, uSunA, smoothstep(0.0, 1.0, t));
  float below = (uSunY - vPos.y) / uSunR;
  float gap = step(0.08, below) * step(fract(below * 5.5 - uTime * 0.12), below * 0.42);
  disc *= 1.0 - gap * uStripes;
  // keep the disc under the bloom threshold that would clip red and shift brass toward lemon
  col = mix(col, sunCol * 0.64, disc);
  gl_FragColor = vec4(col, 1.0);
}`;

const GROUND_VERT = /* glsl */ `
uniform float uOff, uAmp;
varying vec2 vGrid; varying float vDist; varying float vH;
float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 13758.5453); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
void main() {
  vec3 p = position;
  vec2 g = vec2(p.x, p.z + uOff);
  float valley = smoothstep(3.0, 16.0, abs(p.x));
  float hgt = (noise(g * 0.12) * 1.0 + noise(g * 0.31) * 0.45 + noise(g * 0.9) * 0.08) * valley * uAmp;
  hgt *= smoothstep(-64.0, -40.0, p.z) * 0.6 + 0.4;
  p.y += hgt;
  vGrid = g; vH = hgt;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vDist = -wp.z;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const GROUND_FRAG = /* glsl */ `
uniform vec3 uFill, uGrid, uGrid2, uHorizon;
uniform float uLine;
varying vec2 vGrid; varying float vDist; varying float vH;
float gridLine(vec2 g) { vec2 w = abs(fract(g - 0.5) - 0.5) / fwidth(g); return 1.0 - min(min(w.x, w.y), 1.0); }
void main() {
  float l1 = gridLine(vGrid);
  float l4 = gridLine(vGrid / 4.0);
  float near = 1.0 - smoothstep(4.0, 62.0, vDist);
  vec3 col = uFill * (0.85 + vH * 0.05);
  col += uGrid * l1 * uLine * (0.18 + 0.42 * near);
  col = mix(col, uGrid2, l4 * 0.4 * uLine);
  float fog = smoothstep(18.0, 64.0, vDist);
  col = mix(col, uHorizon, fog * 0.92);
  gl_FragColor = vec4(col, 1.0);
}`;

const BEAM_FRAG = /* glsl */ `
uniform vec3 uColor; uniform float uAmt;
varying vec2 vUv;
void main() {
  float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
  // beams emerge from behind the disc instead of piling up (additively) on its center
  float a = pow(edge, 2.5) * pow(1.0 - vUv.y, 1.6) * smoothstep(0.05, 0.11, vUv.y) * uAmt;
  gl_FragColor = vec4(uColor * a, a);
}`;
const BEAM_VERT = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const MOTE_VERT = /* glsl */ `
uniform float uTime, uSize, uRise;
attribute float aSeed;
varying float vA;
void main() {
  vec3 p = position;
  p.y = mod(p.y + uTime * uRise * (0.4 + aSeed), 16.0) - 1.0;
  p.x += sin(uTime * 0.4 + aSeed * 30.0) * 0.6;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (0.5 + aSeed) * (30.0 / -mv.z);
  vA = 0.45 + 0.55 * sin(uTime * (1.5 + aSeed * 3.0) + aSeed * 50.0);
  gl_Position = projectionMatrix * mv;
}`;
const MOTE_FRAG = /* glsl */ `
uniform vec3 uColor; uniform float uAmt;
varying float vA;
void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d) * vA * uAmt; gl_FragColor = vec4(uColor * a, a); }`;

export const COLOR_KEYS = ["top", "mid", "horizon", "sunA", "sunB", "star", "fill", "grid", "grid2", "beam0", "beam1", "beam2", "beam3", "mote"];
export const NUM_KEYS = ["sunY", "sunR", "stripes", "stars", "glow", "beams", "motes", "bloom", "speed", "amp", "line", "rise", "thresh"];

export function createWorld(canvas, { reducedMotion }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  camera.position.set(0, 2.4, 8);

  const c = () => new THREE.Color();
  const U = (extra) => ({ uTime: { value: 0 }, ...extra });

  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(260, 110),
    new THREE.ShaderMaterial({
      vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, depthWrite: false,
      uniforms: U({ uTop: { value: c() }, uMid: { value: c() }, uHorizon: { value: c() }, uSunA: { value: c() }, uSunB: { value: c() }, uStar: { value: c() },
        uSunY: { value: 4 }, uSunR: { value: 7 }, uStripes: { value: 1 }, uStars: { value: 1 }, uGlow: { value: 1 } }),
    }),
  );
  sky.position.set(0, 30, -64);
  scene.add(sky);

  const groundGeo = new THREE.PlaneGeometry(140, 74, 220, 150);
  groundGeo.rotateX(-Math.PI / 2);
  groundGeo.translate(0, 0, -28);
  const ground = new THREE.Mesh(
    groundGeo,
    new THREE.ShaderMaterial({
      vertexShader: GROUND_VERT, fragmentShader: GROUND_FRAG,
      uniforms: { uOff: { value: 0 }, uAmp: { value: 3 }, uFill: { value: c() }, uGrid: { value: c() }, uGrid2: { value: c() }, uHorizon: sky.material.uniforms.uHorizon, uLine: { value: 1 } },
    }),
  );
  scene.add(ground);

  // lasers fanning from the sun
  const beams = [];
  const beamGeo = new THREE.PlaneGeometry(0.22, 120);
  beamGeo.translate(0, 60, 0);
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(beamGeo, new THREE.ShaderMaterial({
      vertexShader: BEAM_VERT, fragmentShader: BEAM_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: c() }, uAmt: { value: 0 } },
    }));
    m.position.set(0, 4, -62);
    m.userData = { base: -1.25 + (i / 11) * 2.5, phase: i * 1.7, colorIndex: i % 4 };
    beams.push(m);
    scene.add(m);
  }

  // motes: fireflies, sparks, dust
  const N = 900, pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 70;
    pos[i * 3 + 1] = Math.random() * 16;
    pos[i * 3 + 2] = -Math.random() * 55 + 6;
    seed[i] = Math.random();
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  moteGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const motes = new THREE.Points(moteGeo, new THREE.ShaderMaterial({
    vertexShader: MOTE_VERT, fragmentShader: MOTE_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uSize: { value: 3 }, uRise: { value: 0.2 }, uColor: { value: c() }, uAmt: { value: 0 } },
  }));
  scene.add(motes);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.5, 0.3);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // live state: everything below is lerped toward by the page's tweens
  const state = { colors: Object.fromEntries(COLOR_KEYS.map((k) => [k, new THREE.Color()])), nums: {} };

  function apply() {
    const s = state.colors, n = state.nums, su = sky.material.uniforms, gu = ground.material.uniforms;
    su.uTop.value.copy(s.top); su.uMid.value.copy(s.mid); su.uHorizon.value.copy(s.horizon);
    su.uSunA.value.copy(s.sunA); su.uSunB.value.copy(s.sunB); su.uStar.value.copy(s.star);
    su.uSunY.value = n.sunY; su.uSunR.value = n.sunR; su.uStripes.value = n.stripes; su.uStars.value = n.stars; su.uGlow.value = n.glow;
    gu.uFill.value.copy(s.fill); gu.uGrid.value.copy(s.grid); gu.uGrid2.value.copy(s.grid2); gu.uAmp.value = n.amp; gu.uLine.value = n.line;
    beams.forEach((b) => { b.material.uniforms.uColor.value.copy(s[`beam${b.userData.colorIndex}`]); b.material.uniforms.uAmt.value = n.beams; b.position.y = n.sunY; });
    motes.material.uniforms.uColor.value.copy(s.mote); motes.material.uniforms.uAmt.value = n.motes; motes.material.uniforms.uRise.value = n.rise;
    bloom.strength = n.bloom * 0.62;
    bloom.threshold = n.thresh;
  }

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => { pointer.tx = e.clientX / innerWidth - 0.5; pointer.ty = e.clientY / innerHeight - 0.5; }, { passive: true });

  let scrollKick = 0;
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w, h);
    camera.aspect = w / h;
    // keep the horizon composed on tall phones
    camera.fov = w / h < 0.8 ? 72 : 55;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  const clock = new THREE.Clock();
  let travel = 0, running = true;
  function frame() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    apply();
    const motion = reducedMotion ? 0 : 1;
    travel += dt * state.nums.speed * (1 + scrollKick) * 4 * motion;
    scrollKick *= 0.92;
    ground.material.uniforms.uOff.value = travel;
    sky.material.uniforms.uTime.value = t * motion;
    motes.material.uniforms.uTime.value = t * motion;
    beams.forEach((b) => { b.rotation.z = b.userData.base + Math.sin(t * 0.35 * motion + b.userData.phase) * 0.12; });
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    camera.position.x = pointer.x * 1.6;
    camera.position.y = 2.4 - pointer.y * 0.6;
    camera.lookAt(0, 9.5, -60);
    composer.render();
    requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) { clock.getDelta(); requestAnimationFrame(frame); }
  });

  return {
    state,
    start() { apply(); requestAnimationFrame(frame); },
    kick(v) { scrollKick = Math.min(3, scrollKick + v); },
  };
}
