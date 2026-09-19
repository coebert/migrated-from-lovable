import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ANTICIPATED_INTERVENTIONS,
  CEILING_OF_CARE_OPTIONS,
  INFECTION_STATUS_OPTIONS,
  REASON_CATEGORY_OPTIONS,
  RESUS_STATUS_OPTIONS,
  WARD_REVIEW_TIMEFRAME_OPTIONS,
  shouldShowFrailty,
} from "@/lib/referral-clinical";

const NONE = "__none";

export function ClinicalFields({ value, onChange, age }) {
  const showFrailty = shouldShowFrailty(age);
  const set = (k, v) => onChange({ [k]: v });

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="news2">NEWS2 score</Label>
          <Input id="news2" type="number" min={0} max={20}
            value={value.news2_score ?? ""}
            onChange={(e) => set("news2_score", e.target.value === "" ? null : Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input id="weight" type="number" min={0} step={0.1}
            value={value.weight_kg ?? ""}
            onChange={(e) => set("weight_kg", e.target.value === "" ? null : Number(e.target.value))} />
        </div>
        {showFrailty && (
          <div className="space-y-1.5">
            <Label htmlFor="frailty">Rockwell CFS (1–9)</Label>
            <Input id="frailty" type="number" min={1} max={9}
              value={value.frailty_score ?? ""}
              onChange={(e) => set("frailty_score", e.target.value === "" ? null : Number(e.target.value))} />
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Ceiling of care</Label>
          <Select value={value.ceiling_of_care ?? NONE} onValueChange={(v) => set("ceiling_of_care", v === NONE ? null : v)}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>—</SelectItem>
              {CEILING_OF_CARE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Resuscitation status</Label>
          <Select value={value.resus_status ?? NONE} onValueChange={(v) => set("resus_status", v === NONE ? null : v)}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>—</SelectItem>
              {RESUS_STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Reason category</Label>
          <Select value={value.reason_category ?? NONE} onValueChange={(v) => set("reason_category", v === NONE ? null : v)}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>—</SelectItem>
              {REASON_CATEGORY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Infection status</Label>
          <Select value={value.infection_status ?? NONE} onValueChange={(v) => set("infection_status", v === NONE ? null : v)}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>—</SelectItem>
              {INFECTION_STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(value.infection_status === "suspected" || value.infection_status === "confirmed") && (
        <div className="space-y-1.5">
          <Label htmlFor="organism">Organism / source</Label>
          <Input id="organism" value={value.infection_organism ?? ""}
            onChange={(e) => set("infection_organism", e.target.value || null)}
            maxLength={200} placeholder="e.g. E. coli, HAP, unknown source" />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="allergies">Allergies</Label>
        <Textarea id="allergies" rows={2} value={value.allergies ?? ""}
          onChange={(e) => set("allergies", e.target.value || null)}
          maxLength={1000} placeholder="Known drug allergies (or 'NKDA')" />
      </div>

      <fieldset className="rounded-md border p-3">
        <legend className="text-xs font-medium px-1">Anticipated interventions</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {ANTICIPATED_INTERVENTIONS.map((o) => {
            const checked = (value.anticipated_interventions ?? []).includes(o.value);
            return (
              <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={checked}
                  onCheckedChange={(c) => {
                    const cur = value.anticipated_interventions ?? [];
                    const next = c
                      ? Array.from(new Set([...cur, o.value]))
                      : cur.filter((v) => v !== o.value);
                    set("anticipated_interventions", next);
                  }} />
                {o.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="rounded-md border p-3 space-y-3">
        <legend className="text-xs font-medium px-1">Ongoing review</legend>
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <Checkbox checked={!!value.needs_ward_review}
            onCheckedChange={(c) => {
              const next = c === true;
              set("needs_ward_review", next);
              if (!next && !value.for_ongoing_ccot_review && value.ward_review_timeframe) {
                set("ward_review_timeframe", null);
              }
            }} />
          <span>
            <span className="font-medium">Needs ongoing ward review</span>
            <span className="block text-xs text-muted-foreground">Ward team should re-review at the suggested interval.</span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <Checkbox checked={!!value.for_ongoing_ccot_review}
            onCheckedChange={(c) => {
              const next = c === true;
              set("for_ongoing_ccot_review", next);
              if (!next && !value.needs_ward_review && value.ward_review_timeframe) {
                set("ward_review_timeframe", null);
              }
            }} />
          <span>
            <span className="font-medium">For ongoing CCOT review</span>
            <span className="block text-xs text-muted-foreground">Critical care outreach team to review.</span>
          </span>
        </label>
        {(value.needs_ward_review || value.for_ongoing_ccot_review) && (
          <div className="space-y-1.5">
            <Label>Review timeframe</Label>
            <Select value={value.ward_review_timeframe ?? NONE} onValueChange={(v) => set("ward_review_timeframe", v === NONE ? null : v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {WARD_REVIEW_TIMEFRAME_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pmh">Past medical history</Label>
          <Textarea id="pmh" rows={2} value={value.past_medical_history ?? ""}
            onChange={(e) => set("past_medical_history", e.target.value || null)}
            maxLength={2000} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="baseline">Baseline function</Label>
          <Textarea id="baseline" rows={2} value={value.baseline_function ?? ""}
            onChange={(e) => set("baseline_function", e.target.value || null)}
            maxLength={2000} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dnacpr">DNACPR / ReSPECT</Label>
        <Input id="dnacpr" value={value.dnacpr_respect ?? ""}
          onChange={(e) => set("dnacpr_respect", e.target.value || null)}
          maxLength={500} placeholder="e.g. DNACPR in place, ReSPECT completed" />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <Checkbox checked={!!value.consultant_to_consultant_only}
          onCheckedChange={(c) => set("consultant_to_consultant_only", c === true)} />
        <span>Consultant-to-consultant only</span>
      </label>
    </div>
  );
}