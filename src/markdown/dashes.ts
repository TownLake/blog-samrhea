import { defineMdastPlugin } from 'satteri';

/**
 * Keeps the punctuation the blog has always rendered: `--` as an em dash and `. . .` as an ellipsis.
 * Sätteri's own smart punctuation makes `--` an en dash, so its `dashes` option is turned off in astro.config.mjs.
 */
export const dashes = defineMdastPlugin({
  name: 'dashes',
  text(node, ctx) {
    if (node.value.includes('--') || node.value.includes('. . .')) {
      ctx.setProperty(node, 'value', node.value.replaceAll('--', '—').replaceAll('. . .', '…'));
    }
  },
});
