import { useState } from 'react'
import { FLEET, dateFromToday, fmtDate, priceFor } from '../data'
import { dayCount, money, useI18n } from '../i18n'
import { Arrow, Signature, Stamp } from '../components/Marks'
import { CharBoxes, dateToDigits, digitsToDate } from '../components/CharBoxes'

const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

type Errors = Partial<Record<'from' | 'to' | 'name' | 'phone' | 'email', string>>

export function Booking({
  carId,
  onCar,
  serial,
  onFiled,
  onAsk,
}: {
  carId: string
  onCar: (id: string) => void
  serial: number
  onFiled: () => void
  onAsk: () => void
}) {
  const { t, lang } = useI18n()
  const car = FLEET.find((c) => c.id === carId) ?? FLEET[0]
  const [from, setFrom] = useState(dateToDigits(dateFromToday(1)))
  const [to, setTo] = useState(dateToDigits(dateFromToday(4)))
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [filed, setFiled] = useState<number | null>(null)

  const fromDate = digitsToDate(from)
  const toDate = digitsToDate(to)
  const days = fromDate && toDate ? Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) : 0

  const validate = (): Errors => {
    const e: Errors = {}
    if (!fromDate) e.from = t('book.err.fromFormat')
    else if (fromDate < startOfToday()) e.from = t('book.err.fromPast')
    if (!toDate) e.to = t('book.err.toFormat')
    else if (days < 1) e.to = t('book.err.toOrder')
    if (name.trim().split(/\s+/).length < 2) e.name = t('book.err.name')
    if (phone.length < 9) e.phone = t('book.err.phone')
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t('book.err.email')
    return e
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0]
      document.getElementById(`f-${first}`)?.focus()
      return
    }
    setFiled(serial + 1)
    onFiled()
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <span className="annot" id={`e-${k}`}>
        {errors[k]}
      </span>
    ) : null
  const aria = (k: keyof Errors) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': `e-${k}` } : {})

  return (
    <section id="rezerwacja" className="sheet-section booking" aria-labelledby="book-title">
      <div className="section-head">
        <h2 id="book-title" className="display display--section">
          {t('book.title')}
        </h2>
        <p className="section-lead">
          {t('book.lead')}{' '}
          <button type="button" className="link" onClick={onAsk}>
            {t('book.askDesk')}
          </button>
          .
        </p>
      </div>

      <form className="booking__form" onSubmit={submit} noValidate>
        <div className="booking__fields">
          <label className="f f--wide">
            <span className="f__label">{t('book.car')}</span>
            <select className="ink" value={car.id} onChange={(e) => onCar(e.target.value)}>
              {FLEET.map((c) => (
                <option key={c.id} value={c.id}>
                  {t('book.perDayOption', { model: c.model, amount: money(c.day, lang) })}
                </option>
              ))}
            </select>
          </label>
          <label className={`f ${errors.from ? 'is-err' : ''}`}>
            <span className="f__label">
              {t('book.pickUp')} <i>{t('book.dmy')}</i>
            </span>
            <CharBoxes
              id="f-from"
              label={t('book.pickUpAria')}
              value={from}
              onChange={setFrom}
              groups={[2, 2, 4]}
              sep="."
              invalid={!!errors.from}
              describedBy={errors.from ? 'e-from' : undefined}
            />
            {err('from')}
          </label>
          <label className={`f ${errors.to ? 'is-err' : ''}`}>
            <span className="f__label">
              {t('book.return')} <i>{t('book.dmy')}</i>
            </span>
            <CharBoxes
              id="f-to"
              label={t('book.returnAria')}
              value={to}
              onChange={setTo}
              groups={[2, 2, 4]}
              sep="."
              invalid={!!errors.to}
              describedBy={errors.to ? 'e-to' : undefined}
            />
            {err('to')}
          </label>
          <label className={`f f--wide ${errors.name ? 'is-err' : ''}`}>
            <span className="f__label">{t('book.name')}</span>
            <input id="f-name" className="ink" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} {...aria('name')} />
            {err('name')}
          </label>
          <label className={`f ${errors.phone ? 'is-err' : ''}`}>
            <span className="f__label">{t('book.phone')}</span>
            <span className="f__prefixed">
              <span className="f__prefix">+48</span>
              <CharBoxes
                id="f-phone"
                label={t('book.phoneAria')}
                value={phone}
                onChange={setPhone}
                normalize={(d) => (d.length > 9 && d.startsWith('48') ? d.slice(2) : d)}
                groups={[3, 3, 3]}
                autoComplete="tel-national"
                invalid={!!errors.phone}
                describedBy={errors.phone ? 'e-phone' : undefined}
              />
            </span>
            {err('phone')}
          </label>
          <label className={`f ${errors.email ? 'is-err' : ''}`}>
            <span className="f__label">
              {t('book.email')} <i>{t('book.optional')}</i>
            </span>
            <input id="f-email" className="ink" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} {...aria('email')} />
            {err('email')}
          </label>
          <label className="f f--wide">
            <span className="f__label">
              {t('book.notes')} <i>{t('book.notesHint')}</i>
            </span>
            <textarea className="ink" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>

        <aside className="booking__sum box" aria-live="polite">
          <span className="box__label">{t('book.settlement')}</span>
          <dl>
            <div>
              <dt>{t('book.period')}</dt>
              <dd>{days > 0 ? dayCount(days, lang) : '—'}</dd>
            </div>
            <div>
              <dt>{t('book.kmLimit')}</dt>
              <dd>
                {days > 0
                  ? `${(days * car.kmPerDay).toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-GB').replace(/[\u00a0,]/g, ' ')} km`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>{t('book.deposit')}</dt>
              <dd>{money(car.deposit, lang)}</dd>
            </div>
            <div className="sum__total">
              <dt>{t('book.rental')}</dt>
              <dd>{days > 0 ? money(priceFor(car, days), lang) : '—'}</dd>
            </div>
          </dl>

          <div className="booking__sign">
            <Signature on={filed !== null} />
            <span className="signoff__label">{t('book.signedBy')}</span>
            <Stamp word={t('book.stamp')} date={fmtDate(new Date())} on={filed !== null} id="st-book" />
          </div>

          {filed === null ? (
            <button type="submit" className="btn btn--block">
              {t('book.submit')} <Arrow />
            </button>
          ) : (
            <p className="booking__done" role="status">
              {t('book.done', { no: `${t('mast.no')} ${String(filed).padStart(6, '0')}` })}
            </p>
          )}
        </aside>
      </form>
    </section>
  )
}
