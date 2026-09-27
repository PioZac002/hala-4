// The whole site in one Node process: the built page from dist/ plus the answer desk
// at /api/chat, which is what the container runs. In development Vite does both jobs
// (vite.config.ts); on Vercel or Netlify the page is static and api/chat.ts is the
// function. This file is the third way — one port, no platform, no dependencies.
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { createGzip } from 'node:zlib'
import { chat } from './chat'

const ROOT = resolve(process.env.STATIC_ROOT ?? 'dist')
const PORT = Number(process.env.PORT ?? 8080)
const HOST = process.env.HOST ?? '0.0.0.0'

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}
// Already-compressed formats (WebP, woff2, video) gain nothing and cost CPU.
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.txt', '.webmanifest'])

// Vite hashes everything under /assets/, so those can be kept forever. Frame sequences and
// fonts keep their names across builds, so they get an hour — the same as the dev server.
const cacheFor = (path: string) =>
  path.startsWith('/assets/')
    ? 'public, max-age=31536000, immutable'
    : path.startsWith('/frames/') || path.startsWith('/fonts/')
      ? 'public, max-age=3600'
      : 'no-cache'

// A request path only ever reaches a file inside dist/.
function fileFor(urlPath: string) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '')
  const full = join(ROOT, clean)
  if (full !== ROOT && !full.startsWith(ROOT + sep)) return null
  return full
}

async function sendFile(req: IncomingMessage, res: ServerResponse, file: string, urlPath: string) {
  const info = await stat(file)
  const ext = extname(file).toLowerCase()
  const etag = `W/"${info.size.toString(16)}-${info.mtimeMs.toString(16)}"`

  res.setHeader('content-type', TYPES[ext] ?? 'application/octet-stream')
  res.setHeader('cache-control', cacheFor(urlPath))
  res.setHeader('etag', etag)
  if (req.headers['if-none-match'] === etag) {
    res.statusCode = 304
    res.end()
    return
  }

  const gzip = COMPRESSIBLE.has(ext) && (req.headers['accept-encoding'] ?? '').includes('gzip')
  if (gzip) {
    res.setHeader('content-encoding', 'gzip')
    res.setHeader('vary', 'accept-encoding')
  } else {
    res.setHeader('content-length', String(info.size))
  }
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  const stream = createReadStream(file)
  stream.on('error', () => res.destroy())
  if (gzip) stream.pipe(createGzip()).pipe(res)
  else stream.pipe(res)
}

// The desk handler speaks Web Request/Response; Node speaks streams. This is the bridge.
async function answerDesk(req: IncomingMessage, res: ServerResponse) {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)

  const headers = new Headers()
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === 'string') headers.set(k, v)
    else if (Array.isArray(v)) headers.set(k, v.join(', '))
  }

  const response = await chat(
    new Request(`http://localhost${req.url ?? '/'}`, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
    }),
  )

  res.statusCode = response.status
  response.headers.forEach((value, key) => res.setHeader(key, value))
  res.flushHeaders?.()
  if (response.body) {
    for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) res.write(chunk)
  }
  res.end()
}

const server = createServer(async (req, res) => {
  const urlPath = (req.url ?? '/').split('?')[0]
  try {
    if (urlPath === '/api/chat') return await answerDesk(req, res)
    if (urlPath === '/healthz') {
      res.setHeader('content-type', 'text/plain; charset=utf-8')
      return res.end('ok')
    }

    const file = fileFor(urlPath === '/' ? '/index.html' : urlPath)
    if (file) {
      try {
        return await sendFile(req, res, file, urlPath)
      } catch {
        // fall through to the page itself
      }
    }
    // Anything else is a route of the single page, not a missing file.
    await sendFile(req, res, join(ROOT, 'index.html'), '/index.html')
  } catch (err) {
    console.error('[serve]', err)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('content-type', 'text/plain; charset=utf-8')
    }
    res.end('Internal error')
  }
})

server.listen(PORT, HOST, () => console.log(`[serve] Hala 4 on http://${HOST}:${PORT} (static: ${ROOT})`))

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
