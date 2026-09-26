// Language-aware formatting, kept free of React so the server (server/knowledge.ts,
// server/offline.ts) can import the same helpers the page uses.

export type Lang = 'en' | 'pl'
export type Loc = { en: string; pl: string }

export const pick = (value: Loc, lang: Lang) => value[lang]

// Money and dates follow the page language; the currency stays Polish złoty either way.
export const money = (n: number, lang: Lang) => {
  const digits = new Intl.NumberFormat(lang === 'pl' ? 'pl-PL' : 'en-GB', { maximumFractionDigits: 0 })
    .format(n)
    .replace(/[ ,]/g, ' ')
  return lang === 'pl' ? `${digits} zł` : `${digits} PLN`
}

export const decimal = (n: number, lang: Lang) => n.toFixed(2).replace('.', lang === 'pl' ? ',' : '.')

export const dayCount = (n: number, lang: Lang) => {
  if (lang === 'en') return n === 1 ? '1 day' : `${n} days`
  if (n === 1) return '1 doba'
  const last = n % 10
  const teen = n % 100 >= 12 && n % 100 <= 14
  return last >= 2 && last <= 4 && !teen ? `${n} doby` : `${n} dób`
}
