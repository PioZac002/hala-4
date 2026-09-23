import { HALL } from '../data'
import { Scissors } from '../components/Marks'

export function Stub() {
  return (
    <footer className="stub">
      <div className="stub__perf" aria-hidden="true">
        <Scissors />
      </div>
      <div className="stub__grid">
        <p className="stub__mark">Hala&nbsp;4</p>
        <dl className="stub__facts">
          <div>
            <dt>Adres</dt>
            <dd>{HALL.address}</dd>
          </div>
          <div>
            <dt>Godziny</dt>
            <dd>{HALL.hours}</dd>
          </div>
          <div>
            <dt>Druk</dt>
            <dd>H4/P-01, trzy egzemplarze</dd>
          </div>
        </dl>
        <p className="stub__note">
          Hala 4 to projekt koncepcyjny. Nazwa, adres, flota i ceny są przykładowe, a nazwy modeli należą do ich producentów.
          Filmy z obchodu to cztery materiały źródłowe nakręcone w hali; klatki wycięto z nich bez retuszu.
        </p>
      </div>
    </footer>
  )
}
