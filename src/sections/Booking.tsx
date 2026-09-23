import { useState } from 'react'
import { FLEET, dateFromToday, fmtDate, priceFor, zl } from '../data'
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
    if (!fromDate) e.from = 'Wpisz datę odbioru jako dzień, miesiąc i rok, np. 03.10.2026.'
    else if (fromDate < startOfToday()) e.from = 'Odbiór najwcześniej dziś.'
    if (!toDate) e.to = 'Wpisz datę zwrotu jako dzień, miesiąc i rok.'
    else if (days < 1) e.to = 'Zwrot musi być co najmniej dzień po odbiorze.'
    if (name.trim().split(/\s+/).length < 2) e.name = 'Wpisz imię i nazwisko, tak jak w prawie jazdy.'
    if (phone.length < 9) e.phone = 'Numer ma za mało cyfr. Oddzwonimy na niego, żeby potwierdzić termin.'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Adres e-mail wygląda na niepełny. Możesz go też usunąć.'
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
          Rezerwacja
        </h2>
        <p className="section-lead">
          Wypełnij jak protokół. Oddzwonimy, żeby potwierdzić termin i godzinę odbioru w hali. Nie wiesz, które auto?{' '}
          <button type="button" className="link" onClick={onAsk}>
            Zapytaj obsługi
          </button>
          .
        </p>
      </div>

      <form className="booking__form" onSubmit={submit} noValidate>
        <div className="booking__fields">
          <label className="f f--wide">
            <span className="f__label">Auto</span>
            <select className="ink" value={car.id} onChange={(e) => onCar(e.target.value)}>
              {FLEET.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.model} · {zl(c.day)} / doba
                </option>
              ))}
            </select>
          </label>
          <label className={`f ${errors.from ? 'is-err' : ''}`}>
            <span className="f__label">
              Odbiór <i>dzień · miesiąc · rok</i>
            </span>
            <CharBoxes
              id="f-from"
              label="Data odbioru, dzień miesiąc rok"
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
              Zwrot <i>dzień · miesiąc · rok</i>
            </span>
            <CharBoxes
              id="f-to"
              label="Data zwrotu, dzień miesiąc rok"
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
            <span className="f__label">Imię i nazwisko</span>
            <input id="f-name" className="ink" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} {...aria('name')} />
            {err('name')}
          </label>
          <label className={`f ${errors.phone ? 'is-err' : ''}`}>
            <span className="f__label">Telefon</span>
            <span className="f__prefixed">
              <span className="f__prefix">+48</span>
              <CharBoxes
                id="f-phone"
                label="Numer telefonu, 9 cyfr"
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
              E-mail <i>nieobowiązkowo</i>
            </span>
            <input id="f-email" className="ink" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} {...aria('email')} />
            {err('email')}
          </label>
          <label className="f f--wide">
            <span className="f__label">
              Uwagi <i>np. dowóz, fotelik, godzina</i>
            </span>
            <textarea className="ink" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>

        <aside className="booking__sum box" aria-live="polite">
          <span className="box__label">Rozliczenie</span>
          <dl>
            <div>
              <dt>Okres</dt>
              <dd>{days > 0 ? `${days} ${days === 1 ? 'doba' : days < 5 ? 'doby' : 'dób'}` : '—'}</dd>
            </div>
            <div>
              <dt>Limit km</dt>
              <dd>{days > 0 ? `${(days * car.kmPerDay).toLocaleString('pl-PL')} km` : '—'}</dd>
            </div>
            <div>
              <dt>Kaucja</dt>
              <dd>{zl(car.deposit)}</dd>
            </div>
            <div className="sum__total">
              <dt>Najem</dt>
              <dd>{days > 0 ? zl(priceFor(car, days)) : '—'}</dd>
            </div>
          </dl>

          <div className="booking__sign">
            <Signature on={filed !== null} />
            <span className="signoff__label">Podpis najemcy</span>
            <Stamp word="PRZYJĘTO" date={fmtDate(new Date())} on={filed !== null} id="st-book" />
          </div>

          {filed === null ? (
            <button type="submit" className="btn btn--block">
              Podpisz i wyślij zapytanie <Arrow />
            </button>
          ) : (
            <p className="booking__done" role="status">
              Zapytanie <b className="serial">Nr {String(filed).padStart(6, '0')}</b> przyjęte. To projekt koncepcyjny, więc
              formularz niczego nie wysłał.
            </p>
          )}
        </aside>
      </form>
    </section>
  )
}
