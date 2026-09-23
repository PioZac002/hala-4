# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript + React Three Fiber (user asked for R3F explicitly). Hero is a WebGL scroll-scrubbed video (user chose it over a plain loop or plain `<video>`). One server-side function only — `/api/chat`, the answer desk (Claude API, key server-side, serverless-style handler shared by the Vite dev server and the deployed function). The booking form is still front-end only.

## Users

People in Poland who want to rent a sporty or premium car for a weekend, an occasion, or a few days of driving pleasure rather than pure transport. They are comparing rental options on a phone or laptop and deciding whether this place is trustworthy and worth the price. Polish-language page.

## Product Purpose

Concept car-rental brand (portfolio piece, not a real company). Brand name is invented: **Hala 4**. The landing page must make the visitor want a specific car and start a booking enquiry (car + dates).

## Positioning

Concept assumption: cars are handed over inside the company's own lit hall, with a walk-around of the car before you drive off — not in a parking lot. The hero footage (a studio walk-around ending in the driver's seat) is that handover, shown literally.

## Operating Context

Visitor picks a car from the fleet, checks price per day/weekend, deposit and km limit, then sends a date enquiry. Mobile is a primary context.

## Capabilities and Constraints

- Fleet of several cars; four of them have footage and can be walked around in the hero, the rest have no imagery.
- The assistant answers only about the cars and the offer, from `src/data.ts`; it never promises a booking, never invents terms, and says so when the model is not connected (it then answers from the price list).
- Prices, deposits, km limits, and fleet entries are placeholders, clearly marked in code for replacement.
- The hero is heavy (video decode + WebGL); it must degrade gracefully (reduced motion, no WebGL, slow network).

## Brand Commitments

None beyond the invented name. Must not imitate any real rental company. Car manufacturer names are used only to describe fleet models.

## Evidence on Hand

- Four walk-around clips, all 10 s, 1920×1080, 24 fps, all shot in the same white industrial hall with linear LED lights, all following the same arc: exterior orbit → door → cockpit.
  - `golf8R.mp4` (source: ~/Downloads): red VW Golf 8 R.
  - `Camera_panning_around_Audi_RS3_…mp4`: green (Kyalami) Audi RS 3 Sportback.
  - `Camera_filming_Porsche_in_garage_…mp4`: grey Porsche 911 GT3 RS — a GT3 RS, not the 718 Cayman the fleet list first assumed.
  - `Skoda_Octavia_RS_camera_tour_…mp4`: red Škoda Octavia RS liftback (not a combi).
  Body style, colour and every inspection note in `src/data.ts` are read off these frames.
- The clips carry motion blur; frames are sharpened on extraction, and each inspection point can be swapped for a real photograph (`Checkpoint.still`).
- No testimonials, reviews, customer counts, press, or awards exist. Do not fabricate them.

## Product Principles

1. Show the car, not the company: the footage and the machine carry the page.
2. Price and conditions are never hidden; a visitor must see cost, deposit and limit before enquiring.
3. Every placeholder is honest and swappable; no fake proof.
4. The spectacle must never block the task: booking works without WebGL.

## Accessibility & Inclusion

WCAG AA contrast, `prefers-reduced-motion` respected (no scrubbing, static frames instead), keyboard-usable booking form.
