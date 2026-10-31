import { iDot, scriptStrokes, tCrossbar } from "./intro/logoPaths";

export default function ScriptLogo({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="5 10 3135 825" className={`block w-auto ${className}`}>
      <g fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
        {[...scriptStrokes, tCrossbar, iDot].map((d, i) => (
          <path key={i} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}
