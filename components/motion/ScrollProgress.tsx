"use client";

import { motion, useSpring, type MotionValue } from "framer-motion";
import { useJourneyScroll, useMotionPreference } from "./hooks";

export function ScrollProgress({ source }: { source?: MotionValue<number> }) {
  const reduced = useMotionPreference();
  const journey = useJourneyScroll();
  const value = source ?? journey.scrollYProgress;
  const scaleX = useSpring(value, { stiffness: 140, damping: 26 });

  return (
    <span className="scroll-meter" aria-hidden="true">
      <motion.span style={{ scaleX: reduced ? 1 : scaleX }} />
    </span>
  );
}
