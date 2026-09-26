import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Lang, Loc } from './format'

export { dayCount, decimal, money, pick } from './format'
export type { Lang, Loc } from './format'

// The page is printed in two languages. English is the default; Polish is the local edition.
// Every string a visitor can read lives here, next to its counterpart, so a wording change
// is one edit in one place. Data-side strings (body types, colours, inspection notes) carry
// their own `Loc` pairs in data.ts and are read with `loc()`.

export const LANGS: { id: Lang; label: string; full: Loc }[] = [
  { id: 'en', label: 'EN', full: { en: 'English', pl: 'angielski' } },
  { id: 'pl', label: 'PL', full: { en: 'Polish', pl: 'polski' } },
]

const STORE_KEY = 'hala4:lang'

const DICT = {
  // Masthead
  'mast.brandAria': { en: 'Hala 4, back to top', pl: 'Hala 4, na górę strony' },
  'mast.trade': { en: 'car rental', pl: 'wypożyczalnia samochodów' },
  'mast.doc': { en: 'Vehicle handover protocol', pl: 'Protokół zdawczo-odbiorczy' },
  'mast.no': { en: 'No.', pl: 'Nr' },
  'mast.sections': { en: 'Page sections', pl: 'Sekcje strony' },
  'mast.desk': { en: 'Front desk', pl: 'Obsługa' },
  'mast.deskLong': { en: 'Ask the front desk', pl: 'Zapytaj obsługi' },
  'mast.menu': { en: 'Menu', pl: 'Menu' },
  'mast.close': { en: 'Close', pl: 'Zamknij' },
  'mast.book': { en: 'Book', pl: 'Rezerwuj' },
  'mast.lang': { en: 'Language', pl: 'Język' },
  'mast.langAria': { en: 'Page language', pl: 'Język strony' },

  // Navigation
  'nav.fleet': { en: 'Fleet', pl: 'Flota' },
  'nav.prices': { en: 'Prices', pl: 'Cennik' },
  'nav.terms': { en: 'Terms', pl: 'Warunki' },
  'nav.handover': { en: 'Handover & return', pl: 'Odbiór i zwrot' },

  // Hero
  'hero.title': { en: 'Before you drive off, we walk around the car together.', pl: 'Zanim ruszysz, obejdziemy auto razem.' },
  'hero.lead': {
    en: 'Hala 4 rents sports and premium cars by the day, the weekend or the week. Every car is handed over in a lit hall: a walk-around, photos from five sides and a protocol we both sign.',
    pl: 'Hala 4 wynajmuje auta sportowe i premium na dobę, weekend albo tydzień. Każde wydajemy w jasnej hali: obchód, zdjęcia z pięciu stron i protokół, który podpisujemy oboje.',
  },
  'hero.leadShort': {
    en: 'Sports and premium car rental. Handed over in the hall, with a protocol and photos.',
    pl: 'Wynajem aut sportowych i premium. Wydanie w hali, z protokołem i zdjęciami.',
  },
  'hero.posterAlt': { en: '{model}, {color}, in a bright hall with linear lighting', pl: '{model}, kolor {color}, w jasnej hali z liniowym oświetleniem' },
  'hero.stillAlt': { en: 'Walk-around photo: {label}, {model}', pl: 'Zdjęcie z obchodu: {label}, {model}' },
  'hero.photoOf': { en: 'Photo {n}/5 ·', pl: 'Fot. {n}/5 ·' },
  'hero.scrollHint': { en: 'Scroll to walk around the car', pl: 'Przewiń, żeby obejść auto' },
  'hero.pick': { en: 'Car in the hall', pl: 'Auto w hali' },

  // Vehicle box
  'veh.label': { en: 'Vehicle and walk-around route', pl: 'Pojazd i trasa obchodu' },
  'veh.diagramAria': { en: 'Top view of the car. Camera: {label}.', pl: 'Schemat auta z góry. Aparat: {label}.' },
  'veh.vehicle': { en: 'Vehicle', pl: 'Pojazd' },
  'veh.colorPower': { en: 'Colour · power', pl: 'Kolor · moc' },
  'veh.notes': { en: 'Notes', pl: 'Uwagi' },
  'veh.hp': { en: 'hp', pl: 'KM' },

  // Inspection strip
  'shots.label': { en: 'Inspection · 5 photos', pl: 'Oględziny · 5 zdjęć' },
  'shots.aria': { en: '{label}{taken}. Show.', pl: '{label}{taken}. Pokaż.' },
  'shots.taken': { en: ', photo taken', pl: ', zdjęcie zrobione' },

  // Hero foot
  'foot.deposit': { en: 'Deposit', pl: 'Kaucja' },
  'foot.limit': { en: 'Limit', pl: 'Limit' },
  'foot.insurance': { en: 'Insurance', pl: 'OC · AC · NNW' },
  'foot.included': { en: 'included', pl: 'w cenie' },
  'foot.from': { en: '{model} from', pl: '{model} od' },
  'foot.perDay': { en: 'per day', pl: 'za dobę' },
  'foot.pickDates': { en: 'Pick dates', pl: 'Wybierz termin' },
  'foot.wholeFleet': { en: 'Whole fleet', pl: 'Cała flota' },
  'foot.signedBy': { en: 'Handover signature', pl: 'Podpis wydającego' },
  'foot.stamp': { en: 'HANDED OVER', pl: 'WYDANO' },

  // Fleet
  'fleet.title': { en: 'Fleet', pl: 'Flota' },
  'fleet.lead': {
    en: 'Seven cars to drive for the pleasure of it. Four can be walked around in the film at the top. Pick a row to see the car card.',
    pl: 'Siedem aut do jazdy dla przyjemności. Cztery obchodzimy z filmu na górze strony. Wybierz wiersz, żeby zobaczyć kartę auta.',
  },
  'fleet.card': { en: 'Vehicle card', pl: 'Karta pojazdu' },
  'fleet.photoAlt': { en: '{model}, walk-around photo', pl: '{model}, zdjęcie z obchodu' },
  'fleet.noPhoto': { en: 'Photos of this car go into the protocol at handover.', pl: 'Zdjęcia tego auta dołączymy do protokołu przy odbiorze.' },
  'fleet.body': { en: 'Body', pl: 'Nadwozie' },
  'fleet.drive': { en: 'Drive', pl: 'Napęd' },
  'fleet.gearbox': { en: 'Gearbox', pl: 'Skrzynia' },
  'fleet.power': { en: 'Power', pl: 'Moc' },
  'fleet.seats': { en: 'Seats', pl: 'Miejsca' },
  'fleet.limit': { en: 'Limit', pl: 'Limit' },
  'fleet.kmPerDay': { en: '{km} km / day', pl: '{km} km / doba' },
  'fleet.bookThis': { en: 'Book this car', pl: 'Rezerwuj to auto' },
  'fleet.watchWalk': { en: 'Watch the walk-around', pl: 'Obejrzyj obchód' },
  'fleet.register': { en: 'Vehicle register', pl: 'Rejestr pojazdów' },
  'fleet.caption': { en: 'Hala 4 fleet with day rate and availability', pl: 'Flota Hali 4 z ceną za dobę i dostępnością' },
  'fleet.no': { en: 'No.', pl: 'Lp.' },
  'fleet.model': { en: 'Model', pl: 'Model' },
  'fleet.day': { en: 'Day', pl: 'Doba' },
  'fleet.availability': { en: 'Availability', pl: 'Dostępność' },
  'fleet.availableNow': { en: 'available now', pl: 'dostępny od ręki' },
  'fleet.availableFrom': { en: 'free from {date}', pl: 'wolny od {date}' },
  'fleet.footnote': { en: 'Fleet, prices and dates are examples. Power as published by the manufacturers.', pl: 'Flota, ceny i terminy są przykładowe. Moc według danych producentów.' },

  // Carbon copy: prices
  'copy.forRenter': { en: 'Renter’s copy', pl: 'Kopia dla najemcy' },
  'copy.form': { en: 'Form H4/P-01 · copy 2', pl: 'Druk H4/P-01 · egz. 2' },
  'price.title': { en: 'Prices', pl: 'Cennik' },
  'price.car': { en: 'Car', pl: 'Auto' },
  'price.boxLabel': { en: 'The day rate falls the longer you keep the car', pl: 'Cena za dobę maleje z długością najmu' },
  'price.caption': { en: 'Price list for the {model}', pl: 'Cennik dla auta {model}' },
  'price.period': { en: 'Period', pl: 'Okres' },
  'price.compare': { en: 'Day rate comparison', pl: 'Porównanie ceny za dobę' },
  'price.perDay': { en: 'Per day', pl: 'Za dobę' },
  'price.total': { en: 'Total', pl: 'Razem' },
  'price.fromTotal': { en: 'from {amount}', pl: 'od {amount}' },
  'price.settlement': { en: 'Settlement', pl: 'Rozliczenie' },
  'price.depositNote': { en: '{amount} held on the card, released after the car comes back', pl: '{amount} blokady na karcie, zwalniamy ją po zwrocie auta' },
  'price.limitNote': { en: '{km} km a day, every extra kilometre {rate}', pl: '{km} km na dobę, każdy kolejny {rate}' },
  'price.insurance': { en: 'Insurance', pl: 'Ubezpieczenie' },
  'price.insuranceNote': { en: 'Third-party, comprehensive and accident cover included, {amount} excess', pl: 'OC, AC i NNW w cenie, udział własny {amount}' },
  'price.delivery': { en: 'Delivery', pl: 'Dowóz' },
  'price.deliveryNote': { en: '{amount} one way across Warsaw, or free pick-up at the hall', pl: 'Po Warszawie {amount} w jedną stronę albo odbiór w hali za darmo' },
  'price.footnote': { en: 'All amounts are examples, waiting for a real price list.', pl: 'Wszystkie kwoty są przykładowe i czekają na prawdziwy cennik.' },

  // Carbon copy: terms
  'terms.title': { en: 'Terms', pl: 'Warunki' },
  'terms.lead': { en: 'Four things we check at handover. Tick what applies to you.', pl: 'Cztery rzeczy, które sprawdzimy przy odbiorze. Zaznacz, co się zgadza.' },
  'terms.renter': { en: 'Renter', pl: 'Najemca' },
  'terms.req.age': { en: 'You are at least 25', pl: 'Masz co najmniej 25 lat' },
  'terms.req.licence': { en: 'You have held a category B licence for 3 years', pl: 'Prawo jazdy kat. B masz od minimum 3 lat' },
  'terms.req.id': { en: 'You have an ID card or passport', pl: 'Masz dowód osobisty albo paszport' },
  'terms.req.card': { en: 'You have a credit card for the deposit hold', pl: 'Masz kartę kredytową na blokadę kaucji' },
  'terms.allGood': { en: 'All of it checks out.', pl: 'Wszystko się zgadza.' },
  'terms.fillBooking': { en: 'Fill in the booking', pl: 'Wypełnij rezerwację' },
  'terms.ticked': { en: 'Ticked: {n} of {total}', pl: 'Zaznaczone: {n} z {total}' },
  'terms.rule.fuel': { en: 'Fuel', pl: 'Paliwo' },
  'terms.rule.fuelV': { en: 'You take it with a full tank and bring it back full.', pl: 'Odbierasz z pełnym bakiem i z pełnym oddajesz.' },
  'terms.rule.abroad': { en: 'Driving abroad', pl: 'Wyjazd za granicę' },
  'terms.rule.abroadV': { en: 'Within the European Union, told to us in advance.', pl: 'W Unii Europejskiej, po wcześniejszym zgłoszeniu.' },
  'terms.rule.track': { en: 'Track and events', pl: 'Tor i imprezy' },
  'terms.rule.trackV': { en: 'Track driving is excluded from the insurance.', pl: 'Jazda po torze jest wykluczona z ubezpieczenia.' },
  'terms.rule.pets': { en: 'Pets', pl: 'Zwierzęta' },
  'terms.rule.petsV': { en: 'In a carrier only. We do not smoke in the cars.', pl: 'Tylko w transporterze. Nie palimy w autach.' },

  // Handover and return
  'flow.title': { en: 'Handover & return', pl: 'Odbiór i zwrot' },
  'flow.lead': {
    en: 'One protocol, two signatures. At the return we compare the car with the handover photos, so there is no argument about where a scratch came from.',
    pl: 'Jeden protokół, dwa podpisy. Przy zwrocie porównujemy auto ze zdjęciami z wydania, więc nie ma sporu o to, skąd się wzięła rysa.',
  },
  'flow.out': { en: 'Handover', pl: 'Wydanie' },
  'flow.back': { en: 'Return', pl: 'Zwrot' },
  'flow.out1.h': { en: 'Booking', pl: 'Rezerwacja' },
  'flow.out1.p': { en: 'You pick a car and dates in the form below. We call back to confirm the pick-up time.', pl: 'Wybierasz auto i termin w formularzu poniżej. Oddzwaniamy, żeby potwierdzić godzinę odbioru.' },
  'flow.out2.h': { en: 'Walk-around', pl: 'Obchód' },
  'flow.out2.p': { en: 'We walk around the car together in the hall. Five photos, the odometer and the fuel level go into the protocol.', pl: 'W hali obchodzimy auto razem. Pięć zdjęć, stan licznika i paliwa trafiają do protokołu.' },
  'flow.out3.h': { en: 'Signature', pl: 'Podpis' },
  'flow.out3.p': { en: 'We both sign the protocol. You get the key and the pink copy with the prices and terms.', pl: 'Podpisujemy protokół oboje. Dostajesz kluczyk i różową kopię z cennikiem i warunkami.' },
  'flow.back1.h': { en: 'Back to the hall', pl: 'Powrót do hali' },
  'flow.back1.p': { en: 'You come back with a full tank, within the booked hours or by arrangement.', pl: 'Wracasz z pełnym bakiem, w godzinach z rezerwacji albo po uzgodnieniu.' },
  'flow.back2.h': { en: 'The same walk-around', pl: 'Ten sam obchód' },
  'flow.back2.p': { en: 'We take the same five shots and compare them with the handover photos.', pl: 'Robimy te same pięć ujęć i porównujemy je ze zdjęciami z wydania.' },
  'flow.back3.h': { en: 'Second signature', pl: 'Drugi podpis' },
  'flow.back3.p': { en: 'We sign the same protocol a second time. The deposit hold drops off your card.', pl: 'Podpisujemy ten sam protokół drugi raz. Blokada kaucji znika z karty.' },

  // Booking
  'book.title': { en: 'Booking', pl: 'Rezerwacja' },
  'book.lead': { en: 'Fill it in like a protocol. We call back to confirm the date and the pick-up time at the hall. Not sure which car?', pl: 'Wypełnij jak protokół. Oddzwonimy, żeby potwierdzić termin i godzinę odbioru w hali. Nie wiesz, które auto?' },
  'book.askDesk': { en: 'Ask the front desk', pl: 'Zapytaj obsługi' },
  'book.car': { en: 'Car', pl: 'Auto' },
  'book.perDayOption': { en: '{model} · {amount} / day', pl: '{model} · {amount} / doba' },
  'book.pickUp': { en: 'Pick-up', pl: 'Odbiór' },
  'book.return': { en: 'Return', pl: 'Zwrot' },
  'book.dmy': { en: 'day · month · year', pl: 'dzień · miesiąc · rok' },
  'book.pickUpAria': { en: 'Pick-up date, day month year', pl: 'Data odbioru, dzień miesiąc rok' },
  'book.returnAria': { en: 'Return date, day month year', pl: 'Data zwrotu, dzień miesiąc rok' },
  'book.name': { en: 'Full name', pl: 'Imię i nazwisko' },
  'book.phone': { en: 'Phone', pl: 'Telefon' },
  'book.phoneAria': { en: 'Phone number, 9 digits', pl: 'Numer telefonu, 9 cyfr' },
  'book.email': { en: 'E-mail', pl: 'E-mail' },
  'book.optional': { en: 'optional', pl: 'nieobowiązkowo' },
  'book.notes': { en: 'Notes', pl: 'Uwagi' },
  'book.notesHint': { en: 'e.g. delivery, child seat, hour', pl: 'np. dowóz, fotelik, godzina' },
  'book.settlement': { en: 'Settlement', pl: 'Rozliczenie' },
  'book.period': { en: 'Period', pl: 'Okres' },
  'book.days': { en: '{n} days', pl: '{n} dób' },
  'book.day1': { en: '1 day', pl: '1 doba' },
  'book.days2': { en: '{n} days', pl: '{n} doby' },
  'book.kmLimit': { en: 'Km limit', pl: 'Limit km' },
  'book.deposit': { en: 'Deposit', pl: 'Kaucja' },
  'book.rental': { en: 'Rental', pl: 'Najem' },
  'book.signedBy': { en: 'Renter’s signature', pl: 'Podpis najemcy' },
  'book.stamp': { en: 'RECEIVED', pl: 'PRZYJĘTO' },
  'book.submit': { en: 'Sign and send the enquiry', pl: 'Podpisz i wyślij zapytanie' },
  'book.done': { en: 'Enquiry {no} received. This is a concept project, so the form sent nothing anywhere.', pl: 'Zapytanie {no} przyjęte. To projekt koncepcyjny, więc formularz niczego nie wysłał.' },
  'book.err.fromFormat': { en: 'Enter the pick-up date as day, month and year, e.g. 03.10.2026.', pl: 'Wpisz datę odbioru jako dzień, miesiąc i rok, np. 03.10.2026.' },
  'book.err.fromPast': { en: 'The earliest pick-up is today.', pl: 'Odbiór najwcześniej dziś.' },
  'book.err.toFormat': { en: 'Enter the return date as day, month and year.', pl: 'Wpisz datę zwrotu jako dzień, miesiąc i rok.' },
  'book.err.toOrder': { en: 'The return has to be at least a day after the pick-up.', pl: 'Zwrot musi być co najmniej dzień po odbiorze.' },
  'book.err.name': { en: 'Enter your first and last name, as on your driving licence.', pl: 'Wpisz imię i nazwisko, tak jak w prawie jazdy.' },
  'book.err.phone': { en: 'That number is too short. We call it back to confirm the date.', pl: 'Numer ma za mało cyfr. Oddzwonimy na niego, żeby potwierdzić termin.' },
  'book.err.email': { en: 'That e-mail address looks incomplete. You can also leave it out.', pl: 'Adres e-mail wygląda na niepełny. Możesz go też usunąć.' },

  // Front desk (assistant)
  'desk.title': { en: 'Front desk window', pl: 'Okienko obsługi' },
  'desk.close': { en: 'Close', pl: 'Zamknij' },
  'desk.intro': { en: 'An AI assistant answers — about the cars and the offer at {hall} only. The date and the price are confirmed by the hall.', pl: 'Odpowiada asystent AI — tylko o autach i ofercie {hall}. Termin i cenę potwierdza obsługa hali.' },
  'desk.q': { en: 'Q.', pl: 'Pyt.' },
  'desk.a': { en: 'A.', pl: 'Odp.' },
  'desk.yourQuestion': { en: 'Your question', pl: 'Twoje pytanie' },
  'desk.placeholder': { en: 'e.g. what should two of us take to the mountains?', pl: 'np. czym dojadę we dwoje w góry?' },
  'desk.inputAria': { en: 'Question to the Hala 4 front desk', pl: 'Pytanie do obsługi Hali 4' },
  'desk.wait': { en: 'Wait', pl: 'Czekaj' },
  'desk.send': { en: 'Send', pl: 'Wyślij' },
  'desk.error': { en: 'The front desk window is not answering. Try again, or send the enquiry with the form.', pl: 'Okienko obsługi nie odpowiada. Spróbuj jeszcze raz albo wyślij zapytanie formularzem.' },
  'desk.offline': { en: 'The AI assistant is not connected right now — I answer from the price list, briefly and without exceptions.', pl: 'Asystent AI nie jest w tej chwili podłączony — odpowiadam z cennika, krótko i bez wyjątków.' },
  'desk.seed1': { en: 'What does a {car} cost for a weekend?', pl: 'Ile kosztuje {car} na weekend?' },
  'desk.seed2': { en: 'What is the deposit and the km limit?', pl: 'Jaka jest kaucja i limit kilometrów?' },
  'desk.seed3': { en: 'What does the handover at the hall look like?', pl: 'Jak wygląda odbiór auta w hali?' },

  // Tear-off stub
  'stub.address': { en: 'Address', pl: 'Adres' },
  'stub.hours': { en: 'Hours', pl: 'Godziny' },
  'stub.form': { en: 'Form', pl: 'Druk' },
  'stub.formValue': { en: 'H4/P-01, three copies', pl: 'H4/P-01, trzy egzemplarze' },
  'stub.note': {
    en: 'Hala 4 is a concept project. The name, address, fleet and prices are examples, and the model names belong to their manufacturers. The walk-around films are four source clips shot in a hall; the frames are cut from them untouched.',
    pl: 'Hala 4 to projekt koncepcyjny. Nazwa, adres, flota i ceny są przykładowe, a nazwy modeli należą do ich producentów. Filmy z obchodu to cztery materiały źródłowe nakręcone w hali; klatki wycięto z nich bez retuszu.',
  },

  // Drawn marks
  'marks.stampAria': { en: 'Stamp: {word}, {date}', pl: 'Pieczątka: {word}, {date}' },
  'marks.front': { en: 'FRONT', pl: 'PRZÓD' },
  'marks.rear': { en: 'REAR', pl: 'TYŁ' },

  // Document head and skip link
  'doc.title': { en: 'Hala 4 — car rental', pl: 'Hala 4 — wypożyczalnia samochodów' },
  'doc.description': {
    en: 'Hala 4 rents sports and premium cars by the day, the weekend or the week. Every car is handed over in a lit hall, with a walk-around, photos and a protocol.',
    pl: 'Hala 4 wynajmuje auta sportowe i premium na dobę, weekend albo tydzień. Każde auto wydajemy w oświetlonej hali, z obchodem, zdjęciami i protokołem.',
  },
  'skip.booking': { en: 'Skip to booking', pl: 'Przejdź do rezerwacji' },
} satisfies Record<string, Loc>

export type Key = keyof typeof DICT

type Vars = Record<string, string | number>
const fill = (s: string, vars?: Vars) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => String(vars[k] ?? m)) : s)

const readStored = (): Lang => {
  try {
    const v = localStorage.getItem(STORE_KEY)
    if (v === 'pl' || v === 'en') return v
  } catch {
    /* private mode, blocked storage: English it is */
  }
  return 'en'
}

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readStored)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = DICT['doc.title'][lang]
    document.querySelector('meta[name="description"]')?.setAttribute('content', DICT['doc.description'][lang])
    try {
      localStorage.setItem(STORE_KEY, lang)
    } catch {
      /* nothing to remember it with; the choice still holds for this visit */
    }
  }, [lang])

  const value = useMemo(() => ({ lang, setLang }), [lang])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  const { lang, setLang } = useContext(Ctx)
  return useMemo(
    () => ({
      lang,
      setLang,
      t: (key: Key, vars?: Vars) => fill(DICT[key][lang], vars),
      loc: (value: Loc) => value[lang],
    }),
    [lang, setLang],
  )
}
