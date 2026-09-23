import { useState } from 'react'

// Printed per-character cells, like the boxes on a paper form ("wypełnić drukowanymi literami").
// A real, invisible input sits on top so typing, paste, autofill and screen readers all work;
// the cells only draw what it holds, in ink, with the next empty cell marked while focused.
export function CharBoxes({
  id,
  value,
  onChange,
  groups,
  sep = '',
  autoComplete,
  describedBy,
  invalid,
  label,
  normalize = (d) => d,
}: {
  id: string
  value: string
  onChange: (digits: string) => void
  groups: number[]
  sep?: string
  autoComplete?: string
  describedBy?: string
  invalid?: boolean
  label: string
  normalize?: (digits: string) => string
}) {
  const max = groups.reduce((a, b) => a + b, 0)
  const [focused, setFocused] = useState(false)
  let k = 0

  return (
    <span className={`cb ${focused ? 'is-focused' : ''}`}>
      <input
        id={id}
        className="cb__input"
        type="text"
        inputMode="numeric"
        autoComplete={autoComplete ?? 'off'}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        value={value}
        onChange={(e) => onChange(normalize(e.target.value.replace(/\D/g, '')).slice(0, max))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <span className="cb__cells" aria-hidden="true">
        {groups.map((g, gi) => (
          <span key={gi} className="cb__group">
            {Array.from({ length: g }, () => {
              const i = k++
              return (
                <span key={i} className={`cb__cell ${focused && i === Math.min(value.length, max - 1) ? 'is-next' : ''}`}>
                  <span className="ink">{value[i] ?? ''}</span>
                </span>
              )
            })}
            {sep && gi < groups.length - 1 && <span className="cb__sep">{sep}</span>}
          </span>
        ))}
      </span>
    </span>
  )
}

// "DDMMRRRR" → Date, or null when the digits are not a real calendar date.
export function digitsToDate(d: string) {
  if (d.length !== 8) return null
  const day = +d.slice(0, 2)
  const month = +d.slice(2, 4)
  const year = +d.slice(4)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

export const dateToDigits = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`
