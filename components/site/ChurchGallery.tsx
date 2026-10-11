"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { churchPhotos } from "@/lib/content/church-photos";
import "./ChurchGallery.css";

export function ChurchGallery() {
  const [selected, setSelected] = useState<number | null>(null);
  const viewer = useRef<HTMLDialogElement>(null);
  const photo = selected === null ? null : churchPhotos[selected];
  const isOpen = selected !== null;

  useEffect(() => {
    if (!isOpen) return;
    const dialog = viewer.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = overflow; };
  }, [isOpen]);

  function step(direction: number) {
    setSelected(value => value === null ? null : (value + direction + churchPhotos.length) % churchPhotos.length);
  }

  return <section className="church-gallery" aria-labelledby="church-gallery-title">
    <div className="church-gallery-heading"><p>NEW LIFE ASSEMBLY OF GOD · OYARIFA</p><h2 id="church-gallery-title">Moments of faith.</h2><span>A glimpse into a life of ministry. Select a photograph to look closer.</span></div>
    <div className="church-gallery-grid">
      {churchPhotos.map((item, index) => <button className="church-photo" key={item.title} onClick={() => setSelected(index)} aria-label={`View ${item.title}`}>
        <span className="church-photo-frame"><Image src={item.image} alt={item.alt} sizes="(max-width: 650px) 85vw, 30vw" placeholder="blur" /></span>
        <span className="church-photo-caption"><small>0{index + 1}</small><strong>{item.title}</strong><span aria-hidden="true">↗</span></span>
      </button>)}
    </div>
    <dialog ref={viewer} className="church-photo-viewer" aria-label="Church photograph" onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null); }} onKeyDown={event => {
      if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
    }}>
      <button className="church-photo-close" autoFocus onClick={() => setSelected(null)}>Close photograph ×</button>
      {photo && <><Image key={photo.image.src} src={photo.image} alt={photo.alt} sizes="90vw" className="church-photo-full" /><div className="church-photo-navigation"><button onClick={() => step(-1)} aria-label="Previous photograph">←</button><p aria-live="polite">{photo.title}<small>{selected! + 1} / {churchPhotos.length}</small></p><button onClick={() => step(1)} aria-label="Next photograph">→</button></div></>}
    </dialog>
  </section>;
}
