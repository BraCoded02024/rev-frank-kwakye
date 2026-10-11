"use client";

import Image from "next/image";
import { useState } from "react";
import { messageHighlights } from "@/lib/content/media";
import "./SermonTheater.css";
import { useContent } from "@/lib/cms/context";
import { sceneName } from "@/lib/cms/display";

export function SermonTheater({ initialIndex = 0 }: { initialIndex?: number }) {
  const { profile } = useContent();
  const [selected, setSelected] = useState(initialIndex);
  const [error, setError] = useState(false);
  const message = messageHighlights[selected] ?? messageHighlights[0];
  return <section className="sermon-theater" aria-label="Preaching and teaching">
    <div className="sermon-heading"><p>PREACHING &amp; TEACHING</p><h2>A seat for the message.</h2><span>{sceneName(profile)}</span></div>
    <div className="sermon-screen">
      {message.src ? <video key={message.src} src={message.src} controls playsInline preload="metadata" onError={() => setError(true)} aria-label={message.title} /> :
        <div className="sermon-poster"><Image src="/pastor/pastor.jpg" alt="" width={361} height={512} /><div><span>THE MESSAGE COLLECTION</span><h3>{message.title}</h3><p>Recordings coming soon</p></div></div>}
      {error && <p role="alert">This recording could not be loaded. Please try again later.</p>}
    </div>
    <div className="sermon-stage" aria-hidden="true" />
    <div className="sermon-selection"><p>{message.title}</p><span>{message.src ? "Use the player controls to watch" : "A place to listen, reflect and grow."}</span></div>
    <nav className="sermon-topics" aria-label="Choose a message">{messageHighlights.map((item, index) =>
      <button key={item.title} onClick={() => { setSelected(index); setError(false); }} aria-pressed={selected === index}><span>0{index + 1}</span>{item.title}<small>{item.src ? "Watch recording" : "Coming soon"}</small></button>
    )}</nav>
  </section>;
}

