"use client";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import type { ContentPayload, ContentRecord } from "@/lib/cms/schema";
import { saveContent, signOut } from "./actions";

const areas = ["Overview", "Pastor profile", "Ministry stations", "Review status"] as const;
const labels = { resourceShelves: "Resource shelves", reflectionCategories: "Reflection categories", leadershipModules: "Leadership modules", facebookProfile: "Facebook profile", facebookShare: "Facebook share link", instagram: "Instagram", instagramHandle: "Instagram handle" };
function savedDate(value: string, withTime = false) { return withTime ? `${value.slice(0, 16).replace("T", " ")} UTC` : value.slice(0, 10); }
type Area = typeof areas[number];
type Path = (string | number)[];
function at(value: unknown, path: Path): unknown { return path.reduce<unknown>((v, k) => (v as Record<string | number, unknown>)[k], value); }
function put(value: ContentPayload, path: Path, replacement: unknown): ContentPayload {
  const next = structuredClone(value);
  let cursor: Record<string | number, unknown> = next as unknown as Record<string | number, unknown>;
  path.slice(0, -1).forEach(k => { cursor = cursor[k] as Record<string | number, unknown>; });
  cursor[path[path.length - 1]] = replacement;
  return next;
}
export function AdminEditor({ initial, defaults, loadError }: { initial: ContentRecord | null; defaults: ContentPayload; loadError: string | null }) {
  const [area, setArea] = useState<Area>("Overview");
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial?.payload ?? defaults);
  const [state, action, pending] = useActionState(async (previous: import("./actions").ActionState, form: FormData) => {
    const result = await saveContent(previous, form);
    if (result.record) { setSaved(result.record); setDraft(result.record.payload); }
    return result;
  }, {});
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved?.payload ?? defaults);
  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    const leave = (event: MouseEvent) => { const target = (event.target as Element).closest("a"); if (target && !window.confirm("Leave with unsaved changes? Your draft will be lost.")) event.preventDefault(); };
    window.addEventListener("beforeunload", unload); document.addEventListener("click", leave);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", leave); };
  }, [dirty]);
  function field(label: string, path: Path, options: { lines?: boolean; list?: boolean; url?: boolean } = {}) {
    const value = at(draft, path);
    const id = path.join("-");
    const props = { id, value: options.list ? (value as string[]).join("\n") : String(value), onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(put(draft, path, options.list ? event.target.value.split("\n") : event.target.value)), required: true };
    return <label key={id} htmlFor={id}>{label}{options.lines || options.list ? <textarea {...props} rows={options.list ? 5 : 4} /> : <input {...props} type={options.url ? "url" : "text"} />}{options.list && <small>One item per line. Remove empty lines before saving.</small>}</label>;
  }
  return <div className="admin-shell"><aside className="admin-sidebar"><div className="admin-brand"><span className="admin-monogram">FK</span><div>{saved?.payload.profile.name ?? defaults.profile.name}<small>Editorial workspace</small></div></div><nav aria-label="Editorial areas">{areas.map((item, i) => <button key={item} type="button" aria-current={area === item ? "page" : undefined} onClick={() => setArea(item)}><span>0{i + 1}</span>{item}</button>)}</nav><div className="admin-sidebar-foot"><Link href="/">View public journey ↗</Link><form action={signOut} onSubmit={e => { if (dirty && !window.confirm("Sign out and discard your unsaved draft?")) e.preventDefault(); }}><button type="submit">Sign out</button></form></div></aside><main id="content" className="admin-main"><header className="admin-header"><div><p className="admin-eyebrow">MINISTRY / CONTENT</p><h1>{area}</h1></div><span className={`admin-status ${dirty ? "is-dirty" : ""}`}>{dirty ? "Unsaved changes" : saved ? `Revision ${saved.revision}` : "Source defaults"}</span></header>
    {loadError && <p role="alert" className="admin-notice">{loadError} Saving is disabled to protect existing content.</p>}
    {!saved && !loadError && <p className="admin-notice">No database record exists yet. The public site uses the original content. Save to initialise it; existing records are never silently replaced.</p>}
    <form action={action} aria-busy={pending}><input type="hidden" name="payload" value={JSON.stringify(draft)} /><input type="hidden" name="revision" value={saved?.revision ?? 0} /><fieldset disabled={pending || !!loadError}>
      {area === "Overview" && <><p className="admin-lead">Keep the story accurate, thoughtful and up to date.</p><div className="admin-summary"><article><small>Saved ministry boards</small><strong>{saved?.payload.stations.length ?? 0}</strong><p>Four fixed places in the public journey.</p></article><article><small>Pastor review</small><strong>{saved?.reviewed_by_pastor ? "Reviewed" : "Pending"}</strong><p>{saved?.reviewed_at ? savedDate(saved.reviewed_at, true) : "Review has not been confirmed."}</p></article><article><small>Last saved</small><strong>{saved ? savedDate(saved.updated_at) : "Not yet"}</strong><p>{saved ? `Revision ${saved.revision}` : "Original source content is active."}</p></article></div><section className="admin-card"><h2>Your publishing routine</h2><p>Edit the profile or ministry boards, save explicitly, then confirm the pastor’s review of the saved content. Editing reviewed content resets its review status.</p><p>The public journey’s architecture, photographs, Scripture and camera movement remain developer controlled.</p></section></>}
      {area === "Pastor profile" && <><p className="admin-lead">The existing biography and ministry information, in one place.</p><section className="admin-card"><h2>Identity & service</h2><div className="admin-grid">{field("Name", ["profile", "name"])}{field("Roles · separate with |", ["profile", "descriptor"])}{field("Church", ["profile", "church"])}{field("Location", ["profile", "location"])}{field("District role", ["profile", "districtRole"], { lines: true })}{field("Education", ["profile", "education"], { lines: true })}</div>{field("Biography paragraphs", ["profile", "biography"], { list: true })}{field("Ministry focus", ["profile", "ministryFocus"], { list: true })}</section><section className="admin-card"><h2>Works & resources</h2>{draft.profile.works.map((_, i) => <div className="admin-group" key={i}><h3>Work {i + 1}</h3>{field("Title", ["profile", "works", i, "title"])}{field("Type", ["profile", "works", i, "type"])}{field("Description", ["profile", "works", i, "description"], { lines: true })}</div>)}{(["resourceShelves", "reflectionCategories", "leadershipModules"] as const).map(key => field(labels[key], ["profile", key], { list: true }))}</section><section className="admin-card"><h2>Formation milestones</h2>{draft.profile.milestones.map((_, i) => <div className="admin-group" key={i}>{field(`Milestone ${i + 1} · title`, ["profile", "milestones", i, "title"])}{field("Detail", ["profile", "milestones", i, "detail"], { lines: true })}</div>)}</section><section className="admin-card"><h2>Invitations & social links</h2>{field("Invitation introduction", ["profile", "invitations", "intro"], { lines: true })}{field("Invitation details to include", ["profile", "invitations", "include"], { list: true })}{(["facebookProfile", "facebookShare", "instagram", "instagramHandle"] as const).map(key => field(labels[key], ["profile", "social", key], { url: key !== "instagramHandle" }))}</section></>}
      {area === "Ministry stations" && <><p className="admin-lead">Four boards, in their original order. Short lines appear in the scene; reading text opens when a visitor selects a board.</p>{draft.stations.map((station, i) => <section className="admin-card" key={station.id}><p className="admin-eyebrow">0{i + 1} / {station.id}</p>{field("Board title", ["stations", i, "title"])}{field("Scene line 1", ["stations", i, "lines", 0])}{field("Scene line 2", ["stations", i, "lines", 1])}{field("Reading-screen content", ["stations", i, "meaning"], { lines: true })}</section>)}</>}
      {area === "Review status" && <section className="admin-card"><p className="admin-eyebrow">PASTOR’S REVIEW</p><h2>{saved?.reviewed_by_pastor ? "Reviewed by the pastor" : "Awaiting review"}</h2><p>This records an explicit confirmation, not an automatic approval. Save all edits before reviewing.</p><label className="admin-checkbox"><input type="checkbox" name="confirmReview" disabled={dirty || !saved} />I confirm the pastor has reviewed the complete saved profile and all four ministry boards.</label><button name="review" value="true" disabled={dirty || !saved || pending}>Confirm review</button>{saved?.reviewed_by_pastor && <button className="admin-secondary" name="review" value="false" disabled={dirty || pending}>Return to pending review</button>}</section>}
      {area !== "Review status" && <div className="admin-save"><p>{dirty ? "Your changes are held in this browser until saved." : "Make an edit, then save explicitly."}</p><button type="submit" disabled={pending || (!dirty && !!saved)}>{pending ? "Saving…" : saved ? "Save changes" : "Save original content"}</button>{dirty && <button className="admin-secondary" type="button" onClick={() => { if (window.confirm("Discard all unsaved changes?")) setDraft(saved?.payload ?? defaults); }}>Discard draft</button>}</div>}
    </fieldset><p className={state.error ? "admin-notice" : "admin-feedback"} role="status" aria-live="polite">{pending ? "Saving…" : state.error ?? (dirty ? null : state.success)}</p></form>
  </main></div>;
}
