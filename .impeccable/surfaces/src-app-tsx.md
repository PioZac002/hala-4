---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Surface: Hala 4 landing page (src/App.tsx)

Mode: Persuade. Visitor: someone planning a weekend or short trip in a sporty/premium car, on phone or laptop. Job: decide this rental is honest and worth it, then send a date enquiry for a specific car. Proof on hand: the real Golf R walk-around footage only; fleet, prices and conditions are labeled placeholders. Constraint: booking must work with no WebGL and under reduced motion.

Memorable moment: the scroll walks around the car and the handover protocol fills itself in, photo by photo, ending in a signature and a red stamp. Four cars now have their own footage, and the strip under the film switches which one is standing in the hall — the same protocol, a new sheet.

Layout decision (after finish review): on desktop the five-photo inspection strip sits directly under the film, not in the protocol column. Product reason: each photo is taken by the film's shutter and drops the shortest distance into the strip, which reads as the contact strip attached to the photo field; it also lets the film keep a near-16:9 frame instead of a heavy portrait crop. The protocol column instead carries the deposit / km-limit / insurance row above the price, so conditions are visible in the first viewport.

Second decision (this build): questions are answered at a service window, not in a chat bubble. The masthead opens a sheet where the visitor writes in ballpoint and the assistant replies in print; it is scoped to cars and the offer, and it says out loud when it is answering from the price list instead of the model. Product reason: a floating rounded chat widget is the category default this world refuses, and the page already owes the visitor a way to ask before filling in the form.

Proof on hand (updated): four walk-around clips from the same hall — VW Golf R, Audi RS 3 Sportback, Porsche 911 GT3 RS, Škoda Octavia RS. Body, colour and inspection notes are read off the frames; everything else is still a labeled placeholder.

Unresolved: real prices, real address, sharp photographs for the five inspection points (the swap is built, the files are not), and the booking form backend (currently front-end only, says so).

## Direction contract

THESIS: The page is the car's handover protocol. Scrolling performs the walk-around and the form fills in as you go. It refuses the category arrangement of a dark full-bleed video under a glass booking bar with a gold accent.

OWN-WORLD: Carbonless form paper. A bright cool-white original sheet, then a pink carbon copy ("kopia dla najemcy") that owns the whole pricing and conditions stretch. One-colour printed form grid in print black: labeled field boxes, character boxes, checkboxes, crop-marked photo fields, perforation rules. Anything filled in, by us or by the visitor, is ballpoint-blue handwriting. Serial numbers and the stamp are stamp red. Archivo (width + weight axes) for print, a handwriting face only for ink.

STORY: The visitor watches a car being handed over properly, believes Hala 4 hides nothing (photos, printed price per day, deposit, km limit on the copy), picks a car and dates, and signs the enquiry.

FIRST VIEWPORT: Desktop: printed header strip (Hala 4 imprint, lettered section nav, red serial Nr, blue Rezerwuj). Left ~62%: WebGL photo field scrubbing the film, crop marks, caption "Fot. 1/5 — Przód". Right ~38%: the protocol column: H1 hook printed large, section A Pojazd with handwritten entries, top-view car diagram with the camera marker orbiting, five-box inspection list, "od 690 zł / doba" and the primary CTA. Mobile: film on top ~50svh, hook and CTA below, inspection list as one row.

FORM: Protokół zdawczo-odbiorczy, my own #1 grounded candidate (IMPECCABLE'S PICK), seed 2a1093b2. Signature interaction: scroll-scrub walk-around; each checkpoint fires a shutter in the shader and that frame drops into the protocol as a clipped photo; the end signs itself and lands the red WYDANO stamp. Motion grammar: pen strokes, stamp press, shutter flash; nothing floats in generically.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
