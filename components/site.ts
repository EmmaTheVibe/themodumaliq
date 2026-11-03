export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://themodumaliq.com";
export const BRAND = "themodumaliq photography";
export const OWNER = "Moses Momodu";
export const EMAIL = "themodumaliqphotos@gmail.com";
export const INSTAGRAM = "https://www.instagram.com/themodumaliq";
export const X = "https://x.com/malikiseasier";
export const WHATSAPP = "https://wa.me/message/3FQOVKWG4L2GM1";
export const DEVELOPER = "https://www.shiemo.dev";

export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
