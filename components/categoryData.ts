export type Category = {
  slug: string;
  title: string;
  short: string;
  seoTitle: string;
  description: string;
  intro: string;
  cover?: { photo: string; focus?: string };
  subject: "figure" | "horizon";
  slides: string[];
};

export const categories: Category[] = [
  {
    slug: "headshots",
    title: "Headshots & Personal Branding",
    short: "Headshots",
    seoTitle: "Corporate headshots & personal branding in Lagos",
    description:
      "I am Moses Momodu and I photograph corporate headshots and personal branding portraits for professionals, founders and teams in Lagos, Ondo and across Nigeria.",
    intro:
      "Clean, confident headshots for LinkedIn, company websites, speaker bios and press. I photograph individuals and whole teams, in the studio or at your office, and I’ll guide you through posing so the session feels easy, even if you don’t enjoy being on camera.",
    cover: { photo: "img_1775", focus: "50% 25%" },
    subject: "figure",
    slides: [
      "linear-gradient(165deg, #6b6438, #2a2716)",
      "linear-gradient(165deg, #4a5068, #1b1e2a)",
      "linear-gradient(165deg, #8a7f62, #2f2a1f)",
      "linear-gradient(165deg, #5e5a4a, #1f1d17)",
    ],
  },
  {
    slug: "portraits",
    title: "Portraits",
    short: "Portraits",
    seoTitle: "Portrait photography in Lagos",
    description:
      "I am Moses Momodu and I take relaxed studio and on-location portraits in Lagos and Ondo, for your brand, a milestone or just for you.",
    intro:
      "Portraits for when you want more than a quick snapshot. Whether it’s for your brand, a birthday, a milestone or simply for yourself, we’ll plan the look together and take our time getting pictures that feel like you.",
    cover: { photo: "img_1611", focus: "50% 45%" },
    subject: "figure",
    slides: [
      "linear-gradient(165deg, #5c5530, #231f12)",
      "linear-gradient(165deg, #7a1f2b, #2a0d12)",
      "linear-gradient(165deg, #6f6a5a, #24221c)",
      "linear-gradient(165deg, #4b3a2e, #1a1310)",
    ],
  },
  {
    slug: "corporate-events",
    title: "Events",
    short: "Events",
    seoTitle: "Corporate event photography in Lagos",
    description:
      "I am Moses Momodu and I photograph conferences, launches, panels and company events in Lagos and across Nigeria.",
    intro:
      "Coverage for conferences, product launches, panels and company celebrations. I work quietly in the background to get the speakers, the room and the moments in between, and deliver edited photos your team can start using straight away.",
    cover: { photo: "img_2215", focus: "43% 30%" },
    subject: "figure",
    slides: [
      "linear-gradient(165deg, #d8b77a, #6b4f2a)",
      "linear-gradient(165deg, #9aa3ad, #39404a)",
      "linear-gradient(165deg, #c49a64, #4f3820)",
      "linear-gradient(165deg, #7d8a96, #2a3038)",
    ],
  },
  {
    slug: "outdoor-landscape",
    title: "Outdoor & Landscape",
    short: "Landscapes",
    seoTitle: "Outdoor & landscape photography in Nigeria",
    description: "I am Moses Momodu and I photograph outdoor scenes and landscapes from Lagos, Ondo and around Nigeria.",
    intro: "Places around Lagos, Ondo and further afield, photographed in natural light.",
    cover: { photo: "bridge-4" },
    subject: "horizon",
    slides: [
      "linear-gradient(180deg, #e8a07a, #6a3f33 70%, #2a1d1a)",
      "linear-gradient(180deg, #8fb3cc, #3b5a70 70%, #16222b)",
      "linear-gradient(180deg, #f0c48a, #9a5a3a 70%, #2e1c14)",
      "linear-gradient(180deg, #6d7f8f, #2c3742 70%, #12171c)",
    ],
  },
];
