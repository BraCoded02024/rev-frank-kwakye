import { z } from "zod";
import { profile } from "@/lib/content/profile";
import { ministryStations } from "@/lib/content/ministry-stations";

const text = (max = 240) => z.string().trim().min(1, "This field is required.").max(max).refine(value => !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value), "Use plain text without HTML or control characters.");
const list = (max = 800) => z.array(text(max)).min(1).max(20);
const link = z.string().trim().url().max(500).refine(value => { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; }, "Use an HTTPS link without credentials.");
export const editableProfileSchema = z.object({
  name: text(100), descriptor: text(240), church: text(160), location: text(160),
  districtRole: text(400), education: text(300), biography: list(2000), ministryFocus: list(300),
  works: z.array(z.object({ title: text(200), type: text(100), description: text(1200) }).strict()).length(profile.works.length),
  invitations: z.object({ intro: text(1500), include: list(100) }).strict(),
  social: z.object({ facebookProfile: link, facebookShare: link, instagram: link, instagramHandle: text(100) }).strict(),
  milestones: z.array(z.object({ title: text(200), detail: text(500) }).strict()).min(1).max(12),
  resourceShelves: list(150), reflectionCategories: list(150), leadershipModules: list(150),
}).strict();
export const stationIds = ["leadership", "teaching", "discipleship", "evangelism"] as const;
export const stationSchema = z.object({ id: z.enum(stationIds), title: text(80), lines: z.array(text(100)).length(2), meaning: text(1600) }).strict();
export const payloadSchema = z.object({ profile: editableProfileSchema, stations: z.array(stationSchema).length(4).superRefine((rows, ctx) => {
  rows.forEach((row, index) => { if (row.id !== stationIds[index]) ctx.addIssue({ code: "custom", path: [index, "id"], message: "Board identifiers and order cannot be changed." }); });
}) }).strict();
export type ContentPayload = z.infer<typeof payloadSchema>;
export type ProfileContent = typeof profile & { contentFromDatabase?: boolean };
export type MinistryStation = z.infer<typeof stationSchema> & { at: number };
export type PublicContent = { profile: ProfileContent; stations: MinistryStation[] };
export type ContentRecord = { payload: ContentPayload; reviewed_by_pastor: boolean; revision: number; updated_at: string; reviewed_at: string | null };
export const recordSchema = z.object({ payload: payloadSchema, reviewed_by_pastor: z.boolean(), revision: z.number().int().positive(), updated_at: z.string().datetime({ offset: true }), reviewed_at: z.string().datetime({ offset: true }).nullable() });
const { scripture: fixedScripture, reviewedByPastor: sourceReview, ...editableDefaults } = profile;
export const defaultPayload: ContentPayload = payloadSchema.parse({ profile: editableDefaults, stations: ministryStations.map((station, index) => ({ id: stationIds[index], title: station.title, lines: [...station.lines], meaning: station.meaning })) });
export function publicContent(payload = defaultPayload, reviewed = sourceReview, fromDatabase = false): PublicContent {
  return { profile: { ...payload.profile, scripture: fixedScripture, reviewedByPastor: reviewed, ...(fromDatabase ? { contentFromDatabase: true } : {}) }, stations: payload.stations.map((station, index) => ({ ...station, at: ministryStations[index].at })) };
}
