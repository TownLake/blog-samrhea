/**
 * The props a post's art can use, one per post. Each is a handful of primitives, built at
 * whatever scale is convenient: the composer sizes, turns and places it. Things that face
 * a direction face +z, and things best seen in profile (animals, vehicles) run along +x.
 */
import type { Mesh } from '../mesh.ts';
import { CREATURES } from './creatures.ts';
import { LANDMARKS } from './landmarks.ts';
import { OBJECTS } from './objects.ts';
import { SYMBOLS } from './symbols.ts';
import { THINGS } from './things.ts';
import { VEHICLES } from './vehicles.ts';

export interface Model {
  /** `variant` is a color for most models, or a named option (a flag's country, a dog's breed). */
  build: (variant?: string) => Mesh;
  /** Hovers above the ground like a collectible, instead of standing on it. */
  float?: boolean;
  /** The turn, in degrees, that shows it off best from the camera's three-quarter view. */
  turn?: number;
}

export const MODELS = { ...VEHICLES, ...CREATURES, ...OBJECTS, ...LANDMARKS, ...SYMBOLS, ...THINGS };

export type ModelName = keyof typeof MODELS;
