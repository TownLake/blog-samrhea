/** Things you can hold or keep at home or at a desk: devices, tools, furniture. */
import { beam, box, cylinder, extrude, hex, lathe, mix, Mesh, plane, sphere, texture, type RGB } from '../mesh.ts';
import type { Model } from './index.ts';

const CHROME = '#d6dbe2';

/** A rounded rectangle outline, counter-clockwise, for slabs: phones, cards, boards. */
function rounded(w: number, h: number, r: number, steps = 3): [number, number][] {
  const corners = [[w / 2 - r, -h / 2 + r, -90], [w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180]];
  return corners.flatMap(([x, y, a0]) =>
    Array.from({ length: steps + 1 }, (_, i): [number, number] => {
      const a = ((a0 + (i / steps) * 90) * Math.PI) / 180;
      return [x + Math.cos(a) * r, y + Math.sin(a) * r];
    }),
  );
}

/** A rounded slab facing +z, centered on the origin. */
const slab = (w: number, h: number, d: number, r: number, c: RGB | string) => extrude(rounded(w, h, r), d, c);

/** A disc facing +z, centered on the origin: dials, lenses, knobs. */
const disc = (r: number, d: number, c: RGB | string, sides = 14) => cylinder(r, d, sides, c).rotate(90).move(0, 0, -d / 2);

/** A ring around the y axis: rims, bows, handles. `sweep` 180 makes an arch. */
const torus = (R: number, r: number, c: RGB | string, sides = 14, sweep = 360, seg = 8) =>
  lathe(Array.from({ length: seg + 1 }, (_, i): [number, number] => [R + r * Math.cos((i / seg) * Math.PI * 2), r * Math.sin((i / seg) * Math.PI * 2)]), sides, c, sweep);

/** A flat ring around the y axis, with a hole: gears, watch bands. */
const annulus = (inner: number, outer: number, h: number, sides: number, c: RGB | string) =>
  lathe([[inner, -h / 2], [outer, -h / 2], [outer, h / 2], [inner, h / 2], [inner, -h / 2]], sides, c);

/** Lines of text on a pale page, for screens and paper. */
const page = (w: number, h: number, paper: string, ink: string) =>
  texture(w, h, (x, y) => (y % 2 === 1 && x > 0 && x < w - 1 - ((y * 7) % 3 === 0 ? 2 : 0) && y < h - 1 ? hex(ink) : hex(paper)));

function laptop() {
  const shell = '#c9cdd3';
  const screen = texture(8, 8, (x, y) => (y > 1 && y < 7 && x > 0 && x < 7 && (y % 2 === 0) && x < 3 + ((y * 5) % 4) ? hex('#ffffff') : hex('#9fd4ff')));
  return Mesh.of(
    box(1.3, 0.06, 0.9, shell).move(0, 0.03, 0),
    box(1.1, 0.01, 0.4, '#9ea3aa').move(0, 0.065, -0.12),
    box(1.3, 0.86, 0.05, shell).move(0, 0.43, 0).rotate(-14).move(0, 0.03, -0.45),
    plane(1.16, 0.74, '#ffffff', screen).glow().move(0, 0.43, 0.03).rotate(-14).move(0, 0.03, -0.45),
  );
}

function padlock(color = '#f2b51c') {
  const steel = '#d6dbe2';
  const shackle = lathe(
    Array.from({ length: 9 }, (_, i): [number, number] => [0.34 + 0.08 * Math.cos((i / 8) * Math.PI * 2), 0.08 * Math.sin((i / 8) * Math.PI * 2)]),
    10,
    steel,
    180,
  ).rotate(-90, 0, 90);
  return Mesh.of(
    box(1, 0.82, 0.42, color).move(0, 0.41, 0),
    box(0.9, 0.06, 0.44, mix(hex(color), [1, 1, 1], 0.35)).move(0, 0.8, 0),
    shackle.move(0, 1.1, 0),
    cylinder(0.08, 0.32, 8, steel).move(0.34, 0.8, 0),
    cylinder(0.08, 0.32, 8, steel).move(-0.34, 0.8, 0),
    cylinder(0.09, 0.02, 8, '#3a2a10').rotate(90).move(0, 0.48, 0.22),
    box(0.07, 0.2, 0.02, '#3a2a10').move(0, 0.34, 0.22),
  );
}

function mousetrap() {
  const wood = '#c99a5b';
  const metal = '#c9ced6';
  const m = Mesh.of(box(1.3, 0.08, 0.6, wood).move(0, 0.04, 0));
  m.add(beam([-0.45, 0.12, 0.25], [0.15, 0.12, 0.25], 0.035, metal), beam([-0.45, 0.12, -0.25], [0.15, 0.12, -0.25], 0.035, metal), beam([0.15, 0.12, 0.25], [0.15, 0.12, -0.25], 0.035, metal));
  m.add(cylinder(0.07, 0.4, 8, metal).rotate(90).move(-0.45, 0.13, 0.2));
  m.add(box(0.16, 0.03, 0.16, '#b8a888').move(0.42, 0.1, 0));
  m.add(extrude([[0, 0], [0.32, 0], [0.32, 0.2]], 0.24, '#ffcf3a').move(0.3, 0.11, 0));
  return m;
}

function crib() {
  const wood = '#f3efe6';
  const m = Mesh.of(
    box(1.5, 0.16, 0.86, wood).move(0, 0.5, 0),
    box(1.38, 0.14, 0.76, '#ffffff').move(0, 0.64, 0),
    box(1.0, 0.1, 0.72, '#9cc8f0').move(0.18, 0.75, 0),
    sphere(1, 8, '#ffffff').scale(0.18, 0.08, 0.26).move(-0.5, 0.76, 0),
  );
  for (const [x, z] of [[0.74, 0.42], [-0.74, 0.42], [0.74, -0.42], [-0.74, -0.42]]) m.add(box(0.12, 1.3, 0.12, wood).move(x, 0.65, z), sphere(0.09, 6, wood).move(x, 1.36, z));
  for (const z of [0.42, -0.42]) {
    m.add(box(1.5, 0.1, 0.1, wood).move(0, 1.2, z));
    for (let i = 1; i < 6; i++) m.add(box(0.07, 0.6, 0.07, wood).move(-0.74 + i * 0.247, 0.88, z));
  }
  for (const x of [0.74, -0.74]) m.add(box(0.1, 0.1, 0.86, wood).move(x, 1.2, 0));
  return m;
}

/** A wooden CRT set showing color bars, with rabbit ears. */
function tv() {
  const wood = '#b8692f';
  const dark = '#3a2618';
  const bars = texture(14, 1, (x) => hex(['#f4f4f4', '#f6d93a', '#3fd8e6', '#46d052', '#e64ad2', '#ec3d2f', '#3f52e8'][x >> 1]));
  const m = Mesh.of(
    box(1.5, 1.1, 1.0, wood).move(0, 0.72, 0),
    box(1.1, 0.8, 0.45, '#8f4f22').move(0, 0.72, -0.7),
    box(1.08, 0.88, 0.06, '#2a2420').move(-0.16, 0.72, 0.5),
    plane(0.96, 0.76, '#ffffff', bars).glow().move(-0.16, 0.72, 0.535),
  );
  for (const y of [0.98, 0.72]) m.add(disc(0.1, 0.1, '#efe6d2', 10).move(0.56, y, 0.53));
  for (let i = 0; i < 3; i++) m.add(box(0.22, 0.04, 0.02, dark).move(0.56, 0.48 - i * 0.08, 0.51));
  for (const [x, z] of [[0.6, 0.38], [-0.6, 0.38], [0.6, -0.38], [-0.6, -0.38]]) m.add(box(0.12, 0.2, 0.12, dark).move(x, 0.1, z));
  m.add(sphere(0.16, 8, '#2a2a2e').scale(1, 0.6, 1).move(0, 1.27, -0.1));
  for (const s of [-1, 1]) m.add(beam([0, 1.3, -0.1], [s * 0.55, 2.05, -0.25], 0.07, CHROME), sphere(0.09, 6, CHROME).move(s * 0.55, 2.05, -0.25));
  return m;
}

/** A beige desktop PC: CRT monitor on a flat case, keyboard in front. */
function computer() {
  const beige = '#e8dcb8';
  const shade = '#cdbf98';
  const desktop = texture(8, 8, (x, y) => (x > 0 && x < 7 && y > 0 && y < 6 ? (y === 1 ? hex('#2a3fae') : hex('#e2e2e2')) : hex('#1fa89c')));
  const m = Mesh.of(
    box(1.5, 0.34, 1.1, beige).move(0, 0.17, 0),
    box(0.5, 0.06, 0.5, shade).move(0, 0.37, -0.05),
    box(1.2, 0.95, 0.85, beige).move(0, 0.875, -0.05),
    box(0.86, 0.68, 0.4, shade).move(0, 0.86, -0.67),
    box(1.0, 0.78, 0.02, '#4a4538').move(0, 0.9, 0.38),
    plane(0.92, 0.7, '#ffffff', desktop).glow().move(0, 0.9, 0.395),
    box(1.44, 0.08, 0.48, beige).move(0, 0.04, 0.92),
  );
  for (const y of [0.24, 0.12]) m.add(box(0.44, 0.05, 0.02, '#5c5444').move(0.38, y, 0.555));
  m.add(box(0.06, 0.06, 0.02, '#4dff6a').glow().move(-0.6, 0.12, 0.555));
  for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) m.add(box(0.12, 0.05, 0.1, '#f6efd8').move(-0.6 + i * 0.15, 0.1, 0.78 + r * 0.13));
  return m;
}

/** A smartphone standing up, its screen full of app icons. The variant is the case color. */
function phone(color = '#3a3d44') {
  const apps = ['#ff5a5a', '#ffd23a', '#4ad66d', '#3ad0ff', '#ff8a3a', '#ffffff', '#b46bff', '#ff6bc1'];
  const screen = texture(10, 17, (x, y) => {
    const col = [1, 4, 7].findIndex((c) => x === c || x === c + 1);
    const row = [2, 5, 8, 11, 14].findIndex((r) => y === r || y === r + 1);
    return col >= 0 && row >= 0 ? hex(apps[(row * 3 + col) % apps.length]) : mix(hex('#2d4fd8'), hex('#a24bd6'), y / 16);
  });
  return Mesh.of(
    slab(0.92, 1.8, 0.14, 0.16, color),
    plane(0.8, 1.64, '#ffffff', screen).glow().move(0, 0, 0.075),
    box(0.04, 0.3, 0.08, color).move(0.47, 0.4, 0),
  ).rotate(-12);
}

/** Tiny 3×5 digits for screens. */
const DIGITS: Record<string, string> = { '0': '###|#.#|#.#|#.#|###', '1': '.#.|##.|.#.|.#.|###', '9': '###|#.#|###|..#|###' };

/** A smartwatch: the time glowing on its face, a loop of band, the crown on its side. */
function watch() {
  const rows = ['10', '09'];
  const face = texture(9, 13, (x, y) => {
    const [row, line, col, dx] = [Math.floor((y - 1) / 6), (y - 1) % 6, Math.floor((x - 1) / 4), (x - 1) % 4];
    const lit = y > 0 && row < 2 && line < 5 && x > 0 && col < 2 && dx < 3 && DIGITS[rows[row][col]].split('|')[line][dx] === '#';
    return hex(lit ? (row ? '#5fe8ff' : '#ffffff') : '#0a0c14');
  });
  return Mesh.of(
    annulus(0.56, 0.66, 0.4, 16, '#ff6a3c').rotate(0, 0, 90).scale(1, 1, 0.6),
    slab(0.7, 0.82, 0.2, 0.18, '#2a2d34').move(0, 0, 0.42),
    plane(0.56, 0.68, '#ffffff', face).glow().move(0, 0, 0.525),
    disc(0.08, 0.12, CHROME, 8).rotate(0, 90).move(0.38, 0.12, 0.42),
  );
}

function stopwatch() {
  const m = Mesh.of(
    lathe([[0, -0.18], [0.74, -0.18], [0.84, -0.08], [0.84, 0.08], [0.74, 0.18], [0, 0.18]], 16, CHROME).rotate(90),
    disc(0.7, 0.02, '#fbfbf6', 16).move(0, 0, 0.18),
    cylinder(0.1, 0.2, 8, CHROME).move(0, 0.8, 0),
    cylinder(0.18, 0.14, 10, CHROME).move(0, 0.98, 0),
    torus(0.13, 0.05, CHROME, 10).rotate(90).move(0, 1.25, 0),
    cylinder(0.08, 0.2, 8, CHROME).move(0, 0.78, 0).rotate(0, 0, -40),
    cylinder(0.12, 0.08, 8, CHROME).move(0, 0.96, 0).rotate(0, 0, -40),
  );
  for (let i = 0; i < 12; i++) m.add(box(0.06, i % 3 ? 0.1 : 0.18, 0.02, '#2a2a2e').move(0, 0.56, 0.2).rotate(0, 0, i * 30));
  m.add(beam([0, -0.12, 0.21], [0.25, 0.46, 0.21], 0.07, '#e8322a', 0.02), disc(0.08, 0.04, '#e8322a', 10).move(0, 0, 0.22));
  return m;
}

/** A red alarm clock with twin bells and a hammer between them. */
function clock() {
  const red = '#e2322b';
  const m = Mesh.of(
    lathe([[0, -0.24], [0.62, -0.24], [0.72, -0.14], [0.72, 0.14], [0.62, 0.24], [0, 0.24]], 16, red).rotate(90),
    disc(0.6, 0.02, '#fbf8ee', 16).move(0, 0, 0.24),
    beam([0, 0, 0.27], [-0.24, 0.22, 0.27], 0.08, '#222', 0.02),
    beam([0, 0, 0.28], [0.26, 0.4, 0.28], 0.06, '#222', 0.02),
    disc(0.06, 0.04, '#222', 8).move(0, 0, 0.29),
    beam([0, 0.7, 0], [0, 0.94, 0], 0.06, CHROME),
    box(0.24, 0.1, 0.1, CHROME).move(0, 0.96, 0),
  );
  for (let i = 0; i < 12; i++) m.add(box(0.05, i % 3 ? 0.07 : 0.13, 0.02, '#2a2a2a').move(0, 0.5, 0.26).rotate(0, 0, i * 30));
  for (const s of [-1, 1]) {
    m.add(lathe([[0, 0], [0.34, 0], [0.32, 0.1], [0.25, 0.24], [0.12, 0.31], [0, 0.32]], 12, red).move(0, 0.04, 0).rotate(0, 0, -s * 38).move(s * 0.42, 0.6, -0.02));
    m.add(beam([s * 0.4, -0.55, 0], [s * 0.56, -0.86, 0], 0.1, CHROME), sphere(0.08, 6, CHROME).move(s * 0.56, -0.86, 0));
  }
  return m;
}

function camera() {
  const body = '#2e3138';
  const m = Mesh.of(
    slab(1.5, 0.95, 0.5, 0.14, body),
    box(1.22, 0.1, 0.44, '#cfd4dc').move(0, 0.52, 0),
    cylinder(0.42, 0.12, 14, '#cfd4dc').rotate(90).move(0.05, -0.05, 0.24),
    cylinder(0.36, 0.22, 14, '#1d1f24').rotate(90).move(0.05, -0.05, 0.36),
    cylinder(0.3, 0.04, 14, '#cfd4dc').rotate(90).move(0.05, -0.05, 0.58),
    disc(0.25, 0.02, '#3c6fd0', 14).glow().move(0.05, -0.05, 0.62),
    sphere(0.06, 6, '#ffffff').glow().move(-0.04, 0.05, 0.62),
    box(0.32, 0.2, 0.04, '#fffbe6').glow().move(-0.5, 0.26, 0.26),
    box(0.2, 0.14, 0.04, '#1d1f24').move(0.52, 0.28, 0.26),
    cylinder(0.12, 0.1, 10, '#e2322b').move(0.48, 0.57, 0),
  );
  return m;
}

/** A retro studio microphone: a ribbed chrome capsule in a yoke on a short stand. */
function microphone() {
  const m = Mesh.of(
    lathe([[0, 0], [0.2, 0.02], [0.3, 0.1], [0.35, 0.25], [0.35, 0.65], [0.3, 0.8], [0.2, 0.88], [0, 0.9]], 12, '#7c8490').move(0, 0.72, 0),
    cylinder(0.42, 0.08, 14, CHROME).move(0, 0, 0),
    cylinder(0.06, 0.5, 8, CHROME).move(0, 0.08, 0),
    beam([-0.44, 0.58, 0], [0.44, 0.58, 0], 0.09, CHROME),
  );
  for (let i = 0; i < 6; i++) {
    const y = 0.86 + i * 0.12;
    const r = i === 0 || i === 5 ? 0.31 : 0.355;
    m.add(torus(r, 0.045, CHROME, 12, 360, 4).move(0, y, 0));
  }
  for (const s of [-1, 1]) m.add(beam([s * 0.44, 0.54, 0], [s * 0.44, 1.18, 0], 0.09, CHROME), disc(0.1, 0.1, '#9aa2ac', 10).rotate(0, 90).move(s * 0.42, 1.17, 0));
  return m;
}

/** A film projector, lens forward (+z), with two reels on top seen from its side. */
function projector() {
  const body = '#5b6f86';
  const reel = (r: number) => {
    const m = Mesh.of(cylinder(r, 0.1, 16, CHROME).rotate(0, 0, 90).move(0.05, 0, 0), disc(r * 0.2, 0.06, '#8a929c', 10).rotate(0, 90).move(0.07, 0, 0));
    for (let i = 0; i < 3; i++) {
      const a = ((i * 120 + 30) * Math.PI) / 180;
      m.add(disc(r * 0.26, 0.02, '#1a1d22', 10).rotate(0, 90).move(0.06, Math.sin(a) * r * 0.56, Math.cos(a) * r * 0.56));
    }
    return m;
  };
  const m = Mesh.of(
    box(0.7, 0.62, 1.3, body).move(0, 0.38, 0),
    cylinder(0.24, 0.08, 12, CHROME).rotate(90).move(0, 0.42, 0.62),
    cylinder(0.2, 0.36, 12, '#22262c').rotate(90).move(0, 0.42, 0.66),
    disc(0.16, 0.02, '#fff2b0', 12).glow().move(0, 0.42, 1.03),
    reel(0.42).move(0, 1.15, 0.36),
    reel(0.46).move(0, 1.2, -0.44),
    beam([-0.12, 0.69, 0.3], [-0.12, 1.15, 0.36], 0.09, '#3a4656'),
    beam([-0.12, 0.69, -0.36], [-0.12, 1.2, -0.44], 0.09, '#3a4656'),
  );
  for (const [x, z] of [[0.28, 0.55], [-0.28, 0.55], [0.28, -0.55], [-0.28, -0.55]]) m.add(box(0.1, 0.08, 0.1, '#2a2e36').move(x, 0.04, z));
  return m;
}

/** A typewriter: sloped body, rows of round keys, roller with a sheet of paper. */
function typewriter() {
  const body = '#3fae9a';
  // Side profile [forward, up], extruded across x.
  const side: [number, number][] = [[0.6, 0], [0.6, 0.14], [-0.15, 0.5], [-0.62, 0.56], [-0.62, 0]];
  const m = Mesh.of(
    extrude(side.map(([u, y]): [number, number] => [-u, y]).reverse(), 1.5, body).rotate(0, 90),
    box(1.64, 0.22, 0.34, body).move(0, 0.66, -0.42),
    cylinder(0.14, 1.6, 10, '#2a2a2e').rotate(0, 0, 90).move(0.8, 0.82, -0.42),
    box(0.9, 0.08, 0.1, '#f2ecdc').move(0, 0.12, 0.66),
  );
  for (const s of [-1, 1]) m.add(cylinder(0.12, 0.1, 10, '#2a2a2e').rotate(0, 0, 90).move(s * 0.86 + 0.05, 0.82, -0.42));
  const paper = page(8, 8, '#fbfaf3', '#8a8a92');
  m.add(box(1.0, 0.72, 0.03, '#fbfaf3').rotate(-14).move(0, 1.2, -0.5), plane(0.9, 0.62, '#ffffff', paper).rotate(-14).move(0, 1.2, -0.48));
  for (let r = 0; r < 3; r++)
    for (let i = 0; i < 7; i++) {
      const [z, y] = [0.42 - r * 0.2, 0.25 + r * 0.095];
      m.add(cylinder(0.07, 0.06, 8, '#f2ecdc').move(-0.54 + i * 0.18 + (r % 2) * 0.05, y, z), cylinder(0.03, 0.08, 4, '#22262c').move(-0.54 + i * 0.18 + (r % 2) * 0.05, y - 0.06, z));
    }
  return m;
}

/** An e-reader: pale screen with lines of text in a dark bezel. */
function ereader() {
  return Mesh.of(
    slab(1.2, 1.6, 0.1, 0.1, '#2c2f36'),
    plane(1.0, 1.2, '#ffffff', page(8, 12, '#ecebe2', '#6a6a72')).glow().move(0, 0.08, 0.055),
  ).rotate(-14);
}

function floppy() {
  const blue = '#2a7fe6';
  return Mesh.of(
    extrude([[-0.5, -0.5], [0.5, -0.5], [0.5, 0.42], [0.42, 0.5], [-0.5, 0.5]], 0.08, blue),
    box(0.52, 0.36, 0.1, '#cfd4dc').move(0.04, 0.3, 0),
    box(0.12, 0.24, 0.11, '#1d2a40').move(0.14, 0.32, 0),
    box(0.76, 0.48, 0.1, '#fbfaf3').move(0, -0.2, 0),
    box(0.6, 0.04, 0.105, '#8fb4e8').move(0, -0.14, 0),
    box(0.6, 0.04, 0.105, '#8fb4e8').move(0, -0.28, 0),
  ).rotate(-20, 0, 8);
}

/** An AA battery that's almost flat: one red band of charge left at the bottom. */
function battery() {
  return Mesh.of(
    cylinder(0.32, 1.3, 12, '#4a505c').move(0, 0.06, 0),
    cylinder(0.3, 0.06, 12, CHROME),
    cylinder(0.33, 0.14, 12, CHROME).move(0, 1.3, 0),
    cylinder(0.13, 0.12, 10, CHROME).move(0, 1.44, 0),
    cylinder(0.335, 0.22, 12, '#ff3a2a').glow().move(0, 0.1, 0),
  ).rotate(0, 0, -35);
}

/** A desk calendar block showing the 17th. */
function calendar() {
  const ink = '#2a2a32';
  const m = Mesh.of(
    box(1.2, 1.0, 0.5, '#fbfaf3').move(0, 0.5, 0),
    box(1.24, 0.34, 0.54, '#e2322b').move(0, 1.17, 0),
    // 1
    beam([-0.24, 0.18, 0.26], [-0.24, 0.82, 0.26], 0.13, ink, 0.02),
    beam([-0.24, 0.8, 0.26], [-0.38, 0.68, 0.26], 0.11, ink, 0.02),
    // 7
    beam([0.04, 0.78, 0.26], [0.42, 0.78, 0.26], 0.13, ink, 0.02),
    beam([0.4, 0.8, 0.26], [0.16, 0.18, 0.26], 0.13, ink, 0.02),
  );
  for (const x of [-0.32, 0.32]) m.add(torus(0.12, 0.04, '#cfd4dc', 10).rotate(0, 0, 90).move(x, 1.36, 0));
  return m.rotate(-8);
}

/** A clipboard holding a checklist. */
function clipboard() {
  const m = Mesh.of(
    slab(1.1, 1.5, 0.08, 0.08, '#b07a3c'),
    box(0.94, 1.22, 0.02, '#fbfaf5').move(0, -0.07, 0.05),
    box(0.5, 0.2, 0.14, CHROME).move(0, 0.68, 0.05),
    cylinder(0.12, 0.5, 10, CHROME).rotate(0, 0, 90).move(0.25, 0.78, 0.04),
  );
  for (let i = 0; i < 4; i++) {
    const y = 0.32 - i * 0.28;
    m.add(beam([-0.38, y, 0.07], [-0.31, y - 0.07, 0.07], 0.06, '#2fb84a', 0.02), beam([-0.31, y - 0.07, 0.07], [-0.18, y + 0.1, 0.07], 0.06, '#2fb84a', 0.02));
    m.add(box(0.5 - (i % 2) * 0.12, 0.05, 0.02, '#8a8a92').move(0.12 - (i % 2) * 0.06, y - 0.02, 0.065));
  }
  return m.rotate(-16);
}

/** A manila folder with papers peeking out of the top. */
function folder() {
  return Mesh.of(
    extrude([[-0.7, -0.5], [0.7, -0.5], [0.7, 0.5], [-0.08, 0.5], [-0.18, 0.68], [-0.62, 0.68], [-0.7, 0.5]], 0.04, '#e89a2a').move(0, 0, -0.06),
    box(1.24, 0.94, 0.02, '#ffffff').rotate(0, 0, -3).move(0.08, -0.02, -0.025),
    box(1.2, 0.9, 0.02, '#e8eaf2').rotate(0, 0, 4).move(-0.02, -0.04, -0.01),
    box(1.4, 0.72, 0.04, '#ffb83a').move(0, 0.36, 0).rotate(4).move(0, -0.5, 0.02),
  ).rotate(-24);
}

/** A three-drawer filing cabinet. */
function filecabinet() {
  const m = Mesh.of(box(1.0, 1.8, 0.96, '#6d7783').move(0, 0.9, 0));
  for (let i = 0; i < 3; i++) {
    const y = 0.32 + i * 0.58;
    m.add(box(0.9, 0.5, 0.06, '#c3cad3').move(0, y, 0.49));
    m.add(box(0.4, 0.1, 0.08, '#2f343c').move(0, y - 0.06, 0.55), box(0.24, 0.12, 0.02, '#fbfaf3').move(0, y + 0.13, 0.525));
  }
  return m;
}

/** A bank card with a chip and a stripe. The variant is the card color. */
function creditcard(color = '#2a56c8') {
  const [r, g, b] = hex(color);
  const m = Mesh.of(
    slab(1.58, 1.0, 0.05, 0.08, color).paint((p, c) => mix(c, [1, 1, 1], Math.max(0, p[0] + p[1]) * 0.18)),
    box(1.58, 0.18, 0.06, 0.3 * r + 0.59 * g + 0.11 * b < 0.2 ? '#6a707c' : '#1c1e24').move(0, 0.26, 0),
    box(0.28, 0.21, 0.07, '#f2c23a').move(-0.48, -0.06, 0),
    box(0.02, 0.21, 0.075, '#b8892a').move(-0.48, -0.06, 0),
    box(0.28, 0.02, 0.075, '#b8892a').move(-0.48, -0.06, 0),
  );
  for (let i = 0; i < 4; i++) m.add(box(0.26, 0.07, 0.06, '#dfe6f5').move(-0.51 + i * 0.34, -0.32, 0));
  return m.rotate(-20, 0, 10);
}

/** A big old-fashioned key: round bow, long shaft, toothed bit. */
function key() {
  const gold = '#ffa81a';
  return Mesh.of(
    torus(0.32, 0.1, gold, 14).rotate(90).move(-0.78, 0, 0),
    cylinder(0.09, 1.4, 8, gold).rotate(0, 0, -90).move(-0.48, 0, 0),
    cylinder(0.13, 0.12, 10, gold).rotate(0, 0, -90).move(-0.46, 0, 0),
    box(0.12, 0.42, 0.14, gold).move(0.84, -0.18, 0),
    box(0.12, 0.3, 0.14, gold).move(0.6, -0.12, 0),
    box(0.36, 0.1, 0.14, gold).move(0.72, -0.34, 0),
  ).rotate(0, 0, 30);
}

function magnifier() {
  return Mesh.of(
    torus(0.5, 0.09, CHROME, 16).rotate(90),
    disc(0.5, 0.03, '#a8dcff', 16).glow(),
    box(0.1, 0.32, 0.06, '#ffffff').glow().rotate(0, 0, 35).move(-0.2, 0.2, 0.02),
    cylinder(0.08, 0.16, 8, CHROME).rotate(180).move(0, -0.56, 0),
    cylinder(0.13, 0.8, 8, '#8a4f24', 0.11).rotate(180).move(0, -0.7, 0),
  ).rotate(0, 0, 40);
}

/** A yellow hexagonal pencil, eraser up and to the right. */
function pencil() {
  return Mesh.of(
    cylinder(0.06, 0.12, 6, '#2a2a2e', 0).rotate(180).move(0, 0.12, 0),
    cylinder(0.2, 0.38, 6, '#f2c894', 0.06).rotate(180).move(0, 0.5, 0),
    cylinder(0.2, 1.4, 6, '#ffb000').move(0, 0.5, 0),
    cylinder(0.21, 0.24, 10, '#cfd4dc').move(0, 1.9, 0),
    cylinder(0.215, 0.04, 10, '#9aa2ac').move(0, 1.96, 0),
    cylinder(0.215, 0.04, 10, '#9aa2ac').move(0, 2.06, 0),
    lathe([[0, 0], [0.2, 0], [0.2, 0.18], [0.16, 0.24], [0, 0.26]], 10, '#ff8fa8').move(0, 2.14, 0),
  ).rotate(0, 30, -50);
}

/** An on/off toggle switch, switched on: a green pill with the knob to the right. */
function toggle() {
  return Mesh.of(
    extrude(rounded(1.6, 0.8, 0.4, 5), 0.3, '#3ee05e', 0.05),
    disc(0.32, 0.22, '#ffffff', 16).move(0.4, 0, 0.12),
    box(0.06, 0.3, 0.04, '#ffffff').move(-0.36, 0, 0.19),
  ).rotate(-28);
}

/** A steel cog with a hub. */
function gear() {
  const steel = '#9eaab8';
  const m = Mesh.of(annulus(0.24, 0.72, 0.28, 20, steel), annulus(0.16, 0.34, 0.36, 12, '#7c8796'));
  for (let i = 0; i < 10; i++) m.add(box(0.28, 0.28, 0.24, steel).move(0, 0, 0.8).rotate(0, i * 36));
  return m.rotate(90).rotate(-15, 0, 10);
}

/** A toothbrush with a blob of paste on its bristles. The variant is the handle color. */
function toothbrush(color = '#2f7fe8') {
  const m = Mesh.of(
    box(1.4, 0.14, 0.26, color).move(-0.45, 0, 0),
    beam([0.24, 0, 0], [0.6, 0.06, 0], 0.12, color, 0.2),
    box(0.62, 0.12, 0.28, color).move(0.9, 0.08, 0),
    box(0.5, 0.06, 0.18, '#ffffff').move(-0.6, 0.08, 0),
  );
  for (let i = 0; i < 4; i++) for (const z of [-0.07, 0.07]) m.add(box(0.11, 0.24, 0.11, i % 2 ? '#bfe4ff' : '#ffffff').move(0.68 + i * 0.145, 0.26, z));
  const paste = [[0.62, 0.48, 0.16], [0.78, 0.52, 0.18], [0.95, 0.5, 0.17], [1.1, 0.56, 0.13]];
  for (const [x, y, r] of paste) m.add(sphere(r, 10, '#ffffff').move(x, y, 0));
  return m.rotate(0, 0, 22);
}

function briefcase() {
  const leather = '#8a4f24';
  const brass = '#f0c044';
  const m = Mesh.of(
    slab(1.6, 1.1, 0.46, 0.1, leather),
    box(1.62, 0.06, 0.48, '#6a3a18').move(0, 0.24, 0),
    torus(0.22, 0.06, '#5a3016', 10, 180).rotate(-90, 0, 90).move(0, 0.6, 0),
  );
  for (const s of [-1, 1]) m.add(box(0.16, 0.18, 0.06, brass).move(s * 0.46, 0.26, 0.24), box(0.1, 0.08, 0.1, brass).move(s * 0.22, 0.58, 0));
  return m;
}

export const OBJECTS = {
  laptop: { build: laptop, turn: -15 },
  padlock: { build: padlock, float: true, turn: -20 },
  mousetrap: { build: mousetrap, turn: -20 },
  crib: { build: crib, turn: -10 },
  tv: { build: tv, turn: -15 },
  computer: { build: computer, turn: -15 },
  phone: { build: phone, turn: -10 },
  watch: { build: watch, turn: -12 },
  stopwatch: { build: stopwatch, float: true, turn: -15 },
  clock: { build: clock, turn: -10 },
  camera: { build: camera, turn: -15 },
  microphone: { build: microphone, turn: -15 },
  projector: { build: projector, turn: -60 },
  typewriter: { build: typewriter, turn: -15 },
  ereader: { build: ereader, turn: -10 },
  floppy: { build: floppy, float: true, turn: -15 },
  battery: { build: battery, float: true, turn: -10 },
  calendar: { build: calendar, turn: -15 },
  clipboard: { build: clipboard, turn: -10 },
  folder: { build: folder, float: true, turn: -10 },
  filecabinet: { build: filecabinet, turn: -8 },
  creditcard: { build: creditcard, float: true, turn: -10 },
  key: { build: key, float: true, turn: -10 },
  magnifier: { build: magnifier, float: true, turn: -10 },
  pencil: { build: pencil, float: true, turn: -10 },
  toggle: { build: toggle, float: true, turn: -10 },
  gear: { build: gear, float: true, turn: -10 },
  toothbrush: { build: toothbrush, float: true, turn: -15 },
  briefcase: { build: briefcase, turn: -15 },
} satisfies Record<string, Model>;
