# Journey prototype

> Superseded by the spatial engine refactor. See [spatial-prototype.md](./spatial-prototype.md) for the current homepage and verification results.

## Concept

A passage into a calling: warm plaster, nested architectural frames, and editorial typography. The visitor approaches a real portrait, then crosses an expanding frame into a quieter reading space.

The homepage is the bounded prototype. Existing routes retain their previous experience so ministry and invitation information remain available. No new dependencies or WebGL scenes were introduced.

## Sequence

- Prologue: the supplied eight-second Bible film plays muted for visitors without reduced motion. Playback is optional, can be paused, and pauses offscreen. Romans 8:31 remains readable independently of the film.
- Calling: a sticky scene lets scroll progress approach the portrait, separate the name layers, and reveal the roles and church gradually.
- Threshold: an architectural opening expands toward the visitor.
- Formation: existing education and ministry content settles into a quiet editorial spread.

Lenis provides smooth anchor navigation; Framer Motion values drive transforms without React rerendering each frame. Native anchors provide chapter access. Reduced motion removes the pinned runway and reveals all information. Mobile uses a distinct portrait and type composition.

## Content boundaries

Portrait and video come from public/pastor and public/intro. Biography and qualifications come from lib/content/profile.ts, whose existing reviewedByPastor flag is false. They are repository-supplied, not independently verified. No dates, achievements or personal quotations were invented. The brief's spelling Kwaakye is used in the prototype; the older content and metadata use Kwakye and still need editorial confirmation.

## Changed source

- app/page.tsx
- app/layout.tsx
- app/journey.css
- components/journey/CallingJourney.tsx
- components/journey/PublicExperience.tsx
- components/site/Videos.tsx and Gallery.tsx (hydration-safe motion preference)
- docs/check-journey.cjs (repeatable browser inspection)

## Next phase

The full Ministry, Word, Leadership, Reflection and Invitation chapters are intentionally not redesigned. Next, develop a ministry encounter from the supplied preaching, discipleship and leadership-training material, ideally supported by approved photographs of ministry in practice. Do not invent a dated formation timeline.

## Preview and checks

Run npm run dev and open http://localhost:3000. Browser inspection uses Playwright supplied via JOURNEY_PLAYWRIGHT or an installed playwright module, with headless Edge. Screenshots are written to docs/journey-preview. Check desktop, mobile, anchor navigation, film playback, reduced motion, console errors, overflow, and the retained contact route.
