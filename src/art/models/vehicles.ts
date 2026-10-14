/** Things that move: cars, boats, aircraft, spacecraft. */
import { beam, box, cross, cylinder, extrude, hex, lathe, mix, Mesh, normalize, plane, sphere, sub, texture, type Tri, type Vec3 } from '../mesh.ts';
import type { Model } from './index.ts';

function tram() {
  const yellow = '#f4c20d';
  const cream = '#f4ecd6';
  const m = Mesh.of(
    box(2.1, 0.6, 0.86, yellow).move(0, 0.5, 0),
    box(2.04, 0.46, 0.82, cream).move(0, 1.03, 0),
    box(2.16, 0.07, 0.9, '#e9e4d8').move(0, 1.3, 0),
    box(1.5, 0.1, 0.5, '#cfc9bd').move(0, 1.38, 0),
    box(2.12, 0.06, 0.88, '#7a5a1a').move(0, 0.78, 0),
    beam([-0.5, 1.42, 0], [0.75, 2.1, 0], 0.035, '#333'),
  );
  for (let i = 0; i < 5; i++) for (const z of [0.42, -0.42]) m.add(box(0.28, 0.3, 0.02, '#2c3f55').move(-0.72 + i * 0.36, 1.05, z));
  for (const x of [1.03, -1.03]) m.add(box(0.02, 0.3, 0.6, '#2c3f55').move(x, 1.05, 0));
  m.add(box(0.04, 0.1, 0.16, '#fff3b0').glow().move(1.07, 0.55, 0));
  for (const x of [-0.6, 0.6]) m.add(box(0.5, 0.2, 0.8, '#222').move(x, 0.1, 0));
  return m;
}

function spaceship() {
  const hull = '#e6e9ef';
  const accent = '#3f6fd8';
  const m = Mesh.of(
    lathe([[0, 0], [0.28, 0.1], [0.34, 0.7], [0.3, 1.3], [0.14, 1.9], [0, 2.05]], 10, hull).rotate(0, 0, -90).move(-1, 0, 0),
    sphere(1, 10, '#7fd0ff').scale(0.34, 0.16, 0.16).move(0.4, 0.24, 0),
  );
  for (const side of [1, -1]) {
    m.add(extrude([[-0.8, 0], [0.2, 0], [-0.55, 1.15], [-0.85, 1.15]], 0.06, accent).rotate(90 * side, 0, 0).rotate(side * -8).move(0, -0.02, side * 0.2));
    m.add(cylinder(0.12, 0.6, 8, '#9aa1ac').rotate(0, 0, -90).move(-1.1, 0, side * 0.42));
    m.add(cylinder(0.09, 0.02, 8, '#ffb347').glow().rotate(0, 0, 90).move(-1.11, 0, side * 0.42));
  }
  m.add(cylinder(0.2, 0.02, 10, '#8fe3ff').glow().rotate(0, 0, 90).move(-1.01, 0, 0));
  m.add(extrude([[-0.85, 0], [-0.4, 0], [-0.8, 0.5]], 0.05, accent).move(0, 0.2, 0));
  return m;
}

function caravel() {
  const wood = '#7a4a26';
  const dark = '#4f2f18';
  const sail = texture(16, 16, (x, y) => {
    const [cx, cy] = [Math.abs(x - 7.5), Math.abs(y - 7.5)];
    const arm = (a: number, b: number) => a < 1.6 + b * 0.32 && b < 6.5;
    return arm(cx, cy) || arm(cy, cx) ? hex('#c8231f') : hex('#f2e6c8');
  });
  const m = Mesh.of(
    lathe([[0, 0], [0.38, 0.12], [0.5, 0.7], [0.48, 1.5], [0.3, 2.2], [0, 2.5]], 10, wood, 180).rotate(0, 0, -90).scale(1, 0.9, 1).move(-1.2, 0.5, 0),
    box(2.3, 0.04, 0.82, '#a87444').move(0, 0.5, 0),
    box(0.75, 0.42, 0.82, wood).move(-0.85, 0.7, 0),
    box(0.4, 0.26, 0.6, wood).move(0.8, 0.62, 0),
  );
  m.add(box(2.4, 0.06, 0.86, dark).move(0, 0.48, 0));
  for (const [x, h, w] of [[0.15, 2.3, 1.3], [-0.6, 1.8, 0.95], [0.85, 1.4, 0.65]] as const) {
    m.add(cylinder(0.04, h, 6, dark).move(x, 0.5, 0));
    m.add(plane(w * 0.9, w, '#ffffff', sail).material({ twoSided: true }).rotate(0, 90, 0).move(x + 0.06, 0.5 + h - w * 0.62, 0));
    m.add(beam([x + 0.05, 0.5 + h - w * 0.1, -w * 0.5], [x + 0.05, 0.5 + h - w * 0.1, w * 0.5], 0.03, dark));
  }
  m.add(beam([1.1, 0.6, 0], [1.6, 0.95, 0], 0.04, dark));
  m.add(plane(0.22, 0.14, '#ffffff', texture(2, 2, (x) => (x ? hex('#c8231f') : hex('#2a7a3a')))).material({ twoSided: true }).rotate(0, 90, 0).move(0.15, 2.92, 0.1));
  return m;
}

const GLASS = '#2c3f55';
const TIRE = '#262626';

/** Flat polygons, each fanned from its first point and wound counter-clockwise seen from outside (or `twoSided`, for faceted shells). */
function polys(faces: [Vec3[], string][], twoSided = false) {
  const tris: Tri[] = [];
  for (const [pts, c] of faces) {
    for (let i = 1; i < pts.length - 1; i++) {
      const v = [pts[0], pts[i], pts[i + 1]];
      const n = cross(sub(v[1], v[0]), sub(v[2], v[0]));
      if (Math.hypot(...n) < 1e-9) continue;
      tris.push({ m: { lit: true, twoSided }, v: v.map((p) => ({ p: [...p], n: normalize(n), c: hex(c), uv: [0, 0] })) as Tri['v'] });
    }
  }
  return new Mesh(tris);
}

/**
 * A hull that floats: flat at the waterline, given stations from stern to bow as
 * [x, half-width at the deck, deck height, half-width at the waterline], with its sides
 * painted in bands of [top as a fraction of the height, color].
 */
function hull(stations: [number, number, number, number][], deck: string, bands: [number, string][]) {
  const faces: [Vec3[], string][] = [];
  const at = ([x, w, h, b]: number[], t: number, side: number): Vec3 => [x, h * t, side * (b + (w - b) * t)];
  const [stern, bow] = [stations[0], stations[stations.length - 1]];
  const pairs = stations.slice(1).map((s, i) => [stations[i], s]);
  let t0 = 0;
  for (const [t1, c] of bands) {
    for (const [p, s] of pairs) faces.push([[at(p, t0, 1), at(s, t0, 1), at(s, t1, 1), at(p, t1, 1)], c], [[at(s, t0, -1), at(p, t0, -1), at(p, t1, -1), at(s, t1, -1)], c]);
    faces.push([[at(stern, t0, -1), at(stern, t0, 1), at(stern, t1, 1), at(stern, t1, -1)], c], [[at(bow, t0, 1), at(bow, t0, -1), at(bow, t1, -1), at(bow, t1, 1)], c]);
    t0 = t1;
  }
  for (const [p, s] of pairs) faces.push([[at(p, 1, 1), at(s, 1, 1), at(s, 1, -1), at(p, 1, -1)], deck], [[at(p, 0, -1), at(s, 0, -1), at(s, 0, 1), at(p, 0, 1)], deck]);
  return polys(faces).smooth(40);
}

/** A wheel on an axle along z, centered on the origin. */
function wheel(r: number, w: number, hub = '#c9ced6') {
  return Mesh.of(cylinder(r, w, 10, TIRE), cylinder(r * 0.5, w + 0.02, 8, hub).move(0, -0.01, 0)).move(0, -w / 2, 0).rotate(90);
}

/** A lathe profile laid along +x, from its first point at the back to its last at the front. */
const along = (profile: [number, number][], sides: number, c: string) => lathe(profile, sides, c).rotate(0, 0, -90);

/** A flame or exhaust plume pointing down from the origin, white-hot at the base. */
function flame(r: number, length: number, hot = '#fff4b0', cool = '#ff5a1f') {
  return lathe([[0, -length], [r * 0.6, -length * 0.6], [r, -length * 0.25], [r * 0.9, 0], [0, 0]], 8, hot)
    .paint((p) => mix(hex(hot), hex(cool), Math.min(1, -p[1] / length) ** 0.8))
    .glow();
}

/** A box delivery truck: a cab and a tall cargo box. */
function truck() {
  const white = '#f4f6f8';
  const blue = '#2457c8';
  const m = Mesh.of(
    box(2.5, 0.16, 0.84, '#3a3d42').move(-0.2, 0.32, 0),
    box(1.75, 1.32, 1.04, white).move(-0.5, 1.06, 0),
    box(1.77, 0.24, 1.06, blue).move(-0.5, 0.96, 0),
    extrude([[0, 0], [0.64, 0], [0.68, 0.42], [0.52, 0.84], [0, 0.84]], 0.98, white).move(0.42, 0.4, 0),
    box(0.66, 0.16, 1.0, blue).move(0.76, 0.52, 0),
    beam([1.096, 0.864, 0], [0.966, 1.204, 0], 0.86, GLASS, 0.02),
    box(0.34, 0.3, 1.0, GLASS).move(0.72, 1.02, 0),
    box(0.12, 0.14, 1.02, '#9aa0a8').move(1.08, 0.36, 0),
  );
  for (const z of [0.34, -0.34]) m.add(box(0.03, 0.1, 0.18, '#fff3b0').glow().move(1.095, 0.52, z));
  for (const x of [0.78, -0.95]) for (const z of [0.4, -0.4]) m.add(wheel(0.28, 0.24).move(x, 0.28, z));
  return m;
}

/** A small, rounded European hatchback. */
function car(color = '#d8262c') {
  const trim = '#33373d';
  const m = Mesh.of(
    extrude([[-0.88, 0.14], [0.8, 0.14], [0.92, 0.24], [0.94, 0.38], [0.86, 0.5], [0.6, 0.58], [0.36, 0.62], [-0.84, 0.64], [-0.92, 0.5], [-0.92, 0.26]], 0.8, color, 0.1).smooth(70),
    extrude([[-0.8, 0.6], [0.4, 0.6], [0.2, 0.84], [0.06, 0.9], [-0.66, 0.9], [-0.78, 0.78]], 0.74, GLASS, 0.04).smooth(70),
    extrude([[-0.7, 0.88], [0.1, 0.88], [0.02, 0.96], [-0.62, 0.96]], 0.78, color, 0.04).smooth(70),
    box(0.1, 0.3, 0.8, color).move(-0.26, 0.75, 0),
    box(0.1, 0.12, 0.92, trim).move(0.92, 0.2, 0),
    box(0.1, 0.12, 0.92, trim).move(-0.9, 0.2, 0),
  );
  for (const z of [0.26, -0.26]) {
    m.add(cylinder(0.08, 0.04, 8, '#fff6c8').glow().rotate(0, 0, -90).move(0.9, 0.4, z));
    m.add(box(0.04, 0.12, 0.12, '#9e1212').move(-0.92, 0.46, z));
  }
  for (const x of [0.54, -0.56]) for (const z of [0.36, -0.36]) m.add(wheel(0.22, 0.2).move(x, 0.22, z));
  return m;
}

/** An open-wheel race car with front and rear wings. */
function racecar(color = '#d81e1e') {
  const carbon = '#24262b';
  const m = Mesh.of(
    hull([[-1.0, 0.14, 0.3, 0.14], [-0.45, 0.16, 0.34, 0.16], [-0.35, 0.34, 0.28, 0.34], [0.05, 0.34, 0.26, 0.34], [0.2, 0.16, 0.34, 0.16], [0.75, 0.1, 0.24, 0.1], [1.25, 0.05, 0.12, 0.05]], color, [[1, color]]).move(0, 0.1, 0),
    extrude([[-0.95, 0.38], [0.1, 0.38], [0.04, 0.66], [-0.12, 0.7]], 0.22, color),
    sphere(0.11, 8, '#ffd400').move(0.24, 0.52, 0),
    box(0.32, 0.06, 1.25, color).move(1.14, 0.1, 0),
    box(0.36, 0.1, 0.84, color).move(-1.06, 0.82, 0),
    box(0.28, 0.05, 0.8, carbon).move(-1.06, 0.5, 0),
    box(0.1, 0.4, 0.06, carbon).move(-1.0, 0.55, 0),
  );
  for (const s of [1, -1]) {
    m.add(box(0.36, 0.2, 0.05, carbon).move(1.14, 0.15, 0.64 * s), box(0.38, 0.52, 0.05, carbon).move(-1.06, 0.6, 0.42 * s));
    m.add(wheel(0.24, 0.26).move(0.72, 0.24, 0.5 * s), wheel(0.28, 0.34).move(-0.7, 0.28, 0.5 * s));
    for (const x of [0.72, -0.7]) m.add(beam([x, 0.32, 0.12 * s], [x, 0.26, 0.4 * s], 0.05, carbon));
  }
  return m;
}

/** A container ship: colorful stacks of containers, and the bridge at the stern. */
function cargoship() {
  const white = '#f2f2ee';
  const m = Mesh.of(
    hull([[-1.5, 0.44, 0.5, 0.4], [-1.1, 0.5, 0.5, 0.48], [0.85, 0.5, 0.52, 0.46], [1.3, 0.34, 0.58, 0.22], [1.62, 0, 0.64, 0]], '#56606a', [[0.26, '#b8322a'], [1, '#1f3a5c']]),
    box(0.44, 0.64, 0.86, white).move(-1.2, 0.8, 0),
    box(0.4, 0.16, 1.06, white).move(-1.16, 1.18, 0),
    box(0.02, 0.07, 0.94, GLASS).move(-0.955, 1.19, 0),
    beam([-1.36, 1.0, 0], [-1.44, 1.42, 0], 0.3, '#e0502c', 0.26),
  );
  for (const y of [0.72, 0.92]) m.add(box(0.02, 0.06, 0.7, GLASS).move(-0.975, y, 0));
  const colors = ['#d9412b', '#2f6fd1', '#f2b51c', '#3a9a52', '#ef7d22', '#2ba3a8'];
  [3, 3, 3, 2].forEach((tiers, bay) => {
    for (const z of [0.2, -0.2]) for (let t = 0; t < tiers; t++) m.add(box(0.38, 0.22, 0.38, colors[(bay * 5 + t * 2 + (z > 0 ? 1 : 3)) % colors.length]).move(-0.62 + bay * 0.42, 0.62 + t * 0.235, z));
  });
  return m;
}

/** A navy destroyer: angular superstructure, a mast, and a gun turret on the foredeck. */
function warship() {
  const gray = '#66717d';
  const light = '#a9b2bd';
  const top = '#c3cad3';
  const dark = '#4b535c';
  return Mesh.of(
    hull([[-1.55, 0.36, 0.42, 0.3], [-0.6, 0.42, 0.44, 0.34], [0.5, 0.42, 0.46, 0.32], [1.1, 0.28, 0.52, 0.14], [1.6, 0, 0.6, 0]], '#626b75', [[0.16, '#2c3136'], [1, gray]]),
    hull([[-0.95, 0.3, 0.36, 0.34], [0.2, 0.3, 0.36, 0.34], [0.42, 0.16, 0.34, 0.3]], top, [[1, light]]).move(0, 0.44, 0),
    hull([[-0.35, 0.2, 0.3, 0.26], [0.1, 0.2, 0.3, 0.26], [0.28, 0.12, 0.28, 0.24]], top, [[1, light]]).move(0, 0.8, 0),
    box(0.02, 0.07, 0.3, GLASS).move(0.29, 1.0, 0),
    hull([[-0.75, 0.12, 0.34, 0.16], [-0.45, 0.12, 0.34, 0.16], [-0.35, 0.06, 0.3, 0.12]], dark, [[1, light]]).move(0, 0.8, 0),
    cylinder(0.1, 0.8, 4, light, 0.03).move(-0.15, 1.08, 0),
    beam([-0.15, 1.55, -0.3], [-0.15, 1.55, 0.3], 0.06, light),
    box(0.14, 0.12, 0.34, dark).move(-0.15, 1.72, 0),
    extrude([[0, 0], [0.44, 0], [0.36, 0.2], [0.08, 0.25]], 0.38, light).move(0.62, 0.46, 0),
    cylinder(0.065, 0.62, 6, light).rotate(0, 0, -80).move(0.98, 0.58, 0),
  );
}

/** A fast motorboat with a pointed bow and a raked windshield. */
function speedboat() {
  const red = '#d62828';
  return Mesh.of(
    hull([[-0.95, 0.4, 0.36, 0.3], [-0.2, 0.44, 0.4, 0.32], [0.4, 0.4, 0.44, 0.24], [0.85, 0.24, 0.48, 0.08], [1.15, 0, 0.5, 0]], '#f4f1ea', [[0.4, '#ffffff'], [0.62, red], [1, '#ffffff']]),
    extrude([[-0.4, 0], [0.4, 0], [0.32, 0.26], [-0.32, 0.26]], 0.03, '#7fb0d8').rotate(0, 90, 0).rotate(0, 0, 32).move(0.22, 0.42, 0),
    box(0.22, 0.16, 0.24, red).move(-0.05, 0.47, 0.18),
    box(0.22, 0.16, 0.24, red).move(-0.05, 0.47, -0.18),
    box(0.2, 0.16, 0.72, red).move(-0.7, 0.45, 0),
    box(0.12, 0.5, 0.12, '#2a2d33').move(-1.03, 0.25, 0),
    box(0.24, 0.18, 0.26, '#2a2d33').move(-1.02, 0.56, 0),
  ).rotate(0, 0, 5);
}

/** A surfaced submarine: the top of its hull, a tall sail with planes, and a rudder. */
function submarine() {
  const steel = '#4f5964';
  const dark = '#3b434c';
  return Mesh.of(
    lathe([[0, 0], [0.1, 0.12], [0.24, 0.5], [0.36, 1.0], [0.42, 1.6], [0.42, 2.4], [0.36, 2.75], [0.22, 2.93], [0, 3.0]], 12, steel, 180).rotate(0, 0, 90).rotate(0, 180, 0).move(-1.5, 0, 0).scale(1, 0.75, 1),
    hull([[-0.32, 0.07, 0.62, 0.09], [-0.1, 0.13, 0.64, 0.15], [0.16, 0.13, 0.64, 0.15], [0.32, 0.07, 0.62, 0.1], [0.4, 0, 0.6, 0]], dark, [[1, steel]]).move(0.45, 0.22, 0),
    box(0.22, 0.06, 0.74, steel).move(0.55, 0.66, 0),
    beam([0.62, 0.84, 0], [0.62, 1.08, 0], 0.05, dark),
    sphere(0.05, 6, '#ff5040').glow().move(0.62, 1.1, 0),
    extrude([[-1.48, 0], [-1.1, 0], [-1.26, 0.36], [-1.46, 0.38]], 0.06, steel).move(0, 0.08, 0),
    box(0.26, 0.05, 0.8, steel).move(-1.3, 0.06, 0),
  );
}

/** A tank: treads with road wheels, a hull, a turret and a long gun. */
function tank() {
  const olive = '#5d6b2e';
  const dark = '#454f22';
  const m = Mesh.of(
    extrude([[-1.1, 0.3], [0.92, 0.3], [1.18, 0.5], [0.62, 0.66], [-1.1, 0.66]], 1.36, olive),
    box(1.9, 0.3, 0.7, dark).move(0, 0.3, 0),
    hull([[-0.65, 0.4, 0.34, 0.46], [0.2, 0.42, 0.34, 0.48], [0.5, 0.22, 0.3, 0.32]], olive, [[1, olive]]).move(-0.15, 0.64, 0),
    box(0.18, 0.24, 0.34, dark).move(0.38, 0.82, 0),
    cylinder(0.065, 1.3, 8, olive).rotate(0, 0, -90).move(0.42, 0.82, 0),
    cylinder(0.09, 0.18, 8, dark).rotate(0, 0, -90).move(1.58, 0.82, 0),
    cylinder(0.14, 0.08, 8, dark).move(-0.45, 0.96, 0.18),
  );
  for (const s of [1, -1]) {
    m.add(extrude([[-1.06, 0.12], [-0.86, 0], [0.84, 0], [1.1, 0.22], [1.02, 0.42], [-1.08, 0.42]], 0.32, '#2e302c').move(0, 0, 0.5 * s));
    for (let i = 0; i < 5; i++) m.add(cylinder(0.14, 0.06, 8, dark).rotate(90).move(-0.7 + i * 0.35, 0.17, s > 0 ? 0.65 : -0.71));
  }
  return m;
}

/** A military helicopter: a rounded body, tail boom, chunky rotor blades and skids. */
function helicopter(color = '#4c5a28') {
  const dark = '#262a20';
  const m = Mesh.of(
    sphere(1, 12, color).scale(0.78, 0.46, 0.42).move(0.1, 0.62, 0),
    sphere(1, 10, '#79b4e0').scale(0.42, 0.32, 0.34).move(0.55, 0.66, 0),
    cylinder(0.15, 1.5, 8, color, 0.07).rotate(0, 0, 90).move(-0.4, 0.74, 0),
    extrude([[-0.22, 0], [0.1, 0], [-0.06, 0.42], [-0.3, 0.46]], 0.06, color).move(-1.78, 0.74, 0),
    box(0.2, 0.05, 0.56, color).move(-1.55, 0.74, 0),
    cylinder(0.07, 0.2, 6, dark).move(0.05, 1.02, 0),
    cylinder(0.14, 0.08, 8, dark).move(0.05, 1.2, 0),
    box(0.26, 0.06, 1.2, color).move(0.05, 0.5, 0),
  );
  for (let i = 0; i < 4; i++) m.add(box(1.3, 0.05, 0.17, dark).move(0.7, 0, 0).rotate(0, 45 + i * 90, 0).move(0.05, 1.26, 0));
  for (const a of [45, -45]) m.add(box(0.09, 0.5, 0.03, dark).rotate(0, 0, a).move(-1.86, 0.98, 0.06));
  for (const z of [0.6, -0.6]) m.add(cylinder(0.09, 0.42, 8, dark).rotate(0, 0, -90).move(-0.15, 0.44, z));
  for (const z of [0.34, -0.34]) {
    m.add(beam([-0.45, 0.06, z], [0.6, 0.06, z], 0.07, dark), beam([0.6, 0.06, z], [0.75, 0.14, z], 0.07, dark));
    for (const x of [-0.2, 0.35]) m.add(beam([x, 0.06, z], [x + 0.04, 0.32, z * 0.7], 0.05, dark));
  }
  return m.rotate(12, 0, -5);
}

/** A passenger jet: white fuselage, swept wings, two engines and a colored tail. */
function airliner(tail = '#1f4fb8') {
  const white = '#f4f6f9';
  const gray = '#c9ced6';
  const m = Mesh.of(
    along([[0, 0], [0.07, 0.06], [0.17, 0.45], [0.23, 0.9], [0.24, 1.3], [0.24, 2.2], [0.2, 2.5], [0.12, 2.68], [0, 2.75]], 10, white).move(-1.35, 0, 0),
    box(1.15, 0.05, 0.5, GLASS).move(0.17, 0.07, 0),
    box(0.12, 0.06, 0.4, GLASS).move(1.12, 0.1, 0),
    extrude([[-1.3, 0], [-0.78, 0], [-1.1, 0.72], [-1.32, 0.74]], 0.06, tail).move(0, 0.14, 0),
  );
  for (const s of [1, -1]) {
    m.add(extrude([[-0.1, 0], [0.55, 0], [-0.35, 1.35], [-0.55, 1.35]], 0.06, gray).rotate(84 * s).move(0, -0.08, 0));
    m.add(extrude([[-1.32, 0], [-1.0, 0], [-1.25, 0.5], [-1.38, 0.5]], 0.04, gray).rotate(90 * s).move(0, 0.06, 0));
    m.add(cylinder(0.11, 0.46, 10, gray).rotate(0, 0, -90).move(0, -0.2, 0.5 * s));
    m.add(cylinder(0.085, 0.02, 10, '#30343a').rotate(0, 0, -90).move(0.455, -0.2, 0.5 * s));
    m.add(box(0.25, 0.1, 0.04, gray).move(0.15, -0.12, 0.5 * s));
  }
  return m.rotate(8, 0, 5);
}

/** A faceted stealth jet: flat panels, a sawtooth tail and a V tail, diving toward the camera. */
function stealthjet() {
  const [black, ridge] = ['#323743', '#474e5c'];
  const [N, C, S, T]: Vec3[] = [[1.1, 0.02, 0], [0.25, 0.26, 0], [-0.5, 0.2, 0], [-0.9, 0.04, 0]];
  const faces: [Vec3[], string][] = [];
  for (const s of [1, -1]) {
    const [H, R, F, W, E]: Vec3[] = [[0, 0.12, 0.26 * s], [-0.55, 0.1, 0.26 * s], [-0.5, 0, 0.82 * s], [-0.64, 0, 0.8 * s], [-0.32, 0, 0.42 * s]];
    faces.push([[N, H, C], ridge], [[C, H, R, S], ridge], [[S, R, T], black], [[N, F, H], black], [[H, F, W, R], black], [[R, W, E], ridge], [[R, E, T], black], [[N, F, W, E, T], black]);
  }
  const m = polys(faces, true);
  for (const s of [1, -1]) m.add(extrude([[-0.56, 0], [0, 0], [-0.3, 0.46], [-0.54, 0.46]], 0.05, black).rotate(32 * s).move(-0.34, 0.12, 0.12 * s));
  return m.rotate(8, 0, -25);
}

/** A classic red-and-white rocket with fins, a porthole and a glowing exhaust. */
function rocket() {
  const red = '#d8262c';
  const m = Mesh.of(
    lathe([[0, 0], [0.3, 0], [0.38, 0.3], [0.41, 0.8], [0.38, 1.3], [0.3, 1.62]], 10, '#f2f2f0'),
    lathe([[0.3, 1.6], [0.22, 1.84], [0.12, 2.0], [0, 2.08]], 10, red),
    cylinder(0.26, 0.16, 10, '#5a5f66', 0.2).move(0, -0.14, 0),
    cylinder(0.15, 0.04, 10, '#c9ced6').rotate(90).move(0, 1.05, 0.38),
    cylinder(0.11, 0.05, 10, '#8fd8ff').glow().rotate(90).move(0, 1.05, 0.38),
    flame(0.24, 0.9).move(0, -0.12, 0),
  );
  for (let i = 0; i < 4; i++) m.add(extrude([[0.3, 0], [0.78, -0.18], [0.8, 0.2], [0.36, 0.85]], 0.08, red).rotate(0, i * 90, 0));
  return m.rotate(0, 0, -38);
}

/** A missile with X fins and a red nose. */
function missile() {
  const gray = '#a3a9b0';
  const m = Mesh.of(
    lathe([[0, 0], [0.2, 0], [0.2, 1.9]], 10, gray),
    lathe([[0.2, 1.9], [0.17, 2.15], [0.1, 2.35], [0, 2.45]], 10, '#d02a22'),
    flame(0.14, 0.5),
  );
  for (let i = 0; i < 4; i++) {
    m.add(extrude([[0.18, 0], [0.62, -0.06], [0.62, 0.14], [0.2, 0.62]], 0.06, gray).rotate(0, 45 + i * 90, 0));
    m.add(extrude([[0.18, 1.45], [0.38, 1.5], [0.38, 1.58], [0.19, 1.76]], 0.05, gray).rotate(0, 45 + i * 90, 0));
  }
  return m.rotate(0, 0, -55);
}

/** A flying saucer: a silver disc, a glass dome, and lights around the rim. */
function ufo() {
  const m = Mesh.of(
    lathe([[0, -0.2], [0.55, -0.22], [1.15, -0.06], [1.25, 0.02], [1.0, 0.14], [0.55, 0.24], [0, 0.26]], 14, '#c3c9d3'),
    lathe([[0.52, 0.2], [0.5, 0.42], [0.38, 0.62], [0.2, 0.72], [0, 0.75]], 12, '#9ff0ff').paint((p) => mix(hex('#49c8f0'), hex('#e8fdff'), (p[1] - 0.2) / 0.55)).glow(),
  );
  for (let i = 0; i < 10; i++) m.add(sphere(0.1, 6, i % 2 ? '#ffe066' : '#ff6ad5').glow().move(0, 0.06, 1.17).rotate(0, i * 36, 0));
  return m.rotate(14, 0, 0);
}

/** A satellite: a gold body, two blue solar wings and a dish. */
function satellite() {
  const panel = texture(6, 2, (x, y) => ((x + y) % 2 ? hex('#2a5fd0') : hex('#1d47a8')));
  const m = Mesh.of(
    box(0.62, 0.7, 0.62, '#e0b040'),
    box(0.66, 0.08, 0.66, '#d6dbe2').move(0, 0.38, 0),
    box(0.66, 0.08, 0.66, '#d6dbe2').move(0, -0.38, 0),
    Mesh.of(
      lathe([[0, 0], [0.26, 0.03], [0.46, 0.12], [0.58, 0.24]], 12, '#f2f2f2').material({ twoSided: true }),
      beam([0, 0, 0], [0, 0.42, 0], 0.05, '#9aa1ac'),
      sphere(0.06, 6, '#9aa1ac').move(0, 0.44, 0),
    ).rotate(35, 0, 0).move(0, 0.44, 0),
  );
  for (const s of [1, -1]) {
    m.add(beam([0.31 * s, 0, 0], [0.58 * s, 0, 0], 0.07, '#9aa1ac'));
    m.add(box(1.4, 0.05, 0.66, '#ffffff').material({ tex: panel }).rotate(55, 0, 0).move(1.28 * s, 0, 0));
  }
  return m;
}

/** A self-replicating Von Neumann probe: a sleek hull, a big antenna dish, a glowing engine. */
function probe(accent = '#2f9bff') {
  const m = Mesh.of(
    along([[0, 0], [0.26, 0.04], [0.32, 0.3], [0.32, 1.6], [0.28, 1.95], [0.18, 2.25], [0.07, 2.5], [0, 2.56]], 10, '#dfe4ea').move(-1.1, 0, 0),
    cylinder(0.335, 0.14, 10, accent).rotate(0, 0, -90).move(-0.6, 0, 0),
    cylinder(0.335, 0.14, 10, accent).rotate(0, 0, -90).move(0.3, 0, 0),
    cylinder(0.2, 0.3, 10, '#6b7079', 0.3).rotate(0, 0, 90).move(-1.05, 0, 0),
    cylinder(0.27, 0.02, 10, '#e8fbff').glow().rotate(0, 0, 90).move(-1.33, 0, 0),
    flame(0.26, 0.6, '#e8fbff', accent).rotate(0, 0, -90).move(-1.35, 0, 0),
    beam([0.5, 0.25, 0], [0.5, 0.46, 0], 0.12, '#9aa1ac'),
    Mesh.of(
      lathe([[0, 0], [0.25, 0.04], [0.45, 0.13], [0.62, 0.26]], 12, '#f4f4f4').material({ twoSided: true }),
      beam([0, 0, 0], [0, 0.4, 0], 0.04, '#9aa1ac'),
      sphere(0.05, 6, accent).move(0, 0.42, 0),
    ).rotate(30, 0, 0).move(0.5, 0.44, 0),
  );
  // Climbing on a diagonal fills the square better than lying flat.
  return m.rotate(0, 0, 24);
}

/** A wedge-shaped capital warship: a long flat triangle with a bridge tower at the back. */
function stardestroyer() {
  const gray = '#9ca3ad';
  const light = '#b9c0c9';
  const dark = '#5d646e';
  const [N, top, bot]: Vec3[] = [[1.7, 0.02, 0], [-1.1, 0.32, 0], [-1.1, -0.22, 0]];
  const faces: [Vec3[], string][] = [];
  for (const s of [1, -1]) {
    const [up, lo]: Vec3[] = [[-1.1, 0.05, 0.95 * s], [-1.1, -0.03, 0.95 * s]];
    faces.push([[N, up, top], light], [[N, bot, lo], dark], [[N, lo, up], dark], [[up, lo, bot, top], dark]);
  }
  const m = Mesh.of(
    polys(faces, true),
    box(1.0, 0.2, 0.6, gray).move(-0.6, 0.28, 0),
    box(0.6, 0.16, 0.42, light).move(-0.75, 0.44, 0),
    box(0.16, 0.24, 0.12, gray).move(-0.88, 0.62, 0),
    box(0.22, 0.1, 0.62, light).move(-0.88, 0.78, 0),
  );
  for (const [y, z, r] of [[0.06, 0, 0.13], [0.02, 0.3, 0.09], [0.02, -0.3, 0.09]]) m.add(cylinder(r, 0.06, 8, '#9fdcff').glow().rotate(0, 0, 90).move(-1.1, y, z));
  return m.rotate(22, 0, 0);
}

export const VEHICLES = {
  tram: { build: tram, turn: -30 },
  spaceship: { build: spaceship, float: true, turn: 25 },
  caravel: { build: caravel, turn: -50 },
  truck: { build: truck, turn: -30 },
  car: { build: car, turn: -20 },
  racecar: { build: racecar, turn: -25 },
  cargoship: { build: cargoship, turn: -20 },
  warship: { build: warship, turn: -20 },
  speedboat: { build: speedboat, turn: -25 },
  submarine: { build: submarine, turn: -15 },
  tank: { build: tank, turn: -25 },
  helicopter: { build: helicopter, float: true, turn: 10 },
  airliner: { build: airliner, float: true, turn: -25 },
  stealthjet: { build: stealthjet, float: true, turn: -45 },
  rocket: { build: rocket, float: true, turn: 0 },
  missile: { build: missile, float: true, turn: 0 },
  ufo: { build: ufo, float: true, turn: 0 },
  satellite: { build: satellite, float: true, turn: -15 },
  probe: { build: probe, float: true, turn: 25 },
  stardestroyer: { build: stardestroyer, float: true, turn: -30 },
} satisfies Record<string, Model>;
