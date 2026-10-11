"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useCompactMotion, useMotionPreference, useSectionProgress } from "./hooks";

/** Shared handoff: a chapter eases in from the one before it, then yields. */
export function SectionPass({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const progress = useSectionProgress(id);
  const reduced = useMotionPreference();
  const compact = useCompactMotion();
  const travel = reduced ? 0 : compact ? 0.35 : 1;
  const y = useSpring(
    useTransform(progress, [0, 0.2, 0.82, 1], [32 * travel, 0, 0, -18 * travel]),
    { stiffness: 80, damping: 26, mass: 0.35 },
  );
  const opacity = useTransform(progress, [0, 0.14, 0.86, 1], reduced ? [1, 1, 1, 1] : [0.72, 1, 1, 0.9]);

  return (
    <motion.div className={className} style={{ y: reduced ? 0 : y, opacity }}>
      {children}
    </motion.div>
  );
}
