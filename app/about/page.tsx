import type { Metadata } from "next";
import About from "@/components/About";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { photosFor } from "@/components/gallery/photos";
import { BRAND, EMAIL, INSTAGRAM, OWNER, SITE_URL, jsonLd } from "@/components/site";

export const metadata: Metadata = {
  title: "About Moses Momodu",
  description:
    "Moses Momodu is a visual storyteller and brand-focused photographer working between Lagos and Ondo States, shooting corporate headshots, personal branding portraits and corporate events.",
  alternates: { canonical: "/about" },
};

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: OWNER,
  jobTitle: "Photographer",
  url: `${SITE_URL}/about`,
  image: `${SITE_URL}/photos/personal/img_1253.webp`,
  email: EMAIL,
  worksFor: { "@type": "ProfessionalService", name: BRAND, url: SITE_URL },
  homeLocation: { "@type": "Place", name: "Lagos, Nigeria" },
  sameAs: [INSTAGRAM],
};

export default function AboutPage() {
  const portrait = photosFor("personal").find((p) => p.src.endsWith("/img_1253.webp"));
  return (
    <main className="flex min-h-dvh flex-col overflow-x-clip fit:h-dvh fit:overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(person)} />
      <Navbar />
      <About portrait={portrait} />
      <Footer />
    </main>
  );
}
