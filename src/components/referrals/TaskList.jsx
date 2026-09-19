import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { format, formatDistanceToNow } from "date-fns";
import { CheckCircle2, Circle, Trash2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const ROLE_LABEL = { admin: "Admin", clinician: "Clinician", any: "Anyone" };

export function TaskList({ referralId }) {
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("any");
  const [dueLocal, setDueLocal] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const rows = await base44.entities.ReferralTask.list("-created_date", 200);
    setTasks(rows.filter((t) => t.referral_id === referralId));
    setLoaded(true);
  };

  useEffect(() => { refresh(); }, [referralId]);

  const onAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await base44.entities.ReferralTask.create({
      referral_id: referralId,
      title: title.trim(),
      assigned_role: role === "any" ? null : role,
      due_at: dueLocal ? new Date(dueLocal).toISOString() : null,
    });
    setTitle("");
    setDueLocal("");
    setRole("any");
    setSaving(false);
    await refresh();
  };

  const toggle = async (task) => {
    const next = task.status === "done" ? "open" : "done";
    const patch = { status: next };
    if (next === "done") patch.completed_at = new Date().toISOString();
    await base44.entities.ReferralTask.update(task.id, patch);
    await refresh();
  };

  const onDelete = async (task) => {
    await base44.entities.ReferralTask.delete(task.id);
    await refresh();
  };

  const open = tasks.filter((t) => t.status === "open");
  const done = tasks.filter((t) => t.status !== "open");

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Tasks</h2>
        <span className="text-xs text-muted-foreground">
          {open.length} open · {done.length} closed
        </span>
      </div>

      <form onSubmit={onAdd} className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Add a task (e.g. chase gases, call Southampton neuro)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Anyone</SelectItem>
            <SelectItem value="clinician">Clinician</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="datetime-local"
          value={dueLocal}
          onChange={(e) => setDueLocal(e.target.value)}
          className="w-[190px]"
          aria-label="Due date"
        />
        <Button type="submit" size="sm" disabled={saving || !title.trim()}>Add</Button>
      </form>

      {!loaded && <div className="text-sm text-muted-foreground">Loading…</div>}
      {loaded && tasks.length === 0 && (
        <div className="text-sm text-muted-foreground">No tasks yet.</div>
      )}

      {tasks.length > 0 && (
        <ul className="divide-y">
          {[...open, ...done].map((t) => {
            const overdue = t.due_at && t.status === "open" && new Date(t.due_at) < new Date();
            const Icon = t.status === "done" ? CheckCircle2 : Circle;
            return (
              <li key={t.id} className="py-2 flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggle(t)}
                  className="mt-0.5 text-muted-foreground hover:text-foreground"
                  aria-label={t.status === "done" ? "Reopen task" : "Complete task"}
                >
                  <Icon className={`w-4 h-4 ${t.status === "done" ? "text-emerald-600" : ""}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {t.title}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1 items-center text-xs text-muted-foreground">
                    {t.assigned_role && (
                      <Badge variant="secondary" className="text-[10px]">{ROLE_LABEL[t.assigned_role]}</Badge>
                    )}
                    {t.due_at && (
                      <span className={`flex items-center gap-1 ${overdue ? "text-red-600 font-medium" : ""}`}>
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {overdue ? "Overdue " : "Due "}
                        {formatDistanceToNow(new Date(t.due_at), { addSuffix: true })}
                        <span className="text-muted-foreground/70">
                          ({format(new Date(t.due_at), "d MMM HH:mm")})
                        </span>
                      </span>
                    )}
                    {t.status === "done" && t.completed_at && (
                      <span>Done {formatDistanceToNow(new Date(t.completed_at), { addSuffix: true })}</span>
                    )}
                  </div>
                </div>
                <Button
                  type="button" variant="ghost" size="sm"
                  onClick={() => onDelete(t)}
                  aria-label="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}