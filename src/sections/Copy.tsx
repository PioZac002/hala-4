import { useState } from 'react'
import { DELIVERY, EXTRA_KM, FLEET, OWN_SHARE, TIERS, tierPerDay, tierTotal } from '../data'
import { Tick } from '../components/Marks'
import { decimal, money, useI18n, type Key } from '../i18n'

// The pink carbon copy: everything the renter takes home — price, deposit, limits, requirements.

const REQUIREMENTS: { id: string; key: Key }[] = [
  { id: 'age', key: 'terms.req.age' },
  { id: 'licence', key: 'terms.req.licence' },
  { id: 'id', key: 'terms.req.id' },
  { id: 'card', key: 'terms.req.card' },
]

const RULES: [Key, Key][] = [
  ['terms.rule.fuel', 'terms.rule.fuelV'],
  ['terms.rule.abroad', 'terms.rule.abroadV'],
  ['terms.rule.track', 'terms.rule.trackV'],
  ['terms.rule.pets', 'terms.rule.petsV'],
]

export function CarbonCopy({ carId, onCar }: { carId: string; onCar: (id: string) => void }) {
  const { t, loc, lang } = useI18n()
  const car = FLEET.find((c) => c.id === carId) ?? FLEET[0]
  const max = car.day
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const all = REQUIREMENTS.every((r) => checked[r.id])

  return (
    <div className="copy">
      <div className="copy__edge" aria-hidden="true">
        <span>{t('copy.forRenter')}</span>
        <span>{t('copy.form')}</span>
      </div>

      <section id="cennik" className="sheet-section" aria-labelledby="price-title">
        <div className="section-head section-head--row">
          <h2 id="price-title" className="display display--section">
            {t('price.title')}
          </h2>
          <label className="picker">
            <span className="picker__label">{t('price.car')}</span>
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
            <span className="box__label">{t('price.boxLabel')}</span>
            <table>
              <caption className="sr-only">{t('price.caption', { model: car.model })}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('price.period')}</th>
                  <th scope="col" className="tiers__barcol">
                    <span className="sr-only">{t('price.compare')}</span>
                  </th>
                  <th scope="col" className="num">{t('price.perDay')}</th>
                  <th scope="col" className="num">{t('price.total')}</th>
                </tr>
              </thead>
              <tbody>
                {TIERS.map((tier) => {
                  const perDay = tierPerDay(car, tier)
                  return (
                    <tr key={tier.id}>
                      <th scope="row">
                        {loc(tier.label)}
                        <span className="tiers__detail">{loc(tier.detail)}</span>
                      </th>
                      <td className="tiers__barcol" aria-hidden="true">
                        <span className="bar" style={{ '--w': perDay / max } as React.CSSProperties} />
                      </td>
                      <td className="num">{money(perDay, lang)}</td>
                      <td className="num strong">
                        {tier.id === 'd3'
                          ? t('price.fromTotal', { amount: money(tierTotal(car, { ...tier, days: 2 }), lang) })
                          : money(tierTotal(car, tier), lang)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <dl className="terms box">
            <span className="box__label">{t('price.settlement')}</span>
            <div>
              <dt>{t('foot.deposit')}</dt>
              <dd>{t('price.depositNote', { amount: money(car.deposit, lang) })}</dd>
            </div>
            <div>
              <dt>{t('foot.limit')}</dt>
              <dd>{t('price.limitNote', { km: car.kmPerDay, rate: `${decimal(EXTRA_KM, lang)} ${lang === 'pl' ? 'zł' : 'PLN'}` })}</dd>
            </div>
            <div>
              <dt>{t('price.insurance')}</dt>
              <dd>{t('price.insuranceNote', { amount: money(OWN_SHARE, lang) })}</dd>
            </div>
            <div>
              <dt>{t('price.delivery')}</dt>
              <dd>{t('price.deliveryNote', { amount: money(DELIVERY, lang) })}</dd>
            </div>
          </dl>
        </div>
        <p className="footnote">{t('price.footnote')}</p>
      </section>

      <section id="warunki" className="sheet-section" aria-labelledby="terms-title">
        <div className="section-head">
          <h2 id="terms-title" className="display display--section">
            {t('terms.title')}
          </h2>
          <p className="section-lead">{t('terms.lead')}</p>
        </div>

        <div className="terms-layout">
          <fieldset className="reqs box">
            <legend className="box__label">{t('terms.renter')}</legend>
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
                <span>{t(r.key)}</span>
              </label>
            ))}
            <p className={`reqs__verdict ink ${all ? 'is-on' : ''}`} aria-live="polite">
              {all ? (
                <>
                  {t('terms.allGood')} <a href="#rezerwacja">{t('terms.fillBooking')}</a>
                </>
              ) : (
                t('terms.ticked', { n: REQUIREMENTS.filter((r) => checked[r.id]).length, total: REQUIREMENTS.length })
              )}
            </p>
          </fieldset>

          <dl className="rules">
            {RULES.map(([head, body]) => (
              <div key={head}>
                <dt>{t(head)}</dt>
                <dd>{t(body)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  )
}
