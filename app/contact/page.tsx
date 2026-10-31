import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import PrintStack from "@/components/contact/PrintStack";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { photosFor, type Photo } from "@/components/gallery/photos";

export const metadata: Metadata = {
  title: "Contact · themodumaliq photography",
  description:
    "Say hello. Corporate headshots, personal branding imagery and coverage for business and corporate events across Nigeria.",
};

function stackPhotos(): Photo[] {
  const lists = ["headshots", "portraits", "corporate-events"].map((slug) =>
    photosFor(slug).filter((p) => p.height >= p.width),
  );
  const out: Photo[] = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) lists.forEach((l) => l[i] && out.push(l[i]));
  return out;
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
              Let’s work <span className="font-script text-[1.1em]">together</span>.
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
        </div>
      </section>
      <Footer />
    </main>
  );
}
