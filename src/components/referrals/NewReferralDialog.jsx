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

const URGENCY_OPTIONS = [
  { value: "emergency", label: "Emergency" },
  { value: "urgent", label: "Urgent" },
  { value: "routine", label: "Routine" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "admitted", label: "Admitted" },
  { value: "declined", label: "Declined" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "unknown", label: "Unknown" },
];

export function NewReferralDialog({ open, onOpenChange, onCreated }) {
  const [form, setForm] = useState({
    patient_initials: "",
    hospital_number: "",
    age: "",
    sex: "unknown",
    current_ward: "",
    referring_team: "",
    reason_for_referral: "",
    urgency: "routine",
    status: "pending",
  });
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setForm({
      patient_initials: "",
      hospital_number: "",
      age: "",
      sex: "unknown",
      current_ward: "",
      referring_team: "",
      reason_for_referral: "",
      urgency: "routine",
      status: "pending",
    });
  };

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
        current_ward: form.current_ward || undefined,
        referring_team: form.referring_team || undefined,
        reason_for_referral: form.reason_for_referral,
        urgency: form.urgency,
        status: form.status,
        referral_received_at: new Date().toISOString(),
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
          <DialogTitle>New referral</DialogTitle>
          <DialogDescription>
            Create a new critical care referral. All fields persist to the referral register.
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
              <Label>Current ward</Label>
              <Input
                value={form.current_ward}
                onChange={(e) => setForm({ ...form, current_ward: e.target.value })}
                placeholder="A&E Resus"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Referring team</Label>
              <Input
                value={form.referring_team}
                onChange={(e) => setForm({ ...form, referring_team: e.target.value })}
                placeholder="Medical Reg"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Urgency</Label>
              <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {URGENCY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reason for referral</Label>
            <Textarea
              required
              value={form.reason_for_referral}
              onChange={(e) => setForm({ ...form, reason_for_referral: e.target.value })}
              placeholder="Septic shock, lactate 4.2…"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleClose(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || !form.patient_initials || !form.reason_for_referral}>
              {saving ? "Saving…" : "Create referral"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}