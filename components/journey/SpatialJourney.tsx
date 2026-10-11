"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useContent } from "@/lib/cms/context";
import { sceneName } from "@/lib/cms/display";
import { spatialChapters } from "@/lib/three/spatial-path";
import { SermonTheater } from "@/components/site/SermonTheater";
import { ChurchGallery } from "@/components/site/ChurchGallery";

const SpatialScene = dynamic(() => import("@/components/canvas/SpatialScene"), { ssr: false });
const stops = spatialChapters;
const moments = spatialChapters;
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function SpatialJourney() {
  const { profile, stations: ministryStations } = useContent();
  const router = useRouter();
  const progress = useRef(0);
  const jump = useRef(0);
  const [showIntro, setShowIntro] = useState(true);
  const introVisible = useRef(true);
  const [reading, setReading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [moment, setMoment] = useState(0);
  const meter = useRef<HTMLSpanElement>(null);
  const theater = useRef<HTMLDialogElement>(null);
  const [media, setMedia] = useState<number | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [ministry, setMinistry] = useState<number | null>(null);
  const ministryDialog = useRef<HTMLDialogElement>(null);
  const gallery = useRef<HTMLDialogElement>(null);
  const openGallery = useCallback(() => setGalleryOpen(true), []);
  const handleReady = useCallback(() => {}, []);
  const handleFailure = useCallback(() => setFailed(true), []);
  const handleInvite = useCallback(() => { router.push("/contact"); }, [router]);

  useEffect(() => {
    if (!galleryOpen || reading || failed) return;
    const dialog = gallery.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = overflow; };
  }, [galleryOpen, reading, failed]);

  useEffect(() => {
    if (ministry === null || reading || failed) return;
    const dialog = ministryDialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = overflow; };
  }, [ministry, reading, failed]);

  useEffect(() => {
    if (media === null || reading || failed) return;
    const dialog = theater.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [media, reading, failed]);

  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReading(query.matches); setMedia(null); scrollTo(0, 0); };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (reading) return;
    const sync = () => {
      const extent = document.documentElement.scrollHeight - innerHeight;
      const p = extent > 0 ? Math.min(1, Math.max(0, scrollY / extent)) : 0;
      progress.current = p;

      if (meter.current) meter.current.style.transform = `scaleX(${p})`;
      const show = p < 0.04;
      if (show !== introVisible.current) {
        introVisible.current = show;
        setShowIntro(show);
      }
    };
    sync();
    addEventListener("scroll", sync, { passive: true });
    addEventListener("resize", sync);
    return () => { removeEventListener("scroll", sync); removeEventListener("resize", sync); };
  }, [reading]);

  function travel(at: number) {
    progress.current = at;
    jump.current += 1;
    scrollTo({ top: at * (document.documentElement.scrollHeight - innerHeight), behavior: "instant" });
  }

  if (reading || failed) return <div className="spatial-reading">
    <header><Link href="/">FK / A journey of calling</Link>{!failed && <button onClick={() => { progress.current = 0; setMoment(0); setReading(false); scrollTo(0, 0); }}>Enter the spatial journey ↗</button>}</header>
    <main id="content"><p className="spatial-kicker">A journey of calling / Romans 8:31</p><h1>A life of faith.<br />A calling to serve.</h1>
      <p className="spatial-kicker">01 / The Calling</p><Image src="/pastor/pastor.jpg" alt={sceneName(profile)} width={361} height={512} />
      <h2>{sceneName(profile)}</h2><p>{profile.descriptor}</p><p>{profile.church}<br />{profile.location}</p>{profile.biography.map(p => <p key={p}>{p}</p>)}
      <p className="spatial-kicker">02 / The Ministry Path</p><h2>The calling becomes service.</h2><ul>{profile.ministryFocus.map(f => <li key={f}>{f}</li>)}</ul><a href="/contact">Continue with an invitation ↗</a><ChurchGallery /><SermonTheater />
    </main>
  </div>;

  return <div className={`spatial-journey ${showIntro ? "is-intro" : ""}`}>
    <header className="spatial-header"><Link href="/" className="spatial-mark">FK<span>{sceneName(profile).toUpperCase()}</span></Link></header>
    <main id="content" className="spatial-scroll" aria-label="Scroll through the calling, ministry, messages, leadership and invitation">
      <div className="spatial-viewport" aria-hidden="true">
        <SceneBoundary onFailure={handleFailure}><SpatialScene combined={false} portraitOpening={false} sacred jump={jump} progress={progress} onReady={handleReady} onFailure={handleFailure} onChapter={setMoment} onMedia={setMedia} onMinistry={index => { travel(ministryStations[index].at); setMinistry(index); }} onInvite={handleInvite} onGallery={openGallery} /></SceneBoundary>
      </div>
      <div className="sr-only"><h1>The journey of {sceneName(profile)}</h1><p>{profile.scripture.ref}</p><h2>The Calling</h2><p>{profile.descriptor}. {profile.church}. {profile.location}.</p><h2>The Ministry Path</h2><p>{profile.ministryFocus.join(". ")}</p></div>
      <noscript><div className="spatial-nojs"><h2>A life of service</h2><p>{profile.biography[0]}</p><a href="/contact">Ministry invitations</a></div></noscript>
    </main>
    <div className={`ministry-intro ${showIntro ? "" : "is-away"}`}>
      <p className="spatial-kicker">{profile.scripture.ref}</p>
      <p className="ministry-intro-name">{profile.name}</p>
      <p className="ministry-intro-roles">{profile.descriptor.replaceAll(" | ", " · ")}</p>
      <p className="ministry-intro-place">{profile.church} · {profile.location}</p>
      <p className="scroll-explore">Scroll to explore <i aria-hidden="true" /></p>
    </div>
    <aside className={`spatial-caption ${moment === 0 ? "spatial-welcome" : ""} ${showIntro ? "is-quiet" : ""}`} aria-live="polite">
      <p className="spatial-kicker">{moment === 0 ? "01 / Profile" : `0${moment} / ${moments[moment].label}`}</p>
      <h2>{moment === 0 ? "Meet the pastor" : moments[moment].title}</h2>
      <p>{moment === 0 ? "His story and calling." : moments[moment].note}</p>
      {moment === 3 && <button onClick={() => setMedia(0)}>Watch messages ↗</button>}
      {moment === 5 && <a href="/contact">Get in touch ↗</a>}
    </aside>
    <dialog ref={ministryDialog} className="spatial-theater-dialog ministry-screen" onClose={event => { if (event.target === event.currentTarget) setMinistry(null); }} onClick={event => { if (event.target === event.currentTarget) setMinistry(null); }} aria-label="Ministry section">
      <button className="theater-close" autoFocus onClick={() => setMinistry(null)}>Close ×</button>
      {ministry !== null && <article className="ministry-reading">
        <p className="spatial-kicker">0{ministry + 1} / Ministry</p>
        <h2>{ministryStations[ministry].title}</h2>
        <p>{ministryStations[ministry].meaning}</p>
      </article>}
    </dialog>
    <dialog ref={gallery} className="spatial-theater-dialog" onClose={event => { if (event.target === event.currentTarget) setGalleryOpen(false); }} onClick={event => { if (event.target === event.currentTarget) setGalleryOpen(false); }} aria-label="Church gallery">
      <button className="theater-close" autoFocus onClick={() => setGalleryOpen(false)}>Close gallery ×</button>
      {galleryOpen && <ChurchGallery />}
    </dialog>
    <dialog ref={theater} className="spatial-theater-dialog" onClose={() => setMedia(null)} onClick={event => { if (event.target === event.currentTarget) setMedia(null); }} aria-label="Message theater">
      <button className="theater-close" autoFocus onClick={() => setMedia(null)}>Close theater ×</button>
      {media !== null && <SermonTheater key={media} initialIndex={media} />}
    </dialog>
    <details className="spatial-menu"><summary>Menu</summary><div className="spatial-menu-panel">
      <button onClick={() => { setMedia(null); setReading(true); scrollTo(0, 0); }}>Read profile</button><button onClick={openGallery}>Church gallery</button><button onClick={() => setMedia(0)}>Watch messages</button><a href="/contact">Contact</a>
    </div></details>
    <footer className="spatial-controls"><nav aria-label="Journey chapters">{stops.map((stop, index) => <button key={stop.label} aria-current={moment === index ? "step" : undefined} onClick={() => travel(stop.at)}><span>0{index}</span>{stop.label}</button>)}</nav><span className={`spatial-scroll-hint ${showIntro ? "is-quiet" : ""}`}>{moment === 5 ? "You have arrived" : "Scroll to explore"} <span aria-hidden="true">↓</span></span><div className="spatial-meter"><span ref={meter} /></div></footer>
  </div>;
}







