// Atrium 5AM: a vaulted glass conservatory around the valley. Lantern-brass ribs,
// Fresnel glass panes, and ~340 procedural fronds that sway. Fades in with the set.
import * as THREE from "three";

// seeded randomness so the garden is the same for everyone
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

const R = 14, RISE = 1.15, Z0 = -3, Z1 = -54;
class Arch extends THREE.Curve {
  constructor(z) { super(); this.z = z; }
  getPoint(t, target = new THREE.Vector3()) {
    const a = Math.PI * t;
    return target.set(Math.cos(a) * R, Math.sin(a) * R * RISE, this.z);
  }
}

export function createGreenhouse(scene) {
  const group = new THREE.Group();
  group.visible = false;
  scene.add(group);
  const U = {
    uFade: { value: 0 }, uTime: { value: 0 },
    uFrame: { value: new THREE.Color() }, uGlass: { value: new THREE.Color() },
    uLeafDark: { value: new THREE.Color() }, uSky: { value: new THREE.Color() },
  };

  // ---- frame: arches + purlins
  const frameMat = new THREE.ShaderMaterial({
    uniforms: U, transparent: true,
    vertexShader: /* glsl */ `varying vec3 vN; void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uFrame; uniform float uFade; varying vec3 vN;
      void main() { float l = 0.45 + 0.55 * max(dot(vN, normalize(vec3(0.2, 0.9, 0.6))), 0.0); gl_FragColor = vec4(max(uFrame * l, 0.0), uFade); }`,
  });
  for (let i = 0; i <= 7; i++) group.add(new THREE.Mesh(new THREE.TubeGeometry(new Arch(Z0 - i * ((Z0 - Z1) / 7)), 72, 0.09, 6), frameMat));
  for (const t of [0.04, 0.2, 0.36, 0.5, 0.64, 0.8, 0.96]) {
    const a = Math.PI * t, x = Math.cos(a) * R, y = Math.sin(a) * R * RISE;
    group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(x, y, Z0), new THREE.Vector3(x, y, Z1)), 1, 0.05, 5), frameMat));
  }

  // ---- glass vault
  const glassGeo = new THREE.PlaneGeometry(1, 1, 56, 28);
  const p = glassGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) + 0.5, v = p.getY(i) + 0.5, a = Math.PI * u;
    p.setXYZ(i, Math.cos(a) * R, Math.sin(a) * R * RISE, Z0 + (Z1 - Z0) * v);
  }
  glassGeo.computeVertexNormals();
  const glass = new THREE.Mesh(glassGeo, new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec3 vN, vV, vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - w.xyz);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uGlass, uSky; uniform float uFade, uTime; varying vec3 vN, vV, vW;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 3.0);
        // long soft reflections sliding along the panes
        float streak = smoothstep(0.92, 1.0, sin(vW.x * 0.35 + vW.y * 0.5 + vW.z * 0.08 + uTime * 0.05)) * 0.5;
        vec3 col = mix(uGlass, uSky, 0.35) * (0.5 + f * 1.4 + streak);
        float a = (0.035 + f * 0.26 + streak * 0.08) * uFade;
        gl_FragColor = vec4(max(col, 0.0), clamp(a, 0.0, 1.0));
      }`,
  }));
  group.add(glass);

  // ---- plants: instanced fronds
  const leafGeo = new THREE.PlaneGeometry(1, 0.32, 12, 1);
  leafGeo.translate(0.5, 0, 0);
  const plants = [], rand = rng(5);
  // two beds along the valley + a back row of taller palms
  for (let k = 0; k < 44; k++) {
    const side = k % 2 ? 1 : -1, back = k >= 34;
    plants.push({
      x: side * (back ? 4 + rand() * 7 : 3.2 + rand() * 8.5),
      z: back ? -36 - rand() * 16 : -9 - rand() * 40,
      size: back ? 5 + rand() * 2.5 : 2.4 + rand() * 2.6,
      leaves: back ? 16 : 10 + Math.floor(rand() * 6),
    });
  }
  const total = plants.reduce((n, pl) => n + pl.leaves, 0);
  const fronds = new THREE.InstancedMesh(leafGeo, new THREE.ShaderMaterial({
    uniforms: U, transparent: true, side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      uniform float uTime; varying vec2 vUv; varying vec3 vCol; varying float vShade;
      void main() {
        vUv = uv;
        vec3 p = position;
        float x = uv.x;
        p.y -= x * x * 0.55;                       // fronds droop toward the tip
        vec4 w = instanceMatrix * vec4(p, 1.0);
        float sway = sin(uTime * 0.8 + w.x * 0.6 + w.z * 0.35) * 0.07 * x * x;
        w.x += sway; w.y += sway * 0.4;
        #ifdef USE_INSTANCING_COLOR
          vCol = instanceColor;
        #else
          vCol = vec3(0.5, 0.8, 0.5);
        #endif
        vShade = clamp(w.y / 6.0, 0.0, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uLeafDark; uniform float uFade; varying vec2 vUv; varying vec3 vCol; varying float vShade;
      void main() {
        float half_w = pow(sin(3.14159 * vUv.x), 0.7) * 0.5;
        float d = abs(vUv.y - 0.5);
        if (d > half_w) discard;
        float rib = smoothstep(0.03, 0.0, d) * 0.35;
        vec3 c = mix(uLeafDark, vCol, 0.3 + 0.55 * vUv.x + 0.15 * vShade) + vCol * rib;
        gl_FragColor = vec4(max(c, 0.0), uFade);
      }`,
  }), total);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), pos = new THREE.Vector3(), scl = new THREE.Vector3();
  let idx = 0;
  const tones = [];
  for (const pl of plants) {
    for (let j = 0; j < pl.leaves; j++) {
      const len = pl.size * (0.75 + rand() * 0.5);
      e.set(0, (j / pl.leaves) * Math.PI * 2 + rand() * 0.4, 0.55 + rand() * 0.6, "YZX");
      q.setFromEuler(e);
      pos.set(pl.x, 0.15, pl.z);
      scl.set(len, len * (0.8 + rand() * 0.4), len);
      fronds.setMatrixAt(idx, m.compose(pos, q, scl));
      tones.push(rand());
      idx++;
    }
  }
  fronds.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(total * 3), 3);
  group.add(fronds);

  const leafA = new THREE.Color(), leafB = new THREE.Color(), tmp = new THREE.Color();
  return {
    update(fade, t, colors) {
      U.uFade.value = fade;
      group.visible = fade > 0.01;
      if (!group.visible) return;
      U.uTime.value = t;
      U.uFrame.value.copy(colors.frame);
      U.uGlass.value.copy(colors.glass);
      U.uLeafDark.value.copy(colors.leafDark);
      U.uSky.value.copy(colors.top);
      // recolor fronds only when the palette moves
      if (!leafA.equals(colors.leafA) || !leafB.equals(colors.leafB)) {
        leafA.copy(colors.leafA); leafB.copy(colors.leafB);
        tones.forEach((tone, i) => fronds.setColorAt(i, tmp.copy(leafA).lerp(leafB, tone)));
        fronds.instanceColor.needsUpdate = true;
      }
    },
  };
}
