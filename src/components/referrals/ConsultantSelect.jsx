import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SEED_CONSULTANTS, mergeConsultants } from "@/lib/consultants";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function ConsultantSelect({ value, onChange, placeholder = "Select consultant", allowClear = true }) {
  const [consultants, setConsultants] = useState(
    () => [...SEED_CONSULTANTS].sort((a, b) => a.localeCompare(b))
  );

  useEffect(() => {
    (async () => {
      try {
        const referrals = await base44.entities.Referral.list("-created_date", 500);
        const names = [];
        referrals.forEach((r) => {
          if (r.accepting_consultant?.trim()) names.push(r.accepting_consultant.trim());
          if (r.discussed_with_consultant?.trim()) names.push(r.discussed_with_consultant.trim());
        });
        setConsultants(mergeConsultants(names));
      } catch { /* keep seed list on error */ }
    })();
  }, []);

  return (
    <Select value={value || "none"} onValueChange={(v) => onChange(v === "none" ? null : v)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowClear && <SelectItem value="none">— None —</SelectItem>}
        {consultants.map((c) => (
          <SelectItem key={c} value={c}>{c}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}