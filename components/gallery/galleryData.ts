import { photosFor, type Photo } from "./photos";

export type Cell = { col: string; row: string };

export type GalleryItem = {
  id: number;
  w: number;
  h: number;
  bg: string;
  photo?: Photo;
};

export const UNITS = 40;
const GAP_UNITS = 2;

const SHAPES: [number, number, number][] = [
  [9, 10, 3],
  [4, 5, 3],
  [3, 4, 3],
  [2, 3, 2],
  [1, 1, 1],
  [3, 2, 1],
  [4, 3, 1],
];
const TOTAL_WEIGHT = SHAPES.reduce((sum, s) => sum + s[2], 0);

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function galleryItems(slug: string, palette: string[], count = 40): GalleryItem[] {
  const real = photosFor(slug);
  if (real.length) {
    return real.map((photo, i) => ({ id: i + 1, w: photo.width, h: photo.height, bg: "#111", photo }));
  }
  const rand = random(hash(slug));
  return Array.from({ length: count }, (_, i) => {
    let pick = rand() * TOTAL_WEIGHT;
    const [w, h] = SHAPES.find((s) => (pick -= s[2]) < 0) ?? SHAPES[0];
    return { id: i + 1, w, h, bg: palette[Math.floor(rand() * palette.length)] };
  });
}

export function packMasonry(items: GalleryItem[], cols: number): Cell[] {
  const heights = Array<number>(cols).fill(0);
  return items.map((item) => {
    const span = Math.max(1, Math.round((UNITS * item.h) / item.w));
    let c = 0;
    for (let k = 1; k < cols; k++) if (heights[k] < heights[c]) c = k;
    const row = heights[c];
    heights[c] += span + GAP_UNITS;
    return { col: `${c * 2 + 1} / span 2`, row: `${row + 1} / span ${span}` };
  });
}

export function introCells(packed: Cell[], cols: number, leads: 1 | 2): Cell[] {
  const tracks = cols * 2;
  const span = tracks / leads;
  const rows = Math.round(((UNITS * cols) / leads) * (4 / 3));
  return packed.map((cell, i) =>
    i < leads ? { col: `${i * span + 1} / span ${span}`, row: `1 / span ${rows}` } : cell,
  );
}
