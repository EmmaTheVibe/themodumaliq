import { categories } from "./categoryData";
import { coverFor, photosFor } from "./gallery/photos";

export const galleries = categories.map((category) => ({
  slug: category.slug,
  short: category.short,
  href: `/${category.slug}`,
  banner: coverFor(category),
  ready: photosFor(category.slug).length > 0,
}));
