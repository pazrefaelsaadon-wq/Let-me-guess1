import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Trash2, Mail } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useSent, removeSent, type LocalMessage } from "@/lib/local-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/sent")({ component: SentPage });

function SentPage() {
  const sent = useSent();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = sent.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="flex h-full min-w-0 bg-background text-foreground">
      <section className={cn("flex min-w-0 flex-1 flex-col overflow-y-auto p-5", selected && "hidden lg:flex")}>
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-5">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight">Sent</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Messages you've sent from PMail.</p>
          </div>
          <div className="text-right">
            <div className="text-[20px] font-semibold tabular-nums">{sent.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</div>
          </div>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
          {sent.length === 0 ? (
            <Empty />
          ) : (
            <ul className="flex-1 overflow-y-auto">
              {sent.map((m) => (
                <SentRow key={m.id} m={m} active={m.id === selectedId} onOpen={() => setSelectedId(m.id)} />
              ))}
            </ul>
          )}
        </div>
      </section>

      <section
        className={cn(
          "min-w-0 shrink-0 border-l border-border bg-muted/30 p-5",
          selected ? "flex w-full flex-col lg:w-[420px] xl:w-[460px]" : "hidden lg:flex lg:w-[420px] xl:w-[460px] lg:flex-col",
        )}
      >
        {selected ? <SentDetail m={selected} onBack={() => setSelectedId(null)} /> : <ReadingEmpty />}
      </section>
    </div>
  );
}

function SentRow({ m, active, onOpen }: { m: LocalMessage; active: boolean; onOpen: () => void }) {
  return (
    <li
      onClick={onOpen}
      className={cn(
        "group flex cursor-pointer items-start gap-3 border-b border-border px-5 py-3 transition-colors hover:bg-accent/30",
        active && "bg-accent/50",
      )}
    >
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-grad text-[11px] font-semibold text-white">
        <Send className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[13px] font-medium">To: {m.to}</span>
          <span className="ml-auto shrink-0 text-[11px] text-muted-foreground tabular-nums">
            {format(new Date(m.createdAt), "MMM d, h:mm a")}
          </span>
        </div>
        <div className="truncate text-[13px] text-foreground">{m.subject}</div>
        <div className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">{m.body}</div>
      </div>
    </li>
  );
}

function SentDetail({ m, onBack }: { m: LocalMessage; onBack: () => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between pb-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden">Back</Button>
        <h2 className="text-[16px] font-semibold tracking-tight">{m.subject}</h2>
        <button
          onClick={() => { removeSent(m.id); onBack(); }}
          className="ml-auto grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="text-[12px] text-muted-foreground">
        To <span className="font-mono text-foreground">{m.to}</span> · {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
      </div>
      <div className="mt-4 flex-1 min-h-0 overflow-y-auto whitespace-pre-wrap text-[13.5px] leading-relaxed text-foreground/90">
        {m.body || <span className="text-muted-foreground italic">(empty message)</span>}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="grid h-full place-items-center py-16 text-center">
      <div className="max-w-sm px-6">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Send className="h-6 w-6" />
        </div>
        <p className="mt-5 text-[14px] font-semibold">Nothing sent yet</p>
        <p className="mt-1.5 text-[12.5px] text-muted-foreground">Hit "Compose" to draft your first message.</p>
      </div>
    </div>
  );
}

function ReadingEmpty() {
  return (
    <div className="grid h-full w-full place-items-center text-center">
      <div className="max-w-xs px-6">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Mail className="h-6 w-6" />
        </div>
        <p className="mt-5 text-[14px] font-semibold">Select a message</p>
      </div>
    </div>
  );
}
