"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { navItems, numerals, sections } from "@/lib/content/chapters";
import { journeyApi, sectionAt } from "@/lib/journey";
import { motion } from "@/lib/motion";
import { subscribeScroll } from "@/lib/scroll-state";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { useContent } from "@/lib/cms/context";

export function Nav() {
  const { profile } = useContent();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("/about");
  const [mark, setMark] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionAt(motion.progress);
      setActive(section.href);
      setMark(numerals.indexOf(section.numeral as (typeof numerals)[number]));
    };
    onScroll();
    return subscribeScroll(onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function go(event: MouseEvent<HTMLAnchorElement>, href: string, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (href === "/contact") { setOpen(false); router.push(href); return; }
    window.history.pushState(null, "", href);
    window.dispatchEvent(new Event("fk-route"));
    journeyApi.scrollTo(id === "word" ? "#word" : `#${id}`);
    setOpen(false);
  }

  return (
    <header className="nav">
      <Link href="/" className="wordmark">{profile.name.replace(/^Rev\.\s*/i, "")}</Link>
      <nav className="nav-links" aria-label="Chapters">
        {navItems.map((item) => (
          <a key={item.id} href={item.href} aria-current={active === item.href ? "page" : undefined} onClick={(event) => go(event, item.href, item.id)}>
            {item.nav}
          </a>
        ))}
      </nav>
      <button type="button" className="menu-button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
        {open ? <X /> : <Menu />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>
      <div className="chapter-line" aria-hidden="true">
        {numerals.map((numeral, index) => <span key={numeral} className={index <= mark ? "on" : ""} />)}
      </div>
      {open ? (
        <div id="mobile-menu" className="mobile-menu" data-lenis-prevent>
          {navItems.map((item) => (
            <a key={item.id} href={item.href} onClick={(event) => go(event, item.href, item.id)}>
              <em>{sections.find((section) => section.id === item.id)?.numeral}</em>
              {item.nav}
            </a>
          ))}
        </div>
      ) : null}
    </header>
  );
}




