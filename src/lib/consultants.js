// Seed list of critical care consultants, alphabetical by surname.
// Merged with names already saved on referrals so the dropdown always
// offers the established consultants even before any referral has been
// recorded against them.
export const SEED_CONSULTANTS = [
  "C Billingham",
  "R Coe",
  "C Couzens",
  "L Fenner",
  "J Haslam",
  "I Jenkins",
  "S Jukes",
  "C Morden",
  "A Nash",
  "J Walsgrove",
  "J Ward",
];

// Sort consultant display names by surname (last whitespace-delimited token),
// then by the remaining given-name tokens, then by the full string as a
// final deterministic tie-breaker. Case- and accent-insensitive.
export function compareConsultantsBySurname(a, b) {
  const collator = new Intl.Collator("en", { sensitivity: "base", usage: "sort" });
  const parse = (s) => {
    const parts = s.trim().split(/\s+/);
    const surname = parts.length > 1 ? parts[parts.length - 1] : parts[0] ?? "";
    const given = parts.length > 1 ? parts.slice(0, -1).join(" ") : "";
    return { surname, given };
  };
  const pa = parse(a);
  const pb = parse(b);
  return (
    collator.compare(pa.surname, pb.surname) ||
    collator.compare(pa.given, pb.given) ||
    collator.compare(a, b)
  );
}

// Merge seed consultants with names found on existing referrals, deduped
// case-insensitively (first-seen casing wins), sorted by surname.
export function mergeConsultants(existingNames = []) {
  const cs = new Set(SEED_CONSULTANTS);
  existingNames.forEach((name) => {
    if (name && name.trim()) cs.add(name.trim());
  });
  const seen = new Map();
  for (const name of cs) {
    const key = name.toLowerCase();
    if (!seen.has(key)) seen.set(key, name);
  }
  return [...seen.values()].sort(compareConsultantsBySurname);
}