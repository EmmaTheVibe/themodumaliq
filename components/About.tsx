"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Accent from "./Accent";
import type { Photo } from "./gallery/photos";

gsap.registerPlugin(useGSAP);

const PEG = 14;

export default function About({ portrait }: { portrait?: Photo }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { full: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const text = gsap.utils.toArray<HTMLElement>("[data-rise]");
          if (ctx.conditions?.reduce) {
            gsap.set(["[data-print]", ...text], { opacity: 1 });
            return;
          }
          gsap
            .timeline({ delay: 0.15 })
            .fromTo("[data-string]", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, 0)
            .fromTo(
              "[data-print]",
              { y: -140, opacity: 0, rotation: -12, transformOrigin: `50% -${PEG}px` },
              { y: 0, opacity: 1, duration: 0.55, ease: "power2.in" },
              0.25,
            )
            .to("[data-print]", { rotation: 0, duration: 2.2, ease: "elastic.out(1.1, 0.28)" }, 0.8)
            .fromTo(
              text,
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.09 },
              0.5,
            );
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="mx-auto grid w-full max-w-[1400px] flex-1 gap-14 px-6 pt-36 pb-24 md:px-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-24 lg:pt-40 fit:min-h-0 fit:pt-24 fit:pb-8"
    >
      <div className="relative mx-auto w-full max-w-[520px] fit:w-auto">
        <span
          data-string
          aria-hidden
          className="pointer-events-none absolute -inset-x-6 h-px origin-left bg-foreground/40 sm:-inset-x-10"
          style={{ top: -PEG }}
        />
        <div data-print className="relative opacity-0 will-change-transform motion-reduce:opacity-100">
          <span
            aria-hidden
            className="absolute -top-5 left-1/2 z-10 h-7 w-2.5 -translate-x-1/2 rounded-[2px] bg-[#c8a46a] shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
          />
          {portrait && (
            <Image
              src={portrait.src}
              width={portrait.width}
              height={portrait.height}
              alt={portrait.alt ?? "Moses Momodu"}
              sizes="(min-width: 1024px) 40vw, (min-width: 640px) 520px, 100vw"
              placeholder="blur"
              blurDataURL={portrait.blur}
              preload
              className="block h-auto w-full shadow-[0_18px_40px_rgba(0,0,0,0.55)] fit:h-[min(calc(100dvh-15rem),693px)] fit:w-auto"
            />
          )}
        </div>
      </div>

      <div className="max-w-[62ch]">
        <p data-rise className="text-[11px] tracking-[0.3em] uppercase opacity-0 motion-reduce:opacity-100">
          Meet the photographer
        </p>
        <h1
          data-rise
          className="mt-5 font-display text-[clamp(44px,6vw,88px)] leading-[0.95] font-light opacity-0 motion-reduce:opacity-100 fit:text-[clamp(40px,5vw,76px)]"
        >
          Hey, I am{" "}
          <Accent delay={700} className="font-script text-[1.15em]">
            Moses
          </Accent>
        </h1>
        <div className="mt-8 space-y-5 text-[15px] leading-[1.8] font-light md:text-[16px] fit:mt-6 fit:leading-[1.7]">
          <p data-rise className="opacity-0 motion-reduce:opacity-100">
            I’m a visual storyteller and brand-focused creative working at the intersection of photography, personal
            branding, and customer experience. My work is rooted in intention—understanding people and brands deeply,
            then translating that insight into visuals that feel authentic, confident, and purposeful. From corporate
            headshots and personal branding portraits to business and corporate events, I focus on creating imagery that
            supports clarity, credibility, and growth.
          </p>
          <p data-rise className="opacity-0 motion-reduce:opacity-100">
            I work mostly between <Accent delay={500}>Lagos</Accent> and <Accent delay={750}>Ondo</Accent> States, and
            with clients <Accent delay={1000}>across Nigeria</Accent>, which has shaped a flexible,
            people-first approach to my craft. Calm, collaborative, and detail-driven, I prioritize making clients feel
            comfortable while thinking strategically about how each image will be used. For me, strong visuals aren’t
            just about aesthetics—they’re about telling the right story, the right way.
          </p>
        </div>
        <Link
          data-rise
          href="/contact"
          className="group mt-10 fit:mt-8 inline-flex items-baseline gap-3 font-display text-[clamp(26px,2.6vw,36px)] font-light opacity-0 motion-reduce:opacity-100"
        >
          <span className="border-b border-foreground/30 pb-1 transition-colors group-hover:border-foreground">
            Let’s work together.
          </span>
          <svg
            viewBox="0 0 24 24"
            className="size-5 translate-y-0.5 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
