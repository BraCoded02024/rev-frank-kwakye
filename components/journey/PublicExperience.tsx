"use client";

import { usePathname } from "next/navigation";
import { Engine } from "@/components/journey/Engine";
import { Story } from "@/components/story/Story";
import { Nav } from "@/components/ui/Nav";

export function PublicExperience({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/" || path === "/contact" || path.startsWith("/admin")) return children;
  return <><Nav /><Engine /><Story />{children}</>;
}

