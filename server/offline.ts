// The answer desk without the model behind it.
//
// When ANTHROPIC_API_KEY is missing (local checkout, static hosting, API outage), the widget
// still answers the questions the page can answer from its own price list. It reads the same
// src/data.ts, never invents anything, and says plainly that it is the short version.
import { DELIVERY, EXTRA_KM, FILMED, FLEET, HALL, OWN_SHARE, TIERS, priceFor, tierTotal, zl, type Car } from '../src/data'

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')

// Short keys like "oc" or "km" only count as whole words — otherwise "wiersz o kotach"
// reads as a question about insurance.
const has = (q: string, ...words: string[]) =>
  words.some((w) => {
    const n = norm(w)
    return n.length <= 3 ? new RegExp(`(^|[^a-z0-9])${n}([^a-z0-9]|$)`).test(q) : q.includes(n)
  })

// Which car the question is about, if any: model name, short name, or brand.
const BRANDS: [string, string][] = [
  ['golf', 'golf-r'],
  ['volkswagen', 'golf-r'],
  ['vw', 'golf-r'],
  ['rs3', 'rs3'],
  ['rs 3', 'rs3'],
  ['audi', 'rs3'],
  ['porsche', 'gt3rs'],
  ['911', 'gt3rs'],
  ['gt3', 'gt3rs'],
  ['octavia', 'octavia-rs'],
  ['skoda', 'octavia-rs'],
  ['oktawia', 'octavia-rs'],
  ['cupra', 'vz5'],
  ['formentor', 'vz5'],
  ['bmw', 'm240i'],
  ['m240', 'm240i'],
  ['toyota', 'gr-yaris'],
  ['yaris', 'gr-yaris'],
]

const carIn = (q: string): Car | null => {
  for (const [needle, id] of BRANDS) if (q.includes(norm(needle))) return FLEET.find((c) => c.id === id) ?? null
  return null
}

const cheapest = () => FLEET.reduce((a, b) => (b.day < a.day ? b : a))
const list = (cars: Car[]) => cars.map((c) => `${c.model} (${zl(c.day)}/doba)`).join(', ')

export function offlineAnswer(question: string): string {
  const q = norm(question)
  const car = carIn(q)
  const c = car ?? cheapest()

  if (has(q, 'kaucj', 'depozyt', 'blokada'))
    return car
      ? `Kaucja przy ${car.model} to ${zl(car.deposit)} — blokada na karcie, zwracana po zwrocie auta bez uwag.`
      : `Kaucja zależy od auta: od ${zl(cheapest().deposit)} przy ${cheapest().model} do ${zl(Math.max(...FLEET.map((x) => x.deposit)))} przy Porsche 911 GT3 RS. To blokada na karcie, zwracana po zwrocie auta bez uwag.`

  if (has(q, 'limit', 'kilometr', 'km', 'przebieg'))
    return car
      ? `${car.model} ma limit ${car.kmPerDay} km na dobę. Każdy kilometr ponad limit to ${EXTRA_KM.toFixed(2).replace('.', ',')} zł.`
      : `Limit to ${Math.min(...FLEET.map((x) => x.kmPerDay))}–${Math.max(...FLEET.map((x) => x.kmPerDay))} km na dobę, zależnie od auta. Każdy kilometr ponad limit kosztuje ${EXTRA_KM.toFixed(2).replace('.', ',')} zł.`

  if (has(q, 'ubezpiecz', 'oc', 'ac', 'nnw', 'udzial', 'szkod', 'stluczk'))
    return `OC, AC i NNW są w cenie każdego wynajmu. Udział własny w AC to ${zl(OWN_SHARE)}.`

  // On-topic, but past what the price list covers. The crew settles these — the same answer
  // the model gives, so the widget does not change its story when the key is missing.
  if (
    has(q, 'granic', 'zagranic', 'fotelik', 'dziec', 'wiek', 'lat', 'lata', 'prawo jazdy', 'kierowc', 'zwierz', 'pies',
      'pal', 'przyczep', 'hak', 'bagaz', 'paliw', 'tank', 'autostrad', 'winiet', 'mandat', 'awari', 'assistance',
      'umow', 'faktur', 'firm', 'gors', 'slub', 'sesj', 'tor wysc')
  )
    return `Tego nie mam w cenniku — ustala to obsługa hali przy potwierdzaniu terminu. Napisz o tym w uwagach przy zapytaniu o termin, oddzwonimy.`

  if (has(q, 'podstaw', 'dowoz', 'dowiez', 'pod dom', 'przywiez'))
    return `Podstawienie auta na terenie miasta kosztuje ${zl(DELIVERY)}. Odbiór w hali (${HALL.address}) jest bezpłatny.`

  if (has(q, 'weekend'))
    return `Weekend liczymy od piątku 16:00 do poniedziałku 10:00. ${c.model} na weekend to ${zl(tierTotal(c, TIERS[2]))}.`

  if (has(q, 'tydzien', 'tygodn', '7 dni'))
    return `Tydzień jest tańszy o 25% w przeliczeniu na dobę: ${c.model} przez 7 dni to ${zl(priceFor(c, 7))}.`

  if (has(q, 'cena', 'koszt', 'ile', 'cennik', 'doba', 'dobe', 'plac'))
    return car
      ? `${car.model} to ${zl(car.day)} za dobę, ${zl(priceFor(car, 3))} za 3 doby i ${zl(priceFor(car, 7))} za tydzień. Kaucja ${zl(car.deposit)}, limit ${car.kmPerDay} km na dobę.`
      : `Ceny za dobę: ${list(FLEET.slice(0, 4))}. Od 2 dób jest 10% taniej, od 7 dni 25%, od 30 dni 45%.`

  if (has(q, 'dostep', 'wolny', 'wolne', 'termin', 'kiedy', 'jutro', 'dzisiaj')) {
    const now = FLEET.filter((x) => x.availableInDays === 0)
    return car
      ? car.availableInDays === 0
        ? `${car.model} jest wolny od ręki. Termin potwierdza obsługa hali po wysłaniu zapytania.`
        : `${car.model} ma najbliższy wolny termin za ${car.availableInDays} dni. Od ręki stoją: ${now.map((x) => x.model).join(', ')}.`
      : `Od ręki wolne są: ${now.map((x) => x.model).join(', ')}. Termin potwierdza obsługa hali po wysłaniu zapytania.`
  }

  if (has(q, 'gdzie', 'adres', 'dojazd', 'godzin', 'otwart', 'hala'))
    return `${HALL.name}, ${HALL.address}, czynne ${HALL.hours}. Podstawienie auta na terenie miasta kosztuje ${zl(DELIVERY)}, odbiór w hali jest bezpłatny.`

  if (has(q, 'odbior', 'wydani', 'zwrot', 'protokol', 'ogledzin', 'jak wyglada'))
    return `Auto wydajemy w hali, nie na parkingu: robimy wspólny obchód, pięć zdjęć (przód, bok, tył, drzwi, wnętrze) i protokół, który podpisujemy oboje. Zwrot wygląda tak samo.`

  if (has(q, 'rezerw', 'zamow', 'wynaj', 'zapyta', 'formularz'))
    return `Rezerwację zaczyna zapytanie o termin z sekcji „Rezerwacja”: auto, daty i kontakt. Termin potwierdza obsługa hali.`

  if (has(q, 'jakie auta', 'flota', 'oferta', 'wybor aut', 'polec', 'lista aut', 'co macie'))
    return `W ofercie mamy ${FLEET.length} aut, od ${cheapest().model} za ${zl(cheapest().day)} za dobę po Porsche 911 GT3 RS. Cztery z nich — ${FILMED.map((x) => x.short).join(', ')} — można obejrzeć na filmie z hali na górze strony.`

  if (car) return `${car.model}: ${car.power} KM, ${car.drive}, ${car.gearbox}. ${zl(car.day)} za dobę, kaucja ${zl(car.deposit)}, limit ${car.kmPerDay} km na dobę.`



  return `Zajmuję się tylko autami i ofertą ${HALL.name}: ceny, kaucje, limity kilometrów, ubezpieczenie, terminy i przebieg wydania auta. W czym mogę pomóc przy wynajmie?`
}
