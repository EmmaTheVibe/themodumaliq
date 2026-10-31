"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScriptLogo from "./ScriptLogo";

gsap.registerPlugin(useGSAP);

const links = [
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

type Props = {
  visible?: boolean;
};

export default function Navbar({ visible = true }: Props) {
  const nav = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!visible) return;
      const mm = gsap.matchMedia(nav.current!);
      mm.add(
        { full: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (context) => {
          if (context.conditions?.reduce) {
            gsap.to(nav.current, { autoAlpha: 1, duration: 0.4 });
            return;
          }
          gsap
            .timeline()
            .fromTo(nav.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power2.out" })
            .from("[data-nav-item]", { y: -10, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 }, 0);
        },
      );
      return () => mm.revert();
    },
    { dependencies: [visible], scope: nav },
  );

  return (
    <header
      ref={nav}
      data-navbar
      className="invisible fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 text-foreground md:px-10 md:py-6"
    >
      <Link href="/" data-nav-item aria-label="themodumaliq photography, home" className="opacity-90 hover:opacity-100">
        <ScriptLogo className="h-8 md:h-10" />
      </Link>
      <nav aria-label="Main">
        <ul className="flex items-center gap-5 md:gap-10">
          {links.map((link) => (
            <li key={link.href} data-nav-item>
              <a
                href={link.href}
                className="relative isolate inline-block px-3 py-1.5 font-display text-[14px] font-medium tracking-[0.18em] uppercase opacity-80 transition-opacity before:absolute before:inset-0 before:-z-10 before:bg-background/20 before:backdrop-blur-[2px] before:[mask-image:radial-gradient(closest-side,#000_55%,transparent)] hover:opacity-100 md:text-[16px]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
