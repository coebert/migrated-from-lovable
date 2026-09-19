import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useIsMobile } from "@/hooks/use-mobile";
import BedCard from "@/components/BedCard";
import { Card } from "@/components/ui/card";
import { Activity, Bed, AlertTriangle, TrendingUp, ScrollText } from "lucide-react";
import { dayOfStay } from "@/lib/sampleData";

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
  const [beds, setBeds] = useState([]);
  const [occupancies, setOccupancies] = useState([]);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [b, o, r] = await Promise.all([
      base44.entities.Bed.list(),
      base44.entities.Occupancy.list(),
      base44.entities.Referral.filter({ status: "pending" }),
    ]);
    setBeds(b);
    setOccupancies(o);
    setReferralCount(r.length);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const liveByBed = useMemo(() => {
    const m = new Map();
    for (const o of occupancies) m.set(o.bed_id, o);
    return m;
  }, [occupancies]);

  const total = beds.length;
  const occupied = occupancies.length;
  const level3 = occupancies.filter((o) => o.level === 3).length;
  const isolated = occupancies.filter((o) => o.isolation !== "none").length;
  const vented = occupancies.filter((o) => o.ventilated).length;

  const logs = [
    { t: "2m ago", text: "Bed CC-03 — RRT circuit changed" },
    { t: "18m ago", text: "Referral accepted by Dr Patel" },
    { t: "41m ago", text: "Bed CC-10 — vasopressors weaned" },
    { t: "1h ago", text: "Bed CC-06 — discharged to ward" },
    { t: "2h ago", text: "Bed CC-14 — admitted from theatre" },
  ];

  const grid = (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">
          Radnor Critical Care Unit
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {[...beds]
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((b) => (
              <BedCard
                key={b.id}
                bed={b}
                occupancy={liveByBed.get(b.id)}
                onClick={() => {}}
              />
            ))}
          {beds.length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground">
              No beds configured. Admins can add beds in the register.
            </div>
          )}
        </div>
      </section>
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
          <MetricRow icon={TrendingUp} label="Pending referrals" value={referralCount} tone="text-primary" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        {grid}
        {sidePanel}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[68fr_32fr] gap-6">
      <div>{grid}</div>
      <div>{sidePanel}</div>
    </div>
  );
}