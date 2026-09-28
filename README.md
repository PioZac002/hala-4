# Hala 4 — car rental landing page (concept)

Vite + React 19 + React Three Fiber. The hero is a scroll-scrubbed walk-around of a car in WebGL that fills in a handover protocol as it goes. Four cars have their own film shot in the hall and can be switched on the fly. The page is printed in two languages, English by default.

```bash
npm install
npm run dev      # http://localhost:5174 (port from .claude/launch.json), or Vite's default port
npm run build    # production build into dist/
```

## How the hero works

- Every filmed car has its own frame directory: `public/frames/<car>/d/` (120 WebP frames, 1600×900, desktop) and `public/frames/<car>/m/` (80 frames, 1280×720, phones), plus `poster.webp`. A frame sequence instead of a video, because it scrubs smoothly in both directions in every browser, Safari on iOS included.
- `src/data.ts` holds a `film` for each car: the five inspection points, the camera route on the diagram and the crop centre for narrow screens. The rest of the hero (scroll → video time, the stops for photos, the moment of signing) is derived from those points in `src/hero/timeline.ts`, so a new car needs no hand tuning.
- `src/hero/frames.ts` loads frames coarse-to-fine and keeps one store per car, so coming back to a car you have already watched is instant.
- `src/hero/FilmField.tsx` — a full-screen quad in R3F with its own shader: blending between neighbouring frames, cover-fit with a movable focus, pointer parallax, a touch of chromatic aberration at speed, grain, the shutter flash and the photo "developing" on load (faster when you switch cars). It renders at device pixel ratio 2 with no standing zoom, so on a retina screen the 1600px frames land close to 1:1. three.js arrives in its own chunk.
- Without WebGL the same frames are swapped into a plain image element; under `prefers-reduced-motion` the protocol is filled in from the start and the photos are picked by hand.

### Sharp photos instead of video frames

Frames carry the motion blur of the footage. Any inspection point can be swapped for a real photograph: drop the file into `public/frames/<car>/stills/` (1600×900, same framing as the film) and point at it in `src/data.ts`:

```ts
{ id: 'front', label: { en: 'Front', pl: 'Przód' }, t: 0.3, note: { … }, still: '/frames/rs3/stills/front.webp' }
```

At every stop the shader cross-fades from the film frame to that photo (and back once the scroll moves on), and the inspection strip, the car card and the no-WebGL version take it directly. The RS 3, the 911 GT3 RS and the Octavia RS use this for their front shot.

`tools/add-stills.mjs` does the conversion. Name each photo after its stop and point the tool at
the folder:

```bash
node tools/add-stills.mjs rs3 ~/Desktop/rs3-photos     # --dry to see what it would do
```

Any file whose name contains `front`, `side`, `rear`, `door` or `cabin` is scaled to 1600×900
(cropped to 16:9 when it is not), unsharp-masked, written as WebP into
`public/frames/<car>/stills/` with a provenance sidecar, and printed back as the `still:` lines to
paste into `src/data.ts`.

The angle each photo has to match is the frame the film stops on. `media-exports/checkpoint-reference/`
holds all twenty of them, one folder per car plus `OVERVIEW.jpg` as a contact sheet — useful as a
reference when shooting or generating replacements.

### Adding a filmed car

1. Put the clip in `media-exports/` and add it to `FILMS` in `tools/build-frames.mjs`.
2. `node tools/build-frames.mjs <car>` — Swift + AVFoundation cuts the exact frames (this machine has no ffmpeg), `sharp` scales them with lanczos3, runs an unsharp mask and writes WebP together with a provenance sidecar next to every file.
3. Add the `film` to `src/data.ts`: the times of the five inspection points read off the frames, the camera route and the crop.

## Running with Docker

One container serves the whole thing: the built page and `/api/chat` in a single Node process
(`server/serve.ts`), no platform and no reverse proxy needed.

```bash
cp .env.example .env     # paste the key for the answer desk — optional
docker compose up --build
# http://localhost:8080
```

Without a key the container still runs: the desk answers from the price list and says so. Change
the published port with `PORT=3000 docker compose up`, and stop everything with `docker compose down`.

What is in the image: a two-stage build installs and runs `npm run build:all` (Vite for the page,
esbuild for a 40 KB server bundle), and the runtime stage copies `dist/` and `dist-server/` into a
`node:24-alpine` image with no `node_modules` at all. It runs as the image's unprivileged `node`
user, exposes 8080 and reports health on `/healthz`. About 360 MB, most of it the 80 MB of frames
plus the Node base image.

### Deploying the image

The container takes its port from `PORT`, binds `0.0.0.0` and answers `/healthz`, which is what
Render, Google Cloud Run and Fly.io expect. On Render: a **Web Service** (not a Static Site — the
answer desk needs a server), runtime **Docker**, health check path `/healthz`, and `CHAT_API_KEY`
(plus `CHAT_BASE_URL` / `CHAT_MODEL`) as environment variables. Nothing else needs configuring;
the Dockerfile deliberately sets no `PORT` so the platform's own value wins.

The same server outside Docker:

```bash
npm run build:all && npm start
```

`PORT`, `HOST` and `STATIC_ROOT` are all overridable. Hashed assets under `/assets/` are served
immutable, frames and fonts for an hour, HTML revalidated; text files go out gzipped.

## Languages

- `src/i18n.tsx` holds every string a visitor can read, English next to Polish, and exposes `t()` for the page and `loc()` for data-side pairs. `src/format.ts` carries the formatters (money, dates, day counts) with no React in them, so the server can import the same ones.
- Data-side wording (body types, colours, inspection notes, price tiers, the address) lives in `src/data.ts` as `{ en, pl }` pairs.
- The switch sits in the masthead as a printed two-cell field; the choice is stored in `localStorage` and drives `<html lang>`, the document title and the meta description. English is the default when nothing is stored.
- The front desk answers in the page's language: the browser sends `lang` with each question, and `server/knowledge.ts` and `server/offline.ts` carry both editions of the system prompt and the canned answers.

## Front desk (AI assistant)

The **Front desk** button in the masthead (on a phone: "Ask the front desk" in the menu) opens a sheet where the visitor writes the question by hand and the answer comes back typed.

- `server/knowledge.ts` builds the system prompt out of `src/data.ts`, so the assistant can never quote a price other than the one on the page. The muzzle is in the same file: cars and the Hala 4 offer only, no booking promises, no invented terms, and no obeying "ignore your instructions".
- `server/chat.ts` is one handler over Web Request/Response: message length and count limits, a per-IP rate limit, and SSE streaming to the browser, translated from the provider's own stream.
- Thinking is asked off (`reasoning_effort: none`, overridable with `CHAT_REASONING`): a reasoning model bills its hidden thinking against `max_tokens`, and Gemini Flash spent 393 of 400 on it and cut the answer off mid-sentence. A provider that does not know the field is retried once without it.
- A busy free tier is not a failure: on 429, 500, 502, 503 or 504 the desk retries twice (after 0.4 s and 1.2 s) and then, if `CHAT_MODEL_FALLBACK` is set, asks the quieter model once. Only after that does it read from the price list. Gemini's newest flash alias is the most contested one, so a fallback like `gemini-2.5-flash` is worth setting.
- `api/chat.ts` is the same handler as a serverless function (Vercel, Netlify Functions v2). Under `npm run dev` a plugin in `vite.config.ts` serves it at the same `/api/chat`.
- The provider: the desk talks to anything that speaks the OpenAI chat-completions protocol, so it is three variables rather than a dependency — `CHAT_API_KEY`, and optionally `CHAT_BASE_URL` / `CHAT_MODEL`. The default is Groq's free tier (`openai/gpt-oss-120b`, no card, 1000 requests a day); Gemini and OpenRouter are commented out in `.env.example`. Copy that file to `.env` and paste your key. The key stays on the server; the browser only ever sees the answer text.
- A slip clipped to the bottom-right corner (`DeskNote` in `src/components/Assistant.tsx`) offers the desk once the hero is behind the visitor. It stays out of the way: hidden over the hero, while the desk is open and over the booking form, dismissible, and the dismissal is remembered in `localStorage` (`hala4:note`).
- **Without a key** (or when the API does not answer) the window falls back to `server/offline.ts`: it answers from the price list, turns down off-topic questions the same way the model does, and says plainly that the assistant is not connected.

## To replace

Everything in `src/data.ts` is an example: the fleet, prices, deposits, km limits, the address and the opening hours. The booking form has no backend (`src/sections/Booking.tsx`, the `submit` function).

## The film in lighter formats

`media-exports/` holds the source clips plus the Golf in versions for a plain `<video autoplay muted loop playsinline>`:

| file | size |
|---|---|
| original `golf8R.mp4` (1920 px, with sound) | 9.6 MB |
| `golf-1280.h264.mp4` | 2.5 MB |
| `golf-1280.vp9.webm` | 2.5 MB |
| `golf-1280.av1.webm` | 1.7 MB |
| `porownanie-960.gif` (kept only for comparison) | 44 MB |
