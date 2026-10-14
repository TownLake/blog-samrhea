import { compose, type Art } from './compose.ts';
import { png } from './png.ts';
import { render } from './render.ts';

export type { Art };

/** Pixels per side. Small on purpose: the N64 drew whole games at 320×240. */
export const ART_SIZE = 64;

/** Posts on the Cloudflare blog share one picture, the way they share one emoji. */
export const CLOUDFLARE_ART: Art = { place: 'clouds', props: ['cloud'] };

/** Renders a post's art direction to a PNG. The seed (its slug) varies the camera and scenery. */
export function paint(art: Art, seed: string) {
  return png(render(compose(art, seed), ART_SIZE), ART_SIZE, ART_SIZE);
}
