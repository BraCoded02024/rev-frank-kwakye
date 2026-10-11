"use client";

import type { ReactNode } from "react";
import { useCompactMotion, useMotionPreference } from "./hooks";

export function PinnedProgress({ id, children }: { id: string; children: ReactNode }) {
  const reduced = useMotionPreference();
  const compact = useCompactMotion();
  if (reduced || compact) return <div id={id}>{children}</div>;
  return (
    <div id={id} className="pin-track">
      <div className="pin-sticky">{children}</div>
    </div>
  );
}
