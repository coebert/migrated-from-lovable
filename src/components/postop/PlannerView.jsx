import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isSameDay } from "date-fns";

const LEVEL_CLASS = {
  level_1: "bg-sky-100 text-sky-900",
  level_2: "bg-amber-100 text-amber-900",
  level_3: "bg-red-100 text-red-900",
};

const STATUS_DOT = {
  requested: "bg-muted-foreground",
  confirmed: "bg-success",
  arrived: "bg-sky-500",
  cancelled: "bg-destructive",
};

export function PlannerView({ items }) {
  const upcoming = useMemo(() => {
    const now = new Date();
    return items
      .filter((b) => b.proposed_surgery_date && new Date(b.proposed_surgery_date) >= now)
      .sort((a, b) => new Date(a.proposed_surgery_date) - new Date(b.proposed_surgery_date));
  }, [items]);

  const byDay = useMemo(() => {
    const groups = new Map();
    for (const b of upcoming) {
      const key = format(parseISO(b.proposed_surgery_date), "yyyy-MM-dd");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(b);
    }
    return Array.from(groups.entries()).slice(0, 14);
  }, [upcoming]);

  if (byDay.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        No upcoming post-op bookings scheduled.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {byDay.map(([day, bookings]) => (
        <Card key={day} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold">
              {format(parseISO(day + "T00:00:00"), "EEEE dd MMM yyyy")}
            </h3>
            <Badge variant="secondary" className="text-[10px]">{bookings.length}</Badge>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {bookings.map((b) => (
              <div key={b.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {b.patient_initials} · {b.hospital_number ?? "—"}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${STATUS_DOT[b.booking_status] ?? "bg-muted-foreground"}`}
                    title={b.booking_status}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(parseISO(b.proposed_surgery_date), "HH:mm")} · {b.surgical_specialty ?? "—"}
                </div>
                {b.proposed_procedure && (
                  <div className="text-xs">{b.proposed_procedure}</div>
                )}
                <Badge variant="outline" className={`text-[10px] ${LEVEL_CLASS[b.predicted_level] ?? ""}`}>
                  {b.predicted_level?.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}