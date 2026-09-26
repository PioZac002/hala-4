// The answer desk without the model behind it.
//
// When ANTHROPIC_API_KEY is missing (local checkout, static hosting, API outage), the widget
// still answers the questions the page can answer from its own price list. It reads the same
// src/data.ts, never invents anything, and says plainly that it is the short version.
// It matches keywords in both languages and answers in the one the page is printed in.
import { DELIVERY, EXTRA_KM, FILMED, FLEET, HALL, OWN_SHARE, TIERS, priceFor, tierTotal, type Car } from '../src/data'
import { decimal, money, pick, type Lang } from '../src/format'

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
const list = (cars: Car[], lang: Lang) =>
  cars.map((c) => `${c.model} (${money(c.day, lang)}/${lang === 'pl' ? 'doba' : 'day'})`).join(', ')

export function offlineAnswer(question: string, lang: Lang = 'pl'): string {
  const q = norm(question)
  const car = carIn(q)
  const c = car ?? cheapest()
  const cheap = cheapest()
  const say = (en: string, pl: string) => pick({ en, pl }, lang)
  const extraKm = `${decimal(EXTRA_KM, lang)} ${lang === 'pl' ? 'zł' : 'PLN'}`

  if (has(q, 'kaucj', 'depozyt', 'blokada', 'deposit', 'hold'))
    return car
      ? say(
          `The deposit on the ${car.model} is ${money(car.deposit, lang)} — a hold on your card, released once the car comes back with nothing to report.`,
          `Kaucja przy ${car.model} to ${money(car.deposit, lang)} — blokada na karcie, zwracana po zwrocie auta bez uwag.`,
        )
      : say(
          `The deposit depends on the car: from ${money(cheap.deposit, lang)} on the ${cheap.model} to ${money(Math.max(...FLEET.map((x) => x.deposit)), lang)} on the Porsche 911 GT3 RS. It is a hold on your card, released after the car comes back with nothing to report.`,
          `Kaucja zależy od auta: od ${money(cheap.deposit, lang)} przy ${cheap.model} do ${money(Math.max(...FLEET.map((x) => x.deposit)), lang)} przy Porsche 911 GT3 RS. To blokada na karcie, zwracana po zwrocie auta bez uwag.`,
        )

  if (has(q, 'limit', 'kilometr', 'km', 'przebieg', 'mileage', 'kilometre', 'kilometer'))
    return car
      ? say(
          `The ${car.model} comes with ${car.kmPerDay} km a day. Every kilometre over that is ${extraKm}.`,
          `${car.model} ma limit ${car.kmPerDay} km na dobę. Każdy kilometr ponad limit to ${extraKm}.`,
        )
      : say(
          `The limit is ${Math.min(...FLEET.map((x) => x.kmPerDay))}–${Math.max(...FLEET.map((x) => x.kmPerDay))} km a day, depending on the car. Every kilometre over it costs ${extraKm}.`,
          `Limit to ${Math.min(...FLEET.map((x) => x.kmPerDay))}–${Math.max(...FLEET.map((x) => x.kmPerDay))} km na dobę, zależnie od auta. Każdy kilometr ponad limit kosztuje ${extraKm}.`,
        )

  if (has(q, 'ubezpiecz', 'oc', 'ac', 'nnw', 'udzial', 'szkod', 'stluczk', 'insur', 'excess', 'damage'))
    return say(
      `Third-party, comprehensive and accident cover are included in every rental. The comprehensive excess is ${money(OWN_SHARE, lang)}.`,
      `OC, AC i NNW są w cenie każdego wynajmu. Udział własny w AC to ${money(OWN_SHARE, lang)}.`,
    )

  // On-topic, but past what the price list covers. The crew settles these — the same answer
  // the model gives, so the widget does not change its story when the key is missing.
  if (
    has(q, 'granic', 'zagranic', 'fotelik', 'dziec', 'wiek', 'lat', 'lata', 'prawo jazdy', 'kierowc', 'zwierz', 'pies',
      'pal', 'przyczep', 'hak', 'bagaz', 'paliw', 'tank', 'autostrad', 'winiet', 'mandat', 'awari', 'assistance',
      'umow', 'faktur', 'firm', 'gors', 'slub', 'sesj', 'tor wysc',
      'abroad', 'border', 'child seat', 'baby', 'age', 'licen', 'driver', 'pet', 'dog', 'smok', 'trailer', 'tow',
      'luggage', 'fuel', 'motorway', 'toll', 'fine', 'breakdown', 'contract', 'invoice', 'company', 'wedding', 'track day')
  )
    return say(
      `That is not in the price list — the hall settles it when it confirms your date. Put it in the notes on the enquiry and we will call you back.`,
      `Tego nie mam w cenniku — ustala to obsługa hali przy potwierdzaniu terminu. Napisz o tym w uwagach przy zapytaniu o termin, oddzwonimy.`,
    )

  if (has(q, 'podstaw', 'dowoz', 'dowiez', 'pod dom', 'przywiez', 'deliver', 'bring it'))
    return say(
      `Delivery within the city is ${money(DELIVERY, lang)}. Pick-up at the hall (${pick(HALL.address, lang)}) is free.`,
      `Podstawienie auta na terenie miasta kosztuje ${money(DELIVERY, lang)}. Odbiór w hali (${pick(HALL.address, lang)}) jest bezpłatny.`,
    )

  if (has(q, 'weekend'))
    return say(
      `A weekend runs from Friday 16:00 to Monday 10:00. The ${c.model} for a weekend is ${money(tierTotal(c, TIERS[2]), lang)}.`,
      `Weekend liczymy od piątku 16:00 do poniedziałku 10:00. ${c.model} na weekend to ${money(tierTotal(c, TIERS[2]), lang)}.`,
    )

  if (has(q, 'tydzien', 'tygodn', '7 dni', 'week', '7 days'))
    return say(
      `A week is 25% cheaper per day: the ${c.model} for 7 days is ${money(priceFor(c, 7), lang)}.`,
      `Tydzień jest tańszy o 25% w przeliczeniu na dobę: ${c.model} przez 7 dni to ${money(priceFor(c, 7), lang)}.`,
    )

  if (has(q, 'cena', 'koszt', 'ile', 'cennik', 'doba', 'dobe', 'plac', 'price', 'cost', 'how much', 'rate', 'pay'))
    return car
      ? say(
          `The ${car.model} is ${money(car.day, lang)} a day, ${money(priceFor(car, 3), lang)} for 3 days and ${money(priceFor(car, 7), lang)} for a week. Deposit ${money(car.deposit, lang)}, limit ${car.kmPerDay} km a day.`,
          `${car.model} to ${money(car.day, lang)} za dobę, ${money(priceFor(car, 3), lang)} za 3 doby i ${money(priceFor(car, 7), lang)} za tydzień. Kaucja ${money(car.deposit, lang)}, limit ${car.kmPerDay} km na dobę.`,
        )
      : say(
          `Day rates: ${list(FLEET.slice(0, 4), lang)}. From 2 days it is 10% cheaper, from 7 days 25%, from 30 days 45%.`,
          `Ceny za dobę: ${list(FLEET.slice(0, 4), lang)}. Od 2 dób jest 10% taniej, od 7 dni 25%, od 30 dni 45%.`,
        )

  if (has(q, 'dostep', 'wolny', 'wolne', 'termin', 'kiedy', 'jutro', 'dzisiaj', 'availab', 'free', 'when', 'tomorrow', 'today', 'date')) {
    const now = FLEET.filter((x) => x.availableInDays === 0)
    return car
      ? car.availableInDays === 0
        ? say(
            `The ${car.model} is available now. The hall confirms the date once your enquiry is in.`,
            `${car.model} jest wolny od ręki. Termin potwierdza obsługa hali po wysłaniu zapytania.`,
          )
        : say(
            `The ${car.model} is next free in ${car.availableInDays} days. Available right now: ${now.map((x) => x.model).join(', ')}.`,
            `${car.model} ma najbliższy wolny termin za ${car.availableInDays} dni. Od ręki stoją: ${now.map((x) => x.model).join(', ')}.`,
          )
      : say(
          `Available right now: ${now.map((x) => x.model).join(', ')}. The hall confirms the date once your enquiry is in.`,
          `Od ręki wolne są: ${now.map((x) => x.model).join(', ')}. Termin potwierdza obsługa hali po wysłaniu zapytania.`,
        )
  }

  if (has(q, 'gdzie', 'adres', 'dojazd', 'godzin', 'otwart', 'hala', 'where', 'address', 'hours', 'open', 'hall'))
    return say(
      `${HALL.name}, ${pick(HALL.address, lang)}, open ${pick(HALL.hours, lang)}. Delivery within the city costs ${money(DELIVERY, lang)}; pick-up at the hall is free.`,
      `${HALL.name}, ${pick(HALL.address, lang)}, czynne ${pick(HALL.hours, lang)}. Podstawienie auta na terenie miasta kosztuje ${money(DELIVERY, lang)}, odbiór w hali jest bezpłatny.`,
    )

  if (has(q, 'odbior', 'wydani', 'zwrot', 'protokol', 'ogledzin', 'jak wyglada', 'handover', 'pick-up', 'pickup', 'return', 'protocol', 'inspection'))
    return say(
      `We hand the car over in the hall, not in a car park: a walk-around together, five photos (front, side, rear, door, cabin) and a protocol we both sign. The return works the same way.`,
      `Auto wydajemy w hali, nie na parkingu: robimy wspólny obchód, pięć zdjęć (przód, bok, tył, drzwi, wnętrze) i protokół, który podpisujemy oboje. Zwrot wygląda tak samo.`,
    )

  if (has(q, 'rezerw', 'zamow', 'wynaj', 'zapyta', 'formularz', 'book', 'reserv', 'rent', 'enquir', 'inquir', 'form'))
    return say(
      `A booking starts with the date enquiry in the "Booking" section: car, dates and contact details. The hall confirms the date.`,
      `Rezerwację zaczyna zapytanie o termin z sekcji „Rezerwacja”: auto, daty i kontakt. Termin potwierdza obsługa hali.`,
    )

  if (has(q, 'jakie auta', 'flota', 'oferta', 'wybor aut', 'polec', 'lista aut', 'co macie', 'fleet', 'offer', 'which car', 'recommend', 'what do you have'))
    return say(
      `We have ${FLEET.length} cars, from the ${cheap.model} at ${money(cheap.day, lang)} a day up to the Porsche 911 GT3 RS. Four of them — ${FILMED.map((x) => x.short).join(', ')} — can be watched on the film from the hall at the top of the page.`,
      `W ofercie mamy ${FLEET.length} aut, od ${cheap.model} za ${money(cheap.day, lang)} za dobę po Porsche 911 GT3 RS. Cztery z nich — ${FILMED.map((x) => x.short).join(', ')} — można obejrzeć na filmie z hali na górze strony.`,
    )

  if (car)
    return say(
      `${car.model}: ${car.power} hp, ${pick(car.drive, lang)}, ${pick(car.gearbox, lang)}. ${money(car.day, lang)} a day, deposit ${money(car.deposit, lang)}, limit ${car.kmPerDay} km a day.`,
      `${car.model}: ${car.power} KM, ${pick(car.drive, lang)}, ${pick(car.gearbox, lang)}. ${money(car.day, lang)} za dobę, kaucja ${money(car.deposit, lang)}, limit ${car.kmPerDay} km na dobę.`,
    )

  return say(
    `I only deal with the cars and the offer of ${HALL.name}: prices, deposits, kilometre limits, insurance, dates and how the handover works. What can I help you with about a rental?`,
    `Zajmuję się tylko autami i ofertą ${HALL.name}: ceny, kaucje, limity kilometrów, ubezpieczenie, terminy i przebieg wydania auta. W czym mogę pomóc przy wynajmie?`,
  )
}
