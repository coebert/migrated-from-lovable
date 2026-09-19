import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, CalendarClock } from "lucide-react";
import { POSTOP_BOOKINGS } from "@/lib/sampleData";

const STATUS_TONE = {
  booked: "bg-sky-500/10 text-sky-700 border-sky-500/30",
  confirmed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/30",
};

export default function PostOp() {
  const [items, setItems] = useState(POSTOP_BOOKINGS);

  const confirm = (id) =>
    setItems((cur) => cur.map((p) => (p.id === id ? { ...p, status: "confirmed" } : p)));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Post-op bookings</h1>
          <p className="text-sm text-muted-foreground">{items.length} upcoming · reserve HDU beds post-theatre</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-1" /> New booking
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((p) => (
          <Card key={p.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarClock className="w-4 h-4 text-primary" />
                {p.theatre}
              </div>
              <Badge variant="outline" className={`text-[10px] ${STATUS_TONE[p.status]}`}>
                {p.status}
              </Badge>
            </div>
            <div className="text-sm font-medium">{p.patient}</div>
            <div className="text-xs text-muted-foreground">{p.procedure}</div>
            <div className="text-[11px] text-muted-foreground font-mono">
              {new Date(p.date).toLocaleString(undefined, {
                weekday: "short",
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            {p.status !== "confirmed" && (
              <Button size="sm" variant="outline" className="w-full mt-1" onClick={() => confirm(p.id)}>
                Confirm booking
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}