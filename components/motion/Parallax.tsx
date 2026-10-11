"use client";

import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { useCompactMotion, useJourneyScroll, useMotionPreference } from "./hooks";

const distance = { slow: 16, medium: 36, fast: 64 } as const;

export function Parallax({
  children,
  className,
  speed = "medium",
  progress,
}: {
  children: ReactNode;
  className?: string;
  speed?: keyof typeof distance;
  progress?: MotionValue<number>;
}) {
  const reduced = useMotionPreference();
  const compact = useCompactMotion();
  const journey = useJourneyScroll();
  const source = progress ?? journey.scrollYProgress;
  const travel = reduced ? 0 : distance[speed] * (compact ? 0.28 : 1);
  const y = useTransform(source, [0, 1], [travel, -travel]);
  const smooth = useSpring(y, { stiffness: 90, damping: 22, mass: 0.45 });

  return (
    <motion.div className={className} style={{ y: reduced ? 0 : smooth }}>
      {children}
    </motion.div>
  );
}
