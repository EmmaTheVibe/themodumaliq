"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Logo, { createPen, getLogoParts } from "./Logo";
import Spinner from "./Spinner";

gsap.registerPlugin(useGSAP);

const PEN_LIFT = 60;

type Props = {
  timeScale?: number;
  onComplete?: () => void;
};

export default function Intro({ timeScale = 1, onComplete }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const timeScaleRef = useRef(timeScale);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    timeScaleRef.current = timeScale;
    timeline.current?.timeScale(timeScale);
  }, [timeScale]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia(root.current!);
      mm.add(
        { full: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (context) => {
          gsap.to("[data-spinner]", { rotation: 360, duration: 0.9, ease: "none", repeat: -1 });
          const tl = context.conditions?.reduce
            ? buildReducedTimeline(root.current!)
            : buildTimeline(root.current!);
          tl.timeScale(timeScaleRef.current).eventCallback("onComplete", () => onCompleteRef.current?.());
          timeline.current = tl;
          return () => {
            timeline.current = null;
          };
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="fixed inset-0 z-20 overflow-hidden bg-black text-foreground">
      <Logo />
      <Spinner />
    </div>
  );
}

function buildTimeline(root: HTMLElement): gsap.core.Timeline {
  const logo = getLogoParts(root);
  const spinner = root.querySelector("[data-spinner]");
  const script = createPen(logo.script, PEN_LIFT);
  const finish = createPen(logo.finish, PEN_LIFT * 3);
  const rule = createPen([logo.underline]);
  const pen = { script: 0, finish: 0, rule: 0 };

  const tl = gsap.timeline({ delay: 0.6 });
  tl.to(pen, { script: script.total, duration: 2.0, ease: "power1.inOut", onUpdate: () => script.render(pen.script) })
    .to(
      pen,
      { finish: finish.total, duration: 0.45, ease: "power2.inOut", onUpdate: () => finish.render(pen.finish) },
      2.05,
    )
    .to(pen, { rule: rule.total, duration: 0.6, ease: "power2.inOut", onUpdate: () => rule.render(pen.rule) }, 2.2)
    .fromTo(
      logo.letters,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.06 },
      2.4,
    )
    .fromTo(spinner, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: "power2.out" }, 0.3)
    .fromTo(
      logo.wrapper,
      { filter: "blur(0px)", scale: 1 },
      { filter: "blur(10px)", autoAlpha: 0, scale: 1.03, duration: 0.6, ease: "power2.in", immediateRender: false },
      "+=0.9",
    )
    .to(spinner, { autoAlpha: 0, duration: 0.4, ease: "power1.in" }, "<");

  gsap.set(logo.wrapper, { autoAlpha: 1 });
  return tl;
}

function buildReducedTimeline(root: HTMLElement): gsap.core.Timeline {
  const parts = [getLogoParts(root).wrapper, root.querySelector("[data-spinner]")];
  return gsap
    .timeline()
    .fromTo(parts, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 })
    .to(parts, { autoAlpha: 0, duration: 0.4 }, "+=1.2");
}
