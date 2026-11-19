// Tiny static server for previewing the SVGs locally: node scripts/serve.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html', '.svg': 'image/svg+xml' };
createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try {
    const body = await readFile(join(root, p === '/' ? 'preview.html' : p));
    res.writeHead(200, { 'Content-Type': types[extname(p)] || 'text/html', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404); res.end('not found'); }
}).listen(process.env.PORT || 4782, () => console.log('http://localhost:' + (process.env.PORT || 4782)));
