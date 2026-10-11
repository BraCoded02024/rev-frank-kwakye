"use client";

import { animate, motion, useInView, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import { useMotionPreference } from "./hooks";

export function FloatingObject({
  progress,
  className,
}: {
  progress: MotionValue<number>;
  className?: string;
}) {
  const reduced = useMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const clock = useMotionValue(0);

  useEffect(() => {
    if (reduced || !inView) return;
    const controls = animate(clock, [0, 1], {
      duration: 7,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [clock, inView, reduced]);

  const floatY = useTransform(clock, [0, 1], [-8, 8]);
  const scrollShift = useTransform(progress, [0, 1], [10, -14]);
  const y = useTransform<number, number>([floatY, scrollShift], ([drift, shift]) =>
    reduced ? 0 : drift + shift,
  );
  const rotate = useTransform(progress, [0, 1], reduced ? [0, 0] : [-6, 8]);

  return <motion.div ref={ref} className={className} style={{ y, rotate }} aria-hidden="true" />;
}
