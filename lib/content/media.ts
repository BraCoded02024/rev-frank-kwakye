/** The repository supplies topics, but no recordings. Add only approved media URLs. */
export type MessageHighlight = { title: string; src: string | null };
export const messageHighlights: MessageHighlight[] = [
  { title: "Biblical and expository preaching", src: null },
  { title: "Pentecostal prayer and worship", src: null },
  { title: "Christian discipleship", src: null },
  { title: "Leadership teaching", src: null },
  { title: "Youth teaching", src: null },
];
