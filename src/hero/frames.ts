import type { Film } from '../data'

// Two WebP sequences per car, cut from its 10 s / 24 fps clip by tools/build-frames.mjs:
// desktop — 120 frames at 1600×900 (12 fps), mobile — 80 at 1280×720 (8 fps),
// large enough that the portrait crop on a DPR 2–3 phone is not upscaled much.
export type FrameSet = { dir: string; count: number; fps: number; w: number; h: number }

const DESKTOP = { count: 120, fps: 12, w: 1600, h: 900 }
const MOBILE = { count: 80, fps: 8, w: 1280, h: 720 }

export const isSmallScreen = () =>
  typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight * 1.6) < 820

export const setFor = (film: Film, small = isSmallScreen()): FrameSet => ({
  ...(small ? MOBILE : DESKTOP),
  dir: `/frames/${film.dir}/${small ? 'm' : 'd'}`,
})

export const posterUrl = (film: Film) => `/frames/${film.dir}/poster.webp`
export const frameUrl = (set: FrameSet, i: number) => `${set.dir}/${String(i).padStart(3, '0')}.webp`

export const frameAt = (set: FrameSet, film: Film, t: number) =>
  Math.min(set.count - 1, Math.max(0, (t / film.duration) * set.count))
export const checkpointFrame = (set: FrameSet, film: Film, idx: number) =>
  Math.round(frameAt(set, film, film.checkpoints[idx].t))

// The still shown at a checkpoint: the hand-supplied sharp photo when the car has one,
// otherwise the frame the film stopped on.
export const stillUrl = (set: FrameSet, film: Film, idx: number) =>
  film.checkpoints[idx].still ?? frameUrl(set, checkpointFrame(set, film, idx))

type Listener = (loaded: number) => void

// Loads a frame sequence coarse-to-fine so scrubbing works long before every frame has arrived:
// first the inspection stills, then every 16th frame, every 8th, 4th, 2nd, and the rest.
export class FrameStore {
  set: FrameSet
  film: Film
  images: (HTMLImageElement | null)[]
  stills: (HTMLImageElement | null)[] // hand-supplied sharp photos, one slot per checkpoint
  loaded = 0
  private listeners = new Set<Listener>()
  private started = false

  constructor(film: Film, set = setFor(film)) {
    this.film = film
    this.set = set
    this.images = new Array(set.count).fill(null)
    this.stills = new Array(film.checkpoints.length).fill(null)
  }

  order() {
    const seen = new Set<number>()
    const out: number[] = []
    const push = (i: number) => {
      if (i >= 0 && i < this.set.count && !seen.has(i)) {
        seen.add(i)
        out.push(i)
      }
    }
    this.film.checkpoints.forEach((_, i) => push(checkpointFrame(this.set, this.film, i)))
    for (const stride of [16, 8, 4, 2, 1]) for (let i = 0; i < this.set.count; i += stride) push(i)
    push(this.set.count - 1)
    return out
  }

  private load(src: string, onReady: (img: HTMLImageElement) => void, then: () => void) {
    const img = new Image()
    img.decoding = 'async'
    img.src = src
    img
      .decode()
      .then(() => {
        onReady(img)
        this.loaded++
        this.listeners.forEach((l) => l(this.loaded))
      })
      .catch(() => {})
      .finally(then)
  }

  start(concurrency = 6) {
    if (this.started) return
    this.started = true

    // A sharp checkpoint photo replaces the (motion-blurred) frame at every stop, so it is
    // fetched before the sequence: it is what the visitor actually looks at.
    this.film.checkpoints.forEach((c, i) => {
      if (c.still) this.load(c.still, (img) => (this.stills[i] = img), () => {})
    })

    const queue = this.order()
    const next = () => {
      const i = queue.shift()
      if (i === undefined) return
      this.load(frameUrl(this.set, i), (img) => (this.images[i] = img), next)
    }
    for (let k = 0; k < concurrency; k++) next()
  }

  // Nearest frame that has arrived, searching outwards from the wanted index.
  nearest(i: number) {
    const n = this.set.count
    const c = Math.round(Math.min(n - 1, Math.max(0, i)))
    if (this.images[c]) return c
    for (let d = 1; d < n; d++) {
      if (c - d >= 0 && this.images[c - d]) return c - d
      if (c + d < n && this.images[c + d]) return c + d
    }
    return -1
  }

  // The checkpoint whose sharp photo should be showing at video time `t`, and how far the
  // cross-fade has come. Returns -1 when the film is between stops, or has no photo there.
  stillAt(t: number): { idx: number; mix: number } {
    for (let i = 0; i < this.stills.length; i++) {
      if (!this.stills[i]) continue
      const d = Math.abs(t - this.film.checkpoints[i].t)
      if (d < 0.5) {
        const k = Math.min(1, Math.max(0, (0.5 - d) / 0.28))
        return { idx: i, mix: k * k * (3 - 2 * k) }
      }
    }
    return { idx: -1, mix: 0 }
  }

  subscribe(l: Listener) {
    this.listeners.add(l)
    return () => {
      this.listeners.delete(l)
    }
  }
}

// One store per car, kept for the session: switching back to a car it has already loaded
// is instant instead of re-fetching 120 frames.
const stores = new Map<string, FrameStore>()
export function storeFor(film: Film) {
  const key = `${film.dir}:${isSmallScreen() ? 'm' : 'd'}`
  let store = stores.get(key)
  if (!store) {
    store = new FrameStore(film)
    stores.set(key, store)
  }
  return store
}
