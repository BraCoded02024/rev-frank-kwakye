"use client";

import { sectionIdForPath } from "@/lib/content/chapters";
import { introGate } from "@/lib/intro-gate";
import { hrefFor, journeyApi, sectionAt } from "@/lib/journey";
import { chooseQuality, motion } from "@/lib/motion";
import { publishScroll, type ScrollSample } from "@/lib/scroll-state";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Experience = dynamic(() => import("@/components/canvas/Experience"), { ssr: false });

const defaultTitle = "Rev. Frank Kwakye | Senior Pastor, Bible Teacher & Leadership Trainer, Accra, Ghana";

function classicOn() {
  try {
    return localStorage.getItem("fk-classic") === "1";
  } catch {
    return false;
  }
}

export function Engine() {
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const classic = classicOn() || reduced || document.documentElement.dataset.classic === "true";
    motion.reduced = reduced;
    motion.quality = classic ? "fallback" : chooseQuality();
    const root = document.documentElement;
    root.dataset.classic = classic || motion.quality === "fallback" ? "true" : "false";

    let lenis: { raf: (time: number) => void; resize: () => void; destroy: () => void } | null = null;
    let stopped = false;

    const finish = () => {
      motion.intro = 1;
      motion.mode = "live";
      root.classList.remove("booting", "filming");
      root.classList.add("live");
      lenis?.resize();
      try {
        localStorage.setItem("fk-intro-seen", "1");
      } catch {
        /* ignore */
      }
    };

    const skip = () => finish();
    document.getElementById("skip-intro")?.addEventListener("click", skip);

    const sync = (sample?: ScrollSample) => {
      // A late scroll frame must never reclaim navigation from the spatial homepage.
      if (stopped || window.location.pathname === "/" || window.location.pathname === "/contact") return;
      publishScroll(sample);
      if (motion.mode !== "live" || !positioned) return;
      const section = sectionAt(motion.progress);
      const href = hrefFor(section.id);
      if (href !== "/contact" && href !== window.location.pathname) window.history.replaceState(null, "", href);
      document.title = href === "/about" ? defaultTitle : `${section.nav} · Rev. Frank Kwakye`;
    };
    const onNativeScroll = () => sync();
    const initialPath = window.location.pathname;
    let positioned = false;
    const onResize = () => {
      lenis?.resize();
      sync();
    };

    const boot = async () => {
      await introGate.wait();
      if (stopped) return;
      root.classList.add("js");
      if (document.fonts?.ready) await document.fonts.ready;
      if (stopped) return;
      const line = document.getElementById("boot-line");
      if (line) line.style.transform = "scaleX(1)";
      if (!classic && motion.quality !== "fallback") setWebgl(true);
      finish();
      await connectScroll();
      if (stopped) return;
      const id = sectionIdForPath(initialPath);
      if (id !== "word") document.getElementById(id)?.scrollIntoView();
      positioned = true;
      sync();
    };

    let raf = 0;
    const connectScroll = async () => {
      if (classic || reduced) {
        journeyApi.scrollTo = (target) => {
          document.querySelector(target)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
        };
        window.addEventListener("scroll", onNativeScroll, { passive: true });
        return;
      }
      const { default: Lenis } = await import("lenis");
      if (stopped) return;
      const instance = new Lenis({ lerp: 0.085 });
      lenis = instance;
      journeyApi.scrollTo = (target) => instance.scrollTo(target, { duration: 1.2 });
      instance.on("scroll", (current) => {
        sync({ scroll: current.scroll, progress: current.progress });
      });
      instance.resize();
      const loop = (time: number) => {
        instance.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };

    void boot();

    window.addEventListener("resize", onResize);
    const onPop = () => {
      if (window.location.pathname === "/" || window.location.pathname === "/contact") return;
      const id = sectionIdForPath(window.location.pathname);
      journeyApi.scrollTo(`#${id}`);
    };
    window.addEventListener("popstate", onPop);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
      journeyApi.scrollTo = target => { document.querySelector(target)?.scrollIntoView(); };
      root.classList.remove("js", "live", "booting", "filming");
      delete root.dataset.classic;
      document.getElementById("skip-intro")?.removeEventListener("click", skip);
      window.removeEventListener("scroll", onNativeScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  useEffect(() => {
    const toggle = document.getElementById("classic-toggle");
    if (!toggle) return;
    const onClick = () => {
      const next = document.documentElement.dataset.classic !== "true";
      try {
        localStorage.setItem("fk-classic", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      window.location.reload();
    };
    toggle.addEventListener("click", onClick);
    return () => toggle.removeEventListener("click", onClick);
  }, []);

  if (!webgl) return null;
  return (
    <div className="canvas-root" aria-hidden="true">
      <Experience />
    </div>
  );
}




