import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  LOGO_VIEWBOX,
  SCRIPT_STROKE_WIDTH,
  iDot,
  photographyLetters,
  scriptStrokes,
  tCrossbar,
  underline,
} from "../components/intro/logoPaths.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "photos/originals/personal/IMG_1252.JPG");
const OUT_DIR = path.join(ROOT, "app");
const ALT = "themodumaliq photography";

const W = 1200;
const H = 630;
const FOCUS_Y = 0.12;
const LOGO_WIDTH = 330;
const LOGO_LEFT = 52;
const LOGO_TOP = 262;

const [, , vbW, vbH] = LOGO_VIEWBOX.split(" ").map(Number);
const logoHeight = Math.round((LOGO_WIDTH * vbH) / vbW);

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO_VIEWBOX}" width="${LOGO_WIDTH}" height="${logoHeight}">
  <g fill="none" stroke="#f2f2f2" stroke-width="${SCRIPT_STROKE_WIDTH * 1.25}" stroke-linecap="round" stroke-linejoin="round">
    ${[...scriptStrokes, tCrossbar, iDot].map((d) => `<path d="${d}"/>`).join("")}
  </g>
  <line x1="${underline.x1}" x2="${underline.x2}" y1="${underline.y}" y2="${underline.y}" stroke="#f2f2f2" stroke-width="${underline.width * 1.25}"/>
  <g fill="#f2f2f2" fill-rule="evenodd">${photographyLetters.map((d) => `<path d="${d}"/>`).join("")}</g>
</svg>`;

const shade = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity="0.55"/>
    <stop offset="0.45" stop-color="#000" stop-opacity="0.15"/>
    <stop offset="1" stop-color="#000" stop-opacity="0"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#s)"/>
</svg>`;

const meta = await sharp(SOURCE).metadata();
const scale = Math.max(W / meta.width, H / meta.height);
const rw = Math.round(meta.width * scale);
const rh = Math.round(meta.height * scale);
const photo = await sharp(SOURCE)
  .rotate()
  .resize(rw, rh)
  .extract({ left: Math.round((rw - W) / 2), top: Math.round((rh - H) * FOCUS_Y), width: W, height: H })
  .toBuffer();

const image = await sharp(photo)
  .composite([
    { input: Buffer.from(shade), left: 0, top: 0 },
    { input: Buffer.from(logoSvg), left: LOGO_LEFT, top: LOGO_TOP },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toBuffer();

for (const name of ["opengraph-image", "twitter-image"]) {
  await writeFile(path.join(OUT_DIR, `${name}.jpg`), image);
  await writeFile(path.join(OUT_DIR, `${name}.alt.txt`), ALT);
}
console.log(`app/opengraph-image.jpg and app/twitter-image.jpg, ${W}x${H}, ${(image.length / 1024).toFixed(0)} KB`);
