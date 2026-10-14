/** Animals, aliens, robots and other characters. */
import { beam, box, cylinder, extrude, hex, lathe, mix, Mesh, normalize, plane, polygon, sphere, sub, texture, type Vec3, type Vertex } from '../mesh.ts';
import type { Model } from './index.ts';

const EYE = '#14100e';
const RAD = Math.PI / 180;

/** Moves every vertex, for shapes the primitives can't make (a ghost's wavy hem). Re-smooth after. */
function warp(m: Mesh, fn: (p: Vec3) => Vec3) {
  const seen = new Set<Vertex>();
  for (const t of m.tris) for (const v of t.v) if (!seen.has(v)) seen.add(v), (v.p = fn(v.p));
  return m;
}

function horse() {
  const coat = '#b0662e';
  const dark = '#3b2414';
  const m = Mesh.of(
    sphere(1, 10, coat).scale(0.66, 0.3, 0.26).move(0, 1.05, 0),
    beam([0.42, 1.1, 0], [0.78, 1.62, 0], 0.26, coat, 0.2),
    beam([0.72, 1.72, 0], [1.08, 1.42, 0], 0.2, coat, 0.17),
    beam([0.4, 1.32, 0], [0.74, 1.8, 0], 0.08, dark, 0.1),
    beam([-0.56, 1.18, 0], [-0.82, 0.62, 0], 0.11, dark),
  );
  for (const [x, z] of [[0.42, 0.12], [0.42, -0.12], [-0.42, 0.12], [-0.42, -0.12]]) {
    m.add(beam([x, 0.98, z], [x + (x > 0 ? 0.04 : -0.02), 0.1, z], 0.11, coat), beam([x, 0.12, z], [x, 0, z], 0.12, dark));
  }
  for (const z of [0.05, -0.05]) m.add(cylinder(0.04, 0.14, 4, coat, 0).move(0.74, 1.8, z));
  m.add(box(0.03, 0.04, 0.2, '#111').move(0.86, 1.66, 0));
  return m;
}

function rat() {
  const fur = '#6e625c';
  const pink = '#e3a3ad';
  const m = Mesh.of(
    sphere(1, 10, fur).scale(0.5, 0.3, 0.3).move(0, 0.32, 0),
    cylinder(0.24, 0.48, 8, fur, 0.03).rotate(0, 0, -90).move(0.32, 0.36, 0),
    sphere(0.05, 6, pink).move(0.8, 0.36, 0),
  );
  for (const z of [0.12, -0.12]) {
    m.add(cylinder(0.14, 0.04, 8, pink).rotate(90, 0, 10).move(0.42, 0.6, z));
    m.add(box(0.05, 0.05, 0.05, '#111').move(0.6, 0.45, z * 0.7));
  }
  const tail: [number, number, number][] = [[-0.45, 0.28, 0], [-0.8, 0.12, 0.1], [-1.1, 0.06, 0.32], [-1.3, 0.06, 0.6]];
  tail.slice(1).forEach((p, i) => m.add(beam(tail[i], p, 0.075, pink)));
  for (const [x, z] of [[0.25, 0.15], [0.25, -0.15], [-0.25, 0.17], [-0.25, -0.17]]) m.add(box(0.1, 0.06, 0.08, pink).move(x, 0.03, z));
  return m;
}

interface Beast {
  coat: string;
  /** Half-length, half-height and half-width of the body, and the height of its middle. */
  body: [number, number, number, number];
  /** Leg radius. `feet` colors the bottom of each leg up to a height: socks, hooves, paws. */
  leg: number;
  feet?: [string, number];
  /** Where the head sits (x, y), and its radius. */
  head: [number, number, number];
  /** Snout length, its radius at the face and at the nose, and its color. */
  snout: [number, number, number, string?];
  /** Points the neck bends through on its way from the shoulders to the head. */
  neck?: [number, number][];
}

/**
 * A four-legged animal in profile, running along +x: an egg of a body on four legs, a neck
 * up to a round head, and a snout. Each animal adds its own ears, tail and markings.
 */
function beast({ coat, body: [bx, by, bz, y], leg, feet, head: [hx, hy, hr], snout: [len, r0, r1, muzzle = coat], neck = [] }: Beast) {
  const m = Mesh.of(sphere(1, 10, coat).scale(bx, by, bz).move(0, y, 0), sphere(hr, 10, coat).move(hx, hy, 0));
  const path: [number, number][] = [[bx * 0.6, y + by * 0.15], ...neck, [hx, hy]];
  path.slice(1).forEach(([x, py], i) => m.add(beam([path[i][0], path[i][1], 0], [x, py, 0], hr * 1.25, coat, hr * 1.1)));
  for (const x of [bx * 0.6, -bx * 0.6]) {
    for (const z of [bz * 0.5, -bz * 0.5]) {
      m.add(cylinder(leg, y, 8, coat, leg * 1.2).move(x, 0, z));
      if (feet) m.add(cylinder(leg * 1.1, feet[1], 8, feet[0], leg * 1.1).move(x, 0, z));
    }
  }
  m.add(cylinder(r0, len, 8, muzzle, r1).rotate(0, 0, -90).move(hx + hr * 0.4, hy - hr * 0.2, 0));
  m.add(sphere(Math.min(0.09, Math.max(r1 * 0.7, 0.045)), 6, EYE).move(hx + hr * 0.4 + len, hy - hr * 0.2 + r1 * 0.3, 0));
  for (const z of [1, -1]) m.add(sphere(hr * 0.17, 6, EYE).move(hx + hr * 0.5, hy + hr * 0.32, z * hr * 0.72));
  return m;
}

/** A pointed ear: a four-sided cone, darker at the tip. */
const ear = (r: number, h: number, coat: string, tip: string) =>
  cylinder(r, h, 4, coat, 0).paint((p, c) => (p[1] > h * 0.55 ? hex(tip) : c)).scale(1, 1, 0.55);

/** A bushy tail lying along -x from the origin; `tip` colors the end. */
const brush = (length: number, r: number, coat: string, tip?: string) =>
  sphere(1, 10, coat).scale(length / 2, r, r).paint((p, c) => (tip && p[0] < -length * 0.22 ? hex(tip) : c)).move(-length / 2, 0, 0);

/** A golden retriever, Mopac. 'serra' is a Serra da Estrela mountain dog: bigger, fluffier, fawn with a dark mask. */
function dog(variant?: string) {
  if (variant === 'serra') {
    const coat = '#cf9450';
    const fluff = '#e2ad6a';
    const mask = '#2e2019';
    const m = beast({ coat, body: [0.68, 0.42, 0.38, 0.78], leg: 0.14, head: [0.9, 1.34, 0.36], snout: [0.26, 0.22, 0.18, mask] });
    m.paint((p, c) => (p[0] > 1.0 && p[1] > 1.1 ? mix(c, hex(mask), Math.min(1, (p[0] - 1.0) * 5)) : c));
    m.add(sphere(1, 10, fluff).scale(0.36, 0.5, 0.5).move(0.6, 1.06, 0));
    for (const z of [1, -1]) {
      m.add(sphere(1, 8, '#6e4528').scale(0.14, 0.22, 0.09).rotate(0, 0, -20).move(0.8, 1.32, z * 0.32));
      m.add(sphere(1, 8, fluff).scale(0.3, 0.34, 0.16).move(-0.42, 0.66, z * 0.26));
    }
    m.add(brush(0.9, 0.2, fluff).rotate(0, 0, 45).move(-0.6, 1.0, 0));
    m.add(sphere(1, 8, '#ef6f88').scale(0.07, 0.12, 0.06).move(1.25, 1.06, 0));
    return m;
  }
  const coat = '#dc9e45';
  const pale = '#f3cc86';
  const m = beast({ coat, body: [0.62, 0.3, 0.27, 0.72], leg: 0.09, head: [0.82, 1.24, 0.27], snout: [0.3, 0.15, 0.11, pale] });
  m.add(sphere(1, 8, '#e8b462').scale(0.24, 0.32, 0.25).move(0.52, 0.84, 0));
  for (const z of [1, -1]) m.add(sphere(1, 8, '#b8722c').scale(0.12, 0.25, 0.07).rotate(0, 0, -12).move(0.74, 1.13, z * 0.25));
  m.add(sphere(1, 6, '#ec6b84').scale(0.06, 0.11, 0.05).move(1.18, 1.0, 0));
  m.add(brush(0.75, 0.13, coat, pale).rotate(0, 0, -30).move(-0.55, 0.85, 0));
  return m;
}

function fox() {
  const coat = '#ec6a1c';
  const white = '#f8f0e4';
  const dark = '#2b1a14';
  const m = beast({ coat, body: [0.55, 0.22, 0.2, 0.52], leg: 0.07, feet: [dark, 0.34], head: [0.7, 0.86, 0.23], snout: [0.32, 0.13, 0.035] });
  m.paint((p, c) => (p[0] > 0.45 && p[1] < 0.8 && p[1] > 0.4 ? hex(white) : c));
  for (const z of [1, -1]) m.add(ear(0.12, 0.3, coat, dark).rotate(0, 0, -8).move(0.64, 1.02, z * 0.12));
  m.add(brush(1.0, 0.2, coat, white).rotate(0, 0, 18).move(-0.48, 0.6, 0));
  return m;
}

/** A gray wolf sitting on its haunches, howling. */
function wolf() {
  const coat = '#8e95a1';
  const dark = '#555c69';
  const m = Mesh.of(
    sphere(1, 10, coat).scale(0.5, 0.26, 0.24).rotate(0, 0, 42).move(0.02, 0.62, 0),
    sphere(1, 10, '#e1e4ea').scale(0.2, 0.3, 0.2).rotate(0, 0, 20).move(0.3, 0.86, 0),
    beam([0.3, 0.98, 0], [0.5, 1.4, 0], 0.3, coat, 0.26),
    sphere(0.25, 10, coat).move(0.52, 1.46, 0),
    cylinder(0.13, 0.36, 8, coat, 0.06).rotate(0, 0, -36).move(0.64, 1.4, 0),
    sphere(0.06, 6, EYE).move(0.85, 1.69, 0),
    brush(0.9, 0.17, coat, dark).rotate(0, 30, 0).move(-0.44, 0.15, 0.05),
  );
  for (const z of [1, -1]) {
    m.add(sphere(1, 8, coat).scale(0.3, 0.28, 0.14).move(-0.26, 0.32, z * 0.17), box(0.32, 0.1, 0.12, coat).move(-0.04, 0.05, z * 0.2));
    m.add(cylinder(0.075, 0.8, 8, coat, 0.09).move(0.34, 0, z * 0.11));
    m.add(ear(0.11, 0.26, coat, dark).rotate(0, 0, 28).move(0.38, 1.62, z * 0.13));
    m.add(sphere(0.042, 6, EYE).move(0.62, 1.58, z * 0.17));
  }
  return m;
}

function camel() {
  const coat = '#d3a062';
  const dark = '#9b6a3a';
  const m = beast({
    coat,
    body: [0.6, 0.3, 0.27, 1.25],
    leg: 0.075,
    feet: [dark, 0.08],
    head: [1.18, 1.85, 0.15],
    snout: [0.26, 0.12, 0.09],
    neck: [[0.95, 1.3]],
  });
  m.add(sphere(1, 10, coat).scale(0.4, 0.4, 0.24).move(-0.04, 1.5, 0));
  for (const x of [0.36, -0.36]) for (const z of [0.135, -0.135]) m.add(sphere(0.1, 6, coat).move(x, 0.6, z));
  for (const z of [1, -1]) m.add(sphere(1, 6, coat).scale(0.04, 0.08, 0.04).move(1.12, 2.0, z * 0.08));
  m.add(beam([-0.58, 1.3, 0], [-0.72, 0.85, 0], 0.07, dark));
  return m;
}

function beaver() {
  const fur = '#8a532d';
  const dark = '#3a2a24';
  const scales = texture(4, 4, (x, y) => ((x + y) % 2 ? hex('#5a4438') : hex('#3a2a24')));
  const m = beast({ coat: fur, body: [0.52, 0.32, 0.3, 0.38], leg: 0.08, feet: [dark, 0.08], head: [0.58, 0.6, 0.3], snout: [0.14, 0.19, 0.16, '#a8714a'] });
  for (const z of [1, -1]) m.add(sphere(0.08, 6, fur).move(0.5, 0.86, z * 0.18), box(0.06, 0.2, 0.085, '#fff6e0').move(0.83, 0.38, z * 0.046));
  m.add(sphere(1, 10, '#ffffff').scale(0.42, 0.06, 0.25).material({ tex: scales }).rotate(0, 0, -22).move(-0.85, 0.36, 0));
  return m;
}

/** A tapered tube from one point to another, with a ball at the far end to round the joint. */
function tube(from: Vec3, to: Vec3, r0: number, r1: number, c: string, sides = 8) {
  const d = sub(to, from);
  const [dx, dy, dz] = normalize(d);
  return Mesh.of(
    cylinder(r0, Math.hypot(...d), sides, c, r1).rotate(Math.acos(Math.max(-1, Math.min(1, dy))) / RAD, Math.atan2(dx, dz) / RAD).move(...from),
    sphere(r1, sides, c).move(...to),
  );
}

/** A diamond-shaped back plate standing up from `at`, lying along the direction `d`. */
function plate(at: Vec3, d: Vec3, size: number, c: string) {
  const [dx, dy, dz] = normalize(d[0] < 0 ? [-d[0], -d[1], -d[2]] : d);
  return extrude([[0, -0.1], [size * 0.55, size * 0.4], [0, size], [-size * 0.55, size * 0.4]], 0.06, c)
    .rotate(0, 0, Math.atan2(dy, Math.hypot(dx, dz)) / RAD)
    .rotate(0, Math.atan2(-dz, dx) / RAD, 0)
    .move(...at);
}

/** A friendly toy kaiju standing upright, facing +x, with plates down its back and a long curling tail. */
function dinosaur() {
  const green = '#4cb043';
  const belly = '#f8f47a';
  const yellow = '#f4e27a';
  const m = Mesh.of(
    sphere(1, 10, green).scale(0.48, 0.64, 0.42).rotate(0, 0, -12).move(0, 1.0, 0),
    sphere(1, 10, belly).scale(0.3, 0.5, 0.3).rotate(0, 0, -12).move(0.2, 0.95, 0),
    sphere(1, 10, green).scale(0.36, 0.3, 0.3).move(0.3, 1.78, 0),
    sphere(1, 10, green).scale(0.3, 0.19, 0.25).move(0.6, 1.7, 0),
  );
  for (const z of [1, -1]) {
    m.add(sphere(0.1, 8, '#ffffff').move(0.45, 1.9, z * 0.2), sphere(0.055, 6, EYE).move(0.52, 1.91, z * 0.23));
    m.add(sphere(1, 8, green).scale(0.26, 0.32, 0.2).move(-0.05, 0.62, z * 0.28), cylinder(0.15, 0.5, 8, green, 0.17).move(0.02, 0, z * 0.3));
    m.add(box(0.36, 0.12, 0.26, green).move(0.12, 0.06, z * 0.3));
    m.add(beam([0.28, 1.25, z * 0.3], [0.52, 1.08, z * 0.34], 0.1, green));
  }
  // The tail curls around toward the camera, so its length shows.
  const tail: [Vec3, number][] = [[[-0.3, 0.78, 0], 0.32], [[-0.78, 0.42, 0.06], 0.22], [[-1.18, 0.2, 0.3], 0.13], [[-1.4, 0.12, 0.66], 0.05]];
  tail.slice(1).forEach(([p, r], i) => {
    const [q, r0] = tail[i];
    m.add(tube(q, p, r0, r, green));
    m.add(plate([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + (r + r0) / 2 - 0.04, (p[2] + q[2]) / 2], sub(p, q), 0.1 + r0 * 0.5, yellow));
  });
  for (const [x, y, s] of [[0.18, 2.06, 0.22], [-0.12, 1.86, 0.28], [-0.36, 1.5, 0.3], [-0.5, 1.1, 0.26]]) {
    const a = Math.atan2(y - 1.0, x + 0.1);
    m.add(plate([x, y, 0], [Math.sin(a), -Math.cos(a), 0], s, yellow));
  }
  return m;
}

/** A red crab facing +z, claws up. */
function crab() {
  const red = '#e5432b';
  const pale = '#f6a273';
  const m = Mesh.of(sphere(1, 12, red).scale(0.64, 0.27, 0.46).paint((p, c) => (p[1] < -0.08 ? hex(pale) : c)).move(0, 0.46, 0));
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const [z, spread] = [0.14 - i * 0.2, 0.3 - i * 0.3];
      m.add(beam([s * 0.5, 0.42, z], [s * 0.9, 0.52, z + spread * 0.5], 0.09, red), beam([s * 0.9, 0.52, z + spread * 0.5], [s * 1.06, 0, z + spread], 0.08, red));
    }
    m.add(beam([s * 0.45, 0.5, 0.25], [s * 0.72, 0.68, 0.42], 0.12, red));
    m.add(sphere(1, 8, red).scale(0.2, 0.24, 0.16).move(s * 0.76, 0.86, 0.44));
    m.add(sphere(1, 8, red).scale(0.1, 0.26, 0.12).rotate(0, 0, s * 18).move(s * 0.86, 1.16, 0.44));
    m.add(sphere(1, 8, red).scale(0.07, 0.18, 0.09).rotate(0, 0, s * -28).move(s * 0.62, 1.08, 0.44));
    m.add(cylinder(0.04, 0.28, 6, red).move(s * 0.16, 0.62, 0.3), sphere(0.08, 8, EYE).move(s * 0.16, 0.92, 0.3));
  }
  return m;
}

/** A small round blue songbird, facing +x. */
function bird() {
  const blue = '#2f7fe6';
  const dark = '#1d4fb0';
  const m = Mesh.of(
    sphere(1, 10, blue).scale(0.5, 0.46, 0.44).move(0, 0.74, 0),
    sphere(0.32, 10, blue).move(0.34, 1.12, 0),
    sphere(1, 10, '#eef4ff').scale(0.34, 0.32, 0.32).move(0.2, 0.64, 0),
    cylinder(0.09, 0.22, 6, '#ffc21a', 0).rotate(0, 0, -90).move(0.6, 1.1, 0),
    extrude([[0, 0.05], [-0.5, 0.3], [-0.56, 0.1], [0, -0.05]], 0.1, dark).move(-0.36, 0.78, 0),
  );
  for (const z of [1, -1]) {
    m.add(sphere(1, 8, dark).scale(0.32, 0.2, 0.08).rotate(0, 0, -18).move(-0.08, 0.8, z * 0.42));
    m.add(sphere(0.06, 6, EYE).move(0.52, 1.2, z * 0.18));
    m.add(beam([0.05, 0.36, z * 0.12], [0.08, 0, z * 0.12], 0.06, '#f08a24'), box(0.18, 0.04, 0.06, '#f08a24').move(0.14, 0.02, z * 0.12));
  }
  return m;
}

/** A big glossy alien beetle with a rhino's horns, running along +x. */
function beetle() {
  const green = hex('#8cff3a');
  const purple = hex('#b23ce8');
  const dark = '#24163a';
  const shell = (z: number) =>
    sphere(1, 12, '#ffffff')
      .scale(0.66, 0.4, 0.27)
      .paint((p) => {
        const sheen = Math.max(0, 1 - Math.hypot(p[0] - 0.12, p[1] - 0.3, Math.abs(p[2]) - 0.08) / 0.32);
        return mix(mix(purple, green, Math.max(0, Math.min(1, p[1] * 2.2 + 0.1 - Math.abs(p[0]) * 0.6))), [1, 1, 1], sheen * 0.6);
      })
      .move(-0.2, 0.52, z);
  const m = Mesh.of(
    sphere(1, 10, dark).scale(0.7, 0.3, 0.48).move(-0.15, 0.42, 0),
    shell(0.24),
    shell(-0.24),
    sphere(1, 10, '#4a2a7a').scale(0.3, 0.26, 0.38).move(0.48, 0.52, 0),
    sphere(1, 8, dark).scale(0.18, 0.15, 0.2).move(0.76, 0.42, 0),
    cylinder(0.09, 0.62, 6, dark, 0.02).rotate(0, 0, -42).move(0.82, 0.44, 0),
    cylinder(0.08, 0.36, 6, dark, 0.02).rotate(0, 0, -66).move(0.6, 0.72, 0),
  );
  for (const z of [1, -1]) {
    m.add(sphere(0.05, 6, '#b6ff6a').glow().move(0.86, 0.48, z * 0.13));
    for (const x of [0.45, 0, -0.45]) m.add(beam([x, 0.36, z * 0.3], [x + 0.12, 0.42, z * 0.68], 0.08, dark), beam([x + 0.12, 0.42, z * 0.68], [x + 0.2, 0, z * 0.8], 0.07, dark));
  }
  return m;
}

/** A classic alien: big head, huge black almond eyes, slim body, facing +z and waving. */
function alien(skin = '#86d45a') {
  const m = Mesh.of(
    lathe([[0, 0], [0.12, 0.02], [0.26, 0.14], [0.42, 0.42], [0.5, 0.7], [0.47, 0.92], [0.34, 1.08], [0, 1.15]], 12, skin).scale(1, 1, 0.88).move(0, 1.2, 0),
    cylinder(0.08, 0.2, 6, skin).move(0, 1.08, 0),
    lathe([[0, 0], [0.18, 0.02], [0.24, 0.3], [0.2, 0.55], [0.12, 0.62], [0, 0.62]], 8, skin).move(0, 0.5, 0),
    box(0.1, 0.02, 0.04, '#2c4a22').move(0, 1.37, 0.32),
  );
  for (const s of [1, -1]) {
    m.add(sphere(1, 8, '#07070c').scale(0.22, 0.12, 0.08).rotate(0, 0, s * -32).rotate(0, s * 26, 0).move(s * 0.2, 1.64, 0.35));
    m.add(sphere(0.035, 4, '#ffffff').glow().move(s * 0.2 - 0.06, 1.69, 0.43));
    m.add(beam([s * 0.1, 0.55, 0], [s * 0.14, 0, 0.02], 0.11, skin), box(0.14, 0.06, 0.2, skin).move(s * 0.14, 0.03, 0.06));
  }
  m.add(beam([-0.2, 1.05, 0], [-0.4, 0.6, 0.04], 0.1, skin), beam([0.2, 1.05, 0], [0.72, 1.02, 0.06], 0.1, skin), beam([0.72, 1.02, 0.06], [0.84, 1.44, 0.08], 0.1, skin));
  m.add(sphere(0.08, 6, skin).move(0.85, 1.5, 0.08), sphere(0.08, 6, skin).move(-0.42, 0.56, 0.04));
  return m;
}

/** A cute round ghost with a wavy hem, facing +z. It glows faintly, shaded by hand. */
function ghost() {
  const white = hex('#fbfcff');
  const shade = hex('#aeb8e6');
  const body = lathe([[0.66, 0], [0.62, 0.25], [0.6, 0.6], [0.54, 0.95], [0.38, 1.22], [0.18, 1.36], [0, 1.4]], 24, '#ffffff');
  warp(body, ([x, y, z]) => [x, y + (y < 0.1 ? 0.14 * Math.cos(Math.atan2(x, z) * 6) : 0), z]).smooth();
  const m = Mesh.of(body.material({ twoSided: true }));
  for (const s of [1, -1]) m.add(sphere(1, 8, '#ffffff').scale(0.13, 0.22, 0.13).rotate(0, 0, s * 55).move(s * 0.64, 0.66, 0.08));
  m.paint((p) => mix(shade, white, Math.min(1, Math.max(0, p[1] / 1.1 + p[2] * 0.25 - p[0] * 0.15))));
  m.glow();
  for (const s of [1, -1]) m.add(sphere(1, 8, '#1c1a33').scale(0.09, 0.14, 0.05).move(s * 0.19, 0.98, 0.54), sphere(1, 6, '#ffb3c6').scale(0.08, 0.04, 0.03).glow().move(s * 0.32, 0.8, 0.54));
  m.add(sphere(1, 8, '#1c1a33').scale(0.07, 0.08, 0.04).move(0, 0.72, 0.6));
  return m;
}

/** A boxy toy robot facing +z, with a glowing face screen and an antenna. */
function robot(color = '#c3cbd6') {
  const dark = '#4a5260';
  const face = texture(8, 6, (x, y) => ((y === 2 && (x === 2 || x === 5)) || (y === 4 && x > 1 && x < 6) ? hex('#a8fff2') : hex('#123048')));
  const m = Mesh.of(
    box(0.96, 0.76, 0.64, color).move(0, 0.9, 0),
    cylinder(0.14, 0.14, 8, dark).move(0, 1.26, 0),
    box(0.84, 0.62, 0.6, color).move(0, 1.68, 0),
    plane(0.66, 0.44, '#ffffff', face).glow().move(0, 1.68, 0.305),
    box(0.52, 0.28, 0.02, dark).move(0, 0.94, 0.325),
    beam([0, 1.98, 0], [0, 2.28, 0], 0.07, dark),
    sphere(0.1, 8, '#ff4a3a').glow().move(0, 2.32, 0),
  );
  for (const [x, c] of [[-0.15, '#ff5a4a'], [0, '#ffd23a'], [0.15, '#5ae07a']] as const) m.add(box(0.1, 0.1, 0.03, c).glow().move(x, 0.96, 0.34));
  for (const s of [1, -1]) {
    m.add(cylinder(0.12, 0.08, 8, dark).rotate(0, 0, 90).move(s * 0.46, 1.68, 0));
    m.add(box(0.2, 0.62, 0.24, color).rotate(0, 0, s * 14).move(s * 0.64, 0.86, 0), box(0.26, 0.18, 0.28, dark).move(s * 0.72, 0.5, 0));
    m.add(box(0.28, 0.36, 0.32, color).move(s * 0.24, 0.32, 0), box(0.34, 0.14, 0.44, dark).move(s * 0.24, 0.07, 0.04));
  }
  return m;
}

/**
 * Grooves on the side of a hemisphere, each from [around, up] to [around, up] in degrees
 * (back is -90, front +90), wiggling as it goes.
 */
const SULCI: [number, number, number, number, number][] = [
  [80, -26, -20, 8, 2],
  [6, 86, -4, 16, 3],
  [56, 78, 46, 12, 3],
  [-36, 80, -48, 8, 3],
  [-68, 50, -86, -16, 2],
  [50, -46, -40, -18, 2],
  [86, 40, 70, 14, 1],
  [30, 64, 24, 28, 2],
  [-16, 66, -20, 26, 2],
  [16, -58, -36, -46, 1],
];

/** A pink brain in profile, front toward +x: two hemispheres with their folds, and the cerebellum. */
function brain() {
  const pink = '#ff8fa6';
  const groove = '#a8304f';
  const m = new Mesh();
  for (const side of [1, -1]) {
    const [rx, ry, rz, cy, cz] = [0.76, 0.52, 0.3, 0.72, side * 0.3];
    const at = (t: number, f: number): Vec3 => [rx * 1.01 * Math.cos(f * RAD) * Math.sin(t * RAD), cy + ry * 1.01 * Math.sin(f * RAD), cz + side * rz * 1.03 * Math.cos(f * RAD) * Math.cos(t * RAD)];
    m.add(sphere(1, 12, pink).scale(rx, ry, rz).move(0, cy, cz));
    for (const [t0, f0, t1, f1, waves] of SULCI) {
      const [dt, df] = [t1 - t0, f1 - f0];
      const len = Math.hypot(dt, df);
      const steps = waves * 3;
      const pts = Array.from({ length: steps + 1 }, (_, i) => {
        const k = i / steps;
        const w = Math.sin(k * waves * Math.PI * 2) * 8;
        return [t0 + dt * k - (df / len) * w, f0 + df * k + (dt / len) * w];
      });
      // The far hemisphere only shows its top.
      pts.slice(1).forEach((q, i) => (side > 0 || Math.min(q[1], pts[i][1]) > 40) && m.add(beam(at(pts[i][0], pts[i][1]), at(q[0], q[1]), 0.055, groove)));
    }
  }
  const stripes = texture(2, 8, (_x, y) => (y % 2 ? hex(groove) : [1, 1, 1]));
  m.add(sphere(1, 10, '#f585a0').scale(0.34, 0.22, 0.5).material({ tex: stripes }).move(-0.5, 0.26, 0));
  m.add(cylinder(0.13, 0.42, 8, '#e97b95', 0.16).rotate(0, 0, 15).move(-0.16, 0, 0));
  return m;
}

/** A big white molar with two roots and a sparkle. */
function tooth() {
  const enamel = '#fbf8ef';
  const m = Mesh.of(
    lathe([[0.36, 0], [0.5, 0.16], [0.55, 0.42], [0.5, 0.62], [0.3, 0.7], [0, 0.66]], 10, enamel).scale(1, 1, 0.85).move(0, 0.8, 0),
    extrude(polygon(4, 0.2, 0.05), 0.02, '#ffffff').glow().move(-0.28, 1.25, 0.5),
  );
  for (const [x, z] of [[0.22, 0.18], [-0.22, 0.18], [0.22, -0.18], [-0.22, -0.18]]) m.add(sphere(0.22, 8, enamel).move(x, 1.36, z));
  for (const s of [1, -1]) m.add(cylinder(0.22, 0.85, 8, '#f3ead6', 0.08).rotate(180, 0, s * 12).move(s * 0.22, 0.86, 0), sphere(0.08, 6, '#f3ead6').move(s * 0.4, 0.04, 0));
  return m;
}

export const CREATURES = {
  horse: { build: horse, turn: 10 },
  rat: { build: rat, turn: -35 },
  dog: { build: dog, turn: -10 },
  fox: { build: fox, turn: -20 },
  wolf: { build: wolf, turn: -15 },
  camel: { build: camel, turn: -15 },
  beaver: { build: beaver, turn: -30 },
  dinosaur: { build: dinosaur, turn: -10 },
  crab: { build: crab, turn: -10 },
  bird: { build: bird, turn: -15 },
  beetle: { build: beetle, turn: -25 },
  alien: { build: alien, turn: 10 },
  ghost: { build: ghost, float: true, turn: 5 },
  robot: { build: robot, turn: -10 },
  brain: { build: brain, float: true, turn: 10 },
  tooth: { build: tooth, float: true, turn: -20 },
} satisfies Record<string, Model>;
