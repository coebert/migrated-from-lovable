export function WardableBadge({ className = "" }) {
  return (
    <span
      className={
        "inline-flex items-center rounded border px-1.5 py-0.5 font-semibold uppercase tracking-wide " +
        "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 " +
        className
      }
      title="Wardable — ready for a ward bed"
      aria-label="Wardable"
    >
      Wardable
    </span>
  );
}