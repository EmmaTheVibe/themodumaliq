"use client";

import { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import { UNITS, galleryItems, introCells, packMasonry } from "./galleryData";
import type { Cover } from "./photos";
import { useSmoothScroll } from "./useSmoothScroll";
import Viewer from "./Viewer";

gsap.registerPlugin(useGSAP, Flip);

type Tier = "desktop" | "tablet" | "phone";
type Phase = "intro" | "morphing" | "ready";

const DESKTOP = "(min-width: 1024px)";
const TABLET = "(min-width: 768px)";
function subscribeTier(onChange: () => void) {
  const queries = [DESKTOP, TABLET].map((q) => window.matchMedia(q));
  queries.forEach((mq) => mq.addEventListener("change", onChange));
  return () => queries.forEach((mq) => mq.removeEventListener("change", onChange));
}
function currentTier(): Tier {
  if (window.matchMedia(DESKTOP).matches) return "desktop";
  return window.matchMedia(TABLET).matches ? "tablet" : "phone";
}

const REDUCE = "(prefers-reduced-motion: reduce)";
function subscribeReduce(onChange: () => void) {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const GRID: Record<Tier, { cols: number; gap: number }> = {
  desktop: { cols: 3, gap: 20 },
  tablet: { cols: 2, gap: 16 },
  phone: { cols: 2, gap: 8 },
};

type Props = {
  slug: string;
  title: string;
  short: string;
  intro: { heading: string; text: string };
  palette: string[];
  cover?: Cover;
  footer: ReactNode;
};

export default function Gallery({ slug, title, short, intro, palette, cover, footer }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const zoom = useRef<HTMLDivElement>(null);
  const pan = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);

  const reduced = useSyncExternalStore(subscribeReduce, () => window.matchMedia(REDUCE).matches, () => false);
  const [introPhase, setPhase] = useState<Phase>("intro");
  const phase: Phase = reduced ? "ready" : introPhase;
  const flipFrom = useRef<Flip.FlipState | null>(null);
  const introDone = useRef(false);
  const [viewing, setViewing] = useState<number | null>(null);

  const tier = useSyncExternalStore(subscribeTier, currentTier, (): Tier => "desktop");
  const { cols, gap } = GRID[tier];

  const items = useMemo(() => galleryItems(slug, palette), [slug, palette]);
  const packed = useMemo(() => packMasonry(items, cols), [items, cols]);
  const tracks = cols * 2;
  const leads = tier === "phone" ? 1 : 2;
  const cells = phase === "intro" ? introCells(packed, cols, leads) : packed;

  const { context } = useGSAP();
  const tiles = () => gsap.utils.toArray<HTMLElement>("[data-tile]", grid.current);
  const navbar = () => document.querySelector<HTMLElement>("[data-navbar]");

  useGSAP(() => {
    if (reduced || introDone.current) return;
    gsap.set(navbar(), { yPercent: -100 });
    gsap
      .timeline()
      .to(hero.current, { opacity: 1, duration: 0.7, ease: "power1.out" }, 0)
      .fromTo(
        "[data-enter='label']",
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        0.3,
      )
      .fromTo(
        "[data-enter='title']",
        { opacity: 0, y: 40, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power3.out", clearProps: "filter" },
        0.35,
      )
      .to("[data-enter='rise']", { "--rise": "0svh", duration: 1.1, ease: "power3.out" }, 0.5);
  }, { dependencies: [reduced], revertOnUpdate: true });

  const onMorph = () => {
    introDone.current = true;
    flipFrom.current = Flip.getState(tiles());
    context.add(() => gsap.set(tiles().slice(leads), { opacity: 0, filter: "blur(6px)" }));
    setPhase("morphing");
  };

  const scroll = useSmoothScroll({ stage, zoom, pan, hero }, onMorph, introDone);

  useLayoutEffect(() => () => setViewing(null), []);

  const openViewer = (i: number) => {
    if (!introDone.current && !reduced) return;
    scroll.current.lock(true);
    setViewing(i);
  };
  const closeViewer = (last: number) => {
    setViewing(null);
    scroll.current.lock(false);
    tiles()[last]?.querySelector("button")?.focus({ preventScroll: true });
  };

  useLayoutEffect(() => {
    if (phase !== "morphing" || !flipFrom.current) return;
    const from = flipFrom.current;
    flipFrom.current = null;
    context.add(() => {
      const list = tiles();
      const lead = list.slice(0, leads);
      gsap.set(lead, { zIndex: 1 });
      gsap
        .timeline({
          onComplete: () => {
            gsap.set(lead, { zIndex: "" });
            scroll.current.ready();
            setPhase("ready");
          },
        })
        .add(Flip.from(from, { duration: 1, ease: "power2.inOut" }), 0)
        .to(navbar(), { yPercent: 0, duration: 0.7, ease: "power2.out" }, 0)
        .to(
          list.slice(leads),
          { opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "power2.out", stagger: 0.01, clearProps: "opacity,filter" },
          0.5,
        );
    });
  }, [phase, context, scroll, leads]);

  return (
    <>
      <h1 className="sr-only">{title}</h1>

      <div
        ref={hero}
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-0 flex h-[75svh] flex-col items-center text-foreground opacity-0 motion-reduce:hidden"
        style={{ background: "color-mix(in oklab, var(--background) 88%, var(--foreground))" }}
      >
        {cover && (
          <>
            <Image
              src={cover.src}
              alt=""
              fill
              sizes="100vw"
              preload
              placeholder="blur"
              blurDataURL={cover.blur}
              className="object-cover"
              style={{ objectPosition: cover.focus }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60" />
          </>
        )}
        <p data-hero-fade className="relative pt-5 text-[12px] tracking-[0.24em] uppercase opacity-80">
          <span data-enter="label" className="inline-block opacity-0">
            Scroll to explore
          </span>
        </p>
        <div className="relative flex w-full max-w-[1400px] flex-1 items-center justify-center px-6">
          <div data-hero-fade>
            <p
              data-hero-scale
              className="text-center font-display text-[clamp(48px,9vw,160px)] leading-[0.9] font-light text-balance uppercase"
            >
              <span data-enter="title" className="inline-block opacity-0">
                {title}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div
        ref={stage}
        className="fixed inset-0 z-10 translate-y-[75svh] touch-none overflow-hidden bg-background motion-reduce:translate-y-0"
      >
        <div data-enter="rise" className="h-full w-full translate-y-(--rise) [--rise:25svh] motion-reduce:[--rise:0px]">
          <div ref={zoom} className="h-full w-full origin-center will-change-transform">
            <div ref={pan} className="flex min-h-dvh flex-col will-change-transform">
              <div className="@container flex-1 px-3 pt-20 pb-5 md:px-5 md:pt-24">
                <div
                  ref={grid}
                  data-phase={phase}
                  className="group grid"
                  style={{
                    columnGap: gap,
                    gridTemplateColumns: `repeat(${tracks}, minmax(0, 1fr))`,
                    gridAutoRows: `calc(((100cqw - ${(tracks - 1) * gap}px) / ${tracks} * 2 + ${gap}px) / ${UNITS})`,
                  }}
                >
                  {items.map((item, i) => (
                    <div
                      key={item.id}
                      data-tile
                      className={`relative ${
                        i >= leads ? "motion-safe:group-data-[phase=intro]:opacity-0" : ""
                      }`}
                      style={{
                        background: item.bg,
                        gridColumn: cells[i].col,
                        gridRow: cells[i].row,
                      }}
                    >
                      <button
                        type="button"
                        aria-label={`View ${title} photograph ${item.id}`}
                        onClick={() => openViewer(i)}
                        className="absolute inset-0 z-10 cursor-zoom-in focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground/70"
                      />
                      {item.photo ? (
                        <Image
                          src={item.photo.src}
                          alt={item.photo.alt ?? `${title}, photograph ${item.id}`}
                          fill
                          sizes={i < 2 ? "(max-width: 767px) 100vw, 50vw" : `(min-width: 1024px) ${Math.round(100 / cols)}vw, 50vw`}
                          placeholder="blur"
                          blurDataURL={item.photo.blur}
                          {...(i < 2 ? { loading: "eager", fetchPriority: "high" } : {})}
                          className="object-cover"
                        />
                      ) : (
                        <span className="absolute inset-x-[26%] inset-y-[22%] rounded-[10px] bg-black/15" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <section className="mx-auto max-w-[60ch] px-6 pt-16 pb-20 text-center md:pt-24 md:pb-28">
                <h2 className="font-display text-[clamp(28px,3.4vw,44px)] leading-[1.05] font-light">{intro.heading}</h2>
                <p className="mt-6 text-[15px] leading-[1.8] font-light opacity-80 md:text-[16px]">{intro.text}</p>
                <Link
                  href="/contact"
                  className="mt-9 inline-block border border-foreground/40 px-8 py-4 text-[11px] tracking-[0.3em] uppercase transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                >
                  Book a session
                </Link>
              </section>
              {footer}
            </div>
          </div>
        </div>
      </div>

      {viewing !== null && (
        <Viewer
          items={items}
          title={title}
          short={short}
          start={viewing}
          rectOf={(i) => tiles()[i].getBoundingClientRect()}
          onClosed={closeViewer}
        />
      )}
    </>
  );
}
