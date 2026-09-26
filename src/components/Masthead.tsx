import { useEffect, useState } from 'react'
import { LANGS, useI18n, type Key } from '../i18n'

const NAV: { id: string; key: Key }[] = [
  { id: 'flota', key: 'nav.fleet' },
  { id: 'cennik', key: 'nav.prices' },
  { id: 'warunki', key: 'nav.terms' },
  { id: 'odbior', key: 'nav.handover' },
]

// The language of the form is a field on the form: two printed cells, the one in force
// filled in ink, like every other choice the protocol records.
function LangSwitch() {
  const { lang, setLang, t, loc } = useI18n()
  return (
    <div className="lang" role="group" aria-label={t('mast.langAria')}>
      <span className="lang__label" aria-hidden="true">
        {t('mast.lang')}
      </span>
      <span className="lang__cells">
        {LANGS.map((l) => (
          <button
            key={l.id}
            type="button"
            lang={l.id}
            className={`lang__cell ${lang === l.id ? 'is-on' : ''}`}
            aria-pressed={lang === l.id}
            title={loc(l.full)}
            onClick={() => setLang(l.id)}
          >
            {l.label}
          </button>
        ))}
      </span>
    </div>
  )
}

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
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])

  return (
    <header className="mast">
      <a className="mast__brand" href="#top" aria-label={t('mast.brandAria')}>
        <span className="mast__mark">Hala&nbsp;4</span>
        <span className="mast__trade">{t('mast.trade')}</span>
      </a>
      <span className="mast__doc">
        {t('mast.doc')} <span className="serial">{t('mast.no')} {String(serial).padStart(6, '0')}</span>
      </span>
      <nav className={`mast__nav ${open ? 'is-open' : ''}`} id="mast-nav" aria-label={t('mast.sections')}>
        {NAV.map((n) => (
          <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}>
            {t(n.key)}
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
          {t('mast.deskLong')}
        </button>
        <span className="mast__navLang">
          <LangSwitch />
        </span>
      </nav>
      <span className="mast__langSlot">
        <LangSwitch />
      </span>
      <button
        ref={askRef}
        type="button"
        className="mast__ask"
        aria-expanded={asking}
        aria-controls="desk"
        onClick={onAsk}
      >
        {t('mast.desk')}
      </button>
      <button
        type="button"
        className="mast__menu"
        aria-expanded={open}
        aria-controls="mast-nav"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? t('mast.close') : t('mast.menu')}
      </button>
      <a className="btn btn--small mast__cta" href="#rezerwacja">
        {t('mast.book')}
      </a>
    </header>
  )
}
