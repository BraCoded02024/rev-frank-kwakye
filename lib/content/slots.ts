export const slots = {
  "hero.portrait": { label: "Hero portrait", aspect: "4 / 5", where: "Opening" },
  "about.portrait": { label: "About portrait", aspect: "4 / 5", where: "Journey" },
  "about.secondary": { label: "Secondary photograph", aspect: "3 / 2", where: "Journey" },
  "leadership.portrait": { label: "Leadership portrait", aspect: "3 / 4", where: "Leadership" },
  "works.leadershipByExample.cover": { label: "Book cover", aspect: "2 / 3", where: "Leadership" },
  "works.leadershipSchool.image": { label: "Leadership school", aspect: "3 / 2", where: "Leadership" },
  "messages.default.thumbnail": { label: "Message image", aspect: "16 / 9", where: "Messages" },
  "contact.portrait": { label: "Contact portrait", aspect: "1 / 1", where: "Invitation" },
  "og.image": { label: "Share image", aspect: "1.91 / 1", where: "Social" },
} as const;

export type SlotKey = keyof typeof slots;
