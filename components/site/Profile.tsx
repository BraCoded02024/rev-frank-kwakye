"use client";

import { useCompactMotion, useMotionPreference, useSectionProgress } from "@/components/motion/hooks";
import { journeyApi } from "@/lib/journey";
import { introGate } from "@/lib/intro-gate";
import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import { useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

const headline = ["A Life of", "Faith, Leadership", "& Service"] as const;

type Phase = "settled" | "wait" | "enter";

export function Profile({
  name,
  descriptor,
  church,
  location,
  biography,
}: {
  name: string;
  descriptor: string;
  church: string;
  location: string;
  biography: string[];
}) {
  const progress = useSectionProgress("word");
  const reduced = useMotionPreference();
  const compact = useCompactMotion();
  const [phase, setPhase] = useState<Phase>("settled");
  const travel = reduced ? 0 : compact ? 0.28 : 1;
  const soft = { stiffness: 70, damping: 26, mass: 0.4 };

  const life = useTransform(progress, [0.3, 1], [0, 1]);
  const frameRaw = useTransform(life, [0, 0.46, 1], [16 * travel, 0, -36 * travel]);
  const photoRaw = useTransform(life, [0, 0.5, 1], [22 * travel, 4 * travel, -12 * travel]);
  const logoRaw = useTransform(life, [0, 0.5, 1], [8 * travel, 0, -18 * travel]);
  const lineA = useTransform(life, [0, 0.55], [0, -28 * travel]);
  const lineB = useTransform(life, [0, 0.55], [0, -52 * travel]);
  const lineC = useTransform(life, [0, 0.55], [0, -76 * travel]);
  const lineRaw = useTransform(life, [0, 0.82], reduced ? [1, 1] : [0.16, 1]);
  const ruleShift = useTransform(life, [0.62, 1], [0, 14 * travel]);
  const sideRaw = useTransform(life, [0, 1], [8 * travel, -16 * travel]);
  const supportYRaw = useTransform(life, [0, 0.7, 1], [0, -6 * travel, -22 * travel]);
  const supportXRaw = useTransform(life, [0, 1], [0, -8 * travel]);
  const supportOpacity = useTransform(life, [0, 0.72, 1], reduced ? [1, 1, 1] : [1, 1, 0.5]);
  const chapterYRaw = useTransform(life, [0, 1], [0, -10 * travel]);

  const frameY = useSpring(frameRaw, soft);
  const photoY = useSpring(photoRaw, soft);
  const logoY = useSpring(logoRaw, soft);
  const lineYs = [useSpring(lineA, soft), useSpring(lineB, soft), useSpring(lineC, soft)];
  const lineScale = useSpring(lineRaw, { stiffness: 90, damping: 28, mass: 0.3 });
  const ruleX = useSpring(ruleShift, soft);
  const sideY = useSpring(sideRaw, soft);
  const supportY = useSpring(supportYRaw, soft);
  const supportX = useSpring(supportXRaw, soft);
  const chapterY = useSpring(chapterYRaw, soft);

  useLayoutEffect(() => {
    if (reduced || introGate.done) {
      // Layout synchronization keeps the intro handoff from flashing hidden text.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("settled");
      return;
    }
    setPhase("wait");
    let live = true;
    void introGate.wait().then(() => {
      if (live) setPhase("enter");
    });
    return () => {
      live = false;
    };
  }, [reduced]);

  const hidden = phase === "wait";
  const enter = phase === "enter";
  const roles = descriptor.split(" | ");

  function explore(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.history.pushState(null, "", "/ministry");
    window.dispatchEvent(new Event("fk-route"));
    journeyApi.scrollTo("#ministry");
  }

  function readOn(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    journeyApi.scrollTo("#profile-read");
  }

  return (
    <div className="profile-spread" inert={hidden ? true : undefined}>
      <div className="profile-copy">
        <motion.p
          className="profile-chapter"
          style={{ y: reduced ? 0 : chapterY }}
          initial={false}
          animate={{ opacity: hidden ? 0 : 1 }}
          transition={{ duration: enter ? 0.7 : 0, ease }}
        >
          <span>01</span> / Profile
          <motion.i className="profile-chapter-meter" style={{ scaleX: lineScale }} aria-hidden="true" />
        </motion.p>
        <motion.p
          className="profile-kicker"
          initial={false}
          animate={{ opacity: hidden ? 0 : 1, y: hidden ? 12 : 0 }}
          transition={{ duration: enter ? 0.75 : 0, delay: enter ? 0.08 : 0, ease }}
        >
          {name}
        </motion.p>
        <motion.h1 className="profile-title">
          {headline.map((line, index) => (
            <motion.span className="profile-line-mask" key={line} style={{ y: reduced ? 0 : lineYs[index] }}>
              <motion.span
                className="profile-line"
                initial={false}
                animate={{ y: hidden ? "115%" : "0%" }}
                transition={{ duration: enter ? 0.95 : 0, delay: enter ? 0.14 + index * 0.12 : 0, ease }}
              >
                {line}
              </motion.span>
            </motion.span>
          ))}
        </motion.h1>
        <motion.div style={{ y: reduced ? 0 : supportY, x: reduced ? 0 : supportX, opacity: supportOpacity }}>
        <motion.p
          className="profile-support"
          initial={false}
          animate={{ opacity: hidden ? 0 : 1, y: hidden ? 16 : 0 }}
          transition={{ duration: enter ? 0.8 : 0, delay: enter ? 0.5 : 0, ease }}
        >
          {roles.map((part, index) => (
            <RoleLine key={part} index={index} life={life} travel={travel} reduced={reduced} last={index === roles.length - 1}>
              {part}
            </RoleLine>
          ))}
          <span>{`${church}, ${location}.`}</span>
        </motion.p>
        <motion.div
          className="profile-actions"
          initial={false}
          animate={{ opacity: hidden ? 0 : 1, y: hidden ? 14 : 0 }}
          transition={{ duration: enter ? 0.8 : 0, delay: enter ? 0.62 : 0, ease }}
        >
          <ProfileLink href="/ministry" onClick={explore} magnetic={!reduced && !compact}>
            Explore His Ministry
          </ProfileLink>
          <ProfileLink href="#profile-read" onClick={readOn} quiet magnetic={!reduced && !compact}>
            Learn More
          </ProfileLink>
        </motion.div>
        <motion.div
          className="profile-meta"
          initial={false}
          animate={{ opacity: hidden ? 0 : 1 }}
          transition={{ duration: enter ? 0.8 : 0, delay: enter ? 0.74 : 0, ease }}
        >
          <motion.span className="profile-rule" style={{ scaleX: lineScale, x: reduced ? 0 : ruleX, transformOrigin: "left center" }} aria-hidden="true" />
          <p>
            {church}
            <span>{location}</span>
          </p>
        </motion.div>
        </motion.div>
        <div id="profile-read" className="profile-read">
          <Drift life={life} travel={travel} reduced={reduced} from={0.28} to={0.4} rise={56}>
            <p className="profile-kicker">Biography</p>
          </Drift>
          {biography.map((paragraph, index) => (
            <Drift key={paragraph} life={life} travel={travel} reduced={reduced} from={0.36 + index * 0.14} to={0.52 + index * 0.14} rise={84}>
              <p>{paragraph}</p>
            </Drift>
          ))}
        </div>
      </div>

      <div className="profile-portrait-col">
        <motion.figure className="profile-figure" style={{ y: reduced ? 0 : frameY }}>
          <motion.div
            className="profile-mask"
            initial={false}
            animate={{ clipPath: hidden ? "inset(14% 6% 16% 6%)" : "inset(0% 0% 0% 0%)" }}
            transition={{ duration: enter ? 1.2 : 0, delay: enter ? 0.2 : 0, ease }}
          >
            <motion.div
              className="profile-photo"
              style={{ y: reduced ? 0 : photoY }}
              whileHover={reduced ? undefined : { scale: 1.035 }}
              transition={{ duration: 0.8, ease }}
            >
              <Image
                src="/pastor/pastor.jpg"
                alt={name}
                fill
                priority
                sizes="(max-width: 900px) 92vw, 44vw"
                style={{ objectFit: "cover", objectPosition: "center 12%" }}
              />
            </motion.div>
          </motion.div>
          <motion.div className="profile-logo" style={{ y: reduced ? 0 : logoY }}>
            <Image src="/church/assemblies-of-god.png" alt="Assemblies of God" width={508} height={491} />
          </motion.div>
          <motion.p className="profile-side" style={{ y: reduced ? 0 : sideY }}>
            {location}
          </motion.p>
          <motion.span className="profile-mark" style={{ y: reduced ? 0 : sideY }} aria-hidden="true" />
        </motion.figure>
      </div>
    </div>
  );
}

function ProfileLink({
  href,
  onClick,
  quiet,
  magnetic,
  children,
}: {
  href: string;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  quiet?: boolean;
  magnetic?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(0, { stiffness: 260, damping: 22, mass: 0.25 });
  const y = useSpring(0, { stiffness: 260, damping: 22, mass: 0.25 });

  function move(event: MouseEvent<HTMLAnchorElement>) {
    if (!magnetic || !ref.current) return;
    const box = ref.current.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    x.set(Math.max(-7, Math.min(7, dx * 0.16)));
    y.set(Math.max(-5, Math.min(5, dy * 0.16)));
  }

  function leave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      className={quiet ? "profile-cta is-quiet" : "profile-cta"}
      style={{ x: magnetic ? x : 0, y: magnetic ? y : 0 }}
      onMouseMove={move}
      onMouseLeave={leave}
      onClick={onClick}
    >
      <span>{children}</span>
      <span className="profile-cta-arrow" aria-hidden="true">
        →
      </span>
      <i />
    </motion.a>
  );
}

function RoleLine({
  index,
  life,
  travel,
  reduced,
  last,
  children,
}: {
  index: number;
  life: MotionValue<number>;
  travel: number;
  reduced: boolean;
  last: boolean;
  children: ReactNode;
}) {
  const y = useSpring(
    useTransform(life, [0, 0.6], reduced ? [0, 0] : [0, -(14 + index * 16) * travel]),
    { stiffness: 80, damping: 26, mass: 0.3 },
  );
  return (
    <motion.span className="profile-role" style={{ y: reduced ? 0 : y, display: "inline-block" }}>
      {children}{last ? "" : ", "}
    </motion.span>
  );
}

function Drift({
  life,
  travel,
  reduced,
  from,
  to,
  rise,
  children,
}: {
  life: MotionValue<number>;
  travel: number;
  reduced: boolean;
  from: number;
  to: number;
  rise: number;
  children: ReactNode;
}) {
  const y = useSpring(
    useTransform(life, [from, to], reduced ? [0, 0] : [rise * travel, 0]),
    { stiffness: 70, damping: 24, mass: 0.4 },
  );
  const opacity = useTransform(life, [from, from + (to - from) * 0.55], reduced ? [1, 1] : [0, 1]);
  return <motion.div style={{ y: reduced ? 0 : y, opacity }}>{children}</motion.div>;
}

