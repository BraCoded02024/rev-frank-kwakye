import { scripture } from "./scripture";

export const profile = {
  reviewedByPastor: false,
  name: "Rev. Frank Kwakye",
  descriptor: "Senior Pastor | Bible Teacher | Christian Leadership Trainer",
  church: "New Life Assembly of God", // TODO confirm: source also says "Assemblies of God"
  location: "Oyarifa, Accra, Ghana",
  districtRole:
    "Secretary, Adenta District of Assemblies of God, Ghana (Greater Accra West Region)",
  education: "Master of Arts in Biblical Studies, Global University",
  biography: [
    "Rev. Frank Kwakye is a Ghanaian Pentecostal minister serving as Senior Pastor of New Life Assembly of God, Oyarifa, Accra. He also serves in district leadership as Secretary of the Adenta District of Assemblies of God, Ghana, in the Greater Accra West Region. His ministry centres on biblical preaching, discipleship, prayer, pastoral leadership, and equipping believers for faithful service.",
    "He holds a Master of Arts degree in Biblical Studies from Global University. His teaching and ministry work emphasise Scripture-grounded leadership, servant-hearted ministry, spiritual formation, and leading by example.",
  ],
  ministryFocus: [
    "Biblical and expository preaching",
    "Pentecostal prayer, worship, and revival ministry",
    "Christian discipleship and spiritual formation",
    "Leadership development for pastors, deacons, ministry leaders, and emerging leaders",
    "Church administration and ministry team development",
    "Youth teaching and Christian education",
  ],
  works: [
    {
      title: "Leadership by Example",
      type: "Book project",
      description:
        "a Christian leadership book project focused on biblical character, servant leadership, integrity, and practical ministry.",
    },
    {
      title: "New Life Assemblies of God Leadership School", // TODO confirm exact name
      type: "Leadership training",
      description:
        "a structured leadership-training initiative with modules for pastors, deacons, departmental leaders, small-group leaders, and emerging leaders. The curriculum includes biblical leadership, spiritual formation, leading by example, and revival leadership.",
    },
    {
      title: "Sermons and teaching resources",
      type: "Resources",
      description:
        "sermon outlines, pastoral exhortations, Bible-study materials, prayer guides, and leadership-development teaching.",
    },
  ],
  invitations: {
    intro:
      "For invitations to preach, teach, lead prayer or revival meetings, speak at conferences, or facilitate Christian leadership training, please contact Rev. Frank Kwakye directly using the details below. When making an invitation, include the event date, venue, theme, expected audience, and the nature of the assignment.",
    include: ["Event date", "Venue", "Theme", "Expected audience", "Nature of the assignment"],
  },
  social: {
    facebookProfile: "https://web.facebook.com/profile.php?id=61550335176060",
    facebookShare: "https://www.facebook.com/share/1C4BFVEHwK/",
    instagram: "https://www.instagram.com/revfrankkwakye/",
    instagramHandle: "@revfrankkwakye",
  },
  scripture,
  milestones: [
    { title: "Pentecostal minister", detail: "Ghanaian Pentecostal minister." },
    { title: "Senior Pastor, New Life Assembly of God", detail: "Oyarifa, Accra." },
    {
      title: "Secretary, Adenta District",
      detail: "Assemblies of God, Ghana (Greater Accra West Region).",
    },
    { title: "Master of Arts in Biblical Studies", detail: "Global University." },
  ],
  resourceShelves: [
    "Sermon outlines",
    "Pastoral exhortations",
    "Bible-study materials",
    "Prayer guides",
    "Leadership-development teaching",
  ],
  reflectionCategories: [
    "Reflections on Faith",
    "Lessons from Ministry",
    "Words of Encouragement",
  ],
  leadershipModules: [
    "Biblical leadership",
    "Spiritual formation",
    "Leading by example",
    "Revival leadership",
  ],
};
