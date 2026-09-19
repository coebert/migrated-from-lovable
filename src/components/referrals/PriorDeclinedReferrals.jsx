import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

export function PriorDeclinedReferrals({ hospitalNumber, excludeId }) {
  const [priors, setPriors] = useState([]);

  const hn = hospitalNumber?.trim() ?? "";
  const enabled = hn.length > 0;

  useEffect(() => {
    if (!enabled) return;
    (async () => {
      const rows = await base44.entities.Referral.list("-created_date", 500);
      setPriors(rows.filter((r) =>
        r.hospital_number === hn && r.id !== excludeId && r.status === "declined" && !r.deleted_at
      ));
    })();
  }, [hn, excludeId]);

  if (!enabled || priors.length === 0) return null;

  return (
    <Card className="p-5 space-y-3 border-destructive/40">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-destructive" />
        <h2 className="font-semibold text-destructive">
          Previously declined critical care referral{priors.length > 1 ? "s" : ""} for this patient
        </h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Same hospital number ({hn}). Full decline reasons shown below.
      </p>
      <div className="space-y-3">
        {priors.map((p) => {
          const when = p.decision_at ?? p.referral_received_at;
          return (
            <div key={p.id} className="border rounded-md p-3 bg-destructive/5">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="text-sm font-medium">
                  Declined {when ? format(new Date(when), "dd/MM/yyyy HH:mm") : "date unknown"}
                  {p.referring_specialty ? ` · ${p.referring_specialty}` : ""}
                </div>
                <Link to={`/referrals/${p.id}`}
                  className="text-xs underline text-muted-foreground hover:text-foreground">
                  Open full referral
                </Link>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                Reason for declining
              </div>
              {p.decline_reason ? (
                <p className="text-sm whitespace-pre-wrap">{p.decline_reason}</p>
              ) : (
                <p className="text-sm italic text-muted-foreground">No reason recorded.</p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}