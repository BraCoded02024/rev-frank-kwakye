import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, ArrowLeft, MessageCircle, Mail, MapPin } from "lucide-react";
import { ContactPanel } from "@/components/ui/ContactPanel";
import { privateContact } from "@/lib/content/private";
import { getPublicContent } from "@/lib/cms/read";
import "./invitation.css";

export const metadata: Metadata = {
  title: "An invitation",
  description: "Invite Rev. Frank Kwakye for preaching, Bible teaching, or leadership development.",
};

export default async function Page() {
  const { profile } = await getPublicContent();
  return <div className="invitation-page">
    <header className="invitation-nav">
      <Link href="/" className="invitation-brand"><span>FK</span><span>{profile.name.toUpperCase()}<br />A LIFE OF SERVICE</span></Link>
      <Link href="/" className="invitation-back"><ArrowLeft size={14} /> Back to the journey</Link>
    </header>
    <main id="content" className="invitation-main">
      <div className="invitation-heading">
        <p className="invitation-eyebrow"><span /> LET’S CONTINUE THE CONVERSATION</p>
        <h1>An invitation<br />to <em>serve together.</em></h1>
        <p>Every gathering begins with a conversation. Share what you have in mind for your church, community, or leadership team.</p>
      </div>
      <div className="invitation-layout">
        <aside className="invitation-aside" aria-label="About your invitation">
          <figure className="invitation-portrait">
            <Image src="/pastor/pastor.jpg" alt={profile.name} width={361} height={512} preload sizes="(max-width: 700px) 88vw, 360px" />
            <figcaption><span>AT THE HEART OF THE MINISTRY</span><p>Faith. Teaching.<br />A life of service.</p></figcaption>
          </figure>
          <div className="invitation-profile">
            <h2>{profile.name}</h2>
            <p>Senior Pastor · Bible Teacher<br />Christian Leadership Trainer</p>
            <div><MapPin size={15} /><span>{profile.church}<br />{profile.location}</span></div>
          </div>
          <div className="invitation-direct">
            <p className="invitation-eyebrow">PREFER A CONVERSATION?</p>
            <a href={privateContact.whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /><span>Continue on WhatsApp<small>{privateContact.phoneIntl}</small></span><ArrowUpRight size={17} /></a>
            <a href={`mailto:${privateContact.email}`}><Mail size={18} /><span>Send an email<small>{privateContact.email}</small></span><ArrowUpRight size={17} /></a>
          </div>
        </aside>
        <div className="invitation-form-card">
          <div className="invitation-card-heading"><span>YOUR INVITATION</span><span>01 — 03</span></div>
          <ContactPanel />
          <div className="invitation-aftercare"><span>WHAT HAPPENS NEXT</span><p>Your event details help begin the conversation about the gathering and availability. An invitation is a request; arrangements are confirmed directly with you.</p></div>
        </div>
      </div>
      <div className="invitation-areas"><p className="invitation-eyebrow">A SHARED PURPOSE</p><div><span>Preaching &amp; teaching</span><span>Leadership development</span><span>Discipleship &amp; formation</span></div></div>
    </main>
    <footer className="invitation-footer"><span>REV. FRANK KWAKYE</span><span>Oyarifa, Accra · Ghana</span><Link href="/">Return to the journey <ArrowUpRight size={14} /></Link></footer>
  </div>;
}
