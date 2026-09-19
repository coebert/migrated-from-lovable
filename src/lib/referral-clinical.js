// Referral clinical enums, labels, and small pure helpers.
// Mirrors src/lib/referral-clinical.ts from the Lovable source.

export const CEILING_OF_CARE_OPTIONS = [
  { value: "full_escalation", label: "Full escalation" },
  { value: "no_cpr", label: "Full escalation, not for CPR" },
  { value: "ward_based", label: "Ward-based care only" },
  { value: "symptom_control", label: "Symptom control / palliative" },
  { value: "not_documented", label: "Not documented" },
];

export const REASON_CATEGORY_OPTIONS = [
  { value: "respiratory_failure", label: "Respiratory failure" },
  { value: "sepsis", label: "Sepsis" },
  { value: "shock", label: "Shock / haemodynamic" },
  { value: "post_op", label: "Post-operative" },
  { value: "neurology", label: "Neurological" },
  { value: "trauma", label: "Trauma" },
  { value: "gi_bleed", label: "GI bleed" },
  { value: "metabolic", label: "Metabolic / endocrine" },
  { value: "overdose", label: "Overdose / poisoning" },
  { value: "other", label: "Other" },
];

export const INFECTION_STATUS_OPTIONS = [
  { value: "none", label: "No known infection" },
  { value: "suspected", label: "Suspected infection" },
  { value: "confirmed", label: "Confirmed infection" },
  { value: "unknown", label: "Unknown" },
];

export const RESUS_STATUS_OPTIONS = [
  { value: "for_cpr", label: "For CPR" },
  { value: "dnacpr", label: "DNACPR in place" },
  { value: "not_documented", label: "Not documented" },
];

export const ANTICIPATED_INTERVENTIONS = [
  { value: "invasive_ventilation", label: "Invasive ventilation" },
  { value: "niv_cpap", label: "NIV / CPAP" },
  { value: "hfno", label: "HFNO" },
  { value: "vasopressors", label: "Vasopressors" },
  { value: "rrt", label: "Renal replacement" },
  { value: "neuro_obs", label: "Neuro observations" },
  { value: "arterial_line", label: "Arterial line" },
  { value: "central_line", label: "Central line" },
  { value: "other", label: "Other" },
];

export const WARD_REVIEW_TIMEFRAME_OPTIONS = [
  { value: "12h", label: "Within 12 hours" },
  { value: "24h", label: "Within 24 hours" },
  { value: "48h", label: "Within 48 hours" },
  { value: "72h", label: "Within 72 hours" },
  { value: "weekly", label: "Weekly" },
  { value: "prn", label: "As needed (PRN)" },
];

export function shouldShowFrailty(age) {
  return typeof age === "number" && age >= 65;
}

export function computeNews2Tone(score) {
  if (score == null) return "none";
  if (score <= 4) return "green";
  if (score <= 6) return "amber";
  return "red";
}

export function news2ToneClasses(tone) {
  switch (tone) {
    case "red": return "bg-destructive/10 text-destructive border-destructive/30";
    case "amber": return "bg-amber-500/10 text-amber-700 border-amber-500/30";
    case "green": return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

export function ceilingLabel(v) {
  if (!v) return null;
  return CEILING_OF_CARE_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

export function reasonCategoryLabel(v) {
  if (!v) return null;
  return REASON_CATEGORY_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

export function infectionStatusLabel(v) {
  if (!v) return null;
  return INFECTION_STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

export function resusStatusLabel(v) {
  if (!v) return null;
  return RESUS_STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

export function getAnticipatedInterventionLabel(v) {
  return ANTICIPATED_INTERVENTIONS.find((o) => o.value === v)?.label ?? v;
}