import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

export function CapacityBadge() {
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
    <div
      className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-2 py-1 text-xs"
      aria-label="Current admission capacity by level"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <Users className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Unit capacity</span>
      </Link>
      {!loaded ? (
        <span className="text-muted-foreground">…</span>
      ) : (
        <>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] font-medium tabular-nums transition-colors ${
              available <= 0
                ? "bg-destructive/10 text-destructive border-destructive/30"
                : "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
            }`}
          >
            Beds <span className="font-semibold">{available}</span>
          </span>
          <span className="text-muted-foreground">
            · <span className="tabular-nums font-semibold">{occupied}</span> occupied
          </span>
        </>
      )}
    </div>
  );
}