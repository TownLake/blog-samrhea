import { defineHastPlugin } from 'satteri';
import manifest from '../data/image-sizes.json' with { type: 'json' };

export const IMAGE_BASE = 'https://imagedelivery.net/BO71HffCLgVKrpfgjL7r7Q/';
/** The `public` variant's settings, as flexible-variant options (fit within 1366×768). */
export const PUBLIC_VARIANT = 'w=1366,h=768,fit=scale-down';

/** Smaller versions offered in srcset when an image displays wider than them. */
const SMALLER_WIDTHS = [640, 1280];
/** The post column is 624px wide (max-w-2xl minus padding). */
const SIZES = '(min-width: 672px) 624px, calc(100vw - 48px)';

const sizes: Record<string, number[] | undefined> = manifest;

/**
 * Post images: lazy-load them, reserve their space, and let browsers pick a smaller
 * Cloudflare Images version when the full one isn't needed. Dimensions come from
 * src/data/image-sizes.json, which `npm run build` keeps up to date.
 */
export const images = defineHastPlugin({
  name: 'images',
  element: {
    filter: ['img'],
    visit(node, ctx) {
      ctx.setProperty(node, 'loading', 'lazy');
      ctx.setProperty(node, 'decoding', 'async');

      const src = String(node.properties.src ?? '');
      const id = src.startsWith(IMAGE_BASE) && src.endsWith('/public') ? src.slice(IMAGE_BASE.length, -'/public'.length) : undefined;
      const size = id ? sizes[id] : undefined;
      if (!size) return;

      const [width, height] = size;
      ctx.setProperty(node, 'width', width);
      ctx.setProperty(node, 'height', height);

      const smaller = SMALLER_WIDTHS.filter((w) => w < width);
      if (smaller.length) {
        const srcset = [...smaller.map((w) => `${IMAGE_BASE}${id}/w=${w},fit=scale-down ${w}w`), `${src} ${width}w`];
        ctx.setProperty(node, 'srcset', srcset.join(', '));
        ctx.setProperty(node, 'sizes', SIZES);
      }
    },
  },
});
