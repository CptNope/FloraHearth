# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary purpose:** FloraHearth is a showcase for Jeremy Anderson's agency (jeremyanderson.tech). Its quality is the pitch: prospective clients judge the agency by how well this app is built.
- **People who use it:** US home gardeners planning beds, timing plantings to their own frost dates, harvesting, and preserving food at home. *(Inferred from the app's features and copy; the user confirmed the showcase purpose, not a narrower gardener segment.)*
- Both audiences must be served at once: a gardener should be able to rely on it for a real season, and a client evaluating it should find nothing broken, generic or inaccurate.

## Product Purpose

One place for a whole growing season: design beds, get a planting calendar from local frost dates, look up crops and companions, log harvests, preserve food safely, and track the pantry and garden costs. Success is a gardener running a season on it end to end, and a prospective client seeing production-grade craft.

## Positioning

- **Plan → grow → preserve in one place:** the bed layout feeds the calendar, the harvest log feeds the pantry, and preservation feeds pantry batches.
- **Food-safety accuracy:** preservation guidance follows USDA / NCHFP tested processes (water bath only for high-acid or tested pickle recipes, pressure canning for low-acid crops, altitude adjustments).
- **Private and offline:** no account; data stays on the device; works installed and offline.
- **Local frost-date timing:** every planting and harvest date is computed from the user's own frost dates.

## Operating Context

- Installed as a PWA on phones and used in the garden, often one-handed and sometimes without signal; also used on desktop for planning.
- Gardeners act on its guidance directly: covering plants on frost nights, choosing a canning method, buying seed.
- Deep links: `?tab=planner`, `?tab=crops` and `?tab=calendar` are used by the PWA shortcuts and by JAT-OS (Jeremy's system) and must keep working.

## Capabilities and Constraints

- **Free, no account.** No sign-up or paywall. Cross-device sync is optional and self-hosted (Cloudflare Worker + D1, `worker/`).
- **Static hosting on GitHub Pages.** No app server; anything server-side lives in the optional Worker.
- **Offline-first PWA.** Every feature must work installed and offline; the service worker precaches all build chunks.
- **Data on device:** localStorage for records, IndexedDB for journal photos; JSON backup export/restore.
- **Weather:** Open-Meteo when reachable; otherwise today's cached forecast, otherwise clearly labelled seasonal estimates that never give a frost all-clear.
- Crop timing is one US-wide model per crop (137 crops) anchored to frost dates; warm-zone timing can differ from local extension advice (open limitation).

## Brand Commitments

- Name: **FloraHearth**.
- Guidance cites its sources (USDA ARS, NCHFP, university cooperative extension services).

## Evidence on Hand

- Crop, companion, IPM and preservation data in `src/data/`, with sources named in the app footer.
- No testimonials, user counts, reviews, press or case studies exist. Do not invent any.

## Product Principles

1. **Never guess about safety.** Food-safety and frost guidance is either backed by a tested source or clearly labelled as unavailable or estimated.
2. **The season is one flow.** Each record should feed the next step instead of being retyped.
3. **The user owns their data.** It stays on their device, survives offline, and can always be exported.
4. **Showcase-grade craft.** Every screen, state and device size should hold up to a prospective client's scrutiny.

## Accessibility & Inclusion

WCAG 2.2 AA: keyboard and screen-reader access, 200% text and 320 px reflow, both light and dark themes. Phone-first touch targets (44 px where possible).
