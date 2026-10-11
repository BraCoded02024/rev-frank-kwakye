import * as THREE from "three";

type Frame = { t: number; p: [number, number, number]; l: [number, number, number]; fov: number };

const frames: Frame[] = [
  { t: 0, p: [0.2, 1.45, 6.4], l: [0.15, 1.0, 0], fov: 32 },
  { t: 0.28, p: [0, 1.7, 4.2], l: [0, 1.45, 0.4], fov: 36 },
  { t: 0.5, p: [0.4, 1.6, 12.5], l: [0.6, 1.4, 14], fov: 34 },
  { t: 1, p: [0, 1.52, 36.4], l: [0, 1.4, 37.2], fov: 32 },
];

const pa = new THREE.Vector3();
const pb = new THREE.Vector3();
const la = new THREE.Vector3();
const lb = new THREE.Vector3();

export function sampleCamera(t: number, position: THREE.Vector3, look: THREE.Vector3) {
  const clamped = Math.min(1, Math.max(0, t));
  let index = 0;
  while (index < frames.length - 2 && frames[index + 1].t < clamped) index += 1;
  const a = frames[index];
  const b = frames[index + 1];
  const raw = (clamped - a.t) / (b.t - a.t || 1);
  const eased = raw * raw * (3 - 2 * raw);
  pa.set(a.p[0], a.p[1], a.p[2]);
  pb.set(b.p[0], b.p[1], b.p[2]);
  la.set(a.l[0], a.l[1], a.l[2]);
  lb.set(b.l[0], b.l[1], b.l[2]);
  position.lerpVectors(pa, pb, eased);
  look.lerpVectors(la, lb, eased);
  return a.fov + (b.fov - a.fov) * eased;
}
