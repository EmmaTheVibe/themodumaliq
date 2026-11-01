"use client";

import { Suspense, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { galleries } from "./galleries";
import Menu from "./Menu";
import ScriptLogo from "./ScriptLogo";

gsap.registerPlugin(useGSAP);

const links = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const ACTIVE = "#c8a46a";

const LINK =
  "relative isolate inline-block cursor-pointer px-2 py-1.5 font-display text-[12px] font-medium tracking-[0.12em] min-[400px]:px-3 min-[400px]:text-[14px] min-[400px]:tracking-[0.18em] uppercase opacity-80 transition-[opacity,color] before:absolute before:inset-0 before:-z-10 before:bg-background/20 before:backdrop-blur-[2px] before:[mask-image:radial-gradient(closest-side,#000_55%,transparent)] hover:opacity-100 aria-[current=page]:opacity-100 md:text-[16px]";

function NavLinks({ active }: { active?: string }) {
  return (
    <ul className="flex items-center gap-1 min-[400px]:gap-5 md:gap-10">
      {links.map((link) => {
        const current = active === link.href || active?.startsWith(`${link.href}/`);
        return (
          <li key={link.href} className="hidden md:block">
            <Link
              href={link.href}
              aria-current={current ? "page" : undefined}
              className={LINK}
              style={current ? { color: ACTIVE } : undefined}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
      <li>
        <Menu active={active} className={LINK} />
      </li>
    </ul>
  );
}

function ActiveNavLinks() {
  return <NavLinks active={usePathname()} />;
}

function NavTitle() {
  const pathname = usePathname();
  const id = useId();
  const [open, setOpen] = useState(false);
  const gallery = galleries.find((g) => g.href === pathname);
  if (!gallery) return null;

  return (
    <div
      data-nav-title
      className="relative hidden items-center gap-5 lg:flex"
      onPointerEnter={(e) => e.pointerType !== "touch" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType !== "touch" && setOpen(false)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <span aria-hidden className="h-6 w-px bg-foreground/40" />
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${gallery.short}, switch gallery`}
        onClick={() => setOpen(true)}
        className="flex cursor-pointer items-center gap-2 py-1.5 font-display text-[16px] font-medium tracking-[0.18em] uppercase"
      >
        {gallery.short}
        <svg
          viewBox="0 0 24 24"
          className={`size-3.5 opacity-70 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        id={id}
        className={`absolute top-full left-0 pt-2 transition-[opacity,translate,visibility] duration-300 ${
          open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0"
        }`}
      >
        <ul className="min-w-52 border border-foreground/10 bg-background/85 px-5 py-3 backdrop-blur-md">
          {galleries.map((g) => {
            const current = g.href === pathname;
            return (
              <li key={g.slug}>
                {g.ready ? (
                  <Link
                    href={g.href}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="inline-block py-1.5 font-display text-[15px] font-medium tracking-[0.18em] uppercase opacity-80 transition-opacity hover:opacity-100 aria-[current=page]:opacity-100"
                    style={current ? { color: ACTIVE } : undefined}
                  >
                    {g.short}
                  </Link>
                ) : (
                  <span className="inline-flex items-baseline gap-3 py-1.5 font-display text-[15px] font-medium tracking-[0.18em] uppercase opacity-30">
                    {g.short}
                    <span className="font-sans text-[9px] tracking-[0.3em]">Soon</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
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
      <div className="flex items-center gap-5">
        <Link href="/" data-nav-item aria-label="themodumaliq photography, home" className="opacity-90 hover:opacity-100">
          <ScriptLogo className="h-7 min-[400px]:h-8 md:h-10" />
        </Link>
        <Suspense fallback={null}>
          <NavTitle />
        </Suspense>
      </div>
      <nav aria-label="Main" data-nav-item>
        <Suspense fallback={<NavLinks />}>
          <ActiveNavLinks />
        </Suspense>
      </nav>
    </header>
  );
}
