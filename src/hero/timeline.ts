import type { Film } from '../data'

// Scroll progress (0..1 over the pinned walk-around) → video time (s).
// Each car's film has its own inspection points, so the mapping is derived from them
// rather than hand-tuned per car: the camera travels between points at a speed
// proportional to the footage, and stops at every point long enough to take the photo.
const HOLD = 0.05 // progress spent standing still at an inspection point
const MIN_TAIL = 0.06 // progress left after the last photo, so the stamp has room to land

export type Timing = {
  keys: [number, number][]
  shotAt: number[] // progress at which each photo is taken
  checkpointP: number[] // progress that shows a given checkpoint (middle of its hold)
  signAt: number // progress at which the protocol is signed and stamped
  duration: number
}

export function timingFor(film: Film): Timing {
  const ts = film.checkpoints.map((c) => c.t)
  const end = film.duration * 0.995
  const legs = [...ts.slice(1).map((t, i) => t - ts[i]), Math.max(0.1, end - ts[ts.length - 1])]
  const budget = 1 - ts.length * HOLD
  const total = legs.reduce((a, b) => a + b, 0)
  const shares = legs.map((leg) => (budget * leg) / total)

  // The tail is usually the shortest leg; give it a floor and take it back from the others.
  const tail = shares[shares.length - 1]
  if (tail < MIN_TAIL) {
    const owed = MIN_TAIL - tail
    const rest = budget - tail
    for (let i = 0; i < shares.length - 1; i++) shares[i] -= (owed * shares[i]) / rest
    shares[shares.length - 1] = MIN_TAIL
  }

  const keys: [number, number][] = []
  const shotAt: number[] = []
  const checkpointP: number[] = []
  let p = 0
  ts.forEach((t, i) => {
    keys.push([p, t])
    shotAt.push(p + HOLD * (i === 0 ? 0.25 : 0.05))
    checkpointP.push(p + HOLD * 0.5)
    p += HOLD
    keys.push([p, t])
    p += shares[i]
  })
  keys.push([1, end])

  return { keys, shotAt, checkpointP, signAt: shotAt[shotAt.length - 1] + HOLD * 0.8, duration: film.duration }
}

const smooth = (x: number) => x * x * (3 - 2 * x)

export function timeAt(timing: Timing, p: number) {
  const k = timing.keys
  if (p <= k[0][0]) return k[0][1]
  for (let i = 1; i < k.length; i++) {
    const [p1, t1] = k[i]
    if (p <= p1) {
      const [p0, t0] = k[i - 1]
      const r = p1 === p0 ? 1 : (p - p0) / (p1 - p0)
      return t0 + (t1 - t0) * smooth(r)
    }
  }
  return k[k.length - 1][1]
}

export const shotsTaken = (timing: Timing, p: number) => timing.shotAt.filter((s) => p >= s).length

export const activeCheckpoint = (film: Film, t: number) => {
  let idx = 0
  film.checkpoints.forEach((c, i) => {
    if (t >= c.t - 0.35) idx = i
  })
  return idx
}

// Horizontal crop centre for the moment of film on screen, so narrow screens keep the car in frame.
export function focusAt(film: Film, t: number) {
  const f = film.focus
  for (let i = 1; i < f.length; i++) {
    if (t <= f[i][0]) {
      const [t0, f0] = f[i - 1]
      const [t1, f1] = f[i]
      return f0 + (f1 - f0) * ((t - t0) / (t1 - t0 || 1))
    }
  }
  return f[f.length - 1][1]
}

export const DIAGRAM = { w: 240, h: 300, cx: 120, cy: 150 }

// Camera position around the car, top view, polar about the car centre.
export function cameraAt(film: Film, t: number) {
  const orbit = film.orbit
  let i = 1
  while (i < orbit.length - 1 && t > orbit[i].t) i++
  const A = orbit[i - 1]
  const B = orbit[i]
  const k = Math.min(1, Math.max(0, (t - A.t) / (B.t - A.t || 1)))
  const a = ((A.a + (B.a - A.a) * k) * Math.PI) / 180
  const r = A.r + (B.r - A.r) * k
  const x = DIAGRAM.cx - r * Math.sin(a)
  const y = DIAGRAM.cy - r * Math.cos(a)
  // Outside the car the camera looks at the car; once inside it looks forward, through the windscreen.
  const toCentre = Math.atan2(DIAGRAM.cy - y, DIAGRAM.cx - x)
  const forward = -Math.PI / 2
  const inside = Math.min(1, Math.max(0, (46 - r) / 24))
  let d = forward - toCentre
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  const look = toCentre + d * inside
  return { x, y, look }
}

// Pre-sampled ink trail of the walk so far.
export function trailUpTo(film: Film, t: number, step = 0.08) {
  const pts: string[] = []
  for (let s = 0; s <= t; s += step) {
    const c = cameraAt(film, s)
    pts.push(`${c.x.toFixed(1)},${c.y.toFixed(1)}`)
  }
  const c = cameraAt(film, t)
  pts.push(`${c.x.toFixed(1)},${c.y.toFixed(1)}`)
  return pts.join(' ')
}
