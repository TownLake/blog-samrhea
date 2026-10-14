import { defineMdastPlugin, type MdastPluginEntry } from 'satteri';

/** Mirrors the `book` frontmatter schema in src/content.config.ts. */
interface Book {
  title: string;
  author: string;
  narrator?: string;
  published: string;
  format: string;
  pages?: string;
  length?: string;
  amazon?: string;
  asin?: string;
  isbn?: string;
  started: string;
  finished: string;
  places?: string[];
}

const INTRO = `> ## Not a Book Report
> I enjoy [reflecting](https://blog.samrhea.com/posts/2019/analyze-media-habits) on the movies, TV, books and other media that I consume. I'm notoriously sentimental. This [series](https://blog.samrhea.com/reading/) documents the books that I read. These aren't reviews or recommendations. Just a list. For me. Mostly so that I can page through what I read, where I was, and when.`;

// The wrapper lets global.css set these as label/value lists without the header row.
const table = (heading: string, rows: [string, unknown][]) =>
  [
    `## ${heading}`,
    '',
    '<div class="book-facts">',
    '',
    '|Category|Value|',
    '|---|---|',
    ...rows.filter(([, value]) => value !== undefined && value !== '').map(([label, value]) => `|**${label}**|${value}|`),
    '',
    '</div>',
  ].join('\n');

const whatIsIt = (book: Book) =>
  table('What is it?', [
    ['Title', `*${book.title}*`],
    ['Author', book.author],
    ['Narrator', book.narrator],
    ['Year Published', book.published],
    ['Format', book.format],
    ['Pages', book.pages],
    ['Length', book.length],
    ['Amazon', book.amazon && `[Link](${book.amazon})`],
    ['ASIN', book.asin],
    ['ISBN', book.isbn],
  ]);

const howDidIReadIt = (book: Book) =>
  table('How did I read it?', [
    ['Date Started', book.started],
    ['Date Finished', book.finished],
    ['Places Read', book.places?.join(', ')],
  ]);

/**
 * Reading posts keep the book's details in a `book` frontmatter object. This writes the standard
 * sections around the post's own prose: the intro at the top, "What is it?" after "Why did I read it?",
 * and "How did I read it?" just before the notes.
 */
export const bookDetails: MdastPluginEntry = ({ data }) => {
  const book = data.astro?.frontmatter?.book as Book | undefined;
  if (!book || typeof book !== 'object') return null;

  let done = false;
  return defineMdastPlugin({
    name: 'book-details',
    heading(node, ctx) {
      if (done) return;
      done = true;

      const root = ctx.parent(node);
      const headings = root.children.flatMap((child, index) =>
        child.type === 'heading' ? [{ index, text: ctx.textContent(child).trim() }] : [],
      );
      const why = headings.findIndex((h) => h.text === 'Why did I read it?');
      const afterWhy = why === -1 ? 0 : (headings[why + 1]?.index ?? root.children.length);
      const notes = headings.find((h) => h.text.startsWith('Notes'))?.index ?? root.children.length;

      // Indexes refer to the original children; inserts at the same index keep call order.
      ctx.insertChildAt(root, 0, { raw: INTRO });
      ctx.insertChildAt(root, afterWhy, { raw: whatIsIt(book) });
      ctx.insertChildAt(root, notes, { raw: howDidIReadIt(book) });
    },
  });
};
