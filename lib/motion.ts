export type Quality = "high" | "medium" | "low" | "fallback";
export type Mode = "boot" | "film" | "live";

export const motion = {
  progress: 0,
  intro: 0,
  mode: "boot" as Mode,
  quality: "high" as Quality,
  reduced: false,
};

export function chooseQuality(): Quality {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const save = Boolean(nav.connection?.saveData);
  const slow = nav.connection?.effectiveType === "2g" || nav.connection?.effectiveType === "slow-2g";
  const memory = nav.deviceMemory ?? 8;
  let gl = false;
  try {
    const canvas = document.createElement("canvas");
    gl = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    gl = false;
  }
  if (!gl) return "fallback";
  if ((save || slow) && memory <= 2) return "fallback";
  if (save || slow || memory <= 4 || window.matchMedia("(max-width: 767px)").matches) {
    return memory <= 2 ? "low" : "medium";
  }
  return "high";
}
