/** One continuous route through five physical thresholds. All positions are world units. */
export const journeyStops = [
  { at: 0, x: 0, z: 9, lookX: 0, lookY: 2.8 },
  { at: 0.04, x: 0, z: 3.5, lookX: 0, lookY: 2.8 },
  { at: 0.09, x: 0, z: -8, lookX: -0.5, lookY: 2.8 },
  { at: 0.13, x: 0, z: -12, lookX: -1.1, lookY: 2.9 },
  { at: 0.17, x: 0.2, z: -14.8, lookX: -1.5, lookY: 2.9 },
  { at: 0.205, x: 1.5, z: -25, lookX: 1.5, lookY: 2.8 },
  { at: 0.24, x: 1, z: -31, lookX: -1.8, lookY: 2.9 },
  { at: 0.285, x: -0.3, z: -37, lookX: 2.5, lookY: 2.9 },
  { at: 0.33, x: 0.3, z: -44, lookX: -2.5, lookY: 2.9 },
  { at: 0.37, x: -0.2, z: -50, lookX: 2.5, lookY: 2.9 },
  { at: 0.405, x: 0, z: -57, lookX: 0, lookY: 2.8 },
  { at: 0.455, x: 0, z: -64, lookX: -1.3, lookY: 2.9 },
  { at: 0.5, x: -0.2, z: -71, lookX: 2, lookY: 3 },
  { at: 0.555, x: 0, z: -78, lookX: 0, lookY: 3 },
  { at: 0.61, x: -1.3, z: -86, lookX: -1.3, lookY: 2.8 },
  { at: 0.655, x: -0.8, z: -93, lookX: -2.5, lookY: 2.8 },
  { at: 0.705, x: -0.2, z: -100, lookX: 2.5, lookY: 2.9 },
  { at: 0.75, x: 0.3, z: -107, lookX: -2.5, lookY: 2.9 },
  { at: 0.805, x: 0, z: -117, lookX: 0, lookY: 2.8 },
  { at: 0.86, x: 0, z: -125, lookX: 0, lookY: 3.1 },
  { at: 0.93, x: 0, z: -133, lookX: 0, lookY: 3.2 },
  { at: 1, x: 0, z: -139, lookX: 0, lookY: 3.1 },
] as const;

export const spatialChapters = [
  { label: "Welcome", at: 0, start: 0, title: "A life of faith. A calling to serve.", note: "Rev. Frank Kwaakye · Romans 8:31" },
  { label: "Profile", at: 0.13, start: 0.05, title: "Rev. Frank Kwaakye", note: "Senior Pastor · Bible Teacher · Christian Leadership Trainer" },
  { label: "Ministry", at: 0.24, start: 0.2, title: "Ministry", note: "Leadership · Teaching · Discipleship · Evangelism" },
  { label: "Messages", at: 0.5, start: 0.405, title: "Messages", note: "Scripture, preaching and teaching resources" },
  { label: "Leadership", at: 0.705, start: 0.61, title: "Leadership", note: "Biblical studies · Pastoral service · District leadership" },
  { label: "Contact", at: 0.96, start: 0.805, title: "Connect with us", note: "New Life Assembly of God · Oyarifa, Accra, Ghana" },
] as const;

export function chapterAt(progress: number) {
  for (let i = spatialChapters.length - 1; i >= 0; i--) if (progress >= spatialChapters[i].start) return i;
  return 0;
}

export function cameraAt(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const i = journeyStops.findIndex((stop) => stop.at >= p);
  const b = journeyStops[Math.max(1, i)];
  const a = journeyStops[Math.max(0, i - 1)];
  const t = (p - a.at) / (b.at - a.at);
  const blend = (start: number, end: number) => start + (end - start) * t;
  return { x: blend(a.x, b.x), y: 2.65, z: blend(a.z, b.z), lookX: blend(a.lookX, b.lookX), lookY: blend(a.lookY, b.lookY) };
}

export function doorAngle(cameraZ: number, doorZ: number) {
  const t = Math.max(0, Math.min(1, (9 - (cameraZ - doorZ)) / 7));
  return t * t * (3 - 2 * t) * Math.PI * 0.47;
}


