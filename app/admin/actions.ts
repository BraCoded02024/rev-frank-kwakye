"use server";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminAuthEmail, adminUsername } from "@/lib/cms/admin-login";
import { editorSession } from "@/lib/cms/auth";
import { payloadSchema, recordSchema, type ContentRecord } from "@/lib/cms/schema";

export type ActionState = { error?: string; success?: string; record?: ContentRecord };
export async function signIn(_state: ActionState, form: FormData): Promise<ActionState> {
  const client = await createSupabaseServerClient();
  if (!client) return { error: "Sign-in is not configured yet. Complete the Supabase setup." };
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!username || username.length > 254 || !password || password.length > 512) return { error: "Enter your username and password." };
  try {
    const { error } = await client.auth.signInWithPassword({ email: username === adminUsername ? adminAuthEmail : username, password });
    if (error || !(await editorSession())) {
      await client.auth.signOut();
      return { error: "Unable to sign in. Check your credentials and editor access." };
    }
  } catch { return { error: "Sign-in could not connect. Try again shortly." }; }
  redirect("/admin");
}
export async function signOut() {
  const client = await createSupabaseServerClient();
  await client?.auth.signOut();
  redirect("/admin/login");
}
export async function saveContent(_state: ActionState, form: FormData): Promise<ActionState> {
  const session = await editorSession();
  if (!session) return { error: "Your editor session has expired. Sign in again before saving." };
  const raw = String(form.get("payload") ?? "");
  const revision = Number(form.get("revision"));
  if (new TextEncoder().encode(raw).length > 64000 || !Number.isSafeInteger(revision) || revision < 0) return { error: "Invalid content or revision. Reload the dashboard." };
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return { error: "The submitted content is invalid." }; }
  const parsed = payloadSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues.map(i => `${i.path.join(" → ")}: ${i.message}`).slice(0, 6).join("; ") };
  const review = form.get("review");
  if (review === "true" && form.get("confirmReview") !== "on") return { error: "Confirm that the pastor has reviewed all saved content." };
  let data: unknown;
  let failureCode: string | null;
  try {
    const result = await session.client.rpc("save_portfolio_content", { p_payload: parsed.data, p_expected_revision: revision, p_reviewed: review === "true" ? true : review === "false" ? false : null });
    data = result.data; failureCode = result.error ? result.error.code || "DATABASE" : null;
  } catch { return { error: "The connection was interrupted. Your draft is still here. Reload and check the saved revision before retrying." }; }
  if (failureCode) return { error: failureCode === "40001" ? "Someone saved a newer revision. Reload before editing again; your current draft has not been saved." : "Save failed. Check your connection, editor access and database setup. Your draft is still here." };
  const record = recordSchema.safeParse(data);
  if (!record.success) return { error: "The database returned an unsupported record. Reload to verify the saved content." };
  updateTag("portfolio-content");
  return { success: "Saved successfully.", record: record.data };
}
