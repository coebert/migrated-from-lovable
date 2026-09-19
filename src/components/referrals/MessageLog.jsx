import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { format, formatDistanceToNow } from "date-fns";
import { Phone, Radio, Mail, MessageSquare, Users, Trash2, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { TemplatePicker } from "@/components/referrals/TemplatePicker";

const MESSAGE_CHANNELS = ["phone", "bleep", "email", "secure_msg", "in_person"];
const MESSAGE_CHANNEL_LABEL = { phone: "Phone", bleep: "Bleep", email: "Email", secure_msg: "Secure message", in_person: "In person" };
const CHANNEL_ICON = { phone: Phone, bleep: Radio, email: Mail, secure_msg: MessageSquare, in_person: Users };

export function MessageLog({ referralId }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [channel, setChannel] = useState("phone");
  const [direction, setDirection] = useState("outbound");
  const [recipient, setRecipient] = useState("");
  const [body, setBody] = useState("");

  const refresh = async () => {
    try {
      const rows = await base44.entities.ReferralMessage.list("-sent_at", 200);
      setItems(rows.filter((m) => m.referral_id === referralId));
    } finally { setLoaded(true); }
  };

  useEffect(() => { refresh(); }, [referralId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSaving(true);
    await base44.entities.ReferralMessage.create({
      referral_id: referralId,
      channel, direction,
      recipient: recipient.trim() || null,
      body: body.trim(),
      sent_at: new Date().toISOString(),
    });
    setOpen(false);
    setBody(""); setRecipient(""); setChannel("phone"); setDirection("outbound");
    setSaving(false);
    await refresh();
  };

  const onDelete = async (m) => {
    await base44.entities.ReferralMessage.delete(m.id);
    await refresh();
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Communication log</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" aria-hidden="true" /> Log message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log a message</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Channel</label>
                  <Select value={channel} onValueChange={setChannel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MESSAGE_CHANNELS.map((c) => <SelectItem key={c} value={c}>{MESSAGE_CHANNEL_LABEL[c]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Direction</label>
                  <Select value={direction} onValueChange={setDirection}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outbound">Outbound (we sent)</SelectItem>
                      <SelectItem value="inbound">Inbound (we received)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Recipient / sender</label>
                <Input value={recipient} onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Dr Smith, bleep 1234" maxLength={200} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-muted-foreground">Message body</label>
                  <TemplatePicker onInsert={(b) => setBody((prev) => prev ? `${prev}\n${b}` : b)} />
                </div>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)}
                  rows={5} maxLength={4000}
                  placeholder="Summary of what was communicated" required />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving || !body.trim()}>{saving ? "Saving…" : "Log message"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!loaded && <div className="text-sm text-muted-foreground">Loading…</div>}
      {loaded && items.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No communications logged yet. Use this to record calls, bleeps and messages to/from the referring team.
        </div>
      )}

      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((m) => {
            const Icon = CHANNEL_ICON[m.channel] || Phone;
            const DirIcon = m.direction === "outbound" ? ArrowUpRight : ArrowDownLeft;
            return (
              <li key={m.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="gap-1">
                      <Icon className="w-3 h-3" aria-hidden="true" /> {MESSAGE_CHANNEL_LABEL[m.channel]}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <DirIcon className="w-3 h-3" aria-hidden="true" /> {m.direction}
                    </Badge>
                    {m.recipient && <span>{m.direction === "outbound" ? "to " : "from "}{m.recipient}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span title={m.sent_at ? format(new Date(m.sent_at), "d MMM yyyy HH:mm") : ""}>
                      {m.sent_at ? formatDistanceToNow(new Date(m.sent_at), { addSuffix: true }) : ""}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(m)} aria-label="Delete message">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm whitespace-pre-wrap">{m.body}</div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}