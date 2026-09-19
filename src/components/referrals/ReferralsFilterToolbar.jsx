import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ADMISSION_URGENCY_OPTIONS } from "@/lib/referral-utils";

const DATE_OPTIONS = [
  { k: "all", label: "All time" },
  { k: "today", label: "Today" },
  { k: "yesterday", label: "Yesterday" },
  { k: "7d", label: "Last 7 days" },
  { k: "30d", label: "Last 30 days" },
];

const DATE_LABEL = Object.fromEntries(DATE_OPTIONS.map((d) => [d.k, d.label]));

export function ReferralsFilterToolbar(props) {
  const {
    hospSearch, onHospSearchChange,
    q, onQChange,
    statusFilter, onStatusFilterChange,
    dateFilter, onDateFilterChange,
    urgencyFilter, onUrgencyFilterChange,
    locFilter, onLocFilterChange,
    topWards,
    pediatricFilter, onPediatricFilterChange,
  } = props;

  const activeCount =
    (statusFilter !== "all" ? 1 : 0) +
    (dateFilter !== "all" ? 1 : 0) +
    (urgencyFilter !== "all" ? 1 : 0) +
    (locFilter !== "all" ? 1 : 0) +
    (pediatricFilter !== "all" ? 1 : 0);

  const urgencyLabel = urgencyFilter === "all"
    ? null
    : ADMISSION_URGENCY_OPTIONS.find((o) => o.value === urgencyFilter)?.label ?? urgencyFilter;

  const clearAll = () => {
    onStatusFilterChange("all");
    onDateFilterChange("all");
    onUrgencyFilterChange("all");
    onLocFilterChange("all");
    onPediatricFilterChange("all");
  };

  return (
    <div className="mb-3 space-y-2">
      <div className="flex flex-wrap gap-2 items-stretch">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Hospital number…"
            value={hospSearch}
            onChange={(e) => onHospSearchChange(e.target.value)}
            className="pl-9"
            aria-label="Search by hospital number"
          />
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Ward, bed, specialty, reason…"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            className="pl-9"
            aria-label="Search ward, bed, specialty, or reason"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-1.5 shrink-0" aria-label="Open filters">
              <Filter className="w-4 h-4" aria-hidden="true" />
              <span>Filters</span>
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 tabular-nums">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter referrals</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <FilterSection label="Status">
                {["all", "pending", "accepted", "admitted", "declined"].map((s) => (
                  <ChipButton key={s} active={statusFilter === s} onClick={() => onStatusFilterChange(s)} className="capitalize">
                    {s}
                  </ChipButton>
                ))}
              </FilterSection>
              <FilterSection label="Date">
                {DATE_OPTIONS.map(({ k, label }) => (
                  <ChipButton key={k} active={dateFilter === k} onClick={() => onDateFilterChange(k)}>
                    {label}
                  </ChipButton>
                ))}
              </FilterSection>
              <FilterSection label="Urgency">
                <ChipButton active={urgencyFilter === "all"} onClick={() => onUrgencyFilterChange("all")}>
                  All
                </ChipButton>
                {ADMISSION_URGENCY_OPTIONS.map((o) => (
                  <ChipButton key={o.value} active={urgencyFilter === o.value} onClick={() => onUrgencyFilterChange(o.value)}>
                    {o.label}
                  </ChipButton>
                ))}
              </FilterSection>
              {topWards.length > 0 && (
                <FilterSection label="Location">
                  <ChipButton active={locFilter === "all"} onClick={() => onLocFilterChange("all")}>
                    All
                  </ChipButton>
                  {topWards.map((ward) => (
                    <ChipButton key={ward} active={locFilter === ward} onClick={() => onLocFilterChange(ward)}>
                      {ward}
                    </ChipButton>
                  ))}
                </FilterSection>
              )}
              <FilterSection label="Age group">
                <ChipButton active={pediatricFilter === "all"} onClick={() => onPediatricFilterChange("all")}>
                  All ages
                </ChipButton>
                <ChipButton active={pediatricFilter === "pediatric"} onClick={() => onPediatricFilterChange("pediatric")}>
                  Pediatric (≤16)
                </ChipButton>
              </FilterSection>
            </div>
            {activeCount > 0 && (
              <div className="mt-4">
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear all filters
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Active</span>
          {statusFilter !== "all" && (
            <FilterPill label={`Status: ${statusFilter}`} onClear={() => onStatusFilterChange("all")} />
          )}
          {dateFilter !== "all" && (
            <FilterPill label={`Date: ${DATE_LABEL[dateFilter]}`} onClear={() => onDateFilterChange("all")} />
          )}
          {urgencyFilter !== "all" && (
            <FilterPill label={`Urgency: ${urgencyLabel}`} onClear={() => onUrgencyFilterChange("all")} />
          )}
          {locFilter !== "all" && (
            <FilterPill label={`Location: ${locFilter}`} onClear={() => onLocFilterChange("all")} />
          )}
          {pediatricFilter !== "all" && (
            <FilterPill label="Pediatric (≤16)" onClear={() => onPediatricFilterChange("all")} />
          )}
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterSection({ label, children }) {
  return (
    <div>
      <span className="text-xs uppercase text-muted-foreground block mb-2">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ChipButton({ active, onClick, children, className }) {
  return (
    <Button
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className={className}
    >
      {children}
    </Button>
  );
}

function FilterPill({ label, onClear }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 pl-2 pr-1 py-0.5 text-xs capitalize">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove filter ${label}`}
        className="inline-flex items-center justify-center h-5 w-5 rounded-full hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="w-3 h-3" aria-hidden="true" />
      </button>
    </span>
  );
}