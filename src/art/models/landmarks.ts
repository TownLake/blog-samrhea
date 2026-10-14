/** Buildings, landscape features, weather and things in the sky. */
import { beam, box, cylinder, extrude, hex, lathe, mix, Mesh, plane, sphere, texture, type Vec3, type Vertex } from '../mesh.ts';
import { star } from './symbols.ts';
import type { Model } from './index.ts';

const RAD = Math.PI / 180;

/** Moves every vertex through `fn` and reshades: lumpy rocks, bent flames, lava draped on a slope. */
function warp(m: Mesh, fn: (p: Vec3) => Vec3, crease = 50) {
  const seen = new Set<Vertex>();
  for (const t of m.tris) for (const v of t.v) if (!seen.has(v)) seen.add(v), (v.p = fn(v.p));
  return m.smooth(crease);
}

/** A round patch lying on a sphere of radius `r`, centered at a latitude and longitude: craters, continents, ice caps. */
function patch(lat: number, lon: number, size: number, r: number, c: string, sides = 8, stretch = 1) {
  const profile = [3, 2, 1, 0].map((i): [number, number] => [Math.sin((size * i * RAD) / 3) * r, Math.cos((size * i * RAD) / 3) * r]);
  return lathe(profile, sides, c).scale(stretch, 1, 1).rotate(90 - lat, lon);
}

/** A crater: a dark floor inside a pale rim, both on the sphere's surface. */
const crater = (lat: number, lon: number, size: number, floor: string, rim: string, r = 1.03) =>
  Mesh.of(patch(lat, lon, size * 1.35, r * 1.006, rim), patch(lat, lon, size, r * 1.012, floor));

/** A gable or slope board resting on the outline edge from `a` to `b` (in the xy plane), `z` long. */
function board(a: [number, number], b: [number, number], t: number, z: number, c: string, overA = 0, overB = 0) {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(dx, dy);
  const [ux, uy] = [dx / l, dy / l];
  const [nx, ny] = [uy * (t / 2), -ux * (t / 2)];
  return beam([a[0] - ux * overA + nx, a[1] - uy * overA + ny, 0], [b[0] + ux * overB + nx, b[1] + uy * overB + ny, 0], z, c, t);
}

/** Wedges of a lathe in alternating colors: circus tents, beach umbrellas. */
function stripes(profile: [number, number][], count: number, colors: string[], sides = 2) {
  const m = new Mesh();
  for (let i = 0; i < count; i++) m.add(lathe(profile, sides, colors[i % colors.length], 360 / count).rotate(0, (i * 360) / count));
  return m.smooth();
}

function windmill() {
  const metal = '#a7adb5';
  const m = new Mesh();
  const top = 3;
  const radius = (y: number) => 0.62 - (0.47 * y) / top;
  const leg = (y: number, a: number): [number, number, number] => [Math.sin(a) * radius(y), y, Math.cos(a) * radius(y)];
  const angles = [0, 120, 240].map((a) => ((a + 30) * Math.PI) / 180);
  for (const a of angles) m.add(beam(leg(0, a), leg(top, a), 0.11, metal));
  for (const y of [1.1]) angles.forEach((a, i) => m.add(beam(leg(y, a), leg(y, angles[(i + 1) % 3]), 0.06, metal)));
  // The fan wheel and the vane that keeps it in the wind.
  const fan = new Mesh();
  for (let i = 0; i < 12; i++) fan.add(box(0.26, 0.8, 0.03, '#8e969f').rotate(0, 25, 0).move(0, 0.58, 0).rotate(0, 0, (i * 360) / 12));
  fan.add(cylinder(0.14, 0.14, 8, '#6d747c').rotate(90).move(0, 0, -0.04));
  m.add(fan.move(0, top + 0.2, 0.32));
  m.add(beam([0, top + 0.2, 0.3], [0, top + 0.2, -0.7], 0.07, metal));
  m.add(extrude([[0, 0.3], [-0.8, 0.4], [-0.8, -0.28], [0, -0.12]], 0.03, '#c9463d').rotate(0, 90, 0).move(0, top + 0.2, -0.65));
  m.add(box(0.32, 0.22, 0.32, '#6d747c').move(0, top + 0.08, 0));
  return m;
}

function capitol() {
  const granite = '#d49a84';
  const trim = '#ecd2c0';
  const m = Mesh.of(
    box(2.2, 0.85, 1.1, granite).move(0, 0.42, 0),
    box(1.0, 1.0, 1.25, trim).move(0, 0.5, 0),
    extrude([[-0.55, 0], [0.55, 0], [0, 0.32]], 0.2, trim).move(0, 1.0, 0.55),
  );
  for (let i = 0; i < 6; i++) m.add(cylinder(0.05, 0.85, 6, '#f5e8dc').move(-0.42 + i * 0.168, 0.1, 0.66));
  m.add(box(1.0, 0.1, 0.3, trim).move(0, 0.05, 0.68));
  for (let i = 0; i < 8; i++) for (const side of [-1, 1]) m.add(box(0.1, 0.22, 0.02, '#5a3a3a').move(side * (0.62 + (i % 4) * 0.13), 0.55 - Math.floor(i / 4) * 0.3, 0.56));
  m.add(cylinder(0.62, 0.42, 14, trim).move(0, 1.0, 0));
  m.add(cylinder(0.54, 0.5, 14, granite).move(0, 1.42, 0));
  for (let i = 0; i < 14; i++) m.add(box(0.06, 0.3, 0.06, '#f5e8dc').move(0, 1.52, 0.56).rotate(0, (i * 360) / 14));
  m.add(lathe([[0.58, 1.92], [0.55, 2.2], [0.46, 2.46], [0.32, 2.66], [0.14, 2.78], [0, 2.8]], 14, '#e6c7b4'));
  m.add(cylinder(0.1, 0.3, 8, trim).move(0, 2.76, 0), sphere(0.1, 8, trim).move(0, 3.08, 0));
  m.add(star('#ffd23a').scale(0.16).move(0, 3.32, 0));
  return m;
}

function cloud(color = '#f6821f') {
  const c = color;
  return Mesh.of(
    sphere(0.62, 12, c).move(0.1, 0.62, 0),
    sphere(0.45, 10, c).move(-0.62, 0.42, 0.05),
    sphere(0.5, 10, c).move(0.78, 0.45, 0),
    sphere(0.36, 10, c).move(-0.2, 0.3, 0.3),
    sphere(0.4, 10, c).move(0.45, 0.32, 0.28),
  ).scale(1, 0.92, 0.75);
}

function trafficlight() {
  const steel = '#59606b';
  const m = Mesh.of(
    cylinder(0.32, 0.12, 10, steel),
    cylinder(0.13, 1.4, 8, steel),
    box(1.2, 2.3, 0.08, '#262a31').move(0, 2.45, -0.24),
    box(0.9, 2.1, 0.5, '#f2c230').move(0, 2.45, 0),
  );
  ['#ff3b2f', '#ffc21e', '#2fe06a'].forEach((c, i) => {
    const y = 3.12 - i * 0.67;
    m.add(cylinder(0.28, 0.06, 10, c).paint((p, k) => (Math.hypot(p[0], p[2]) < 0.01 ? mix(k, [1, 1, 1], 0.55) : k)).glow().rotate(90).move(0, y, 0.25));
    m.add(lathe([[0.33, 0], [0.33, 0.15]], 6, '#262a31', 180).material({ twoSided: true }).rotate(90, 0, 90).move(0, y, 0.25));
  });
  return m;
}

function clocktower() {
  const stone = '#dcb46a';
  const ledge = '#a8823e';
  const slate = '#3d5872';
  const dial = texture(16, 16, (x, y) => {
    const [dx, dy] = [x - 7.5, y - 7.5];
    const d = Math.hypot(dx, dy);
    if (d > 7.3) return hex('#d9b04c');
    if (d > 6.3) return hex('#2b2620');
    const hand = (ax: number, ay: number, len: number) => dx * ax + dy * ay > -0.6 && dx * ax + dy * ay < len && Math.abs(dx * ay - dy * ax) < 0.85;
    return hand(-0.87, -0.5, 3.6) || hand(0.5, -0.87, 5.4) || d < 1 ? hex('#1d1a16') : hex('#fff6dc');
  });
  const m = Mesh.of(
    box(1.1, 1.3, 1.1, stone).move(0, 0.65, 0),
    box(1.38, 0.12, 1.38, ledge).move(0, 1.3, 0),
    box(1.36, 1.3, 1.36, stone).move(0, 2.0, 0),
    box(1.5, 0.14, 1.5, ledge).move(0, 2.7, 0),
    box(1.05, 0.45, 1.05, stone).move(0, 3.0, 0),
    cylinder(0.86, 1.25, 4, slate, 0).rotate(0, 45).move(0, 3.22, 0),
    cylinder(0.05, 0.3, 6, '#e8c45a').move(0, 4.4, 0),
    sphere(0.08, 6, '#e8c45a').move(0, 4.75, 0),
  );
  for (let side = 0; side < 4; side++) {
    const face = Mesh.of(plane(1.12, 1.12, '#ffffff', dial).glow().move(0, 2.0, 0.69));
    // Tall gothic panels down the shaft, and the belfry openings above the clock.
    for (const x of [-0.28, 0, 0.28]) face.add(box(0.12, 1.0, 0.04, '#b58d48').move(x, 0.65, 0.55));
    for (const x of [-0.22, 0.22]) face.add(box(0.22, 0.3, 0.04, '#4a3a28').move(x, 3.0, 0.525));
    m.add(face.rotate(0, side * 90));
  }
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) m.add(cylinder(0.1, 0.42, 4, slate, 0).rotate(0, 45).move(x * 0.64, 2.77, z * 0.64));
  return m;
}

function chapel() {
  const white = '#f6f3ec';
  const roof = '#56657f';
  const glass = '#5b8fd4';
  const m = Mesh.of(
    extrude([[-0.6, 0], [0.6, 0], [0.6, 0.8], [0, 1.25], [-0.6, 0.8]], 1.6, white),
    board([0.6, 0.8], [0, 1.25], 0.1, 1.76, roof, 0.14, 0.05),
    board([0, 1.25], [-0.6, 0.8], 0.1, 1.76, roof, 0.05, 0.14),
    box(0.5, 0.95, 0.5, white).move(0, 1.25, 0.45),
    box(0.58, 0.08, 0.58, roof).move(0, 1.74, 0.45),
    cylinder(0.4, 0.95, 4, roof, 0).rotate(0, 45).move(0, 1.78, 0.45),
    // The red door with a round window over it, and a gold cross on the spire.
    extrude([[-0.19, 0], [0.19, 0], ...[0, 45, 90, 135, 180].map((a): [number, number] => [Math.cos(a * RAD) * 0.19, 0.42 + Math.sin(a * RAD) * 0.19])], 0.06, '#c8202a').move(0, 0, 0.8),
    box(0.5, 0.06, 0.2, '#d8d2c6').move(0, 0.03, 0.88),
    cylinder(0.11, 0.04, 8, glass).rotate(90).move(0, 0.9, 0.79),
    box(0.08, 0.42, 0.08, '#f0c43c').move(0, 2.9, 0.45),
    box(0.28, 0.08, 0.08, '#f0c43c').move(0, 2.95, 0.45),
  );
  for (const z of [0.38, -0.18]) m.add(extrude([[-0.12, 0], [0.12, 0], [0.12, 0.26], [0, 0.38], [-0.12, 0.26]], 0.04, glass).rotate(0, 90).move(0.6, 0.25, z));
  for (const s of [0, 90, 180, 270]) m.add(box(0.18, 0.26, 0.04, '#3a3a48').move(0, 1.45, 0.25).rotate(0, s).move(0, 0, 0.45));
  return m;
}

/** A horseshoe arch outline: a circle carried past its widest point, on short jambs. */
function horseshoe(r: number, rise: number, steps = 10): [number, number][] {
  const arc = Array.from({ length: steps + 1 }, (_, i): [number, number] => {
    const a = (-40 + (i * 260) / steps) * RAD;
    return [Math.cos(a) * r, rise + Math.sin(a) * r];
  });
  return [[arc[0][0], 0], ...arc, [arc[steps][0], 0]];
}

function mosque() {
  const wall = '#f7efe0';
  const red = '#c4462c';
  const tile = '#22a08c';
  const gold = '#f0c43c';
  const m = Mesh.of(
    box(2.3, 1.0, 1.3, wall).move(0.15, 0.5, 0),
    box(2.4, 0.1, 1.4, red).move(0.15, 1.0, 0),
    cylinder(0.56, 0.28, 8, wall).move(0.35, 1.05, -0.05),
    lathe([[0.6, 0], [0.58, 0.18], [0.5, 0.36], [0.36, 0.5], [0.18, 0.58], [0, 0.6]], 10, tile).move(0.35, 1.33, -0.05),
    cylinder(0.04, 0.22, 6, gold).move(0.35, 1.9, -0.05),
    sphere(0.08, 6, gold).move(0.35, 2.12, -0.05),
    // The square minaret, with its lantern.
    box(0.6, 2.5, 0.6, wall).move(-1.15, 1.25, 0.15),
    box(0.7, 0.1, 0.7, red).move(-1.15, 2.5, 0.15),
    box(0.4, 0.42, 0.4, wall).move(-1.15, 2.76, 0.15),
    cylinder(0.3, 0.3, 4, tile, 0).rotate(0, 45).move(-1.15, 2.97, 0.15),
    sphere(0.08, 6, gold).move(-1.15, 3.33, 0.15),
  );
  // Horseshoe arches, the front ones with red and white voussoirs as at Córdoba.
  const arch = (r: number, rise: number, striped = false) => {
    const a = new Mesh();
    const ring = (t: number, k: number): [number, number] => [Math.cos(t) * r * k, rise + Math.sin(t) * r * k];
    if (!striped) a.add(extrude(horseshoe(r * 1.4, rise), 0, red));
    else for (let i = 0; i < 7; i++) {
      const [t0, t1] = [(-40 + (i * 260) / 7) * RAD, (-40 + ((i + 1) * 260) / 7) * RAD];
      a.add(extrude([ring(t0, 1), ring(t0, 1.45), ring(t1, 1.45), ring(t1, 1)], 0, i % 2 ? wall : red));
    }
    return a.add(extrude(horseshoe(r, rise), 0, '#3a2418').move(0, 0, 0.01));
  };
  for (const x of [-0.42, 0.25, 0.92]) m.add(arch(0.2, 0.42, true).move(x, 0, 0.66));
  m.add(arch(0.12, 0.2).move(-1.15, 1.6, 0.46));
  for (const z of [-0.36, 0.06, 0.48]) m.add(arch(0.16, 0.32).rotate(0, 90).move(1.31, 0, z));
  for (let i = 0; i < 9; i++) m.add(box(0.14, 0.14, 0.1, wall).move(-0.75 + i * 0.25, 1.12, 0.65));
  return m;
}

function barn() {
  const red = '#c3312a';
  const white = '#f8f4ec';
  const roof = '#4b4e58';
  const outline: [number, number][] = [[-1, 0], [1, 0], [1, 1], [0.72, 1.6], [0, 1.95], [-0.72, 1.6], [-1, 1]];
  const m = Mesh.of(extrude(outline, 1.8, red));
  for (let i = 2; i < 6; i++) m.add(board(outline[i], outline[i + 1], 0.1, 1.96, roof, i === 2 ? 0.14 : 0.03, i === 5 ? 0.14 : 0.03));
  // White trim: gable boards, corner boards, and the doors with their X braces.
  const front = new Mesh();
  for (let i = 2; i < 6; i++) front.add(board(outline[i + 1], outline[i], 0.1, 0.06, white));
  for (const x of [-0.96, 0.96]) front.add(box(0.1, 1.0, 0.06, white).move(x, 0.5, 0));
  const door = (w: number, h: number, y: number, x = true) => {
    const d = Mesh.of(box(w, h, 0.04, '#9c2620').move(0, y, 0));
    for (const s of [-1, 1]) d.add(box(w + 0.08, 0.08, 0.06, white).move(0, y + (s * h) / 2, 0.01), box(0.08, h, 0.06, white).move((s * w) / 2, y, 0.01));
    if (x) for (const s of [-1, 1]) d.add(beam([(-w / 2) * s, y - h / 2, 0.02], [(w / 2) * s, y + h / 2, 0.02], 0.06, white, 0.08));
    return d;
  };
  front.add(door(0.5, 0.86, 0.45).move(-0.27, 0, 0), door(0.5, 0.86, 0.45).move(0.27, 0, 0), door(0.4, 0.36, 1.38, false));
  front.add(box(0.36, 0.32, 0.03, '#3a1d18').move(0, 1.38, 0.01));
  m.add(front.move(0, 0, 0.92));
  for (const z of [0.88, -0.88]) m.add(box(0.06, 1.0, 0.1, white).move(1.01, 0.5, z));
  m.add(box(0.06, 0.4, 0.4, white).move(1.01, 0.55, 0), box(0.06, 0.3, 0.3, '#3a1d18').move(1.02, 0.55, 0));
  return m;
}

function factory() {
  const brick = '#b4513a';
  const roof = '#8d939e';
  const glass = '#9fd2f2';
  const m = Mesh.of(box(2.6, 0.9, 1.4, brick).move(0, 0.45, 0), box(2.66, 0.08, 1.46, '#7c3628').move(0, 0.9, 0));
  for (let i = 0; i < 4; i++) {
    const x = -1.3 + i * 0.65;
    m.add(extrude([[x, 0], [x + 0.65, 0], [x + 0.65, 0.45]], 1.4, roof).move(0, 0.94, 0));
    m.add(box(0.03, 0.34, 1.2, glass).glow().move(x + 0.64, 1.16, 0));
  }
  for (let i = 0; i < 5; i++) m.add(box(0.28, 0.32, 0.03, '#2f4057').move(-1.0 + i * 0.5, 0.5, 0.7));
  m.add(box(0.03, 0.32, 0.4, '#2f4057').move(1.3, 0.5, 0.2), box(0.03, 0.32, 0.4, '#2f4057').move(1.3, 0.5, -0.35));
  for (const [x, h] of [[-0.9, 1.75], [-0.25, 1.45]]) {
    m.add(cylinder(0.22, h, 10, '#8f3527', 0.18).move(x, 0.3, -0.35));
    m.add(cylinder(0.195, 0.16, 10, '#f2ede4').move(x, 0.3 + h - 0.32, -0.35));
    [[0.02, 0.22, 0.2], [0.2, 0.5, 0.24], [0.42, 0.62, 0.22]].forEach(([dx, dy, r]) => m.add(sphere(r, 8, '#f4f4f8').move(x + dx, 0.3 + h + dy, -0.35)));
  }
  return m;
}

function volcano() {
  const outer: [number, number][] = [[1.65, 0], [1.45, 0.2], [1.05, 0.62], [0.72, 1.08], [0.52, 1.4], [0.44, 1.48]];
  const radiusAt = (y: number) => {
    for (let i = 0; i < outer.length - 1; i++) {
      const [[r0, y0], [r1, y1]] = [outer[i], outer[i + 1]];
      if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
    return outer[outer.length - 1][0];
  };
  const m = Mesh.of(
    lathe([[0, 0], ...outer], 12, '#6a4a3c').paint((p, c) => mix(c, hex('#3a2a28'), p[1] / 1.5)),
    lathe([[0.44, 1.48], [0.36, 1.5], [0.2, 1.56], [0, 1.58]], 12, '#ffb020').paint((p, c) => mix(c, hex('#fff08a'), 1 - Math.hypot(p[0], p[2]) / 0.44)).glow(),
  );
  // Lava runs down the slope: a thin strip draped on the cone, narrowing as it cools.
  for (const [a, end, k] of [[28, 0.2, 1], [-32, 0.5, 0.85], [100, 0.4, 0.85]]) {
    const ys = [1.47, 1.3, 1.1, 0.9, 0.7, 0.5, 0.3].filter((y) => y >= end);
    const lava = lathe(ys.map((y): [number, number] => [radiusAt(y) + 0.03, y]).reverse(), 2, '#ff6a10', 26).rotate(0, -13);
    m.add(
      warp(lava, ([x, y, z]) => {
        const r = Math.hypot(x, z);
        const t = (1.47 - y) / (1.47 - end);
        const ang = Math.atan2(x, z) * (1 - 0.55 * t) * k + (a + Math.sin(t * 5) * 6) * RAD;
        return [Math.sin(ang) * r, y, Math.cos(ang) * r];
      })
        .paint((p, c) => mix(hex('#ffd23a'), c, (1.47 - p[1]) / 1.2))
        .glow(),
    );
  }
  for (const [x, y, z, r] of [[0.1, 1.75, 0.05, 0.1], [-0.2, 1.95, -0.1, 0.08], [0.25, 2.05, 0, 0.07]]) m.add(sphere(r, 6, '#ff8a1a').glow().move(x, y, z));
  return m;
}

/** A craggy peak: a lathe pushed in and out around its sides, with a ragged snow cap laid over the top. */
function peak(h: number, base: number, seed: number) {
  const shape = (a: number, y: number) => base * Math.max(0, 1 - y / h) ** 0.85 * (1 + 0.16 * Math.sin(a * 3 + seed) + 0.09 * Math.sin(a * 5 - y * 2 + seed));
  const rings = (from: number) => Array.from({ length: 6 }, (_, i): [number, number] => [1, from + ((h * 0.92 - from) * i) / 5]).concat([[0, h]]);
  const snow = h * 0.6;
  // Puts a lathe's points on the craggy surface; the cap's lower edge dips at every other side.
  const onto = (lift: number, ragged: boolean) => ([x, y, z]: Vec3): Vec3 => {
    const a = Math.atan2(x, z);
    const yy = ragged && Math.abs(y - snow) < 1e-6 && Math.round(a / (45 * RAD)) % 2 ? y - h * 0.15 : y;
    const r = Math.hypot(x, z) > 1e-6 ? shape(a, yy) * lift : 0;
    return [Math.sin(a) * r, yy, Math.cos(a) * r];
  };
  const rock = warp(lathe([[0, 0], ...rings(0)], 8, '#75707a'), onto(1, false), 35).paint((p, c) => mix(hex('#45404c'), c, p[1] / h));
  const cap = warp(lathe(rings(snow), 8, '#fbfdff'), onto(1.05, true), 35);
  return Mesh.of(rock, cap);
}

function mountain() {
  return Mesh.of(peak(2.4, 1.5, 0), peak(1.5, 1.05, 2).move(-1.1, 0, -0.5), peak(1.2, 0.9, 4).move(1.0, 0, -0.3));
}

function island() {
  const m = Mesh.of(
    cylinder(1.5, 0.03, 14, '#e6f4ff'),
    lathe([[0, 0], [1.25, 0], [1.2, 0.12], [0.95, 0.28], [0.5, 0.38], [0, 0.4]], 14, '#f2d88e'),
  );
  const trunk: Vec3[] = [[-0.3, 0.3, 0], [-0.22, 0.75, 0], [-0.05, 1.2, 0], [0.22, 1.6, 0], [0.55, 1.9, 0]];
  trunk.slice(1).forEach((p, i) => m.add(beam(trunk[i], p, 0.2 - i * 0.02, i % 2 ? '#9a6a38' : '#7c5028')));
  const crown = trunk[trunk.length - 1];
  for (let i = 0; i < 7; i++) {
    const leaf = extrude([[0, 0], [0.3, 0.17], [0.75, 0.16], [1.1, 0], [0.75, -0.16], [0.3, -0.17]], 0.04, '#3cae3c').rotate(90);
    m.add(warp(leaf, ([x, y, z]) => [x, y - x * x * 0.45 + x * 0.2, z]).paint((p, c) => mix(hex('#1f7a2a'), c, Math.min(1, p[0]))).rotate(0, i * (360 / 7) + 10).move(...crown));
  }
  for (const [x, z] of [[0.08, 0.06], [-0.06, 0.07], [0, -0.08]]) m.add(sphere(0.09, 6, '#5a3a1e').move(crown[0] + x, crown[1] - 0.1, crown[2] + z));
  return m;
}

/** Earth, with patches for continents: Africa and Europe face the camera. */
function globe() {
  const ocean = '#2f6fd8';
  const green = '#46a33c';
  const brown = '#c9a65e';
  const land: [number, number, number, string, number?][] = [
    [8, 20, 28, green], [18, 2, 22, green], [-18, 25, 20, green], [-28, 23, 12, green], [22, 14, 8, brown, 2.6], [24, 46, 9, brown], [50, 14, 15, green], [57, 40, 22, green], [48, 62, 16, green], [38, 84, 18, green], [-20, 47, 6, green],
    [-8, -60, 22, green], [-28, -62, 13, green], [-45, -68, 7, green], [12, -70, 8, green], [64, -42, 12, '#f2f6fa'], [22, 78, 12, green],
  ];
  const m = Mesh.of(sphere(1, 16, ocean, 10), patch(90, 0, 22, 1.025, '#f4f8fc', 10), patch(-90, 0, 24, 1.025, '#f4f8fc', 10));
  land.forEach(([lat, lon, size, c, stretch], i) => m.add(patch(lat, lon, size, 1.03 + i * 0.001, c, 8, stretch)));
  for (const [lat, lon, size] of [[34, -18, 6], [-8, 58, 5], [-42, 12, 6], [10, -30, 4]]) m.add(patch(lat, lon, size, 1.05, '#ffffff', 6, 2.4));
  return m.rotate(0, 0, -15);
}

function planet(color = '#f2a654') {
  const c = hex(color);
  const body = sphere(1, 14, color, 11).paint((p) => {
    const band = Math.sin(p[1] * 7.5) + 0.5 * Math.sin(p[1] * 17 + 1);
    return band > 0 ? mix(c, [1, 0.97, 0.9], band * 0.4) : mix(c, [0.45, 0.18, 0.08], -band * 0.4);
  });
  const ringColor = mix(c, [1, 0.97, 0.88], 0.55);
  const ring = Mesh.of(
    lathe([[1.75, 0], [1.3, 0]], 18, ringColor).material({ twoSided: true }),
    lathe([[2.15, 0], [1.85, 0]], 18, mix(c, [1, 1, 1], 0.3)).material({ twoSided: true }),
  );
  return Mesh.of(body, ring).rotate(30, 0, -14);
}

function asteroid() {
  const m = Mesh.of(sphere(1, 12, '#877b6e', 8));
  const craters: [number, number, number][] = [[25, 15, 14], [-20, 50, 11], [45, -35, 10], [-30, -15, 12], [0, 90, 12], [15, -70, 9], [-50, 30, 8]];
  for (const [lat, lon, size] of craters) m.add(crater(lat, lon, size, '#564c43', '#ab9f90'));
  const lump = ([x, y, z]: Vec3): Vec3 => {
    const k = 1 + 0.22 * Math.sin(x * 2.1 + 1) * Math.cos(y * 1.7) + 0.14 * Math.sin(z * 3.3 + y * 1.2) + 0.08 * Math.sin(x * 5 + z * 3);
    return [x * k * 1.45, y * k * 0.85, z * k * 0.95];
  };
  return warp(m, lump, 30).rotate(10, 0, 24);
}

function moon(variant?: string) {
  const cheese = variant === 'cheese';
  const m = Mesh.of(sphere(1, 14, cheese ? '#ffd23a' : '#f3f0e3', 10));
  const spots: [number, number, number][] = [[30, 10, 16], [-20, 35, 12], [5, -25, 10], [55, 60, 10], [-45, -10, 13], [-5, 75, 9], [25, -65, 10]];
  for (const [lat, lon, size] of spots) m.add(cheese ? crater(lat, lon, size * 1.05, '#9c5a08', '#e0a11c') : crater(lat, lon, size, '#b3ae9e', '#fbf9f0'));
  return m.rotate(0, 25, 0);
}

function stormcloud() {
  const bolt = Mesh.of(
    extrude([[0.12, 0.05], [-0.3, -0.78], [0, -0.78], [0.18, -0.5], [0.5, 0.05]], 0.12, '#ffe23a'),
    extrude([[0, -0.78], [-0.25, -1.45], [0.42, -0.5], [0.18, -0.5]], 0.12, '#ffe23a'),
  )
    .glow()
    .scale(1.3)
    .move(0.05, 0.38, 0.2);
  return Mesh.of(cloud('#646b7c').paint((p, c) => mix(hex('#3c4150'), c, Math.min(1, p[1] / 0.9))), bolt);
}

/** A teardrop, bent at the tip like a flame licking upward. */
function tongue(h: number, w: number, c: string, bend: number) {
  const drop = lathe([[0, 0], [0.32, 0.04], [0.48, 0.18], [0.52, 0.36], [0.45, 0.58], [0.32, 0.82], [0.18, 1.08], [0.07, 1.32], [0, 1.5]].map(([r, y]): [number, number] => [r * w, (y * h) / 1.5]), 8, c);
  return warp(drop, ([x, y, z]) => [x + bend * (y / h) ** 2, y, z]);
}

function flame() {
  return Mesh.of(
    tongue(1.9, 1.15, '#ff4a1a', 0.18),
    tongue(1.1, 0.6, '#ff4a1a', -0.2).rotate(0, 0, 18).move(-0.34, 0.03, -0.05),
    tongue(1.0, 0.56, '#ff4a1a', 0.18).rotate(0, 0, -16).move(0.34, 0.02, -0.05),
    tongue(1.4, 0.82, '#ff9a1a', -0.12).move(0, 0.03, 0.32),
    tongue(0.85, 0.5, '#ffe14a', 0.1).move(0, 0.05, 0.55),
  )
    .paint((p, c) => mix(c, hex('#fff2a0'), Math.max(0, 0.35 - p[1] * 0.4)))
    .scale(1, 1, 0.75)
    .glow();
}

function tent() {
  const red = '#d8282a';
  const white = '#f7f2e8';
  return Mesh.of(
    stripes([[1.2, 0], [1.2, 0.72]], 12, [red, white]),
    stripes([[1.38, 0.68], [1.05, 0.9], [0.62, 1.22], [0.26, 1.62], [0, 1.95]], 12, [red, white], 2),
    cylinder(1.38, 0.08, 12, '#f2c230').move(0, 0.64, 0),
    extrude([[-0.28, 0], [0.28, 0], [0, 0.6]], 0.04, '#3a1418').move(0, 0, 1.2),
    beam([0, 1.9, 0], [0, 2.45, 0], 0.09, '#e8e0d0'),
    sphere(0.08, 6, '#f2c230').move(0, 2.5, 0),
    extrude([[0, 0], [0.55, 0.13], [0, 0.28]], 0.04, '#2f6fd8').move(0.03, 2.13, 0),
  );
}

function umbrella() {
  const canopy = stripes([[1.2, 1.5], [1.0, 1.66], [0.6, 1.8], [0, 1.88]], 8, ['#e53a2e', '#f8f4ea'], 3).material({ twoSided: true });
  const pole = Mesh.of(cylinder(0.065, 1.9, 6, '#f2efe6'), sphere(0.09, 6, '#e53a2e').move(0, 1.92, 0));
  return Mesh.of(Mesh.of(canopy, pole).rotate(12, 0, -14), sphere(1, 10, '#ecd49a').scale(0.42, 0.12, 0.42));
}

function cannon() {
  const bronze = '#c9923c';
  const wood = '#7a4a26';
  const iron = '#3a3a3e';
  const barrel = Mesh.of(
    lathe([[0, -0.36], [0.1, -0.34], [0.12, -0.26], [0.07, -0.2], [0.26, -0.12], [0.3, -0.02], [0.3, 0.4], [0.27, 0.44], [0.26, 1.0], [0.23, 1.04], [0.21, 1.72], [0.27, 1.78], [0.27, 1.92], [0.14, 1.94], [0, 1.94]], 10, bronze),
    cylinder(0.13, 0.02, 10, '#1a120a').move(0, 1.935, 0),
    cylinder(0.08, 0.7, 8, bronze).rotate(90).move(0, 0.55, -0.35),
  )
    .rotate(0, 0, -76)
    .move(-0.35, 0.87, 0);
  const m = Mesh.of(barrel);
  const cheek = extrude([[-1.35, 0], [-1.12, 0], [0.32, 0.45], [0.32, 0.95], [0.05, 0.95], [-0.2, 0.8]], 0.1, wood);
  for (const z of [0.36, -0.36]) m.add(cheek.clone().move(0, 0, z));
  m.add(box(0.5, 0.12, 0.76, wood).move(-0.55, 0.42, 0), cylinder(0.06, 1.3, 6, iron).rotate(90).move(0, 0.58, -0.65));
  for (const z of [0.55, -0.55]) {
    const wheel = Mesh.of(
      lathe([[0.48, -0.06], [0.58, -0.06], [0.58, 0.06], [0.48, 0.06], [0.48, -0.06]], 12, '#5a3a1e'),
      cylinder(0.13, 0.16, 8, iron).move(0, -0.08, 0),
    );
    for (let i = 0; i < 6; i++) wheel.add(box(0.09, 0.06, 0.5, '#8a5a30').move(0, 0, 0.25).rotate(0, i * 60));
    m.add(wheel.rotate(90).move(0, 0.58, z));
  }
  return m;
}

export const LANDMARKS = {
  windmill: { build: windmill, turn: -20 },
  capitol: { build: capitol, turn: -10 },
  cloud: { build: cloud, float: true, turn: -10 },
  trafficlight: { build: trafficlight, turn: -20 },
  clocktower: { build: clocktower, turn: -20 },
  chapel: { build: chapel, turn: -25 },
  mosque: { build: mosque, turn: -15 },
  barn: { build: barn, turn: -25 },
  factory: { build: factory, turn: -15 },
  volcano: { build: volcano, turn: 0 },
  mountain: { build: mountain, turn: 0 },
  island: { build: island, turn: -10 },
  globe: { build: globe, float: true, turn: 0 },
  planet: { build: planet, float: true, turn: 0 },
  asteroid: { build: asteroid, float: true, turn: 0 },
  moon: { build: moon, float: true, turn: 0 },
  stormcloud: { build: stormcloud, float: true, turn: -10 },
  flame: { build: flame, float: true, turn: 0 },
  tent: { build: tent, turn: -10 },
  umbrella: { build: umbrella, turn: 0 },
  cannon: { build: cannon, turn: -30 },
} satisfies Record<string, Model>;
