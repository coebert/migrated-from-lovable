import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Inbox as InboxIcon } from "lucide-react";
import { format } from "date-fns";

const STATUS_STYLES = {
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  accepted: "bg-success/15 text-success border-success/30",
  declined: "bg-destructive/10 text-destructive border-destructive/30",
};

const ROW_BG = {
  pending: "bg-warning/[0.08]",
  accepted: "bg-success/[0.08]",
  declined: "bg-destructive/[0.06]",
};

const URGENCY_BADGE = {
  emergency: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200",
  urgent: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-200",
  routine: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200",
};

const URGENCY_PIP = {
  emergency: "▲▲▲",
  urgent: "▲▲",
  routine: "▲",
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Referrals</h1>
          <p className="text-sm text-muted-foreground">
            {list.length} total · {counts.pending} pending · {counts.accepted} accepted · {counts.declined} declined
          </p>
        </div>
        <Button>
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
              className={`h-7 px-2.5 rounded-md text-xs font-medium border transition-colors capitalize ${
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
              className={`h-7 px-2.5 rounded-md text-xs font-medium border transition-colors capitalize ${
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

      {/* Desktop table */}
      <div className="hidden md:block border rounded-md bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2">Received</th>
                <th className="text-left px-3 py-2">Hosp. no</th>
                <th className="text-left px-3 py-2">Age</th>
                <th className="text-left px-3 py-2">Location</th>
                <th className="text-left px-3 py-2">Reason</th>
                <th className="text-left px-3 py-2">Urgency</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8">
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                      <InboxIcon className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">No referrals match the current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className={`border-t transition-colors duration-150 hover:bg-muted/40 ${ROW_BG[r.status] ?? ""}`}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {r.created_at ? format(new Date(r.created_at), "dd/MM/yyyy HH:mm") : "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{r.hospital_number ?? "—"}</td>
                  <td className="px-3 py-2">{r.age ?? "?"}</td>
                  <td className="px-3 py-2">{r.source_ward ?? "—"}</td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="truncate">{r.referral_reason ?? "—"}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{r.referring_team}</div>
                  </td>
                  <td className="px-3 py-2">
                    {r.urgency ? (
                      <Badge variant="outline" className={`whitespace-nowrap ${URGENCY_BADGE[r.urgency] ?? ""}`}>
                        <span className="font-mono mr-1 tracking-tighter">{URGENCY_PIP[r.urgency]}</span>
                        <span className="capitalize">{r.urgency}</span>
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={`capitalize ${STATUS_STYLES[r.status] ?? ""}`}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    {r.status === "pending" && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={acting === r.id}
                          onClick={() => act(r.id, "declined")}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          disabled={acting === r.id}
                          onClick={() => act(r.id, "accepted")}
                        >
                          Accept
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No referrals match the current filters.
          </Card>
        )}
        {filtered.map((r) => (
          <Card
            key={r.id}
            className={`p-3 hover:bg-muted/40 transition-colors ${ROW_BG[r.status] ?? ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {r.patient_initials ?? "—"}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    · {r.hospital_number ?? "—"} · {r.age ?? "?"}y
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {r.referral_reason ?? "—"}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  From {r.source_ward ?? "—"} · {r.referring_team ?? "—"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {r.urgency && (
                  <Badge variant="outline" className={`text-[10px] ${URGENCY_BADGE[r.urgency] ?? ""}`}>
                    <span className="font-mono mr-0.5">{URGENCY_PIP[r.urgency]}</span>
                    <span className="capitalize">{r.urgency}</span>
                  </Badge>
                )}
                <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_STYLES[r.status] ?? ""}`}>
                  {r.status}
                </Badge>
              </div>
            </div>
            {r.status === "pending" && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={acting === r.id}
                  onClick={() => act(r.id, "declined")}
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  disabled={acting === r.id}
                  onClick={() => act(r.id, "accepted")}
                >
                  Accept
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}