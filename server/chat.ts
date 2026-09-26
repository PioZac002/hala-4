// The answer desk: one Web-standard handler, used by the Vite dev server and by the
// deployed function alike (api/chat.ts). POST { messages } → text/event-stream.
//
// The API key stays here. The browser never sees it, and the model only ever gets the
// system prompt from server/knowledge.ts, which is built out of the page's own price list.
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM } from './knowledge'
import { offlineAnswer } from './offline'
import type { Lang } from '../src/format'

const MODEL = 'claude-opus-5'
const MAX_TURNS = 12 // how much of a conversation we carry back to the model
const MAX_CHARS = 600 // per message; a rental question does not need more
const MAX_TOKENS = 400 // answers are 2–4 sentences, and this is the cost ceiling

type Turn = { role: 'user' | 'assistant'; content: string }

const enc = new TextEncoder()
const sse = (event: Record<string, unknown>) => enc.encode(`data: ${JSON.stringify(event)}\n\n`)

const STREAM_HEADERS = {
  'content-type': 'text/event-stream; charset=utf-8',
  'cache-control': 'no-store',
  connection: 'keep-alive',
}

const bad = (message: string, status = 400) =>
  new Response(JSON.stringify({ error: message }), { status, headers: { 'content-type': 'application/json' } })

function parseTurns(body: unknown): Turn[] | null {
  if (!body || typeof body !== 'object') return null
  const raw = (body as { messages?: unknown }).messages
  if (!Array.isArray(raw) || raw.length === 0) return null
  const turns: Turn[] = []
  for (const m of raw.slice(-MAX_TURNS)) {
    if (!m || typeof m !== 'object') return null
    const { role, content } = m as { role?: unknown; content?: unknown }
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null
    const text = content.trim().slice(0, MAX_CHARS)
    if (text) turns.push({ role, content: text })
  }
  if (!turns.length || turns[turns.length - 1].role !== 'user') return null
  return turns
}

// A few questions a second from one visitor is a script, not a customer.
const seen = new Map<string, number[]>()
const RATE = { windowMs: 60_000, max: 12 }
function rateLimited(ip: string) {
  const now = Date.now()
  const hits = (seen.get(ip) ?? []).filter((t) => now - t < RATE.windowMs)
  hits.push(now)
  seen.set(ip, hits)
  if (seen.size > 500) for (const [k, v] of seen) if (!v.some((t) => now - t < RATE.windowMs)) seen.delete(k)
  return hits.length > RATE.max
}

function offlineStream(question: string, reason: 'no-key' | 'error', lang: Lang) {
  const text = offlineAnswer(question, lang)
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(sse({ mode: 'offline', reason }))
        controller.enqueue(sse({ text }))
        controller.enqueue(sse({ done: true }))
        controller.close()
      },
    }),
    { headers: STREAM_HEADERS },
  )
}

export async function chat(request: Request): Promise<Response> {
  if (request.method !== 'POST') return bad('Metoda nieobsługiwana', 405)

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local'
  if (rateLimited(ip)) return bad('Za dużo pytań naraz. Spróbuj za chwilę.', 429)

  let turns: Turn[] | null = null
  let lang: Lang = 'en'
  try {
    const body = await request.json()
    turns = parseTurns(body)
    // The desk answers in the language the page is printed in.
    if ((body as { lang?: unknown })?.lang === 'pl') lang = 'pl'
  } catch {
    return bad('Nieczytelne zapytanie')
  }
  if (!turns) return bad('Nieczytelne zapytanie')
  const question = turns[turns.length - 1].content

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return offlineStream(question, 'no-key', lang)

  const client = new Anthropic({ apiKey })
  let stream: ReturnType<typeof client.messages.stream>
  try {
    stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // The fleet and the price list are the same on every request: cache them, and keep
      // effort low — this is a front-desk answer, not a research task.
      system: [{ type: 'text', text: SYSTEM(lang), cache_control: { type: 'ephemeral' } }],
      output_config: { effort: 'low' },
      messages: turns.map((t) => ({ role: t.role, content: t.content })),
    })
  } catch (err) {
    console.error('[chat] nie udało się otworzyć strumienia', err)
    return offlineStream(question, 'error', lang)
  }

  const body = new ReadableStream({
    async start(controller) {
      controller.enqueue(sse({ mode: 'live' }))
      let sent = false
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta' && event.delta.text) {
            sent = true
            controller.enqueue(sse({ text: event.delta.text }))
          }
        }
        const final = await stream.finalMessage()
        // A safety decline arrives as a normal response with nothing in it; say so rather
        // than leaving an empty bubble on the page.
        if (!sent) {
          controller.enqueue(
            sse({
              text:
                final.stop_reason === 'refusal'
                  ? 'Na to akurat nie odpowiem. Chętnie pomogę przy autach i warunkach wynajmu Hali 4.'
                  : offlineAnswer(question),
            }),
          )
        }
      } catch (err) {
        console.error('[chat] strumień przerwany', err)
        controller.enqueue(sent ? sse({ error: 'przerwane' }) : sse({ text: offlineAnswer(question), mode: 'offline' }))
      } finally {
        controller.enqueue(sse({ done: true }))
        controller.close()
      }
    },
    cancel() {
      stream.abort()
    },
  })

  return new Response(body, { headers: STREAM_HEADERS })
}
