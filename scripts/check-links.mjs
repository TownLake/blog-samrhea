// Fails the build when a page links to a path on this site that doesn't exist and isn't redirected.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const origin = 'https://blog.samrhea.com';

const redirects = readFileSync(join(dist, '_redirects'), 'utf8')
  .split('\n')
  .map((line) => line.trim().split(/\s+/)[0])
  .filter((from) => from?.startsWith('/'))
  .map((from) => new RegExp(`^${from.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:\w+/g, '[^/]+').replace(/\*/g, '.*')}$`));

const exists = (path) =>
  path.endsWith('/')
    ? existsSync(join(dist, path, 'index.html'))
    : existsSync(join(dist, path)) || existsSync(join(dist, path, 'index.html'));

const broken = [];
for (const file of readdirSync(dist, { recursive: true }).filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(join(dist, file), 'utf8');
  for (const [, url] of html.matchAll(/(?:href|src)="([^"#?]*)/g)) {
    const path = url.startsWith(origin) ? url.slice(origin.length) || '/' : url;
    if (!path.startsWith('/') || path.startsWith('//')) continue;
    const decoded = decodeURI(path);
    if (!exists(decoded) && !redirects.some((r) => r.test(decoded))) broken.push(`${file}: ${url}`);
  }
}

if (broken.length) {
  console.error(`Broken internal links:\n  ${[...new Set(broken)].join('\n  ')}`);
  process.exit(1);
}
console.log('Internal links OK');
