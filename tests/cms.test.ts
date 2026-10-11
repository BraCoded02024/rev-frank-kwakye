import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultPayload, payloadSchema, publicContent, recordSchema, stationIds } from "../lib/cms/schema";
import { ministryStations } from "../lib/content/ministry-stations";
import { profile } from "../lib/content/profile";
import { getPublicContent } from "../lib/cms/read";
import { editorSession, requireEditor } from "../lib/cms/auth";
import { saveContent, signIn } from "../app/admin/actions";
import { sceneName } from "../lib/cms/display";
import { supabaseConfig } from "../lib/supabase/config";

test("defaults preserve public content, fixed Scripture, destinations and pending review", () => {
  const content = publicContent();
  assert.deepEqual(content.profile, profile);
  assert.deepEqual(content.stations.map(s => s.at), ministryStations.map(s => s.at));
  assert.deepEqual(content.stations.map(s => s.id), stationIds);
  assert.equal(content.profile.reviewedByPastor, false);
  assert.equal(sceneName(content.profile), "Rev. Frank Kwaakye");
  assert.equal(sceneName(publicContent(defaultPayload, false, true).profile), defaultPayload.profile.name);
});
test("privileged API keys are rejected by configuration", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://cms-test.supabase.co";
  try {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_secret_do-not-use";
    assert.equal(supabaseConfig(), null);
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = `header.${Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")}.signature`;
    assert.equal(supabaseConfig(), null);
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = `header.${Buffer.from(JSON.stringify({ role: "anon" })).toString("base64url")}.signature`;
    assert.ok(supabaseConfig());
  } finally { delete process.env.NEXT_PUBLIC_SUPABASE_URL; delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; }
});
test("editable schema rejects scene controls, reordered IDs, HTML, bad links and empty content", () => {
  for (const change of [
    (p: typeof defaultPayload) => Object.assign(p, { camera: [1,2,3] }),
    (p: typeof defaultPayload) => p.stations.reverse(),
    (p: typeof defaultPayload) => { p.profile.name = "<script>alert(1)</script>"; },
    (p: typeof defaultPayload) => { p.profile.social.instagram = "javascript:alert(1)"; },
    (p: typeof defaultPayload) => { p.profile.social.instagram = "https://user:password@example.com"; },
    (p: typeof defaultPayload) => { p.stations[0].lines = ["one"]; },
    (p: typeof defaultPayload) => { p.profile.name = " "; },
    (p: typeof defaultPayload) => Object.assign(p.profile, { reviewedByPastor: true }),
  ]) { const draft = structuredClone(defaultPayload); change(draft); assert.equal(payloadSchema.safeParse(draft).success, false); }
});
test("invalid database records fail validation rather than breaking the public scene", () => {
  assert.equal(recordSchema.safeParse(null).success, false);
  assert.equal(recordSchema.safeParse({ payload: defaultPayload, revision: -1 }).success, false);
});
test("missing configuration denies auth and mutation and deliberately uses original content", async () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL; delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  assert.equal(await editorSession(), null);
  await assert.rejects(requireEditor(), /NEXT_REDIRECT/);
  assert.deepEqual(await getPublicContent(), publicContent());
  assert.match((await saveContent({}, new FormData())).error!, /session has expired/);
  assert.match((await signIn({}, new FormData())).error!, /not configured/);
});
test("public reader uses a valid saved record and falls back for missing, malformed and failed reads", async () => {
  const originalFetch = globalThis.fetch;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://cms-test.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "local-test-only";
  const payload = structuredClone(defaultPayload); payload.profile.name = "Edited profile"; payload.stations[1].title = "Edited board";
  try {
    globalThis.fetch = async () => new Response(JSON.stringify([{ payload, reviewed_by_pastor: true, revision: 2, updated_at: "2026-10-10T10:00:00Z", reviewed_at: "2026-10-10T10:00:00Z" }]));
    assert.deepEqual(await getPublicContent(), publicContent(payload, true, true));
    for (const rows of [[], [{ payload: { bad: true } }]]) {
      globalThis.fetch = async () => new Response(JSON.stringify(rows));
      assert.deepEqual(await getPublicContent(), publicContent());
    }
    globalThis.fetch = async () => new Response("Unavailable", { status: 503 });
    assert.deepEqual(await getPublicContent(), publicContent());
    globalThis.fetch = async () => { throw new Error("Connection failed"); };
    assert.deepEqual(await getPublicContent(), publicContent());
  } finally { globalThis.fetch = originalFetch; delete process.env.NEXT_PUBLIC_SUPABASE_URL; delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; }
});
