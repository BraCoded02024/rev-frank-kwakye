"use client";

import { introGate } from "@/lib/intro-gate";
import { useEffect, useRef, useState } from "react";
import { useContent } from "@/lib/cms/context";

export function IntroVideo() {
  const { profile } = useContent();
  const [open, setOpen] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const closing = useRef(false);

  function close(immediate = false) {
    if (closing.current) return;
    closing.current = true;
    introGate.finish();
    if (immediate) {
      setOpen(false);
      return;
    }
    setLeaving(true);
    window.setTimeout(() => setOpen(false), 680);
  }

  useEffect(() => {
    // Settle the entrance before paint for visitors requesting reduced motion.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) close(true);
  }, []);

  if (!open) return null;

  return (
    <div className={leaving ? "intro-gate is-leaving" : "intro-gate"} role="dialog" aria-label="Introduction">
      <div className="intro-ring">
        <video
          src="/intro/intro.mp4"
          autoPlay
          muted
          playsInline
          onEnded={() => close()}
          onError={() => close()}
        />
      </div>
      <p className="intro-name">
        {profile.name}
        <span>Meet</span>
      </p>
      <div className="intro-actions">
        <button type="button" onClick={() => close()}>
          Skip
        </button>
      </div>
    </div>
  );
}

