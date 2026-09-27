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

### Adding a filmed car

1. Put the clip in `media-exports/` and add it to `FILMS` in `tools/build-frames.mjs`.
2. `node tools/build-frames.mjs <car>` — Swift + AVFoundation cuts the exact frames (this machine has no ffmpeg), `sharp` scales them with lanczos3, runs an unsharp mask and writes WebP together with a provenance sidecar next to every file.
3. Add the `film` to `src/data.ts`: the times of the five inspection points read off the frames, the camera route and the crop.

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
- `api/chat.ts` is the same handler as a serverless function (Vercel, Netlify Functions v2). Under `npm run dev` a plugin in `vite.config.ts` serves it at the same `/api/chat`.
- The provider: the desk talks to anything that speaks the OpenAI chat-completions protocol, so it is three variables rather than a dependency — `CHAT_API_KEY`, and optionally `CHAT_BASE_URL` / `CHAT_MODEL`. The default is Groq's free tier (`openai/gpt-oss-120b`, no card, 1000 requests a day); Gemini and OpenRouter are commented out in `.env.example`. Copy that file to `.env` and paste your key. The key stays on the server; the browser only ever sees the answer text.
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
