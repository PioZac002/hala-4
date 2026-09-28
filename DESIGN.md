---
name: Hala 4
description: A car-rental handover protocol printed on carbonless form paper, filled in with ballpoint ink.
colors:
  paper: "#f9fbfc"
  paper-2: "#eef1f4"
  hall: "#e7eaed"
  pink: "#f7dbe3"
  pink-2: "#efc8d4"
  print: "#17171b"
  print-2: "#4a4a52"
  print-pink: "#5b2c3c"
  rule-soft: "rgb(23 23 27 / 0.2)"
  ink: "#1e3fae"
  ink-deep: "#152f86"
  ink-wash: "rgb(30 63 174 / 0.1)"
  stamp: "#cc2638"
  carbon: "#3f4a9c"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.25rem, min(4.3vw, 7.2svh), 5rem)"
    fontWeight: 800
    lineHeight: 0.93
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 66"
  display-section:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(3.25rem, 8vw, 6rem)"
    fontWeight: 850
    lineHeight: 0.86
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(26px, 2.4vw, 34px)"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "'wdth' 66"
  figure:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(34px, 3.1vw, 46px)"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "'tnum'"
    fontVariation: "'wdth' 68"
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum'"
  lead:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "11.5px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 85"
  button:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 88"
  ink:
    fontFamily: "Mynerve, Bradley Hand, Segoe Print, cursive"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0"
rounded:
  none: "0px"
  btn: "2px"
spacing:
  pad: "clamp(16px, 2.2vw, 32px)"
  box-label-top: "30px"
  box-inset: "18px"
  layout-gap: "clamp(16px, 2vw, 28px)"
  section-top: "clamp(80px, 11vw, 150px)"
  section-bottom: "clamp(56px, 7vw, 96px)"
  mast-h: "56px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.btn}"
    padding: "12px 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ink-deep}"
    textColor: "{colors.paper}"
  button-small:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.btn}"
    padding: "8px 14px"
    height: "38px"
  box:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "30px 18px 18px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.ink}"
    rounded: "{rounded.none}"
    padding: "10px 14px"
  field-focus:
    backgroundColor: "{colors.ink-wash}"
  char-cell:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    width: "26px"
    height: "36px"
  picker:
    backgroundColor: "{colors.pink-2}"
    textColor: "{colors.carbon}"
    padding: "8px 12px 6px"
  masthead:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.print}"
    height: "{spacing.mast-h}"
---

# Design System: Hala 4

## Overview

**Creative North Star: "The Handover Protocol"**

Every surface is a printed rental form, not a web page. The page is a protocol: a bright cool-white original sheet, then a pink carbon copy for the renter, then a perforated tear-off stub. Structure is a one-colour printed grid in print black: labeled field boxes, character cells, checkboxes, crop marks around photo fields, perforation and fold rules. Content arrives the way a form gets filled in: ballpoint-blue handwriting written in by pen, small photos clipped to the sheet, a signature drawn stroke by stroke, and a red stamp pressed down at the end.

Density is that of a real form: tight, ruled, labeled, legible. Type does the heavy work. Archivo's width axis runs from very condensed display lettering (62–70%) to slightly condensed labels (85–92%). Mynerve is the only handwriting face and appears only where something has been filled in. Colour is functional. Black is the printed form, blue is anything written into it, red is anything official (serial numbers, the stamp, error notes), and pink is the carbon copy.

The world rejects the usual rental arrangement: a dark full-bleed video under a glass booking bar with a gold accent. There is no dark mode, no glass, no gold, and no floating card UI.

**Key Characteristics:**
- Two paper stocks: cool-white original (`paper`) and pink carbon copy (`pink`), joined by a perforated edge.
- One-colour print grid: 1px rules, 1.5–2px rules for heavy dividers, labels sitting inside the top-left corner of each box.
- Three inks with fixed jobs: print black, ballpoint blue, stamp red.
- Condensed, heavy Archivo for print; Mynerve handwriting only for filled-in values.
- Motion comes from the physical act (pen stroke, shutter flash, photo drop, stamp press), never a generic fade-up.

## Colors

A printed form on two paper stocks, filled in with three inks that never trade jobs.

### Primary
- **Ballpoint Blue** (`ink`): anything written into the form, by Hala 4 or by the visitor: handwritten values, ticks, circled choices, the signature, the dotted walk-around trail, the camera marker. It also fills the primary button, the focus outline, text selection, and the caret, because pressing the button means signing.
- **Pressed Ballpoint** (`ink-deep`): only for the primary button's hover state.
- **Ink Wash** (`ink-wash`): the tint on a focused field, the next character cell, and a hovered or selected register row. It shows where the pen is.

### Secondary
- **Stamp Red** (`stamp`): the serial number ("Nr 000417"), the WYDANO/stamp mark, handwritten error annotations, the error outline on a field, and the confirmation box border. It is official and rare.

### Tertiary
- **Carbon Violet** (`carbon`): blue ink as it arrives on the pink copy. It is softer and violet, with a sub-pixel off-register text shadow and a 0.2px blur. It is used only inside the pink copy.

### Neutral
- **Original Sheet** (`paper`): the page background, box and field interiors, the masthead, and the stub.
- **Photo Mat** (`paper-2`): empty photo fields, the car card photo well, the diagram glass, and the scrollbar track.
- **Hall Light** (`hall`): the film frame before the footage develops. The shader's "developing" colour matches it.
- **Carbon Pink** (`pink`): the full background of the renter's copy (pricing and conditions).
- **Pink Field** (`pink-2`): an input field printed on the pink copy (the car picker).
- **Print Black** (`print`): all printed text, rules, checkboxes, crop marks, and the diagram line art.
- **Print Grey** (`print-2`): labels, leads, footnotes, and secondary figures on the white sheet.
- **Copy Maroon** (`print-pink`): secondary print on the pink copy (labels, leads, edge text). Its 30–35% alpha is used for rules on the pink copy.
- **Hairline** (`rule-soft`): the soft row divider inside boxes, tables, and lists on the white sheet.

### Named Rules
**The Three Inks Rule.** Black prints, blue writes, red certifies. A value typed or chosen by a person is always blue. A number or mark issued by the company is always red. Nothing else gets colour.

**The Carbon Rule.** On the pink copy, blue ink turns into `carbon` with its off-register shadow, and grey print turns into `print-pink`. Never put pure `ink` handwriting on pink.

## Typography

**Print Font:** Archivo, variable (wdth 62–125, wght 100–900), self-hosted (with Helvetica Neue, Arial)
**Ink Font:** Mynerve (with Bradley Hand, Segoe Print, cursive)

**Character:** Archivo is the typesetter's form face. Heavy and condensed at display sizes, it reads like a printed form title. At label sizes it is small, semi-condensed, and set in capitals. Mynerve is a single person's ballpoint hand and never appears as print. The body text uses tabular figures throughout, so prices and dates line up the way they do on a form.

### Hierarchy
- **Display** (800, wdth 66, clamp(2.25rem, min(4.3vw, 7.2svh), 5rem), 0.93): the hero hook in the protocol column. Balanced wrap.
- **Section Display** (850, wdth 62, clamp(3.25rem, 8vw, 6rem), 0.86, uppercase): section titles (Flota, Cennik, Warunki, Rezerwacja), set like a form title.
- **Headline** (800, wdth 66, clamp(26px, 2.4vw, 34px), 1, uppercase, 2px rule beneath): sub-sheet titles such as Wydanie / Zwrot.
- **Figure** (800, wdth 68, clamp(34px, 3.1vw, 46px), 1): prices and totals, followed by a 15px `print-2` unit ("za dobę"). Step numbers use the same style at wdth 62, 40px.
- **Title** (700, 18px): step headings inside lists.
- **Body** (400, 16px, 1.5) and **Lead** (400, 17px, 1.5, `print-2`, max 58ch): running text. Step descriptions cap at 46ch.
- **Label** (600, wdth 85, 11.5px, 0.04em, uppercase, `print-2`): the printed caption of every box, field, table column, and definition term.
- **Ink** (Mynerve 400, 19–24px): filled-in values: field entries, character cells, the car model, availability, pins on the diagram.
- **Small print** (400–650, 12–15px): the masthead's document line and links, the film caption, the car picker and the answer desk's printed replies. It is the form's fine print, and it never grows into body size.

### Named Rules
**The Printed / Written Rule.** If it was typeset in advance, it's Archivo. If someone filled it in, it's Mynerve in ink blue. Never set a heading, button, or label in Mynerve. Never set a user value in Archivo.

**The Width Axis Rule.** Bigger means narrower. Display runs wdth 62–70, buttons and picks 88–92, labels 85, and body 100. Don't set a large heading at normal width.

## Layout

The page is a stack of sheets, not a grid of cards. Every sheet section is capped at 1480px, with side padding `pad` (clamp(16px, 2.2vw, 32px)) and vertical padding clamp(80px, 11vw, 150px) above and clamp(56px, 7vw, 96px) below. Sections are separated by 2px print rules (the white sheet), a perforated edge (entering the pink copy), and a 1.5px dashed perforation with a scissors mark (the tear-off stub).

The masthead is a fixed 56px strip (52px under 860px) divided into printed cells by 1px vertical rules. Content layouts are asymmetric two-column form spreads, ratio about 1.5 : 1 (a wide register or field grid next to a narrower sticky summary or card), with gaps of clamp(16px, 2vw, 28px). The side card and the booking summary stick at `mast-h + 20px`.

The hero is a pinned scroll protocol (600svh tall, 520svh on mobile). The desktop grid has the film on the left (1.7fr) and the protocol column on the right (min 420px), separated by a printed column rule. The five-photo inspection strip sits directly under the film. The protocol column carries the hook, the vehicle box with the top-view diagram, a deposit / km-limit / insurance row, the price, the CTA, and the sign-off.

The single breakpoint is 860px. Below it, every spread collapses to one column. The film takes the top of the pinned view. The vehicle diagram becomes a small overlay on the film. The inspection list stays as a single five-up row. Masthead navigation becomes a drop-down sheet. There are secondary height breakpoints: at 800px and 760px, the hero lead is hidden before anything else gives way.

Under `prefers-reduced-motion`, the protocol stops scrolling and shows fully filled in. Photos are picked by hand.

## Elevation & Depth

The form is flat. Depth appears only where a physical object sits on the paper: a photograph clipped to the sheet, or the paper clip itself. There are no card shadows, no elevated panels, and no hover lift. Box hierarchy comes from rules: 1px boxes, 1.5px table heads and heavy dividers, and 2px section and masthead rules.

### Shadow Vocabulary
- **Clipped print** (`box-shadow: 0 3px 8px rgb(0 0 0 / 0.18)`, with a 3px white border and a -2deg / +1.6deg alternating tilt): inspection photos dropped into the strip.
- **Card print** (`box-shadow: 0 4px 12px rgb(0 0 0 / 0.16)`, with a 4px white border and a -1.2deg tilt): the photo on the car card, and the clipped slip in the corner of the page.
- **Paper clip** (`filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.25))`): the wire clip holding each photo.
- **Current ring** (`box-shadow: 0 0 0 3px paper, 0 0 0 5px ink`): the currently selected inspection photo. This is a state, not elevation.

### Named Rules
**The Objects-Only Rule.** Only a physical object lying on the form casts a shadow (a photo print, a clip). Printed boxes, buttons, and panels never do.

## Shapes

The printed grid is square: boxes, fields, character cells, checkboxes, and tables all use 0 radius. The primary button uses a barely softened 2px corner. Only the stamp is rounded (outer rect rx 9, inner rx 5), because it is a rubber stamp. Recurring geometry includes:

- L-shaped crop marks (18px, 1px) outside the corners of photo fields.
- Dashed borders on empty photo slots.
- A diagonal-hatched bar for price tiers.
- A dotted blue walk-around trail.
- A scalloped perforation where the pink copy begins.
- A dashed fold line between the two halves of a process.

## Components

### Buttons
Printed in ballpoint blue: pressing it is the act of signing.
- **Shape:** near-square (2px).
- **Primary:** `ink` fill, `paper` text, Archivo 700 wdth 88, 15px, uppercase, 0.04em tracking. Min height 48px, padding 12px 20px, 12px gap to an optional trailing arrow icon.
- **Hover / Focus / Active:** background shifts to `ink-deep` (160ms), and the trailing arrow moves 3px right. Active presses down 1px. Focus uses the global 2px `ink` outline, offset 3px.
- **Small:** 38px min height, padding 8px 14px, 13px (masthead "Rezerwuj").
- **Text link:** `ink`, 600, a 1.5px underline offset 5px, thickening to 2.5px on hover.

### Cards / Containers (the printed box)
- **Corner Style:** square.
- **Background:** the sheet itself (`paper`, or `pink` on the copy).
- **Shadow Strategy:** none (see Elevation).
- **Border:** 1px `print`.
- **Internal Padding:** 30px top, 18px sides and bottom. The box label is absolutely placed 7px from the top and 10px from the left, inside the frame, like a printed form caption. Rows inside a box are divided by `rule-soft` hairlines, or maroon hairlines at 30% on the pink copy.

### Inputs / Fields
- **Style:** fields tile into a shared grid with collapsed 1px `print` borders. Each cell shows a printed label above a borderless input, and the value is written in Mynerve `ink` at 24px (22px on mobile). Dates and phone numbers use character cells: 26×36px boxes with 1px `print` borders that overlap by 1px, with printed separators in between.
- **Focus:** the cell fills with `ink-wash` and gets a 2px inset `ink` ring. The next character cell gets `ink-wash` plus a 3px `ink` underline.
- **Error:** a 2px inset `stamp` ring, plus a handwritten `stamp`-red Mynerve annotation (17px) explaining the problem.
- **Select:** a borderless select with a hand-drawn blue chevron. On the pink copy, the picker is a `pink-2` field with a 1px rule and a 2px `ink` ring on focus.
- **Checkbox:** a 16px (20px in forms) square with a 1.5px `print` border and a `paper` fill. The check is a blue pen tick drawn over it that overshoots the box.

### Navigation
- **Masthead:** a fixed `paper` strip with a 2px bottom rule, divided into cells by 1px rules. The cells are: the "HALA 4" mark (900, wdth 62, 27px, uppercase) with a two-line trade label, the document title with its red serial, the section links, and the small ink button.
- **Links:** 14px, 600. On hover, a 2px `ink` underline draws in from the left (260ms).
- **Mobile:** a "Menu / Zamknij" text toggle opens a full-width drop-down sheet of 17px links, each separated by a hairline.

### Register (table)
- The fleet register is a ruled table: 1.5px rule under the head, `rule-soft` row lines, and a numbered first column in `print-2`.
- Rows tint `ink-wash` on hover or selection. The chosen model is circled by hand in blue: an SVG ellipse drawn with a 520ms pen stroke.

### Pen Marks (signature component)
- **Tick:** a single blue stroke (2.6 width, round caps), drawn by dash offset over 380ms. Undrawn ticks stay hidden, so a round cap never leaves a dot.
- **Signature:** a blue freehand path drawn over 1.2s, followed by an underline dash, sitting on a 1px rule labeled with the signer.
- **Stamp:** a double-bordered rubber-stamp rectangle in `stamp` red with a condensed 900 word and a letterspaced meta line. It uses a turbulence filter for uneven ink and `multiply` blending, and sits at -8deg. It presses in from 1.45× scale over 420ms after the signature finishes.
- **Handwriting reveal:** new ink text is revealed left to right with a clip-path over 900ms.

### Photo Field and Inspection Strip (signature component)
- The WebGL film sits in a `hall`-grey frame with crop marks outside it and a printed caption beneath ("Fot. 1/5 · Przód", with a timecode on the right).
- The frame develops out of the paper colour on load. Each checkpoint fires a white shutter flash.
- The captured frame drops into a five-up 4:3 strip: it falls 26px from 1.3× scale with a brightness flash, then settles tilted and clipped.
- Empty slots show a dashed border and a faint condensed numeral. Each slot is labeled by a checkbox and a printed caption.
- At each stop the moving frame cross-fades to the sharp photograph of that angle when one exists (0.28 s either side of the point), so the visitor never studies a motion-blurred frame. Without one it holds the film's own frame.

### Car Picker (Auto w hali)
- A printed strip under the film caption, split off by a `rule-soft` hairline: the label "AUTO W HALI" in the standard label style, then the cars we have a walk-around of, set in Archivo 650 wdth 92 at 14px.
- The chosen car is circled by hand in ballpoint blue — the same 520 ms pen stroke as the fleet register, at a slightly tighter inset. Nothing else marks selection: no fill, no underline, no tick.
- Choosing a car re-develops the film (2.6×, brisk — the first sheet of the session is the slow one), rewrites the vehicle box, the conditions row and the price, and swaps all five inspection photos. The scroll position, and therefore how far the protocol is filled in, is kept.
- On phones the label is dropped and the row scrolls sideways; names stay printed, never truncated.

### Answer Desk (Okienko obsługi)
- A sheet pushed down from the masthead: full `paper`, 1px print border, 2px bottom rule, no radius, no shadow — it is a sheet, not a floating panel. 430px wide on desktop, full width on phones, anchored under the fixed masthead.
- The exchange is printed as a form: each turn carries a small red-free label ("PYT. 01", "ODP. 01") in the label style, the question in Mynerve `ink` at 20px, the answer in printed Archivo at 15px, rows divided by `rule-soft` hairlines.
- While an answer streams in, a solid `print` bar blinks at the end of the text — a printer, not a cursor.
- The opening state offers three questions in dashed-bordered rows, which tint `ink-wash` on hover. The question field is a standard form field; its send button is `ink`, and before anything is written it drops to an unfilled outline rather than a grey slab.
- Errors are a handwritten `stamp`-red note, as everywhere else on the form. When the assistant is answering from the price list instead of the model, a `print-pink` footnote says so.

### Clipped Slip (the desk's only floating element)
- A 268px note of `paper` with a 1px print border, tilted -1.2deg, with a paper clip hooked over its top edge and the card-print shadow. It is a slip of paper lying on the form, which is the only thing this world lets float; it is never a rounded bubble and never a panel.
- Contents, top to bottom: the name in the label style ("DORADCA AI" / "AI ADVISER"), one printed sentence saying what it answers, a `rule-soft` hairline, then the action in `ink` with the trailing arrow, and a small `print-2` "Not now" opposite it.
- It drops in once — 12px down, 420 ms on the standard ease — and then holds still. Nothing pulses, nothing reappears.
- Restraint is part of the component: it waits until the hero is behind the visitor, hides while the desk is open and while the booking form is on screen, and once waved off it stays away (remembered per visitor). The masthead keeps the permanent way in.
- On phones it drops the sentence and keeps the name and the action, so it covers as little of the page as possible.

## Do's and Don'ts

### Do:
- **Do** build new surfaces from printed boxes: a 1px `print` frame, with the label inside the top-left corner (11.5px, 600, wdth 85, uppercase, 0.04em).
- **Do** write every user-entered or chosen value in Mynerve `ink`, and switch it to `carbon` with the off-register shadow on the pink copy.
- **Do** keep red for serial numbers, the stamp, and errors. Report errors as a red handwritten note plus a 2px inset `stamp` ring on the field.
- **Do** separate sections with print devices: 2px rules, the scalloped perforation, dashed perforation or fold lines.
- **Do** tie motion to a physical act (pen stroke, shutter, drop, stamp press), easing with `cubic-bezier(0.16, 1, 0.3, 1)`, and collapse it to the finished state under reduced motion.
- **Do** keep all figures tabular and set prices as a condensed Figure followed by a small grey unit.

### Don't:
- **Don't** build the dark full-bleed video under a glass booking bar with a gold accent.
- **Don't** give printed boxes, buttons, or panels shadows or hover lift. Shadows belong only to photo prints and the paper clip.
- **Don't** round the form grid. Boxes, fields, cells, and tables stay square. Only the button's 2px corner and the rubber stamp soften.
- **Don't** use Mynerve for anything printed (headings, labels, buttons, navigation), and don't set user values in Archivo.
- **Don't** add an accent hue beyond the three inks and two paper stocks. The only other colours belong to physical objects: the white border on photo prints and the steel grey of the paper clip.
