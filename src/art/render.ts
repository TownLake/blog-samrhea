/**
 * A small software rasterizer that draws the way the Nintendo 64 did: lighting computed
 * per vertex and blended across faces (Gouraud), blurry bilinear textures, distance fog,
 * soft anti-aliased edges, and a 16-bit framebuffer smoothed out with ordered dithering.
 */
import { cross, dot, mix, normalize, sub, random, type Mesh, type RGB, type Texture, type Tri, type Vec3 } from './mesh.ts';

export interface Scene {
  camera: { eye: Vec3; target: Vec3; fov: number };
  sky: Sky;
  fog: { color: RGB; near: number; far: number };
  /** `dir` points toward the light. */
  light: { dir: Vec3; color: RGB };
  ambient: RGB;
  meshes: Mesh[];
  /** The color of the edge drawn around outlined meshes. */
  outline?: RGB;
}

export interface Sky {
  zenith: RGB;
  horizon: RGB;
  /** A sun or moon painted into the sky. `phase` cuts a crescent out of it. */
  orb?: { dir: Vec3; color: RGB; size: number; glow?: number; phase?: number };
  /** How many stars to scatter above the horizon. */
  stars?: number;
  /** Soft clouds painted low in the sky, as on an N64 skybox. 0 is clear, 1 is overcast. */
  clouds?: number;
  seed?: string;
}

const RAD = Math.PI / 180;
const NEAR = 0.05;

/** Renders a square image and returns it as 8-bit RGB. `ss` is the supersampling factor. */
export function render(scene: Scene, size: number, { ss = 3, dither = true } = {}) {
  const W = size * ss;
  const H = size * ss;
  const color = new Float32Array(W * H * 3);
  const depth = new Float32Array(W * H);
  const shaded = new Uint8Array(W * H);
  const subject = new Uint8Array(W * H);

  const { eye, target, fov } = scene.camera;
  const fwd = normalize(sub(target, eye));
  const right = normalize(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);
  const focal = W / 2 / Math.tan((fov / 2) * RAD);

  drawSky(scene.sky, color, W, H, (x, y) => normalize([
    right[0] * (x - W / 2) + up[0] * (H / 2 - y) + fwd[0] * focal,
    right[1] * (x - W / 2) + up[1] * (H / 2 - y) + fwd[1] * focal,
    right[2] * (x - W / 2) + up[2] * (H / 2 - y) + fwd[2] * focal,
  ]), (d) => {
    const z = dot(d, fwd);
    return z > 0 ? [W / 2 + (dot(d, right) / z) * focal, H / 2 - (dot(d, up) / z) * focal] : undefined;
  }, ss);

  const { fog, ambient } = scene;
  const light = { ...scene.light, dir: normalize(scene.light.dir) };

  // Shadows go last so they only darken what's already drawn.
  const tris = scene.meshes.flatMap((m) => m.tris);
  const ordered = [...tris.filter((t) => !t.m.shadow), ...tris.filter((t) => t.m.shadow)];

  for (const t of ordered) {
    const [a, b, c] = t.v;
    const facing = dot(cross(sub(b.p, a.p), sub(c.p, a.p)), sub(eye, a.p));
    if (facing <= 0 && !t.m.twoSided) continue;
    const flip = facing <= 0 ? -1 : 1;

    // Per-vertex work: light, then move into view space and work out the fog.
    const verts = t.v.map((v) => {
      let rgb = v.c;
      if (t.m.lit) {
        const n: Vec3 = [v.n[0] * flip, v.n[1] * flip, v.n[2] * flip];
        // Ambient light comes mostly from above, so undersides fall into shade.
        const k = Math.max(0, dot(n, light.dir));
        const sky = 0.78 + 0.22 * n[1];
        rgb = [v.c[0] * (ambient[0] * sky + light.color[0] * k), v.c[1] * (ambient[1] * sky + light.color[1] * k), v.c[2] * (ambient[2] * sky + light.color[2] * k)];
      }
      const d = sub(v.p, eye);
      const z = dot(d, fwd);
      const f = Math.min(1, Math.max(0, (z - fog.near) / (fog.far - fog.near)));
      return { x: dot(d, right), y: dot(d, up), z, a: [rgb[0], rgb[1], rgb[2], f, v.uv[0], v.uv[1]] };
    });

    for (const piece of clipNear(verts)) {
      const screen = piece.map((v) => ({ sx: W / 2 + (v.x / v.z) * focal, sy: H / 2 - (v.y / v.z) * focal, iz: 1 / v.z, a: v.a }));
      raster(screen, t, W, H, color, depth, shaded, subject, fog.color);
    }
  }

  return resolve(color, subject, W, ss, dither, scene.outline);
}

type ViewVertex = { x: number; y: number; z: number; a: number[] };

/** Cuts a triangle against the near plane, returning zero, one or two triangles. */
function clipNear(v: ViewVertex[]): ViewVertex[][] {
  const inside = v.filter((p) => p.z >= NEAR);
  if (inside.length === 3) return [v];
  if (inside.length === 0) return [];
  const out: ViewVertex[] = [];
  for (let i = 0; i < 3; i++) {
    const p = v[i];
    const q = v[(i + 1) % 3];
    if (p.z >= NEAR) out.push(p);
    if (p.z >= NEAR !== q.z >= NEAR) {
      const t = (NEAR - p.z) / (q.z - p.z);
      out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t, z: NEAR, a: p.a.map((x, k) => x + (q.a[k] - x) * t) });
    }
  }
  return out.length === 3 ? [out] : [[out[0], out[1], out[2]], [out[0], out[2], out[3]]];
}

type ScreenVertex = { sx: number; sy: number; iz: number; a: number[] };

function raster(v: ScreenVertex[], t: Tri, W: number, H: number, color: Float32Array, depth: Float32Array, shaded: Uint8Array, subject: Uint8Array, fogColor: RGB) {
  const [p0, p1, p2] = v;
  const area = (p1.sx - p0.sx) * (p2.sy - p0.sy) - (p1.sy - p0.sy) * (p2.sx - p0.sx);
  if (Math.abs(area) < 1e-9) return;
  const minX = Math.max(0, Math.floor(Math.min(p0.sx, p1.sx, p2.sx)));
  const maxX = Math.min(W - 1, Math.ceil(Math.max(p0.sx, p1.sx, p2.sx)));
  const minY = Math.max(0, Math.floor(Math.min(p0.sy, p1.sy, p2.sy)));
  const maxY = Math.min(H - 1, Math.ceil(Math.max(p0.sy, p1.sy, p2.sy)));
  const edge = (a: ScreenVertex, b: ScreenVertex, x: number, y: number) => ((b.sx - a.sx) * (y - a.sy) - (b.sy - a.sy) * (x - a.sx)) / area;

  // Attributes are divided by z so they interpolate correctly in perspective.
  const pa = v.map((p) => p.a.map((x) => x * p.iz));
  const { tex, shadow, outline } = t.m;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const w0 = edge(p1, p2, px, py);
      const w1 = edge(p2, p0, px, py);
      const w2 = 1 - w0 - w1;
      if (w0 < 0 || w1 < 0 || w2 < 0) continue;
      const iz = w0 * p0.iz + w1 * p1.iz + w2 * p2.iz;
      const i = y * W + x;
      if (iz <= depth[i]) continue;

      if (shadow) {
        if (!shaded[i]) {
          shaded[i] = 1;
          color[i * 3] *= 0.45;
          color[i * 3 + 1] *= 0.45;
          color[i * 3 + 2] *= 0.5;
        }
        continue;
      }

      const at = (k: number) => (w0 * pa[0][k] + w1 * pa[1][k] + w2 * pa[2][k]) / iz;
      let rgb: RGB = [at(0), at(1), at(2)];
      if (tex) {
        const s = sample(tex, at(4), at(5));
        rgb = [rgb[0] * s[0], rgb[1] * s[1], rgb[2] * s[2]];
      }
      rgb = mix(rgb, fogColor, at(3));
      depth[i] = iz;
      subject[i] = outline ? 1 : 0;
      color[i * 3] = rgb[0];
      color[i * 3 + 1] = rgb[1];
      color[i * 3 + 2] = rgb[2];
    }
  }
}

function sample(t: Texture, u: number, v: number): RGB {
  const x = u * t.w - 0.5;
  const y = v * t.h - 0.5;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const at = (i: number, j: number) => t.data[(((j % t.h) + t.h) % t.h) * t.w + (((i % t.w) + t.w) % t.w)];
  return mix(mix(at(x0, y0), at(x0 + 1, y0), fx), mix(at(x0, y0 + 1), at(x0 + 1, y0 + 1), fx), fy);
}

function drawSky(sky: Sky, color: Float32Array, W: number, H: number, ray: (x: number, y: number) => Vec3, project: (d: Vec3) => [number, number] | undefined, ss: number) {
  const orb = sky.orb && { ...sky.orb, dir: normalize(sky.orb.dir) };
  const bite = orb?.phase ? normalize([orb.dir[0] + orb.phase, orb.dir[1] + orb.phase * 0.4, orb.dir[2]]) : undefined;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = ray(x + 0.5, y + 0.5);
      const t = Math.min(1, Math.max(0, d[1] / 0.55));
      let rgb = mix(sky.horizon, sky.zenith, Math.pow(t, 0.7));
      if (sky.clouds && d[1] > 0) {
        const a = Math.atan2(d[0], d[2]);
        const n = noise(a * 9, (d[1] / (d[1] + 0.12)) * 6) * 0.65 + noise(a * 21, d[1] * 30) * 0.35;
        const cover = smooth(1 - sky.clouds * 0.9, 1.08 - sky.clouds * 0.9, n) * (1 - t * 0.6);
        rgb = mix(rgb, mix([1, 1, 1], sky.horizon, 0.25), cover);
      }
      if (orb) {
        const angle = Math.acos(Math.min(1, dot(d, orb.dir))) / RAD;
        if (orb.glow) rgb = mix(rgb, orb.color, orb.glow * Math.exp(-angle / (orb.size * 2.5)));
        const carved = bite && Math.acos(Math.min(1, dot(d, bite))) / RAD < orb.size;
        if (angle < orb.size && !carved) rgb = orb.color;
      }
      color.set(rgb, (y * W + x) * 3);
    }
  }
  if (!sky.stars) return;
  const rand = random(sky.seed ?? 'stars');
  for (let i = 0; i < sky.stars; i++) {
    const a = rand() * Math.PI * 2;
    const e = Math.asin(0.08 + rand() * 0.92);
    const at = project([Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a)]);
    if (!at) continue;
    const bright = 0.55 + rand() * 0.45;
    const r = rand() < 0.15 ? ss : Math.ceil(ss / 2);
    for (let dy = 0; dy < r; dy++)
      for (let dx = 0; dx < r; dx++) {
        const px = Math.floor(at[0]) + dx;
        const py = Math.floor(at[1]) + dy;
        if (px >= 0 && py >= 0 && px < W && py < H) color.set(mix([color[(py * W + px) * 3], color[(py * W + px) * 3 + 1], color[(py * W + px) * 3 + 2]], [1, 0.97, 0.88], bright), (py * W + px) * 3);
      }
  }
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Value noise, for clouds. */
function noise(x: number, y: number) {
  const hash = (i: number, j: number) => {
    const h = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return h - Math.floor(h);
  };
  const [i, j] = [Math.floor(x), Math.floor(y)];
  const [u, v] = [smooth(0, 1, x - i), smooth(0, 1, y - j)];
  return hash(i, j) * (1 - u) * (1 - v) + hash(i + 1, j) * u * (1 - v) + hash(i, j + 1) * (1 - u) * v + hash(i + 1, j + 1) * u * v;
}

// The N64 wrote 5 bits per channel and dithered to hide the banding.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/**
 * Averages each block of samples down to one pixel, draws the outline, then quantizes.
 * The outline darkens pixels just outside the subject, by how much they border it.
 */
function resolve(color: Float32Array, subject: Uint8Array, W: number, ss: number, dither: boolean, outline?: RGB) {
  const size = W / ss;
  const pixels = new Float32Array(size * size * 3);
  const cover = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = y * size + x;
      for (let j = 0; j < ss; j++) {
        for (let i = 0; i < ss; i++) {
          const s = (y * ss + j) * W + x * ss + i;
          cover[o] += subject[s] / (ss * ss);
          for (let k = 0; k < 3; k++) pixels[o * 3 + k] += color[s * 3 + k] / (ss * ss);
        }
      }
    }
  }

  const out = new Uint8Array(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = y * size + x;
      let rgb: RGB = [pixels[o * 3], pixels[o * 3 + 1], pixels[o * 3 + 2]];
      if (outline) {
        let near = 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const [nx, ny] = [x + dx, y + dy];
          if (nx >= 0 && ny >= 0 && nx < size && ny < size) near = Math.max(near, cover[ny * size + nx]);
        }
        rgb = mix(rgb, outline, Math.max(0, near - cover[o]) * 0.9);
      }
      for (let k = 0; k < 3; k++) {
        const c = Math.min(1, Math.max(0, rgb[k]));
        const value = dither ? Math.min(31, Math.max(0, Math.floor(c * 31 + (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16))) * (255 / 31) : c * 255;
        out[o * 3 + k] = Math.round(value);
      }
    }
  }
  return out;
}
