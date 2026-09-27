// The answer desk: one Web-standard handler, used by the Vite dev server and by the
// deployed function alike (api/chat.ts). POST { messages, lang } → text/event-stream.
//
// The model is reached over the OpenAI-compatible chat-completions protocol, so the provider
// is three environment variables rather than a dependency. The default is Groq's free tier
// (gpt-oss-120b, no card, 1000 requests a day); Gemini, OpenRouter, OpenAI and anything else
// speaking the same protocol need only CHAT_BASE_URL and CHAT_MODEL. With no key at all the
// desk falls back to server/offline.ts and still answers from the price list.
//
// The API key stays here. The browser never sees it, and the model only ever gets the
// system prompt from server/knowledge.ts, which is built out of the page's own price list.
import { SYSTEM } from './knowledge'
import { offlineAnswer } from './offline'
import type { Lang } from '../src/format'

const BASE_URL = process.env.CHAT_BASE_URL ?? 'https://api.groq.com/openai/v1'
const MODEL = process.env.CHAT_MODEL ?? 'openai/gpt-oss-120b'
const MAX_TURNS = 12 // how much of a conversation we carry back to the model
const MAX_CHARS = 600 // per message; a rental question does not need more
const MAX_TOKENS = 400 // answers are 2–4 sentences, and this is the ceiling on a free tier

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
  if (request.method !== 'POST') return bad('Method not allowed', 405)

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local'
  if (rateLimited(ip)) return bad('Too many questions at once. Try again in a moment.', 429)

  let turns: Turn[] | null = null
  let lang: Lang = 'en'
  try {
    const body = await request.json()
    turns = parseTurns(body)
    // The desk answers in the language the page is printed in.
    if ((body as { lang?: unknown })?.lang === 'pl') lang = 'pl'
  } catch {
    return bad('Unreadable request')
  }
  if (!turns) return bad('Unreadable request')
  const question = turns[turns.length - 1].content

  const apiKey = process.env.CHAT_API_KEY ?? process.env.GROQ_API_KEY
  if (!apiKey) return offlineStream(question, 'no-key', lang)

  const upstream = new AbortController()
  let res: Response
  try {
    res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      signal: upstream.signal,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0.4,
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM(lang) },
          ...turns.map((t) => ({ role: t.role, content: t.content })),
        ],
      }),
    })
    if (!res.ok || !res.body) {
      console.error('[chat] provider answered', res.status, (await res.text()).slice(0, 300))
      return offlineStream(question, 'error', lang)
    }
  } catch (err) {
    console.error('[chat] could not reach the provider', err)
    return offlineStream(question, 'error', lang)
  }

  const body = new ReadableStream({
    async start(controller) {
      controller.enqueue(sse({ mode: 'live' }))
      let sent = false
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      try {
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n\n')
          buffer = parts.pop() ?? ''
          for (const part of parts) {
            const line = part.split('\n').find((l) => l.startsWith('data:'))
            if (!line) continue
            const payload = line.slice(5).trim()
            if (!payload || payload === '[DONE]') continue
            let text = ''
            try {
              text = JSON.parse(payload)?.choices?.[0]?.delta?.content ?? ''
            } catch {
              continue // a half-written chunk; the next read completes it
            }
            if (text) {
              sent = true
              controller.enqueue(sse({ text }))
            }
          }
        }
        // A refusal can come back as a well-formed response with nothing in it; answer from
        // the price list rather than leaving an empty bubble on the page.
        if (!sent) controller.enqueue(sse({ text: offlineAnswer(question, lang), mode: 'offline' }))
      } catch (err) {
        console.error('[chat] stream interrupted', err)
        controller.enqueue(
          sent ? sse({ error: 'interrupted' }) : sse({ text: offlineAnswer(question, lang), mode: 'offline' }),
        )
      } finally {
        controller.enqueue(sse({ done: true }))
        controller.close()
      }
    },
    cancel() {
      upstream.abort()
    },
  })

  return new Response(body, { headers: STREAM_HEADERS })
}
