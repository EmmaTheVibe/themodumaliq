"use client";

import { Suspense, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScriptLogo from "./ScriptLogo";

gsap.registerPlugin(useGSAP);

const links = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const ACTIVE = "#c8a46a";

function NavLinks({ active }: { active?: string }) {
  return (
    <ul className="flex items-center gap-1 min-[400px]:gap-5 md:gap-10">
      {links.map((link) => {
        const current = active === link.href || active?.startsWith(`${link.href}/`);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={current ? "page" : undefined}
              className="relative isolate inline-block px-2 py-1.5 font-display text-[12px] font-medium tracking-[0.12em] min-[400px]:px-3 min-[400px]:text-[14px] min-[400px]:tracking-[0.18em] uppercase opacity-80 transition-[opacity,color] before:absolute before:inset-0 before:-z-10 before:bg-background/20 before:backdrop-blur-[2px] before:[mask-image:radial-gradient(closest-side,#000_55%,transparent)] hover:opacity-100 aria-[current=page]:opacity-100 md:text-[16px]"
              style={current ? { color: ACTIVE } : undefined}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveNavLinks() {
  return <NavLinks active={usePathname()} />;
}

type Props = {
  visible?: boolean;
  sticky?: boolean;
};

export default function Navbar({ visible = true, sticky = false }: Props) {
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
      className={`invisible ${sticky ? "fixed" : "absolute"} inset-x-0 top-0 z-40 flex items-center justify-between gap-3 px-4 py-5 text-foreground min-[400px]:px-6 md:px-10 md:py-6`}
    >
      <Link href="/" data-nav-item aria-label="themodumaliq photography, home" className="opacity-90 hover:opacity-100">
        <ScriptLogo className="h-7 min-[400px]:h-8 md:h-10" />
      </Link>
      <nav aria-label="Main" data-nav-item>
        <Suspense fallback={<NavLinks />}>
          <ActiveNavLinks />
        </Suspense>
      </nav>
    </header>
  );
}
