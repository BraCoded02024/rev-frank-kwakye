"use client";

import { useEffect, useState } from "react";
import { useMotionPreference } from "./hooks";

export function PageTransition() {
  const reduced = useMotionPreference();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (reduced) return;
    let timer = 0;
    const play = () => {
      setActive(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setActive(false), 620);
    };
    window.addEventListener("fk-route", play);
    window.addEventListener("popstate", play);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("fk-route", play);
      window.removeEventListener("popstate", play);
    };
  }, [reduced]);

  return <div className={active ? "page-veil on" : "page-veil"} aria-hidden="true" />;
}
