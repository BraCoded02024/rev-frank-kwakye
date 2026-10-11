import "server-only";
import { supabaseConfig } from "@/lib/supabase/config";
import { publicContent, recordSchema, type ContentRecord } from "./schema";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getPublicContent() {
  const config = supabaseConfig();
  if (!config) return publicContent();
  try {
    const response = await fetch(`${config.url}/rest/v1/portfolio_content?id=eq.main&select=payload,reviewed_by_pastor,revision,updated_at,reviewed_at`, {
      headers: { apikey: config.key }, signal: AbortSignal.timeout(3000), next: { revalidate: 60, tags: ["portfolio-content"] },
    });
    if (!response.ok) return publicContent();
    const rows: unknown = await response.json();
    const parsed = recordSchema.safeParse(Array.isArray(rows) ? rows[0] : null);
    return parsed.success ? publicContent(parsed.data.payload, parsed.data.reviewed_by_pastor, true) : publicContent();
  } catch { return publicContent(); }
}
export async function getAdminContent(client: SupabaseClient): Promise<{ record: ContentRecord | null; error: string | null }> {
  const { data, error } = await client.from("portfolio_content").select("payload,reviewed_by_pastor,revision,updated_at,reviewed_at").eq("id", "main").maybeSingle();
  if (error) return { record: null, error: "Content could not be loaded. Check the connection and database migration." };
  if (!data) return { record: null, error: null };
  const parsed = recordSchema.safeParse(data);
  if (!parsed.success) return { record: null, error: "The saved record does not match the supported content format. Restore or migrate it before editing." };
  return { record: parsed.data, error: null };
}
