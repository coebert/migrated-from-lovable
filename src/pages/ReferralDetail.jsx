import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Trash2, Users } from "lucide-react";
import { format } from "date-fns";
import {
  STATUS_STYLES,
  ADMISSION_URGENCY_BADGE,
  ADMISSION_URGENCY_LABELS,
  ADMISSION_URGENCY_PIP,
  ADMISSION_URGENCY_OPTIONS,
} from "@/lib/referral-utils";
import {
  ceilingLabel, reasonCategoryLabel, infectionStatusLabel, resusStatusLabel,
  getAnticipatedInterventionLabel, computeNews2Tone, news2ToneClasses,
  WARD_REVIEW_TIMEFRAME_OPTIONS,
} from "@/lib/referral-clinical";
import { outcomeLabel } from "@/lib/referral-outcome";
import { ConsultantSelect } from "@/components/referrals/ConsultantSelect";
import { OutcomeSelector } from "@/components/referrals/OutcomeSelector";
import { ClinicalFields } from "@/components/referrals/ClinicalFields";
import { Noteboard } from "@/components/referrals/Noteboard";
import { TaskList } from "@/components/referrals/TaskList";
import { MessageLog } from "@/components/referrals/MessageLog";
import { ReferralAuditTrail } from "@/components/referrals/ReferralAuditTrail";
import { PriorDeclinedReferrals } from "@/components/referrals/PriorDeclinedReferrals";

const SEX_OPTIONS = ["male", "female", "other", "unknown"];

export default function ReferralDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ref, setRef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await base44.entities.Referral.get(id);
      setRef(r);
      setForm({
        patient_initials: r.patient_initials ?? "",
        hospital_number: r.hospital_number ?? "",
        age: r.age ?? "",
        sex: r.sex ?? "unknown",
        current_ward: r.current_ward ?? r.source_ward ?? "",
        current_bed: r.current_bed ?? "",
        referring_specialty: r.referring_specialty ?? r.referring_team ?? "",
        reason_for_referral: r.reason_for_referral ?? r.referral_reason ?? "",
        status: r.status ?? "pending",
        admission_urgency: r.admission_urgency ?? "",
        accepting_consultant: r.accepting_consultant ?? "",
        discussed_with_consultant: r.discussed_with_consultant ?? "",
        taken_by: r.taken_by ?? "",
        outcome: r.outcome ?? null,
        decline_reason: r.decline_reason ?? "",
        reason_notes: r.reason_notes ?? "",
        first_seen_at: r.first_seen_at ?? "",
        news2_score: r.news2_score ?? null,
        ceiling_of_care: r.ceiling_of_care ?? null,
        reason_category: r.reason_category ?? null,
        frailty_score: r.frailty_score ?? null,
        anticipated_interventions: r.anticipated_interventions ?? [],
        infection_status: r.infection_status ?? null,
        infection_organism: r.infection_organism ?? "",
        weight_kg: r.weight_kg ?? null,
        allergies: r.allergies ?? "",
        resus_status: r.resus_status ?? null,
        needs_ward_review: r.needs_ward_review ?? false,
        for_ongoing_ccot_review: r.for_ongoing_ccot_review ?? false,
        ward_review_timeframe: r.ward_review_timeframe ?? null,
        past_medical_history: r.past_medical_history ?? "",
        baseline_function: r.baseline_function ?? "",
        dnacpr_respect: r.dnacpr_respect ?? "",
        consultant_to_consultant_only: r.consultant_to_consultant_only ?? false,
      });
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    const patch = { ...form };
    if (patch.age === "") patch.age = null;
    if (patch.admission_urgency === "") patch.admission_urgency = null;
    if (patch.outcome === "") patch.outcome = null;
    if (patch.news2_score === "") patch.news2_score = null;
    if (patch.weight_kg === "") patch.weight_kg = null;
    if ((patch.status === "accepted" || patch.status === "declined") && !ref.decision_at) patch.decision_at = now;
    if (patch.status === "admitted" && !ref.arrived_on_unit_at) patch.arrived_on_unit_at = now;
    const updated = await base44.entities.Referral.update(id, patch);
    setRef(updated);
    setEditing(false);
    setSaving(false);
  };

  const softDelete = async () => {
    setDeleting(true);
    await base44.entities.Referral.update(id, { deleted_at: new Date().toISOString() });
    setDeleting(false);
    navigate("/referrals");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent></Card>
      </div>
    );
  }

  if (!ref) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-3">
        <h1 className="text-lg font-semibold">Referral unavailable</h1>
        <p className="text-sm text-muted-foreground">
          This referral is no longer available. It may have been deleted or archived.
        </p>
        <Button variant="link" onClick={() => navigate("/referrals")}>Back to referrals</Button>
      </div>
    );
  }

  const receivedAt = ref.referral_received_at || ref.created_at || ref.created_date;
  const currentUserName = currentUser?.full_name || currentUser?.email || "";
  const news2Tone = computeNews2Tone(ref.news2_score);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/referrals")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-2">
          {!editing && <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>}
          <Button variant="outline" size="sm" disabled={deleting} onClick={softDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {ref.patient_initials || "Unknown"}
        </h1>
        <Badge variant="outline" className={`capitalize ${STATUS_STYLES[ref.status] ?? ""}`}>
          {ref.status}
        </Badge>
        {ref.outcome && <Badge variant="secondary">{outcomeLabel(ref.outcome)}</Badge>}
      </div>

      <PriorDeclinedReferrals hospitalNumber={ref.hospital_number} excludeId={ref.id} />

      <AdmissionCapacityCallout />

      {!editing ? (
        <>
          {/* Read-only referral details */}
          <Card>
            <CardHeader><CardTitle className="text-base">Referral details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Field label="Hospital number" value={ref.hospital_number} />
                <Field label="Age / Sex" value={`${ref.age ?? "?"} / ${ref.sex ?? "?"}`} />
                <Field label="Current ward" value={ref.current_ward ?? ref.source_ward} />
                <Field label="Current bed" value={ref.current_bed} />
                <Field label="Referring specialty" value={ref.referring_specialty ?? ref.referring_team} />
                <Field label="Received" value={receivedAt ? format(new Date(receivedAt), "dd/MM/yyyy HH:mm") : "—"} />
                <Field label="Urgency" value={
                  ref.admission_urgency ? (
                    <Badge variant="outline" className={`whitespace-nowrap ${ADMISSION_URGENCY_BADGE[ref.admission_urgency]}`}>
                      <span className="font-mono mr-1">{ADMISSION_URGENCY_PIP[ref.admission_urgency]}</span>
                      {ADMISSION_URGENCY_LABELS[ref.admission_urgency]}
                    </Badge>
                  ) : ref.urgency ?? "—"
                } />
                <Field label="Taken by" value={ref.taken_by} />
                <Field label="Accepting consultant" value={ref.accepting_consultant} />
                <Field label="Discussed with" value={ref.discussed_with_consultant} />
                <Field label="First seen by CC" value={ref.first_seen_at ? format(new Date(ref.first_seen_at), "dd/MM/yyyy HH:mm") : "—"} />
                <Field label="Outcome" value={outcomeLabel(ref.outcome)} />
                {ref.decline_reason && <Field label="Decline reason" value={ref.decline_reason} />}
                {ref.reason_notes && <Field label="Advice / notes" value={ref.reason_notes} />}
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground block mb-1">Reason for referral</span>
                  <span className="text-sm">{ref.reason_for_referral ?? ref.referral_reason ?? "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical context */}
          <Card>
            <CardHeader><CardTitle className="text-base">Clinical context</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                <Field label="NEWS2 score" value={ref.news2_score != null ? (
                  <Badge variant="outline" className={news2ToneClasses(news2Tone)}>{ref.news2_score}</Badge>
                ) : "—"} />
                <Field label="Weight (kg)" value={ref.weight_kg} />
                <Field label="Frailty (CFS)" value={ref.frailty_score} />
                <Field label="Ceiling of care" value={ceilingLabel(ref.ceiling_of_care)} />
                <Field label="Resus status" value={resusStatusLabel(ref.resus_status)} />
                <Field label="Reason category" value={reasonCategoryLabel(ref.reason_category)} />
                <Field label="Infection status" value={infectionStatusLabel(ref.infection_status)} />
                {ref.infection_organism && <Field label="Organism" value={ref.infection_organism} />}
              </div>
              {ref.allergies && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Allergies</span>
                  <span className="text-sm">{ref.allergies}</span>
                </div>
              )}
              {ref.anticipated_interventions?.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Anticipated interventions</span>
                  <div className="flex flex-wrap gap-1">
                    {ref.anticipated_interventions.map((v) => (
                      <Badge key={v} variant="secondary" className="text-[10px]">{getAnticipatedInterventionLabel(v)}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {(ref.needs_ward_review || ref.for_ongoing_ccot_review) && (
                <div className="flex flex-wrap gap-2">
                  {ref.needs_ward_review && <Badge variant="outline">Needs ward review</Badge>}
                  {ref.for_ongoing_ccot_review && <Badge variant="outline">For CCOT review</Badge>}
                  {ref.ward_review_timeframe && (
                    <Badge variant="secondary">
                      {WARD_REVIEW_TIMEFRAME_OPTIONS.find((o) => o.value === ref.ward_review_timeframe)?.label ?? ref.ward_review_timeframe}
                    </Badge>
                  )}
                </div>
              )}
              {ref.past_medical_history && (
                <div><span className="text-xs text-muted-foreground block mb-1">Past medical history</span><span className="text-sm">{ref.past_medical_history}</span></div>
              )}
              {ref.baseline_function && (
                <div><span className="text-xs text-muted-foreground block mb-1">Baseline function</span><span className="text-sm">{ref.baseline_function}</span></div>
              )}
              {ref.dnacpr_respect && (
                <div><span className="text-xs text-muted-foreground block mb-1">DNACPR / ReSPECT</span><span className="text-sm">{ref.dnacpr_respect}</span></div>
              )}
              {ref.consultant_to_consultant_only && <Badge variant="outline">Consultant-to-consultant only</Badge>}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Edit mode */
        <Card>
          <CardHeader><CardTitle className="text-base">Edit referral</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Patient initials" value={form.patient_initials} onChange={(v) => setForm({ ...form, patient_initials: v })} />
              <InputField label="Hospital number" value={form.hospital_number} onChange={(v) => setForm({ ...form, hospital_number: v })} />
              <InputField label="Age" type="number" value={form.age} onChange={(v) => setForm({ ...form, age: v })} />
              <SelectField label="Sex" value={form.sex} options={SEX_OPTIONS} onChange={(v) => setForm({ ...form, sex: v })} />
              <InputField label="Current ward" value={form.current_ward} onChange={(v) => setForm({ ...form, current_ward: v })} />
              <InputField label="Current bed" value={form.current_bed} onChange={(v) => setForm({ ...form, current_bed: v })} />
              <InputField label="Referring specialty" value={form.referring_specialty} onChange={(v) => setForm({ ...form, referring_specialty: v })} />
              <SelectField label="Status" value={form.status} options={["pending", "accepted", "admitted", "declined"]} onChange={(v) => setForm({ ...form, status: v })} />
              <SelectField label="Admission urgency" value={form.admission_urgency} options={["", ...ADMISSION_URGENCY_OPTIONS.map(o => o.value)]} optionLabels={["None", ...ADMISSION_URGENCY_OPTIONS.map(o => o.label)]} onChange={(v) => setForm({ ...form, admission_urgency: v })} />
              <InputField label="Taken by" value={form.taken_by} onChange={(v) => setForm({ ...form, taken_by: v })} />
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Accepting consultant</label>
                <ConsultantSelect value={form.accepting_consultant} onChange={(v) => setForm({ ...form, accepting_consultant: v ?? "" })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Discussed with</label>
                <ConsultantSelect value={form.discussed_with_consultant} onChange={(v) => setForm({ ...form, discussed_with_consultant: v ?? "" })} />
              </div>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block mb-1">Reason for referral</span>
              <textarea className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" rows={3}
                value={form.reason_for_referral} onChange={(e) => setForm({ ...form, reason_for_referral: e.target.value })} />
            </div>

            <OutcomeSelector value={form.outcome} onChange={(v) => setForm({ ...form, outcome: v })} />
            {form.outcome === "declined" && (
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Reason for declining</label>
                <textarea className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" rows={2}
                  value={form.decline_reason} onChange={(e) => setForm({ ...form, decline_reason: e.target.value })} />
              </div>
            )}
            {form.outcome === "advice_given" && (
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Advice given</label>
                <textarea className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" rows={2}
                  value={form.reason_notes} onChange={(e) => setForm({ ...form, reason_notes: e.target.value })} />
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Clinical context</h3>
              <ClinicalFields value={form} onChange={(patch) => setForm({ ...form, ...patch })} age={form.age} />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" disabled={saving} onClick={save}>
                <Save className="w-4 h-4 mr-1" />
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TaskList referralId={id} />
        <MessageLog referralId={id} />
      </div>

      <Noteboard referralId={id} currentUserName={currentUserName} />

      <ReferralAuditTrail referralId={id} />
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground block mb-1">{label}</span>
      <span className="text-sm">{value ?? "—"}</span>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <input type={type} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({ label, value, options, optionLabels, onChange }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o, i) => <option key={o} value={o}>{optionLabels ? optionLabels[i] : o}</option>)}
      </select>
    </div>
  );
}

function AdmissionCapacityCallout() {
  const [beds, setBeds] = useState([]);
  const [occ, setOcc] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [b, o] = await Promise.all([
          base44.entities.Bed.list(),
          base44.entities.Occupancy.list("-admitted_at", 200),
        ]);
        setBeds(b);
        setOcc(o);
      } catch { /* ignore */ }
      setLoaded(true);
    })();
  }, []);

  const totalBeds = beds.length;
  const occupied = occ.length;
  const available = Math.max(0, totalBeds - occupied);

  return (
    <div className="rounded-md border bg-muted/30 p-3 text-sm">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">Admission capacity — current shift</span>
        </div>
      </div>
      {!loaded ? (
        <div className="text-xs text-muted-foreground">Loading capacity…</div>
      ) : (
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <div><span className="tabular-nums font-semibold">{totalBeds}</span><span className="text-xs text-muted-foreground ml-1">total beds</span></div>
          <div><span className="tabular-nums font-semibold">{occupied}</span><span className="text-xs text-muted-foreground ml-1">occupied</span></div>
          <div><span className={`tabular-nums font-semibold ${available === 0 ? "text-destructive" : "text-emerald-700"}`}>{available}</span><span className="text-xs text-muted-foreground ml-1">available</span></div>
        </div>
      )}
    </div>
  );
}