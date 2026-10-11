"use client";

import { useCompactMotion, useMotionPreference, useSectionProgress } from "@/components/motion/hooks";
import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";

export function Ministries({
  focus,
  works,
}: {
  focus: string[];
  works: { title: string; type: string; description: string }[];
}) {
  const progress = useSectionProgress("ministry");
  const reduced = useMotionPreference();
  const compact = useCompactMotion();
  const travel = reduced ? 0 : compact ? 0.35 : 1;
  const held = !reduced && !compact;

  const enterY = useSpring(
    useTransform(progress, [0.02, 0.22], reduced ? [0, 0] : [28 * travel, 0]),
    { stiffness: 80, damping: 26, mass: 0.35 },
  );
  const kickerY = useSpring(
    useTransform(progress, [0.02, 0.16], reduced ? [0, 0] : [18 * travel, 0]),
    { stiffness: 90, damping: 24, mass: 0.3 },
  );
  const headY = useSpring(
    useTransform(progress, [0.06, 0.26, 0.92], reduced ? [0, 0, 0] : [34 * travel, 0, -12 * travel]),
    { stiffness: 70, damping: 26, mass: 0.4 },
  );
  const meter = useSpring(
    useTransform(progress, [0.08, 0.9], reduced ? [1, 1] : [0.08, 1]),
    { stiffness: 70, damping: 24, mass: 0.35 },
  );
  const spine = useSpring(
    useTransform(progress, [0.12, 0.88], reduced ? [1, 1] : [0.04, 1]),
    { stiffness: 70, damping: 24, mass: 0.4 },
  );
  const ringY = useSpring(useTransform(progress, [0, 1], [16 * travel, -28 * travel]), { stiffness: 60, damping: 22, mass: 0.45 });
  const ringR = useTransform(progress, [0, 1], reduced ? [0, 0] : [-4, 16]);
  const ringS = useTransform(progress, [0, 0.5, 1], reduced ? [1, 1, 1] : [0.94, 1, 0.97]);

  return (
    <div className="ministry">
      <motion.div className="ministry-hold" style={{ y: reduced ? 0 : enterY }}>
        <header className={held ? "ministry-head is-held" : "ministry-head"}>
          <motion.p className="eyebrow" style={{ y: reduced ? 0 : kickerY }}>
            <span>02</span> / Ministries
            <motion.i className="ministry-meter" style={{ scaleX: meter }} aria-hidden="true" />
          </motion.p>
          <div className="ministry-title-mask">
            <motion.h2 style={{ y: reduced ? 0 : headY }}>The work of the ministry</motion.h2>
          </div>
        </header>
        <div className="ministry-body">
          <div className="focus-index">
            <motion.span className="ministry-rule" style={{ scaleY: reduced ? 1 : spine }} aria-hidden="true" />
            <ol>
              {focus.map((item, index) => (
                <FocusLine
                  key={item}
                  item={item}
                  index={index}
                  count={focus.length}
                  progress={progress}
                  reduced={reduced}
                  travel={travel}
                />
              ))}
            </ol>
          </div>
          <div className="work-list">
            {works.map((work, index) => (
              <WorkLine key={work.title} work={work} index={index} count={works.length} progress={progress} reduced={reduced} travel={travel} />
            ))}
          </div>
        </div>
        <motion.div
          className="ministry-mark"
          style={{ y: reduced ? 0 : ringY, rotate: ringR, scale: ringS }}
          aria-hidden="true"
        />
      </motion.div>
      {held ? <div className="ministry-runway" aria-hidden="true" /> : null}
    </div>
  );
}

function FocusLine({
  item,
  index,
  count,
  progress,
  reduced,
  travel,
}: {
  item: string;
  index: number;
  count: number;
  progress: MotionValue<number>;
  reduced: boolean;
  travel: number;
}) {
  const slot = 0.18 + ((index + 0.5) / count) * 0.64;
  const half = 0.64 / count;
  const opacity = useTransform(progress, [slot - half * 1.5, slot, slot + half * 1.2], reduced ? [1, 1, 1] : [0.22, 1, 0.5]);
  const x = useTransform(progress, [slot - half, slot, slot + half], reduced ? [0, 0, 0] : [0, 28 * travel, 8 * travel]);
  const y = useTransform(progress, [slot - half, slot], reduced ? [0, 0] : [22 * travel, 0]);
  const mark = useTransform(progress, [slot - half * 0.7, slot, slot + half], reduced ? [1, 1, 1] : [0.12, 1, 0.35]);
  const num = useTransform(progress, [slot - half, slot, slot + half], ["#8a7350", "#b99a5b", "#8a7350"]);

  return (
    <li>
      <motion.span className="focus-marker" style={{ scaleX: mark }} aria-hidden="true" />
      <motion.div style={{ opacity, x, y }}>
        <motion.span style={{ color: num }}>0{index + 1}</motion.span>
        <p>{item}</p>
      </motion.div>
    </li>
  );
}

function WorkLine({
  work,
  index,
  count,
  progress,
  reduced,
  travel,
}: {
  work: { title: string; type: string; description: string };
  index: number;
  count: number;
  progress: MotionValue<number>;
  reduced: boolean;
  travel: number;
}) {
  const slot = 0.52 + ((index + 0.5) / count) * 0.38;
  const y = useTransform(progress, [slot - 0.14, slot], reduced ? [0, 0] : [14 * travel, 0]);
  const x = useTransform(progress, [slot - 0.14, slot], reduced ? [0, 0] : [0, 8 * travel]);
  const opacity = useTransform(progress, [slot - 0.16, slot, Math.min(1, slot + 0.12)], reduced ? [1, 1, 1] : [0.74, 1, 0.88]);

  return (
    <motion.article style={{ y, x, opacity }}>
      <span>{work.type}</span>
      <h3>{work.title}</h3>
      <p>{work.description}</p>
    </motion.article>
  );
}
