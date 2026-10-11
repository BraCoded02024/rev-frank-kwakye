"use client";

import Image from "next/image";
import { useMotionPreference } from "@/components/motion/hooks";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { Fragment, useEffect, useRef, useState } from "react";
import { useContent } from "@/lib/cms/context";
import { sceneName, nameLines, roleLines } from "@/lib/cms/display";
import { profile as defaults } from "@/lib/content/profile";

const chapters = [["prologue", "00", "The Word"], ["calling", "01", "The Calling"], ["formation", "02", "Formation"]] as const;

export function CallingJourney() {
  const { profile } = useContent();
  const reduced = useMotionPreference();

  const calling = useRef<HTMLElement>(null);
  const crossing = useRef<HTMLElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState("prologue");

  const { scrollYProgress } = useScroll();
  const { scrollYProgress: approach } = useScroll({ target: calling, offset: ["start start", "end end"] });
  const { scrollYProgress: passage } = useScroll({ target: crossing, offset: ["start end", "end start"] });
  const portraitScale = useTransform(approach, [0, 1], [0.88, 1.08]);
  const nameX = useTransform(approach, [0, 1], [0, -25]);
  const lastX = useTransform(approach, [0, 1], [0, 20]);
  const portraitY = useTransform(approach, [0, 1], [35, -35]);
  const reveal = useTransform(approach, [0.05, 0.4], [0, 1]);
  const detailY = useTransform(approach, [0.05, 0.5], [35, 0]);
  const gateScale = useTransform(passage, [0, 0.8], [0.65, 2.6]);
  const gateOpacity = useTransform(passage, [0, 0.55, 0.9], [1, 1, 0]);
  useMotionValueEvent(scrollYProgress, "change", () => {
    const current = [...chapters].reverse().find(([id]) => (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= window.innerHeight * 0.5);
    setActive(current?.[0] ?? "prologue");
  });

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let destroy: (() => void) | undefined;
    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.085 });
      destroy = () => lenis.destroy();
    });
    return () => { cancelled = true; destroy?.(); };
  }, [reduced]);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && !window.location.hash) {
      void film.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) { film.current?.pause(); setPlaying(false); }
    }, { threshold: 0.15 });
    if (film.current) observer.observe(film.current);
    return () => observer.disconnect();
  }, []);

  async function playFilm() {
    if (!film.current) return;
    if (playing) { film.current.pause(); setPlaying(false); return; }
    try { await film.current.play(); setPlaying(true); } catch { setPlaying(false); }
  }

  return (
    <div className="calling-world" data-reduced={reduced ? "true" : "false"}>
      <noscript><style>{`.calling-details{opacity:1!important;transform:none!important}.calling-runway{height:auto!important}.calling-scene{position:relative!important}`}</style></noscript>
      <header className="journey-header">
        <a href="#prologue" className="journey-signature" aria-label="Return to the prologue">FK<span>A life of service</span></a>
        <span className="journey-edition">THE JOURNEY OF A CALLING</span>
        <a className="journey-link" href="/contact">An invitation <span aria-hidden="true">↗</span></a>
      </header>
      <nav className="journey-index" aria-label="Journey chapters">
        {chapters.map(([id, number, title]) => <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined}><span>{number}</span><i aria-hidden="true" /><span className="index-title">{title}</span></a>)}
      </nav>
      <motion.div className="journey-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <main id="content" className="journey-main">
        <section id="prologue" className="journey-prologue" aria-labelledby="prologue-title">
          <div className="prologue-copy">
            <p className="journey-label">A foundation before a journey</p>
            <h1 id="prologue-title">A life<br /><em>of faith.</em><br />A calling.</h1>
            <p className="prologue-note">The journey of {sceneName(profile)}.<br />Rooted in Scripture. Given to service.</p>
            <a className="journey-enter" href="#calling">Enter the calling <span aria-hidden="true">↓</span></a>
          </div>
          <div className="prologue-film">
            <div className="film-frame">
              <video ref={film} src="/intro/intro.mp4" muted playsInline preload="metadata" onEnded={() => setPlaying(false)} aria-label="Bible prologue film" />
              <button type="button" className="film-control" onClick={playFilm} aria-pressed={playing}>{playing ? "Pause prologue" : "Play prologue"}<span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span></button>
            </div>
            <div className="scripture-caption"><span>ROMANS 8:31</span></div>
          </div>
          <div className="prologue-floor"><span>00 / PROLOGUE</span><span>Scroll to cross the threshold ↓</span><span>ACCRA, GHANA</span></div>
        </section>

        <section id="calling" ref={calling} className="calling-runway" aria-labelledby="calling-title">
          <div className="calling-scene">
            <div className="architectural-lines" aria-hidden="true"><i /><i /><i /></div>
            <p className="calling-chapter journey-label">01 <span /> The Calling</p>
            <motion.figure className="calling-portrait" style={reduced ? {} : { scale: portraitScale, y: portraitY }}>
              <Image src="/pastor/pastor.jpg" alt={sceneName(profile)} fill sizes="(max-width: 700px) 76vw, 42vw" preload />
              <figcaption>OYARIFA · ACCRA · GHANA</figcaption>
            </motion.figure>
            <h2 id="calling-title" className="calling-name"><span className="calling-reverend">REVEREND</span><motion.span style={reduced ? {} : { x: nameX }}>{nameLines(profile)[0]}</motion.span><motion.span className="calling-surname" style={reduced ? {} : { x: lastX }}>{nameLines(profile)[1]}<span className="name-period">.</span></motion.span></h2>
            <motion.div className="calling-details" style={reduced ? {} : { opacity: reveal, y: detailY }}>
              <p>{roleLines(profile.descriptor).map((role, index) => <Fragment key={index}>{role}.{index < roleLines(profile.descriptor).length - 1 && <br />}</Fragment>)}</p>
              <span>{profile.church}<br />{profile.location}</span>
            </motion.div>
            <p className="calling-margin">A person. A purpose. A life of service.</p>
            <a className="calling-next journey-link" href="#formation">Discover the foundations <span aria-hidden="true">↓</span></a>
          </div>
        </section>

        <section ref={crossing} className="journey-crossing" aria-label="The threshold into formation">
          <motion.div className="threshold-frame" style={reduced ? {} : { scale: gateScale, opacity: gateOpacity }} aria-hidden="true"><div /></motion.div>
          <div className="threshold-words"><p className="journey-label">The calling takes root</p><p>Formed by the Word.<br /><em>For the work ahead.</em></p><a className="journey-link" href="#formation">Through the threshold <span aria-hidden="true">↓</span></a></div>
        </section>

        <section id="formation" className="journey-formation" aria-labelledby="formation-title">
          <div className="formation-heading"><p className="journey-label">02 / Formation</p><h2 id="formation-title">A life shaped<br />by <em>Scripture.</em></h2><span className="formation-rule" /></div>
          <div className="formation-body"><p className="formation-lead">Study becomes service.<br />Faith becomes practice.</p><p>{profile.biography[1]}</p><dl><div><dt>THE FOUNDATION</dt><dd>{profile.education === defaults.education ? "Master of Arts in Biblical Studies" : profile.education.split(",")[0]}<span>{profile.education === defaults.education ? "Global University" : profile.education.split(",").slice(1).join(",")}</span></dd></div><div><dt>THE SERVICE</dt><dd>{roleLines(profile.descriptor)[0]}<span>{profile.church}<br />{profile.location}</span></dd></div></dl></div>
          <div className="formation-close"><span className="journey-label">The journey continues in service</span><p>Called to serve.<br /><em>Committed to lead.</em></p><a className="journey-link" href="/ministry">Explore the ministry <span aria-hidden="true">↗</span></a></div>
        </section>
      </main>
      <footer className="journey-footer"><span>{sceneName(profile).toUpperCase()}</span><span>{profile.church}<br />{profile.location}</span><a href="#prologue">Return to the beginning ↑</a></footer>
    </div>
  );
}



