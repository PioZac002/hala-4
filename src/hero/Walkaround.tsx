import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { FILMED, filmedById, fmtDate } from '../data'
import { Arrow, CameraMark, CarOutline, Clip, Signature, Stamp, Tick } from '../components/Marks'
import { scrollToY } from '../scroll'
import { money, useI18n } from '../i18n'
import type { FilmSignal } from './FilmField'
import { posterUrl, stillUrl, storeFor } from './frames'
import { DIAGRAM, activeCheckpoint, cameraAt, focusAt, timeAt, timingFor, trailUpTo } from './timeline'

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

// three.js + R3F arrive in their own chunk; the poster and the protocol render without waiting for them.
const FilmField = lazy(() => import('./FilmField').then((m) => ({ default: m.FilmField })))

export function Walkaround({
  carId,
  onCar,
  reduced,
}: {
  carId: string
  onCar: (id: string) => void
  reduced: boolean
}) {
  const { t, loc, lang } = useI18n()
  // Only four cars have footage. Picking one of them anywhere on the page brings the hero with it;
  // picking a car we have no film of leaves the walk-around on the last car it could actually show.
  const car = useMemo(() => filmedById(carId), [carId])
  const film = car.film
  const timing = useMemo(() => timingFor(film), [film])
  const store = useMemo(() => storeFor(film), [film])
  const signal = useRef<FilmSignal>({ t: 0, vel: 0, flash: 0, mx: 0, my: 0, focus: 0.5 })

  const section = useRef<HTMLElement>(null)
  const cam = useRef<SVGGElement>(null)
  const trail = useRef<SVGPolylineElement>(null)
  const timecode = useRef<HTMLSpanElement>(null)

  const [shots, setShots] = useState(reduced ? 5 : 0)
  const [signed, setSigned] = useState(reduced)
  const [idx, setIdx] = useState(0)
  const [chosen, setChosen] = useState(0) // reduced motion: the photo picked by hand
  const [inView, setInView] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [firstFrame, setFirstFrame] = useState(false)
  const today = useMemo(() => fmtDate(new Date()), [])

  useEffect(() => {
    setFirstFrame(false)
    store.start()
    return store.subscribe((n) => n > 0 && setFirstFrame(true))
  }, [store])

  // The handover starts on its own: photo 1 is taken shortly after the film develops.
  const intro = useRef(false)
  useEffect(() => {
    if (reduced || !firstFrame) return
    const id = window.setTimeout(() => {
      intro.current = true
    }, 900)
    return () => window.clearTimeout(id)
  }, [firstFrame, reduced])

  useEffect(() => {
    const el = section.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '100px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    let raf = 0
    let lastP = -1
    let lastT = -1
    let lastTrail = -1
    let lastShots = reduced ? 5 : 0
    let lastSigned = reduced
    let lastIdx = -1
    let lastTime = performance.now()

    const loop = (now: number) => {
      const dt = Math.max(1, now - lastTime) / 1000
      lastTime = now
      const el = section.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const span = Math.max(1, rect.height - window.innerHeight)
        const p = reduced ? timing.checkpointP[chosen] : clamp(-rect.top / span)
        const t = reduced ? film.checkpoints[chosen].t : timeAt(timing, p)
        const s = signal.current

        s.vel = lastP < 0 ? 0 : clamp(((p - lastP) / dt) * 3, -1, 1)
        s.t = t
        s.focus = focusAt(film, t)
        lastP = p

        if (t !== lastT) {
          const c = cameraAt(film, t)
          cam.current?.setAttribute(
            'transform',
            `translate(${c.x.toFixed(2)} ${c.y.toFixed(2)}) rotate(${((c.look * 180) / Math.PI).toFixed(2)})`,
          )
          if (timecode.current) timecode.current.textContent = `00:0${Math.min(9.9, t).toFixed(1).replace('.', ',')}`
          lastT = t
        }
        if (Math.abs(t - lastTrail) > 0.025 || (t === 0 && lastTrail !== 0)) {
          trail.current?.setAttribute('points', trailUpTo(film, t))
          lastTrail = t
        }

        if (!reduced) {
          const taken = Math.max(intro.current ? 1 : 0, timing.shotAt.filter((x) => p >= x).length)
          if (taken !== lastShots) {
            if (taken > lastShots) s.flash = 1
            lastShots = taken
            setShots(taken)
          }
          const sig = p >= timing.signAt
          if (sig !== lastSigned) {
            lastSigned = sig
            setSigned(sig)
          }
          if (p > 0.004) setScrolled(true)
        }
        const ci = activeCheckpoint(film, t)
        if (ci !== lastIdx) {
          lastIdx = ci
          setIdx(ci)
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [reduced, chosen, film, timing])

  const onPointer = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    signal.current.mx = ((e.clientX - r.left) / r.width) * 2 - 1
    signal.current.my = ((e.clientY - r.top) / r.height) * 2 - 1
  }
  const onLeave = () => {
    signal.current.mx = 0
    signal.current.my = 0
  }

  const goTo = (i: number) => {
    if (reduced) {
      setChosen(i)
      return
    }
    const el = section.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    scrollToY(top + timing.checkpointP[i] * (el.offsetHeight - window.innerHeight))
  }

  const current = film.checkpoints[idx]

  return (
    <section ref={section} className={`walk ${reduced ? 'walk--static' : ''}`} aria-labelledby="walk-title">
      <div className="walk__pin">
        <div className="walk__grid">
          <figure className="film" onPointerMove={onPointer} onPointerLeave={onLeave}>
            <div className="film__frame">
              <img
                key={`poster-${car.id}`}
                className="film__poster"
                src={posterUrl(film)}
                alt={t('hero.posterAlt', { model: car.model, color: loc(car.color) })}
                fetchPriority={car.id === FILMED[0].id ? 'high' : 'auto'}
              />
              {reduced ? (
                <img
                  className="film__still"
                  src={stillUrl(store.set, film, chosen)}
                  alt={t('hero.stillAlt', { label: loc(film.checkpoints[chosen].label), model: car.model })}
                />
              ) : (
                <Suspense fallback={null}>
                  <FilmField key={car.id} store={store} signal={signal} active={inView} />
                </Suspense>
              )}
              <span className="crop crop--tl" aria-hidden="true" />
              <span className="crop crop--tr" aria-hidden="true" />
              <span className="crop crop--bl" aria-hidden="true" />
              <span className="crop crop--br" aria-hidden="true" />
            </div>
            <figcaption className="film__cap">
              <span className="film__label">
                {t('hero.photoOf', { n: idx + 1 })} <b>{loc(current.label)}</b>
              </span>
              <span className="film__tc" ref={timecode} aria-hidden="true">
                00:00,0
              </span>
              {!reduced && (
                <span className={`film__hint ${scrolled ? 'is-gone' : ''}`}>
                  {t('hero.scrollHint')} <Arrow dir="down" />
                </span>
              )}
            </figcaption>

            <div className="pick">
              <span className="pick__label" id="pick-label">
                {t('hero.pick')}
              </span>
              <ul className="pick__list" aria-labelledby="pick-label">
                {FILMED.map((c) => {
                  const on = c.id === car.id
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        className={`pick__btn ${on ? 'is-on' : ''}`}
                        aria-pressed={on}
                        onClick={() => onCar(c.id)}
                      >
                        {c.short}
                        {on && (
                          <svg className="circled" viewBox="0 0 200 50" preserveAspectRatio="none" aria-hidden="true">
                            <path
                              pathLength={1}
                              d="M14 30C10 15 60 5 110 6c52 1 84 8 82 20-3 14-60 20-104 19C40 44 6 38 12 24 16 14 40 9 62 8"
                            />
                          </svg>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </figure>

          <div className="walk__head">
            <h1 id="walk-title" className="display">
              {t('hero.title')}
            </h1>
            <p className="lead lead--full">{t('hero.lead')}</p>
            <p className="lead lead--short">{t('hero.leadShort')}</p>
          </div>

          <div className="walk__vehicle box">
            <span className="box__label">{t('veh.label')}</span>
            <svg
              className="diagram"
              viewBox={`0 0 ${DIAGRAM.w} ${DIAGRAM.h}`}
              role="img"
              aria-label={t('veh.diagramAria', { label: loc(current.label) })}
            >
              <CarOutline />
              <polyline ref={trail} className="diagram__trail" points="" />
              {film.checkpoints.map((c, i) => {
                const p = cameraAt(film, c.t)
                return (
                  <g key={c.id} className={`diagram__pin ${shots > i ? 'is-on' : ''}`} transform={`translate(${p.x} ${p.y})`}>
                    <circle r="8" />
                    <text y="3.6" textAnchor="middle">
                      {i + 1}
                    </text>
                  </g>
                )
              })}
              <CameraMark ref={cam} />
            </svg>
            <dl className="fields">
              <div className="field">
                <dt>{t('veh.vehicle')}</dt>
                <dd className="ink ink--write" key={`m-${car.id}`}>
                  {car.model}
                </dd>
              </div>
              <div className="field">
                <dt>{t('veh.colorPower')}</dt>
                <dd className="ink" key={`c-${car.id}`}>
                  {loc(car.color)}, {car.power} {t('veh.hp')}
                </dd>
              </div>
              <div className="field">
                <dt>{t('veh.notes')}</dt>
                <dd className="ink ink--write" key={shots > idx ? `${car.id}-${current.id}` : 'none'}>
                  {shots > idx ? loc(current.note) : '—'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="walk__shots box">
            <span className="box__label">{t('shots.label')}</span>
            <ol className="shots">
              {film.checkpoints.map((c, i) => {
                const taken = shots > i
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={`shot ${taken ? 'is-taken' : ''} ${idx === i ? 'is-current' : ''}`}
                      onClick={() => goTo(i)}
                      aria-label={t('shots.aria', { label: loc(c.label), taken: taken ? t('shots.taken') : '' })}
                      aria-current={idx === i ? 'step' : undefined}
                    >
                      <span className="shot__photo">
                        {taken && (
                          <>
                            <img src={stillUrl(store.set, film, i)} alt="" />
                            <Clip />
                          </>
                        )}
                        <span className="shot__n">{i + 1}</span>
                      </span>
                      <span className="shot__label">
                        <span className="checkbox">
                          <Tick on={taken} />
                        </span>
                        {loc(c.label)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="walk__foot">
            <dl className="walk__terms">
              <div>
                <dt>{t('foot.deposit')}</dt>
                <dd>{money(car.deposit, lang)}</dd>
              </div>
              <div>
                <dt>{t('foot.limit')}</dt>
                <dd>{t('fleet.kmPerDay', { km: car.kmPerDay })}</dd>
              </div>
              <div>
                <dt>{t('foot.insurance')}</dt>
                <dd>{t('foot.included')}</dd>
              </div>
            </dl>
            <div className="price">
              <span className="price__label">{t('foot.from', { model: car.model })}</span>
              <span className="price__num">{money(car.day, lang)}</span>
              <span className="price__unit">{t('foot.perDay')}</span>
            </div>
            <div className="walk__actions">
              <a className="btn" href="#rezerwacja">
                {t('foot.pickDates')} <Arrow />
              </a>
              <a className="link" href="#flota">
                {t('foot.wholeFleet')}
              </a>
            </div>
            <div className="signoff">
              <Signature on={signed} />
              <span className="signoff__label">{t('foot.signedBy')}</span>
              <Stamp word={t('foot.stamp')} date={today} on={signed} id="st-walk" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
