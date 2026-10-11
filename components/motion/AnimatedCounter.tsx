"use client";

import { useMotionValueEvent, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useState } from "react";
import { useMotionPreference } from "./hooks";

function easeInOut(progress: number) {
  return progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
}

export function AnimatedCounter({
  progress,
  target,
  duration = 800,
  suffix = "",
  label,
}: {
  progress: MotionValue<number>;
  target: number;
  duration?: number;
  suffix?: string;
  label?: string;
}) {
  const reduced = useMotionPreference();
  const seconds = Math.min(1.2, Math.max(0.4, duration / 1000));
  const mapped = useTransform(progress, [0, 1], [0, target], { ease: easeInOut });
  const smooth = useSpring(mapped, { stiffness: 110 / seconds, damping: 20, mass: 0.55 });
  const [shown, setShown] = useState(0);

  useMotionValueEvent(smooth, "change", (value) => {
    const next = Math.round(value);
    setShown((current) => (current === next ? current : next));
  });

  return (
    <p className="counter">
      <span>
        {reduced ? target : shown}
        {suffix}
      </span>
      {label ? <small>{label}</small> : null}
    </p>
  );
}
