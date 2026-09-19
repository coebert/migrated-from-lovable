import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  STATUS_STYLES,
  ADMISSION_URGENCY_BADGE,
  ADMISSION_URGENCY_LABELS,
  ADMISSION_URGENCY_PIP,
  ADMISSION_URGENCY_OPTIONS,
} from "@/lib/referral-utils";

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
        discussed_with_consultant: r.discussed_with_consultant ?? "",
        taken_by: r.taken_by ?? "",
        outcome: r.outcome ?? "",
      });
      setLoading(false);
    })();
  }, [id]);

  const save = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    const patch = {
      ...form,
      age: form.age === "" ? null : Number(form.age),
      admission_urgency: form.admission_urgency || null,
    };
    if (patch.status === "accepted" || patch.status === "declined") {
      if (!ref.decision_at) patch.decision_at = now;
    }
    if (patch.status === "admitted" && !ref.arrived_on_unit_at) {
      patch.arrived_on_unit_at = now;
    }
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
      <div className="max-w-3xl mx-auto space-y-4">
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

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/referrals")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-2">
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Referral details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!editing ? (
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
              <Field label="Taken by" value={ref.taken_by ?? ref.discussed_with_consultant} />
              <div className="col-span-2">
                <span className="text-xs text-muted-foreground block mb-1">Reason for referral</span>
                <span className="text-sm">{ref.reason_for_referral ?? ref.referral_reason ?? "—"}</span>
              </div>
              {ref.outcome && (
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground block mb-1">Outcome</span>
                  <span className="text-sm">{ref.outcome}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
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
                <InputField label="Discussed with" value={form.discussed_with_consultant} onChange={(v) => setForm({ ...form, discussed_with_consultant: v })} />
                <InputField label="Taken by" value={form.taken_by} onChange={(v) => setForm({ ...form, taken_by: v })} />
                <InputField label="Outcome" value={form.outcome} onChange={(v) => setForm({ ...form, outcome: v })} />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Reason for referral</span>
                <textarea
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  rows={3}
                  value={form.reason_for_referral}
                  onChange={(e) => setForm({ ...form, reason_for_referral: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                <Button size="sm" disabled={saving} onClick={save}>
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
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
      <input
        type={type}
        className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectField({ label, value, options, optionLabels, onChange }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <select
        className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o, i) => (
          <option key={o} value={o}>{optionLabels ? optionLabels[i] : o}</option>
        ))}
      </select>
    </div>
  );
}