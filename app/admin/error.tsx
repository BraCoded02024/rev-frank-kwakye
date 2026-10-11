"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="content" className="admin-login"><h1>The workspace could not open.</h1><p>Check your connection and try again. No content has been changed.</p><button onClick={reset}>Try again</button><a href="/admin/login">Sign in again</a></main>; }
