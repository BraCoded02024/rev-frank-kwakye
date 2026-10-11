"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { PublicContent } from "./schema";
import { profile } from "@/lib/content/profile";
import { ministryStations } from "@/lib/content/ministry-stations";
const ids = ["leadership", "teaching", "discipleship", "evangelism"] as const;
const ContentContext = createContext<PublicContent>({ profile, stations: ministryStations.map((s, i) => ({ ...s, lines: [...s.lines], id: ids[i] })) });
export function ContentProvider({ content, children }: { content: PublicContent; children: ReactNode }) {
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}
export function useContent() { return useContext(ContentContext); }
