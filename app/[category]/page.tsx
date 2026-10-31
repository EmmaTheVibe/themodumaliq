import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories } from "@/components/categoryData";
import Footer from "@/components/Footer";
import Gallery from "@/components/gallery/Gallery";
import { coverFor } from "@/components/gallery/photos";
import Navbar from "@/components/Navbar";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[category]">): Promise<Metadata> {
  const { category } = await params;
  const match = categories.find((c) => c.slug === category);
  return { title: match ? `${match.title} · themodumaliq photography` : "themodumaliq photography" };
}

export default function CategoryPage({ params }: PageProps<"/[category]">) {
  return (
    <main>
      <Navbar sticky />
      <Suspense fallback={<div className="fixed inset-0 bg-background" />}>
        <CategoryGallery params={params} />
      </Suspense>
    </main>
  );
}

async function CategoryGallery({ params }: Pick<PageProps<"/[category]">, "params">) {
  const { category } = await params;
  const match = categories.find((c) => c.slug === category);
  if (!match) notFound();
  return (
    <Gallery
      slug={match.slug}
      title={match.title}
      short={match.short}
      palette={match.slides}
      cover={coverFor(match)}
      footer={<Footer />}
    />
  );
}
