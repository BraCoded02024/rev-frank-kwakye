import { profile as defaults } from "@/lib/content/profile";
import type { ProfileContent } from "./schema";
// Keep the approved scene's original lettering until an editor changes its name.
export function sceneName(profile: ProfileContent) { return !profile.contentFromDatabase && profile.name === defaults.name ? "Rev. Frank Kwaakye" : profile.name; }
export function nameLines(profile: ProfileContent) { const words = sceneName(profile).replace(/^Rev\.\s*/i, "").split(" "); return [words.shift() ?? "", words.join(" ")]; }
export function roleLines(descriptor: string) { return descriptor.split("|").map(s => s.trim()); }
export function wrapCopy(text: string, width = 25) { const lines: string[] = []; for (const word of text.split(/\s+/)) { if (!lines.length || lines[lines.length - 1].length + word.length + 1 > width) lines.push(word); else lines[lines.length - 1] += ` ${word}`; } return lines; }
