"use client";

import type { MotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { useSectionProgress } from "./hooks";

export function SectionProgress({
  id,
  children,
}: {
  id: string;
  children: (progress: MotionValue<number>) => ReactNode;
}) {
  const progress = useSectionProgress(id);
  return children(progress);
}
