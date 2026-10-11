export const sections = [
  { id: "word", href: "/about", nav: "Profile", show: true, numeral: "I", title: "Profile", from: 0, to: 0.22 },
  { id: "ministry", href: "/ministry", nav: "Ministries", show: true, numeral: "II", title: "Ministries", from: 0.22, to: 0.44 },
  { id: "videos", href: "/messages", nav: "Videos", show: true, numeral: "III", title: "Videos", from: 0.44, to: 0.64 },
  { id: "gallery", href: "/gallery", nav: "Gallery", show: true, numeral: "IV", title: "Gallery", from: 0.64, to: 0.82 },
  { id: "contact", href: "/contact", nav: "Contact", show: true, numeral: "V", title: "Contact", from: 0.82, to: 1 },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export const navItems = sections.filter((section) => section.show);

export const numerals = ["I", "II", "III", "IV", "V"] as const;

const pathToId: Record<string, string> = {
  "/": "word",
  "/about": "word",
  "/ministry": "ministry",
  "/leadership": "ministry",
  "/messages": "videos",
  "/gallery": "gallery",
  "/contact": "contact",
  "/reflections": "word",
};

export function sectionIdForPath(pathname: string): string {
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return pathToId[path] ?? "word";
}

