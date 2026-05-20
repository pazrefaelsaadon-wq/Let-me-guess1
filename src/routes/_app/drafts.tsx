import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Trash2, Pencil } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDrafts, removeDraft, type Draft } from "@/lib/local-store";
import { Compose } from "@/components/compose";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/drafts")({ component: DraftsPage });

function DraftsPage() {
  const drafts = useDrafts();
  const [editing, setEditing] = useState<Draft | null>(null);

  return (
    <div className="h-full overflow-y-auto bg-background text-foreground">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-5">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight">Drafts</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Auto-saved as you compose. Pick up where you left off.</p>
          </div>
          <div className="text-right">
            <div className="text-[20px] font-semibold tabular-nums">{drafts.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Saved</div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
          {drafts.length === 0 ? (
            <div className="grid place-items-center py-16 text-center">
              <div className="max-w-sm px-6">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="mt-5 text-[14px] font-semibold">No drafts yet</p>
                <p className="mt-1.5 text-[12.5px] text-muted-foreground">Start a message — we'll save it here automatically.</p>
              </div>
            </div>
          ) : (
            <ul>
              {drafts.map((d) => (
                <DraftRow key={d.id} d={d} onEdit={() => setEditing(d)} />
              ))}
            </ul>
          )}
        </div>
      </div>

      <Compose open={!!editing} initial={editing ?? undefined} onClose={() => setEditing(null)} />
    </div>
  );
}

function DraftRow({ d, onEdit }: { d: Draft; onEdit: () => void }) {
  return (
    <li
      className={cn(
        "group flex cursor-pointer items-start gap-3 border-b border-border px-5 py-3 transition-colors hover:bg-accent/30",
      )}
      onClick={onEdit}
    >
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
        <FileText className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[13px] font-medium">
            {d.to || <span className="text-muted-foreground">(no recipient)</span>}
          </span>
          <span className="ml-auto shrink-0 text-[11px] text-muted-foreground tabular-nums">
            {formatDistanceToNow(new Date(d.updatedAt), { addSuffix: true })}
          </span>
        </div>
        <div className="truncate text-[13px] text-foreground">
          {d.subject || <span className="text-muted-foreground italic">(no subject)</span>}
        </div>
        <div className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">{d.body}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); removeDraft(d.id); }}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}
