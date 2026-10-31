import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const ORIGINALS = path.join(ROOT, "photos/originals");
const OUTPUT = path.join(ROOT, "public/photos");
const MANIFEST = path.join(ROOT, "components/gallery/photos.json");

const LONG_EDGE = 2400;
const QUALITY = 82;
const IMAGE = /\.(jpe?g|png|tiff?|webp|avif)$/i;

const exists = (p) => stat(p).then((s) => s, () => null);

const categories = (await readdir(ORIGINALS, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const manifest = {};
let made = 0;
let kept = 0;

for (const slug of categories) {
  const from = path.join(ORIGINALS, slug);
  const to = path.join(OUTPUT, slug);
  await mkdir(to, { recursive: true });

  const files = (await readdir(from)).filter((f) => IMAGE.test(f)).sort();
  const wanted = new Set();
  manifest[slug] = [];

  for (const file of files) {
    const name = `${path.parse(file).name.toLowerCase()}.webp`;
    const src = path.join(from, file);
    const out = path.join(to, name);
    wanted.add(name);

    const [inStat, outStat] = await Promise.all([stat(src), exists(out)]);
    if (!outStat || outStat.mtimeMs < inStat.mtimeMs) {
      await sharp(src)
        .rotate()
        .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true })
        .keepIccProfile()
        .webp({ quality: QUALITY, effort: 5 })
        .toFile(out);
      made += 1;
      console.log(`  made  ${slug}/${name}  (${(inStat.size / 1e6).toFixed(1)} MB original)`);
    } else {
      kept += 1;
    }

    const { width, height } = await sharp(out).metadata();
    const preview = await sharp(out).resize(16).webp({ quality: 40 }).toBuffer();
    manifest[slug].push({
      src: `/photos/${slug}/${name}`,
      width,
      height,
      blur: `data:image/webp;base64,${preview.toString("base64")}`,
    });
  }

  for (const stale of (await readdir(to)).filter((f) => f.endsWith(".webp") && !wanted.has(f))) {
    await rm(path.join(to, stale));
    console.log(`  removed  ${slug}/${stale}`);
  }
}

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
const counts = Object.entries(manifest).map(([slug, list]) => `${slug} ${list.length}`).join(", ");
console.log(`\n${made} made, ${kept} unchanged. ${counts}.`);
