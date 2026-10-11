import { sections } from "@/lib/content/chapters";
import { progressFromScroll } from "@/lib/journey";
import { motion as journey } from "@/lib/motion";
import { motionValue, type MotionValue } from "framer-motion";

/**
 * One scroll owner.
 * Lenis (or native scroll, when Lenis is off) calls publishScroll().
 * Everything else reads these MotionValues. Nothing else listens to scroll.
 */
export const scrollY = motionValue(0);
export const scrollYProgress = motionValue(0);

const tracks = new Map<string, MotionValue<number>>();
const listeners = new Set<() => void>();

export function trackSection(id: string) {
  let value = tracks.get(id);
  if (!value) {
    value = motionValue(0);
    tracks.set(id, value);
  }
  return value;
}

for (const section of sections) trackSection(section.id);

export function subscribeScroll(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** 0 when the section enters at the bottom of the viewport, 1 when it leaves at the top. */
export function measureSectionProgress(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const span = window.innerHeight + rect.height;
  if (span <= 0) return 0;
  return clamp01((window.innerHeight - rect.top) / span);
}

export type ScrollSample = {
  scroll: number;
  progress: number;
};

export function publishScroll(sample?: ScrollSample) {
  if (typeof window === "undefined") return;
  const y = sample?.scroll ?? window.scrollY;
  const limit = document.documentElement.scrollHeight - window.innerHeight;
  scrollY.set(y);
  scrollYProgress.set(sample?.progress ?? (limit > 0 ? y / limit : 0));
  journey.progress = progressFromScroll();

  for (const [id, value] of tracks) {
    const element = document.getElementById(id);
    if (!element) continue;
    value.set(measureSectionProgress(element));
  }

  listeners.forEach((listener) => listener());
}
