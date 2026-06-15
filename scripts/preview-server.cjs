const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'dist');
const host = '127.0.0.1';
const port = 4173;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

const serveFile = (filePath, response) => {
  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(200, {
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
  });
  fs.createReadStream(filePath).pipe(response);
};

http
  .createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
    let filePath = path.join(root, safePath);

    if (safePath === '/' || safePath === '\\') {
      filePath = path.join(root, 'index.html');
    }

    fs.stat(filePath, (error, stats) => {
      if (!error && stats.isFile()) {
        serveFile(filePath, response);
        return;
      }

      const fallback = path.join(root, 'index.html');
      fs.stat(fallback, (fallbackError, fallbackStats) => {
        if (fallbackError || !fallbackStats.isFile()) {
          response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          response.end('Preview build not found.');
          return;
        }

        serveFile(fallback, response);
      });
    });
  })
  .listen(port, host, () => {
    console.log(`Preview running at http://${host}:${port}`);
  });
