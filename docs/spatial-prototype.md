# Spatial journey prototype

The homepage is now a continuous React Three Fiber / Three.js environment. The previous pinned editorial page is no longer mounted. A fixed WebGL canvas fills the viewport; native scrolling drives a perspective camera from Z=9 to Z=-38. No HTML sections move vertically through the scene.

## Architecture and travel

Two physical double doors stand at Z=-6 and Z=-27. Each leaf rotates around its hinge according to camera distance, opening approximately 85 degrees before the crossing. Floor joints, pilasters, ceiling beams, windows and shadows establish near/far parallax. The camera looks toward the portrait during its approach, then turns continuously toward the second doorway.

The supplied Bible film plays muted on a world-space surface. The existing portrait is fixed at Z=-19; identity and church information occupy separate depth planes. The second threshold opens into a sage-colored ministry environment with preaching, discipleship and leadership inscriptions. Existing ministry and contact routes remain reachable.

## Controls and accessibility

Wheel, touch scrolling, keyboard scrolling and the scrollbar drive the same camera. Reverse scrolling walks backward and reverses the hinges. Three understated chapter buttons move along that path. Read the story opens the supplied biography and ministry information in a semantic reading view; reduced motion selects it automatically and WebGL failure falls back to it.

The canvas renders on demand during movement and film playback, capped at 1.5 DPR. Video frame uploads explicitly support detached media in Chromium. No new packages were installed, and no audio is forced.

## Changed files

- app/page.tsx — mounts SpatialJourney.
- app/spatial.css — viewport, navigation and reading view.
- app/layout.tsx and public/favicon.svg — local monogram icon.
- components/journey/SpatialJourney.tsx — scroll input, playback, chapter controls and fallback.
- components/canvas/SpatialScene.tsx — rooms, hinged doors, portrait, camera, materials and lighting.
- lib/three/spatial-path.ts — camera path and proximity-driven hinge angle.
- next.config.ts — hides the development badge in the preview.
- docs/check-spatial.cjs — repeatable browser verification.

## Verification

npm run dev serves the preview at http://localhost:3000. TypeScript and npm run build passed. Headless Edge screenshots were visually inspected at 1440×1000 and 390×844. The browser check asserts actual camera coordinates, physical crossings, reverse travel, chapter navigation, mobile overflow, reduced-motion fallback and absence of runtime exceptions. The supplied Bible film was visually confirmed after correcting video-texture uploads.

Measured camera Z: 9 at the prologue; -6.646 just after Door 01; -12 at the Calling; -28 just after Door 02; -36 on the Ministry Path. Both doors reached 1.477 radians before crossing. The canvas bounding rectangle remained at top=0 throughout.

Run node docs/check-spatial.cjs with Playwright installed, or set JOURNEY_PLAYWRIGHT to its module path. Screenshots are in docs/spatial-preview.

## Scope and content

This implements Prologue → Door 01 / Calling → Door 02 / Ministry Path. Full sermon, leadership, reflection and invitation rooms remain outside this phase. The older pinned prototype files are retained but unmounted. All biographical claims come from the supplied repository content, still marked reviewedByPastor:false. No dates or achievements were invented. The brief's Kwaakye spelling is used in the new experience; older metadata uses Kwakye pending editorial confirmation.
