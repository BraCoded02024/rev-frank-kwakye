export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  if (key.startsWith("sb_secret_")) return null;
  if (key.split(".").length === 3) {
    try {
      const claims = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (claims.role !== "anon") return null;
    } catch { return null; }
  }
  try { if (new URL(url).protocol !== "https:") return null; } catch { return null; }
  return { url, key };
}
