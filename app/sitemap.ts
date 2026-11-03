import type { MetadataRoute } from "next";
import { categories } from "@/components/categoryData";
import { photosFor } from "@/components/gallery/photos";
import { SITE_URL } from "@/components/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const galleries = categories
    .filter((c) => photosFor(c.slug).length)
    .map((c) => ({
      url: `${SITE_URL}/${c.slug}`,
      priority: 0.9,
      images: photosFor(c.slug).map((p) => `${SITE_URL}${encodeURI(p.src)}`),
    }));
  return [
    { url: SITE_URL, priority: 1 },
    ...galleries,
    { url: `${SITE_URL}/about`, priority: 0.7 },
    { url: `${SITE_URL}/contact`, priority: 0.7 },
  ];
}
