"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { useMotionPreference } from "./hooks";

export function ImageReveal({
  progress,
  children,
}: {
  progress: MotionValue<number>;
  children: ReactNode;
}) {
  const reduced = useMotionPreference();
  const clipPath = useTransform(
    progress,
    [0.08, 0.45],
    reduced ? ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"] : ["inset(10% 8% 10% 8%)", "inset(0% 0% 0% 0%)"],
  );
  const scale = useTransform(progress, [0.08, 0.5], reduced ? [1, 1] : [1.06, 1]);

  return (
    <motion.div className="image-reveal" style={{ clipPath, scale }}>
      {children}
    </motion.div>
  );
}
