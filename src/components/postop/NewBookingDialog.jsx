import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LEVEL_OPTIONS = [
  { value: "level_1", label: "Level 1" },
  { value: "level_2", label: "Level 2 (HDU)" },
  { value: "level_3", label: "Level 3 (ICU)" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "unknown", label: "Unknown" },
];

const SPECIALTIES = [
  "General Surgery",
  "Vascular",
  "Cardiothoracic",
  "Orthopaedics",
  "Neurosurgery",
  "ENT",
  "Urology",
  "Hepatobiliary",
  "Other",
];

const emptyForm = {
  patient_initials: "",
  hospital_number: "",
  age: "",
  sex: "unknown",
  proposed_procedure: "",
  predicted_level: "level_2",
  proposed_surgery_date: "",
  surgical_specialty: "",
  reason_for_bed: "",
};

export function NewBookingDialog({ open, onOpenChange, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const reset = () => setForm(emptyForm);

  const handleClose = (v) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        patient_initials: form.patient_initials.toUpperCase(),
        hospital_number: form.hospital_number || undefined,
        age: form.age ? parseInt(form.age, 10) : undefined,
        sex: form.sex,
        proposed_procedure: form.proposed_procedure || undefined,
        predicted_level: form.predicted_level,
        proposed_surgery_date: form.proposed_surgery_date
          ? new Date(form.proposed_surgery_date).toISOString()
          : undefined,
        surgical_specialty: form.surgical_specialty || undefined,
        reason_for_bed: form.reason_for_bed || undefined,
        booking_status: "requested",
      };
      await onCreated(payload);
      reset();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New post-op booking</DialogTitle>
          <DialogDescription>
            Pre-book a critical care bed for a planned high-risk surgical patient.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Initials</Label>
              <Input
                required
                maxLength={4}
                value={form.patient_initials}
                onChange={(e) => setForm({ ...form, patient_initials: e.target.value })}
                placeholder="AB"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hospital number</Label>
              <Input
                value={form.hospital_number}
                onChange={(e) => setForm({ ...form, hospital_number: e.target.value })}
                placeholder="MN-00000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Age</Label>
              <Input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="64"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sex</Label>
              <Select value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEX_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Surgical specialty</Label>
              <Select
                value={form.surgical_specialty}
                onValueChange={(v) => setForm({ ...form, surgical_specialty: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Predicted level</Label>
              <Select
                value={form.predicted_level}
                onValueChange={(v) => setForm({ ...form, predicted_level: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Proposed surgery date & time</Label>
              <Input
                type="datetime-local"
                value={form.proposed_surgery_date}
                onChange={(e) => setForm({ ...form, proposed_surgery_date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Proposed procedure</Label>
            <Input
              value={form.proposed_procedure}
              onChange={(e) => setForm({ ...form, proposed_procedure: e.target.value })}
              placeholder="Elective AAA repair"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Reason for bed</Label>
            <Textarea
              rows={2}
              value={form.reason_for_bed}
              onChange={(e) => setForm({ ...form, reason_for_bed: e.target.value })}
              placeholder="High-risk due to comorbidities, anticipated prolonged ventilation…"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleClose(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || !form.patient_initials}>
              {saving ? "Saving…" : "Create booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}