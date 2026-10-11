import { loadEnvConfig } from "@next/env";
import { supabaseConfig } from "../lib/supabase/config";
import { recordSchema } from "../lib/cms/schema";

async function check() {
  loadEnvConfig(process.cwd());
  const config = supabaseConfig();
  if (!config) { console.log("Configuration: missing or invalid public Supabase URL/key. Values were not printed."); process.exitCode = 1; return; }
  console.log("Configuration: valid public Supabase URL/key present.");
  const headers = { apikey: config.key };
  const response = await fetch(`${config.url}/rest/v1/portfolio_content?id=eq.main&select=payload,reviewed_by_pastor,revision,updated_at,reviewed_at`, { headers, signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    console.log(`Content database: HTTP ${response.status}; code ${typeof body.code === "string" ? body.code : "unavailable"}.`);
    if (body.code === "PGRST205") console.log("The portfolio_content table is missing. Apply the CMS migration first.");
    process.exitCode = 1;
  } else {
    const rows = await response.json();
    const record = recordSchema.safeParse(Array.isArray(rows) ? rows[0] : null);
    console.log(!Array.isArray(rows) || rows.length === 0 ? "Content database: connected; no content record yet. Run the safe seed or initialise through an authorised editor." : record.success ? `Content database: valid saved record; revision ${record.data.revision}; ${record.data.payload.stations.length} boards; review ${record.data.reviewed_by_pastor ? "confirmed" : "pending"}.` : "Content database: connected, but the saved record does not match the supported schema.");
  }
  const membership = await fetch(`${config.url}/rest/v1/portfolio_editors?select=user_id&limit=1`, { headers, signal: AbortSignal.timeout(15000) });
  console.log(`Anonymous membership access: ${membership.status === 401 || membership.status === 403 ? "denied as expected" : `HTTP ${membership.status}; inspect permissions`}.`);
  const settings = await fetch(`${config.url}/auth/v1/settings`, { headers, signal: AbortSignal.timeout(15000) });
  if (settings.ok) {
    const data = await settings.json();
    console.log(`Auth: reachable; public signup ${data.disable_signup === true ? "disabled" : "enabled — disable it for this private dashboard"}; email provider ${data.external?.email ? "enabled" : "disabled"}.`);
  } else console.log(`Auth: HTTP ${settings.status}.`);
}
check().catch(() => { console.log("Connection check failed: network unavailable or request timed out. No credential values were printed."); process.exitCode = 1; });
