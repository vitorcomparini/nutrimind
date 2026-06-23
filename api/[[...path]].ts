import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let server: any = null;

async function getServer() {
  if (!server) {
    try {
      // Try to import from dist/server/server.js relative to project root
      const serverPath = join(__dirname, '..', 'dist', 'server', 'server.js');
      const serverModule = await import(serverPath);
      server = serverModule.default;
    } catch (error) {
      console.error('Failed to load server module:', error);
      throw error;
    }
  }
  return server;
}

function toNodeHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export default async function handler(req: any, res: any) {
  try {
    const server = await getServer();
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `https://${host}`);

    const request = new Request(url.toString(), {
      method: req.method,
      headers: toNodeHeaders(req.headers),
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req,
    });

    const response = await server.fetch(request, undefined, undefined);

    res.statusCode = response.status;
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

    const body = response.body;
    if (!body) {
      res.end();
      return;
    }

    const nodeReadable = Readable.fromWeb(body as unknown as ReadableStream<Uint8Array>);
    nodeReadable.pipe(res);
  } catch (error) {
    console.error('Handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
