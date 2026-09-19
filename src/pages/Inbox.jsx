import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen } from "lucide-react";
import { MESSAGES } from "@/lib/sampleData";

export default function Inbox() {
  const [items, setItems] = useState(MESSAGES);
  const [openId, setOpenId] = useState(null);

  const unread = items.filter((m) => !m.read).length;

  const open = (id) => {
    setOpenId(openId === id ? null : id);
    setItems((cur) => cur.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <p className="text-sm text-muted-foreground">{items.length} messages · {unread} unread</p>
      </div>
      <div className="space-y-2">
        {items.map((m) => {
          const isOpen = openId === m.id;
          return (
            <Card
              key={m.id}
              className="p-4 cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => open(m.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${m.read ? "text-muted-foreground" : "text-primary"}`}>
                  {m.read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm truncate ${m.read ? "font-normal" : "font-semibold"}`}>
                      {m.from}
                    </span>
                    {!m.read && <Badge className="text-[10px] h-4 px-1.5">New</Badge>}
                    <span className="ml-auto text-[11px] text-muted-foreground font-mono shrink-0">
                      {new Date(m.received_at).toLocaleString(undefined, {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className={`text-sm truncate ${m.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                    {m.subject}
                  </div>
                  {isOpen && (
                    <div className="mt-2 pt-2 border-t border-border text-sm text-muted-foreground whitespace-pre-wrap">
                      {m.body}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}