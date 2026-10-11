"use client";

import Image from "next/image";
import { SectionPass } from "@/components/motion/SectionPass";
import { useCompactMotion, useMotionPreference, useSectionProgress } from "@/components/motion/hooks";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useRef, type ReactNode } from "react";

const frames = [
  { id: "portrait", title: "Rev. Frank Kwakye", note: "Portrait", photo: true },
  { id: "teaching", title: "Teaching", note: "Photograph coming soon", photo: false },
  { id: "prayer", title: "Prayer", note: "Photograph coming soon", photo: false },
  { id: "worship", title: "Worship", note: "Photograph coming soon", photo: false },
  { id: "leadership", title: "Leadership", note: "Photograph coming soon", photo: false },
  { id: "assembly", title: "Assembly", note: "Photograph coming soon", photo: false },
];

export function Gallery() {
  const reduced = useMotionPreference();
  const reduce = reduced;
  const compact = useCompactMotion();
  const progress = useSectionProgress("gallery");
  const frame = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const drift = useTransform(progress, [0.1, 0.9], reduced ? [0, 0] : [20 * (compact ? 0.25 : 1), -40 * (compact ? 0.25 : 1)]);

  function limitOf() {
    const node = frame.current;
    const track = node?.firstElementChild as HTMLElement | null;
    if (!node || !track) return 0;
    return Math.min(0, node.clientWidth - track.scrollWidth);
  }

  const step = useCallback((direction: number) => {
    const limit = limitOf();
    let next = x.get() + direction * 340;
    if (next < limit - 8) next = 0;
    if (next > 0) next = limit;
    void animate(x, next, { type: "spring", stiffness: 180, damping: 24 });
  }, [x]);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => step(-1), 3200);
    return () => window.clearInterval(id);
  }, [reduce, step]);

  return (
    <SectionPass id="gallery">
    <div className="stage-inner">
      <div className="stage-head row">
        <div>
          <p className="eyebrow light">Gallery</p>
          <h2>A moving record</h2>
        </div>
        <div className="rail-controls">
          <button type="button" onClick={() => step(1)} aria-label="Previous photographs">
            Prev
          </button>
          <button type="button" onClick={() => step(-1)} aria-label="Next photographs">
            Next
          </button>
        </div>
      </div>
      <div className="rail-window gallery-window" ref={frame}>
        <motion.div style={{ x: drift }}>
        <motion.div className="rail-track gallery-track" style={{ x }} drag={reduce ? false : "x"} dragConstraints={frame} dragElastic={0.08}>
          {frames.map((item, index) => (
            <article key={item.id} className={`gallery-card tone-${item.id}`}>
              <Plate progress={progress} index={index} reduced={reduced} compact={compact}>
                {item.photo ? <Image src="/pastor/pastor.jpg" alt={item.title} width={361} height={512} /> : <div className="gallery-art" aria-hidden="true" />}
              </Plate>
              <div>
                <strong>{item.title}</strong>
                <span>{item.note}</span>
              </div>
            </article>
          ))}
        </motion.div>
        </motion.div>
      </div>
    </div>
    </SectionPass>
  );
}

function Plate({
  progress,
  index,
  reduced,
  compact,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  reduced: boolean;
  compact: boolean;
  children: ReactNode;
}) {
  const distance = reduced ? 0 : (compact ? 8 : 18) * (index % 2 === 0 ? 1 : 0.55);
  const y = useTransform(progress, [0.12, 0.88], [distance, -distance]);
  return (
    <motion.div className="gallery-plate" style={{ y }}>
      {children}
    </motion.div>
  );
}




