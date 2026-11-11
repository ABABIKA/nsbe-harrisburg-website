// The small up-right arrow the prototype puts on its buttons. Decorative only.
export default function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      className={className}
    >
      <path d="M4 12 12 4M5 4h7v7" />
    </svg>
  );
}
