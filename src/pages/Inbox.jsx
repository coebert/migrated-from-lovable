import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Check, ChevronLeft, ChevronRight, Search, X, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const KIND_LABEL = {
  new: "New referral",
  status: "Status change",
  note: "New note",
  updated: "Referral updated",
  warning: "Warning",
};

const PAGE_SIZE = 25;

export default function Inbox() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const load = async () => {
    setLoading(true);
    const items = await base44.entities.Notification.list("-created_date", 500);
    setItems(items);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = items;
    if (tab === "unread") result = result.filter((n) => !n.read_at);
    if (kindFilter !== "all") result = result.filter((n) => n.kind === kindFilter);
    if (q) {
      const needle = q.toLowerCase();
      result = result.filter((n) => n.message?.toLowerCase().includes(needle));
    }
    if (from) {
      const fromTs = new Date(from + "T00:00:00").getTime();
      result = result.filter((n) => new Date(n.created_date).getTime() >= fromTs);
    }
    if (to) {
      const toTs = new Date(to + "T23:59:59").getTime();
      result = result.filter((n) => new Date(n.created_date).getTime() <= toTs);
    }
    result = [...result].sort((a, b) => {
      const da = new Date(a.created_date).getTime();
      const db = new Date(b.created_date).getTime();
      return sort === "newest" ? db - da : da - db;
    });
    return result;
  }, [items, tab, q, kindFilter, from, to, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const visibleIds = visible.map((n) => n.id);
  const allVisibleSelected = visible.length > 0 && visible.every((n) => selected.has(n.id));
  const someVisibleSelected = visible.some((n) => selected.has(n.id)) && !allVisibleSelected;

  const hasFilters = q || kindFilter !== "all" || from || to;
  const unreadCount = items.filter((n) => !n.read_at).length;

  const markRead = async (id) => {
    setBusy(true);
    await base44.entities.Notification.update(id, { read_at: new Date().toISOString() });
    setItems((cur) => cur.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    setBusy(false);
  };

  const markUnread = async (id) => {
    setBusy(true);
    await base44.entities.Notification.update(id, { read_at: null });
    setItems((cur) => cur.map((n) => n.id === id ? { ...n, read_at: null } : n));
    setBusy(false);
  };

  const toggleOne = (id, checked) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const toggleAllVisible = (checked) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (checked) visibleIds.forEach((id) => next.add(id));
      else visibleIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const bulkMark = async (asRead) => {
    setBusy(true);
    const ids = [...selected];
    const val = asRead ? new Date().toISOString() : null;
    await base44.entities.Notification.bulkUpdate(ids.map((id) => ({ id, read_at: val })));
    setItems((cur) => cur.map((n) => selected.has(n.id) ? { ...n, read_at: val } : n));
    setSelected(new Set());
    setBusy(false);
  };

  const clearFilters = () => {
    setQ("");
    setKindFilter("all");
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <p className="text-sm text-muted-foreground">
          {items.length} notification{items.length === 1 ? "" : "s"} · {unreadCount} unread
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4 space-y-3">
          <Card className="p-3 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search notifications…"
                className="pl-8 pr-8"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={kindFilter} onValueChange={(v) => { setKindFilter(v); setPage(1); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="new">New referral</SelectItem>
                    <SelectItem value="status">Status change</SelectItem>
                    <SelectItem value="note">New note</SelectItem>
                    <SelectItem value="updated">Referral updated</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">From</Label>
                <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
              </div>
              <div>
                <Label className="text-xs">To</Label>
                <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
              </div>
              <div>
                <Label className="text-xs">Sort</Label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hasFilters && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{filtered.length} match{filtered.length === 1 ? "" : "es"}</span>
                <Button variant="ghost" size="sm" className="h-7" onClick={clearFilters}>
                  <X className="w-3 h-3 mr-1" /> Clear filters
                </Button>
              </div>
            )}
          </Card>

          {visible.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap px-1">
              <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                  onChange={(e) => toggleAllVisible(e.target.checked)}
                  className="rounded border-border"
                />
                {selected.size > 0 ? `${selected.size} selected` : "Select page"}
              </label>
              {selected.size > 0 && (
                <div className="flex items-center gap-2 ml-auto">
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => bulkMark(true)}>
                    <Check className="w-4 h-4 mr-1" /> Mark read
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => bulkMark(false)}>
                    Mark unread
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} aria-label="Clear selection">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          <Card className="divide-y">
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">Loading…</div>
            ) : visible.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                {hasFilters
                  ? "No notifications match your filters"
                  : tab === "unread"
                  ? "No unread notifications — you're all caught up."
                  : "No notifications yet."}
              </div>
            ) : (
              visible.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 transition-colors duration-150 hover:bg-accent ${!n.read_at ? "bg-accent/40" : ""}`}
                >
                  <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(n.id)}
                      onChange={(e) => toggleOne(n.id, e.target.checked)}
                      className="rounded border-border"
                    />
                  </div>
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${n.read_at ? "bg-muted-foreground/30" : "bg-primary"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-[10px]">{KIND_LABEL[n.kind] ?? n.kind}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(n.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-sm mt-1 break-words">{n.message}</div>
                      <div className="flex items-center gap-2 mt-2">
                        {n.read_at ? (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={busy} onClick={() => markUnread(n.id)}>
                            Mark unread
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={busy} onClick={() => markRead(n.id)}>
                            <Check className="w-3 h-3 mr-1" /> Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {n.referral_id && (
                    <div className="pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Open referral"
                        onClick={() => {
                          if (!n.read_at) markRead(n.id);
                          window.location.href = `/referrals`;
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </Card>

          {filtered.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-1">
              <span>
                {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <span className="px-2">Page {currentPage} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}