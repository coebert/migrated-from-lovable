import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, ShieldCheck, Bed, Pencil, Trash2, Network } from "lucide-react";
import { format } from "date-fns";
import BridgePanel from "@/components/admin/BridgePanel";

const TEMPLATE_CATEGORIES = [
  { value: "advice", label: "Advice" },
  { value: "decline", label: "Decline" },
  { value: "accept", label: "Accept" },
  { value: "handover", label: "Handover" },
];

export default function Admin() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground">Team members, beds, templates & audit</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Team members</TabsTrigger>
          <TabsTrigger value="beds">Beds</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
          <TabsTrigger value="bridge">Bridge</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4 space-y-6">
          <TeamMembersPanel />
        </TabsContent>

        <TabsContent value="beds" className="mt-4">
          <BedsPanel />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <TemplatesPanel />
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <AuditPanel />
        </TabsContent>

        <TabsContent value="bridge" className="mt-4">
          <BridgePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TeamMembersPanel() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: "", full_name: "", role: "user" });
  const [lastEmail, setLastEmail] = useState(null);
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    setLoading(true);
    const users = await base44.entities.User.list();
    setTeam(users);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const invite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      await base44.users.inviteUser(form.email, form.role);
      setLastEmail(form.email);
      setForm({ email: "", full_name: "", role: "user" });
      await load();
    } catch (err) {
      // show error
    }
    setInviting(false);
  };

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    await base44.entities.User.update(user.id, { role: newRole });
    setTeam((cur) => cur.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
  };

  return (
    <>
      <Card className="p-5">
        <h3 className="font-semibold mb-1">Invite a team member</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sends a time-limited invitation email. The user sets their own password.
        </p>
        <form onSubmit={invite} className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Clinician</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={inviting}>
              {inviting ? "Sending…" : "Send invitation"}
            </Button>
          </div>
        </form>
        {lastEmail && (
          <div className="mt-4 p-3 rounded-md border border-border bg-accent text-sm">
            <span className="text-muted-foreground">Invitation sent to:</span>{" "}
            <span className="font-mono">{lastEmail}</span>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Team members ({team.length})</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left">Email</th>
                  <th className="text-left">Role</th>
                  <th className="text-left">Last sign-in</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {team.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="py-2">{u.full_name || "—"}</td>
                    <td className="font-mono text-xs">{u.email}</td>
                    <td>
                      <Badge variant="outline" className="capitalize">{u.role}</Badge>
                    </td>
                    <td className="text-xs text-muted-foreground">
                      {u.created_date ? format(new Date(u.created_date), "dd/MM/yyyy HH:mm") : "—"}
                    </td>
                    <td className="text-right">
                      <Button size="sm" variant="outline" onClick={() => toggleRole(u)}>
                        {u.role === "admin" ? "Remove admin" : "Make admin"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

function BedsPanel() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ code: "", is_side_room: false, sort_order: 0, unit: "Radnor CCU" });

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Bed.list();
    setBeds(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => {
    setEditing(null);
    setForm({ code: "", is_side_room: false, sort_order: beds.length + 1, unit: "Radnor CCU" });
    setDialogOpen(true);
  };

  const startEdit = (bed) => {
    setEditing(bed);
    setForm({ code: bed.code, is_side_room: bed.is_side_room, sort_order: bed.sort_order, unit: bed.unit });
    setDialogOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (editing) {
      await base44.entities.Bed.update(editing.id, form);
    } else {
      await base44.entities.Bed.create(form);
    }
    setDialogOpen(false);
    await load();
  };

  const remove = async (bed) => {
    await base44.entities.Bed.delete(bed.id);
    await load();
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Beds ({beds.length})</h3>
        <Button size="sm" onClick={startNew}>
          <Plus className="w-4 h-4 mr-1" /> Add bed
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {[...beds].sort((a, b) => a.sort_order - b.sort_order).map((b) => (
            <div key={b.id} className="flex items-center gap-2 rounded-md border border-border p-2.5 text-sm">
              <Bed className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono font-medium">{b.code}</span>
              {b.is_side_room && <Badge variant="outline" className="text-[10px] ml-auto">Side</Badge>}
              <div className="ml-auto flex gap-1">
                <button onClick={() => startEdit(b)} className="text-muted-foreground hover:text-foreground p-1">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => remove(b)} className="text-muted-foreground hover:text-destructive p-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit bed" : "Add bed"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Bed code</Label>
              <Input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CC-16" />
            </div>
            <div className="space-y-1.5">
              <Label>Sort order</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Switch checked={form.is_side_room} onCheckedChange={(v) => setForm({ ...form, is_side_room: v })} />
              Side room
            </label>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save" : "Add bed"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function TemplatesPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", category: "advice", body: "", active: true });

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.MessageTemplate.list();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => {
    setEditing(null);
    setForm({ title: "", category: "advice", body: "", active: true });
    setDialogOpen(true);
  };

  const startEdit = (t) => {
    setEditing(t);
    setForm({ title: t.title, category: t.category, body: t.body, active: t.active });
    setDialogOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (editing) {
      await base44.entities.MessageTemplate.update(editing.id, form);
    } else {
      await base44.entities.MessageTemplate.create(form);
    }
    setDialogOpen(false);
    await load();
  };

  const remove = async (t) => {
    await base44.entities.MessageTemplate.delete(t.id);
    await load();
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Message templates</h2>
          <p className="text-xs text-muted-foreground">Reusable snippets for decline advice, plans and handovers.</p>
        </div>
        <Button size="sm" onClick={startNew}>
          <Plus className="w-4 h-4 mr-1" /> New template
        </Button>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {!loading && items.length === 0 && (
        <div className="text-sm text-muted-foreground">No templates yet.</div>
      )}
      {items.length > 0 && (
        <ul className="divide-y">
          {items.map((t) => (
            <li key={t.id} className="py-3 flex items-start gap-3">
              <Badge variant="secondary" className="capitalize">{t.category}</Badge>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium flex gap-2 items-center">
                  {t.title}
                  {!t.active && <span className="text-xs text-muted-foreground">(inactive)</span>}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">{t.body}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => startEdit(t)} aria-label="Edit">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => remove(t)} aria-label="Delete">
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit template" : "New template"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Body</Label>
              <textarea
                rows={6}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
                maxLength={4000}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              Active (available for insertion)
            </label>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!form.title.trim() || !form.body.trim()}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function AuditPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.AuditLog.list("-created_date", 50);
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold">Audit log</h3>
        <Badge variant="secondary" className="ml-auto text-[10px]">{items.length}</Badge>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No audit entries yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((l) => (
            <li key={l.id} className="flex items-center gap-3 text-sm border-b border-border last:border-0 py-2">
              <span className="font-mono text-xs text-muted-foreground w-20 shrink-0">
                {l.created_date ? format(new Date(l.created_date), "dd/MM HH:mm") : "—"}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">{l.action}</Badge>
              {l.entity && <span className="text-foreground text-xs">{l.entity}</span>}
              {l.entity_id && <span className="text-muted-foreground text-xs font-mono">{l.entity_id}</span>}
              <span className="ml-auto text-xs text-muted-foreground">by {l.user_name ?? "—"}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}