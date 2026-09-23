// Builds the scroll-scrubbed frame sets for every car that has footage.
//
//   node tools/build-frames.mjs            # all cars in FILMS
//   node tools/build-frames.mjs rs3 gt3rs  # only these
//
// Stage 1 decodes exact frames out of the source video with AVFoundation
// (tools/extract-frames.swift — this machine has no ffmpeg), stage 2 scales them
// with lanczos3, runs an unsharp mask and writes WebP. The unsharp pass is the
// point: the source clips carry motion blur, and a plain downscale + low WebP
// quality turned the walk-around soft.
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const scratch = process.env.FRAME_SCRATCH ?? '/tmp/hala4-frames'

// Keep in sync with src/hero/frames.ts (DESKTOP / MOBILE).
const SETS = [
  { key: 'd', count: 120, w: 1600, h: 900, quality: 80 },
  { key: 'm', count: 80, w: 1280, h: 720, quality: 78 },
]
const SHARPEN = { sigma: 0.8, m1: 0.9, m2: 0.35 }

const FILMS = {
  'golf-r': {
    video: `${process.env.HOME}/Downloads/golf8R.mp4`,
    source: 'golf8R.mp4',
    duration: 10,
  },
  rs3: {
    video: `${root}/media-exports/Camera_panning_around_Audi_RS3_20260922231802.mp4`,
    source: 'Camera_panning_around_Audi_RS3_20260922231802.mp4',
    duration: 10,
  },
  gt3rs: {
    video: `${root}/media-exports/Camera_filming_Porsche_in_garage_20260922231811.mp4`,
    source: 'Camera_filming_Porsche_in_garage_20260922231811.mp4',
    duration: 10,
  },
  'octavia-rs': {
    video: `${root}/media-exports/Skoda_Octavia_RS_camera_tour_20260922231834.mp4`,
    source: 'Skoda_Octavia_RS_camera_tour_20260922231834.mp4',
    duration: 10,
  },
}

const pad = (i) => String(i).padStart(3, '0')

// Every generated asset gets the sidecar the project already uses, so it stays
// obvious which pixels came from the user's footage and which were invented.
const sidecar = (file, text) =>
  writeFileSync(
    `${file}.json`,
    JSON.stringify({ prompt: `ORIGIN: ${text}. Not generated.`, createdAt: new Date().toISOString() }, null, 2) + '\n',
  )

async function encode(jpgDir, outDir, set, car, film) {
  mkdirSync(outDir, { recursive: true })
  let bytes = 0
  for (let i = 0; i < set.count; i++) {
    const out = `${outDir}/${pad(i)}.webp`
    const info = await sharp(`${jpgDir}/${pad(i)}.jpg`)
      .resize(set.w, set.h, { kernel: 'lanczos3' })
      .sharpen(SHARPEN)
      .webp({ quality: set.quality, effort: 6, smartSubsample: true })
      .toFile(out)
    bytes += info.size
    sidecar(
      out,
      `frame ${i} of ${set.count} extracted from the user's source video ${film.source} ` +
        `(${film.duration} s, 1920x1080, 24 fps) with AVFoundation, scaled to ${set.w}x${set.h}, ` +
        `unsharp mask, WebP q${set.quality}`,
    )
  }
  return bytes
}

async function build(car) {
  const film = FILMS[car]
  if (!film) throw new Error(`unknown car: ${car}`)
  const jpgRoot = `${scratch}/${car}`

  for (const set of SETS) {
    const jpgDir = `${jpgRoot}/${set.key}`
    rmSync(jpgDir, { recursive: true, force: true })
    execFileSync(
      'swift',
      [`${root}/tools/extract-frames.swift`, film.video, jpgDir, String(set.count), String(film.duration)],
      { stdio: ['ignore', 'inherit', 'inherit'] },
    )
    const outDir = `${root}/public/frames/${car}/${set.key}`
    rmSync(outDir, { recursive: true, force: true })
    const bytes = await encode(jpgDir, outDir, set, car, film)
    console.log(`${car}/${set.key}: ${set.count} frames, ${(bytes / 1024 / 1024).toFixed(1)} MB`)
  }

  // The poster is the first frame at desktop size: it is the LCP image and must
  // land before any of the sequence does.
  const poster = `${root}/public/frames/${car}/poster.webp`
  await sharp(`${jpgRoot}/d/000.jpg`)
    .resize(SETS[0].w, SETS[0].h, { kernel: 'lanczos3' })
    .sharpen(SHARPEN)
    .webp({ quality: 84, effort: 6 })
    .toFile(poster)
  sidecar(poster, `first frame of the user's source video ${film.source}, scaled to ${SETS[0].w}x${SETS[0].h}, WebP q84`)

  rmSync(jpgRoot, { recursive: true, force: true })
}

const cars = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(FILMS)
for (const car of cars) await build(car)
console.log('done')
