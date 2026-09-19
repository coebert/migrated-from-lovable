import { Button } from "@/components/ui/button";
import { QUICK_FILTER_LABELS } from "@/lib/referral-utils";

const KEYS = ["all", "awaiting_review", "awaiting_bed", "accepted_not_arrived", "discussed_pending"];

export function QuickFilterChips({ value, onChange, counts }) {
  return (
    <div className="flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Quick filters">
      {KEYS.map((k) => {
        const active = value === k;
        return (
          <Button
            key={k}
            role="tab"
            aria-selected={active}
            size="sm"
            variant={active ? "default" : "outline"}
            onClick={() => onChange(k)}
            className="h-8"
          >
            {QUICK_FILTER_LABELS[k]}
            <span className={`ml-2 text-[10px] rounded px-1 ${active ? "bg-primary-foreground/20" : "bg-muted"}`}>
              {counts[k] ?? 0}
            </span>
          </Button>
        );
      })}
    </div>
  );
}