"use server";

import { privateContact } from "@/lib/content/private";
import { z } from "zod";

const attempts = new Map<string, number[]>();

const invitationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(30).regex(/^[0-9+\s()-]+$/, "Enter a phone number."),
  email: z.string().trim().email().max(120),
  eventDate: z.string().trim().min(2).max(40),
  venue: z.string().trim().min(2).max(160),
  theme: z.string().trim().min(2).max(160),
  audience: z.string().trim().min(2).max(160),
  assignment: z.string().trim().min(2).max(500),
  company: z.string().max(0).optional().or(z.literal("")),
});

export type InvitationState = { ok: boolean; message: string; mailto?: string } | null;

function invitationText(data: { name: string; phone: string; email: string; eventDate: string; venue: string; theme: string; audience: string; assignment: string }) {
  return `From: ${data.name}\nPhone: ${data.phone}\nReply email: ${data.email}\nEvent date: ${data.eventDate}\nVenue: ${data.venue}\nTheme: ${data.theme}\nExpected audience: ${data.audience}\nNature of the assignment: ${data.assignment}`;
}

function invitationMailto(to: string, data: Parameters<typeof invitationText>[0]) {
  const subject = `Invitation: ${data.theme}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(invitationText(data))}`;
}

export async function revealContact() {
  return {
    phone: privateContact.phoneDisplay,
    email: privateContact.email,
    whatsappUrl: privateContact.whatsappUrl,
  };
}

export async function sendInvitation(_prev: InvitationState, formData: FormData): Promise<InvitationState> {
  const parsed = invitationSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    eventDate: formData.get("eventDate"),
    venue: formData.get("venue"),
    theme: formData.get("theme"),
    audience: formData.get("audience"),
    assignment: formData.get("assignment"),
    company: formData.get("company") ?? "",
  });
  if (!parsed.success) return { ok: false, message: "Please complete every field." };
  if (parsed.data.company) return { ok: true, message: "Thank you. Your invitation has been received." };

  const now = Date.now();
  const recent = (attempts.get("invite") ?? []).filter((stamp) => now - stamp < 10 * 60 * 1000);
  if (recent.length >= 5) return { ok: false, message: "Please wait a few minutes before sending another invitation." };
  recent.push(now);
  attempts.set("invite", recent);

  const pastorEmail = process.env.PASTOR_NOTIFY_EMAIL || privateContact.email;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INVITE_FROM_EMAIL;
  if (!apiKey || !from) {
    return { ok: true, message: "Your email app is opening with this invitation addressed to Rev. Kwakye. Press send there so it reaches him.", mailto: invitationMailto(pastorEmail, parsed.data) };
  }

  try {
  const replyTo = parsed.data.email;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: pastorEmail,
      reply_to: replyTo,
      subject: `Invitation: ${parsed.data.theme}`,
      text: invitationText(parsed.data),
    }),
  });
  if (!response.ok) return { ok: false, message: "The invitation could not be sent. Please use WhatsApp.", mailto: invitationMailto(pastorEmail, parsed.data) };
  return { ok: true, message: "Thank you. Your invitation has been sent to the pastor." };
  } catch {
    return { ok: false, message: "The invitation could not be sent. Please try again or use WhatsApp.", mailto: invitationMailto(pastorEmail, parsed.data) };
  }
}

