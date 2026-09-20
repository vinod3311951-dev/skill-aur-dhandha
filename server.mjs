import http from 'node:http';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const count = Number(process.env.SARHAD_PAYLOAD_COUNT || 0);
if (!Number.isInteger(count) || count < 1) throw new Error('SARHAD payload is missing');

let encoded = '';
for (let i = 0; i < count; i++) {
  const key = `SARHAD_PAYLOAD_${String(i).padStart(3, '0')}`;
  const part = process.env[key];
  if (!part) throw new Error(`Missing ${key}`);
  encoded += part;
}
const gz = Buffer.from(encoded, 'base64');
const expected = process.env.SARHAD_PAYLOAD_SHA256 || '';
const actual = createHash('sha256').update(gz).digest('hex');
if (expected && actual !== expected) throw new Error('SARHAD payload checksum mismatch');
const raw = gunzipSync(gz).toString('utf8');
const manifest = JSON.parse(raw);

const port = Number(process.env.PORT || 3000);
const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    let path = decodeURIComponent(url.pathname);
    if (path === '/') path = '/index.html';
    let item = manifest[path];
    if (!item && !path.includes('.')) item = manifest['/index.html'];
    if (!item) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const body = Buffer.from(item.b64, 'base64');
    const noCache = path === '/index.html' || path === '/manifest.webmanifest' || path === '/sw.js';
    res.writeHead(200, {
      'content-type': item.mime || 'application/octet-stream',
      'content-length': body.length,
      'cache-control': noCache ? 'no-cache' : 'public, max-age=300',
      'x-content-type-options': 'nosniff'
    });
    res.end(body);
  } catch {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Server error');
  }
});
server.listen(port, '0.0.0.0', () => console.log(`Sarhad Sniper listening on ${port}`));
