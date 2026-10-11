import { sections, type SectionId } from "@/lib/content/chapters";

export const journeyApi = {
  scrollTo: (target: string) => { document.querySelector(target)?.scrollIntoView(); },
};

export function progressFromScroll() {
  const mid = window.innerHeight * 0.46;
  for (const section of sections) {
    const element = document.getElementById(section.id);
    if (!element) continue;
    const rect = element.getBoundingClientRect();
    if (rect.top <= mid && rect.bottom >= mid) {
      const local = (mid - rect.top) / Math.max(rect.height, 1);
      const clamped = Math.min(1, Math.max(0, local));
      return section.from + (section.to - section.from) * clamped;
    }
  }
  return window.scrollY < 8 ? 0 : 1;
}

export function sectionAt(progress: number) {
  return [...sections].reverse().find((section) => progress >= section.from - 0.001) ?? sections[0];
}

export function hrefFor(id: SectionId | string) {
  if (id === "word" || id === "calling") return "/about";
  return sections.find((section) => section.id === id)?.href ?? "/";
}

