// Servidor estático de produção para o build (dist/), sem dependências.
// Faz fallback para index.html (rotas do React Router) e aplica cache nos assets.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = path.join(__dirname, 'dist');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp'
};

const send = (res, filePath, status = 200) => {
  const ext = path.extname(filePath).toLowerCase();
  const isAsset = filePath.includes(`${path.sep}assets${path.sep}`);

  res.writeHead(status, {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': isAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin'
  });
  fs.createReadStream(filePath).pipe(res);
};

http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    return res.end();
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    res.writeHead(400);
    return res.end();
  }

  const filePath = path.normalize(path.join(ROOT, pathname));

  // Impede acesso fora da pasta dist
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end();
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) return send(res, filePath);
    // Arquivos com extensão inexistentes retornam 404; rotas vão para o SPA
    if (path.extname(pathname)) {
      res.writeHead(404);
      return res.end();
    }
    return send(res, path.join(ROOT, 'index.html'));
  });
}).listen(PORT, HOST, () => {
  console.log(`Front-end NTI servindo ${ROOT} em http://${HOST}:${PORT}`);
});
