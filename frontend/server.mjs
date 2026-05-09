import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const startingPort = Number(process.env.FRONTEND_PORT || 5173);
const host = process.env.FRONTEND_HOST || '127.0.0.1';
const root = new URL('.', import.meta.url).pathname;

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8'
};

function createFrontendServer() {
  return createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${host}`);
  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = normalize(join(root, requestedPath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream'
    });
    response.end(body);
  } catch {
    const body = await readFile(join(root, 'index.html'));
    response.writeHead(200, { 'Content-Type': contentTypes['.html'] });
    response.end(body);
  }
  });
}

function listen(port) {
  const server = createFrontendServer();

  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      listen(port + 1);
      return;
    }

    throw error;
  });

  server.listen(port, host, () => {
    console.log(`Frontend running at http://localhost:${port}`);
  });
}

listen(startingPort);
