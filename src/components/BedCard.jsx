import {
  Activity,
  Bed as BedIcon,
  Droplets,
  Plus,
  ShieldAlert,
  Stethoscope,
  Wind,
} from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WardableToggle } from "@/components/bed-board/WardableToggle";
import { dayOfStay } from "@/lib/sampleData";

const LEVEL_TONE = {
  0: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  1: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
  2: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  3: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
};

const LEVEL_LABEL = {
  0: "Level 0 — ward-level care",
  1: "Level 1 — at risk of deterioration",
  2: "Level 2 — HDU care",
  3: "Level 3 — ICU care",
};

const ISOLATION_LABEL = { contact: "Contact", droplet: "Droplet", airborne: "Airborne" };

function OrganSupportIcons({ o }) {
  const items = [];
  if (o.ventilated) items.push({ key: "vent", label: "Ventilated", icon: <Wind className="w-3.5 h-3.5" /> });
  if (o.nippv_cpap) items.push({ key: "niv", label: "NIV/CPAP", icon: <Wind className="w-3.5 h-3.5" /> });
  if (o.hfno) items.push({ key: "hfno", label: "HFNO", icon: <Wind className="w-3.5 h-3.5" /> });
  if (o.vasopressors) items.push({ key: "vaso", label: "Vasopressors", icon: <Activity className="w-3.5 h-3.5" /> });
  if (o.renal_replacement) items.push({ key: "rrt", label: "RRT", icon: <Droplets className="w-3.5 h-3.5" /> });
  if (o.tracheostomy) items.push({ key: "trach", label: "Tracheostomy", icon: <Stethoscope className="w-3.5 h-3.5" /> });
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {items.map((i) => (
        <span
          key={i.key}
          title={i.label}
          aria-label={i.label}
          className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border"
        >
          {i.icon}
          {i.label}
        </span>
      ))}
    </div>
  );
}

export default function BedCard({ bed, occupancy, onClick, onWardableToggle, wardablePending }) {
  if (!occupancy) {
    return (
      <Card
        className="p-3 flex flex-col justify-between min-h-28 border-dashed hover:bg-accent/40 cursor-pointer transition"
        onClick={() => onClick(bed)}
        role="button"
        tabIndex={0}
        aria-label={`Empty bed ${bed.code} — click to admit`}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(bed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <BedIcon className="w-4 h-4" />
            {bed.code}
          </div>
          {bed.is_side_room && (
            <Badge variant="outline" className="text-[10px]">Side room</Badge>
          )}
        </div>
        <div className="flex items-center justify-center text-muted-foreground text-sm">
          <Plus className="w-4 h-4 mr-1" /> Admit
        </div>
      </Card>
    );
  }

  const predicted = occupancy.predicted_discharge_at
    ? formatDistanceToNowStrict(new Date(occupancy.predicted_discharge_at), { addSuffix: true })
    : null;

  return (
    <Card
      className="p-3 min-h-28 hover:bg-accent/40 cursor-pointer transition"
      onClick={() => onClick(occupancy)}
      role="button"
      tabIndex={0}
      aria-label={`Bed ${bed.code} — click to edit`}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(occupancy)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <BedIcon className="w-4 h-4" />
          {bed.code}
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] ${LEVEL_TONE[occupancy.level] ?? ""}`}
          title={LEVEL_LABEL[occupancy.level] ?? `Level ${occupancy.level}`}
          aria-label={LEVEL_LABEL[occupancy.level] ?? `Level ${occupancy.level}`}
        >
          L{occupancy.level}
        </Badge>
      </div>
      <div className="mt-1 text-sm truncate">
        {occupancy.patient_initials || "—"}{" "}
        <span className="text-xs text-muted-foreground">
          {occupancy.hospital_number ? `· ${occupancy.hospital_number}` : ""}
        </span>
      </div>
      <div className="text-xs text-muted-foreground truncate">
        {occupancy.admitting_consultant || "—"} · Day {dayOfStay(occupancy.admitted_at)}
      </div>
      <OrganSupportIcons o={occupancy} />
      <div className="mt-2 flex flex-wrap gap-1 items-center">
        <WardableToggle
          wardable={occupancy.wardable}
          wardableAt={occupancy.updated_date}
          pending={wardablePending}
          onToggle={() => onWardableToggle(occupancy)}
        />
        {occupancy.isolation !== "none" && (
          <Badge variant="outline" className="text-[10px] gap-1">
            <ShieldAlert className="w-3 h-3" />
            {ISOLATION_LABEL[occupancy.isolation] ?? occupancy.isolation}
          </Badge>
        )}
        {predicted && (
          <span className="text-[11px] text-muted-foreground">
            D/C {predicted}
          </span>
        )}
      </div>
    </Card>
  );
}