import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Inbox as InboxIcon, Baby, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { QuickFilterChips } from "@/components/referrals/QuickFilterChips";
import { ReferralsFilterToolbar } from "@/components/referrals/ReferralsFilterToolbar";
import { ReferralTimer } from "@/components/referrals/ReferralTimer";
import {
  STATUS_STYLES,
  ROW_BG_STYLES,
  ADMISSION_URGENCY_BADGE,
  ADMISSION_URGENCY_LABELS,
  ADMISSION_URGENCY_PIP,
  computeTopWards,
  filterReferrals,
  sortByTimer,
  applyQuickFilter,
  matchesQuickFilter,
} from "@/lib/referral-utils";

const SKELETON_ROWS = 5;

export default function Referrals() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [hospSearch, setHospSearch] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [locFilter, setLocFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [pediatricFilter, setPediatricFilter] = useState("all");
  const [quick, setQuick] = useState("all");
  const [timerSort, setTimerSort] = useState("none");
  const [sortTick, setSortTick] = useState(0);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    if (timerSort === "none") return;
    const id = setInterval(() => setSortTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, [timerSort]);

  const load = async () => {
    setLoading(true);
    const items = await base44.entities.Referral.list("-created_date", 500);
    setList(items.filter((r) => !r.deleted_at));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const topWards = useMemo(() => computeTopWards(list), [list]);

  const baseFiltered = useMemo(
    () =>
      filterReferrals(list, {
        hospSearch, q, statusFilter, urgencyFilter, locFilter, dateFilter, pediatricFilter,
      }),
    [list, hospSearch, q, statusFilter, urgencyFilter, locFilter, dateFilter, pediatricFilter]
  );

  const quickCounts = useMemo(() => ({
    all: baseFiltered.length,
    awaiting_review: baseFiltered.filter((r) => matchesQuickFilter(r, "awaiting_review")).length,
    awaiting_bed: baseFiltered.filter((r) => matchesQuickFilter(r, "awaiting_bed")).length,
    accepted_not_arrived: baseFiltered.filter((r) => matchesQuickFilter(r, "accepted_not_arrived")).length,
    discussed_pending: baseFiltered.filter((r) => matchesQuickFilter(r, "discussed_pending")).length,
  }), [baseFiltered]);

  const filtered = useMemo(() => applyQuickFilter(baseFiltered, quick), [baseFiltered, quick]);
  const displayed = useMemo(() => sortByTimer(filtered, timerSort, Date.now()), [filtered, timerSort, sortTick]);

  const counts = useMemo(() => {
    const c = { pending: 0, accepted: 0, admitted: 0, declined: 0 };
    list.forEach((r) => { if (c[r.status] !== undefined) c[r.status]++; });
    return c;
  }, [list]);

  const act = async (id, status) => {
    setActing(id);
    const now = new Date().toISOString();
    const patch = { status };
    if (status === "accepted" || status === "declined") patch.decision_at = now;
    if (status === "admitted") patch.arrived_on_unit_at = now;
    await base44.entities.Referral.update(id, patch);
    setList((cur) => cur.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setActing(null);
  };

  const toggleTimerSort = () => {
    setTimerSort((cur) => (cur === "none" ? "desc" : cur === "desc" ? "asc" : "none"));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
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

      <QuickFilterChips value={quick} onChange={setQuick} counts={quickCounts} />

      <ReferralsFilterToolbar
        hospSearch={hospSearch}
        onHospSearchChange={setHospSearch}
        q={q}
        onQChange={setQ}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        urgencyFilter={urgencyFilter}
        onUrgencyFilterChange={setUrgencyFilter}
        locFilter={locFilter}
        onLocFilterChange={setLocFilter}
        topWards={topWards}
        pediatricFilter={pediatricFilter}
        onPediatricFilterChange={setPediatricFilter}
      />

      {/* Desktop table */}
      <div className="hidden md:block border rounded-md bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2">Received</th>
                <th className="text-left px-3 py-2">Hosp. no</th>
                <th className="text-left px-3 py-2">Age/Sex</th>
                <th className="text-left px-3 py-2">Location</th>
                <th className="text-left px-3 py-2">Specialty</th>
                <th className="text-left px-3 py-2">Reason</th>
                <th className="text-left px-3 py-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 uppercase hover:text-foreground"
                    onClick={toggleTimerSort}
                    aria-label="Sort by timer"
                  >
                    Timer
                    <span className="text-[10px]" aria-hidden="true">
                      {timerSort === "desc" ? "↓" : timerSort === "asc" ? "↑" : "↕"}
                    </span>
                  </button>
                </th>
                <th className="text-left px-3 py-2">Urgency</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Taken by</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-t">
                  {Array.from({ length: 11 }).map((__, j) => (
                    <td key={j} className="px-3 py-3">
                      <Skeleton className="h-3 w-full max-w-[100px]" />
                    </td>
                  ))}
                </tr>
              ))}
              {!loading && displayed.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-8">
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                      <InboxIcon className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">No referrals match the current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
              {displayed.map((r) => (
                <tr
                  key={r.id}
                  className={`border-t transition-colors duration-150 hover:bg-muted/40 ${ROW_BG_STYLES[r.status] ?? ""}`}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {(() => {
                      const dt = r.referral_received_at || r.created_at || r.created_date;
                      return dt ? format(new Date(dt), "dd/MM/yyyy HH:mm") : "—";
                    })()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs">{r.hospital_number ?? "—"}</span>
                      {r.is_test && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          Test
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      {r.age !== null && r.age !== undefined && r.age <= 16 && (
                        <Baby className="w-4 h-4 text-primary" aria-label="Pediatric" />
                      )}
                      {r.age === null || r.age === undefined && (
                        <span className="inline-flex items-center gap-1 rounded border border-warning/50 bg-warning/10 text-warning-foreground px-1.5 py-0 text-[10px] font-medium">
                          <HelpCircle className="w-3 h-3" aria-hidden="true" />
                          Age unknown
                        </span>
                      )}
                      <span>{r.age ?? "?"} / {r.sex ? r.sex.charAt(0).toUpperCase() : "?"}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {r.current_ward || r.source_ward || "—"}
                    {(r.current_bed) ? ` · ${r.current_bed}` : ""}
                  </td>
                  <td className="px-3 py-2">{r.referring_specialty || r.referring_team || "—"}</td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="truncate">{r.reason_for_referral || r.referral_reason || "—"}</div>
                  </td>
                  <td className="px-3 py-2"><ReferralTimer r={r} /></td>
                  <td className="px-3 py-2">
                    {r.admission_urgency ? (
                      <Badge variant="outline" className={`whitespace-nowrap ${ADMISSION_URGENCY_BADGE[r.admission_urgency] ?? ""}`} aria-label={`Urgency: ${ADMISSION_URGENCY_LABELS[r.admission_urgency]}`}>
                        <span aria-hidden="true" className="font-mono mr-1 tracking-tighter">{ADMISSION_URGENCY_PIP[r.admission_urgency]}</span>
                        {ADMISSION_URGENCY_LABELS[r.admission_urgency]}
                      </Badge>
                    ) : r.urgency ? (
                      <Badge variant="outline" className="whitespace-nowrap capitalize">
                        {r.urgency}
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
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {r.taken_by || r.discussed_with_consultant || "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.status === "pending" && (
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="outline" disabled={acting === r.id} onClick={() => act(r.id, "declined")}>
                          Decline
                        </Button>
                        <Button size="sm" disabled={acting === r.id} onClick={() => act(r.id, "accepted")}>
                          Accept
                        </Button>
                      </div>
                    )}
                    {r.status === "accepted" && (
                      <Button size="sm" variant="outline" disabled={acting === r.id} onClick={() => act(r.id, "admitted")}>
                        Mark admitted
                      </Button>
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
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <Card key={`sk-${i}`} className="p-3 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </Card>
        ))}
        {!loading && displayed.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            <InboxIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No referrals match the current filters.
          </Card>
        )}
        {displayed.map((r) => (
          <Card key={r.id} className={`p-3 transition-colors ${ROW_BG_STYLES[r.status] ?? ""}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{r.patient_initials ?? "—"}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    · {r.hospital_number ?? "—"} · {r.age ?? "?"}y
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {r.reason_for_referral || r.referral_reason || "—"}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  From {r.current_ward || r.source_ward || "—"} · {r.referring_specialty || r.referring_team || "—"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {r.admission_urgency ? (
                  <Badge variant="outline" className={`text-[10px] whitespace-nowrap ${ADMISSION_URGENCY_BADGE[r.admission_urgency] ?? ""}`}>
                    <span className="font-mono mr-0.5">{ADMISSION_URGENCY_PIP[r.admission_urgency]}</span>
                    {ADMISSION_URGENCY_LABELS[r.admission_urgency]}
                  </Badge>
                ) : r.urgency ? (
                  <Badge variant="outline" className="text-[10px] capitalize">{r.urgency}</Badge>
                ) : null}
                <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_STYLES[r.status] ?? ""}`}>
                  {r.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <ReferralTimer r={r} />
              {r.status === "pending" && (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" disabled={acting === r.id} onClick={() => act(r.id, "declined")}>
                    Decline
                  </Button>
                  <Button size="sm" disabled={acting === r.id} onClick={() => act(r.id, "accepted")}>
                    Accept
                  </Button>
                </div>
              )}
              {r.status === "accepted" && (
                <Button size="sm" variant="outline" disabled={acting === r.id} onClick={() => act(r.id, "admitted")}>
                  Mark admitted
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}