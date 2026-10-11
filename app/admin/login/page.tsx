import Link from "next/link";
import { redirect } from "next/navigation";
import { editorSession } from "@/lib/cms/auth";
import { supabaseConfig } from "@/lib/supabase/config";
import { SignInForm } from "./SignInForm";
export default async function LoginPage() {
  if (await editorSession()) redirect("/admin");
  return <main id="content" className="admin-login"><div className="admin-monogram">FK</div><p className="admin-eyebrow">PRIVATE EDITORIAL WORKSPACE</p><h1>A place to tend<br />the ministry story.</h1><p>Sign in to update the pastor’s profile and ministry boards.</p><SignInForm configured={!!supabaseConfig()} /><Link href="/">← Return to the public journey</Link></main>;
}
