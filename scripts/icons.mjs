import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { SCRIPT_STROKE_WIDTH, scriptStrokes, tCrossbar } from "../components/intro/logoPaths.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const APP = path.join(ROOT, "app");

const H_SEGMENTS = 167;
const PAD = 0.15;

const segments = (d) => d.match(/[MC][^MC]*/g);
const points = (d) =>
  segments(d).flatMap((s) => {
    const n = s.slice(1).trim().split(/\s+/).map(Number);
    const out = [];
    for (let i = 0; i < n.length; i += 2) out.push([n[i], n[i + 1]]);
    return out;
  });

const paths = [scriptStrokes[0], segments(scriptStrokes[1]).slice(0, H_SEGMENTS).join(""), tCrossbar];
const all = paths.flatMap(points);
const xs = all.map((p) => p[0]);
const ys = all.map((p) => p[1]);
const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * (1 + PAD * 2);
const left = cx - size / 2;
const top = cy - size / 2;

const svg = (px, weight) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${size} ${size}" width="${px}" height="${px}">
  <rect x="${left}" y="${top}" width="${size}" height="${size}" fill="#000"/>
  <g fill="none" stroke="#f2f2f2" stroke-width="${SCRIPT_STROKE_WIDTH * weight}" stroke-linecap="round" stroke-linejoin="round">
    ${paths.map((d) => `<path d="${d}"/>`).join("")}
  </g>
</svg>`);

const png = (px, weight) => sharp(svg(px, weight)).png({ compressionLevel: 9 }).toBuffer();

function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ px, data }, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(px >= 256 ? 0 : px, e);
    header.writeUInt8(px >= 256 ? 0 : px, e + 1);
    header.writeUInt8(0, e + 2);
    header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((im) => im.data)]);
}

const favicon = ico([
  { px: 16, data: await png(16, 3.6) },
  { px: 32, data: await png(32, 3.6) },
  { px: 48, data: await png(48, 3.4) },
]);
await writeFile(path.join(APP, "favicon.ico"), favicon);
await writeFile(path.join(APP, "icon.png"), await png(512, 3.0));
await writeFile(path.join(APP, "apple-icon.png"), await png(180, 3.2));
console.log("app/favicon.ico (16, 32, 48), app/icon.png (512), app/apple-icon.png (180)");
