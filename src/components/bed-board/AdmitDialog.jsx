import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ISOLATION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "contact", label: "Contact" },
  { value: "droplet", label: "Droplet" },
  { value: "airborne", label: "Airborne" },
];

export function AdmitDialog({ open, onOpenChange, bed, occupancy, onSave, onDischarge }) {
  const [form, setForm] = useState({
    patient_initials: "",
    hospital_number: "",
    age: "",
    admitting_consultant: "",
    level: 0,
    ventilated: false,
    nippv_cpap: false,
    hfno: false,
    vasopressors: false,
    renal_replacement: false,
    tracheostomy: false,
    wardable: false,
    isolation: "none",
    predicted_discharge_at: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (occupancy) {
      setForm({
        patient_initials: occupancy.patient_initials || "",
        hospital_number: occupancy.hospital_number || "",
        age: occupancy.age != null ? String(occupancy.age) : "",
        admitting_consultant: occupancy.admitting_consultant || "",
        level: occupancy.level ?? 0,
        ventilated: occupancy.ventilated ?? false,
        nippv_cpap: occupancy.nippv_cpap ?? false,
        hfno: occupancy.hfno ?? false,
        vasopressors: occupancy.vasopressors ?? false,
        renal_replacement: occupancy.renal_replacement ?? false,
        tracheostomy: occupancy.tracheostomy ?? false,
        wardable: occupancy.wardable ?? false,
        isolation: occupancy.isolation ?? "none",
        predicted_discharge_at: occupancy.predicted_discharge_at
          ? new Date(occupancy.predicted_discharge_at).toISOString().slice(0, 16)
          : "",
      });
    } else {
      setForm({
        patient_initials: "",
        hospital_number: "",
        age: "",
        admitting_consultant: "",
        level: 0,
        ventilated: false,
        nippv_cpap: false,
        hfno: false,
        vasopressors: false,
        renal_replacement: false,
        tracheostomy: false,
        wardable: false,
        isolation: "none",
        predicted_discharge_at: "",
      });
    }
  }, [occupancy, open]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      bed_id: bed.id,
      patient_initials: form.patient_initials.toUpperCase(),
      hospital_number: form.hospital_number || null,
      age: form.age ? parseInt(form.age, 10) : null,
      admitting_consultant: form.admitting_consultant || null,
      level: form.level,
      ventilated: form.ventilated,
      nippv_cpap: form.nippv_cpap,
      hfno: form.hfno,
      vasopressors: form.vasopressors,
      renal_replacement: form.renal_replacement,
      tracheostomy: form.tracheostomy,
      wardable: form.wardable,
      isolation: form.isolation,
      predicted_discharge_at: form.predicted_discharge_at
        ? new Date(form.predicted_discharge_at).toISOString()
        : null,
    };
    if (!payload.admitted_at && occupancy) {
      payload.admitted_at = occupancy.admitted_at;
    } else if (!occupancy) {
      payload.admitted_at = new Date().toISOString();
    }
    await onSave(payload);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {occupancy ? `Edit patient — Bed ${bed.code}` : `Admit patient — Bed ${bed.code}`}
          </DialogTitle>
          <DialogDescription>
            {occupancy
              ? "Update clinical details and organ support."
              : "Enter patient details to occupy this bed."}
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
              <Label>Consultant</Label>
              <Input
                value={form.admitting_consultant}
                onChange={(e) => setForm({ ...form, admitting_consultant: e.target.value })}
                placeholder="Dr Patel"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Level of care</Label>
            <Select
              value={String(form.level)}
              onValueChange={(v) => setForm({ ...form, level: parseInt(v, 10) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Level 0 — ward-level care</SelectItem>
                <SelectItem value="1">Level 1 — at risk of deterioration</SelectItem>
                <SelectItem value="2">Level 2 — HDU care</SelectItem>
                <SelectItem value="3">Level 3 — ICU care</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Isolation</Label>
            <Select
              value={form.isolation}
              onValueChange={(v) => setForm({ ...form, isolation: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ISOLATION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Predicted discharge</Label>
            <Input
              type="datetime-local"
              value={form.predicted_discharge_at}
              onChange={(e) => setForm({ ...form, predicted_discharge_at: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2">Organ support</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "ventilated", label: "Ventilated" },
                { key: "nippv_cpap", label: "NIV/CPAP" },
                { key: "hfno", label: "HFNO" },
                { key: "vasopressors", label: "Vasopressors" },
                { key: "renal_replacement", label: "RRT" },
                { key: "tracheostomy", label: "Tracheostomy" },
              ].map((s) => (
                <label
                  key={s.key}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Switch
                    checked={form[s.key]}
                    onCheckedChange={(v) => setForm({ ...form, [s.key]: v })}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Switch
              checked={form.wardable}
              onCheckedChange={(v) => setForm({ ...form, wardable: v })}
            />
            Wardable (ready for discharge to ward)
          </label>

          <DialogFooter className="gap-2">
            {occupancy && (
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => onDischarge(occupancy)}
                className="mr-auto"
              >
                Discharge patient
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.patient_initials}>
              {saving ? "Saving…" : occupancy ? "Save changes" : "Admit patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}