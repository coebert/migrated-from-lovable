import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, CalendarClock, Pencil, Trash2, CalendarDays } from "lucide-react";
import { format, parseISO } from "date-fns";

const LEVEL_LABEL = {
  level_1: "Level 1",
  level_2: "Level 2 (HDU)",
  level_3: "Level 3 (ICU)",
};

const LEVEL_CLASS = {
  level_1: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100",
  level_2: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  level_3: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100",
};

const STATUS_LABEL = {
  requested: "Requested",
  confirmed: "Confirmed",
  arrived: "Arrived",
  cancelled: "Cancelled",
};

const STATUS_CLASS = {
  requested: "bg-muted text-muted-foreground border-muted-foreground/20",
  confirmed: "bg-success/15 text-success border-success/30",
  arrived: "bg-sky-500/10 text-sky-700 border-sky-500/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function PostOp() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.PostopBooking.list("-proposed_surgery_date", 200);
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    return items;
  }, [items]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    await base44.entities.PostopBooking.delete(pendingDelete.id);
    setItems((cur) => cur.filter((b) => b.id !== pendingDelete.id));
    setPendingDelete(null);
    setConfirmOpen(false);
    setDeleting(false);
  };

  const setStatus = async (id, status) => {
    await base44.entities.PostopBooking.update(id, { booking_status: status });
    setItems((cur) => cur.map((b) => b.id === id ? { ...b, booking_status: status } : b));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Post-op HDU/ICU bookings</h1>
          <p className="text-sm text-muted-foreground">
            Pre-booked critical care beds for planned high-risk surgical patients.
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex items-center gap-2 mr-1">
            <Switch id="show-deleted" checked={showDeleted} onCheckedChange={setShowDeleted} />
            <Label htmlFor="show-deleted" className="text-sm cursor-pointer">Show deleted</Label>
          </div>
          <Button variant="outline">
            <CalendarDays className="w-4 h-4 mr-1" /> Planner
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-1" /> New booking
          </Button>
        </div>
      </div>

      {loading && (
        <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>
      )}

      {!loading && visible.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No post-op bookings yet. Use "New booking" to add one.
        </Card>
      )}

      {!loading && visible.length > 0 && (
        <div className="grid gap-3">
          {visible.map((b) => (
            <Card key={b.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">
                      {b.hospital_number || <em className="text-muted-foreground">No hospital number</em>}
                    </span>
                    <Badge className={LEVEL_CLASS[b.predicted_level]} variant="secondary">
                      {LEVEL_LABEL[b.predicted_level]}
                    </Badge>
                    {b.booking_status && (
                      <Badge variant="outline" className={STATUS_CLASS[b.booking_status] ?? ""}>
                        {STATUS_LABEL[b.booking_status] ?? b.booking_status}
                      </Badge>
                    )}
                    {b.is_test && (
                      <Badge
                        variant="outline"
                        className="border-amber-500/60 text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-900/30"
                        title="Test/demonstration entry — excluded from analytics"
                      >
                        Test patient
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {[
                      b.patient_initials,
                      b.age != null ? `${b.age}y` : null,
                      b.sex ?? null,
                    ].filter(Boolean).join(" · ") || "—"}
                  </div>
                  {b.proposed_procedure && (
                    <div className="text-sm mt-1">{b.proposed_procedure}</div>
                  )}
                  {b.reason_for_bed && (
                    <div className="text-xs text-muted-foreground mt-0.5">{b.reason_for_bed}</div>
                  )}
                </div>
                <div className="flex items-start gap-3 shrink-0">
                  <div className="text-sm text-right">
                    <div className="flex items-center gap-1 text-muted-foreground justify-end">
                      <CalendarClock className="w-3.5 h-3.5" />
                      {b.proposed_surgery_date
                        ? format(parseISO(b.proposed_surgery_date), "dd/MM/yyyy")
                        : "Date TBC"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Booked {b.created_date ? format(new Date(b.created_date), "dd/MM/yyyy") : "—"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {b.booking_status === "requested" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setStatus(b.id, "confirmed")}
                      >
                        Confirm
                      </Button>
                    )}
                    {b.booking_status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setStatus(b.id, "arrived")}
                      >
                        Mark arrived
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => {
                      setPendingDelete(b);
                      setConfirmOpen(true);
                    }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete post-op booking?</DialogTitle>
            <DialogDescription>
              {pendingDelete?.hospital_number ?? "This booking"} will be removed from the list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={deleting} onClick={confirmDelete}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}