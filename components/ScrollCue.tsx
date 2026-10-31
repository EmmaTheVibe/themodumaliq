"use client";

import { useEffect, useState } from "react";

export default function ScrollCue({ visible }: { visible: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (scrolled) return;
    const onScroll = () => {
      if (window.scrollY > 40) setScrolled(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrolled]);

  const shown = visible && !scrolled;

  return (
    <button
      type="button"
      aria-label="Scroll to see more galleries"
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      onClick={() => window.scrollBy({ top: window.innerHeight * 0.75, behavior: "smooth" })}
      className={`fixed bottom-6 left-1/2 z-30 -ml-[22px] grid size-11 place-items-center rounded-full border border-foreground/30 bg-background/40 text-foreground backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
        shown ? "opacity-100 delay-[1400ms]" : "pointer-events-none opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5 motion-safe:animate-bounce"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}
