import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { QuickFilterChips } from "@/components/referrals/QuickFilterChips";
import { ReferralsFilterToolbar } from "@/components/referrals/ReferralsFilterToolbar";
import { ReferralsRows } from "@/components/referrals/ReferralsRows";
import { ReferralsDeletedPanel } from "@/components/referrals/ReferralsDeletedPanel";
import {
  computeTopWards,
  filterReferrals,
  sortByTimer,
  applyQuickFilter,
  matchesQuickFilter,
} from "@/lib/referral-utils";

export default function Referrals() {
  const [list, setList] = useState([]);
  const [deletedList, setDeletedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletedLoading, setDeletedLoading] = useState(false);

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
  const [showDeleted, setShowDeleted] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => {
    if (timerSort === "none") return;
    const id = setInterval(() => setSortTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, [timerSort]);

  const load = async () => {
    setLoading(true);
    const items = await base44.entities.Referral.list("-created_date", 500);
    setList(items.filter((r) => !r.deleted_at));
    setDeletedList(items.filter((r) => !!r.deleted_at));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadDeleted = async () => {
    setDeletedLoading(true);
    const items = await base44.entities.Referral.list("-created_date", 500);
    setDeletedList(items.filter((r) => !!r.deleted_at));
    setDeletedLoading(false);
  };

  useEffect(() => {
    if (showDeleted && deletedList.length === 0 && !deletedLoading) {
      loadDeleted();
    }
  }, [showDeleted]);

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

  const toggleTimerSort = () => {
    setTimerSort((cur) => (cur === "none" ? "desc" : cur === "desc" ? "asc" : "none"));
  };

  const handleRestore = async (id) => {
    setRestoringId(id);
    await base44.entities.Referral.update(id, { deleted_at: null });
    setList((cur) => [...cur, ...deletedList.filter((r) => r.id === id).map((r) => ({ ...r, deleted_at: null }))]);
    setDeletedList((cur) => cur.filter((r) => r.id !== id));
    setRestoringId(null);
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
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <Switch
              checked={showDeleted}
              onCheckedChange={setShowDeleted}
              aria-label="Show deleted referrals"
            />
            Show deleted
          </label>
          <Button>
            <Plus className="w-4 h-4 mr-1" /> New referral
          </Button>
        </div>
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

      {showDeleted && (
        <ReferralsDeletedPanel
          rows={deletedList}
          loading={deletedLoading}
          restoringId={restoringId}
          onRestore={handleRestore}
        />
      )}

      <ReferralsRows
        rows={displayed}
        loading={loading}
        timerSort={timerSort}
        onToggleTimerSort={toggleTimerSort}
      />
    </div>
  );
}