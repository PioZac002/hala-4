import { useCallback, useEffect, useRef, useState } from 'react'
import { HALL, filmedById } from '../data'
import { Arrow } from './Marks'

// The service window of the hall, printed onto the same form as everything else:
// the visitor writes the question in ballpoint, the answer comes back typed.
// The model lives behind /api/chat (server/chat.ts) — the key never reaches the browser.

type Turn = { role: 'user' | 'assistant'; content: string }
type Mode = 'live' | 'offline' | null

const SUGGESTIONS = (short: string) => [
  `Ile kosztuje ${short} na weekend?`,
  'Jaka jest kaucja i limit kilometrów?',
  'Jak wygląda odbiór auta w hali?',
]

export function Assistant({
  open,
  onClose,
  carId,
  triggerRef,
}: {
  open: boolean
  onClose: () => void
  carId: string
  triggerRef: React.RefObject<HTMLButtonElement | null>
}) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<Mode>(null)
  const [error, setError] = useState('')
  const log = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const abort = useRef<AbortController | null>(null)

  useEffect(() => {
    if (open) input.current?.focus()
    else abort.current?.abort()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      onClose()
      triggerRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, triggerRef])

  // The log follows the answer as it prints.
  useEffect(() => {
    const el = log.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns, busy])

  useEffect(() => () => abort.current?.abort(), [])

  const ask = useCallback(
    async (question: string) => {
      const text = question.trim()
      if (!text || busy) return
      setError('')
      setDraft('')
      const history = [...turns, { role: 'user' as const, content: text }]
      setTurns([...history, { role: 'assistant', content: '' }])
      setBusy(true)

      const controller = new AbortController()
      abort.current = controller
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        })
        if (!res.ok || !res.body) throw new Error(String(res.status))

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let answer = ''
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n\n')
          buffer = parts.pop() ?? ''
          for (const part of parts) {
            const line = part.trim()
            if (!line.startsWith('data:')) continue
            const event = JSON.parse(line.slice(5)) as { text?: string; mode?: Mode; error?: string }
            if (event.mode) setMode(event.mode)
            if (event.text) {
              answer += event.text
              setTurns([...history, { role: 'assistant', content: answer }])
            }
          }
        }
        if (!answer) throw new Error('pusta odpowiedź')
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setTurns(history)
        setError('Okienko obsługi nie odpowiada. Spróbuj jeszcze raz albo wyślij zapytanie formularzem.')
      } finally {
        setBusy(false)
        abort.current = null
      }
    },
    [busy, turns],
  )

  const car = filmedById(carId)

  return (
    <div id="desk" className={`desk ${open ? 'is-open' : ''}`} hidden={!open}>
      <div className="desk__sheet" role="dialog" aria-modal="false" aria-labelledby="desk-title">
        <div className="desk__head">
          <span className="box__label" id="desk-title">
            Okienko obsługi
          </span>
          <button type="button" className="desk__close" onClick={onClose}>
            Zamknij
          </button>
        </div>
        <p className="desk__intro">
          Odpowiada asystent AI — tylko o autach i ofercie {HALL.name}. Termin i cenę potwierdza obsługa hali.
        </p>

        <div className="desk__log" ref={log} role="log" aria-live="polite" data-lenis-prevent>
          {turns.length === 0 && (
            <ul className="desk__seed">
              {SUGGESTIONS(car.short).map((s) => (
                <li key={s}>
                  <button type="button" className="desk__seedBtn" onClick={() => ask(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {turns.map((t, i) =>
            t.role === 'user' ? (
              <p key={i} className="desk__q">
                <span className="desk__n">Pyt. {String(Math.floor(i / 2) + 1).padStart(2, '0')}</span>
                <span className="ink">{t.content}</span>
              </p>
            ) : (
              <p key={i} className={`desk__a ${busy && i === turns.length - 1 ? 'is-printing' : ''}`}>
                <span className="desk__n">Odp. {String(Math.floor(i / 2) + 1).padStart(2, '0')}</span>
                <span className="desk__text">{t.content}</span>
              </p>
            ),
          )}

          {error && <p className="desk__err">{error}</p>}
        </div>

        <form
          className="desk__ask"
          onSubmit={(e) => {
            e.preventDefault()
            ask(draft)
          }}
        >
          <label className="f f--wide">
            <span className="f__label">Twoje pytanie</span>
            <input
              ref={input}
              className="ink"
              value={draft}
              maxLength={600}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="np. czym dojadę we dwoje w góry?"
              aria-label="Pytanie do obsługi Hali 4"
            />
          </label>
          <button type="submit" className="btn btn--small" disabled={busy || !draft.trim()}>
            {busy ? 'Czekaj' : 'Wyślij'} <Arrow />
          </button>
        </form>

        {mode === 'offline' && (
          <p className="desk__foot">
            Asystent AI nie jest w tej chwili podłączony — odpowiadam z cennika, krótko i bez wyjątków.
          </p>
        )}
      </div>
    </div>
  )
}
