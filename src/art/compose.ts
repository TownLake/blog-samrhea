/**
 * Turns a post's art direction (a place, a time of day, and a prop or two) into a scene.
 * The result is meant to read as an icon, like an N64 inventory item, not a screenshot:
 * one subject filling the frame, outlined, over a plain sky and ground.
 */
import { MODELS, type Model, type ModelName } from './models/index.ts';
import { blobShadow, bounds, cross, dot, hex, mix, Mesh, normalize, plane, random, sub, terrain, texture, type RGB, type Vec3 } from './mesh.ts';
import type { Scene, Sky } from './render.ts';

export interface Prop {
  model: ModelName;
  /** A color, or a named option some models offer (a flag's country, a dog's breed). */
  variant?: string;
  /** Ground position [x, z], overriding the default arrangement. */
  at?: [number, number];
  /** Degrees around the vertical axis. */
  turn?: number;
  scale?: number;
  /** Height above the ground, for props that hover. */
  lift?: number;
}

export interface Art {
  place: PlaceName;
  time?: TimeName;
  /** The subject, and optionally a smaller accent. */
  props: (ModelName | Prop)[];
}

interface Time {
  /** The orb's `dir` is relative to the camera: [right, up, forward]. */
  sky: Omit<Sky, 'seed'>;
  light: { dir: Vec3; color: RGB };
  ambient: RGB;
}

const TIMES = {
  day: {
    sky: { zenith: hex('#2a5fd6'), horizon: hex('#cfe7ff'), clouds: 0.15, orb: { dir: [-0.25, 0.29, 1], color: hex('#fffbea'), size: 4, glow: 0.35 } },
    light: { dir: [-0.45, 0.8, 0.55], color: hex('#fff3dc') },
    ambient: hex('#7487b3'),
  },
  golden: {
    sky: { zenith: hex('#3f6fcf'), horizon: hex('#ffd59a'), clouds: 0.1, orb: { dir: [-0.24, 0.27, 1], color: hex('#fff4cc'), size: 4, glow: 0.6 } },
    light: { dir: [-0.75, 0.45, 0.4], color: hex('#ffd296') },
    ambient: hex('#776a92'),
  },
  dusk: {
    sky: { zenith: hex('#221f5c'), horizon: hex('#ff8656'), clouds: 0.08, orb: { dir: [-0.2, 0.235, 1], color: hex('#ffd77e'), size: 5, glow: 0.85 } },
    light: { dir: [-0.8, 0.35, 0.25], color: hex('#ff9a62') },
    ambient: hex('#5d4b85'),
  },
  night: {
    sky: { zenith: hex('#060a24'), horizon: hex('#26346c'), orb: { dir: [-0.25, 0.27, 1], color: hex('#f6f2d8'), size: 3.5, glow: 0.3, phase: 0.035 }, stars: 70 },
    light: { dir: [0.45, 0.7, 0.45], color: hex('#9fb2ee') },
    ambient: hex('#34407a'),
  },
  dawn: {
    sky: { zenith: hex('#5b86d8'), horizon: hex('#ffc4b0'), clouds: 0.1, orb: { dir: [0.24, 0.25, 1], color: hex('#fff1dc'), size: 4, glow: 0.5 } },
    light: { dir: [0.7, 0.45, 0.35], color: hex('#ffd8c4') },
    ambient: hex('#7c7caa'),
  },
  /** The checkerboard's light: dark violet all around, but a white key so colors stay true. */
  arcade: {
    sky: { zenith: hex('#0e0a2e'), horizon: hex('#4a3a98'), stars: 40 },
    light: { dir: [-0.4, 0.75, 0.6], color: hex('#fff6ea') },
    ambient: hex('#5a5490'),
  },
  /** Indoors after dark, lit by a screen. */
  lamplight: {
    sky: { zenith: hex('#0a0f22'), horizon: hex('#141c3a') },
    light: { dir: [0.2, 0.55, 0.8], color: hex('#a9c6ff') },
    ambient: hex('#3a3f66'),
  },
  space: {
    sky: { zenith: hex('#03040c'), horizon: hex('#0b1030'), orb: { dir: [0.26, 0.24, 1], color: hex('#ffb070'), size: 2.5, glow: 0.45 }, stars: 160 },
    light: { dir: [-0.6, 0.35, 0.5], color: hex('#ffe2c4') },
    ambient: hex('#2c3358'),
  },
} satisfies Record<string, Time>;

export type TimeName = keyof typeof TIMES;

/**
 * A place is only a backdrop: a ground and a sky with nothing in them to read, so the
 * subject stays the only thing in the picture.
 */
interface Place {
  time: TimeName;
  ground?: () => Mesh;
  /** Where props stand. */
  height?: number;
  fog: [number, number];
  /** Camera elevation in degrees. */
  elevation?: number;
  shadows?: boolean;
  sky?: Partial<Sky>;
}

const RAD = Math.PI / 180;

/** Flat ground that darkens a little toward the horizon before the fog takes it. */
const floor = (near: string, far: string, height = (_x: number, _z: number) => 0) =>
  terrain(80, 32, height, (x, _y, z) => mix(hex(near), hex(far), Math.min(1, Math.hypot(x, z) / 14)));

const water = texture(16, 16, (x, y) => {
  const wave = Math.sin((x + Math.sin(y * 0.8) * 2) * 0.8) * Math.sin(y * 0.4 + 1);
  return mix(hex('#1f4f8a'), hex('#7fb6e6'), Math.max(0, wave) ** 3);
});

const PLACES = {
  /** Texas: grass and low hills. */
  hills: {
    time: 'golden',
    fog: [6, 30],
    ground: () => floor('#8fa53c', '#b5a352', (x, z) => Math.max(0, Math.sin(x * 0.18 + 1) * 1.6 + Math.cos(z * 0.21) * 0.8) * Math.min(1, Math.max(0, (Math.hypot(x, z) - 6) / 8))),
  },
  /** Lisbon: pale limestone under a warm sky. */
  lisbon: {
    time: 'golden',
    fog: [6, 28],
    ground: () => floor('#e2d6bf', '#c9b48e'),
  },
  /** Open ocean. */
  sea: {
    time: 'day',
    fog: [10, 50],
    height: -0.08,
    ground: () => plane(200, 200, '#ffffff', water, [40, 40]).rotate(-90),
  },
  /** Deep space: stars and a distant sun. */
  space: {
    time: 'space',
    fog: [40, 400],
    elevation: 6,
    shadows: false,
  },
  /** A checkered floor running off into the dark, like a Mario 64 test level. */
  grid: {
    time: 'arcade',
    fog: [5, 22],
    ground: () => plane(100, 100, '#ffffff', texture(2, 2, (x, y) => ((x + y) % 2 ? hex('#7a6ce0') : hex('#4a40b8'))), [34, 34]).rotate(-90),
  },
  /** Inside after dark, lit by a screen. */
  indoors: {
    time: 'lamplight',
    fog: [4, 14],
    elevation: 18,
    ground: () => floor('#5a5f80', '#2a2e4a'),
  },
  /** Sand dunes. */
  desert: {
    time: 'golden',
    fog: [6, 30],
    ground: () => floor('#ecc882', '#d6a35c', (x, z) => (Math.sin(x * 0.35 + z * 0.12) * 0.7 + Math.cos(z * 0.3) * 0.4) * Math.min(1, Math.max(0, (Math.hypot(x, z) - 4) / 6))),
  },
  /** Fresh snow. */
  snow: {
    time: 'day',
    fog: [6, 30],
    ground: () => floor('#f6f9fd', '#cfdcee', (x, z) => Math.max(0, Math.sin(x * 0.2) * 1.4 + Math.cos(z * 0.25)) * Math.min(1, Math.max(0, (Math.hypot(x, z) - 6) / 8))),
  },
  /** A strip of sand with the sea behind it. */
  beach: {
    time: 'day',
    fog: [10, 50],
    ground: () =>
      Mesh.of(
        floor('#f1dfb0', '#e3c98c', (x, z) => -Math.max(0, Math.hypot(x, z * 1.6) - 4.5) * 0.25),
        plane(200, 200, '#ffffff', water, [40, 40]).rotate(-90).move(0, -0.12, 0),
      ),
  },
  /** City pavement. */
  city: {
    time: 'dusk',
    fog: [6, 28],
    ground: () => floor('#a3a7ae', '#6c727c'),
  },
  /** Above a sea of clouds. */
  clouds: {
    time: 'day',
    fog: [6, 30],
    height: 0.4,
    elevation: 6,
    ground: () => floor('#ffffff', '#c9d8f0', (x, z) => Math.sin(x * 0.9) * Math.cos(z * 0.8) * 0.3 + Math.sin(x * 0.31 + z * 0.4) * 0.45),
  },
} satisfies Record<string, Place>;

export type PlaceName = keyof typeof PLACES;
// For the frontmatter schema.
export const PLACE_NAMES = Object.keys(PLACES) as [PlaceName, ...PlaceName[]];
export const TIME_NAMES = Object.keys(TIMES) as [TimeName, ...TimeName[]];
export const MODEL_NAMES = Object.keys(MODELS) as [ModelName, ...ModelName[]];

/** The subject, and an optional accent: smaller, in front and to the right, overlapping it. */
const SLOTS: [number, number, number][] = [
  [0, 0, 1],
  [0.9, 0.75, 0.62],
];

export function compose(art: Art, seed: string): Scene {
  const rand = random(seed);
  const place: Place = PLACES[art.place];
  const time: Time = TIMES[art.time ?? place.time];
  const ground = place.height ?? 0;
  const props = art.props.slice(0, 2).map((p) => (typeof p === 'string' ? { model: p } : p));

  const meshes: Mesh[] = [];
  const subject = new Mesh();
  let reach = 0;
  props.forEach((prop, i) => {
    const model: Model = MODELS[prop.model];
    const mesh = model.build(prop.variant);
    const { min, max } = bounds(mesh);
    const radius = Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]) / 2;
    const [dx, dz, size] = SLOTS[i];
    const k = (1.1 * size * (prop.scale ?? 1)) / radius;
    mesh
      .move(-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2)
      .scale(k)
      .rotate(0, prop.turn ?? model.turn ?? 0);
    const footprint = (Math.max(max[0] - min[0], max[2] - min[2]) * k) / 2;
    if (i === 0) reach = footprint;
    const spacing = i === 0 ? 0 : (reach + footprint) * 0.62;
    const [x, z] = prop.at ?? [(dx / Math.hypot(dx, dz) || 0) * spacing, (dz / Math.hypot(dx, dz) || 0) * spacing];
    mesh.move(x, ground + (prop.lift ?? (model.float ? 0.25 + 0.25 * i : 0)), z);
    subject.add(mesh.material({ outline: true }));
    if (place.shadows !== false) meshes.push(blobShadow(Math.min(footprint, 1.2) * 0.8).scale(1, 1, 0.75).move(x, ground + 0.02, z));
  });
  meshes.push(subject);
  if (place.ground) meshes.push(place.ground());

  // A three-quarter view from a little above, turned a little differently for each post.
  const fov = 40;
  const { eye, target, view } = frame(subject, 22 + (rand() - 0.5) * 16, place.elevation ?? 13, fov);

  // Suns and moons are placed relative to the view, so they always land in the picture.
  const sky: Sky = { ...time.sky, ...place.sky, seed };
  if (sky.orb) sky.orb = { ...sky.orb, dir: view(sky.orb.dir) };
  return {
    camera: { eye, target, fov },
    sky,
    fog: { color: sky.horizon, near: place.fog[0], far: place.fog[1] },
    light: time.light,
    ambient: time.ambient,
    meshes,
    outline: mix(sky.horizon, [0.02, 0.02, 0.06], 0.82),
  };
}

/**
 * Places the camera at the given azimuth and elevation (degrees) so the subject fills the
 * frame: close enough that it reads at icon size, with every vertex inside the margin.
 */
function frame(subject: Mesh, azimuth: number, elevation: number, fov: number, margin = 0.9) {
  const [az, el] = [azimuth * RAD, elevation * RAD];
  const fwd: Vec3 = [-Math.sin(az) * Math.cos(el), -Math.sin(el), -Math.cos(az) * Math.cos(el)];
  const right = normalize(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);
  const reach = Math.tan((fov / 2) * RAD) * margin;
  const points = subject.tris.flatMap((t) => t.v.map((v) => v.p));
  const { min, max } = bounds(subject);
  let target: Vec3 = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  let distance = 0;
  // Fit, re-center on what the camera actually sees, and fit again.
  for (let pass = 0; ; pass++) {
    distance = 0;
    for (const p of points) {
      const q = sub(p, target);
      const z = dot(q, fwd);
      distance = Math.max(distance, Math.abs(dot(q, right)) / reach - z, Math.abs(dot(q, up)) / reach - z);
    }
    if (pass === 3) break;
    const seen = points.map((p) => {
      const q = sub(p, target);
      const z = dot(q, fwd) + distance;
      return [dot(q, right) / z, dot(q, up) / z];
    });
    const mx = (Math.min(...seen.map((s) => s[0])) + Math.max(...seen.map((s) => s[0]))) / 2;
    const my = (Math.min(...seen.map((s) => s[1])) + Math.max(...seen.map((s) => s[1]))) / 2;
    target = [target[0] + (right[0] * mx + up[0] * my) * distance, target[1] + (right[1] * mx + up[1] * my) * distance, target[2] + (right[2] * mx + up[2] * my) * distance];
  }
  const eye: Vec3 = [target[0] - fwd[0] * distance, target[1] - fwd[1] * distance, target[2] - fwd[2] * distance];
  /** Turns a direction given as [right, up, forward] from the camera into world space. */
  const view = ([x, y, z]: Vec3): Vec3 => [right[0] * x + up[0] * y + fwd[0] * z, right[1] * x + up[1] * y + fwd[1] * z, right[2] * x + up[2] * y + fwd[2] * z];
  return { eye, target, view };
}
