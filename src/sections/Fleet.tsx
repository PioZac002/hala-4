import { FLEET, dateFromToday, fmtDate, type Car } from '../data'
import { money, useI18n, type Lang } from '../i18n'
import { Arrow, CarOutline, Clip } from '../components/Marks'
import { setFor, stillUrl } from '../hero/frames'
import { scrollToId } from '../scroll'

// The card photo is the side shot from that car's walk-around — the same frame the
// protocol clips in as photo 2 — so the card and the hero never show two different cars.
const cardPhoto = (car: Car) => (car.film ? stillUrl(setFor(car.film), car.film, 1) : null)

type T = ReturnType<typeof useI18n>['t']
const availability = (c: Car, t: T) =>
  c.availableInDays === 0
    ? t('fleet.availableNow')
    : t('fleet.availableFrom', { date: fmtDate(dateFromToday(c.availableInDays)).slice(0, 5) })

function VehicleCard({ car, onBook }: { car: Car; onBook: () => void }) {
  const { t, loc, lang } = useI18n()
  const photo = cardPhoto(car)
  return (
    <article className="card box" aria-live="polite">
      <span className="box__label">{t('fleet.card')}</span>
      <div className="card__photo">
        {photo ? (
          <>
            <img src={photo} alt={t('fleet.photoAlt', { model: car.model })} loading="lazy" />
            <Clip />
          </>
        ) : (
          <div className="card__empty">
            <svg viewBox={`40 40 160 230`} aria-hidden="true" className="card__pictogram">
              <CarOutline />
            </svg>
            <span>{t('fleet.noPhoto')}</span>
          </div>
        )}
      </div>
      <h3 className="card__model ink" key={car.id}>
        {car.model}
      </h3>
      <dl className="card__specs">
        <div>
          <dt>{t('fleet.body')}</dt>
          <dd>{loc(car.body)}</dd>
        </div>
        <div>
          <dt>{t('fleet.drive')}</dt>
          <dd>{loc(car.drive)}</dd>
        </div>
        <div>
          <dt>{t('fleet.gearbox')}</dt>
          <dd>{loc(car.gearbox)}</dd>
        </div>
        <div>
          <dt>{t('fleet.power')}</dt>
          <dd>{car.power} {t('veh.hp')}</dd>
        </div>
        <div>
          <dt>{t('fleet.seats')}</dt>
          <dd>{car.seats}</dd>
        </div>
        <div>
          <dt>{t('fleet.limit')}</dt>
          <dd>{t('fleet.kmPerDay', { km: car.kmPerDay })}</dd>
        </div>
      </dl>
      <div className="card__foot">
        <p className="card__price">
          <span className="price__num">{money(car.day, lang)}</span> {t('foot.perDay')}
          <span className="card__avail ink">{availability(car, t)}</span>
        </p>
        <button type="button" className="btn" onClick={onBook}>
          {t('fleet.bookThis')} <Arrow />
        </button>
        {car.film && (
          <button type="button" className="link card__walk" onClick={() => scrollToId('top')}>
            {t('fleet.watchWalk')}
          </button>
        )}
      </div>
    </article>
  )
}

export function Fleet({ carId, onSelect, onBook }: { carId: string; onSelect: (id: string) => void; onBook: (id: string) => void }) {
  const { t, loc, lang } = useI18n()
  const car = FLEET.find((c) => c.id === carId) ?? FLEET[0]
  return (
    <section id="flota" className="sheet-section fleet" aria-labelledby="fleet-title">
      <div className="section-head">
        <h2 id="fleet-title" className="display display--section">
          {t('fleet.title')}
        </h2>
        <p className="section-lead">{t('fleet.lead')}</p>
      </div>

      <div className="fleet__layout">
        <VehicleCard car={car} onBook={() => onBook(car.id)} />

        <div className="register box">
          <span className="box__label">{t('fleet.register')}</span>
          <table>
            <caption className="sr-only">{t('fleet.caption')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('fleet.no')}</th>
                <th scope="col">{t('fleet.model')}</th>
                <th scope="col" className="col-body">{t('fleet.body')}</th>
                <th scope="col" className="col-drive">{t('fleet.drive')}</th>
                <th scope="col" className="num">{t('fleet.power')}</th>
                <th scope="col" className="num">{t('fleet.day')}</th>
                <th scope="col" className="col-avail">{t('fleet.availability')}</th>
              </tr>
            </thead>
            <tbody>
              {FLEET.map((c, i) => {
                const on = c.id === car.id
                return (
                  <tr key={c.id} className={on ? 'is-on' : ''}>
                    <td className="num lp">{i + 1}.</td>
                    <th scope="row">
                      <button type="button" className="register__pick" aria-pressed={on} onClick={() => onSelect(c.id)}>
                        {c.model}
                        {on && (
                          <svg className="circled" viewBox="0 0 200 50" preserveAspectRatio="none" aria-hidden="true">
                            <path pathLength={1} d="M14 30C10 15 60 5 110 6c52 1 84 8 82 20-3 14-60 20-104 19C40 44 6 38 12 24 16 14 40 9 62 8" />
                          </svg>
                        )}
                      </button>
                    </th>
                    <td className="col-body">{loc(c.body)}</td>
                    <td className="col-drive">{loc(c.drive)}</td>
                    <td className="num">{c.power} {t('veh.hp')}</td>
                    <td className="num">{money(c.day, lang)}</td>
                    <td className="col-avail ink">{availability(c, t)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="footnote">{t('fleet.footnote')}</p>
        </div>
      </div>
    </section>
  )
}
