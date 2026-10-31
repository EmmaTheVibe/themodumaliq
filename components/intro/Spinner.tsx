export default function Spinner() {
  return (
    <span
      data-spinner
      role="status"
      aria-label="Loading"
      className="invisible absolute bottom-16 left-1/2 -ml-[7px] block size-[14px] rounded-full border-2 border-foreground/80 border-t-transparent"
    />
  );
}
