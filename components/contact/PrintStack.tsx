"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Photo } from "../gallery/photos";

gsap.registerPlugin(useGSAP);

const INTERVAL = 4.5;
const VISIBLE = 4;
const ROTATIONS = [-3.5, 2.5, -1.5, 4, -2.5, 1.5, -4, 3];

export default function PrintStack({ photos }: { photos: Photo[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
      const n = cards.length;
      if (!n) return;
      let order = cards.map((_, i) => i);
      let flips = 0;
      let onScreen = true;
      const rotation = (i: number) => ROTATIONS[i % ROTATIONS.length];
      const place = (i: number, depth: number) => ({
        zIndex: n - depth,
        y: Math.min(depth, VISIBLE) * 8,
        scale: 1 - Math.min(depth, VISIBLE) * 0.035,
        rotation: rotation(i),
        opacity: depth < VISIBLE ? 1 : 0,
      });

      cards.forEach((card, i) => gsap.set(card, place(i, i)));
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(cards.slice(0, VISIBLE).reverse(), {
        y: 70,
        opacity: 0,
        rotation: (k) => rotation(VISIBLE - 1 - k) * 3,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
      });

      const observer = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
      });
      observer.observe(root.current!);

      const shuffle = contextSafe!(() => {
        if (!onScreen) {
          gsap.delayedCall(1, shuffle);
          return;
        }
        const topIndex = order[0];
        const top = cards[topIndex];
        const besideForm = window.matchMedia("(min-width: 1024px)").matches;
        const side = besideForm ? -1 : flips++ % 2 ? 1 : -1;
        const rest = order.slice(1);
        order = [...rest, topIndex];

        const tl = gsap.timeline({ onComplete: () => void gsap.delayedCall(INTERVAL, shuffle) });
        tl.to(top, {
          xPercent: side * 72,
          y: -28,
          rotation: rotation(topIndex) + side * 12,
          duration: 0.6,
          ease: "power2.inOut",
        })
          .set(top, { zIndex: 0 })
          .to(top, { xPercent: 0, ...place(topIndex, n - 1), zIndex: 0, duration: 0.6, ease: "power2.out" });
        rest.forEach((i, depth) => {
          tl.set(cards[i], { zIndex: n - depth }, 0.3).to(
            cards[i],
            { ...place(i, depth), duration: 0.6, ease: "power2.out" },
            0.35,
          );
        });
      });

      gsap.delayedCall(INTERVAL, shuffle);
      return () => observer.disconnect();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative mx-auto aspect-[4/5] w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px]">
      {photos.map((photo, i) => (
        <div
          key={photo.src}
          data-card
          className="absolute inset-0 overflow-hidden bg-neutral-900 shadow-[0_18px_40px_rgba(0,0,0,0.55)] will-change-transform"
          style={{ zIndex: photos.length - i, opacity: i < VISIBLE ? 1 : 0 }}
        >
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 460px, (min-width: 640px) 420px, 340px"
            placeholder="blur"
            blurDataURL={photo.blur}
            preload={i === 0}
            className="object-cover object-[50%_30%]"
          />
        </div>
      ))}
    </div>
  );
}
