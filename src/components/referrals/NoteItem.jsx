import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function NoteItem({ note, currentUserName, canEdit, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.body ?? "");
  const [busy, setBusy] = useState(false);

  const authorName = note.author_name || "Clinician";
  const editedAt = note.edited_at || note.updated_date;
  const createdAt = note.created_date;

  const beginEdit = () => {
    setDraft(note.body ?? "");
    setEditing(true);
  };

  const save = async () => {
    if (!draft.trim()) { setEditing(false); return; }
    if (draft.trim() === note.body) { setEditing(false); return; }
    setBusy(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try { await onDelete(); } catch (e) { console.error(e); }
    finally { setBusy(false); }
  };

  return (
    <div className="text-sm border-l-2 border-primary/40 pl-3 py-1">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="text-xs font-medium flex items-center gap-2">
          {authorName}
          {note.author_name === currentUserName && (
            <span className="text-[10px] text-muted-foreground">(you)</span>
          )}
        </span>
        <span
          className="text-[10px] text-muted-foreground whitespace-nowrap"
          title={createdAt ? format(new Date(createdAt), "dd/MM/yyyy HH:mm") : ""}
        >
          {createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : ""}
          {editedAt && editedAt !== createdAt ? " · edited" : ""}
        </span>
      </div>
      {!editing ? (
        <p className="text-sm whitespace-pre-wrap break-words">{note.body}</p>
      ) : (
        <div className="space-y-2">
          <Textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={save} disabled={busy || !draft.trim()}>
              <Save className="w-3.5 h-3.5 mr-1" />
              {busy ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              <X className="w-3.5 h-3.5 mr-1" /> Cancel
            </Button>
          </div>
        </div>
      )}
      {canEdit && !editing && (
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={beginEdit}>
            <Pencil className="w-3 h-3 mr-1" /> Edit
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-destructive" onClick={remove} disabled={busy}>
            <Trash2 className="w-3 h-3 mr-1" /> Delete
          </Button>
        </div>
      )}
    </div>
  );
}