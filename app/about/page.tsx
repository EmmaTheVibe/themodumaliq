import type { Metadata } from "next";
import About from "@/components/About";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { photosFor } from "@/components/gallery/photos";

export const metadata: Metadata = {
  title: "About · themodumaliq photography",
  description:
    "Moses is a visual storyteller and brand-focused photographer working between Lagos and Ondo States: corporate headshots, personal branding portraits and corporate events.",
};

export default function AboutPage() {
  const portrait = photosFor("personal").find((p) => p.src.endsWith("/img_1253.webp"));
  return (
    <main className="flex min-h-dvh flex-col overflow-x-clip fit:h-dvh fit:overflow-hidden">
      <Navbar />
      <About portrait={portrait} />
      <Footer />
    </main>
  );
}
