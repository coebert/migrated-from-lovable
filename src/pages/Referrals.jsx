import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter } from "lucide-react";

const URGENCY_TONE = {
  emergency: "bg-rose-500/10 text-rose-700 border-rose-500/30",
  urgent: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  routine: "bg-sky-500/10 text-sky-700 border-sky-500/30",
};

const STATUS_TONE = {
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  accepted: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  declined: "bg-rose-500/10 text-rose-700 border-rose-500/30",
};

const STATUSES = ["pending", "accepted", "declined"];
const URGENCIES = ["emergency", "urgent", "routine"];

export default function Referrals() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const load = async () => {
    const items = await base44.entities.Referral.list("-created_date", 200);
    setList(items);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return list
      .filter((r) => (statusFilter === "all" ? true : r.status === statusFilter))
      .filter((r) => (urgencyFilter === "all" ? true : r.urgency === urgencyFilter))
      .filter((r) =>
        query
          ? (r.patient_initials + r.hospital_number + r.referral_reason)
              .toLowerCase()
              .includes(query.toLowerCase())
          : true
      );
  }, [list, query, statusFilter, urgencyFilter]);

  const counts = useMemo(() => {
    const c = { pending: 0, accepted: 0, declined: 0 };
    list.forEach((r) => (c[r.status] = (c[r.status] ?? 0) + 1));
    return c;
  }, [list]);

  const act = async (id, status) => {
    setActing(id);
    await base44.entities.Referral.update(id, { status });
    setList((cur) => cur.map((r) => (r.id === id ? { ...r, status } : r)));
    setActing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-semibold text-lg">Referrals</h2>
          <p className="text-xs text-muted-foreground">
            {list.length} total · {counts.pending} pending · {counts.accepted} accepted · {counts.declined} declined
          </p>
        </div>
        <Button className="self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-1" /> New referral
        </Button>
      </div>

      <Card className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by initials, hospital number, reason…"
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-7 px-2.5 rounded-md text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              {s}
            </button>
          ))}
          <span className="ml-2 text-xs text-muted-foreground">Urgency:</span>
          {["all", ...URGENCIES].map((u) => (
            <button
              key={u}
              onClick={() => setUrgencyFilter(u)}
              className={`h-7 px-2.5 rounded-md text-xs font-medium border transition-colors ${
                urgencyFilter === u
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No referrals match the current filters.
          </Card>
        )}
        {filtered.map((r) => (
          <Card key={r.id} className="p-4 hover:bg-accent/30 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Badge variant="outline" className={`font-mono text-[10px] ${URGENCY_TONE[r.urgency]}`}>
                  {r.urgency}
                </Badge>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {r.patient_initials}{" "}
                    <span className="font-mono text-xs text-muted-foreground font-normal">
                      · {r.hospital_number} · {r.age}y
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{r.referral_reason}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    From {r.source_ward} · {r.referring_team}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className={`text-[10px] ${STATUS_TONE[r.status]}`}>
                  {r.status}
                </Badge>
                {r.status === "pending" && (
                  <>
                    <Button size="sm" variant="outline" disabled={acting === r.id} onClick={() => act(r.id, "declined")}>
                      Decline
                    </Button>
                    <Button size="sm" disabled={acting === r.id} onClick={() => act(r.id, "accepted")}>
                      Accept
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}