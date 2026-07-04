// Globe Studio local server
// Usage: node server.js   (then open http://localhost:8000)
// Serves the static site AND persists editor changes to data/globe_data.json.
// When the site is opened through this server, the app shows a green
// "Server Online" badge and writes every add/edit/delete back to the JSON file.
// When hosted statically (GitHub Pages, plain file server) these endpoints are
// absent, so the app shows a gray "Server Offline" badge and keeps changes in
// the browser's local storage instead.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'globe_data.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ 'Access-Control-Allow-Origin': '*' }, headers || {}));
  res.end(body);
}

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8' });
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return { docs: [], currentId: null, dark: false };
  }
}

function writeData(obj) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return send(res, 204, '', {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
  }

  // --- API ---
  // Health probe the client uses to detect whether the server is running.
  if (pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, server: 'globe-studio', time: Date.now() });
  }

  // Read the full globe database.
  if (pathname === '/api/globes' && req.method === 'GET') {
    return sendJson(res, 200, readData());
  }

  // Persist the full globe database (called on every add / edit / delete).
  if (pathname === '/api/globes' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => {
      body += c;
      if (body.length > 25 * 1024 * 1024) req.destroy(); // 25MB guard
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (!parsed || !Array.isArray(parsed.docs)) {
          return sendJson(res, 400, { ok: false, error: 'Expected { docs: [...] }' });
        }
        writeData(parsed);
        sendJson(res, 200, { ok: true, saved: parsed.docs.length });
      } catch (e) {
        sendJson(res, 400, { ok: false, error: 'Invalid JSON: ' + e.message });
      }
    });
    return;
  }

  // --- Static files ---
  let rel = pathname === '/' ? '/index.html' : pathname;
  // Prevent path traversal
  const filePath = path.normalize(path.join(ROOT, rel));
  if (!filePath.startsWith(ROOT)) {
    return send(res, 403, 'Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return send(res, 404, 'Not found: ' + rel);
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('Globe Studio server running at http://localhost:' + PORT);
  console.log('Editing the site will now save to ' + path.relative(ROOT, DATA_FILE));
});
