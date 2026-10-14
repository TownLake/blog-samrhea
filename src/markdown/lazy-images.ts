import { defineHastPlugin } from 'satteri';

/** Post images sit below the fold, so let the browser defer and decode them off the main thread. */
export const lazyImages = defineHastPlugin({
  name: 'lazy-images',
  element: {
    filter: ['img'],
    visit(node, ctx) {
      ctx.setProperty(node, 'loading', 'lazy');
      ctx.setProperty(node, 'decoding', 'async');
    },
  },
});
