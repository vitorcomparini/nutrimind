import { Readable } from 'node:stream';

const serverModule = await import(new URL('../dist/server/server.js', import.meta.url));
const server = serverModule.default;

function toNodeHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export default async function handler(req: any, res: any) {
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url, `https://${host}`);

  const request = new Request(url.toString(), {
    method: req.method,
    headers: toNodeHeaders(req.headers),
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req,
  });

  const response = await server.fetch(request, undefined, undefined);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      res.setHeader(key, value);
    } else {
      res.setHeader(key, value);
    }
  });

  const body = response.body;
  if (!body) {
    res.end();
    return;
  }

  const nodeReadable = Readable.fromWeb(body as unknown as ReadableStream<Uint8Array>);
  nodeReadable.pipe(res);
}
