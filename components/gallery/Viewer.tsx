"use client";

import {
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { GalleryItem } from "./galleryData";

gsap.registerPlugin(useGSAP);

const PEG = 14;
const DIM = 0.4;

function subscribeResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

type Props = {
  items: GalleryItem[];
  title: string;
  short: string;
  start: number;
  rectOf: (i: number) => DOMRect;
  onClosed: (last: number) => void;
};

export default function Viewer({ items, title, short, start, rectOf, onClosed }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(start);
  const shown = useRef(start);
  const closing = useRef(false);
  const wheel = useRef({ sum: 0, at: 0 });
  const swipe = useRef<number | null>(null);

  const size = useSyncExternalStore(subscribeResize, () => `${window.innerWidth}x${window.innerHeight}`, () => "0x0");
  const [vw, vh] = size.split("x").map(Number);
  const narrow = vw < 768;
  const lineTop = vh * (narrow ? 0.16 : 0.14);
  const maxH = vh * (narrow ? 0.56 : 0.66);
  const maxW = vw * (narrow ? 0.82 : 0.6);
  const gap = vw * (narrow ? 0.08 : 0.06);
  const sizes = items.map((it) => {
    let h = maxH;
    let w = (h * it.w) / it.h;
    if (w > maxW) {
      w = maxW;
      h = (w * it.h) / it.w;
    }
    return { w, h };
  });
  const xs: number[] = [];
  sizes.forEach((s, i) => xs.push(i === 0 ? 0 : xs[i - 1] + sizes[i - 1].w + gap));
  const offset = (i: number) => vw / 2 - (xs[i] + sizes[i].w / 2);

  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const q = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root.current);
  const prints = () => q("[data-print]");
  const fly = (el: Element) => el.querySelector("[data-fly]")!;
  const swing = (el: Element) => el.querySelector("[data-swing]")!;

  const { context } = useGSAP(
    () => {
      const list = prints();
      const track = q("[data-track]")[0];
      const backdrop = q("[data-backdrop]")[0];
      const line = q("[data-line]")[0];
      const chrome = q("[data-chrome]");
      const current = list[start];
      const others = list.filter((_, i) => i !== start);
      gsap.set(track, { x: offset(start) });
      gsap.set(list, { opacity: (i) => (i === start ? 1 : DIM) });
      closeButton.current?.focus({ preventScroll: true });

      if (reduce()) {
        gsap.from([backdrop, line, ...list, ...chrome], { opacity: 0, duration: 0.3 });
        return;
      }

      const from = rectOf(start);
      const to = current.getBoundingClientRect();
      gsap
        .timeline()
        .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0)
        .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut", transformOrigin: "left center" }, 0.1)
        .fromTo(
          fly(current),
          {
            x: from.left + from.width / 2 - (to.left + to.width / 2),
            y: from.top + from.height / 2 - (to.top + to.height / 2),
            scale: from.width / to.width,
          },
          { x: 0, y: 0, scale: 1, duration: 0.85, ease: "power3.inOut" },
          0,
        )
        .to(swing(current), { rotation: 6, duration: 0.85, ease: "power2.in" }, 0)
        .to(swing(current), { rotation: 0, duration: 1.8, ease: "elastic.out(1, 0.3)" }, 0.85)
        .fromTo(others.map(fly), { y: -vh * 0.3 }, { y: 0, duration: 0.6, ease: "power2.in", stagger: 0.05 }, 0.45)
        .fromTo(others, { opacity: 0 }, { opacity: DIM, duration: 0.4, stagger: 0.05 }, 0.45)
        .fromTo(
          others.map(swing),
          { rotation: (i) => (i % 2 ? 8 : -8) },
          { rotation: 0, duration: 1.6, ease: "elastic.out(1, 0.3)", stagger: 0.05 },
          1.05,
        )
        .fromTo(chrome, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.6);
    },
    { scope: root },
  );

  const goTo = (to: number) => {
    if (closing.current || to < 0 || to >= items.length || to === shown.current) return;
    const from = shown.current;
    shown.current = to;
    setIndex(to);
    context.add(() => {
      const list = prints();
      const track = q("[data-track]")[0];
      const dir = Math.sign(to - from);
      const near = list.filter((_, i) => Math.abs(i - to) <= 3);
      const motion = reduce() ? 0 : 1;
      gsap
        .timeline()
        .to(track, { x: offset(to), duration: 0.75 * motion, ease: "power3.inOut", overwrite: "auto" }, 0)
        .to(list, { opacity: (i) => (i === to ? 1 : DIM), duration: 0.5 }, 0)
        .to(near.map(swing), { rotation: -dir * 6 * motion, duration: 0.35, ease: "power2.out", overwrite: "auto" }, 0)
        .to(near.map(swing), { rotation: 0, duration: 1.8 * motion, ease: "elastic.out(1, 0.3)" }, 0.35);
    });
  };

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const last = shown.current;
    context.add(() => {
      const list = prints();
      const backdrop = q("[data-backdrop]")[0];
      const line = q("[data-line]")[0];
      const current = list[last];
      const done = () => onClosed(last);
      if (reduce()) {
        gsap.to(root.current, { opacity: 0, duration: 0.3, onComplete: done });
        return;
      }
      const to = rectOf(last);
      const from = current.getBoundingClientRect();
      gsap
        .timeline({ onComplete: done })
        .to(list.filter((_, i) => i !== last), { opacity: 0, duration: 0.3 }, 0)
        .to(q("[data-chrome]"), { opacity: 0, duration: 0.2 }, 0)
        .to(swing(current), { rotation: 0, duration: 0.3, overwrite: "auto" }, 0)
        .to(
          fly(current),
          {
            x: to.left + to.width / 2 - (from.left + from.width / 2),
            y: to.top + to.height / 2 - (from.top + from.height / 2),
            scale: to.width / from.width,
            duration: 0.7,
            ease: "power3.inOut",
          },
          0.05,
        )
        .to(line, { scaleX: 0, transformOrigin: "right center", duration: 0.5, ease: "power2.inOut" }, 0.1)
        .to(backdrop, { opacity: 0, duration: 0.45 }, 0.3);
    });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") goTo(shown.current + 1);
    else if (e.key === "ArrowLeft") goTo(shown.current - 1);
    else return;
    e.preventDefault();
  };

  const onWheel = (e: WheelEvent) => {
    const w = wheel.current;
    const now = e.timeStamp;
    if (now - w.at < 650) return;
    w.sum += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(w.sum) > 60) {
      goTo(shown.current + Math.sign(w.sum));
      w.sum = 0;
      w.at = now;
    }
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "touch") swipe.current = e.clientX;
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    if (swipe.current === null) return;
    const dx = e.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 50) goTo(shown.current - Math.sign(dx));
  };

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={`${title}, photograph ${index + 1} of ${items.length}`}
      onKeyDown={onKeyDown}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className="fixed inset-0 z-50 touch-none overflow-hidden text-foreground"
    >
      <div data-backdrop className="absolute inset-0 bg-black/92" onClick={close} />

      <span
        data-line
        aria-hidden
        className="pointer-events-none absolute inset-x-0 h-px bg-foreground/40"
        style={{ top: lineTop }}
      />

      <div data-track className="pointer-events-none absolute inset-0">
        {items.map((item, i) => (
          <div
            key={item.id}
            data-print
            className={`absolute ${i === index ? "z-10" : ""}`}
            style={{ left: xs[i], top: lineTop + PEG, width: sizes[i].w, height: sizes[i].h }}
          >
            <div data-fly className="h-full w-full">
              <div data-swing className="relative h-full w-full" style={{ transformOrigin: `50% -${PEG}px` }}>
                <span
                  aria-hidden
                  className="absolute -top-5 left-1/2 z-10 h-7 w-2.5 -translate-x-1/2 rounded-xs bg-[#c8a46a] shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden={i !== index}                  data-cursor-skip={i === index ? "" : undefined}
                  onClick={() => goTo(i)}
                  className={`pointer-events-auto relative block h-full w-full overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.55)] ${
                    i === index ? "cursor-default" : "cursor-pointer"
                  }`}
                  style={{ background: item.bg }}
                >
                  {item.photo && (
                    <Image
                      src={item.photo.src}
                      alt={i === index ? (item.photo.alt ?? `${title}, photograph ${i + 1}`) : ""}
                      fill
                      sizes={narrow ? "85vw" : "60vw"}
                      placeholder="blur"
                      blurDataURL={item.photo.blur}
                      className="object-cover"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        ref={closeButton}
        data-chrome
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute top-5 right-5 grid size-10 place-items-center rounded-full border border-foreground/30 transition-colors hover:border-foreground/70 md:top-6 md:right-8"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div
        data-chrome
        className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-6 text-[11px] tracking-[0.3em] uppercase md:bottom-10"
      >
        <button
          type="button"
          aria-label="Previous photograph"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="grid size-9 place-items-center rounded-full border border-foreground/30 transition-opacity hover:border-foreground/70 disabled:opacity-25"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <p aria-live="polite" className="min-w-[10ch] text-center tabular-nums opacity-80">
          {short} · {index + 1} / {items.length}
        </p>
        <button
          type="button"
          aria-label="Next photograph"
          onClick={() => goTo(index + 1)}
          disabled={index === items.length - 1}
          className="grid size-9 place-items-center rounded-full border border-foreground/30 transition-opacity hover:border-foreground/70 disabled:opacity-25"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
