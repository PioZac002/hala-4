import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { FrameStore, frameAt, frameUrl, posterUrl, stillUrl } from './frames'

// Live values written by the walk-around's scroll loop, read every frame by the shader.
export type FilmSignal = {
  t: number // video time, s
  vel: number // signed scroll speed, roughly -1..1
  flash: number // shutter, 1 → 0
  mx: number // pointer, -1..1
  my: number
  focus: number // horizontal crop centre, 0..1
}

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uA;
  uniform sampler2D uB;
  uniform sampler2D uStill;
  uniform float uMix;
  uniform float uStillMix;
  uniform float uFlash;
  uniform float uTime;
  uniform float uVel;
  uniform float uReady;
  uniform float uFocus;
  uniform vec2 uRes;
  uniform vec2 uImg;
  uniform vec2 uStillImg;
  uniform vec2 uMouse;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // object-fit: cover, with a movable horizontal focus for narrow screens
  vec2 cover(vec2 uv, vec2 img) {
    float rs = uRes.x / uRes.y;
    float ri = img.x / img.y;
    vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
    vec2 o = vec2((1.0 - s.x) * uFocus, (1.0 - s.y) * 0.5);
    return o + uv * s;
  }

  vec3 frame(vec2 uv) {
    return mix(texture2D(uA, cover(uv, uImg)).rgb, texture2D(uB, cover(uv, uImg)).rgb, uMix);
  }

  void main() {
    vec2 c = vUv - 0.5;
    // No standing lens push: on a retina screen the 1600px frames then land close to 1:1
    // instead of being upscaled, which is what keeps the film as crisp as the photo beside it.
    // The shutter still breathes, and the pointer parallax rides on a smaller offset.
    vec2 uv = clamp(0.5 + c / (1.0 + uFlash * 0.03) + uMouse * vec2(0.008, 0.005), 0.0, 1.0);

    // scroll speed splits the channels a touch, like a lens under load
    float ca = clamp(abs(uVel), 0.0, 1.0) * 0.005;
    vec2 d = normalize(c + 1e-5) * ca;
    vec3 col = vec3(frame(uv + d).r, frame(uv).g, frame(uv - d).b);

    // at an inspection point the moving frame gives way to the sharp photograph of that angle
    col = mix(col, texture2D(uStill, cover(uv, uStillImg)).rgb, uStillMix);

    // grade: a gentle S-curve that keeps the hall's whites clean and the paint deep
    col = mix(col, col * col * (3.0 - 2.0 * col), 0.2);
    float vig = smoothstep(1.0, 0.35, length(c * vec2(1.0, 0.85)));
    col *= mix(0.88, 1.0, vig);

    // film grain
    col += (hash(vUv * uRes + fract(uTime) * 91.0) - 0.5) * 0.035;

    // shutter: overexpose, then the frame comes back
    col = mix(col, vec3(1.0), uFlash * 0.92);

    // the photo develops out of the paper on first load
    vec3 paper = vec3(0.906, 0.918, 0.929);
    float dev = smoothstep(0.0, 1.0, uReady * 1.3 - hash(floor(vUv * uRes / 3.0)) * 0.3);
    col = mix(paper, col, dev);

    gl_FragColor = vec4(col, 1.0);
  }
`

function makeTexture() {
  const t = new THREE.Texture()
  t.colorSpace = THREE.NoColorSpace
  t.minFilter = THREE.LinearFilter
  t.magFilter = THREE.LinearFilter
  t.generateMipmaps = false
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
  return t
}

// The first sheet of the session develops slowly, the way a photograph does. Swapping to
// another car later is a new sheet pushed through the window — the same effect, but brisk.
let developed = false

function FilmQuad({ store, signal }: { store: FrameStore; signal: React.RefObject<FilmSignal> }) {
  const developRate = useMemo(() => {
    const rate = developed ? 2.6 : 0.9
    developed = true
    return rate
  }, [store])
  const { size, viewport } = useThree()
  const slots = useMemo(() => [{ tex: makeTexture(), idx: -1 }, { tex: makeTexture(), idx: -1 }], [store])
  const still = useMemo(() => ({ tex: makeTexture(), idx: -1 }), [store])
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uA: { value: slots[0].tex },
          uB: { value: slots[1].tex },
          uStill: { value: still.tex },
          uMix: { value: 0 },
          uStillMix: { value: 0 },
          uFlash: { value: 0 },
          uTime: { value: 0 },
          uVel: { value: 0 },
          uReady: { value: 0 },
          uFocus: { value: 0.5 },
          uRes: { value: new THREE.Vector2(1, 1) },
          uImg: { value: new THREE.Vector2(store.set.w, store.set.h) },
          uStillImg: { value: new THREE.Vector2(store.set.w, store.set.h) },
          uMouse: { value: new THREE.Vector2() },
        },
      }),
    [slots, still, store],
  )
  const mouse = useRef(new THREE.Vector2())

  useEffect(
    () => () => {
      slots.forEach((s) => s.tex.dispose())
      still.tex.dispose()
      material.dispose()
    },
    [slots, still, material],
  )

  useFrame((_, dt) => {
    const s = signal.current
    const u = material.uniforms
    const f = frameAt(store.set, store.film, s.t)
    const i0 = Math.floor(f)
    const i1 = Math.min(store.set.count - 1, i0 + 1)
    const a = store.nearest(i0)
    const b = store.nearest(i1)

    if (a >= 0) {
      const bind = (want: number, avoid: (typeof slots)[number] | null) => {
        let slot = slots.find((x) => x.idx === want)
        if (!slot) {
          slot = slots.find((x) => x !== avoid) ?? slots[0]
          slot.tex.image = store.images[want]!
          slot.tex.needsUpdate = true
          slot.idx = want
        }
        return slot
      }
      const sa = bind(a, null)
      const sb = b === a ? sa : bind(b, sa)
      u.uA.value = sa.tex
      u.uB.value = sb.tex
      // blend neighbouring frames only when both real neighbours are here; otherwise hold the nearest
      u.uMix.value = a === i0 && b === i1 ? f - i0 : 0
      u.uReady.value = Math.min(1, u.uReady.value + dt * developRate)
    }

    const sharp = store.stillAt(s.t)
    if (sharp.idx >= 0) {
      const img = store.stills[sharp.idx]!
      if (still.idx !== sharp.idx) {
        still.tex.image = img
        still.tex.needsUpdate = true
        still.idx = sharp.idx
        u.uStillImg.value.set(img.naturalWidth || store.set.w, img.naturalHeight || store.set.h)
      }
    }
    u.uStillMix.value = sharp.idx >= 0 && still.idx === sharp.idx ? sharp.mix : 0

    s.flash = Math.max(0, s.flash - dt * 2.2)
    u.uFlash.value = s.flash * s.flash
    u.uTime.value += dt
    u.uVel.value += (s.vel - u.uVel.value) * Math.min(1, dt * 8)
    u.uFocus.value = s.focus
    mouse.current.lerp(new THREE.Vector2(s.mx, -s.my), Math.min(1, dt * 3))
    u.uMouse.value.copy(mouse.current)
    u.uRes.value.set(size.width * viewport.dpr, size.height * viewport.dpr)
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

// Without WebGL the same frames are swapped into a plain image element; the walk-around still works.
function ImageFallback({ store, signal }: { store: FrameStore; signal: React.RefObject<FilmSignal> }) {
  const img = useRef<HTMLImageElement>(null)
  useEffect(() => {
    let raf = 0
    let last = ''
    const loop = () => {
      const sharp = store.stillAt(signal.current.t)
      const i = store.nearest(frameAt(store.set, store.film, signal.current.t))
      const src =
        sharp.idx >= 0 && sharp.mix > 0.5
          ? stillUrl(store.set, store.film, sharp.idx)
          : i >= 0
            ? frameUrl(store.set, i)
            : ''
      if (src && src !== last && img.current) {
        img.current.src = src
        last = src
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [store, signal])
  return <img ref={img} className="film__fallback" src={posterUrl(store.film)} alt="" />
}

export function FilmField({
  store,
  signal,
  active,
}: {
  store: FrameStore
  signal: React.RefObject<FilmSignal>
  active: boolean
}) {
  const [gl] = useState(hasWebGL)
  if (!gl) return <ImageFallback store={store} signal={signal} />
  return (
    <Canvas
      className="film__canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <FilmQuad store={store} signal={signal} />
    </Canvas>
  )
}
