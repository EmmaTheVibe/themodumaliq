"use client";

import { useRef, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { categories, type Category } from "./categoryData";
import { coverFor } from "./gallery/photos";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const EASE = "power3.inOut";
const CARD_DUR = 0.8;
const BG_DUR = 0.6;
const REST = { bg: "#000000", fg: "#f2f2f2" };
const HOVER = { bg: "#e3e3e3", fg: "#707070" };
const TITLE_HIDDEN = { opacity: 0, filter: "blur(6px)", xPercent: -30 };

const canHover = () => window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches;

const PEG = 14;

function restBox(card: HTMLElement) {
  const slot = card.parentElement!;
  return { left: slot.offsetLeft, top: slot.offsetTop, width: slot.offsetWidth, height: slot.offsetHeight };
}

function hangParts(slot: HTMLElement) {
  return {
    string: slot.querySelector("[data-string]"),
    print: slot.querySelector("[data-print]"),
    caption: slot.querySelector("[data-caption]"),
  };
}

function hang(tl: gsap.core.Timeline, print: Element | null, i: number, drop: number, at: number) {
  tl.fromTo(
    print,
    { y: -drop, opacity: drop < 300 ? 0 : 1, rotation: (i % 2 ? 1 : -1) * 14, transformOrigin: `50% -${PEG}px` },
    { y: 0, opacity: 1, duration: 0.55, ease: "power2.in" },
    at,
  ).to(print, { rotation: 0, duration: 2.2, ease: "elastic.out(1.1, 0.28)" }, at + 0.5);
}

function cardStates(cards: HTMLElement[], hovered: number | null) {
  if (hovered === null) return cards.map(() => ({ xPercent: 0, scale: 1, opacity: 1, zIndex: 0 }));
  const cx = cards.map((c) => {
    const box = restBox(c);
    return box.left + box.width / 2;
  });
  const middle = (Math.min(...cx) + Math.max(...cx)) / 2;
  return cards.map((_, i) =>
    i === hovered
      ? { xPercent: 20 * Math.sign(middle - cx[i]), scale: 1.1, opacity: 1, zIndex: 1 }
      : { xPercent: 20 * Math.sign(cx[hovered] - cx[i]), scale: 0.8, opacity: 0.2, zIndex: 0 },
  );
}

function transition(cards: HTMLElement[], hovered: number | null) {
  const tl = gsap.timeline();
  const states = cardStates(cards, hovered);

  cards.forEach((card, i) => {
    const { zIndex, ...state } = states[i];
    tl.to(card, { ...state, duration: CARD_DUR, ease: EASE }, 0)
      .set(card, { zIndex }, zIndex ? 0 : CARD_DUR);

    const lines = card.querySelectorAll("[data-hover-line]");
    if (i === hovered) {
      tl.to(lines, { opacity: 1, filter: "blur(0px)", xPercent: 0, duration: CARD_DUR, ease: EASE, stagger: 0.08 }, 0);
    } else {
      tl.to(lines, { ...TITLE_HIDDEN, duration: CARD_DUR * 0.75, ease: EASE, stagger: { each: 0.06, from: "end" } }, 0);
    }
  });

  tl.to(
    cards.map((c) => c.querySelector("[data-caption]")),
    { opacity: hovered === null ? 1 : 0, duration: 0.4, ease: "power1.inOut" },
    hovered === null ? CARD_DUR * 0.5 : 0,
  );

  const theme = hovered === null ? REST : HOVER;
  tl.to(document.documentElement, { "--background": theme.bg, "--foreground": theme.fg, duration: BG_DUR, ease: EASE }, 0);
  return tl;
}

function Silhouette({ subject }: { subject: Category["subject"] }) {
  if (subject === "horizon") {
    return (
      <>
        <span className="absolute top-[38%] left-[58%] aspect-square w-[18%] rounded-full bg-white/20" />
        <span className="absolute inset-x-0 bottom-0 h-[32%] bg-black/35" />
      </>
    );
  }
  return (
    <>
      <span className="absolute top-[28%] left-1/2 aspect-square w-[26%] -translate-x-1/2 rounded-full bg-black/20" />
      <span className="absolute bottom-0 left-1/2 h-[36%] w-[64%] -translate-x-1/2 rounded-t-[45%] bg-black/20" />
    </>
  );
}

type Props = {
  visible?: boolean;
};

export default function Categories({ visible = true }: Props) {
  const root = useRef<HTMLElement>(null);
  const target = useRef<number | null>(null);
  const shown = useRef<number | null>(null);
  const busy = useRef(false);
  const anim = useRef<gsap.core.Timeline | null>(null);
  const landed = useRef(false);

  const { context } = useGSAP(
    () => {
      gsap.set("[data-hover-line]", TITLE_HIDDEN);
      if (!visible) return;
      gsap.set(root.current, { autoAlpha: 1 });

      const mm = gsap.matchMedia(root.current!);
      mm.add(
        {
          wide: "(min-width: 1024px)",
          narrow: "(max-width: 1023.98px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { wide, reduce } = ctx.conditions as { wide: boolean; reduce: boolean };
          const slots = gsap.utils.toArray<HTMLElement>("[data-slot]");

          if (reduce) {
            gsap.from(slots, { opacity: 0, duration: 0.5, onComplete: () => void (landed.current = true) });
            return;
          }

          if (wide) {
            const tl = gsap.timeline();
            slots.forEach((slot, i) => {
              const { string, print, caption } = hangParts(slot);
              tl.fromTo(string, { scaleX: 0 }, { scaleX: 1, duration: 0.2, ease: "none" }, i * 0.2);
              hang(tl, print, i, window.innerHeight * 0.7, 0.35 + i * 0.16);
              tl.fromTo(caption, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 1.2 + i * 0.16);
            });
            tl.call(() => void (landed.current = true), undefined, 0.35 + (slots.length - 1) * 0.16 + 0.6);
            return;
          }

          slots.forEach((slot, i) => {
            const { string, print, caption } = hangParts(slot);
            const tl = gsap.timeline({ scrollTrigger: { trigger: slot, start: "top 85%", once: true } });
            tl.fromTo(string, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 0);
            hang(tl, print, i, 140, 0.25);
            tl.fromTo(caption, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.8);
          });
        },
      );
      return () => mm.revert();
    },
    { dependencies: [visible], scope: root },
  );

  const cards = () => gsap.utils.toArray<HTMLElement>("[data-category]", root.current);

  const go = (state: number | null) => {
    anim.current?.kill();
    shown.current = state;
    busy.current = true;
    anim.current = transition(cards(), state).eventCallback("onComplete", () => {
      busy.current = false;
      context.add(settle);
    });
  };

  const settle = () => {
    if (busy.current) {
      if (shown.current !== null && target.current !== shown.current) go(null);
      return;
    }
    if (shown.current === target.current) return;
    go(shown.current !== null ? null : target.current);
  };

  const cardAt = (x: number, y: number): number | null => {
    const list = cards();
    if (shown.current !== null) {
      const r = list[shown.current].getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return shown.current;
    }
    const s = root.current!.getBoundingClientRect();
    const lx = x - s.left;
    const ly = y - s.top;
    const i = list.findIndex((c) => {
      const box = restBox(c);
      return lx >= box.left && lx <= box.left + box.width && ly >= box.top && ly <= box.top + box.height;
    });
    return i === -1 ? null : i;
  };

  const onPointerMove = (e: PointerEvent) => {
    const next = e.pointerType === "touch" || !canHover() || !landed.current ? null : cardAt(e.clientX, e.clientY);
    if (next === target.current) return;
    target.current = next;
    context.add(settle);
  };

  const onPointerLeave = () => {
    target.current = null;
    context.add(settle);
  };

  return (
    <section
      ref={root}
      aria-label="Galleries"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="invisible relative mx-auto grid w-full max-w-[1600px] flex-1 content-center gap-x-6 gap-y-14 px-6 pt-28 pb-16 sm:grid-cols-2 md:px-10 lg:grid-cols-4"
    >
      {categories.map((category, i) => {
        const banner = coverFor(category);
        return (
          <div key={category.slug} data-slot className="relative">
            <span
              data-string
              aria-hidden
              className="pointer-events-none absolute -inset-x-6 h-px origin-left bg-foreground/40 sm:-inset-x-3"
              style={{ top: -PEG }}
            />
            <Link
              href={`/${category.slug}`}
              data-category
              className="relative block will-change-transform"
            >
              <div className="relative">
                <div data-print className="relative will-change-transform">
                  <span
                    aria-hidden
                    className="absolute -top-5 left-1/2 z-10 h-7 w-2.5 -translate-x-1/2 rounded-[2px] bg-[#c8a46a] shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                  />
                  <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900 lg:aspect-[3/4]">
                    {banner ? (
                      <Image
                        src={banner.src}
                        alt={category.title}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        placeholder="blur"
                        blurDataURL={banner.blur}
                        className="object-cover"
                        style={{ objectPosition: banner.focus }}
                      />
                    ) : (
                      <div className="absolute inset-0" style={{ background: category.slides[0] }}>
                        <Silhouette subject={category.subject} />
                      </div>
                    )}
                  </div>
                </div>

                <div
                  aria-hidden
                  className={`pointer-events-none absolute z-10 hidden -translate-y-[1.12em] font-display lg:block text-[clamp(36px,4.2vw,72px)] leading-none font-light whitespace-nowrap uppercase ${
                    i < categories.length / 2
                      ? "top-full left-0 -translate-x-[0.4em]"
                      : "top-0 right-0 translate-x-[0.4em]"
                  }`}
                >
                  <span
                    data-hover-line
                    className="block w-fit bg-background/75 px-[0.25em] py-[0.06em] opacity-0 backdrop-blur-sm will-change-transform"
                  >
                    Explore
                  </span>
                  <span
                    data-hover-line
                    className="ml-[1.4em] flex w-fit items-baseline bg-background/75 px-[0.25em] py-[0.06em] opacity-0 backdrop-blur-sm will-change-transform"
                  >
                    <span className="mr-[0.25em] font-script text-[0.95em] normal-case">all</span>
                    {category.short}
                  </span>
                </div>
              </div>

              <div data-caption className="mt-6">
                <h2 className="text-[15px] leading-[1.35] font-light tracking-[0.14em] uppercase md:text-[17px] lg:min-h-[2.7em]">
                  {category.title}
                </h2>
                <span className="mt-3 inline-block text-[10px] tracking-[0.3em] uppercase opacity-70">View Gallery</span>
              </div>
            </Link>
          </div>
        );
      })}
    </section>
  );
}
