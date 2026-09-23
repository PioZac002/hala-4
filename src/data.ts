// PLACEHOLDER DATA — Hala 4 is a design concept.
// Fleet, prices, deposits, km limits and the address are examples to replace with real values.
// Engine outputs are the commonly published figures for each model; verify against the actual cars.
//
// The four cars with a `film` are the ones we have real footage of; every fact about them
// (body, colour, what each inspection note mentions) is read off that footage.

// One inspection point of the walk-around: where the camera stops, what the film shows there,
// and what the person filling in the protocol writes down.
//
// `still` swaps the frame the film stopped on for a real photograph of that angle. The video
// frames carry the camera's motion blur; a sharp photo dropped in here is what the visitor sees
// at every stop, in the protocol strip and on the car card. Put the file in
// `public/frames/<film.dir>/stills/` at 1600×900 (16:9, same framing as the film) and point at
// it with an absolute path, e.g. still: '/frames/rs3/stills/front.webp'.
export type Checkpoint = { id: string; label: string; t: number; note: string; still?: string }

// Camera position around the car for the top-view diagram.
// a: degrees from the car's nose, turning towards its left side. r: distance in diagram units.
export type OrbitKey = { t: number; a: number; r: number }

export type Film = {
  dir: string // /frames/<dir>, holding d/ (desktop) and m/ (mobile) sequences and poster.webp
  duration: number // seconds of footage
  checkpoints: Checkpoint[] // exactly five, in walk order
  orbit: OrbitKey[]
  focus: [number, number][] // video time → horizontal crop centre (0..1) for narrow screens
  source: string // the file the frames were cut from
}

export type Car = {
  id: string
  model: string
  short: string // what the hero's picker and the chat call it
  body: string
  color: string
  drive: string
  gearbox: string
  power: number
  day: number // price per day, PLN
  deposit: number // PLN, refundable card hold
  kmPerDay: number
  seats: number
  availableInDays: number // 0 = free today
  film?: Film
}

const golfFilm: Film = {
  dir: 'golf-r',
  duration: 10,
  source: 'golf8R.mp4',
  checkpoints: [
    { id: 'front', label: 'Przód', t: 0, note: 'reflektory i zderzak bez uwag' },
    { id: 'side', label: 'Lewy bok', t: 1.9, note: 'felgi czarne, bez rys' },
    { id: 'rear', label: 'Tył', t: 3.4, note: '4 końcówki wydechu, bez uwag' },
    { id: 'door', label: 'Drzwi', t: 6.2, note: 'próg i uszczelki bez uwag' },
    { id: 'cabin', label: 'Wnętrze', t: 9.3, note: 'kokpit cyfrowy, czysto' },
  ],
  orbit: [
    { t: 0, a: 32, r: 104 },
    { t: 1.9, a: 90, r: 96 },
    { t: 3.4, a: 180, r: 106 },
    { t: 4.7, a: 140, r: 98 },
    { t: 6.2, a: 104, r: 62 },
    { t: 7.4, a: 96, r: 40 },
    { t: 9.3, a: 48, r: 19 },
    { t: 10, a: 48, r: 19 },
  ],
  focus: [
    [0, 0.4],
    [1.9, 0.6],
    [3.4, 0.54],
    [6.2, 0.5],
    [9.3, 0.5],
  ],
}

const rs3Film: Film = {
  dir: 'rs3',
  duration: 10,
  source: 'Camera_panning_around_Audi_RS3_20260922231802.mp4',
  checkpoints: [
    { id: 'front', label: 'Przód', t: 0.3, note: 'reflektory Matrix, splitter bez otarć' },
    { id: 'side', label: 'Bok', t: 1.7, note: 'felgi 19", opony bez uszkodzeń' },
    { id: 'rear', label: 'Tył', t: 4.2, note: 'dyfuzor i dwie owalne końcówki' },
    { id: 'door', label: 'Drzwi', t: 6.3, note: 'próg i uszczelki bez uwag' },
    { id: 'cabin', label: 'Wnętrze', t: 8.6, note: 'kubełki, kokpit cyfrowy' },
  ],
  orbit: [
    { t: 0, a: 30, r: 104 },
    { t: 1.7, a: 92, r: 96 },
    { t: 4.2, a: 180, r: 106 },
    { t: 5.2, a: 146, r: 100 },
    { t: 6.3, a: 106, r: 64 },
    { t: 7.4, a: 98, r: 42 },
    { t: 8.6, a: 48, r: 19 },
    { t: 10, a: 48, r: 19 },
  ],
  focus: [
    [0, 0.56],
    [1.7, 0.5],
    [4.2, 0.48],
    [6.3, 0.52],
    [8.6, 0.5],
  ],
}

const gt3rsFilm: Film = {
  dir: 'gt3rs',
  duration: 10,
  source: 'Camera_filming_Porsche_in_garage_20260922231811.mp4',
  checkpoints: [
    { id: 'front', label: 'Przód', t: 0.2, note: 'splitter i maska bez otarć' },
    { id: 'side', label: 'Bok', t: 2.4, note: 'felgi kute, zaciski żółte' },
    { id: 'rear', label: 'Tył', t: 4.2, note: 'skrzydło na łabędzich wspornikach' },
    { id: 'door', label: 'Drzwi', t: 5.4, note: 'fotele kubełkowe, próg czysty' },
    { id: 'cabin', label: 'Wnętrze', t: 8.2, note: 'obrotomierz pośrodku, alcantara' },
  ],
  orbit: [
    { t: 0, a: 26, r: 104 },
    { t: 2.4, a: 88, r: 94 },
    { t: 4.2, a: 178, r: 104 },
    { t: 4.9, a: 150, r: 96 },
    { t: 5.4, a: 112, r: 66 },
    { t: 6.6, a: 98, r: 42 },
    { t: 8.2, a: 48, r: 19 },
    { t: 10, a: 48, r: 19 },
  ],
  focus: [
    [0, 0.5],
    [2.4, 0.5],
    [4.2, 0.46],
    [5.4, 0.54],
    [8.2, 0.5],
  ],
}

const octaviaFilm: Film = {
  dir: 'octavia-rs',
  duration: 10,
  source: 'Skoda_Octavia_RS_camera_tour_20260922231834.mp4',
  checkpoints: [
    { id: 'front', label: 'Przód', t: 0.4, note: 'grill i reflektory bez uwag' },
    { id: 'side', label: 'Bok', t: 1.7, note: 'felgi 19" czarne, zaciski czerwone' },
    { id: 'rear', label: 'Tył', t: 5.0, note: 'klapa i zderzak bez uwag' },
    { id: 'door', label: 'Drzwi', t: 7.8, note: 'próg i uszczelki bez uwag' },
    { id: 'cabin', label: 'Wnętrze', t: 9.4, note: 'kokpit cyfrowy, czysto' },
  ],
  orbit: [
    { t: 0, a: 34, r: 104 },
    { t: 1.7, a: 90, r: 96 },
    { t: 5.0, a: 182, r: 106 },
    { t: 6.4, a: 144, r: 98 },
    { t: 7.8, a: 106, r: 62 },
    { t: 8.6, a: 96, r: 40 },
    { t: 9.4, a: 48, r: 19 },
    { t: 10, a: 48, r: 19 },
  ],
  focus: [
    [0, 0.54],
    [1.7, 0.5],
    [5.0, 0.5],
    [7.8, 0.46],
    [9.4, 0.5],
  ],
}

export const FLEET: Car[] = [
  { id: 'golf-r', model: 'VW Golf R', short: 'Golf R', body: 'hatchback 5d', color: 'czerwony', drive: '4×4 4MOTION', gearbox: 'automat DSG', power: 320, day: 690, deposit: 5000, kmPerDay: 300, seats: 5, availableInDays: 0, film: golfFilm },
  { id: 'rs3', model: 'Audi RS 3 Sportback', short: 'RS 3', body: 'hatchback 5d', color: 'zielony Kyalami', drive: '4×4 quattro', gearbox: 'automat S tronic', power: 400, day: 990, deposit: 8000, kmPerDay: 250, seats: 5, availableInDays: 3, film: rs3Film },
  { id: 'gt3rs', model: 'Porsche 911 GT3 RS', short: '911 GT3 RS', body: 'coupé 2d', color: 'szary', drive: 'tył', gearbox: 'automat PDK', power: 525, day: 2900, deposit: 30000, kmPerDay: 150, seats: 2, availableInDays: 9, film: gt3rsFilm },
  { id: 'octavia-rs', model: 'Škoda Octavia RS', short: 'Octavia RS', body: 'liftback 5d', color: 'czerwony', drive: 'przód', gearbox: 'automat DSG', power: 265, day: 450, deposit: 3000, kmPerDay: 400, seats: 5, availableInDays: 0, film: octaviaFilm },
  { id: 'vz5', model: 'Cupra Formentor VZ5', short: 'Formentor VZ5', body: 'crossover', color: 'szary Magnetic', drive: '4×4', gearbox: 'automat DSG', power: 390, day: 890, deposit: 7000, kmPerDay: 250, seats: 5, availableInDays: 0 },
  { id: 'm240i', model: 'BMW M240i xDrive Coupé', short: 'M240i', body: 'coupé 2d', color: 'czarny', drive: '4×4 xDrive', gearbox: 'automat', power: 374, day: 890, deposit: 7000, kmPerDay: 250, seats: 4, availableInDays: 6 },
  { id: 'gr-yaris', model: 'Toyota GR Yaris', short: 'GR Yaris', body: 'hatchback 3d', color: 'biały', drive: '4×4 GR-Four', gearbox: 'manual 6', power: 261, day: 590, deposit: 5000, kmPerDay: 300, seats: 4, availableInDays: 1 },
]

// Cars we can actually walk around on the page, in the order the hero offers them.
export const FILMED = FLEET.filter((c) => c.film) as (Car & { film: Film })[]
export const carById = (id: string) => FLEET.find((c) => c.id === id) ?? FLEET[0]
export const filmedById = (id: string) => FILMED.find((c) => c.id === id) ?? FILMED[0]

// Rental lengths. `perDay` multiplies the car's day price; weekend is a flat multiple of it.
export type Tier = { id: string; label: string; detail: string; days: number; perDay: number }
export const TIERS: Tier[] = [
  { id: 'd1', label: '1 doba', detail: '24 godziny', days: 1, perDay: 1 },
  { id: 'd3', label: '2–3 doby', detail: 'cena za każdą dobę', days: 3, perDay: 0.9 },
  { id: 'wknd', label: 'Weekend', detail: 'pt 16:00 – pn 10:00', days: 2.5, perDay: 0.88 },
  { id: 'd7', label: '7 dni', detail: 'tydzień', days: 7, perDay: 0.75 },
  { id: 'd30', label: '30 dni', detail: 'miesiąc', days: 30, perDay: 0.55 },
]

export const EXTRA_KM = 1.5 // PLN per km over the limit
export const OWN_SHARE = 3000 // PLN, AC own share
export const DELIVERY = 150 // PLN, delivery within the city

export const roundTo10 = (n: number) => Math.round(n / 10) * 10
export const tierTotal = (car: Car, t: Tier) => roundTo10(car.day * t.perDay * t.days)
export const tierPerDay = (car: Car, t: Tier) => roundTo10(tierTotal(car, t) / t.days)

// Rental price for an arbitrary number of days, using the best matching tier.
export function priceFor(car: Car, days: number) {
  if (days <= 0) return 0
  const factor = days >= 30 ? 0.55 : days >= 7 ? 0.75 : days >= 2 ? 0.9 : 1
  return roundTo10(car.day * factor * days)
}

export const zl = (n: number) =>
  new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(n).replace(/ /g, ' ') + ' zł'

export const dateFromToday = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}
export const fmtDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`

export const HALL = {
  name: 'Hala 4',
  address: 'ul. Magazynowa 4, Warszawa',
  hours: 'pn–sb 8:00–20:00',
}
