/** Small symbolic things: collectibles, emblems, food and drink, hats, signs. */
import { beam, box, cross, cylinder, dot, extrude, hex, lathe, mix, mul, Mesh, normalize, polygon, sphere, sub, terrain, texture, type RGB, type Texture, type Tri, type Vec3 } from '../mesh.ts';
import type { Model } from './index.ts';

type P = [number, number];
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const rgb = (c: RGB | string) => (typeof c === 'string' ? hex(c) : c);
/** A vertical gradient, for baking light into the tops of things. */
const fade = (bottom: RGB | string, top: RGB | string, y0: number, y1: number) => (p: Vec3) => mix(rgb(bottom), rgb(top), clamp((p[1] - y0) / (y1 - y0)));
/** Brightens the side of a round thing that faces `dir`, like a baked highlight. */
const shine = (center: Vec3, dir: Vec3, color: RGB | string, power = 3) => (p: Vec3, c: RGB) => mix(c, rgb(color), clamp(dot(normalize(sub(p, center)), normalize(dir))) ** power);

/** A convex polygon on a sphere, fanned from a point pushed out to the surface. */
function facet(points: Vec3[], color: string) {
  const apex = normalize(points.reduce<Vec3>((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]));
  const u = normalize(cross(apex, Math.abs(apex[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
  const w = cross(apex, u);
  const angle = (p: Vec3) => Math.atan2(dot(p, w), dot(p, u));
  const ring = [...points].sort((a, b) => angle(a) - angle(b));
  const c = hex(color);
  return new Mesh(
    ring.map((p, i): Tri => {
      const q = ring[(i + 1) % ring.length];
      const n = normalize(cross(sub(p, apex), sub(q, apex)));
      return { m: { lit: true, twoSided: false }, v: [apex, p, q].map((x) => ({ p: [...x], n, c, uv: [0, 0] })) as Tri['v'] };
    }),
  );
}

export function star(color = '#ffd23a') {
  return extrude(polygon(5, 1, 0.45), 0.24, color, 0.22).smooth(1);
}

function zzz(color = '#dfe8ff') {
  const z = (s: number) => Mesh.of(box(0.6, 0.12, 0.12, color).move(0, 0.3, 0), box(0.6, 0.12, 0.12, color).move(0, -0.3, 0), beam([0.26, 0.26, 0], [-0.26, -0.26, 0], 0.12, color)).scale(s);
  return Mesh.of(z(0.55).move(-0.5, 0, 0), z(0.75).rotate(0, 0, 8).move(0.1, 0.55, 0), z(1).rotate(0, 0, -6).move(0.85, 1.3, 0)).glow();
}

const PAGES = '#f6ecd4';
const GILT = '#f2c14e';

/**
 * A closed hardcover, tipped toward the camera a little and turned to show its cover and page
 * edges. The gilt bands on the rounded spine wrap onto the cover, so they show from the front.
 */
function book(color = '#b3222c') {
  const [w, h, t, b] = [1, 1.36, 0.42, 0.06];
  const spine = (r: number, y: number, hh: number, c: string) => cylinder(r, hh, 10, c).scale(0.42, 1, 1).move(-w / 2 + 0.04, y, 0);
  const lines = texture(6, 1, (x) => (x % 2 ? hex('#e2d4b4') : [1, 1, 1]));
  // The page edges face away from the light, so they're overbright to stay cream in shade.
  const pages = box(w - 0.1, h - 0.1, t - 2 * b, [1.5, 1.4, 1.1]).move(0, h / 2, 0);
  new Mesh(pages.tris.slice(4, 6)).material({ tex: lines });
  const m = Mesh.of(
    box(w, h, b, color).move(0, h / 2, t / 2 - b / 2),
    box(w, h, b, color).move(0, h / 2, -t / 2 + b / 2),
    spine(t / 2, 0, h, color),
    pages,
    box(0.5, 0.28, 0.02, GILT).move(0.08, h * 0.7, t / 2),
  );
  for (const y of [0.14, 0.8]) m.add(spine(t / 2 + 0.02, h * y, 0.09, GILT), box(0.16, 0.09, 0.02, GILT).move(-w / 2 + 0.08, h * y + 0.045, t / 2));
  return m.rotate(16);
}

/** A book lying flat with its spine toward +z: covers top and bottom, page edges on the other sides. */
function flatBook(w: number, d: number, t: number, color: string) {
  const b = 0.05;
  return Mesh.of(
    box(w, b, d, color).move(0, b / 2, 0),
    box(w, b, d, color).move(0, t - b / 2, 0),
    box(w, t, 0.08, color).move(0, t / 2, d / 2 - 0.04),
    box(w - 0.08, t - 2 * b, d - 0.08, PAGES).move(0, t / 2, -0.04),
    box(0.12, t + 0.01, 0.09, GILT).move(-w * 0.3, t / 2, d / 2 - 0.04),
    box(0.12, t + 0.01, 0.09, GILT).move(w * 0.3, t / 2, d / 2 - 0.04),
  );
}

function books(color = '#3a6fd8') {
  const stack: [number, number, number, string, number, number][] = [
    [1.7, 1.15, 0.38, '#2e9b5a', 0, 0],
    [1.45, 1.0, 0.3, '#e8a524', 9, 0.08],
    [1.6, 1.1, 0.36, '#c8323a', -7, -0.05],
    [1.35, 0.95, 0.32, color, 14, 0.06],
  ];
  const m = new Mesh();
  let y = 0;
  for (const [w, d, t, c, a, x] of stack) {
    m.add(flatBook(w, d, t, c).rotate(0, a).move(x, y, 0));
    y += t;
  }
  return m;
}

/** A puffy, faceted heart: the classic curve, extruded with its center pushed out. */
function heart(color = '#ec2140') {
  const outline = Array.from({ length: 28 }, (_, i): P => {
    const a = (i / 28) * Math.PI * 2;
    return [-(Math.sin(a) ** 3), (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16];
  });
  return extrude(outline, 0.34, color, 0.34).smooth(1);
}

function football() {
  const r = (x: number) => 0.62 * (1 - x * x) ** 0.75;
  const ball = lathe(Array.from({ length: 9 }, (_, i): P => [r(-1 + i / 4), -1 + i / 4]), 12, '#b0602e').rotate(0, 0, 90);
  const lace = '#ffffff';
  const m = Mesh.of(ball, beam([-0.4, r(0.4) + 0.03, 0], [0, r(0) + 0.03, 0], 0.09, lace), beam([0, r(0) + 0.03, 0], [0.4, r(0.4) + 0.03, 0], 0.09, lace));
  for (let i = 0; i < 5; i++) {
    const x = -0.3 + i * 0.15;
    m.add(box(0.09, 0.07, 0.34, lace).move(x, r(x) + 0.03, 0));
  }
  for (const s of [90, -90]) m.add(lathe([[r(0.56) + 0.015, 0.56], [r(0.68) + 0.015, 0.68]], 12, lace).rotate(0, 0, s));
  return m.rotate(62).rotate(0, 0, 16);
}

/** A truncated icosahedron: black pentagons at the icosahedron's corners, white hexagons on its faces. */
function soccerball() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const ico: Vec3[] = [];
  for (const a of [-1, 1]) for (const b of [-phi, phi]) ico.push([0, a, b], [a, b, 0], [b, 0, a]);
  const edge = (p: Vec3, q: Vec3) => Math.abs(Math.hypot(...sub(p, q)) - 2) < 1e-6;
  const third = (p: Vec3, q: Vec3): Vec3 => normalize([p[0] + (q[0] - p[0]) / 3, p[1] + (q[1] - p[1]) / 3, p[2] + (q[2] - p[2]) / 3]);
  const ball = new Mesh();
  for (const v of ico) ball.add(facet(ico.filter((u) => edge(u, v)).map((u) => third(v, u)), '#23242e'));
  ico.forEach((a, i) =>
    ico.forEach((b, j) =>
      ico.forEach((c, k) => {
        if (i < j && j < k && edge(a, b) && edge(b, c) && edge(c, a)) ball.add(facet([third(a, b), third(b, a), third(b, c), third(c, b), third(c, a), third(a, c)], '#f6f6f2'));
      }),
    ),
  );
  return ball.smooth(30).rotate(18.7);
}

function bomb() {
  const body = sphere(1, 12, '#2a2d42').paint(shine([0, 0, 0], [-0.5, 0.6, 0.6], '#7d88c0', 2));
  const top = Mesh.of(cylinder(0.36, 0.3, 10, '#9aa3b2').move(0, 0.84, 0), cylinder(0.42, 0.09, 10, '#c9d0da').move(0, 1.08, 0));
  const fuse: Vec3[] = [[0, 1.12, 0], [0.06, 1.38, 0], [0.26, 1.58, 0], [0.52, 1.6, 0]];
  fuse.slice(1).forEach((p, i) => top.add(beam(fuse[i], p, 0.13, '#e6c88e')));
  top.add(Mesh.of(extrude(polygon(8, 0.36, 0.14), 0.06, '#ffc21a'), sphere(0.13, 8, '#fff7cf')).glow().move(0.56, 1.6, 0.06));
  const glint = sphere(0.16, 8, '#eef2ff').scale(1, 1.3, 0.3).rotate(0, -30, 30).move(-0.42, 0.42, 0.78).glow();
  return Mesh.of(body, top.rotate(0, 0, -28), glint);
}

/** A gold crown: a band with five points, a ball on each, and a jewel under each point. */
function crown(jewel = '#e8203a') {
  const gold = '#f7c531';
  const m = Mesh.of(
    lathe([[0.86, 0], [1, 0], [1, 0.5], [0.86, 0.5], [0.86, 0]], 10, gold).paint((p, c) => (Math.hypot(p[0], p[2]) < 0.9 ? mul(c, 0.6) : c)),
    lathe([[1, 0], [1.06, 0.02], [1.06, 0.13], [1, 0.15]], 10, '#ffe17a'),
  );
  for (let i = 0; i < 5; i++) {
    m.add(
      Mesh.of(
        cylinder(0.3, 0.62, 4, gold, 0).scale(1, 1, 0.32).move(0, 0.48, 0.93),
        sphere(0.11, 8, '#ffe17a').move(0, 1.13, 0.93),
        sphere(0.13, 8, jewel).scale(1, 1, 0.55).move(0, 0.3, 1.0),
      ).rotate(0, i * 72),
    );
  }
  return m;
}

/** A collectible: unlit, with its light baked in, so it stays bright gold under any sky. */
function coin() {
  const face = () => Mesh.of(lathe([[1, 0.17], [0.78, 0.17]], 14, '#ffe45c'), lathe([[0.78, 0.17], [0.74, 0.1]], 14, '#d9890c'), lathe([[0.74, 0.1], [0, 0.1]], 14, '#ffc61f'));
  const m = Mesh.of(lathe([[1, -0.17], [1, 0.17]], 14, '#e8900c'), face(), face().rotate(180)).rotate(90);
  m.add(star('#fff1a0').scale(0.42).move(0, 0, 0.08), star('#fff1a0').scale(0.42).rotate(0, 180).move(0, 0, -0.08));
  return m.paint((p, c) => mix(mul(c, 0.72), mix(c, [1, 1, 0.85], 0.25), clamp((p[1] - p[0] * 0.4 + 1) / 2))).glow();
}

/** A texture that averages 3×3 samples per texel, so stars and diagonals come out smooth. */
const sampled = (w: number, h: number, fn: (x: number, y: number) => RGB) =>
  texture(w, h, (x, y) => {
    let s: RGB = [0, 0, 0];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s = mix(s, fn(x + (i + 0.5) / 3, y + (j + 0.5) / 3), 1 / (i * 3 + j + 1));
    return s;
  });

function inside(poly: P[], x: number, y: number) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [[xi, yi], [xj, yj]] = [poly[i], poly[j]];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

const [RED, WHITE] = [hex('#d8202c'), hex('#ffffff')];

/** Flag cloths, drawn top row first. Kept simple so each reads at icon size. */
const FLAGS: Record<string, () => Texture> = {
  pt: () =>
    sampled(16, 12, (x, y) => {
      const d = Math.hypot(x - 6.2, y - 6);
      if (d < 1.2) return WHITE;
      if (d < 1.7) return RED;
      if (d < 2.9) return hex('#ffd91a');
      return x < 6.2 ? hex('#0a7a3a') : hex('#e2231a');
    }),
  us: () =>
    sampled(16, 14, (x, y) => {
      if (x < 7 && y < 8) return Math.hypot((x % 2) - 1, (y % 2) - 1) < 0.42 ? WHITE : hex('#1f2c74');
      return Math.floor(y / 2) % 2 ? WHITE : RED;
    }),
  eu: () =>
    sampled(16, 12, (x, y) => {
      for (let i = 0; i < 12; i++) if (Math.hypot(x - 8 - 3.8 * Math.cos((i * Math.PI) / 6), y - 6 - 3.8 * Math.sin((i * Math.PI) / 6)) < 0.8) return hex('#ffd800');
      return hex('#1f3d9c');
    }),
  uk: () =>
    sampled(16, 12, (x, y) => {
      const [dx, dy] = [x - 8, y - 6];
      if (Math.abs(dx) < 1.1 || Math.abs(dy) < 1.1) return RED;
      if (Math.abs(dx) < 2 || Math.abs(dy) < 2) return WHITE;
      const diagonal = Math.min(Math.abs(dx * 6 - dy * 8), Math.abs(dx * 6 + dy * 8)) / 10;
      return diagonal < 0.5 ? RED : diagonal < 1.3 ? WHITE : hex('#1f3a8a');
    }),
  fr: () => sampled(15, 2, (x) => (x < 5 ? hex('#1c3fa0') : x < 10 ? WHITE : hex('#e8222e'))),
  tx: () =>
    sampled(15, 12, (x, y) => {
      if (x < 5) return inside(polygon(5, 2.4, 0.95), x - 2.5, 6 - y) ? WHITE : hex('#1a3a8f');
      return y < 6 ? WHITE : hex('#cf1f30');
    }),
};

/** A flag on a pole, waving: a subdivided cloth that ripples more the farther it is from the pole. */
function flag(country = 'pt') {
  const tex = (FLAGS[country] ?? FLAGS.pt)();
  const cloth = terrain(1, 10, (x, z) => Math.sin((x + 0.5) * 7 - z * 0.8) * 0.09 * (x + 0.6), () => [1, 1, 1]);
  const inset = (u: number, n: number) => (0.5 + u * (n - 1)) / n;
  for (const t of cloth.tris) for (const v of t.v) v.uv = [inset(v.p[0] + 0.5, tex.w), inset(v.p[2] + 0.5, tex.h)];
  return Mesh.of(
    cloth.material({ tex, twoSided: true }).rotate(90).scale(1.65, 1.1, 1).move(0.88, 1.5, 0),
    cylinder(0.065, 2.1, 8, '#dfe3e8'),
    sphere(0.12, 8, '#f2c14e').move(0, 2.15, 0),
    cylinder(0.24, 0.1, 8, '#7a828e'),
  );
}

/** A map marker: a teardrop with a white dot in its head. */
function pin(color = '#e8322e') {
  const m = lathe([[0, 0], [0.1, 0.22], [0.26, 0.52], [0.44, 0.8], [0.55, 1.06], [0.53, 1.32], [0.42, 1.52], [0.22, 1.64], [0, 1.68]], 12, color).scale(1, 1, 0.8);
  return m.paint(shine([0, 1.1, 0], [-0.5, 0.6, 0.6], mix(hex(color), [1, 1, 1], 0.5), 3)).add(sphere(0.21, 10, '#ffffff').scale(1, 1, 0.4).move(0, 1.1, 0.42));
}

/** A floating "?" block. Box faces put texture row 0 at the bottom, so the art is flipped. */
function questionblock() {
  const glyph = ['.qqqqq.', 'qq...qq', 'qq...qq', '....qq.', '...qq..', '...qq..', '.......', '...qq..', '...qq..'];
  const q = (x: number, y: number) => glyph[y - 3]?.[x - 4] === 'q';
  const face = (mark: boolean) =>
    texture(16, 16, (x, yy) => {
      const y = 15 - yy;
      if (mark && q(x, y)) return hex('#fff8e6');
      if (mark && q(x - 1, y - 1)) return hex('#6b3a0c');
      if (x === 0 || y === 0 || x === 15 || y === 15) return hex('#c06a10');
      if ((x === 2 || x === 13) && (y === 2 || y === 13)) return hex('#6b3a0c');
      return hex('#f8b51c');
    });
  const block = box(1, 1, 1, '#ffffff');
  return Mesh.of(new Mesh(block.tris.slice(0, 8)).material({ tex: face(true) }), new Mesh(block.tris.slice(8)).material({ tex: face(false) }));
}

/** A bullseye on a little easel. */
function target() {
  const face = new Mesh();
  [1, 0.8, 0.6, 0.4, 0.2].forEach((r, i) => face.add(cylinder(r, 0.14 + i * 0.02, 14, i % 2 ? '#ffffff' : '#e3262b').rotate(90)));
  const wood = '#9a6332';
  return Mesh.of(
    face.move(0, 0, -0.07).rotate(-12).move(0, 1.25, 0),
    beam([-0.62, 0, 0.2], [-0.2, 1.3, -0.12], 0.11, wood),
    beam([0.62, 0, 0.2], [0.2, 1.3, -0.12], 0.11, wood),
    beam([0, 0, -0.8], [0, 1.45, -0.2], 0.11, wood),
  );
}

function speechbubble() {
  const white = '#f4f7ff';
  const m = Mesh.of(
    extrude(polygon(18, 1).map(([x, y]): P => [x * 1.3, y * 0.9]), 0.36, white, 0.16).smooth(40),
    extrude([[-0.75, -0.5], [-0.15, -0.6], [-0.95, -1.3]], 0.3, white),
  );
  for (const x of [-0.46, 0, 0.46]) m.add(sphere(0.15, 8, '#33405e').scale(1, 1, 0.5).move(x, 0, 0.29 - Math.abs(x) * 0.12));
  return m;
}

function barchart(color = '#3aa8ff') {
  const c = hex(color);
  const m = Mesh.of(box(2.1, 0.14, 0.95, '#eef1f6').move(0, 0.07, 0));
  [0.55, 0.9, 1.3, 1.8].forEach((h, i) => m.add(box(0.38, h, 0.48, c).paint(fade(mul(c, 0.6), mix(c, [1, 1, 1], 0.2), -h / 2, h / 2)).move(-0.72 + i * 0.48, 0.14 + h / 2, 0)));
  return m;
}

/** A police beacon: a glowing red dome, brightest where the lamp inside points, throwing rays. */
function siren() {
  const dome = lathe([[0.62, 0.38], [0.62, 0.8], [0.56, 1.02], [0.42, 1.18], [0.22, 1.28], [0, 1.31]], 12, '#ff2a2a')
    .paint((p) => mix(hex('#c0101c'), hex('#ffb0a0'), clamp(dot(normalize([p[0], 0, p[2]]), normalize([-0.4, 0, 0.9]))) ** 3 * clamp(1.3 - p[1])))
    .glow();
  const rays = new Mesh();
  for (const a of [10, 45, 90, 135, 170]) rays.add(box(0.36, 0.1, 0.04, '#ffd84a').move(1.2, 0, 0).rotate(0, 0, a));
  return Mesh.of(cylinder(0.8, 0.26, 12, '#2c3038'), cylinder(0.7, 0.14, 12, '#c3c9d2').move(0, 0.24, 0), dome, rays.glow().move(0, 0.75, 0));
}

function medkit() {
  const red = '#e0262c';
  const dark = '#4a4f5a';
  return Mesh.of(
    box(1.5, 1.0, 0.66, '#f4f4f0').move(0, 0.5, 0),
    box(1.53, 0.05, 0.69, '#c9ccd2').move(0, 0.78, 0),
    box(0.58, 0.19, 0.04, red).move(0, 0.42, 0.34),
    box(0.19, 0.58, 0.04, red).move(0, 0.42, 0.34),
    box(0.1, 0.18, 0.14, dark).move(-0.32, 1.06, 0),
    box(0.1, 0.18, 0.14, dark).move(0.32, 1.06, 0),
    box(0.74, 0.1, 0.16, dark).move(0, 1.18, 0),
    box(0.12, 0.14, 0.04, '#b9bec7').move(-0.55, 0.8, 0.35),
    box(0.12, 0.14, 0.04, '#b9bec7').move(0.55, 0.8, 0.35),
  );
}

/** A ring of radius `r` and tube `t` in the xy plane. `sweep` 180 makes it a U. */
const hoop = (r: number, t: number, c: string, sweep = 360) =>
  lathe(Array.from({ length: 9 }, (_, i): P => [r + t * Math.cos((i / 8) * Math.PI * 2), t * Math.sin((i / 8) * Math.PI * 2)]), 12, c, sweep).rotate(-90, 0, -90);

function anchor() {
  const iron = '#46505f';
  const fluke = extrude([[0, 0.36], [-0.2, -0.1], [0, 0], [0.2, -0.1]], 0.12, iron);
  return Mesh.of(
    box(0.18, 1.6, 0.18, iron).move(0, 0.9, 0),
    hoop(0.2, 0.07, iron).move(0, 1.92, 0),
    box(0.95, 0.15, 0.15, iron).move(0, 1.52, 0),
    sphere(0.11, 8, iron).move(-0.48, 1.52, 0),
    sphere(0.11, 8, iron).move(0.48, 1.52, 0),
    hoop(0.68, 0.09, iron, 180).move(0, 0.75, 0),
    fluke.clone().rotate(0, 0, 30).move(-0.7, 0.76, 0),
    fluke.clone().rotate(0, 0, -30).move(0.7, 0.76, 0),
    sphere(0.14, 8, iron).move(0, 0.08, 0),
  ).paint(shine([0, 1, 0], [-0.3, 0.5, 1], '#8a9ab0', 2));
}

/**
 * Glass is opaque here, so the sand is painted onto it, up to a level on the upright part of
 * each bulb (the camera looks down, so the undersides near the neck never show).
 */
function hourglass() {
  const wood = '#8a4f24';
  const sand = hex('#f7a823');
  const glass = hex('#b4e2ff');
  const bulb = lathe([[0.12, 0.16], [0.42, 0.22], [0.47, 0.3], [0.47, 0.46], [0.47, 0.49], [0.45, 0.6], [0.2, 0.8], [0.08, 0.9], [0.2, 1.0], [0.45, 1.2], [0.47, 1.28], [0.47, 1.38], [0.47, 1.41], [0.47, 1.5], [0.42, 1.58], [0.12, 1.64]], 10, '#ffffff');
  const m = Mesh.of(
    bulb.paint((p) => (p[1] < 0.47 || (p[1] > 0.85 && p[1] < 1.39) ? sand : glass)),
    cylinder(0.64, 0.16, 10, wood),
    cylinder(0.64, 0.16, 10, wood).move(0, 1.64, 0),
  );
  for (let i = 0; i < 3; i++) m.add(cylinder(0.065, 1.5, 6, wood).move(0, 0.15, 0.52).rotate(0, 40 + i * 120));
  return m;
}

function scales() {
  const gold = '#eab526';
  const m = Mesh.of(
    lathe([[0, 0], [0.55, 0], [0.55, 0.08], [0.35, 0.16], [0.14, 0.26], [0, 0.26]], 12, gold),
    cylinder(0.09, 1.45, 8, gold).move(0, 0.2, 0),
    sphere(0.15, 8, gold).move(0, 1.8, 0),
    box(2.1, 0.13, 0.13, gold).move(0, 1.6, 0),
  );
  for (const s of [-1, 1]) {
    const x = s * 0.98;
    m.add(sphere(0.09, 6, gold).move(x, 1.6, 0), beam([x, 1.6, 0], [x - 0.4, 0.86, 0], 0.075, gold), beam([x, 1.6, 0], [x + 0.4, 0.86, 0], 0.075, gold));
    m.add(lathe([[0, 0], [0.3, 0], [0.5, 0.12], [0.53, 0.17], [0, 0.17]], 12, gold).move(x, 0.72, 0));
  }
  return m.paint(fade('#b07810', '#ffe070', 0, 1.9));
}

function apple() {
  const red = '#d81e1a';
  const body = lathe([[0, 0.08], [0.2, 0.02], [0.45, 0.06], [0.62, 0.26], [0.68, 0.52], [0.64, 0.78], [0.5, 0.96], [0.28, 1.0], [0.1, 0.92], [0, 0.88]], 12, red);
  const leaf = extrude([[0, 0], [0.14, 0.09], [0.32, 0.09], [0.48, 0], [0.32, -0.08], [0.14, -0.09]], 0.04, '#3fb43a', 0.03);
  return Mesh.of(
    body.paint(shine([0, 0.5, 0], [-0.5, 0.7, 0.6], '#ff9a8a', 4)),
    beam([0, 0.86, 0], [0.06, 1.26, 0], 0.08, '#6b4320'),
    leaf.rotate(0, 0, 25).rotate(-30, 0, 0).move(0.05, 1.12, 0),
  );
}

/** A heater shield with a silver rim and a white star. */
function shield(color = '#2f6fd8') {
  const outline = (s: number): [number, number][] => {
    const pts: [number, number][] = [[-0.8 * s, 0.9 * s], [0.8 * s, 0.9 * s]];
    for (let i = 1; i <= 6; i++) {
      const t = i / 6;
      pts.push([0.8 * s * Math.cos((t * Math.PI) / 2) ** 0.8, 0.9 * s - 1.9 * s * Math.sin((t * Math.PI) / 2)]);
    }
    for (let i = 5; i >= 1; i--) {
      const t = i / 6;
      pts.push([-0.8 * s * Math.cos((t * Math.PI) / 2) ** 0.8, 0.9 * s - 1.9 * s * Math.sin((t * Math.PI) / 2)]);
    }
    return pts.reverse();
  };
  return Mesh.of(
    extrude(outline(1), 0.16, '#d6dbe2', 0.06),
    extrude(outline(0.84), 0.2, color, 0.14).move(0, 0.04, 0.04),
    extrude(polygon(5, 0.42, 0.18), 0.08, '#ffffff', 0.05).move(0, 0.08, 0.24),
  );
}

export const SYMBOLS = {
  star: { build: star, float: true, turn: -15 },
  shield: { build: shield, float: true, turn: -20 },
  zzz: { build: zzz, float: true, turn: -20 },
  book: { build: book, turn: -30 },
  books: { build: books, turn: -15 },
  heart: { build: heart, float: true, turn: -15 },
  football: { build: football, float: true, turn: -10 },
  soccerball: { build: soccerball, turn: 22 },
  bomb: { build: bomb, turn: -10 },
  crown: { build: crown, float: true, turn: 22 },
  coin: { build: coin, float: true, turn: -18 },
  flag: { build: flag, turn: -15 },
  pin: { build: pin, float: true, turn: 15 },
  questionblock: { build: questionblock, float: true, turn: -10 },
  target: { build: target, turn: -15 },
  speechbubble: { build: speechbubble, float: true, turn: -15 },
  barchart: { build: barchart, turn: -25 },
  siren: { build: siren, turn: 0 },
  medkit: { build: medkit, turn: -20 },
  anchor: { build: anchor, float: true, turn: 10 },
  hourglass: { build: hourglass, turn: 0 },
  scales: { build: scales, turn: 10 },
  apple: { build: apple, turn: -10 },
} satisfies Record<string, Model>;
