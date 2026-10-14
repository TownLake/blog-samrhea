/**
 * Low-poly geometry. Every model is built from a few primitives (box, lathe, extrude),
 * then moved, turned and painted. Angles are in degrees; y is up.
 */

export type Vec3 = [number, number, number];
export type RGB = [number, number, number];

export interface Vertex {
  p: Vec3;
  n: Vec3;
  c: RGB;
  uv: [number, number];
}

export interface Material {
  /** Unlit surfaces glow at their own color: screens, windows, the sun. */
  lit: boolean;
  /** Drawn from both sides, for flat things like sails and flags. */
  twoSided: boolean;
  tex?: Texture;
  /** A blob shadow: darkens whatever it lands on instead of drawing a color. */
  shadow?: boolean;
  /** Part of the subject, which gets a dark edge so it reads at icon size. */
  outline?: boolean;
}

export interface Tri {
  v: [Vertex, Vertex, Vertex];
  m: Material;
}

/** A tiny texture, sampled with bilinear filtering like the N64's blurry 32×32 textures. */
export interface Texture {
  w: number;
  h: number;
  data: RGB[];
}

export function texture(w: number, h: number, pixel: (x: number, y: number) => RGB): Texture {
  const data: RGB[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) data.push(pixel(x, y));
  return { w, h, data };
}

export const hex = (color: string): RGB => {
  const n = parseInt(color.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const mul = (a: RGB, k: number): RGB => [a[0] * k, a[1] * k, a[2] * k];

export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const normalize = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

const RAD = Math.PI / 180;

/** Seeded random numbers, so the same post always gets the same picture. */
export function random(seed: string | number) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export class Mesh {
  tris: Tri[];

  constructor(tris: Tri[] = []) {
    this.tris = tris;
  }

  static of(...meshes: Mesh[]) {
    return new Mesh(meshes.flatMap((m) => m.tris));
  }

  add(...meshes: Mesh[]) {
    for (const m of meshes) this.tris.push(...m.tris);
    return this;
  }

  clone() {
    return new Mesh(this.tris.map(({ v, m }) => ({ m, v: v.map((x) => ({ p: [...x.p], n: [...x.n], c: [...x.c], uv: [...x.uv] })) as Tri['v'] })));
  }

  private eachVertex(fn: (v: Vertex) => void) {
    const seen = new Set<Vertex>();
    for (const t of this.tris) for (const v of t.v) if (!seen.has(v)) seen.add(v), fn(v);
    return this;
  }

  move(x: number, y: number, z: number) {
    return this.eachVertex((v) => {
      v.p = [v.p[0] + x, v.p[1] + y, v.p[2] + z];
    });
  }

  scale(x: number, y = x, z = x) {
    return this.eachVertex((v) => {
      v.p = [v.p[0] * x, v.p[1] * y, v.p[2] * z];
      v.n = normalize([v.n[0] / x, v.n[1] / y, v.n[2] / z]);
    });
  }

  /** Rotates around x, then y, then z. */
  rotate(x: number, y = 0, z = 0) {
    const turn = (a: Vec3): Vec3 => {
      let [px, py, pz] = a;
      if (x) [py, pz] = [py * Math.cos(x * RAD) - pz * Math.sin(x * RAD), py * Math.sin(x * RAD) + pz * Math.cos(x * RAD)];
      if (y) [px, pz] = [px * Math.cos(y * RAD) + pz * Math.sin(y * RAD), -px * Math.sin(y * RAD) + pz * Math.cos(y * RAD)];
      if (z) [px, py] = [px * Math.cos(z * RAD) - py * Math.sin(z * RAD), px * Math.sin(z * RAD) + py * Math.cos(z * RAD)];
      return [px, py, pz];
    };
    return this.eachVertex((v) => {
      v.p = turn(v.p);
      v.n = turn(v.n);
    });
  }

  /** Repaints vertices, e.g. to darken toward the ground the way N64 artists baked in shading. */
  paint(fn: (p: Vec3, c: RGB) => RGB) {
    return this.eachVertex((v) => {
      v.c = fn(v.p, v.c);
    });
  }

  color(c: RGB | string) {
    const rgb = typeof c === 'string' ? hex(c) : c;
    return this.paint(() => rgb);
  }

  material(m: Partial<Material>) {
    for (const t of this.tris) t.m = { ...t.m, ...m };
    return this;
  }

  glow() {
    return this.material({ lit: false });
  }

  /**
   * Gouraud shading: vertices that share a position share a normal, unless the faces
   * meet at more than `crease` degrees (so a cylinder stays round but its caps stay flat).
   */
  smooth(crease = 50) {
    const faceNormal = (t: Tri) => normalize(cross(sub(t.v[1].p, t.v[0].p), sub(t.v[2].p, t.v[0].p)));
    const key = (p: Vec3) => p.map((x) => Math.round(x * 1e4)).join();
    const faces = this.tris.map((t) => ({ t, n: faceNormal(t) }));
    const byPoint = new Map<string, { n: Vec3 }[]>();
    for (const f of faces) for (const v of f.t.v) byPoint.set(key(v.p), [...(byPoint.get(key(v.p)) ?? []), f]);
    const limit = Math.cos(crease * RAD);
    for (const f of faces) {
      f.t.v = f.t.v.map((v) => {
        const shared = byPoint.get(key(v.p))!.filter((g) => dot(g.n, f.n) >= limit);
        const n = normalize(shared.reduce<Vec3>((s, g) => [s[0] + g.n[0], s[1] + g.n[1], s[2] + g.n[2]], [0, 0, 0]));
        return { ...v, n };
      }) as Tri['v'];
    }
    return this;
  }
}

const SOLID: Material = { lit: true, twoSided: false };

function tri(a: Vec3, b: Vec3, c: Vec3, color: RGB, uv: [number, number][] = [[0, 0], [1, 0], [1, 1]], m = SOLID): Tri {
  const n = normalize(cross(sub(b, a), sub(c, a)));
  return { m, v: [a, b, c].map((p, i) => ({ p, n, c: color, uv: uv[i] })) as Tri['v'] };
}

/** Two triangles, wound counter-clockwise when seen from the front. */
function quad(a: Vec3, b: Vec3, c: Vec3, d: Vec3, color: RGB, uv: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]]): Tri[] {
  return [tri(a, b, c, color, [uv[0], uv[1], uv[2]]), tri(a, c, d, color, [uv[0], uv[2], uv[3]])];
}

const rgb = (c: RGB | string) => (typeof c === 'string' ? hex(c) : c);

/** A box centered on the origin. */
export function box(w: number, h: number, d: number, c: RGB | string) {
  const [x, y, z] = [w / 2, h / 2, d / 2];
  const col = rgb(c);
  const p = (i: number): Vec3 => [i & 1 ? x : -x, i & 2 ? y : -y, i & 4 ? z : -z];
  return new Mesh([
    ...quad(p(4), p(5), p(7), p(6), col), // front
    ...quad(p(1), p(0), p(2), p(3), col), // back
    ...quad(p(5), p(1), p(3), p(7), col), // right
    ...quad(p(0), p(4), p(6), p(2), col), // left
    ...quad(p(6), p(7), p(3), p(2), col), // top
    ...quad(p(0), p(1), p(5), p(4), col), // bottom
  ]);
}

/**
 * Spins a profile of [radius, height] points around the y axis: cylinders, cones, domes,
 * spheres and towers are all lathes. `sweep` less than 360 leaves it open, like an arch.
 */
export function lathe(profile: [number, number][], sides: number, c: RGB | string, sweep = 360) {
  const col = rgb(c);
  const tris: Tri[] = [];
  const at = (r: number, y: number, i: number): Vec3 => {
    const a = (i / sides) * sweep * RAD;
    return [Math.sin(a) * r, y, Math.cos(a) * r];
  };
  for (let i = 0; i < sides; i++) {
    for (let j = 0; j < profile.length - 1; j++) {
      const [r0, y0] = profile[j];
      const [r1, y1] = profile[j + 1];
      const uv: [number, number][] = [
        [i / sides, j / profile.length],
        [(i + 1) / sides, j / profile.length],
        [(i + 1) / sides, (j + 1) / profile.length],
        [i / sides, (j + 1) / profile.length],
      ];
      const [a, b, cc, d] = [at(r0, y0, i), at(r0, y0, i + 1), at(r1, y1, i + 1), at(r1, y1, i)];
      if (r0 > 0 && r1 > 0) tris.push(...quad(a, b, cc, d, col, uv));
      else if (r0 > 0) tris.push(tri(a, b, cc, col));
      else if (r1 > 0) tris.push(tri(a, cc, d, col));
    }
  }
  return new Mesh(tris).smooth();
}

/** A closed cylinder or cone (set `top` to 0) standing on the origin. */
export function cylinder(r: number, h: number, sides: number, c: RGB | string, top = r) {
  return lathe([[0, 0], [r, 0], [top, h], [0, h]], sides, c);
}

export function sphere(r: number, sides: number, c: RGB | string, rings = Math.max(3, Math.round(sides / 2))) {
  const profile: [number, number][] = [];
  for (let i = 0; i <= rings; i++) {
    const a = (i / rings) * Math.PI;
    profile.push([Math.sin(a) * r, -Math.cos(a) * r]);
  }
  return lathe(profile, sides, c);
}

/**
 * A flat shape in the xy plane, given depth along z: stars, flags, wedges.
 * Faces are fanned from the centroid, so the outline must be star-shaped around it.
 * `bulge` pushes the centers out, which turns a flat star into a faceted power star.
 */
export function extrude(outline: [number, number][], depth: number, c: RGB | string, bulge = 0) {
  const col = rgb(c);
  const z = depth / 2;
  const cx = outline.reduce((s, p) => s + p[0], 0) / outline.length;
  const cy = outline.reduce((s, p) => s + p[1], 0) / outline.length;
  const tris: Tri[] = [];
  outline.forEach(([x0, y0], i) => {
    const [x1, y1] = outline[(i + 1) % outline.length];
    tris.push(tri([cx, cy, z + bulge], [x0, y0, z], [x1, y1, z], col));
    tris.push(tri([cx, cy, -z - bulge], [x1, y1, -z], [x0, y0, -z], col));
    if (depth > 0) tris.push(...quad([x0, y0, -z], [x1, y1, -z], [x1, y1, z], [x0, y0, z], col));
  });
  return new Mesh(tris);
}

/** A square beam from one point to another: legs, masts, struts, tails. */
export function beam(from: Vec3, to: Vec3, thickness: number, c: RGB | string, depth = thickness) {
  const d = sub(to, from);
  const length = Math.hypot(...d);
  const [dx, dy, dz] = normalize(d);
  return box(thickness, length, depth, c)
    .rotate(Math.acos(Math.max(-1, Math.min(1, dy))) / RAD, Math.atan2(dx, dz) / RAD)
    .move((from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2);
}

/** The axis-aligned bounds of a mesh. */
export function bounds(mesh: Mesh) {
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const t of mesh.tris) for (const { p } of t.v) for (let k = 0; k < 3; k++) (min[k] = Math.min(min[k], p[k])), (max[k] = Math.max(max[k], p[k]));
  return { min, max };
}

/** A single flat quad facing +z, centered on the origin, with its texture stretched across it. */
export function plane(w: number, h: number, c: RGB | string, tex?: Texture, repeat: [number, number] = [1, 1]) {
  const [x, y] = [w / 2, h / 2];
  const [u, v] = repeat;
  return new Mesh(quad([-x, -y, 0], [x, -y, 0], [x, y, 0], [-x, y, 0], rgb(c), [[0, v], [u, v], [u, 0], [0, 0]])).material({ tex });
}

/** Regular polygon points, for extruding stars (pass `inner`) and discs. */
export function polygon(points: number, r: number, inner?: number, phase = 90): [number, number][] {
  const count = inner ? points * 2 : points;
  return Array.from({ length: count }, (_, i) => {
    const a = (phase + (i * 360) / count) * RAD;
    const radius = inner && i % 2 ? inner : r;
    return [Math.cos(a) * radius, Math.sin(a) * radius];
  });
}

/**
 * Rolling ground: a grid displaced by `height(x, z)` and colored by `color(x, y, z)`,
 * so the slopes pick up Gouraud shading.
 */
export function terrain(size: number, cells: number, height: (x: number, z: number) => number, color: (x: number, y: number, z: number) => RGB) {
  const tris: Tri[] = [];
  const step = size / cells;
  const p = (i: number, j: number): Vec3 => {
    const x = -size / 2 + i * step;
    const z = -size / 2 + j * step;
    return [x, height(x, z), z];
  };
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      const a = p(i, j + 1), b = p(i + 1, j + 1), c = p(i + 1, j), d = p(i, j);
      const uv: [number, number][] = [[i, j + 1], [i + 1, j + 1], [i + 1, j], [i, j]];
      tris.push(...quad(a, b, c, d, [1, 1, 1], uv));
    }
  }
  return new Mesh(tris).smooth(80).paint((pt) => color(...pt));
}

/** The round shadow N64 games drew under everything that stood or floated. */
export function blobShadow(r: number) {
  const pts = polygon(12, r);
  return new Mesh(
    pts.map(([x, z], i) => {
      const [x1, z1] = pts[(i + 1) % pts.length];
      return tri([0, 0, 0], [x1, 0, z1], [x, 0, z], [0, 0, 0]);
    }),
  ).material({ shadow: true, lit: false, twoSided: true });
}
