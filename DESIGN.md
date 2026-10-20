---
name: FloraHearth
description: A living herbarium for a US home garden, from bed plan to pantry shelf.
colors:
  hemlock-ink: "#183e25"
  hemlock-ink-deep: "#102b1a"
  pressed-leaf: "#047857"
  new-shoot: "#10b981"
  new-shoot-bright: "#34d399"
  new-shoot-ink: "#05140b"
  herbarium-paper: "#f5f8f5"
  specimen-white: "#ffffff"
  sage-wash: "#edf3ee"
  sage-press: "#e1ede3"
  sage-hairline: "#d6e2d8"
  heading-ink: "#102417"
  body-moss: "#284030"
  caption-lichen: "#3f5847"
  obsidian-loam: "#0a130e"
  spruce-card: "#121e17"
  spruce-wash: "#17271e"
  spruce-press: "#1e3528"
  night-hairline: "rgba(255, 255, 255, 0.08)"
  mist-heading: "#f3f7f4"
  mist-body: "#cad8ce"
  lichen-caption: "#8cb099"
  caution-wash: "#fef3c7"
  caution-ink: "#92400e"
  frost-alert: "#c70036"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  body-secondary:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "0.05em"
  data:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.5
    fontFeature: "\"tnum\" 1"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.hemlock-ink}"
    textColor: "{colors.specimen-white}"
    typography: "{typography.body-secondary}"
    rounded: "{rounded.lg}"
    padding: "6px 14px"
  button-primary-hover:
    backgroundColor: "{colors.hemlock-ink-deep}"
  button-primary-dark:
    backgroundColor: "{colors.new-shoot}"
    textColor: "{colors.new-shoot-ink}"
  button-secondary:
    backgroundColor: "{colors.sage-wash}"
    textColor: "{colors.hemlock-ink}"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
  card:
    backgroundColor: "{colors.specimen-white}"
    rounded: "{rounded.xl}"
    padding: "20px"
  card-dark:
    backgroundColor: "{colors.spruce-card}"
  input:
    backgroundColor: "{colors.specimen-white}"
    textColor: "{colors.heading-ink}"
    typography: "{typography.body-secondary}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  specimen-label:
    backgroundColor: "{colors.sage-wash}"
    textColor: "{colors.body-moss}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  nav-item-active:
    backgroundColor: "{colors.hemlock-ink}"
    textColor: "{colors.specimen-white}"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
---

# Design System: FloraHearth

## Overview

**Creative North Star: "The Living Herbarium"**

FloraHearth is laid out like a well-kept herbarium: each crop, bed, jar and reading is a catalogued specimen with a clear name, a label and a place. Plant names are set in a literary serif, the way they would be written on a specimen sheet; labels and measurements are set in a small monospace, like the typed tags pinned beside them; everything else is a quiet, legible sans. The palette is drawn from the same cabinet: herbarium paper and sage washes by day, deep spruce and loam by night, with Hemlock Ink and New Shoot greens marking what can be acted on.

The mood is calm, precise and trustworthy. This is reference a gardener acts on (whether to cover tomatoes tonight, which canner a crop needs), so nothing shouts and nothing is decorative for its own sake. Density is high but ordered: small, consistent roles carry a lot of information, and amber and rose appear only when something genuinely needs attention. Depth is flat and tonal; hierarchy comes from surface steps, hairline borders and type, not from shadows.

Dark mode is the default and the night-garden face of the same herbarium; light mode is the paper face. Both must hold the same contrast and meaning.

**Key Characteristics:**
- Serif names, monospace labels and data, sans everything else
- Flat tonal surfaces with hairline borders; shadows only on dialogs
- Green means "act here"; amber means caution; rose means danger or loss
- Gently rounded, catalogue-card shapes (12–16px corners)
- Dark-first, with an equally careful light theme

## Colors

A restrained conifer-and-paper palette: two greens for action, a family of sage and spruce neutrals for surfaces and text, and two status colours used sparingly.

### Primary
- **Hemlock Ink** (`hemlock-ink`): the near-black green of primary buttons, the active navigation item and brand marks in light mode. Its hover is **Hemlock Ink Deep** (`hemlock-ink-deep`).
- **Pressed Leaf** (`pressed-leaf`): green text for links, positive values and "act here" emphasis on light surfaces.

### Secondary
- **New Shoot** (`new-shoot`): the mint that takes over primary actions in dark mode, always with **New Shoot Ink** (`new-shoot-ink`) text on it. **New Shoot Bright** (`new-shoot-bright`) is its hover and the accent for green text on dark surfaces.

### Tertiary
- **Caution Wash / Caution Ink** (`caution-wash`, `caution-ink`): amber for advisories, frost watches, sun and heat, estimates, and anything that needs a second look.
- **Frost Alert** (`frost-alert`): rose for frost and freeze warnings, destructive actions and conflicts (antagonistic companions, low viability).

### Neutral
- **Herbarium Paper** (`herbarium-paper`): the light canvas behind everything.
- **Specimen White** (`specimen-white`): light cards, dialogs and inputs.
- **Sage Wash / Sage Press** (`sage-wash`, `sage-press`): subtle and active surfaces in light mode (filters, chips, pressed states, hover).
- **Sage Hairline** (`sage-hairline`): borders and dividers in light mode.
- **Heading Ink / Body Moss / Caption Lichen** (`heading-ink`, `body-moss`, `caption-lichen`): the three light-mode text steps.
- **Obsidian Loam** (`obsidian-loam`): the dark canvas.
- **Spruce Card / Spruce Wash / Spruce Press** (`spruce-card`, `spruce-wash`, `spruce-press`): dark cards, subtle surfaces and hover/active surfaces.
- **Night Hairline** (`night-hairline`): borders and dividers in dark mode.
- **Mist Heading / Mist Body / Lichen Caption** (`mist-heading`, `mist-body`, `lichen-caption`): the three dark-mode text steps.

### Named Rules
**The Green Means Go Rule.** Hemlock Ink and New Shoot mark things the user can act on, or confirmed good news. Never use them as decoration or as a section background.

**The Status Colours Are Rare Rule.** Amber and rose appear only when the content needs attention. If a screen is mostly amber, the warning has lost its meaning.

**The Two Faces Rule.** Every colour pairing must pass WCAG AA in both themes, including hover and pressed states. White text never sits on a mid-tone (500–600) green, amber or rose; use the 700+ shade, or dark text on a light tint.

## Typography

**Display Font:** Newsreader (with Georgia, serif)
**Body Font:** Plus Jakarta Sans (with system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (with monospace)

**Character:** a literary serif for names, like handwriting on a specimen sheet, paired with a neutral sans for reading and a typewriter-like mono for labels and measurements.

### Hierarchy
- **Display** (800, 1.875rem, 1.15): the Dashboard welcome heading and hero moments only.
- **Headline** (700, 1.5rem, 1.25): each tab's page title (the `<h1>`).
- **Title** (700, 0.9375rem, 1.3): card and section headings, crop and bed names.
- **Body** (400, 0.9375rem, 1.55): guidance, descriptions and form text. Keep prose to about 65 characters per line (`max-inline-size: 62ch`).
- **Body Secondary** (500, 0.8125rem, 1.5): table cells, captions, secondary UI text. This is the most common size.
- **Label** (700, 0.75rem, 0.05em, uppercase): specimen-style labels, badges, table headers. 12px is the floor for any text.
- **Data** (600, 0.8125rem, tabular numerals): temperatures, dates, ppm, prices, quantities.

### Named Rules
**The Specimen Label Rule.** Monospace is for labels and measured data only. Plant and bed names are never monospace; they are serif.

**The 12px Floor Rule.** No text below 0.75rem. Inputs render at 16px on touch screens so iOS never zooms on focus.

**The Real Weights Rule.** Use only weights that are actually loaded (all three families load as variable fonts, 400–800). Italics come from Newsreader, the only family with an italic loaded: Latin names and quoted lore are Newsreader italic.

## Layout

Content sits in a centred column up to 1280px wide (`max-w-7xl`) with 16px side gutters on phones and 24px from 640px up. Screens are built from catalogue cards in responsive grids: one column on phones, two from 640px, three or four from 768–1024px for crop and pair grids. Spacing runs on a 4px base, mostly 8px (`gap-2`) inside groups, 16px between cards and 24px between sections.

On phones a fixed bottom bar holds the five main tabs and the All Views menu; from 1024px a horizontal tab row sits under the header instead. The header wraps rather than overflowing, and the app reflows without sideways scrolling at 320px and at 200% text. Touch screens get 44px controls; desktop keeps its denser 24px minimum. The installed iPhone app respects safe areas (status bar and home indicator).

## Elevation & Depth

Flat and tonal. Surfaces separate by stepping through the neutral family (paper → white card → sage wash in light; loam → spruce card → spruce wash in dark) and by 1px hairline borders. Cards carry at most a whisper shadow (`shadow-xs`), which is barely visible and only softens the edge. Real elevation belongs to dialogs and the update banner, which sit above a dimmed page. There is no glass or blur on navigation or overlays.

### Shadow Vocabulary
- **Whisper** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`, Tailwind `shadow-xs`): the default edge of cards and buttons.
- **Dialog** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)`, Tailwind `shadow-2xl`): modal dialogs only.

### Named Rules
**The Flat-By-Default Rule.** Hierarchy comes from tone, borders and type. A new shadow needs a reason: it must mean "this is above the page".

## Shapes

Gently rounded catalogue cards. Controls use 12px corners (`rounded-xl`, the most common), cards 16px (`rounded-2xl`), large panels and the Dashboard hero 24px (`rounded-3xl`), small chips and labels 6–8px, and round only for dots, avatars and toggles. Borders are always 1px hairlines; there are no thick accent borders or side stripes.

## Components

### Buttons
Labelled and orderly: every button names its action in words, with an icon only to support the word.
- **Shape:** gently rounded (12px).
- **Primary:** Hemlock Ink with white text in light mode; New Shoot with New Shoot Ink text in dark mode. Hover darkens (light) or brightens (dark).
- **Secondary:** Sage Wash or Specimen White with a hairline border and Hemlock Ink text.
- **Destructive:** rose-700 with white text, used only behind a confirmation.
- **Hover / Focus:** colour shifts over 150ms; a 2px focus ring in Pressed Leaf / New Shoot Bright with a 2px offset on every focusable control.

### Chips
- **Style:** specimen labels: monospace, uppercase, 12px, on a sage or spruce wash with a 6px corner.
- **State:** filters show their selected state with the primary fill (Hemlock Ink / New Shoot); relationship tags use green for beneficial and rose for antagonistic.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Specimen White (light) or Spruce Card (dark).
- **Shadow Strategy:** whisper only (see Elevation & Depth).
- **Border:** 1px Sage Hairline / Night Hairline; hover and focus-within change the border to the green accent.
- **Internal Padding:** 16–20px.
- **Clickable cards:** an `<article>` whose title is a stretched button. The whole card is the hit area, and the item name is the accessible name.

### Inputs / Fields
- **Style:** 1px hairline border, white (light) or deep spruce (dark) fill, 12px corners, 13px text (16px on touch screens).
- **Focus:** border and ring change to the green accent.
- **Error / Disabled:** errors in rose text beside the field; disabled at reduced opacity.

### Navigation
- **Desktop:** a horizontal row of tab buttons under the header; the active tab is filled with Hemlock Ink / New Shoot, inactive tabs are body-text colour with a sage hover.
- **Phone:** a fixed bottom bar of five icon-plus-label tabs plus All Views, which opens the categorised directory.
- **Behaviour:** each tab has its own `?tab=` URL and page title, and focus moves to its `<h1>` on change.

### Status Banners
Amber for estimates and advisories, rose for frost alerts and storage failures, green for confirmations. Each names the problem and the next step in one or two sentences and uses `role="status"` or `role="alert"`.

## Do's and Don'ts

### Do:
- **Do** use the theme tokens (`--surface-*`, `--text-*`, `--accent-*`) for new UI instead of new hex values; existing hard-coded hexes should move onto them over time.
- **Do** set plant and bed names in Newsreader, labels and measurements in JetBrains Mono, and everything else in Plus Jakarta Sans.
- **Do** check every new colour pairing at AA in both themes, including hover.
- **Do** keep text at 12px or larger and prose near 65 characters per line.
- **Do** make anything clickable a real button or link, with the item's name as its accessible name.

### Don't:
- **Don't** put white text on 500–600 shades of green, amber or rose (they fail AA); use 700+ or dark text on a light tint.
- **Don't** add glass, backdrop blur or decorative shadows to navigation, cards or overlays.
- **Don't** introduce new near-identical greens; Hemlock Ink and New Shoot are the action colours.
- **Don't** use monospace for names or prose.
- **Don't** rely on a global dark-mode override for new components; give them explicit `dark:` values or tokens.
