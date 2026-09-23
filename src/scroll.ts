import Lenis from 'lenis'
import { useEffect, useState } from 'react'

let lenis: Lenis | null = null

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function startSmoothScroll() {
  if (lenis || reducedMotion()) return () => {}
  lenis = new Lenis({ autoRaf: true, lerp: 0.12, anchors: { offset: -56 } })
  return () => {
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.4 })
  else window.scrollTo({ top: y, behavior: reducedMotion() ? 'auto' : 'smooth' })
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - 56
  scrollToY(y)
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(reducedMotion)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}
