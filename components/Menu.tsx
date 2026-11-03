"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { galleries } from "./galleries";
import Credit from "./Credit";
import ScriptLogo from "./ScriptLogo";
import Socials from "./Socials";
import { EMAIL } from "./site";

gsap.registerPlugin(useGSAP);

const ACTIVE = "#c8a46a";
const PEG = 14;
const REDUCE = "(prefers-reduced-motion: reduce)";
const QUIET_FOCUS = { preventScroll: true, focusVisible: false };

const pages = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

type Props = {
  active?: string;
  className: string;
};

export default function Menu({ active, className }: Props) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const intent = useRef<gsap.core.Tween | null>(null);
  const shown = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const { context } = useGSAP({ scope: dialog });

  useLayoutEffect(() => {
    const el = dialog.current;
    return () => el?.close();
  }, [active]);

  const prints = () =>
    gsap.utils.toArray<HTMLElement>("[data-menu-print]", dialog.current);

  const hang = (slug: string | null) => {
    if (slug === shown.current) return;
    const find = (s: string | null) =>
      s ? prints().find((p) => p.dataset.menuPrint === s) : undefined;
    const prev = find(shown.current);
    const next = find(slug);
    shown.current = slug;
    const reduce = window.matchMedia(REDUCE).matches;

    if (prev) {
      gsap.killTweensOf(prev);
      gsap.to(
        prev,
        reduce
          ? { opacity: 0, duration: 0.2 }
          : {
              y: -50,
              opacity: 0,
              rotation: 5,
              duration: 0.3,
              ease: "power2.in",
            },
      );
    }
    if (!next) return;
    gsap.killTweensOf(next);
    if (reduce) {
      gsap.to(next, { opacity: 1, duration: 0.3 });
      return;
    }
    gsap
      .timeline({ delay: prev ? 0.12 : 0 })
      .fromTo(
        next,
        {
          y: -110,
          opacity: 0,
          rotation: -10,
          transformOrigin: `50% -${PEG}px`,
        },
        { y: 0, opacity: 1, duration: 0.45, ease: "power2.in" },
      )
      .to(next, { rotation: 0, duration: 1.8, ease: "elastic.out(1.1, 0.3)" });
  };

  const preview = (slug: string | null) => {
    context.add(() => {
      intent.current?.kill();
      intent.current = gsap.delayedCall(0.06, () =>
        context.add(() => hang(slug)),
      );
    });
  };

  const onPointerEnter = (e: PointerEvent, slug: string) => {
    if (e.pointerType !== "touch") preview(slug);
  };

  const show = () => {
    const el = dialog.current!;
    el.showModal();
    closeButton.current?.focus(QUIET_FOCUS);
    setOpen(true);
    context.add(() => {
      tl.current?.kill();
      tl.current = window.matchMedia(REDUCE).matches
        ? gsap
            .timeline()
            .fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        : gsap
            .timeline()
            .fromTo(
              el,
              { opacity: 0 },
              { opacity: 1, duration: 0.4, ease: "power2.out" },
            )
            .fromTo(
              "[data-menu-line]",
              { scaleX: 0 },
              { scaleX: 1, duration: 0.8, ease: "power2.inOut" },
              0.1,
            )
            .fromTo(
              "[data-menu-rise]",
              { opacity: 0, y: 28 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power3.out",
                stagger: 0.06,
              },
              0.12,
            );
    });
  };

  const hide = () => {
    const el = dialog.current!;
    context.add(() => {
      tl.current?.kill();
      intent.current?.kill();
      tl.current = gsap
        .timeline()
        .to(el, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => el.close(),
        });
    });
  };

  const onClose = () => {
    setOpen(false);
    tl.current?.kill();
    intent.current?.kill();
    shown.current = null;
    const all = prints();
    gsap.killTweensOf(all);
    gsap.set(all, { opacity: 0 });
  };

  const follow = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.button !== 0 ||
      href !== active
    )
      return;
    e.preventDefault();
    hide();
  };

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={show}
        className={className}
      >
        Menu
      </button>

      <dialog
        ref={dialog}
        id={id}
        data-menu
        aria-label="Menu"
        onCancel={(e) => {
          e.preventDefault();
          hide();
        }}
        onClose={onClose}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-x-clip overflow-y-auto overscroll-contain border-0 bg-background p-0 text-foreground backdrop:bg-transparent"
      >
        <div className="flex min-h-full flex-col">
          <div className="flex items-center justify-between gap-3 px-4 py-5 min-[400px]:px-6 md:px-10 md:py-6">
            <Link
              href="/"
              onClick={(e) => follow(e, "/")}
              aria-label="themodumaliq photography, home"
              className="opacity-90 hover:opacity-100"
            >
              <ScriptLogo className="h-7 min-[400px]:h-8 md:h-10" />
            </Link>
            <button
              ref={closeButton}
              type="button"
              onClick={hide}
              className={className}
            >
              Close
            </button>
          </div>

          <div className="mx-auto grid w-full max-w-350 flex-1 content-center gap-16 px-6 py-10 md:px-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center lg:gap-24">
            <nav aria-label="Site">
              <p
                data-menu-rise
                className="text-[11px] tracking-[0.3em] uppercase opacity-60"
              >
                Galleries
              </p>
              <ul className="mt-5">
                {galleries.map((g) => {
                  const isCurrent = g.href === active;
                  return (
                    <li key={g.slug} data-menu-rise>
                      {g.ready ? (
                        <Link
                          href={g.href}
                          aria-current={isCurrent ? "page" : undefined}
                          onClick={(e) => follow(e, g.href)}
                          onPointerEnter={(e) => onPointerEnter(e, g.slug)}
                          onPointerLeave={() => preview(null)}
                          onFocus={() => preview(g.slug)}
                          onBlur={() => preview(null)}
                          className="inline-block font-display text-[clamp(42px,9vw,96px)] leading-[1.08] font-light uppercase opacity-85 transition-[opacity,translate] duration-300 hover:translate-x-2 hover:opacity-100 aria-[current=page]:opacity-100"
                          style={isCurrent ? { color: ACTIVE } : undefined}
                        >
                          {g.short}
                        </Link>
                      ) : (
                        <span className="inline-flex flex-wrap items-baseline gap-x-4 font-display text-[clamp(42px,9vw,96px)] leading-[1.08] font-light uppercase opacity-30">
                          {g.short}
                          <span className="font-sans text-[10px] tracking-[0.3em]">
                            Soon
                          </span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              <ul data-menu-rise className="mt-12 flex items-center gap-8">
                {pages.map((page) => {
                  const isCurrent = page.href === active;
                  return (
                    <li key={page.href}>
                      <Link
                        href={page.href}
                        aria-current={isCurrent ? "page" : undefined}
                        onClick={(e) => follow(e, page.href)}
                        className="font-display text-[18px] font-medium tracking-[0.18em] uppercase opacity-80 transition-opacity hover:opacity-100 aria-[current=page]:opacity-100 md:text-[22px]"
                        style={isCurrent ? { color: ACTIVE } : undefined}
                      >
                        {page.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div aria-hidden className="relative hidden lg:block">
              <span
                data-menu-line
                className="absolute -inset-x-10 top-0 h-px origin-left bg-foreground/40"
              />
              <div
                className="relative mx-auto aspect-4/5 w-[min(26vw,360px)]"
                style={{ marginTop: PEG }}
              >
                {galleries.map(
                  (g) =>
                    g.banner && (
                      <div
                        key={g.slug}
                        data-menu-print={g.slug}
                        className="absolute inset-0 opacity-0 will-change-transform"
                        style={{ transformOrigin: `50% -${PEG}px` }}
                      >
                        <span className="absolute -top-5 left-1/2 z-10 h-7 w-2.5 -translate-x-1/2 rounded-xs bg-[#c8a46a] shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                        <div className="relative h-full overflow-hidden bg-neutral-900 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
                          <Image
                            src={g.banner.src}
                            alt=""
                            fill
                            sizes="360px"
                            placeholder="blur"
                            blurDataURL={g.banner.blur}
                            className="object-cover"
                            style={{ objectPosition: g.banner.focus }}
                          />
                        </div>
                      </div>
                    ),
                )}
              </div>
            </div>
          </div>

          <div
            data-menu-rise
            className="flex flex-col items-center gap-4 px-6 pt-4 pb-8 sm:flex-row sm:justify-between md:px-10"
          >
            <Socials className="flex items-center gap-6" />
            <a
              href={`mailto:${EMAIL}`}
              className="text-[11px] tracking-[0.2em] opacity-60 transition-opacity hover:opacity-100"
            >
              {EMAIL}
            </a>
            <Credit />
          </div>
        </div>
      </dialog>
    </>
  );
}
