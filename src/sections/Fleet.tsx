import { FLEET, dateFromToday, fmtDate, zl, type Car } from '../data'
import { Arrow, CarOutline, Clip } from '../components/Marks'
import { setFor, stillUrl } from '../hero/frames'
import { scrollToId } from '../scroll'

// The card photo is the side shot from that car's walk-around — the same frame the
// protocol clips in as photo 2 — so the card and the hero never show two different cars.
const cardPhoto = (car: Car) => (car.film ? stillUrl(setFor(car.film), car.film, 1) : null)

const availability = (c: Car) => (c.availableInDays === 0 ? 'dostępny od ręki' : `wolny od ${fmtDate(dateFromToday(c.availableInDays)).slice(0, 5)}`)

function VehicleCard({ car, onBook }: { car: Car; onBook: () => void }) {
  const photo = cardPhoto(car)
  return (
    <article className="card box" aria-live="polite">
      <span className="box__label">Karta pojazdu</span>
      <div className="card__photo">
        {photo ? (
          <>
            <img src={photo} alt={`${car.model}, zdjęcie z obchodu`} loading="lazy" />
            <Clip />
          </>
        ) : (
          <div className="card__empty">
            <svg viewBox={`40 40 160 230`} aria-hidden="true" className="card__pictogram">
              <CarOutline />
            </svg>
            <span>Zdjęcia tego auta dołączymy do protokołu przy odbiorze.</span>
          </div>
        )}
      </div>
      <h3 className="card__model ink" key={car.id}>
        {car.model}
      </h3>
      <dl className="card__specs">
        <div>
          <dt>Nadwozie</dt>
          <dd>{car.body}</dd>
        </div>
        <div>
          <dt>Napęd</dt>
          <dd>{car.drive}</dd>
        </div>
        <div>
          <dt>Skrzynia</dt>
          <dd>{car.gearbox}</dd>
        </div>
        <div>
          <dt>Moc</dt>
          <dd>{car.power} KM</dd>
        </div>
        <div>
          <dt>Miejsca</dt>
          <dd>{car.seats}</dd>
        </div>
        <div>
          <dt>Limit</dt>
          <dd>{car.kmPerDay} km / doba</dd>
        </div>
      </dl>
      <div className="card__foot">
        <p className="card__price">
          <span className="price__num">{zl(car.day)}</span> za dobę
          <span className="card__avail ink">{availability(car)}</span>
        </p>
        <button type="button" className="btn" onClick={onBook}>
          Rezerwuj to auto <Arrow />
        </button>
        {car.film && (
          <button type="button" className="link card__walk" onClick={() => scrollToId('top')}>
            Obejrzyj obchód
          </button>
        )}
      </div>
    </article>
  )
}

export function Fleet({ carId, onSelect, onBook }: { carId: string; onSelect: (id: string) => void; onBook: (id: string) => void }) {
  const car = FLEET.find((c) => c.id === carId) ?? FLEET[0]
  return (
    <section id="flota" className="sheet-section fleet" aria-labelledby="fleet-title">
      <div className="section-head">
        <h2 id="fleet-title" className="display display--section">
          Flota
        </h2>
        <p className="section-lead">
          Siedem aut do jazdy dla przyjemności. Cztery obchodzimy z filmu na górze strony. Wybierz wiersz, żeby
          zobaczyć kartę auta.
        </p>
      </div>

      <div className="fleet__layout">
        <VehicleCard car={car} onBook={() => onBook(car.id)} />

        <div className="register box">
          <span className="box__label">Rejestr pojazdów</span>
          <table>
            <caption className="sr-only">Flota Hali 4 z ceną za dobę i dostępnością</caption>
            <thead>
              <tr>
                <th scope="col">Lp.</th>
                <th scope="col">Model</th>
                <th scope="col" className="col-body">Nadwozie</th>
                <th scope="col" className="col-drive">Napęd</th>
                <th scope="col" className="num">Moc</th>
                <th scope="col" className="num">Doba</th>
                <th scope="col" className="col-avail">Dostępność</th>
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
                    <td className="col-body">{c.body}</td>
                    <td className="col-drive">{c.drive}</td>
                    <td className="num">{c.power} KM</td>
                    <td className="num">{zl(c.day)}</td>
                    <td className="col-avail ink">{availability(c)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="footnote">Flota, ceny i terminy są przykładowe. Moc według danych producentów.</p>
        </div>
      </div>
    </section>
  )
}
