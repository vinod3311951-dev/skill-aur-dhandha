import http from 'node:http';
import { readdirSync, readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const payloadDir = new URL('./sarhad-payload/', import.meta.url);
const files = readdirSync(payloadDir).filter((name) => /^\d{3}\.txt$/.test(name)).sort();
if (!files.length) throw new Error('SARHAD payload files are missing');

const encoded = files.map((name) => readFileSync(new URL(name, payloadDir), 'utf8')).join('');
const gz = Buffer.from(encoded, 'base64');
const expected = 'c858351b991393a414bcedac20fbfb27801c990084dea23ca71f1b5ef17393e4';
const actual = createHash('sha256').update(gz).digest('hex');
if (actual !== expected) throw new Error('SARHAD payload checksum mismatch');

const manifest = JSON.parse(gunzipSync(gz).toString('utf8'));

// SARHAD_DIAG_FUNCTIONS — temporary repair diagnostics only.
try {
  const mainItem = manifest['/src/main.js'];
  if (mainItem?.b64) {
    const src = Buffer.from(mainItem.b64, 'base64').toString('utf8');
    const names = ['renderBriefing', 'startMission', 'renderMission', 'missionUnlocked', 'bindActions'];
    for (const name of names) {
      const start = src.indexOf('function ' + name + '(');
      if (start >= 0) {
        const next = src.indexOf('\nfunction ', start + 10);
        const end = next >= 0 ? next : Math.min(src.length, start + 8000);
        console.log('\n[SARHAD-DIAG:' + name + ']\n' + src.slice(start, end).slice(0, 12000));
      }
    }
  }
} catch (e) {
  console.error('[SARHAD-DIAG] extract failed', e);
}
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
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Server error');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Sarhad Sniper listening on ${port} with ${files.length} payload files`);
});
