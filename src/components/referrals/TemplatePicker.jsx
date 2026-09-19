import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TEMPLATE_CATEGORY_LABEL = { decline: "Decline", advice: "Advice", plan: "Plan", handover: "Handover" };
const TEMPLATE_CATEGORIES = ["decline", "advice", "plan", "handover"];

export function TemplatePicker({ onInsert, category, label = "Insert template" }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    base44.entities.MessageTemplate.list()
      .then((rows) => {
        if (cancelled) return;
        const filtered = (rows ?? []).filter((t) => {
          if (category && t.category !== category) return false;
          return t.active !== false;
        });
        setItems(filtered);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => { cancelled = true; };
  }, [category]);

  const grouped = items.reduce((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, { decline: [], advice: [], plan: [], handover: [] });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-1" aria-hidden="true" />{label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-h-80 overflow-y-auto">
        {!loaded && <DropdownMenuItem disabled>Loading…</DropdownMenuItem>}
        {loaded && items.length === 0 && <DropdownMenuItem disabled>No templates yet</DropdownMenuItem>}
        {TEMPLATE_CATEGORIES.map((cat) =>
          grouped[cat]?.length ? (
            <div key={cat}>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {TEMPLATE_CATEGORY_LABEL[cat]}
              </DropdownMenuLabel>
              {grouped[cat].map((t) => (
                <DropdownMenuItem key={t.id}
                  onSelect={(e) => { e.preventDefault(); onInsert(t.body, t); }}>
                  <span className="truncate">{t.title}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </div>
          ) : null
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}