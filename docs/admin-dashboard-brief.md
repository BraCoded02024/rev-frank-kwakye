# Rev. Frank Kwakye — site report for an admin dashboard

Use this file with ChatGPT. Upload it, then ask whether and how to add an admin dashboard. This describes the public site as built. It is a personal ministry portfolio, not a generic church template.

Suggested first message to ChatGPT:

> This is the full report of a personal portfolio site for Rev. Frank Kwakye, Senior Pastor in Accra, Ghana. Read it and tell me if we should add an admin dashboard, what the first version should edit, and what it must not edit. Do not invent sermons, dates, churches, years, or impact numbers. Keep the public 3D journey. The dashboard is only for the pastor (or one editor) to update real content.

## Who the site is for

- Name on the profile record: Rev. Frank Kwakye
- Roles: Senior Pastor, Bible Teacher, Christian Leadership Trainer
- Church: New Life Assembly of God, Oyarifa, Accra, Ghana
- Also serves as Secretary, Adenta District of Assemblies of God, Ghana (Greater Accra West Region)
- Education on record: Master of Arts in Biblical Studies, Global University
- Scripture used on the site: Romans 8:31, KJV only — “If God be for us, who can be against us?”
- The copy has not been marked as reviewed by the pastor (`reviewedByPastor` is false)
- Some 3D lettering still spells the surname Kwaakye. The profile file spells it Kwakye. Fix that before publishing, do not treat both as correct
- Church name note in the source: the profile says “New Life Assembly of God”; another source says “New Life Assemblies of God” for the leadership school. Do not guess which is final

## What a visitor sees

The public homepage is one scrolling 3D journey. Scroll moves the camera through rooms. There is no separate “FK / Opening the passage…” cover anymore.

Opening the site lands on Portrait → Sacred:

1. The pastor’s picture assembles
2. The journey continues through the sacred doorway into the rooms

The menu offers only Portrait → Sacred. Portrait assembly, Sacred assembly, and Original film are commented out and must stay off the menu.

Rooms, in order:

1. Welcome / calling, with the portrait
2. Profile
3. Ministry — four boards a visitor can tap
4. Messages — topic plaques a visitor can tap
5. Leadership
6. Contact / invitation, including church photographs

Tapping a ministry board moves the camera to that board and opens a reading screen. Current wording:

- Leadership: Over the years he has taught and groomed leaders. He mentors young leaders, and he has been an inspiration to pastors, deacons, and ministry leaders learning to lead.
- Teaching: He has spent his ministry teaching the Bible. His preaching stays with the Word, and he teaches young people in the life of the church.
- Discipleship: He has stayed close to people who want to grow. Through discipleship he helps them mature in faith and learn to serve.
- Evangelism: He has carried the gospel into prayer, worship, and revival. That witness has encouraged the people he serves.

These lines should sound like a person, not a course outline. They should not all start with his name.

Other routes:

- `/` — the 3D journey only
- `/contact` — a separate invitation page with a form, WhatsApp, and email
- `/about`, `/ministry`, `/messages`, `/gallery`, `/leadership` — these page files return nothing. The layout still mounts an older editorial story plus an intro video on any path that is not `/` or `/contact`. Decide whether those old routes stay. They are not the experience the pastor asked to keep.

## How the site is built

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- Homepage scene: Three.js with React Three Fiber
- Scroll on the journey is the page scroll, not a second scroll library on that page
- An older editorial page still exists in the codebase (Lenis smooth scroll, Framer Motion). It is not the homepage
- No database, no login, no admin route, no CMS
- All public words live in TypeScript files under `lib/content/`
- Changing those files requires a developer and a new deploy. That is the problem an admin dashboard would solve

Content files:

| File | What it holds |
| --- | --- |
| `lib/content/profile.ts` | Name, roles, church, biography, six ministry focuses, three works, invitations text, social links, milestones, leadership-school modules |
| `lib/content/ministry-stations.ts` | The four tappable ministry screens |
| `lib/content/media.ts` | Five message topics. Every recording URL is empty |
| `lib/content/church-photos.ts` | Three church photographs |
| `lib/content/scripture.ts` | Romans 8:31 |
| `lib/content/private.ts` | Public phone, email, and WhatsApp link used on the invitation page |
| `lib/content/slots.ts` | A list of image slots. Nothing writes to it yet |
| `lib/content/site-copy.ts` | Short empty-state lines. Also marked not reviewed by the pastor |

Message topics, all without a video:

1. Biblical and expository preaching
2. Pentecostal prayer and worship
3. Christian discipleship
4. Leadership teaching
5. Youth teaching

Invitation form (`app/actions/contact.ts`):

- Fields: name, reply contact, event date, venue, theme, expected audience, nature of the assignment
- Validates with Zod
- Rate limit is five attempts in ten minutes, stored in server memory. A restart clears it
- If `RESEND_API_KEY` and `INVITE_FROM_EMAIL` are missing, the form tells the visitor to use WhatsApp and does not save the invitation
- If email is configured, it sends to `PASTOR_NOTIFY_EMAIL` or the pastor’s email. It does not keep a copy in the site

## Can an admin dashboard be added?

Yes. The public journey can stay. The dashboard should edit the words, photos, and recordings the journey already reads. It should not become a 3D editor.

Do not put in the first dashboard:

- Camera paths, door positions, scroll length, lighting, or the Portrait → Sacred sequence
- A public signup
- Invented sermon titles, dates, attendance numbers, or extra churches
- A second public website

## Suggested first version

One signed-in editor. No public accounts.

Phase 1 — correct the record

- Sign-in for the pastor or one trusted editor
- Edit profile fields already in `profile.ts`: name, roles, church, location, biography, ministry focuses, the three works, leadership-school modules
- Edit the four ministry screens so a text change shows on the board a visitor taps
- Show a clear “reviewed by pastor” switch. It is currently false

Phase 2 — media and invitations

- For each of the five message topics, an optional recording URL. Empty must keep showing that the recording is not available yet
- Add, reorder, and remove church photographs
- Save every invitation in storage the pastor can read later. Do not rely on the in-memory rate limit or on email alone

## Questions ChatGPT should answer from this report

1. Is a custom dashboard in this Next.js app the right first step, or should the content move to a hosted CMS first?
2. What is the smallest data model that can replace `profile.ts`, `ministry-stations.ts`, `media.ts`, and `church-photos.ts` without changing the 3D scene?
3. How should one editor sign in, and where should invitations be stored?
4. What must stay hardcoded so the journey does not break when someone edits text?
