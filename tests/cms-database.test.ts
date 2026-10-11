import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { defaultPayload } from "../lib/cms/schema";

test("PostgreSQL migration, RLS, safe seed, saves, review and revision conflicts", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
      grant usage on schema auth to anon, authenticated;
      insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');`);
    const migration = readFileSync("supabase/migrations/202610100001_portfolio_cms.sql", "utf8");
    await db.exec(migration); await db.exec(migration);
    const seed = readFileSync("supabase/seed.sql", "utf8");
    await db.exec(seed); await db.exec(seed);
    await db.exec("insert into portfolio_editors values ('00000000-0000-0000-0000-000000000001'); set role anon;");
    assert.equal((await db.query<{ revision: number }>("select revision from portfolio_content")).rows.length, 1);
    await assert.rejects(db.query("select save_portfolio_content($1::jsonb,1,null)", [JSON.stringify(defaultPayload)]), /permission denied/);
    await db.exec("set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);");
    assert.equal((await db.query("select * from portfolio_editors")).rows.length, 0);
    await assert.rejects(db.query("select save_portfolio_content($1::jsonb,1,null)", [JSON.stringify(defaultPayload)]), /Editor access required/);
    await assert.rejects(db.query("update portfolio_content set revision=99"), /permission denied/);
    await assert.rejects(db.query("insert into portfolio_editors values ('00000000-0000-0000-0000-000000000002')"), /permission denied/);
    await db.exec("select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);");
    const edited = structuredClone(defaultPayload); edited.profile.name = "Rev. Frank Kwakye — test"; edited.stations[0].meaning = "A test reading screen.\nA second paragraph.";
    const save = async (payload: typeof defaultPayload, revision: number, reviewed: boolean | null = null) => (await db.query<{ result: { revision: number; reviewed_by_pastor: boolean; payload: typeof defaultPayload } }>("select save_portfolio_content($1::jsonb,$2,$3) result", [JSON.stringify(payload), revision, reviewed])).rows[0].result;
    let row = await save(edited, 1); assert.equal(row.revision, 2); assert.equal(row.reviewed_by_pastor, false); assert.deepEqual(row.payload, edited);
    row = await save(edited, 2, true); assert.equal(row.reviewed_by_pastor, true);
    await assert.rejects(save(defaultPayload, 3, true), /Save before review/);
    row = await save(defaultPayload, 3); assert.equal(row.revision, 4); assert.equal(row.reviewed_by_pastor, false);
    await assert.rejects(save(edited, 3), /Revision conflict/);
    const bad = structuredClone(defaultPayload); bad.stations.reverse(); await assert.rejects(save(bad, 4), /Invalid board/);
    bad.stations.reverse(); bad.profile.name = "<script>"; await assert.rejects(save(bad, 4), /Plain text/);
    bad.profile.name = "Valid name"; bad.profile.social.instagram = "javascript:alert(1)"; await assert.rejects(save(bad, 4), /HTTPS/);
    await db.exec("reset role;"); await db.exec(seed);
    assert.equal(Number((await db.query<{ revision: number }>("select revision from portfolio_content")).rows[0].revision), 4);
    await db.exec("delete from portfolio_content; set role authenticated;");
    row = await save(defaultPayload, 0); assert.equal(row.revision, 1); assert.equal(row.reviewed_by_pastor, false);
    await assert.rejects(save(edited, 0), /Revision conflict/);
  } finally { await db.close(); }
});
