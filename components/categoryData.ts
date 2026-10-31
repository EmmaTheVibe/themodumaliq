export type Category = {
  slug: string;
  title: string;
  short: string;
  cover?: { photo: string; focus?: string };
  subject: "figure" | "horizon";
  slides: string[];
};

export const categories: Category[] = [
  {
    slug: "headshots",
    title: "Headshots & Personal Branding",
    short: "Headshots",
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
    subject: "horizon",
    slides: [
      "linear-gradient(180deg, #e8a07a, #6a3f33 70%, #2a1d1a)",
      "linear-gradient(180deg, #8fb3cc, #3b5a70 70%, #16222b)",
      "linear-gradient(180deg, #f0c48a, #9a5a3a 70%, #2e1c14)",
      "linear-gradient(180deg, #6d7f8f, #2c3742 70%, #12171c)",
    ],
  },
];
