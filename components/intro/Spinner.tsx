export default function Spinner() {
  return (
    <span
      data-spinner
      role="status"
      aria-label="Loading"
      className="invisible absolute bottom-16 left-1/2 -ml-1.75 block size-3.5 rounded-full border-2 border-foreground/80 border-t-transparent"
    />
  );
}
