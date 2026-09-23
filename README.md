# Hala 4 — landing wypożyczalni (koncept)

Vite + React 19 + React Three Fiber. Hero to obchód auta przewijany scrollem w WebGL, który wypełnia protokół zdawczo-odbiorczy. Cztery auta mają własny film z hali i można je przełączać w locie.

```bash
npm install
npm run dev      # http://localhost:5174 (port z .claude/launch.json) albo domyślny port Vite
npm run build    # produkcyjny build do dist/
```

## Jak działa hero

- Każde auto z filmem ma własny katalog klatek: `public/frames/<auto>/d/` (120 klatek WebP 1600×900, desktop) i `public/frames/<auto>/m/` (80 klatek 1280×720, telefony) plus `poster.webp`. Sekwencja klatek zamiast wideo, bo daje płynne przewijanie w obie strony w każdej przeglądarce (także w Safari na iOS).
- `src/data.ts` trzyma dla każdego auta pole `film`: punkty obchodu (5 zdjęć), trasa aparatu na schemacie i kadrowanie na wąskich ekranach. Reszta hero (mapa scroll → czas filmu, przystanki na zdjęcia, moment podpisu) wylicza się z tych punktów w `src/hero/timeline.ts` — nowe auto nie wymaga strojenia ręcznie.
- `src/hero/frames.ts` ładuje klatki od zgrubnych do dokładnych i trzyma jeden magazyn na auto, więc powrót do obejrzanego już auta jest natychmiastowy.
- `src/hero/FilmField.tsx` – pełnoekranowy quad w R3F z własnym shaderem: miksowanie sąsiednich klatek, dopasowanie kadru, paralaksa od kursora, lekka aberracja przy szybkim scrollu, ziarno, błysk migawki i „wywołanie” zdjęcia przy starcie (przy zmianie auta szybsze). three.js ładuje się osobnym chunkiem.
- Bez WebGL klatki podmieniają się w zwykłym obrazku; przy `prefers-reduced-motion` protokół jest od razu wypełniony, a zdjęcia wybiera się ręcznie.

### Ostre zdjęcia zamiast klatek z filmu

Klatki niosą rozmycie ruchu z filmu. Każdy punkt obchodu można podmienić na prawdziwe zdjęcie: wrzuć plik do `public/frames/<auto>/stills/` (1600×900, ten sam kadr co film) i dopisz go w `src/data.ts`:

```ts
{ id: 'front', label: 'Przód', t: 0.3, note: '…', still: '/frames/rs3/stills/front.webp' }
```

Shader przy każdym przystanku przechodzi z klatki filmu na to zdjęcie (i z powrotem, gdy scroll rusza dalej), a strip oględzin, karta auta i wersja bez WebGL biorą je wprost.

### Nowe auto z filmem

1. Wrzuć plik wideo do `media-exports/` i dopisz go w `tools/build-frames.mjs` (`FILMS`).
2. `node tools/build-frames.mjs <auto>` — Swift + AVFoundation wycina dokładne klatki (na tej maszynie nie ma ffmpeg), `sharp` skaluje je lanczosem, wyostrza maską i zapisuje WebP razem z metryczką pochodzenia obok każdego pliku.
3. Dodaj `film` w `src/data.ts`: czasy pięciu punktów obchodu odczytane z klatek, trasa aparatu i kadrowanie.

## Okienko obsługi (asystent AI)

Przycisk **Obsługa** w nagłówku (na telefonie: „Zapytaj obsługi” w menu) otwiera arkusz, w którym gość pisze pytanie ręcznie, a odpowiedź przychodzi drukiem.

- `server/knowledge.ts` buduje prompt systemowy z `src/data.ts`, więc asystent nigdy nie poda ceny innej niż ta na stronie. Kaganiec jest w tym samym pliku: wyłącznie auta i oferta Hali 4, żadnych obietnic rezerwacji, żadnego zmyślania warunków, odporność na „zignoruj instrukcje”.
- `server/chat.ts` to jeden handler na Web Request/Response: limit długości i liczby wiadomości, limit zapytań na IP, strumieniowanie SSE do przeglądarki. Model: `claude-opus-5`.
- `api/chat.ts` to ten sam handler jako funkcja serwerowa (Vercel, Netlify Functions v2). W `npm run dev` obsługuje go plugin z `vite.config.ts` pod tym samym adresem `/api/chat`.
- Klucz: skopiuj `.env.example` do `.env` i wpisz `ANTHROPIC_API_KEY`. Klucz zostaje na serwerze; przeglądarka widzi tylko tekst odpowiedzi.
- **Bez klucza** (albo gdy API nie odpowiada) okienko przechodzi na `server/offline.ts`: odpowiada z cennika, na pytania spoza oferty odmawia tak samo jak model, i mówi wprost, że asystent nie jest podłączony.

## Do podmiany

Wszystko w `src/data.ts` jest przykładowe: flota, ceny, kaucje, limity km, adres i godziny. Formularz rezerwacji nie ma backendu (`src/sections/Booking.tsx`, funkcja `submit`).

## Film w lżejszych formatach

`media-exports/` zawiera filmy źródłowe oraz Golfa w wersjach do zwykłego `<video autoplay muted loop playsinline>`:

| plik | rozmiar |
|---|---|
| oryginał `golf8R.mp4` (1920 px, z dźwiękiem) | 9,6 MB |
| `golf-1280.h264.mp4` | 2,5 MB |
| `golf-1280.vp9.webm` | 2,5 MB |
| `golf-1280.av1.webm` | 1,7 MB |
| `porownanie-960.gif` (tylko dla porównania) | 44 MB |
