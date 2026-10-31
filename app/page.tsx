import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Landing from "@/components/Landing";
import { categories } from "@/components/categoryData";
import { BRAND, EMAIL, INSTAGRAM, OWNER, SITE_URL, jsonLd } from "@/components/site";

export const metadata: Metadata = {
  title: { absolute: `${BRAND} | Corporate headshots, portraits & events in Lagos` },
  description:
    "Moses Momodu photographs corporate headshots, personal branding portraits and business events in Lagos, Ondo and across Nigeria. See the galleries and book a session.",
  alternates: { canonical: "/" },
};

const business = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: BRAND,
  url: SITE_URL,
  image: `${SITE_URL}/photos/headshots/img_1775.webp`,
  logo: `${SITE_URL}/icon.png`,
  email: EMAIL,
  description:
    "Corporate headshots, personal branding portraits and event photography in Lagos, Ondo and across Nigeria.",
  founder: { "@type": "Person", name: OWNER, jobTitle: "Photographer" },
  address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
  areaServed: [
    { "@type": "City", name: "Lagos" },
    { "@type": "State", name: "Ondo" },
    { "@type": "Country", name: "Nigeria" },
  ],
  sameAs: [INSTAGRAM],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Photography services",
    itemListElement: categories.map((c) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: c.seoTitle, url: `${SITE_URL}/${c.slug}` },
    })),
  },
};

export default function Home() {
  return (
    <main className="min-h-dvh">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(business)} />
      <h1 className="sr-only">themodumaliq photography: corporate headshots, portraits and event photography in Lagos</h1>
      <Landing footer={<Footer />} />
    </main>
  );
}
