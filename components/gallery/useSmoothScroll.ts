import { useEffect, useRef, type RefObject } from "react";

const LERP = 0.25;
const SCALE_PER_PX = 0.0001;
const MAX_SCALE_DIP = 0.01;
const MOMENTUM = 12;

const INTRO_LERP = 0.17;
const INTRO_SNAP_LERP = 0.28;
const SNAP_AT = 0.5;
const MORPH_AT = 0.82;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const alphaFor = (lerp: number, dt: number) => 1 - Math.pow(1 - lerp, dt / 16.67);

export type SmoothScroll = {
  ready: () => void;
  lock: (on: boolean) => void;
};

type Parts = {
  stage: RefObject<HTMLElement | null>;
  zoom: RefObject<HTMLElement | null>;
  pan: RefObject<HTMLElement | null>;
  hero: RefObject<HTMLElement | null>;
};

export function useSmoothScroll(parts: Parts, onMorph: () => void): RefObject<SmoothScroll> {
  const api = useRef<SmoothScroll>({ ready: () => {}, lock: () => {} });
  const morphRef = useRef(onMorph);

  useEffect(() => {
    morphRef.current = onMorph;
  }, [onMorph]);

  const { stage, zoom, pan, hero } = parts;

  useEffect(() => {
    const stageEl = stage.current!;
    const zoomEl = zoom.current!;
    const panEl = pan.current!;
    const heroEl = hero.current!;
    const fades = Array.from(heroEl.querySelectorAll<HTMLElement>("[data-hero-fade]"));
    const scales = Array.from(heroEl.querySelectorAll<HTMLElement>("[data-hero-scale]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    let mode: "intro" | "morphing" | "ready" = reduce.matches ? "ready" : "intro";
    let target = 0;
    let current = 0;
    let max = 0;
    let introTarget = 0;
    let introCurrent = 0;
    let introMax = 0;
    let snapped = false;
    let locked = false;
    let last = performance.now();
    let frame = 0;
    let first = true;

    const measure = () => {
      max = Math.max(0, panEl.offsetHeight - window.innerHeight);
      target = clamp(target, 0, max);
      current = clamp(current, 0, max);
      introMax = heroEl.offsetHeight;
      if (snapped) introTarget = introMax;
    };

    const scrollBy = (delta: number) => {
      if (locked) return;
      if (mode === "ready") target = clamp(target + delta, 0, max);
      else if (mode === "intro" && !snapped) introTarget = clamp(introTarget + delta, 0, introMax);
    };

    api.current = {
      lock: (on) => {
        locked = on;
      },
      ready: () => {
        mode = "ready";
        stageEl.style.transform = "none";
        heroEl.style.visibility = "hidden";
        target = current = 0;
        measure();
      },
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (first && (introMax || mode === "ready")) {
        stageEl.style.translate = "none";
        if (mode === "ready") {
          stageEl.style.transform = "none";
          heroEl.style.visibility = "hidden";
        }
        first = false;
      }

      if (mode !== "ready" && !introMax) {
        measure();
      } else if (mode !== "ready") {
        const alpha = alphaFor(snapped ? INTRO_SNAP_LERP : INTRO_LERP, dt);
        introCurrent += (introTarget - introCurrent) * alpha;
        if (Math.abs(introTarget - introCurrent) < 0.01) introCurrent = introTarget;
        const p = introCurrent / introMax;
        stageEl.style.transform = `translate3d(0, ${introMax - introCurrent}px, 0)`;
        fades.forEach((el) => {
          el.style.opacity = String(1 - p);
          el.style.filter = `blur(${p * 8}px)`;
        });
        scales.forEach((el) => {
          el.style.transform = `scale(${1 - p * 0.4})`;
        });
        if (!snapped && introMax && introTarget / introMax > SNAP_AT) {
          snapped = true;
          introTarget = introMax;
        }
        if (mode === "intro" && p >= MORPH_AT) {
          mode = "morphing";
          morphRef.current();
        }
      } else {
        const alpha = reduce.matches ? 1 : alphaFor(LERP, dt);
        const prev = current;
        current += (target - current) * alpha;
        if (Math.abs(target - current) < 0.01) current = target;
        const velocity = ((current - prev) * 16.67) / (dt || 16.67);
        const scale = reduce.matches ? 1 : 1 - Math.min(Math.abs(velocity) * SCALE_PER_PX, MAX_SCALE_DIP);
        panEl.style.transform = `translate3d(0, ${-current}px, 0)`;
        zoomEl.style.transform = `scale(${scale})`;
      }
      frame = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || locked) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      scrollBy(e.deltaY * unit);
    };

    let dragging = false;
    let lastY = 0;
    let lastVelocity = 0;
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || locked) return;
      dragging = true;
      lastY = e.clientY;
      lastVelocity = 0;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      lastVelocity = lastY - e.clientY;
      lastY = e.clientY;
      scrollBy(lastVelocity);
      if (mode === "ready") current = target;
    };
    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      if (mode === "ready") scrollBy(lastVelocity * MOMENTUM);
    };

    const onKey = (e: KeyboardEvent) => {
      if (locked) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable='true']")) return;
      const page = window.innerHeight * 0.9;
      const moves: Record<string, () => void> = {
        ArrowDown: () => scrollBy(100),
        ArrowUp: () => scrollBy(-100),
        PageDown: () => scrollBy(page),
        PageUp: () => scrollBy(-page),
        " ": () => scrollBy(e.shiftKey ? -page : page),
        Home: () => scrollBy(-Infinity),
        End: () => scrollBy(Infinity),
      };
      const move = moves[e.key];
      if (!move) return;
      e.preventDefault();
      move();
    };

    const observer = new ResizeObserver(measure);
    observer.observe(panEl);
    observer.observe(heroEl);
    window.addEventListener("resize", measure);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("keydown", onKey);
    measure();
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
    };
  }, [stage, zoom, pan, hero]);

  return api;
}
