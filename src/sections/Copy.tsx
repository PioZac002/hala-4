import { useState } from 'react'
import { DELIVERY, EXTRA_KM, FLEET, OWN_SHARE, TIERS, tierPerDay, tierTotal, zl } from '../data'
import { Tick } from '../components/Marks'

// The pink carbon copy: everything the renter takes home — price, deposit, limits, requirements.

const REQUIREMENTS = [
  { id: 'age', label: 'Masz co najmniej 25 lat' },
  { id: 'licence', label: 'Prawo jazdy kat. B masz od minimum 3 lat' },
  { id: 'id', label: 'Masz dowód osobisty albo paszport' },
  { id: 'card', label: 'Masz kartę kredytową na blokadę kaucji' },
]

const RULES = [
  { k: 'Paliwo', v: 'Odbierasz z pełnym bakiem i z pełnym oddajesz.' },
  { k: 'Wyjazd za granicę', v: 'W Unii Europejskiej, po wcześniejszym zgłoszeniu.' },
  { k: 'Tor i imprezy', v: 'Jazda po torze jest wykluczona z ubezpieczenia.' },
  { k: 'Zwierzęta', v: 'Tylko w transporterze. Nie palimy w autach.' },
]

export function CarbonCopy({ carId, onCar }: { carId: string; onCar: (id: string) => void }) {
  const car = FLEET.find((c) => c.id === carId) ?? FLEET[0]
  const max = car.day
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const all = REQUIREMENTS.every((r) => checked[r.id])

  return (
    <div className="copy">
      <div className="copy__edge" aria-hidden="true">
        <span>Kopia dla najemcy</span>
        <span>Druk H4/P-01 · egz. 2</span>
      </div>

      <section id="cennik" className="sheet-section" aria-labelledby="price-title">
        <div className="section-head section-head--row">
          <h2 id="price-title" className="display display--section">
            Cennik
          </h2>
          <label className="picker">
            <span className="picker__label">Auto</span>
            <select className="ink" value={car.id} onChange={(e) => onCar(e.target.value)}>
              {FLEET.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.model}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="price-layout">
          <div className="tiers box">
            <span className="box__label">Cena za dobę maleje z długością najmu</span>
            <table>
              <caption className="sr-only">Cennik dla auta {car.model}</caption>
              <thead>
                <tr>
                  <th scope="col">Okres</th>
                  <th scope="col" className="tiers__barcol">
                    <span className="sr-only">Porównanie ceny za dobę</span>
                  </th>
                  <th scope="col" className="num">Za dobę</th>
                  <th scope="col" className="num">Razem</th>
                </tr>
              </thead>
              <tbody>
                {TIERS.map((t) => {
                  const perDay = tierPerDay(car, t)
                  return (
                    <tr key={t.id}>
                      <th scope="row">
                        {t.label}
                        <span className="tiers__detail">{t.detail}</span>
                      </th>
                      <td className="tiers__barcol" aria-hidden="true">
                        <span className="bar" style={{ '--w': perDay / max } as React.CSSProperties} />
                      </td>
                      <td className="num">{zl(perDay)}</td>
                      <td className="num strong">{t.id === 'd3' ? `od ${zl(tierTotal(car, { ...t, days: 2 }))}` : zl(tierTotal(car, t))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <dl className="terms box">
            <span className="box__label">Rozliczenie</span>
            <div>
              <dt>Kaucja</dt>
              <dd>
                <b>{zl(car.deposit)}</b> blokady na karcie, zwalniamy ją po zwrocie auta
              </dd>
            </div>
            <div>
              <dt>Limit</dt>
              <dd>
                <b>{car.kmPerDay} km</b> na dobę, każdy kolejny {EXTRA_KM.toFixed(2).replace('.', ',')} zł
              </dd>
            </div>
            <div>
              <dt>Ubezpieczenie</dt>
              <dd>
                OC, AC i NNW w cenie, udział własny <b>{zl(OWN_SHARE)}</b>
              </dd>
            </div>
            <div>
              <dt>Dowóz</dt>
              <dd>
                Po Warszawie <b>{zl(DELIVERY)}</b> w jedną stronę albo odbiór w hali za darmo
              </dd>
            </div>
          </dl>
        </div>
        <p className="footnote">Wszystkie kwoty są przykładowe i czekają na prawdziwy cennik.</p>
      </section>

      <section id="warunki" className="sheet-section" aria-labelledby="terms-title">
        <div className="section-head">
          <h2 id="terms-title" className="display display--section">
            Warunki
          </h2>
          <p className="section-lead">Cztery rzeczy, które sprawdzimy przy odbiorze. Zaznacz, co się zgadza.</p>
        </div>

        <div className="terms-layout">
          <fieldset className="reqs box">
            <legend className="box__label">Najemca</legend>
            {REQUIREMENTS.map((r) => (
              <label key={r.id} className="req">
                <input
                  type="checkbox"
                  checked={!!checked[r.id]}
                  onChange={(e) => setChecked((c) => ({ ...c, [r.id]: e.target.checked }))}
                />
                <span className="checkbox" aria-hidden="true">
                  <Tick on={!!checked[r.id]} />
                </span>
                <span>{r.label}</span>
              </label>
            ))}
            <p className={`reqs__verdict ink ${all ? 'is-on' : ''}`} aria-live="polite">
              {all ? (
                <>
                  Wszystko się zgadza. <a href="#rezerwacja">Wypełnij rezerwację</a>
                </>
              ) : (
                `Zaznaczone: ${REQUIREMENTS.filter((r) => checked[r.id]).length} z ${REQUIREMENTS.length}`
              )}
            </p>
          </fieldset>

          <dl className="rules">
            {RULES.map((r) => (
              <div key={r.k}>
                <dt>{r.k}</dt>
                <dd>{r.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  )
}
