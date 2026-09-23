import { forwardRef } from 'react'
import { DIAGRAM } from '../hero/timeline'

// Ink and print marks shared across the protocol: ticks, stamp, signature, clip, icons.

export function Tick({ on, className = '' }: { on: boolean; className?: string }) {
  return (
    <svg className={`tick ${on ? 'is-on' : ''} ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 12.5c1.6 1.2 3 2.9 4.2 5.2C11.3 11.6 15 7 20 3.8" pathLength={1} />
    </svg>
  )
}

export function Clip() {
  return (
    <svg className="clip" viewBox="0 0 14 34" aria-hidden="true">
      <path d="M4 30V6.5a3 3 0 0 1 6 0V25a1.6 1.6 0 0 1-3.2 0V9" />
    </svg>
  )
}

export function Stamp({ word, date, on, id }: { word: string; date: string; on: boolean; id: string }) {
  return (
    <svg className={`stamp ${on ? 'is-on' : ''}`} viewBox="0 0 220 112" role="img" aria-label={`Pieczątka: ${word}, ${date}`}>
      <defs>
        <filter id={`${id}-ink`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="2" seed="9" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.75" result="gaps" />
          <feComposite in="d" in2="gaps" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${id}-ink)`}>
        <rect x="4" y="4" width="212" height="104" rx="9" />
        <rect x="11" y="11" width="198" height="90" rx="5" className="stamp__thin" />
        <text x="110" y="62" textAnchor="middle" className="stamp__word">{word}</text>
        <text x="110" y="88" textAnchor="middle" className="stamp__meta">HALA 4 · {date}</text>
      </g>
    </svg>
  )
}

export function Signature({ on }: { on: boolean }) {
  return (
    <svg className={`signature ${on ? 'is-on' : ''}`} viewBox="0 0 260 70" aria-hidden="true">
      <path
        pathLength={1}
        d="M8 50c10-4 18-20 22-33 2-7-4-8-6 0-4 17-5 30 0 34 6 4 13-12 18-20 1 8 1 16 5 17 5 1 9-11 12-16-2 8-2 15 3 15 6 0 11-15 16-24-4 14-3 22 2 22 9-1 18-31 22-40-5 17-9 34-6 38 3 3 10-9 13-15 0 7 3 11 9 8 5-3 9-10 13-12-2 6 1 9 6 7 8-4 15-12 26-13 9-1 21 3 38-1 16-4 30-9 38-12"
      />
      <path pathLength={1} className="signature__dash" d="M60 58c30 3 70 3 118-2" />
    </svg>
  )
}

export function CarOutline() {
  // Top view, nose up — the pictogram every paper handover protocol carries.
  return (
    <g className="car">
      <path className="car__body" d="M93 77c8-7 46-7 54 0 8 6 11 16 11 28v108c0 11-5 17-13 17H95c-8 0-13-6-13-17V105c0-12 3-22 11-28Z" />
      <path className="car__glass" d="M92 116c16-9 40-9 56 0l-4 20c-13-5-35-5-48 0Z" />
      <path className="car__glass" d="M95 196c14 4 36 4 50 0l3 15c-16 5-40 5-56 0Z" />
      <rect className="car__roof" x="96" y="140" width="48" height="52" rx="5" />
      <path className="car__line" d="M88 120v86M152 120v86M82 154h7M151 154h7M82 184h7M151 184h7" />
      <path className="car__line" d="M82 121l-10-4v10l10 3M158 121l10-4v10l-10 3" />
      <rect className="car__wheel" x="76" y="92" width="7" height="25" rx="2" />
      <rect className="car__wheel" x="157" y="92" width="7" height="25" rx="2" />
      <rect className="car__wheel" x="76" y="186" width="7" height="25" rx="2" />
      <rect className="car__wheel" x="157" y="186" width="7" height="25" rx="2" />
      <text className="car__label" x={DIAGRAM.cx} y="54" textAnchor="middle">PRZÓD</text>
      <text className="car__label" x={DIAGRAM.cx} y="258" textAnchor="middle">TYŁ</text>
    </g>
  )
}

export const CameraMark = forwardRef<SVGGElement>(function CameraMark(_, ref) {
  return (
    <g ref={ref} className="cam">
      <path className="cam__cone" d="M0 0 L44 -17 A46 46 0 0 1 44 17 Z" />
      <rect className="cam__body" x="-8" y="-6" width="14" height="12" rx="2.5" />
      <circle className="cam__lens" cx="-1" cy="0" r="3" />
    </g>
  )
})

export function Arrow({ dir = 'right' }: { dir?: 'right' | 'down' }) {
  return (
    <svg className={`icon icon--arrow icon--${dir}`} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 10h13M11 4.5 16.5 10 11 15.5" />
    </svg>
  )
}

export function Scissors() {
  return (
    <svg className="icon icon--scissors" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="7" r="3" />
      <circle cx="6" cy="17" r="3" />
      <path d="M8.4 8.8 20 16.5M8.4 15.2 20 7.5" />
    </svg>
  )
}
