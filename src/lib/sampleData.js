// Local sample data scaffolded for the migrated UI (no database in this migration).
// Mirrors the source schema shape: beds, bed_occupancies, referrals, messages, postop_bookings.

export const BEDS = [
  { id: "b1", code: "CC-01", is_side_room: false, sort_order: 1, unit: "Radnor CCU" },
  { id: "b2", code: "CC-02", is_side_room: false, sort_order: 2, unit: "Radnor CCU" },
  { id: "b3", code: "CC-03", is_side_room: true, sort_order: 3, unit: "Radnor CCU" },
  { id: "b4", code: "CC-04", is_side_room: false, sort_order: 4, unit: "Radnor CCU" },
  { id: "b5", code: "CC-05", is_side_room: false, sort_order: 5, unit: "Radnor CCU" },
  { id: "b6", code: "CC-06", is_side_room: true, sort_order: 6, unit: "Radnor CCU" },
  { id: "b7", code: "CC-07", is_side_room: false, sort_order: 7, unit: "Radnor CCU" },
  { id: "b8", code: "CC-08", is_side_room: false, sort_order: 8, unit: "Radnor CCU" },
  { id: "b9", code: "CC-09", is_side_room: false, sort_order: 9, unit: "Radnor CCU" },
  { id: "b10", code: "CC-10", is_side_room: true, sort_order: 10, unit: "Radnor CCU" },
  { id: "b11", code: "CC-11", is_side_room: false, sort_order: 11, unit: "Radnor CCU" },
  { id: "b12", code: "CC-12", is_side_room: false, sort_order: 12, unit: "Radnor CCU" },
  { id: "b13", code: "CC-13", is_side_room: false, sort_order: 13, unit: "Radnor CCU" },
  { id: "b14", code: "CC-14", is_side_room: true, sort_order: 14, unit: "Radnor CCU" },
  { id: "b15", code: "CC-15", is_side_room: false, sort_order: 15, unit: "Radnor CCU" },
];

const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();
const hoursAhead = (h) => new Date(Date.now() + h * 3600000).toISOString();

export const OCCUPANCIES = [
  { id: "o1", bed_id: "b1", level: 3, patient_initials: "AB", hospital_number: "MN-10241", admitting_consultant: "Dr Patel", admitted_at: daysAgo(6), ventilated: true, nippv_cpap: false, hfno: false, vasopressors: true, renal_replacement: true, tracheostomy: false, isolation: "none", wardable: false, predicted_discharge_at: hoursAhead(48) },
  { id: "o2", bed_id: "b2", level: 2, patient_initials: "CD", hospital_number: "MN-10887", admitting_consultant: "Dr Khan", admitted_at: daysAgo(3), ventilated: false, nippv_cpap: true, hfno: false, vasopressors: false, renal_replacement: false, tracheostomy: false, isolation: "contact", wardable: false, predicted_discharge_at: hoursAhead(30) },
  { id: "o3", bed_id: "b3", level: 3, patient_initials: "EF", hospital_number: "MN-11002", admitting_consultant: "Dr Owens", admitted_at: daysAgo(9), ventilated: true, nippv_cpap: false, hfno: false, vasopressors: true, renal_replacement: false, tracheostomy: true, isolation: "airborne", wardable: false, predicted_discharge_at: null },
  { id: "o4", bed_id: "b5", level: 1, patient_initials: "GH", hospital_number: "MN-11330", admitting_consultant: "Dr Patel", admitted_at: daysAgo(1), ventilated: false, nippv_cpap: false, hfno: true, vasopressors: false, renal_replacement: false, tracheostomy: false, isolation: "none", wardable: true, predicted_discharge_at: hoursAhead(6) },
  { id: "o5", bed_id: "b6", level: 2, patient_initials: "IJ", hospital_number: "MN-11551", admitting_consultant: "Dr Khan", admitted_at: daysAgo(4), ventilated: false, nippv_cpap: false, hfno: true, vasopressors: true, renal_replacement: false, tracheostomy: false, isolation: "droplet", wardable: false, predicted_discharge_at: hoursAhead(20) },
  { id: "o6", bed_id: "b8", level: 0, patient_initials: "KL", hospital_number: "MN-11772", admitting_consultant: "Dr Owens", admitted_at: daysAgo(2), ventilated: false, nippv_cpap: false, hfno: false, vasopressors: false, renal_replacement: false, tracheostomy: false, isolation: "none", wardable: true, predicted_discharge_at: hoursAhead(3) },
  { id: "o7", bed_id: "b10", level: 3, patient_initials: "MN", hospital_number: "MN-11993", admitting_consultant: "Dr Patel", admitted_at: daysAgo(11), ventilated: true, nippv_cpap: false, hfno: false, vasopressors: true, renal_replacement: true, tracheostomy: false, isolation: "contact", wardable: false, predicted_discharge_at: null },
  { id: "o8", bed_id: "b12", level: 2, patient_initials: "OP", hospital_number: "MN-12114", admitting_consultant: "Dr Khan", admitted_at: daysAgo(5), ventilated: false, nippv_cpap: true, hfno: false, vasopressors: false, renal_replacement: false, tracheostomy: false, isolation: "none", wardable: false, predicted_discharge_at: hoursAhead(36) },
  { id: "o9", bed_id: "b14", level: 1, patient_initials: "QR", hospital_number: "MN-12335", admitting_consultant: "Dr Owens", admitted_at: daysAgo(1), ventilated: false, nippv_cpap: false, hfno: true, vasopressors: false, renal_replacement: false, tracheostomy: false, isolation: "none", wardable: true, predicted_discharge_at: hoursAhead(8) },
];

export const REFERRALS = [
  { id: "r1", patient_initials: "ST", hospital_number: "MN-13001", age: 64, urgency: "emergency", referral_reason: "Septic shock, lactate 4.2", source_ward: "A&E Resus", referring_team: "Medical Reg", status: "pending", created_at: hoursAhead(-2), age_group: "adult" },
  { id: "r2", patient_initials: "UV", hospital_number: "MN-13002", age: 71, urgency: "urgent", referral_reason: "Type 1 respiratory failure post-op", source_ward: "Theatre Recovery", referring_team: "Anaesthetics", status: "pending", created_at: hoursAhead(-5), age_group: "adult" },
  { id: "r3", patient_initials: "WX", hospital_number: "MN-13003", age: 58, urgency: "routine", referral_reason: "Step-down from Level 3, stable on ward O2", source_ward: "ICU Outreach", referring_team: "Medical Reg", status: "accepted", created_at: hoursAhead(-26), age_group: "adult" },
  { id: "r4", patient_initials: "YZ", hospital_number: "MN-13004", age: 45, urgency: "emergency", referral_reason: "DKA with AKI, needs RRT", source_ward: "MAU", referring_team: "Medical Reg", status: "accepted", created_at: hoursAhead(-8), age_group: "adult" },
  { id: "r5", patient_initials: "AB", hospital_number: "MN-13005", age: 80, urgency: "urgent", referral_reason: "Cardiogenic shock, inotrope support", source_ward: "CCU", referring_team: "Cardiology", status: "declined", created_at: hoursAhead(-30), age_group: "adult" },
  { id: "r6", patient_initials: "CD", hospital_number: "MN-13006", age: 33, urgency: "routine", referral_reason: "Overnight observation post overdose", source_ward: "A&E Majors", referring_team: "Medical Reg", status: "pending", created_at: hoursAhead(-1), age_group: "adult" },
  { id: "r7", patient_initials: "EF", hospital_number: "MN-13007", age: 67, urgency: "urgent", referral_reason: "NIV failure, rising CO2", source_ward: "Respiratory", referring_team: "Resp Reg", status: "accepted", created_at: hoursAhead(-12), age_group: "adult" },
];

export const MESSAGES = [
  { id: "m1", from: "Dr Khan", subject: "Re: Bed CC-03 handover", body: "Echocardiogram booked for 14:00. Family updated, goals of care discussed.", received_at: hoursAhead(-1), read: false },
  { id: "m2", from: "A&E Resus", subject: "Incoming referral — septic shock", body: "64M, lactate 4.2, broad-spectrum antibiotics started. Awaiting decision.", received_at: hoursAhead(-2), read: false },
  { id: "m3", from: "Pharmacy", subject: "Antimicrobial review due", body: "Bed CC-01 day 6 — review IV antibiotics and de-escalation plan.", received_at: hoursAhead(-5), read: true },
  { id: "m4", from: "Dr Owens", subject: "Post-op booking confirmed", body: "Theatre 3 at 08:00 for the elective AAA — HDU bed reserved CC-09.", received_at: hoursAhead(-9), read: true },
  { id: "m5", from: "Lab", subject: "Critical result — MN-11993", body: "K+ 6.8, called to bedside nurse. RRT in progress.", received_at: hoursAhead(-14), read: true },
];

export const POSTOP_BOOKINGS = [
  { id: "p1", patient: "GH · MN-11330", procedure: "Elective AAA repair", theatre: "Theatre 3", date: hoursAhead(16), status: "booked" },
  { id: "p2", patient: "IJ · MN-11551", procedure: "Hartmann's procedure", theatre: "Theatre 2", date: hoursAhead(40), status: "booked" },
  { id: "p3", patient: "KL · MN-11772", procedure: "Laparoscopic cholecystectomy", theatre: "Theatre 1", date: hoursAhead(64), status: "confirmed" },
  { id: "p4", patient: "QR · MN-12335", procedure: "ORIF femur", theatre: "Theatre 4", date: hoursAhead(88), status: "pending" },
];

export const TEAM = [
  { id: "u1", full_name: "Dr A. Patel", email: "a.patel@sdh.nhs.uk", role: "admin", last_sign_in: hoursAhead(-2) },
  { id: "u2", full_name: "Dr R. Khan", email: "r.khan@sdh.nhs.uk", role: "clinician", last_sign_in: hoursAhead(-6) },
  { id: "u3", full_name: "Dr S. Owens", email: "s.owens@sdh.nhs.uk", role: "clinician", last_sign_in: hoursAhead(-30) },
  { id: "u4", full_name: "Nurse L. Brown", email: "l.brown@sdh.nhs.uk", role: "clinician", last_sign_in: hoursAhead(-1) },
];

export const dayOfStay = (admittedAt) => {
  if (!admittedAt) return 0;
  const diff = Date.now() - new Date(admittedAt).getTime();
  return Math.max(1, Math.floor(diff / 86400000));
};