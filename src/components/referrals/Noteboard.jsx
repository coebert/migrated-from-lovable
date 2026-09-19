import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { NoteItem } from "@/components/referrals/NoteItem";

const NOTE_BODY_MAX_LENGTH = 4000;

export function Noteboard({ referralId, currentUserName }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const rows = await base44.entities.ReferralNote.list("-created_date", 200);
    setNotes(rows.filter((n) => n.referral_id === referralId));
    setLoading(false);
  };

  useEffect(() => { load(); }, [referralId]);

  const post = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setPosting(true);
    await base44.entities.ReferralNote.create({
      referral_id: referralId,
      body: trimmed,
      author_name: currentUserName || "Clinician",
    });
    setBody("");
    setPosting(false);
    await load();
  };

  const saveNote = async (note, newBody) => {
    await base44.entities.ReferralNote.update(note.id, {
      body: newBody,
      edited_at: new Date().toISOString(),
    });
    await load();
  };

  const deleteNote = async (note) => {
    await base44.entities.ReferralNote.delete(note.id);
    await load();
  };

  const trimmedLength = body.trim().length;
  const overLimit = trimmedLength > NOTE_BODY_MAX_LENGTH;
  const canSubmit = trimmedLength > 0 && !overLimit && !posting;

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          Noteboard
        </h2>
        <span className="text-xs text-muted-foreground">{notes.length} note{notes.length === 1 ? "" : "s"}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Notes are visible to all team members on this referral.
      </p>

      <div className="space-y-2">
        <Textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="e.g. seen in ED resus, awaiting bloods, for re-review at 6pm"
          aria-invalid={overLimit || undefined}
        />
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[11px] ${overLimit ? "text-destructive" : "text-muted-foreground"}`}>
            {overLimit
              ? `Note is too long — trim ${trimmedLength - NOTE_BODY_MAX_LENGTH} character${trimmedLength - NOTE_BODY_MAX_LENGTH === 1 ? "" : "s"}.`
              : "Document updates for the team."}
            {trimmedLength > NOTE_BODY_MAX_LENGTH - 200 && !overLimit && (
              <span className="ml-2 tabular-nums opacity-70">{trimmedLength}/{NOTE_BODY_MAX_LENGTH}</span>
            )}
          </span>
          <Button size="sm" onClick={post} disabled={!canSubmit}>
            {posting && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
            Post note
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-[520px] overflow-auto">
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!loading && notes.length === 0 && (
          <EmptyState
            icon={MessageSquare}
            title="No notes yet"
            description="Post a note above to share updates with the team."
            compact
          />
        )}
        {notes.map((n) => (
          <div key={n.id} className="group">
            <NoteItem
              note={n}
              currentUserName={currentUserName}
              canEdit={true}
              onSave={(body) => saveNote(n, body)}
              onDelete={() => deleteNote(n)}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}