"use client";

import { sendInvitation, type InvitationState } from "@/app/actions/contact";
import { useActionState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { privateContact } from "@/lib/content/private";

export function ContactPanel() {
  const [state, action, pending] = useActionState<InvitationState, FormData>(sendInvitation, null);
  useEffect(() => {
    if (state?.mailto) window.location.assign(state.mailto);
  }, [state]);
  return <div className="contact-panel">
    <form action={action} className="invite-form" aria-label="Invitation details">
      <h2>Tell us about your gathering.</h2>
      <p className="invite-intro">A few details to help us understand your invitation. All fields are required.</p>
      <fieldset><legend><span>01</span> A little about you</legend>
        <div className="invite-field-grid">
          <label>Your name<input name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Your full name" /></label>
          <label>Phone number<input name="phone" type="tel" required minLength={7} maxLength={30} inputMode="tel" autoComplete="tel" placeholder="Your phone number" /></label>
          <label>Reply email<input name="email" type="email" required maxLength={120} autoComplete="email" placeholder="Your email address" /></label>
        </div>
      </fieldset>
      <fieldset><legend><span>02</span> The gathering</legend>
        <div className="invite-field-grid">
          <label>Event date<input name="eventDate" type="date" required /></label>
          <label>Venue or location<input name="venue" required minLength={2} maxLength={160} placeholder="Church, city, or online" /></label>
          <label>Theme or focus<input name="theme" required minLength={2} maxLength={160} placeholder="What is the gathering about?" /></label>
          <label>Expected audience<input name="audience" required minLength={2} maxLength={160} placeholder="Who will be attending?" /></label>
        </div>
      </fieldset>
      <fieldset><legend><span>03</span> How can he serve?</legend>
        <label>Share your invitation<textarea name="assignment" required minLength={2} maxLength={500} rows={4} placeholder="Tell us about the occasion, the role you have in mind, and any helpful details." /></label>
      </fieldset>
      <input className="hp" tabIndex={-1} autoComplete="off" name="company" aria-hidden="true" />
      <button type="submit" disabled={pending}>{pending ? "Sending invitation…" : "Send invitation"}<ArrowUpRight size={18} /></button>
      {state && <div role="status" className={state.ok ? "form-ok" : "form-error"}><p>{state.message}</p>{!state.ok && <a href={privateContact.whatsappUrl} target="_blank" rel="noopener noreferrer">Continue on WhatsApp ↗</a>}</div>}
    </form>
  </div>;
}
