// Turns hand-supplied photographs into the sharp stills the protocol shows at every stop.
//
//   node tools/add-stills.mjs rs3 ~/Desktop/rs3-photos
//   node tools/add-stills.mjs gt3rs ~/Downloads --dry
//
// Every file whose name contains a checkpoint id (front, side, rear, door, cabin) is scaled
// to 1600×900, unsharp-masked and written as WebP next to the frame sequences, with a
// provenance sidecar. The lines to paste into src/data.ts are printed at the end.
//
// The film frames carry the camera's motion blur; these photographs are what the visitor
// actually sees at each stop, in the inspection strip and on the car card.
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// The five stops, in walk order, as src/data.ts names them.
const POINTS = ['front', 'side', 'rear', 'door', 'cabin']
const WIDTH = 1600
const HEIGHT = 900
const QUALITY = 86

const [carArg, dirArg, ...flags] = process.argv.slice(2)
const dry = flags.includes('--dry')

const cars = readdirSync(join(root, 'public/frames'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)

if (!carArg || !dirArg) {
  console.error(`usage: node tools/add-stills.mjs <car> <folder> [--dry]\n       cars: ${cars.join(', ')}`)
  process.exit(1)
}
if (!cars.includes(carArg)) {
  console.error(`unknown car "${carArg}" — expected one of: ${cars.join(', ')}`)
  process.exit(1)
}

const source = resolve(dirArg.replace(/^~/, process.env.HOME ?? '~'))
const out = join(root, 'public/frames', carArg, 'stills')

const candidates = readdirSync(source)
  .filter((f) => /\.(jpe?g|png|webp|tiff?|heic)$/i.test(f) && statSync(join(source, f)).isFile())

// A file belongs to the stop whose id appears in its name; the last match wins, so
// "rs3-front-door.jpg" is read as the door shot.
const picked = new Map()
for (const file of candidates) {
  const name = basename(file, extname(file)).toLowerCase()
  const hit = POINTS.filter((p) => name.includes(p)).pop()
  if (hit) picked.set(hit, file)
}

const missing = POINTS.filter((p) => !picked.has(p))
if (picked.size === 0) {
  console.error(`No file in ${source} names a stop. Expected one of: ${POINTS.join(', ')} in the file name.`)
  process.exit(1)
}

console.log(`${carArg}: ${picked.size} of ${POINTS.length} stops matched${missing.length ? `, missing ${missing.join(', ')}` : ''}`)

if (!dry) mkdirSync(out, { recursive: true })

for (const point of POINTS) {
  const file = picked.get(point)
  if (!file) continue
  const from = join(source, file)
  const to = join(out, `${point}.webp`)
  const meta = await sharp(from).metadata()
  const ratio = (meta.width ?? 0) / (meta.height ?? 1)
  const crop = Math.abs(ratio - WIDTH / HEIGHT) > 0.02 ? ` (cropped to 16:9 from ${meta.width}×${meta.height})` : ''

  if (dry) {
    console.log(`  ${point}: ${file} → ${to.replace(root + '/', '')}${crop}`)
    continue
  }

  await sharp(from)
    .resize(WIDTH, HEIGHT, { fit: 'cover', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.7, m1: 0.6, m2: 1.6 })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(to)

  writeFileSync(
    `${to}.json`,
    JSON.stringify(
      {
        prompt: `ORIGIN: photograph supplied by the user (${file}) for the "${point}" stop of the ${carArg} walk-around, resized to ${WIDTH}x${HEIGHT} with lanczos3, unsharp mask, WebP q${QUALITY}. Not generated.`,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ) + '\n',
  )
  console.log(`  ${point}: ${file} → ${to.replace(root + '/', '')}${crop}`)
}

console.log(`\nAdd to the matching checkpoints in src/data.ts:`)
for (const point of POINTS) {
  if (picked.has(point)) console.log(`  still: '/frames/${carArg}/stills/${point}.webp',`)
}
