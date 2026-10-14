/** More small things: games, clothes, health, money, and odds and ends. */
import { beam, box, cylinder, extrude, hex, lathe, mix, Mesh, plane, sphere, texture, type RGB, type Vec3 } from '../mesh.ts';
import type { Model } from './index.ts';

const RAD = Math.PI / 180;
const WHITE: RGB = [1, 1, 1];
const BLACK: RGB = [0, 0, 0];

/** A ring lying flat around the y axis: handles, hat bands, the ring on a pacifier. */
function torus(radius: number, tube: number, c: RGB | string, sides = 12, sweep = 360) {
  const profile = Array.from({ length: 9 }, (_, i): [number, number] => [radius + tube * Math.cos((i / 8) * Math.PI * 2), tube * Math.sin((i / 8) * Math.PI * 2)]);
  return lathe(profile, sides, c, sweep);
}

/** A cone or tapered rod from one point to another: pick tips, claws, tassels. */
function spike(from: Vec3, to: Vec3, r: number, c: RGB | string, top = 0, sides = 6) {
  const d: Vec3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
  const length = Math.hypot(...d);
  return cylinder(r, length, sides, c, top)
    .rotate(Math.acos(d[1] / length) / RAD, Math.atan2(d[0], d[2]) / RAD)
    .move(...from);
}

/** Moves every vertex through `fn`, then re-smooths: curled brims, creased crowns. */
function warp(m: Mesh, fn: (p: Vec3) => Vec3) {
  m.move(0, 0, 0); // gives every vertex its own position, so each one moves once
  return m
    .paint((p, c) => {
      [p[0], p[1], p[2]] = fn([...p]);
      return c;
    })
    .smooth();
}

/** A lathe in two colors: `below` under the line at `level`, `above` over it (wine, milk, potions). */
function filled(profile: [number, number][], level: number, sides: number, below: RGB | string, above: RGB | string) {
  const split = profile.findIndex(([, y]) => y >= level);
  const [r0, y0] = profile[split - 1];
  const [r1, y1] = profile[split];
  const cut: [number, number] = [r0 + ((r1 - r0) * (level - y0)) / (y1 - y0), level];
  return [lathe([...profile.slice(0, split), cut], sides, below), lathe([cut, ...profile.slice(split)], sides, above)];
}

const GLASS = '#dcecf8';

function wineglass(color = '#c0103c') {
  const level = 1.18;
  const wine = hex(color);
  return Mesh.of(
    lathe([[0.02, 0], [0.44, 0], [0.44, 0.05], [0.18, 0.09], [0.08, 0.16], [0.08, 0.7], [0.14, 0.78]], 12, GLASS),
    ...filled([[0.14, 0.78], [0.34, 0.84], [0.49, 0.97], [0.55, 1.17], [0.55, 1.36], [0.5, 1.6], [0.46, 1.6], [0.51, 1.36], [0.51, 1.18]], level, 12, wine, GLASS),
    cylinder(0.52, 0.01, 12, mix(wine, WHITE, 0.12)).move(0, level - 0.01, 0),
    // A glint down the bowl is what says "glass".
    lathe([[0.56, 0.98], [0.565, 1.17], [0.565, 1.36], [0.515, 1.56]], 2, '#ffffff', 14).glow().rotate(0, -34),
  ).paint((p, c) => (p[1] < level && p[1] > 0.78 ? mix(c, BLACK, (level - p[1]) * 0.9) : c));
}

function coffeecup() {
  const china = '#f8f5ef';
  const m = Mesh.of(
    lathe([[0.02, 0], [0.5, 0], [0.8, 0.08], [0.88, 0.16], [0.82, 0.17], [0.5, 0.1], [0.02, 0.1]], 14, china),
    lathe([[0.02, 0.1], [0.32, 0.1], [0.45, 0.24], [0.53, 0.55], [0.57, 0.86], [0.52, 0.86], [0.5, 0.74]], 14, china),
    cylinder(0.51, 0.01, 14, '#4a2412').move(0, 0.73, 0),
    torus(0.2, 0.065, china, 10).rotate(90).move(0.6, 0.5, 0),
  );
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    m.add(sphere(0.12 - 0.05 * t, 8, '#ffffff').move(0.12 * Math.sin(t * 5), 1.0 + t * 0.8, 0).glow());
  }
  return m;
}

/** A round sweet in a twist of wrapper, lying along x. */
function candy(color = '#ff2f86') {
  const swirl = texture(8, 8, (x, y) => ((x + y) % 4 < 2 ? hex(color) : hex('#ffffff')));
  const end = (side: number) =>
    lathe([[0.04, 0], [0.12, 0.1], [0.36, 0.42], [0.44, 0.5], [0.3, 0.52], [0.04, 0.46]], 7, mix(hex(color), WHITE, 0.25))
      .rotate(0, 0, -90 * side)
      .move(side * 0.46, 0, 0);
  return Mesh.of(sphere(0.52, 12, '#ffffff').material({ tex: swirl }).rotate(0, 0, 90).scale(1.12, 1, 1), end(1), end(-1)).rotate(0, 0, 18);
}

function babybottle(color = '#4ab0ff') {
  const m = Mesh.of(
    ...filled([[0.02, 0], [0.44, 0], [0.5, 0.06], [0.5, 1.0], [0.44, 1.06]], 0.72, 12, '#fff7e6', '#d6ecff'),
    cylinder(0.48, 0.26, 12, color).move(0, 1.02, 0),
    lathe([[0.38, 1.28], [0.3, 1.33], [0.16, 1.38], [0.11, 1.5], [0.13, 1.62], [0.1, 1.72], [0.02, 1.75]], 10, '#f1c27c'),
  );
  for (let i = 0; i < 3; i++) m.add(box(i === 1 ? 0.12 : 0.2, 0.05, 0.03, color).move(-0.06, 0.3 + i * 0.2, 0.49));
  return m;
}

function pacifier(color = '#ff6fae') {
  const shield = Array.from({ length: 20 }, (_, i): [number, number] => {
    const a = (i / 20) * Math.PI * 2;
    const r = 0.52 + 0.22 * Math.cos(2 * a);
    return [r * Math.cos(a), r * Math.sin(a) * 1.1];
  });
  return Mesh.of(
    extrude(shield, 0.08, color, 0.03).smooth(40),
    cylinder(0.17, 0.14, 10, mix(hex(color), WHITE, 0.45)).rotate(90).move(0, 0, 0.02),
    torus(0.23, 0.07, '#8fd8ff', 12).rotate(0, 0, 90).move(0, -0.02, 0.34),
    lathe([[0.11, 0], [0.1, 0.14], [0.2, 0.36], [0.23, 0.56], [0.15, 0.72], [0.02, 0.76]], 8, '#f4d28e').rotate(-90).move(0, 0, -0.03),
  ).rotate(-8);
}

/** An Erlenmeyer flask of glowing green potion, bubbling over. */
function flask(color = '#5cff5a') {
  const potion = hex(color);
  const [liquid, glass] = filled([[0.02, 0], [0.6, 0], [0.66, 0.06], [0.62, 0.18], [0.22, 0.95], [0.17, 1.04], [0.17, 1.44], [0.23, 1.5], [0.23, 1.56], [0.14, 1.56], [0.14, 1.4], [0.02, 1.4]], 0.6, 12, potion, GLASS);
  const m = Mesh.of(liquid.glow(), glass);
  for (const [x, y, z, r] of [[0.25, 0.58, 0.32, 0.1], [-0.2, 0.6, 0.34, 0.08], [0.06, 1.72, 0.04, 0.11], [-0.06, 1.98, 0, 0.08], [0.06, 2.18, 0, 0.06]]) m.add(sphere(r, 8, mix(potion, WHITE, 0.3)).move(x, y, z).glow());
  return m;
}

function pill(color = '#ff3340') {
  const half = (c: RGB | string, r: number) => lathe([[0.02, 0], [r, 0], [r, 0.5], [r * 0.9, 0.66], [r * 0.6, 0.79], [0.02, 0.84]], 12, c);
  return Mesh.of(half(color, 0.31), half('#f6f3ee', 0.3).rotate(180)).rotate(0, 0, 90 - 38);
}

function gradcap() {
  const black = '#2a2c3c';
  const gold = '#ffc93a';
  const m = Mesh.of(
    lathe([[0.02, -0.44], [0.46, -0.44], [0.5, 0], [0.02, 0]], 12, black),
    box(1.5, 0.08, 1.5, black).move(0, 0.04, 0),
    cylinder(0.08, 0.05, 8, gold).move(0, 0.08, 0),
    beam([0, 0.1, 0], [0.72, 0.1, 0.72], 0.06, gold),
  )
    .rotate(0, 45, 0)
    .rotate(20);
  const corner: Vec3 = [1.04, 0.05, 0.04];
  return m.add(beam(corner, [1.04, -0.36, 0.04], 0.06, gold), cylinder(0.11, 0.34, 8, gold, 0.05).rotate(180).move(1.04, -0.34, 0.04));
}

function helmet(color = '#68783a') {
  const olive = hex(color);
  const strap = '#c9a86a';
  const shell = lathe([[0.02, 0.08], [0.92, 0.06], [1.06, 0], [1.04, 0.07], [0.96, 0.22], [0.94, 0.5], [0.86, 0.78], [0.68, 1.0], [0.38, 1.14], [0.02, 1.18]], 14, olive)
    .paint((p, c) => (p[1] < 0.07 && Math.hypot(p[0], p[2]) < 0.93 ? mix(c, BLACK, 0.6) : mix(c, BLACK, 0.25 * (1 - p[1]))))
    .scale(1, 1, 1.12);
  return Mesh.of(
    shell,
    lathe([[0.97, 0.36], [0.97, 0.52], [0.93, 0.52], [0.93, 0.36]].map(([r, y]): [number, number] => [r + 0.025, y]), 14, mix(olive, BLACK, 0.45)).scale(1, 1, 1.12),
    torus(0.94, 0.055, strap, 12, 180).rotate(90, 0, -90).scale(1, 0.9, 1).rotate(-40).move(0, 0.16, 0.05),
    box(0.2, 0.14, 0.1, '#6a5030').rotate(-40).move(0, -0.49, 0.6),
  ).rotate(-12);
}

/**
 * A felt hat: crown and brim in one lathe, then bent. `bend(out, x, z)` lifts the brim by how
 * far out from the crown and which way round each vertex is; `dent` creases the crown.
 */
function hat(profile: [number, number][], crownR: number, felt: string, band: string, bend: (out: number, x: number, z: number) => number, dent: number) {
  const m = warp(lathe(profile, 14, felt), ([x, y, z]) => {
    const r = Math.hypot(x, z) || 1;
    if (r > crownR + 0.01) return [x, y + bend(r - crownR, x / r, z / r), z];
    const top = Math.max(0, y - 0.55);
    return [x * (1 - top * 0.2 * Math.max(0, z / r)), y - dent * top * Math.max(0, 1 - Math.abs(x) / crownR), z];
  });
  return m.add(cylinder(crownR + 0.015, 0.14, 14, band).move(0, 0.17, 0));
}

function fedora(color = '#3d4250') {
  return hat(
    [[0.02, 0.1], [0.98, 0.1], [1.02, 0.15], [0.8, 0.16], [0.56, 0.17], [0.54, 0.55], [0.5, 0.78], [0.36, 0.86], [0.2, 0.8], [0.02, 0.76]],
    0.56,
    color,
    '#121218',
    (out, x, z) => out * (0.22 * -z + 0.12 * x * x),
    0.35,
  );
}

function cowboyhat(color = '#e6b066') {
  return hat(
    [[0.02, 0.1], [1.2, 0.1], [1.24, 0.15], [1.0, 0.16], [0.8, 0.17], [0.58, 0.17], [0.56, 0.7], [0.5, 0.92], [0.32, 0.98], [0.16, 0.9], [0.02, 0.88]],
    0.58,
    color,
    '#5b3a1f',
    (out, x, z) => out * out * 0.9 * x * x - out * 0.12 * z * z,
    0.5,
  );
}

function partyhat(color = '#e8308a') {
  const stripes = texture(16, 16, (x, y) => ((x + y) % 8 < 3 ? hex('#ffe14a') : hex(color)));
  const m = Mesh.of(
    lathe([[0.02, 0.02], [0.55, 0], [0.42, 0.35], [0.29, 0.7], [0.15, 1.05], [0.03, 1.4]], 12, '#ffffff').material({ tex: stripes }),
    torus(0.55, 0.07, '#46c8ff', 14),
  );
  // A fluffy pom-pom: a ball with a few smaller balls around it.
  for (let i = 0; i < 7; i++) m.add(sphere(0.1, 6, '#ffe14a').move(0.08 * Math.cos(i * 1.8), 1.44 + 0.08 * Math.sin(i * 1.8) + (i % 2) * 0.04, 0.08 * Math.sin(i * 2.6)));
  return m.add(sphere(0.12, 8, '#ffe14a').move(0, 1.48, 0));
}

/** A ringer tee, front on: a puffed body, two sleeves, and a trimmed collar and cuffs. */
function tshirt(color = '#e8262b') {
  const trim = '#f4f1ea';
  const neck = Array.from({ length: 7 }, (_, i): [number, number] => {
    const a = (-15 - i * 25) * RAD;
    return [0.2 * Math.cos(a), 0.7 + 0.2 * Math.sin(a)];
  });
  const body: [number, number][] = [[0.48, -0.72], [0.5, 0.3], [0.58, 0.54], ...neck, [-0.58, 0.54], [-0.5, 0.3], [-0.48, -0.72]];
  const sleeve: [number, number][] = [[0.48, 0.12], [0.86, -0.04], [1.0, 0.3], [0.58, 0.54]];
  const m = Mesh.of(
    extrude(body, 0.3, color, 0.08).smooth(40),
    extrude([...neck].reverse(), 0.04, mix(hex(color), BLACK, 0.55)).move(0, 0, -0.1),
    torus(0.2, 0.05, trim, 10, 180).rotate(90, 0, -90).move(0, 0.7, 0.02),
    beam([-0.2, 0.7, -0.1], [0.2, 0.7, -0.1], 0.07, trim),
  );
  for (const s of [1, -1]) {
    const side = sleeve.map(([x, y]): [number, number] => [s * x, y]);
    m.add(extrude(s > 0 ? side : side.reverse(), 0.26, color, 0.04).smooth(40));
    m.add(beam([s * 0.86, -0.04, 0], [s * 1.0, 0.3, 0], 0.08, trim, 0.28));
  }
  return m;
}

/** One theater mask: a shallow shell with the face painted on. */
function mask(happy: boolean, color: string) {
  const rows = 9;
  const shape = (y: number) => 0.5 * Math.sqrt(Math.max(0.004, 1 - (y / 0.64) ** 2)) * (y < 0 ? 1 + 0.3 * y : 1);
  const profile = Array.from({ length: rows }, (_, j): [number, number] => {
    const y = -0.62 + (1.24 * j) / (rows - 1);
    return [Math.max(0.03, shape(y)), y];
  });
  const ink = hex('#2a1408');
  const face = texture(16, 16, (i, j) => {
    const Y = -0.62 + 1.24 * (((j + 0.5) / 16) * rows) / (rows - 1);
    const X = -Math.cos(((i + 0.5) / 16) * Math.PI) * shape(Y);
    const eye = (s: number) => {
      const [dx, dy] = [X - s * 0.2, Y - 0.12];
      const tilt = happy ? 0 : -s * 0.5;
      const [u, v] = [dx * Math.cos(tilt) + dy * Math.sin(tilt), -dx * Math.sin(tilt) + dy * Math.cos(tilt)];
      return (u / 0.15) ** 2 + (v / 0.09) ** 2 < 1 && (happy ? v > -0.03 : v < 0.03);
    };
    const mouth = happy ? Math.hypot(X, (Y + 0.14) / 0.8) < 0.3 && Y < -0.14 : Math.hypot(X / 0.24, (Y + 0.46) / 0.22) < 1 && Math.hypot(X / 0.12, (Y + 0.46) / 0.1) > 1 && Y > -0.46;
    return eye(1) || eye(-1) || mouth ? ink : hex(color);
  });
  return lathe(profile, 10, '#ffffff', 180).material({ tex: face, twoSided: true }).rotate(0, -90).scale(1, 1, 0.45);
}

function masks() {
  return Mesh.of(mask(true, '#ffc83a').rotate(0, -10, 14).move(-0.32, 0, 0.2), mask(false, '#7fb0ff').rotate(0, 12, -14).move(0.36, 0.18, -0.15));
}

function matryoshka(color = '#d8262e') {
  const red = hex(color);
  const flower = Array.from({ length: 20 }, (_, i): [number, number] => {
    const a = (i / 20) * Math.PI * 2;
    const r = 0.14 + 0.1 * Math.abs(Math.cos(a * 2.5));
    return [r * Math.cos(a), r * Math.sin(a)];
  });
  const m = Mesh.of(
    lathe([[0.02, 0], [0.5, 0], [0.6, 0.1], [0.64, 0.35], [0.6, 0.6], [0.5, 0.82], [0.42, 0.95], [0.44, 1.05], [0.46, 1.2], [0.42, 1.38], [0.3, 1.52], [0.12, 1.6], [0.02, 1.61]], 14, red).paint((p, c) => mix(c, BLACK, Math.max(0, 0.3 - p[1] * 0.5))),
    sphere(1, 10, '#ffe2c8').scale(0.3, 0.27, 0.14).move(0, 1.22, 0.36),
    sphere(1, 8, '#6a3a1a').scale(0.28, 0.1, 0.12).move(0, 1.42, 0.36),
    sphere(1, 6, '#c8102e').scale(0.05, 0.03, 0.03).move(0, 1.1, 0.49),
    extrude(flower, 0.04, '#ffe14a', 0.06).move(0, 0.42, 0.62),
    sphere(0.08, 8, '#ff7a1a').move(0, 0.42, 0.7),
  );
  for (const s of [1, -1]) {
    m.add(sphere(0.045, 6, '#1a1a2a').move(s * 0.1, 1.25, 0.49), sphere(0.055, 6, '#ff7a8a').move(s * 0.18, 1.14, 0.45));
    m.add(sphere(1, 6, '#2fae4a').scale(0.12, 0.06, 0.04).rotate(0, 0, s * 30).move(s * 0.3, 0.22, 0.56));
  }
  return m;
}

function suitcase(color = '#9a5530') {
  const strap = mix(hex(color), BLACK, 0.45);
  const brass = '#e8c25a';
  const m = Mesh.of(box(1.4, 1.0, 0.5, color).move(0, 0.5, 0));
  for (const x of [-0.38, 0.38]) m.add(box(0.12, 1.02, 0.52, strap).move(x, 0.5, 0), box(0.14, 0.1, 0.06, brass).move(x, 0.82, 0.26));
  for (const [x, y] of [[0.66, 0.06], [-0.66, 0.06], [0.66, 0.94], [-0.66, 0.94]]) m.add(box(0.14, 0.14, 0.54, brass).move(x, y, 0));
  m.add(beam([-0.22, 1.0, 0], [-0.2, 1.2, 0], 0.08, strap), beam([0.22, 1.0, 0], [0.2, 1.2, 0], 0.08, strap), beam([-0.24, 1.2, 0], [0.24, 1.2, 0], 0.09, strap));
  m.add(cylinder(0.15, 0.02, 12, '#ffd23a').rotate(90).move(-0.06, 0.62, 0.25));
  m.add(box(0.26, 0.18, 0.02, '#3f8cff').rotate(0, 0, -10).move(0.12, 0.34, 0.255));
  m.add(box(0.2, 0.14, 0.02, '#ffffff').rotate(0, 0, 12).move(-0.15, 0.28, 0.255));
  m.add(box(0.16, 0.2, 0.02, '#2fbf6a').rotate(0, 0, 6).move(0.56, 0.5, 0.255));
  return m;
}

const SEVEN = ['........', '.######.', '.######.', '....##..', '...##...', '...##...', '..##....', '........'];

function slotmachine(color = '#d8262e') {
  const gold = '#ffc93a';
  const seven = texture(8, 8, (x, y) => (SEVEN[y][x] === '#' ? hex('#e01020') : hex('#ffffff')));
  const m = Mesh.of(
    box(1.1, 0.24, 0.8, '#3a3a48').move(0, 0.12, 0),
    box(1.0, 1.2, 0.7, color).move(0, 0.84, 0),
    box(0.9, 0.42, 0.06, '#1a1a24').move(0, 0.98, 0.35),
    box(1.04, 0.1, 0.32, gold).move(0, 0.56, 0.42),
    lathe([[0.02, 0], [0.38, 0], [0.38, 0.06], [0.3, 0.22], [0.02, 0.26]], 12, gold, 180).rotate(0, -90).scale(1.3, 1, 0.9).move(0, 1.44, 0),
    sphere(0.1, 8, '#fff6a0').glow().move(0, 1.6, 0.16),
  );
  for (const x of [-0.29, 0, 0.29]) m.add(plane(0.26, 0.34, '#ffffff', seven).glow().move(x, 0.98, 0.385));
  m.add(box(0.12, 0.22, 0.2, '#3a3a48').move(0.56, 0.86, 0));
  m.add(beam([0.62, 0.86, 0], [0.7, 1.5, 0.06], 0.07, '#c9ced6'));
  return m.add(sphere(0.13, 10, '#ff2a2a').move(0.7, 1.55, 0.06));
}

function pickaxe() {
  const steel = '#b9c1cc';
  const m = Mesh.of(
    beam([0, -1.0, 0], [0, 0.56, 0], 0.13, '#8a5a2b'),
    box(0.22, 0.22, 0.17, '#8a9099').move(0, 0.6, 0),
  );
  for (const s of [1, -1]) m.add(spike([0, 0.62, 0], [s * 0.5, 0.56, 0], 0.11, steel, 0.08), spike([s * 0.49, 0.56, 0], [s * 0.92, 0.32, 0], 0.08, steel, 0));
  return m.rotate(0, 0, -38);
}

function hammer() {
  const steel = '#b9c1cc';
  const m = Mesh.of(
    beam([0, -0.5, 0], [0, 0.5, 0], 0.14, '#c08a4a'),
    beam([0, -1.05, 0], [0, -0.46, 0], 0.18, '#d8262e'),
    box(0.26, 0.28, 0.2, steel).move(0, 0.6, 0),
    spike([-0.1, 0.6, 0], [-0.48, 0.6, 0], 0.13, steel, 0.14, 8),
    spike([-0.46, 0.6, 0], [-0.54, 0.6, 0], 0.16, steel, 0.16, 8),
    spike([0.1, 0.64, 0], [0.38, 0.62, 0], 0.11, steel, 0.08).scale(1, 1, 0.8),
    spike([0.37, 0.62, 0], [0.62, 0.42, 0], 0.08, steel, 0).scale(1, 1, 0.8),
  );
  return m.rotate(0, 0, -38);
}

export const THINGS = {
  wineglass: { build: wineglass },
  coffeecup: { build: coffeecup, turn: -10 },
  candy: { build: candy, float: true, turn: 10 },
  babybottle: { build: babybottle, turn: 10 },
  pacifier: { build: pacifier, float: true, turn: -95 },
  flask: { build: flask },
  pill: { build: pill, float: true, turn: 15 },
  gradcap: { build: gradcap, float: true },
  helmet: { build: helmet, float: true, turn: -30 },
  fedora: { build: fedora, turn: -15 },
  cowboyhat: { build: cowboyhat, turn: -10 },
  partyhat: { build: partyhat },
  tshirt: { build: tshirt, float: true, turn: 15 },
  masks: { build: masks, float: true, turn: 10 },
  matryoshka: { build: matryoshka, turn: 10 },
  suitcase: { build: suitcase, turn: -25 },
  slotmachine: { build: slotmachine, turn: -20 },
  pickaxe: { build: pickaxe, float: true, turn: 15 },
  hammer: { build: hammer, float: true, turn: 15 },
} satisfies Record<string, Model>;
