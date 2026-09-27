import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// `npm run dev` serves the answer desk from the same code the deployed function uses
// (api/chat.ts → server/chat.ts), so the widget behaves locally exactly as it will in
// production. The provider keys are read from .env and never leave the server.
function answerDesk(mode: string): Plugin {
  return {
    name: 'hala4-answer-desk',
    config() {
      const env = loadEnv(mode, process.cwd(), '')
      for (const key of ['CHAT_API_KEY', 'GROQ_API_KEY', 'CHAT_BASE_URL', 'CHAT_MODEL']) {
        if (!process.env[key] && env[key]) process.env[key] = env[key]
      }
    },
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)

          const headers = new Headers()
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === 'string') headers.set(k, v)
            else if (Array.isArray(v)) headers.set(k, v.join(', '))
          }

          const { chat } = (await server.ssrLoadModule('/server/chat.ts')) as {
            chat: (r: Request) => Promise<Response>
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
        } catch (err) {
          server.config.logger.error(`[answer-desk] ${String(err)}`)
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: 'Okienko obsługi jest chwilowo zamknięte.' }))
        }
      })
    },
  }
}

// Frame sequences are immutable once built — a car's 120 WebP files never change under
// the same name, so let the browser keep them for the session instead of revalidating.
const framesCache = (): Plugin => ({
  name: 'hala4-frames-cache',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.startsWith('/frames/')) res.setHeader('cache-control', 'public, max-age=3600')
      next()
    })
  },
})

export default defineConfig(({ mode }) => ({
  plugins: [react(), answerDesk(mode), framesCache()],
}))
