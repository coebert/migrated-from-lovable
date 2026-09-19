import { useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import BedCard from "@/components/BedCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Bed, AlertTriangle, TrendingUp, ScrollText } from "lucide-react";
import { BEDS, OCCUPANCIES, REFERRALS, dayOfStay } from "@/lib/sampleData";

const LEVEL_LABEL = {
  0: "Level 0 — ward-level",
  1: "Level 1 — at risk",
  2: "Level 2 — HDU",
  3: "Level 3 — ICU",
};

function CapacityStrip({ total, occupied }) {
  const pct = total ? Math.round((occupied / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground">Capacity</span>
        <span className="font-mono text-sm font-semibold">
          {occupied}<span className="text-muted-foreground">/{total}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground font-mono">{pct}% occupied</div>
    </div>
  );
}

function MetricRow({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={`w-4 h-4 ${tone ?? ""}`} />
        {label}
      </div>
      <span className="font-mono text-sm font-semibold">{value}</span>
    </div>
  );
}

export default function BedBoard() {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState(null);

  const liveByBed = useMemo(() => {
    const m = new Map();
    for (const o of OCCUPANCIES) m.set(o.bed_id, o);
    return m;
  }, []);

  const total = BEDS.length;
  const occupied = OCCUPANCIES.length;
  const level3 = OCCUPANCIES.filter((o) => o.level === 3).length;
  const isolated = OCCUPANCIES.filter((o) => o.isolation !== "none").length;
  const vented = OCCUPANCIES.filter((o) => o.ventilated).length;
  const pending = REFERRALS.filter((r) => r.status === "pending").length;

  const logs = [
    { t: "2m ago", text: "Bed CC-03 — RRT circuit changed" },
    { t: "18m ago", text: "Referral r1 accepted by Dr Patel" },
    { t: "41m ago", text: "Bed CC-10 — vasopressors weaned" },
    { t: "1h ago", text: "Bed CC-06 — discharged to ward" },
    { t: "2h ago", text: "Bed CC-14 — admitted from theatre" },
  ];

  const grid = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-semibold text-base">Radnor Critical Care Unit</h2>
          <p className="text-xs text-muted-foreground">15 beds · 9 occupied · 6 available</p>
        </div>
        <Badge variant="outline" className="font-mono text-xs">{occupied}/{total}</Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {[...BEDS]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((b) => (
            <BedCard
              key={b.id}
              bed={b}
              occupancy={liveByBed.get(b.id)}
              onClick={(o) => setSelected(o)}
            />
          ))}
      </div>
    </div>
  );

  const sidePanel = (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h3 className="font-heading font-semibold text-sm">Capacity</h3>
        <CapacityStrip total={total} occupied={occupied} />
        <div className="pt-1">
          <MetricRow icon={Bed} label="Level 3 (ICU)" value={level3} tone="text-rose-600" />
          <MetricRow icon={Activity} label="Ventilated" value={vented} tone="text-sky-600" />
          <MetricRow icon={AlertTriangle} label="Isolated" value={isolated} tone="text-amber-600" />
          <MetricRow icon={TrendingUp} label="Pending referrals" value={pending} tone="text-primary" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <ScrollText className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-sm">Live activity</h3>
        </div>
        <ul className="space-y-2.5">
          {logs.map((l, i) => (
            <li key={i} className="flex gap-2 text-xs">
              <span className="font-mono text-muted-foreground shrink-0">{l.t}</span>
              <span className="text-foreground">{l.text}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-4">
        {grid}
        {sidePanel}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[68fr_32fr] gap-6">
      <div>{grid}</div>
      <div>{sidePanel}</div>
    </div>
  );
}