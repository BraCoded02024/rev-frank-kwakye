# Phase-one ministry content workspace

The dashboard is at `/admin/login` and `/admin`. It edits the existing profile fields and four ministry boards. Media management, sermon uploads and an invitation inbox are excluded. The existing Resend contact action is unchanged.

## Setup

1. Create a Supabase project. In Auth settings, enable email/password sign-in and **disable new user sign-ups**. Do not enable public registration. Configure the production site URL and local development URL as appropriate.
2. Run `supabase/migrations/202610100001_portfolio_cms.sql` in the Supabase SQL editor, as the project database owner. It creates `portfolio_content`, `portfolio_editors`, RLS policies and the authorised save RPC.
3. Run `npm run cms:seed-sql`, then execute `supabase/seed.sql` in the SQL editor. The seed uses `ON CONFLICT DO NOTHING`; rerunning it preserves saved edits and review status. Alternatively, the allowlisted editor may initialise the missing record using **Save original content**. Do not delete a live record to rerun the seed.
4. Create the pastor’s account, or the one authorised editor’s account, in the Supabase Auth dashboard. Use a confirmed email and a strong password. Copy that account’s UUID into this SQL statement and execute it as the database owner:

   ```sql
   insert into public.portfolio_editors (user_id)
   values ('REPLACE_WITH_AUTH_USER_UUID'::uuid)
   on conflict do nothing;
   ```

   Do not allow an account to enrol itself as an editor. To revoke access, remove its membership through the project owner’s database tools. Existing sessions are checked against membership again on every protected request and save.

5. Copy `.env.example` to `.env.local` and fill in:

   - `NEXT_PUBLIC_SUPABASE_URL`: the HTTPS project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the project’s publishable API key (the legacy anon key also works). **Never use a service-role or secret key here.** The application needs no privileged database key.
   - `NEXT_PUBLIC_SITE_URL`: the deployed public URL, optional locally.

   Existing invitation delivery still uses `RESEND_API_KEY`, `INVITE_FROM_EMAIL` and `PASTOR_NOTIFY_EMAIL`. Those settings are unrelated to CMS authentication and are not required for editing content.

6. Restart `npm run dev`. Provide the Supabase environment variables at production build time, rebuild and redeploy. Visit `/admin/login` and sign in with the allowlisted account. Admin pages render per request and are excluded from indexing.

## Content and permissions

`portfolio_content` holds one public record (`id = main`): validated JSON text, a revision, a saved timestamp and explicit pastor review state. All content in this record is intended for public display. Never store passwords, contact submissions or private notes there. `portfolio_editors` contains only authorised Auth UUIDs; authenticated users can read only their own membership.

Anonymous and authenticated visitors may read the public content record. Neither may insert, update or delete either table directly. `save_portfolio_content` is a security-definer RPC with its own membership check, payload validation, fixed board order and revision checks; execution is granted only to authenticated users. Application server actions separately verify the Auth user and membership, and validate the complete payload with Zod. No admin SDK or privileged key is sent to the browser.

The four stable board identifiers are `leadership`, `teaching`, `discipleship`, `evangelism`. Their order and camera destinations come from the original source file, never from the database. Scripture, photographs, scene geometry, lighting, scroll mechanics and camera choreography remain developer controlled.

Saving changed content resets pastor review to pending. Confirming review requires a separate explicit confirmation of the complete saved record; an unsaved draft cannot be reviewed. Stale revisions fail without overwriting newer edits. A whole content record is saved atomically, including drafts kept across editor tabs. Unsaved changes trigger a warning before leaving or signing out.

The public reader caches validated content for 60 seconds. A successful server action expires its cache tag immediately; an already-open visitor tab needs reloading to see updates. Missing configuration, missing records, invalid records, connection errors and timeouts deliberately use original source content. Admin read errors disable saving, so a failed read cannot overwrite a valid record with defaults.

The source profile spells the surname **Kwakye**, while approved scene lettering originally used **Kwaakye**. Without a database, compatibility helpers preserve the original scene lettering. Once a valid record is loaded, the scene displays the saved name exactly. Review the name and the existing Assembly/Assemblies church-name notes before publication; no new biographical facts were added.

## Files and architecture

| Files | Purpose |
| --- | --- |
| `app/admin/*` | Private editorial shell, login, overview, full profile editor, four board editors, review controls, loading/error states and guarded server actions. |
| `lib/cms/schema.ts`, `read.ts`, `auth.ts` | Server validation, safe public/admin reads and verified allowlist authorization. |
| `lib/cms/context.tsx`, `display.ts` | Small public text context and compatibility formatting; the client context imports schema types only. |
| `lib/supabase/*`, `proxy.ts` | Server cookie clients, configuration and admin session refresh. |
| `app/layout.tsx`, `app/contact/page.tsx` | Provide persisted public text and retain existing invitation handling. |
| `components/journey/PublicExperience.tsx` | Keep public intro and 3D legacy wrappers out of admin routes. |
| `components/journey/SpatialJourney.tsx`, `CallingJourney.tsx` | Read profile and board text from the shared content context. |
| `components/canvas/SpatialScene.tsx`, `SpatialRooms.tsx`, `PortraitAssembly.tsx` | Connect only text consumers and bridge content into the R3F renderer. Numeric scene settings and motion functions are preserved. |
| `components/story/Story.tsx`, `components/intro/IntroVideo.tsx`, `components/ui/Nav.tsx`, `components/site/SermonTheater.tsx` | Connect existing alternate-route and public identity text. |
| `supabase/migrations/*`, `supabase/seed.sql`, `scripts/seed-content.ts` | Database permissions and repeatable, non-overwriting source migration. |
| `tests/cms*.test.ts`, `tests/server-only-*` | Content validation, safe fallback, denied mutations and local PostgreSQL access/revision tests. The test-only loader replaces Next’s bundler marker, not auth logic. |
| `.env.example`, `.gitignore`, `eslint.config.mjs`, `package.json`, `package-lock.json` | Configuration template, private/generated-file exclusions, dependency and verification commands. |
| `scripts/preview-admin.ts` | An isolated local UI fixture, not a Next route. It labels all saves as simulated and never uses Auth or a database. Generated preview files are ignored. |

## Verification commands and deployment gate

```sh
npm run cms:seed-sql
npm run test:cms
npx tsc --noEmit
npm run build
npx eslint app/admin lib/cms lib/supabase proxy.ts scripts tests
```

Local tests cover real PostgreSQL migration syntax, repeatable migrations/seeding, anonymous and non-member write denial, membership RLS, direct-write denial, edited profile/board persistence, review confirmation/reset, missing-row initialisation and stale revisions. Public reader tests cover a valid saved response, missing/malformed records and failed requests; these HTTP responses are controlled test fixtures, not a connected Supabase project.

For an optional isolated layout preview, run `npx tsx scripts/preview-admin.ts` and open `http://127.0.0.1:3400`. This exercises the real editor component with simulated actions. It is not evidence that live authentication or persistence works.

Before deployment, verify with the configured hosted project:

- Correct password/allowlisted user succeeds; wrong password and a signed-in non-member fail. Sign-out and session expiry deny subsequent saves.
- Anonymous visits to `/admin` reach login. Direct anonymous/non-member RPC calls and action requests cannot mutate data.
- Save and reload a real profile edit and each ministry board; verify the public scene and reading screen after reloading. Restore the test content afterwards.
- Two tabs editing the same revision produce a conflict, not a silent overwrite. Any edit resets review; explicit review persists.
- Inspect desktop and mobile admin layouts, unsaved-draft warnings, validation and pending states.
- Walk the public portrait → sacred → profile → ministry → messages → leadership → contact sequence, chapter buttons, reading mode, reduced-motion behavior and contact route; inspect the browser console. Do not send a contact test email without authorisation.

No hosted credentials were available during implementation. Hosted sign-in, session-refresh behavior and the complete application-to-Supabase save/reload path therefore remain unverified. Local database tests are not a substitute for this deployment gate.

## Implementation verification results — 10 October 2026

| Check | Actual result |
| --- | --- |
| `npm run test:cms` | Seven tests passed, including the local PostgreSQL migration/RLS/save/review suite, privileged-key rejection and public-reader fixtures. |
| `npm run lint` | Passed. Generated visual-fixture bundles are excluded from linting. |
| `npx tsc --noEmit` | Passed. |
| `npm run build` | Passed; `/admin` and `/admin/login` are dynamic per-request routes. Windows sandbox path resolution blocked the first build attempt; the build succeeded outside that sandbox. |
| Production public routes | Homepage and contact HTTP reads succeeded. Browser navigation rendered the 3D homepage and reached the invitation page. No contact form was submitted. |
| Unauthorised admin | Production browser navigation to `/admin` reached `/admin/login`; sign-in is disabled with a useful setup message when configuration is missing. Unconfigured server actions deny saves in the tests. |
| Public 3D smoke check | Desktop portrait scene and ministry boards rendered. Chapter navigation worked, scrolling advanced into the profile room, and selecting Teaching opened the original reading text. |
| Public browser console | No errors observed in the homepage/contact checks; the existing Three.js `Clock` deprecation warning remains. |
| Responsive admin UI | Desktop at 1280×900 and mobile at 390×844 inspected in the isolated fixture. Mobile document width stayed within the viewport. Mobile production login inspected separately. |
| Editor UI fixture | Invalid HTML produced a validation message; a valid simulated save updated revision/count/status; an unsaved draft survived tab changes. Saves here were simulated, not Supabase writes. Native discard/leave confirmation acceptance was not completed by browser automation and should be checked manually. |
| Hosted sign-in and save/reload | Not tested: project credentials and an allowlisted hosted account were not available. |
| Reduced-motion interaction | Motion-related code and preferences were preserved; an OS-level reduced-motion session was not separately exercised. |
| Dependency audit | `npm audit --omit=dev` reported zero production advisories. Full audit reported five high advisories in the existing ESLint/fast-glob/micromatch/braces development chain. The proposed force fix would downgrade the Next ESLint configuration and was not applied. |

The camera path file, Rig motion code, scene coordinates, geometry, lights, assembly animations and public CSS were not redesigned or changed. Public component changes are content reads, text formatting and the R3F content-provider bridge. The contact notification action and asset files remain unchanged. The local checkout has no Git metadata, so no Git diff or commit was produced.

## Follow-up connection check

After the owner added `.env`, `npx tsx scripts/check-cms-connection.ts` confirmed that the public Supabase URL/key are valid and Auth is reachable with the email provider enabled. The REST API returned `PGRST205` for `portfolio_content`, and the editor-membership table also returned 404: the CMS migration still needs to be applied. Auth settings reported that public sign-up is enabled and must be disabled for this private dashboard. The supplied environment contains no database-owner connection or management credential, so these project-owner setup changes were not applied by the application. No credential values were printed.
