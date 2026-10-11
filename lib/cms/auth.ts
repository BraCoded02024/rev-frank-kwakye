import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function editorSession() {
  const client = await createSupabaseServerClient();
  if (!client) return null;
  try {
    // getUser verifies the token with Auth; never authorize from getSession alone.
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    const { data: member, error: membershipError } = await client.from("portfolio_editors").select("user_id").eq("user_id", data.user.id).maybeSingle();
    if (membershipError || !member) return null;
    return { client, user: data.user };
  } catch { return null; }
}
export async function requireEditor() {
  const session = await editorSession();
  if (!session) redirect("/admin/login");
  return session;
}
