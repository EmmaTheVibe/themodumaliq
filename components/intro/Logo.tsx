import gsap from "gsap";
import {
  LOGO_VIEWBOX,
  SCRIPT_STROKE_WIDTH,
  iDot,
  photographyLetters,
  scriptStrokes,
  tCrossbar,
  underline,
} from "./logoPaths";

export type Pen = {
  total: number;
  render: (at: number) => void;
};

export function createPen(strokes: SVGGeometryElement[], lift = 0): Pen {
  const lengths = strokes.map((s) => s.getTotalLength());
  const starts: number[] = [];
  let total = 0;
  lengths.forEach((len, i) => {
    starts.push(total);
    total += len + (i < lengths.length - 1 ? lift : 0);
  });

  strokes.forEach((s, i) => {
    gsap.set(s, { strokeDasharray: lengths[i] + 1, strokeDashoffset: lengths[i] + 1, opacity: 0 });
  });

  return {
    total,
    render: (at) => {
      strokes.forEach((s, i) => {
        const k = Math.min(1, Math.max(0, (at - starts[i]) / lengths[i]));
        s.style.strokeDashoffset = String((lengths[i] + 1) * (1 - k));
        s.style.opacity = k > 0 ? "1" : "0";
      });
    },
  };
}

export type LogoParts = {
  wrapper: HTMLElement;
  script: SVGGeometryElement[];
  finish: SVGGeometryElement[];
  underline: SVGGeometryElement;
  letters: SVGElement[];
};

export function getLogoParts(root: HTMLElement): LogoParts {
  const wrapper = root.querySelector<HTMLElement>("[data-headline]")!;
  return {
    wrapper,
    script: Array.from(wrapper.querySelectorAll<SVGGeometryElement>("[data-script]")),
    finish: Array.from(wrapper.querySelectorAll<SVGGeometryElement>("[data-finish]")),
    underline: wrapper.querySelector<SVGGeometryElement>("[data-underline]")!,
    letters: Array.from(wrapper.querySelectorAll<SVGElement>("[data-letter]")),
  };
}

export default function Logo() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center px-6">
      <h1 data-headline className="invisible w-[min(88vw,880px)]">
        <span className="sr-only">themodumaliq photography</span>
        <svg aria-hidden viewBox={LOGO_VIEWBOX} className="block h-auto w-full overflow-visible">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth={SCRIPT_STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {scriptStrokes.map((d, i) => (
              <path key={i} data-script d={d} />
            ))}
            <path data-finish d={tCrossbar} />
            <path data-finish d={iDot} />
          </g>
          <line
            data-underline
            x1={underline.x1}
            x2={underline.x2}
            y1={underline.y}
            y2={underline.y}
            stroke="currentColor"
            strokeWidth={underline.width}
          />
          <g fill="currentColor" fillRule="evenodd">
            {photographyLetters.map((d, i) => (
              <path key={i} data-letter d={d} />
            ))}
          </g>
        </svg>
      </h1>
    </div>
  );
}
