"use client";

import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { useMotionPreference } from "./hooks";

const tags = { p: motion.p, h1: motion.h1, h2: motion.h2 };

export function MotionText({
  progress,
  start = 0,
  as = "p",
  className,
  children,
}: {
  progress: MotionValue<number>;
  start?: number;
  as?: keyof typeof tags;
  className?: string;
  children: ReactNode;
}) {
  const reduced = useMotionPreference();
  const end = Math.min(1, start + 0.18);
  const opacity = useTransform(progress, [start, end], reduced ? [1, 1] : [0, 1]);
  const offset = useTransform(progress, [start, end], reduced ? [0, 0] : [18, 0]);
  const y = useSpring(offset, { stiffness: 140, damping: 22 });
  const Tag = tags[as];

  return (
    <Tag className={className} style={{ opacity, y }}>
      {children}
    </Tag>
  );
}
