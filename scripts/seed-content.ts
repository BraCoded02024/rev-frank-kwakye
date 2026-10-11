import { writeFileSync } from "node:fs";
import { defaultPayload } from "../lib/cms/schema";
const json = JSON.stringify(defaultPayload).replace(/'/g, "''");
writeFileSync("supabase/seed.sql", `-- Generated from validated source defaults. Existing saved edits are preserved.\ninsert into public.portfolio_content (id, payload, reviewed_by_pastor)\nvalues ('main', '${json}'::jsonb, false)\non conflict (id) do nothing;\n`);
console.log("Wrote supabase/seed.sql; existing rows will not be overwritten.");
