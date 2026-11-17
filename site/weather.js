// Weather that lives in the world: drifting fog banks (the Warehouse, the night market)
// and the lightning bolt that cracks across the sky when the set changes.
// Lens weather (sun flare, dew) lives in the post pass in scene.js.
import * as THREE from "three";

const FOG_FRAG = /* glsl */ `
uniform vec3 uColor, uTint; uniform float uFog, uTime, uLayer;
varying vec3 vW;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
void main() {
  vec2 q = vW.xz * 0.055 + vec2(uTime * 0.018 * (1.0 + uLayer), uTime * 0.01) + uLayer * 7.3;
  float n = fbm(q + fbm(q * 1.7) * 0.8);
  float near = smoothstep(6.0, -2.0, vW.z);            // thin out right at the lens
  float far = 1.0 - smoothstep(-58.0, -46.0, vW.z) * 0.0;
  float a = smoothstep(0.38, 0.8, n) * uFog * 0.5 * near * far;
  gl_FragColor = vec4(max(mix(uColor, uTint, n * 0.55), 0.0), clamp(a, 0.0, 1.0));
}`;

export function createWeather(scene, camera) {
  // ---- fog banks: stacked horizontal layers seen at a grazing angle
  const fogU = { uColor: { value: new THREE.Color() }, uTint: { value: new THREE.Color() }, uFog: { value: 0 }, uTime: { value: 0 } };
  const fogs = [0.8, 1.9, 3.2, 4.8].map((y, i) => {
    const geo = new THREE.PlaneGeometry(170, 72);
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      uniforms: { ...fogU, uLayer: { value: i } }, transparent: true, depthWrite: false,
      vertexShader: /* glsl */ `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: FOG_FRAG,
    }));
    mesh.position.set(0, y, -26);
    mesh.renderOrder = 2;
    scene.add(mesh);
    return mesh;
  });

  // ---- lightning: a forked bolt, alive for a few frames per transition
  const boltMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const bolts = [0, 1, 2].map(() => {
    const line = new THREE.Line(new THREE.BufferGeometry(), boltMat);
    line.visible = false;
    scene.add(line);
    return line;
  });
  let boltAge = 99, boltPeak = 1;
  function zigzag(from, to, steps, jag) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = from.clone().lerp(to, t);
      if (i > 0 && i < steps) { p.x += (Math.random() - 0.5) * jag; p.y += (Math.random() - 0.5) * jag * 0.4; }
      pts.push(p);
    }
    return pts;
  }
  function strike(color, intensity = 1) {
    boltPeak = intensity;
    const x = (Math.random() - 0.5) * 50, top = new THREE.Vector3(x, 46, -60), ground = new THREE.Vector3(x + (Math.random() - 0.5) * 18, 1.5, -60);
    const main = zigzag(top, ground, 22, 4.2);
    bolts[0].geometry.setFromPoints(main);
    // a second strand hugging the first reads as thickness once bloom catches it
    bolts[1].geometry.setFromPoints(main.map((p) => p.clone().add(new THREE.Vector3(0.12, 0.05, 0))));
    const at = main[8 + Math.floor(Math.random() * 6)];
    bolts[2].geometry.setFromPoints(zigzag(at, at.clone().add(new THREE.Vector3((Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 8), -14, 0)), 9, 3));
    boltMat.color.copy(color);
    boltAge = 0;
  }

  return {
    strike,
    update(dt, t, nums, colors) {
      fogU.uFog.value = nums.fog;
      fogU.uTime.value = t;
      fogU.uColor.value.copy(colors.fog);
      fogU.uTint.value.copy(colors.beam0);
      fogs.forEach((f) => (f.visible = nums.fog > 0.01));
      // bolt flickers: on, off, on, gone
      boltAge += dt;
      const on = boltAge < 0.07 || (boltAge > 0.11 && boltAge < 0.2);
      boltMat.opacity = on ? boltPeak : 0;
      bolts.forEach((b) => (b.visible = boltAge < 0.25));
    },
    get flashing() { return boltAge < 0.25; },
  };
}
