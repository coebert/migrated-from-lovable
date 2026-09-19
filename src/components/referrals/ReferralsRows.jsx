import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Baby, HelpCircle, Inbox } from "lucide-react";
import {
  ADMISSION_URGENCY_BADGE,
  ADMISSION_URGENCY_LABELS,
  ADMISSION_URGENCY_PIP,
  STATUS_STYLES,
  ROW_BG_STYLES,
} from "@/lib/referral-utils";
import { ReferralTimer } from "@/components/referrals/ReferralTimer";

const SKELETON_ROWS = 5;

export function ReferralsRows({ rows, loading, timerSort, onToggleTimerSort }) {
  const navigate = useNavigate();

  const goToDetail = (id) => navigate(`/referrals/${id}`);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block border rounded-md bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
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
                    onClick={onToggleTimerSort}
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
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-t">
                  {Array.from({ length: 10 }).map((__, j) => (
                    <td key={j} className="px-3 py-3">
                      <Skeleton className="h-3 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-4">
                    <EmptyState
                      icon={Inbox}
                      title="No referrals match"
                      description="Try clearing filters or adjusting the date range to widen the search."
                      compact
                    />
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={`border-t cursor-pointer transition-colors duration-150 hover:bg-muted/40 ${ROW_BG_STYLES[r.status] ?? ""}`}
                  role="link"
                  tabIndex={0}
                  onClick={() => goToDetail(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToDetail(r.id);
                    }
                  }}
                >
                  <td className="px-3 py-2 whitespace-nowrap" title={r.referral_received_at || r.created_at || r.created_date || ""}>
                    {(() => {
                      const dt = r.referral_received_at || r.created_at || r.created_date;
                      return dt ? format(new Date(dt), "dd/MM/yyyy HH:mm") : "—";
                    })()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{r.hospital_number ?? "—"}</span>
                      {r.is_test && (
                        <Badge
                          variant="outline"
                          className="border-warning/50 bg-warning/10 text-warning-foreground text-[10px] px-1.5 py-0"
                          title="Test/demonstration entry — excluded from analytics"
                        >
                          Test
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      {r.age !== null && r.age !== undefined && r.age <= 16 && (
                        <span title="Pediatric patient (≤16)">
                          <Baby className="w-4 h-4 text-primary" aria-label="Pediatric" />
                        </span>
                      )}
                      {r.age === null && (
                        <span
                          title="Age not recorded — cannot be classified as pediatric"
                          className="inline-flex items-center gap-1 rounded border border-warning/50 bg-warning/10 text-warning-foreground px-1.5 py-0 text-[10px] font-medium"
                        >
                          <HelpCircle className="w-3 h-3" aria-hidden="true" />
                          Age unknown
                        </span>
                      )}
                      <span>{r.age ?? "?"} / {r.sex ?? "?"}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">{r.current_ward ?? r.source_ward ?? "—"} {r.current_bed ? `· ${r.current_bed}` : ""}</td>
                  <td className="px-3 py-2">{r.referring_specialty ?? r.referring_team ?? "—"}</td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="truncate">{r.reason_for_referral ?? r.referral_reason ?? "—"}</div>
                  </td>
                  <td className="px-3 py-2"><ReferralTimer r={r} /></td>
                  <td className="px-3 py-2">
                    {r.admission_urgency ? (
                      <Badge variant="outline" className={`whitespace-nowrap ${ADMISSION_URGENCY_BADGE[r.admission_urgency]}`} aria-label={`Urgency: ${ADMISSION_URGENCY_LABELS[r.admission_urgency]}`}>
                        <span aria-hidden="true" className="font-mono mr-1 tracking-tighter">{ADMISSION_URGENCY_PIP[r.admission_urgency]}</span>
                        {ADMISSION_URGENCY_LABELS[r.admission_urgency]}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={`capitalize ${STATUS_STYLES[r.status] ?? ""}`}>{r.status}</Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{r.taken_by ?? r.discussed_with_consultant ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-2">
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={`sk-${i}`} className="border rounded-lg p-3 space-y-2 bg-card">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
        {!loading && rows.length === 0 && (
          <div className="border rounded-md bg-card">
            <EmptyState
              icon={Inbox}
              title="No referrals match"
              description="Try clearing filters or adjusting the date range to widen the search."
              compact
            />
          </div>
        )}
        {rows.map((r) => (
          <div
            key={r.id}
            className={`border rounded-lg bg-card p-3 cursor-pointer transition-colors hover:bg-muted/40 ${ROW_BG_STYLES[r.status] ?? ""}`}
            role="link"
            tabIndex={0}
            onClick={() => goToDetail(r.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goToDetail(r.id);
              }
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {r.age !== null && r.age !== undefined && r.age <= 16 && (
                    <Baby className="w-4 h-4 text-primary" aria-label="Pediatric" />
                  )}
                  <span className="text-sm font-medium">{r.age ?? "?"} / {r.sex ?? "?"}</span>
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {r.reason_for_referral ?? r.referral_reason ?? "—"}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {r.current_ward ?? r.source_ward ?? "—"} · {r.referring_specialty ?? r.referring_team ?? "—"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {r.admission_urgency ? (
                  <Badge variant="outline" className={`text-[10px] whitespace-nowrap ${ADMISSION_URGENCY_BADGE[r.admission_urgency]}`}>
                    <span className="font-mono mr-0.5">{ADMISSION_URGENCY_PIP[r.admission_urgency]}</span>
                    {ADMISSION_URGENCY_LABELS[r.admission_urgency]}
                  </Badge>
                ) : null}
                <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_STYLES[r.status] ?? ""}`}>{r.status}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <ReferralTimer r={r} />
              <span className="font-mono text-xs text-muted-foreground">{r.hospital_number ?? "—"}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}