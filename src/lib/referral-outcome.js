// Referral outcome enum, labels, and validation.
// Mirrors src/lib/referral-outcome.ts from the Lovable source.

export const REFERRAL_OUTCOMES = [
  { value: "admit_for_admission", label: "Accept for admission", description: "Patient is being accepted and admitted to critical care." },
  { value: "review_on_ward", label: "Review on ward", description: "\"Come and review\" — no bed yet, will visit and reassess." },
  { value: "advice_given", label: "Advice given", description: "Telephone advice only. Referral closes with no admission." },
  { value: "declined", label: "Declined", description: "Not accepted for critical care." },
];

export function outcomeLabel(v) {
  if (!v) return null;
  return REFERRAL_OUTCOMES.find((o) => o.value === v)?.label ?? v;
}

export function deriveOutcomeFromLegacyStatus(status) {
  switch (status) {
    case "accepted":
    case "admitted":
      return "admit_for_admission";
    case "declined":
      return "declined";
    default:
      return null;
  }
}