import { useEffect, useState } from 'react'

const NAV = [
  { id: 'flota', label: 'Flota' },
  { id: 'cennik', label: 'Cennik' },
  { id: 'warunki', label: 'Warunki' },
  { id: 'odbior', label: 'Odbiór i zwrot' },
]

export function Masthead({
  serial,
  asking,
  onAsk,
  askRef,
}: {
  serial: number
  asking: boolean
  onAsk: () => void
  askRef: React.RefObject<HTMLButtonElement | null>
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])

  return (
    <header className="mast">
      <a className="mast__brand" href="#top" aria-label="Hala 4, na górę strony">
        <span className="mast__mark">Hala&nbsp;4</span>
        <span className="mast__trade">wypożyczalnia samochodów</span>
      </a>
      <span className="mast__doc">
        Protokół zdawczo-odbiorczy <span className="serial">Nr {String(serial).padStart(6, '0')}</span>
      </span>
      <nav className={`mast__nav ${open ? 'is-open' : ''}`} id="mast-nav" aria-label="Sekcje strony">
        {NAV.map((n) => (
          <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}>
            {n.label}
          </a>
        ))}
        <button
          type="button"
          className="mast__navAsk"
          onClick={() => {
            setOpen(false)
            onAsk()
          }}
        >
          Zapytaj obsługi
        </button>
      </nav>
      <button
        ref={askRef}
        type="button"
        className="mast__ask"
        aria-expanded={asking}
        aria-controls="desk"
        onClick={onAsk}
      >
        Obsługa
      </button>
      <button
        type="button"
        className="mast__menu"
        aria-expanded={open}
        aria-controls="mast-nav"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? 'Zamknij' : 'Menu'}
      </button>
      <a className="btn btn--small mast__cta" href="#rezerwacja">
        Rezerwuj
      </a>
    </header>
  )
}
