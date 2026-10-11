# Interaction checks

Run the app with npm run dev before the browser check.

- npm run lint
- npx tsc --noEmit
- node docs/check-contact.cjs: checks validation, missing configuration, and delivery failures using mocks. It sends no email.
- node docs/check-interactions.cjs: runs headless Edge against localhost:3000. Set JOURNEY_PLAYWRIGHT to a Playwright package path if it is not installed locally.
- npm run build: run after browser checks finish so the dev server and build do not update .next simultaneously.

The browser check covers six chapter buttons, repeated theater opening/closing, Escape, topic selection, reading-mode return, mobile overflow, menu closing, contact/videos/profile navigation, returning home, reduced motion, and uncaught browser errors. Preview images are saved to .checks/.

The lint configuration permits imperative Three.js scene mutations only in canvas components. Browser media initialization and the pre-paint intro handoff have local documented exceptions to the synchronous-state rule.

Invitation page: node docs/check-invitation.cjs checks direct access, homepage and legacy navigation, intro bypass, responsive form order, required fields, and runtime errors. No invitation is sent.
