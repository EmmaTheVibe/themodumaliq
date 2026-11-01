"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const ACCENT = "#c8a46a";
const SIZE = 30;
const DOT = 18;
const ARM = 10;
const LINE = 2;
const BARS = [
  { top: 0, left: 0, width: ARM, height: LINE },
  { top: LINE, left: 0, width: LINE, height: ARM - LINE },
  { top: 0, right: 0, width: ARM, height: LINE },
  { top: LINE, right: 0, width: LINE, height: ARM - LINE },
  { bottom: 0, left: 0, width: ARM, height: LINE },
  { bottom: LINE, left: 0, width: LINE, height: ARM - LINE },
  { bottom: 0, right: 0, width: ARM, height: LINE },
  { bottom: LINE, right: 0, width: LINE, height: ARM - LINE },
];
const TARGETS = "a[href], button:not(:disabled), input:not([type='hidden']), textarea, [role='button'], [role='option']";
const FINE = "(hover: hover) and (pointer: fine)";
const REDUCE = "(prefers-reduced-motion: reduce)";

export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia(FINE);
    const reduce = window.matchMedia(REDUCE);
    const rootEl = root.current!;
    const frameEl = frame.current!;
    const dotEl = dot.current!;

    const lag = (duration: number) => ({ duration: reduce.matches ? 0 : duration, ease: "power3.out" });
    const frameX = gsap.quickTo(frameEl, "x", lag(0.35));
    const frameY = gsap.quickTo(frameEl, "y", lag(0.35));
    const frameW = gsap.quickTo(frameEl, "width", lag(0.35));
    const frameH = gsap.quickTo(frameEl, "height", lag(0.35));
    const dotX = gsap.quickSetter(dotEl, "x", "px");
    const dotY = gsap.quickSetter(dotEl, "y", "px");
    gsap.set(frameEl, { x: -SIZE, y: -SIZE, width: SIZE, height: SIZE });

    let enabled = false;
    let inside = false;
    let shown = false;
    let px = -SIZE;
    let py = -SIZE;
    let target: Element | null = null;
    let raisedFor: Element | null = null;

    const enable = () => {
      if (enabled) return;
      enabled = true;
      gsap.ticker.add(tick);
      rootEl.showPopover();
      raisedFor = document.querySelector("dialog:modal");
      gsap.set(frameEl, { x: px - SIZE / 2, y: py - SIZE / 2 });
    };

    const disable = () => {
      if (!enabled) return;
      enabled = false;
      gsap.ticker.remove(tick);
      shown = false;
      target = null;
      gsap.set(rootEl, { opacity: 0 });
      rootEl.hidePopover();
    };

    const raise = () => {
      const modal = document.querySelector("dialog:modal");
      if (modal === raisedFor) return;
      raisedFor = modal;
      rootEl.hidePopover();
      rootEl.showPopover();
    };

    const lock = (next: Element | null) => {
      if (next === target) return;
      target = next;
      dotEl.style.color = target ? ACCENT : "";
    };

    function tick() {
      raise();
      if (inside !== shown) {
        shown = inside;
        gsap.to(rootEl, { opacity: inside ? 1 : 0, duration: 0.2, overwrite: true });
      }
      const el = inside ? document.elementFromPoint(px, py) : null;
      const hit = el?.closest(TARGETS) ?? null;
      lock(hit && !el?.closest("[data-cursor-skip]") ? hit : null);

      if (target) {
        const r = (target.querySelector("[data-cursor-frame]") ?? target).getBoundingClientRect();
        const pad = Math.min(r.width, r.height) > 120 ? -10 : 6;
        frameX(r.left - pad);
        frameY(r.top - pad);
        frameW(r.width + pad * 2);
        frameH(r.height + pad * 2);
      } else {
        frameX(px - SIZE / 2);
        frameY(py - SIZE / 2);
        frameW(SIZE);
        frameH(SIZE);
      }
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !fine.matches) {
        disable();
        return;
      }
      px = e.clientX;
      py = e.clientY;
      inside = true;
      enable();
      dotX(px);
      dotY(py);
    };

    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) inside = false;
    };
    const onBlur = () => {
      inside = false;
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") gsap.to(frameEl, { scale: 0.86, duration: 0.12, ease: "power2.out" });
    };
    const onUp = () => {
      gsap.to(frameEl, { scale: 1, duration: 0.5, ease: "back.out(3)" });
    };
    const onFineChange = () => {
      if (!fine.matches) disable();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("blur", onBlur);
    fine.addEventListener("change", onFineChange);

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("blur", onBlur);
      fine.removeEventListener("change", onFineChange);
      disable();
      gsap.killTweensOf([rootEl, frameEl]);
    };
  }, []);

  return (
    <div
      ref={root}
      popover="manual"
      aria-hidden
      className="pointer-events-none fixed inset-0 m-0 size-full max-h-none max-w-none overflow-hidden border-0 bg-transparent p-0 text-foreground opacity-0"
    >
      <div ref={frame} className="absolute top-0 left-0">
        {BARS.map((style, i) => (
          <span key={i} className="absolute backdrop-invert" style={style} />
        ))}
      </div>
      <div
        ref={dot}
        className="absolute top-0 left-0 rounded-full border border-current/50 backdrop-invert transition-colors duration-300"
        style={{ width: DOT, height: DOT, marginTop: -DOT / 2, marginLeft: -DOT / 2 }}
      />
    </div>
  );
}
