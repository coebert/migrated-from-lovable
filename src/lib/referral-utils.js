// Shared referral list utilities — mirrors the source app's referrals-list-utils.ts

export const STATUS_STYLES = {
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  accepted: "bg-success/15 text-success border-success/30",
  admitted: "bg-success/15 text-success border-success/30",
  declined: "bg-destructive/10 text-destructive border-destructive/30",
};

export const ROW_BG_STYLES = {
  pending: "bg-warning/[0.08]",
  accepted: "bg-success/[0.08]",
  admitted: "bg-success/[0.08]",
  declined: "bg-destructive/[0.06]",
};

export const ADMISSION_URGENCY_OPTIONS = [
  { value: "within_15_min", label: "Within 15 minutes", short: "15m" },
  { value: "within_30_min", label: "Within 30 minutes", short: "30m" },
  { value: "within_1_hour", label: "Within 1 hour", short: "1h" },
  { value: "within_1_2_hours", label: "Within 1–2 hours", short: "1–2h" },
  { value: "not_admitting", label: "N/A (decision not to admit)", short: "N/A" },
];

export const ADMISSION_URGENCY_PIP = {
  within_15_min: "▲▲▲",
  within_30_min: "▲▲",
  within_1_hour: "▲",
  within_1_2_hours: "△",
  not_admitting: "–",
};

export const ADMISSION_URGENCY_LABELS = Object.fromEntries(
  ADMISSION_URGENCY_OPTIONS.map((o) => [o.value, o.label])
);

export const ADMISSION_URGENCY_BADGE = {
  within_15_min: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200",
  within_30_min: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-200",
  within_1_hour: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200",
  within_1_2_hours: "bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-200",
  not_admitting: "bg-muted text-muted-foreground border-muted-foreground/20",
};

export const QUICK_FILTER_LABELS = {
  all: "All",
  awaiting_review: "Awaiting review",
  awaiting_bed: "Awaiting bed",
  accepted_not_arrived: "Accepted, not arrived",
  discussed_pending: "Discussed, no outcome",
};

export function matchesQuickFilter(r, key) {
  switch (key) {
    case "all":
      return true;
    case "awaiting_review":
      return r.status === "pending" && !r.outcome;
    case "awaiting_bed":
      return r.outcome === "admit_for_admission" && r.status !== "admitted";
    case "accepted_not_arrived":
      return r.status === "accepted" && !r.arrived_on_unit_at;
    case "discussed_pending":
      return !!(r.discussed_with_consultant && r.discussed_with_consultant.trim()) && !r.outcome;
    default:
      return true;
  }
}

export function applyQuickFilter(rows, key) {
  if (key === "all") return rows;
  return rows.filter((r) => matchesQuickFilter(r, key));
}

export function computeTopWards(rows, limit = 8) {
  const counts = new Map();
  for (const r of rows) {
    const ward = r.current_ward || r.source_ward;
    if (!ward) continue;
    counts.set(ward, (counts.get(ward) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([ward]) => ward);
}

export function formatElapsed(ms) {
  if (ms < 0) ms = 0;
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function getTimerElapsedMs(r, now) {
  const receivedAt = r.referral_received_at || r.created_at || r.created_date;
  if (!receivedAt) return null;
  if (r.status === "pending") return now - new Date(receivedAt).getTime();
  if (r.status === "accepted" || r.status === "admitted") {
    const startSrc = r.decision_at || r.updated_date || receivedAt;
    if (!startSrc) return null;
    const end = r.arrived_on_unit_at ? new Date(r.arrived_on_unit_at).getTime() : now;
    return end - new Date(startSrc).getTime();
  }
  return null;
}

export function getTimerInfo(r, now) {
  const receivedAt = r.referral_received_at || r.created_at || r.created_date;
  if (!receivedAt) return null;
  if (r.status === "pending") {
    const start = new Date(receivedAt).getTime();
    return { label: "Waiting", value: formatElapsed(now - start), tone: "text-warning-foreground" };
  }
  if (r.status === "accepted" || r.status === "admitted") {
    const startSrc = r.decision_at || r.updated_date || receivedAt;
    if (!startSrc) return null;
    const start = new Date(startSrc).getTime();
    const end = r.arrived_on_unit_at ? new Date(r.arrived_on_unit_at).getTime() : now;
    return {
      label: r.arrived_on_unit_at ? "Time to admission" : "Time waiting for admission",
      value: formatElapsed(end - start),
      tone: "text-success",
    };
  }
  return null;
}

export function sortByTimer(rows, direction, now) {
  if (direction === "none") return rows;
  const dir = direction === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const ea = getTimerElapsedMs(a, now);
    const eb = getTimerElapsedMs(b, now);
    if (ea === null && eb === null) return 0;
    if (ea === null) return 1;
    if (eb === null) return -1;
    return (ea - eb) * dir;
  });
}

export function filterReferrals(rows, f) {
  const needle = (f.q || "").trim().toLowerCase();
  const hospNeedle = (f.hospSearch || "").trim().toLowerCase();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  let fromTs = null;
  let toTs = null;
  if (f.dateFilter === "today") fromTs = startOfToday;
  else if (f.dateFilter === "yesterday") { fromTs = startOfToday - 86400000; toTs = startOfToday; }
  else if (f.dateFilter === "7d") fromTs = now.getTime() - 7 * 86400000;
  else if (f.dateFilter === "30d") fromTs = now.getTime() - 30 * 86400000;

  return rows.filter((r) => {
    if (f.statusFilter !== "all" && r.status !== f.statusFilter) return false;
    if (f.urgencyFilter !== "all" && r.admission_urgency !== f.urgencyFilter) return false;
    if (f.locFilter !== "all") {
      const ward = r.current_ward || r.source_ward;
      if (ward !== f.locFilter) return false;
    }
    if (f.pediatricFilter === "pediatric") {
      if (r.age === null || r.age === undefined || r.age > 16) return false;
    }
    if (fromTs !== null) {
      const receivedAt = r.referral_received_at || r.created_at || r.created_date;
      if (!receivedAt) return false;
      const t = new Date(receivedAt).getTime();
      if (t < fromTs) return false;
      if (toTs !== null && t >= toTs) return false;
    }
    if (hospNeedle) {
      const hn = (r.hospital_number || "").toLowerCase();
      if (!hn.includes(hospNeedle)) return false;
    }
    if (!needle) return true;
    return [r.hospital_number, r.current_ward, r.current_bed, r.referring_specialty, r.referring_team, r.reason_for_referral, r.referral_reason, r.patient_initials]
      .filter(Boolean)
      .some((v) => v.toString().toLowerCase().includes(needle));
  });
}