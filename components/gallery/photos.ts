import type { Category } from "../categoryData";
import { alts } from "./alts";
import manifest from "./photos.json";

export type Photo = {
  src: string;
  width: number;
  height: number;
  blur: string;
  alt?: string;
};

const photos: Record<string, Photo[]> = manifest;

export function photosFor(slug: string): Photo[] {
  return (photos[slug] ?? []).map((p) => ({
    ...p,
    alt: alts[p.src.replace(/^\/photos\//, "").replace(/\.webp$/, "")],
  }));
}

export type Cover = Photo & { focus: string };

const DEFAULT_FOCUS = "50% 25%";

export function coverFor(category: Category): Cover | undefined {
  if (!category.cover) return undefined;
  const photo = photosFor(category.slug).find((p) => p.src.endsWith(`/${category.cover!.photo}.webp`));
  return photo && { ...photo, focus: category.cover.focus ?? DEFAULT_FOCUS };
}
