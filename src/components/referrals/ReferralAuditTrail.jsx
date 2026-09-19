import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { format, formatDistanceToNow } from "date-fns";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const FIELD_LABELS = {
  age: "Age", sex: "Sex", hospital_number: "Hospital number",
  current_ward: "Current ward", current_bed: "Bed",
  past_medical_history: "Past medical history", baseline_function: "Baseline function",
  dnacpr_respect: "DNACPR / ReSPECT",
  consultant_to_consultant_only: "Consultant-to-consultant only",
  referring_specialty: "Referring specialty", reason_for_referral: "Reason for referral",
  referral_received_at: "Referral received", first_seen_at: "First seen by CC",
  decision_at: "Decision", arrived_on_unit_at: "Arrived on unit",
  status: "Status", decline_reason: "Reason for declining",
  discussed_with_consultant: "Discussed with consultant",
  admission_urgency: "Admission urgency", accepting_consultant: "Accepting consultant",
  is_test: "Test / demonstration entry", outcome: "Outcome",
  ceiling_of_care: "Ceiling of care", news2_score: "NEWS2 score",
  reason_category: "Reason category", frailty_score: "Frailty score",
  infection_status: "Infection status", weight_kg: "Weight (kg)",
  allergies: "Allergies", resus_status: "Resuscitation status",
};

const DATE_FIELDS = new Set(["referral_received_at", "first_seen_at", "decision_at", "arrived_on_unit_at"]);

function formatAuditValue(field, value) {
  if (value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (DATE_FIELDS.has(field) && typeof value === "string") {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return format(d, "dd/MM/yyyy HH:mm");
  }
  return String(value);
}

export function ReferralAuditTrail({ referralId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    try {
      const rows = await base44.entities.AuditLog.list("-created_date", 50);
      setHistory(rows.filter((e) => e.entity_id === referralId));
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    if (open && history.length === 0 && !loading) loadMore();
  }, [open]);

  return (
    <Card className="p-5">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button type="button" className="w-full flex items-center justify-between text-left">
            <div>
              <h2 className="font-semibold">Audit trail</h2>
              <p className="text-xs text-muted-foreground">
                When key fields were created or changed, and by whom.
                {open && history.length > 0 && <span> · Showing {history.length}</span>}
              </p>
            </div>
            <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          {history.length === 0 && loading && <p className="text-xs text-muted-foreground">Loading history…</p>}
          {!loading && history.length === 0 && <p className="text-xs text-muted-foreground">No audit entries.</p>}
          <div className="space-y-3">
            {history.map((h) => {
              const when = new Date(h.created_date);
              const actionLabel = h.action === "create" ? "Created" : h.action === "delete" ? "Deleted" : "Updated";
              const actionTone = h.action === "create"
                ? "bg-success/10 text-success border-success/40"
                : h.action === "delete"
                  ? "bg-destructive/10 text-destructive border-destructive/40"
                  : "bg-muted text-foreground border-border";
              return (
                <div key={h.id} className="border rounded-md p-3 text-sm">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("capitalize", actionTone)}>{actionLabel}</Badge>
                      <span className="font-medium">{h.user_name || "System"}</span>
                    </div>
                    <span className="text-xs text-muted-foreground" title={format(when, "dd/MM/yyyy HH:mm")}>
                      {format(when, "dd/MM/yyyy HH:mm")} · {formatDistanceToNow(when, { addSuffix: true })}
                    </span>
                  </div>
                  {h.details && <p className="text-xs text-muted-foreground whitespace-pre-wrap">{h.details}</p>}
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}