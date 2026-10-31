export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://themodumaliq.vercel.app";
export const BRAND = "themodumaliq photography";
export const OWNER = "Moses Momodu";
export const EMAIL = "themodumaliqphotos@gmail.com";
export const INSTAGRAM = "https://www.instagram.com/themodumaliq";

export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
