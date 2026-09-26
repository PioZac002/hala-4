import { useCallback, useEffect, useRef, useState } from 'react'
import { HALL, filmedById } from '../data'
import { Arrow } from './Marks'
import { useI18n } from '../i18n'

// The service window of the hall, printed onto the same form as everything else:
// the visitor writes the question in ballpoint, the answer comes back typed.
// The model lives behind /api/chat (server/chat.ts) — the key never reaches the browser.

type Turn = { role: 'user' | 'assistant'; content: string }
type Mode = 'live' | 'offline' | null

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
  const { t, lang } = useI18n()
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
          body: JSON.stringify({ messages: history, lang }),
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
        if (!answer) throw new Error('empty answer')
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setTurns(history)
        setError(t('desk.error'))
      } finally {
        setBusy(false)
        abort.current = null
      }
    },
    [busy, turns, lang, t],
  )

  const car = filmedById(carId)
  const suggestions = [t('desk.seed1', { car: car.short }), t('desk.seed2'), t('desk.seed3')]

  return (
    <div id="desk" className={`desk ${open ? 'is-open' : ''}`} hidden={!open}>
      <div className="desk__sheet" role="dialog" aria-modal="false" aria-labelledby="desk-title">
        <div className="desk__head">
          <span className="box__label" id="desk-title">
            {t('desk.title')}
          </span>
          <button type="button" className="desk__close" onClick={onClose}>
            {t('desk.close')}
          </button>
        </div>
        <p className="desk__intro">{t('desk.intro', { hall: HALL.name })}</p>

        <div className="desk__log" ref={log} role="log" aria-live="polite" data-lenis-prevent>
          {turns.length === 0 && (
            <ul className="desk__seed">
              {suggestions.map((s) => (
                <li key={s}>
                  <button type="button" className="desk__seedBtn" onClick={() => ask(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {turns.map((turn, i) =>
            turn.role === 'user' ? (
              <p key={i} className="desk__q">
                <span className="desk__n">
                  {t('desk.q')} {String(Math.floor(i / 2) + 1).padStart(2, '0')}
                </span>
                <span className="ink">{turn.content}</span>
              </p>
            ) : (
              <p key={i} className={`desk__a ${busy && i === turns.length - 1 ? 'is-printing' : ''}`}>
                <span className="desk__n">
                  {t('desk.a')} {String(Math.floor(i / 2) + 1).padStart(2, '0')}
                </span>
                <span className="desk__text">{turn.content}</span>
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
            <span className="f__label">{t('desk.yourQuestion')}</span>
            <input
              ref={input}
              className="ink"
              value={draft}
              maxLength={600}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t('desk.placeholder')}
              aria-label={t('desk.inputAria')}
            />
          </label>
          <button type="submit" className="btn btn--small" disabled={busy || !draft.trim()}>
            {busy ? t('desk.wait') : t('desk.send')} <Arrow />
          </button>
        </form>

        {mode === 'offline' && (
          <p className="desk__foot">{t('desk.offline')}</p>
        )}
      </div>
    </div>
  )
}
