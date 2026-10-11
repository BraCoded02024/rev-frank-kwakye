"use client";
import { useActionState } from "react";
import { signIn } from "../actions";
export function SignInForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(signIn, {});
  return <form action={action}><fieldset disabled={!configured || pending}><label>Username<input name="username" type="text" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button type="submit">{pending ? "Signing in…" : "Sign in"}</button></fieldset><p role="status">{state.error}</p>{!configured && <p className="admin-notice">Sign-in is unavailable until the Supabase environment variables, migration and authorised editor account are configured.</p>}</form>;
}
