import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, ShieldCheck, Bed } from "lucide-react";
import { TEAM, BEDS } from "@/lib/sampleData";

export default function Admin() {
  const [team, setTeam] = useState(TEAM);
  const [beds, setBeds] = useState(BEDS);
  const [form, setForm] = useState({ email: "", full_name: "", role: "clinician" });
  const [lastEmail, setLastEmail] = useState(null);

  const invite = (e) => {
    e.preventDefault();
    setLastEmail(form.email);
    setTeam((cur) => [
      { id: `u${Date.now()}`, full_name: form.full_name, email: form.email, role: form.role, last_sign_in: null },
      ...cur,
    ]);
    setForm({ email: "", full_name: "", role: "clinician" });
  };

  const toggleRole = (id) =>
    setTeam((cur) =>
      cur.map((u) => (u.id === id ? { ...u, role: u.role === "admin" ? "clinician" : "admin" } : u))
    );

  const addBed = () =>
    setBeds((cur) => [
      ...cur,
      {
        id: `b${Date.now()}`,
        code: `CC-${String(cur.length + 1).padStart(2, "0")}`,
        is_side_room: false,
        sort_order: cur.length + 1,
        unit: "Radnor CCU",
      },
    ]);

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h2 className="font-heading font-semibold text-lg">Admin</h2>
        <p className="text-xs text-muted-foreground">Team members, beds, templates & audit</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Team members</TabsTrigger>
          <TabsTrigger value="beds">Beds</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4 space-y-4">
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
                <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="clinician">Clinician</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit">Send invitation</Button>
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
            <h3 className="font-semibold mb-3">Team members</h3>
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
                      <td className="py-2">{u.full_name}</td>
                      <td className="font-mono text-xs">{u.email}</td>
                      <td>
                        <Badge variant="outline" className="capitalize">{u.role}</Badge>
                      </td>
                      <td className="text-xs text-muted-foreground">
                        {u.last_sign_in ? new Date(u.last_sign_in).toLocaleString() : "—"}
                      </td>
                      <td className="text-right">
                        <Button size="sm" variant="outline" onClick={() => toggleRole(u.id)}>
                          {u.role === "admin" ? "Remove admin" : "Make admin"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="beds" className="mt-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Beds ({beds.length})</h3>
              <Button size="sm" onClick={addBed}>
                <Plus className="w-4 h-4 mr-1" /> Add bed
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {beds.map((b) => (
                <div key={b.id} className="flex items-center gap-2 rounded-md border border-border p-2.5 text-sm">
                  <Bed className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono font-medium">{b.code}</span>
                  {b.is_side_room && <Badge variant="outline" className="text-[10px] ml-auto">Side</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <Card className="p-5">
            <h3 className="font-semibold mb-1">Message templates</h3>
            <p className="text-sm text-muted-foreground mb-4">Reusable snippets for decline advice, plans and handovers.</p>
            <ul className="divide-y divide-border">
              {[
                { title: "Decline — ward-level care appropriate", cat: "Decline", body: "Reviewed referral. Patient meets Level 0 criteria and is manageable on ward with outreach support." },
                { title: "Accept — bed reserved", cat: "Accept", body: "Referral accepted. HDU bed reserved, please transfer with notes and drug chart." },
                { title: "Handover — overnight", cat: "Handover", body: "Stable overnight. Plan: continue antibiotics, recheck lactate at 06:00, step down if stable." },
              ].map((t, i) => (
                <li key={i} className="py-3 flex items-start gap-3">
                  <Badge variant="secondary" className="text-[10px]">{t.cat}</Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{t.body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold">Audit log</h3>
            </div>
            <ul className="space-y-2">
              {[
                { t: "11:02", a: "referral.accept", e: "r1", u: "Dr Patel" },
                { t: "10:41", a: "bed.update", e: "CC-10", u: "Dr Khan" },
                { t: "09:18", a: "user.role.grant", e: "admin", u: "Dr Patel" },
                { t: "08:30", a: "referral.decline", e: "r5", u: "Dr Owens" },
                { t: "07:55", a: "bed.discharge", e: "CC-06", u: "Nurse Brown" },
              ].map((l, i) => (
                <li key={i} className="flex items-center gap-3 text-sm border-b border-border last:border-0 py-2">
                  <span className="font-mono text-xs text-muted-foreground w-12">{l.t}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">{l.a}</Badge>
                  <span className="text-foreground">{l.e}</span>
                  <span className="ml-auto text-xs text-muted-foreground">by {l.u}</span>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}