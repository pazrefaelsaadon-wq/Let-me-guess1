import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import {
  Trash2, RefreshCw, Inbox as InboxIcon, Send, Flag, Sparkles,
  Bold, Italic, Underline, Link as LinkIcon, List, ListOrdered, MoreHorizontal,
  Paperclip, Smile, Image as ImageIcon, ChevronLeft, MailOpen, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMailtm } from "@/lib/mailtm-context";
import {
  listMessages, getMessage, deleteMessage, markRead,
  type MailtmMessage, type MailtmFullMessage,
} from "@/lib/mailtm";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/inbox")({ component: InboxPage });

function smartTime(d: string) {
  const date = new Date(d);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

function InboxPage() {
  const { account } = useMailtm();
  const qc = useQueryClient();
  const token = account?.token;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [reply, setReply] = useState("");

  const messagesQ = useQuery({
    queryKey: ["mailtm-messages", account?.address],
    queryFn: () => listMessages(token!),
    enabled: !!token,
    refetchInterval: 8000,
  });

  const fullQ = useQuery({
    queryKey: ["mailtm-message", selectedId],
    queryFn: () => getMessage(token!, selectedId!),
    enabled: !!token && !!selectedId,
  });

  useEffect(() => {
    if (!token || !selectedId) return;
    const m = messagesQ.data?.find((x) => x.id === selectedId);
    if (m && !m.seen) {
      markRead(token, selectedId).then(() =>
        qc.invalidateQueries({ queryKey: ["mailtm-messages"] }),
      );
    }
  }, [selectedId, token, messagesQ.data, qc]);

  const list = messagesQ.data ?? [];
  const unreadCount = useMemo(() => list.filter((m) => !m.seen).length, [list]);

  async function handleDelete(id: string) {
    if (!token) return;
    try {
      await deleteMessage(token, id);
      if (selectedId === id) setSelectedId(null);
      qc.invalidateQueries({ queryKey: ["mailtm-messages"] });
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e.message ?? "Delete failed");
    }
  }

  function toggleCheck(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCheckAll() {
    if (checked.size === list.length) setChecked(new Set());
    else setChecked(new Set(list.map((m) => m.id)));
  }

  return (
    <div className="flex h-full min-w-0 bg-[oklch(0.13_0.02_265)] text-white">
      {/* MAIN COLUMN — welcome + list */}
      <section
        className={cn(
          "flex min-w-0 flex-1 flex-col overflow-y-auto p-5",
          selectedId && "hidden lg:flex",
        )}
      >
        {/* Welcome banner */}
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] px-6 py-5 backdrop-blur">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight">
              Welcome, <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">User</span>!
            </h1>
            <p className="mt-0.5 text-[13px] text-white/55">Your Pmail Hub.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <Stat icon={<MailOpen className="h-4 w-4" />} value={unreadCount} label="Unread" />
            <Stat icon={<Send className="h-4 w-4" />} value={list.length} label="Total" />
            <Stat icon={<Flag className="h-4 w-4" />} value={0} label="Flagged" />
          </div>
        </div>

        {/* Inbox card */}
        <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.17_0.02_265)]">
          <header className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] font-semibold tracking-tight">Inbox</h2>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/70 tabular-nums">
                {list.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => qc.invalidateQueries({ queryKey: ["mailtm-messages"] })}
                className="h-8 w-8 text-white/60 hover:bg-white/5 hover:text-white"
                aria-label="Refresh"
              >
                <RefreshCw className={cn("h-4 w-4", messagesQ.isFetching && "animate-spin")} />
              </Button>
              <Button
                size="sm"
                className="ml-1 h-8 gap-1.5 rounded-lg bg-accent-grad px-3 text-[12.5px] font-medium text-white shadow-accent-glow transition-all hover:scale-[1.03]"
                onClick={() => window.dispatchEvent(new CustomEvent("pmail-compose"))}
              >
                <Pencil className="h-3.5 w-3.5" /> Compose New Email
              </Button>
            </div>
          </header>

          {/* Column headers */}
          <div className="grid grid-cols-[40px_minmax(180px,1.2fr)_minmax(0,2fr)_90px] items-center gap-3 border-b border-white/5 px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-white/40">
            <div>
              <input
                type="checkbox"
                checked={list.length > 0 && checked.size === list.length}
                onChange={toggleCheckAll}
                className="h-3.5 w-3.5 cursor-pointer accent-violet-500"
                aria-label="Select all"
              />
            </div>
            <div>Sender</div>
            <div>Subject</div>
            <div className="text-right">Timestamp</div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {messagesQ.isLoading ? (
              <SkeletonList />
            ) : messagesQ.error ? (
              <div className="p-6 text-sm text-rose-300">{(messagesQ.error as Error).message}</div>
            ) : list.length === 0 ? (
              <EmptyState />
            ) : (
              <ul>
                {list.map((m) => (
                  <Row
                    key={m.id}
                    m={m}
                    active={m.id === selectedId}
                    isChecked={checked.has(m.id)}
                    onCheck={() => toggleCheck(m.id)}
                    onOpen={() => setSelectedId(m.id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* READING PANE */}
      <section
        className={cn(
          "min-w-0 shrink-0 border-l border-white/10 bg-[oklch(0.16_0.02_265)] p-5",
          selectedId
            ? "flex w-full flex-col lg:w-[420px] xl:w-[460px]"
            : "hidden lg:flex lg:w-[420px] xl:w-[460px] lg:flex-col",
        )}
      >
        {selectedId ? (
          <MessageView
            key={selectedId}
            msg={fullQ.data}
            loading={fullQ.isLoading}
            reply={reply}
            setReply={setReply}
            onBack={() => setSelectedId(null)}
            onDelete={() => handleDelete(selectedId)}
          />
        ) : (
          <ReadingEmpty />
        )}
      </section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2 sm:px-3">
      <div className="text-white/60">{icon}</div>
      <div className="text-[15px] font-semibold tabular-nums leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-white/45">{label}</div>
    </div>
  );
}

function Row({
  m, active, isChecked, onCheck, onOpen,
}: {
  m: MailtmMessage;
  active: boolean;
  isChecked: boolean;
  onCheck: () => void;
  onOpen: () => void;
}) {
  const unread = !m.seen;
  return (
    <li
      onClick={onOpen}
      className={cn(
        "group relative grid cursor-pointer grid-cols-[40px_minmax(180px,1.2fr)_minmax(0,2fr)_90px] items-center gap-3 border-b border-white/5 px-5 py-3 transition-colors",
        "hover:bg-white/[0.04]",
        active && "bg-violet-500/10",
      )}
    >
      {active && <span className="absolute inset-y-1 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-violet-400 to-fuchsia-400" />}
      <div onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onCheck}
          className="h-3.5 w-3.5 cursor-pointer accent-violet-500"
          aria-label="Select message"
        />
      </div>

      <div className="flex items-center gap-2.5 min-w-0">
        {unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />}
        <div className="min-w-0">
          <div className={cn("truncate text-[13px]", unread ? "font-semibold text-white" : "font-medium text-white/85")}>
            {m.from?.name?.trim() || m.from?.address || "Unknown"}
          </div>
          <div className="truncate font-mono text-[10.5px] text-white/40">
            {m.from?.address}
          </div>
        </div>
      </div>

      <div className={cn("truncate text-[13px]", unread ? "font-medium text-white" : "text-white/70")}>
        {m.subject || "(no subject)"}
      </div>

      <div className="text-right text-[11.5px] font-medium text-white/50 tabular-nums">
        {smartTime(m.createdAt)}
      </div>
    </li>
  );
}

function MessageView({
  msg, loading, reply, setReply, onBack, onDelete,
}: {
  msg: MailtmFullMessage | undefined;
  loading: boolean;
  reply: string;
  setReply: (v: string) => void;
  onBack: () => void;
  onDelete: () => void;
}) {
  if (loading || !msg) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="h-8 w-2/3 animate-pulse rounded bg-white/5" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
        <div className="space-y-2 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3.5 animate-pulse rounded bg-white/5" style={{ width: `${92 - i * 8}%` }} />
          ))}
        </div>
      </div>
    );
  }

  const initial = (msg.from?.name || msg.from?.address || "?")[0]?.toUpperCase();

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Sender header */}
      <div className="flex items-start gap-3 pb-4">
        <Button size="icon" variant="ghost" onClick={onBack} className="-ml-2 h-8 w-8 text-white/60 hover:bg-white/5 hover:text-white lg:hidden" aria-label="Back">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[13px] font-semibold text-white">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold">{msg.from?.name || msg.from?.address}</div>
          <div className="truncate font-mono text-[11px] text-white/45">{msg.from?.address}</div>
        </div>
        <button className="grid h-8 w-8 place-items-center rounded-md text-white/50 hover:bg-white/5 hover:text-white" aria-label="More">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Subject */}
      <h2 className="text-[17px] font-semibold leading-snug">{msg.subject || "(no subject)"}</h2>

      {/* Body — scrollable */}
      <div className="mt-3 flex-1 min-h-0 overflow-y-auto pr-1">
        {msg.html && msg.html.length > 0 ? (
          <iframe
            title="Email content"
            srcDoc={msg.html.join("")}
            sandbox=""
            className="h-[50vh] w-full rounded-lg border border-white/10 bg-white"
          />
        ) : (
          <div className="whitespace-pre-wrap text-[13.5px] leading-[1.7] text-white/80">{msg.text}</div>
        )}
      </div>

      {/* Reply composer */}
      <div className="mt-4 shrink-0 rounded-xl border border-white/10 bg-[oklch(0.19_0.02_265)]">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 border-b border-white/10 px-2 py-1.5">
          <ToolBtn label="Bold"><Bold className="h-3.5 w-3.5" /></ToolBtn>
          <ToolBtn label="Italic"><Italic className="h-3.5 w-3.5" /></ToolBtn>
          <ToolBtn label="Underline"><Underline className="h-3.5 w-3.5" /></ToolBtn>
          <div className="mx-1 h-4 w-px bg-white/10" />
          <ToolBtn label="Link"><LinkIcon className="h-3.5 w-3.5" /></ToolBtn>
          <ToolBtn label="Bullets"><List className="h-3.5 w-3.5" /></ToolBtn>
          <ToolBtn label="Numbered"><ListOrdered className="h-3.5 w-3.5" /></ToolBtn>
          <ToolBtn label="More"><MoreHorizontal className="h-3.5 w-3.5" /></ToolBtn>
        </div>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Here your prevect text here!"
          className="block w-full resize-none border-0 bg-transparent px-3 py-2.5 text-[13px] text-white placeholder:text-white/35 focus:outline-none"
          rows={3}
        />
        <div className="flex items-center justify-between gap-1 border-t border-white/10 px-2 py-1.5">
          <div className="flex items-center gap-0.5">
            <ToolBtn label="Attach"><Paperclip className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn label="Emoji"><Smile className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn label="Image"><ImageIcon className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn label="AI" onClick={() => toast.info("AI assist coming soon")}>
              <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            </ToolBtn>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onDelete}
              className="grid h-7 w-7 place-items-center rounded-md text-white/50 hover:bg-white/5 hover:text-rose-300"
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => toast.info("Sending not available — receive-only inbox")}
              className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_0_16px_-4px_rgba(168,85,247,0.8)] transition-transform hover:scale-105"
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center rounded-md text-white/55 transition-colors hover:bg-white/5 hover:text-white"
    >
      {children}
    </button>
  );
}

function SkeletonList() {
  return (
    <ul>
      {Array.from({ length: 7 }).map((_, i) => (
        <li key={i} className="grid grid-cols-[40px_minmax(180px,1.2fr)_minmax(0,2fr)_90px] items-center gap-3 border-b border-white/5 px-5 py-3.5">
          <div className="h-3.5 w-3.5 animate-pulse rounded bg-white/5" />
          <div className="space-y-1.5">
            <div className="h-3 w-32 animate-pulse rounded bg-white/8" />
            <div className="h-2.5 w-40 animate-pulse rounded bg-white/5" />
          </div>
          <div className="h-3 w-3/4 animate-pulse rounded bg-white/8" />
          <div className="ml-auto h-3 w-12 animate-pulse rounded bg-white/5" />
        </li>
      ))}
    </ul>
  );
}

function ReadingEmpty() {
  return (
    <div className="grid h-full w-full place-items-center text-center">
      <div className="max-w-xs px-6 animate-fade-in">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-white/70">
          <MailOpen className="h-6 w-6" />
        </div>
        <p className="mt-5 text-[14px] font-semibold text-white">Select a message</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/50">
          Pick a conversation from the list to read it here.
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid h-full place-items-center py-16 text-center">
      <div className="max-w-sm px-6 animate-fade-in">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-white/70">
          <InboxIcon className="h-6 w-6" />
        </div>
        <p className="mt-5 text-[14px] font-semibold text-white">Inbox zero</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/50">
          You're all caught up. New mail lands here within seconds.
        </p>
      </div>
    </div>
  );
}
