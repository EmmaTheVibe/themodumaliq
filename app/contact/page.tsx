import type { Metadata } from "next";
import Accent from "@/components/Accent";
import ContactForm from "@/components/contact/ContactForm";
import PrintStack from "@/components/contact/PrintStack";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { photosFor, type Photo } from "@/components/gallery/photos";
import { EMAIL } from "@/components/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "I am Moses Momodu and I’d love to hear about your shoot: corporate headshots, personal branding portraits or events in Lagos, Ondo or anywhere in Nigeria.",
  alternates: { canonical: "/contact" },
};

const STACK = [
  "headshots/img_0260",
  "portraits/img_1611",
  "headshots/img_0894",
  "portraits/img_1905",
  "headshots/img_0897",
  "portraits/img_1977",
  "headshots/img_1102",
  "portraits/img_2115",
  "headshots/img_1152",
  "portraits/img_2252",
  "headshots/img_1775",
  "portraits/img_2254",
];

function stackPhotos(): Photo[] {
  return STACK.flatMap((entry) => {
    const [slug, name] = entry.split("/");
    const photo = photosFor(slug).find((p) => p.src.endsWith(`/${name}.webp`));
    return photo ? [photo] : [];
  });
}

export default function ContactPage() {
  return (
    <main data-no-scrollbar className="flex min-h-dvh flex-col overflow-x-clip">
      <Navbar />
      <section className="mx-auto grid w-full max-w-[1400px] flex-1 gap-16 px-6 pt-32 pb-24 md:px-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-24 lg:pt-40">
        <div className="lg:sticky lg:top-36 lg:self-start">
          <PrintStack photos={stackPhotos()} />
        </div>

        <div className="max-w-[62ch]">
          <h1 className="font-display text-[clamp(40px,5.5vw,80px)] leading-[0.95] font-light">
            Say hello.
            <span className="block">
              Let’s work{" "}
              <Accent delay={500} className="font-script text-[1.1em]">
                together
              </Accent>
              .
            </span>
          </h1>
          <div className="mt-8 space-y-5 text-[15px] leading-[1.8] font-light opacity-90 md:text-[16px]">
            <p>
              If you’re here, you’re likely looking to present yourself or your brand with clarity, confidence, and
              intention—and that’s exactly where I can help. Whether you need polished corporate headshots, personal
              branding imagery, or visual coverage for business and corporate events, I’m passionate about creating work
              that truly reflects who you are and what you stand for.
            </p>
            <p>
              I’m always excited to take on new challenges and collaborate with individuals and teams who value
              thoughtful, high-quality visuals. If you have a project in mind or simply want to explore ideas, I’d love
              to hear from you—let’s create something impactful together.
            </p>
          </div>
          <ContactForm />
          <p className="mt-10 text-[13px] tracking-[0.04em] opacity-70">
            Prefer email? Write to{" "}
            <a href={`mailto:${EMAIL}`} className="border-b border-foreground/30 transition-colors hover:border-foreground">
              {EMAIL}
            </a>
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
