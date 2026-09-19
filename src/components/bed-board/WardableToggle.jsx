import { useState, useEffect } from "react";
import { formatDistanceToNowStrict } from "date-fns";

export function WardableToggle({ wardable, wardableAt, pending, onToggle }) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!wardable || !wardableAt) return;
    const id = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, [wardable, wardableAt]);

  const elapsed =
    wardable && wardableAt ? formatDistanceToNowStrict(new Date(wardableAt)) : null;
  const title = wardable && wardableAt
    ? `Wardable since ${new Date(wardableAt).toLocaleString()} — click to clear`
    : "Mark ready for discharge to the ward";

  return (
    <button
      type="button"
      aria-pressed={wardable}
      onClick={(e) => {
        e.stopPropagation();
        if (!pending) onToggle();
      }}
      disabled={pending}
      title={title}
      className={
        "mt-1 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition disabled:opacity-60 " +
        (wardable
          ? "bg-emerald-500/15 text-emerald-800 border-emerald-500/40 dark:text-emerald-300 dark:border-emerald-400/40 hover:bg-emerald-500/25"
          : "bg-transparent text-muted-foreground border-dashed hover:bg-accent hover:text-foreground")
      }
    >
      <span aria-hidden="true">{wardable ? "✓" : "○"}</span>
      <span>
        {wardable ? (elapsed ? `Wardable · ${elapsed}` : "Wardable") : "Wardable"}
      </span>
    </button>
  );
}