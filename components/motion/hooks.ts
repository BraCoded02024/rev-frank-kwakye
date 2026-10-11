"use client";

import { scrollY, scrollYProgress, trackSection } from "@/lib/scroll-state";
import { useMemo, useSyncExternalStore } from "react";

/** Same values Framer's useScroll would provide, written by Lenis instead of a second listener. */
export function useJourneyScroll() {
  return { scrollY, scrollYProgress };
}

export function useSectionProgress(id: string) {
  return useMemo(() => trackSection(id), [id]);
}

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function reducedNow() {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.classic === "true"
  );
}

/** Reduced motion, and the site's Classic view, both settle on the readable end state. */
export function useMotionPreference() {
  return useSyncExternalStore(subscribeReduced, reducedNow, () => false);
}

function subscribeCompact(onChange: () => void) {
  const query = window.matchMedia("(max-width: 767px)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function useCompactMotion() {
  return useSyncExternalStore(subscribeCompact, () => window.matchMedia("(max-width: 767px)").matches, () => false);
}
