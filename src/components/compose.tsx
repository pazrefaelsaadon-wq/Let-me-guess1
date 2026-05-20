import { useEffect, useRef, useState } from "react";
import { X, Send, Paperclip, Trash2, Minimize2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  appendSent,
  upsertDraft,
  removeDraft,
  loadPrefs,
  type Draft,
} from "@/lib/local-store";
import { useMailtm } from "@/lib/mailtm-context";

type Props = {
  open: boolean;
  initial?: Partial<Draft>;
  onClose: () => void;
};

export function Compose({ open, initial, onClose }: Props) {
  const { account } = useMailtm();
  const [id] = useState(() => initial?.id ?? crypto.randomUUID());
  const [to, setTo] = useState(initial?.to ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [minimized, setMinimized] = useState(false);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setMinimized(false);
  }, [open]);

  // Auto-save draft (debounced)
  useEffect(() => {
    if (!open || !account) return;
    if (!to && !subject && !body) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const draft: Draft = {
        id,
        to,
        subject,
        body,
        from: account.address,
        createdAt: initial?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      upsertDraft(draft);
    }, 600);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [to, subject, body, id, open, account, initial?.createdAt]);

  function send() {
    if (!account) return;
    if (!to.trim()) {
      toast.error("Add a recipient");
      return;
    }
    const prefs = loadPrefs();
    const finalBody = prefs.signature
      ? `${body}\n\n— ${prefs.displayName || account.address}\n${prefs.signature}`
      : body;
    appendSent({
      id,
      to: to.trim(),
      subject: subject.trim() || "(no subject)",
      body: finalBody,
      from: account.address,
      createdAt: new Date().toISOString(),
    });
    removeDraft(id);
    toast.success("Saved to Sent", {
      description: "PMail is in receive-mode; outbound mail is stored locally.",
    });
    onClose();
  }

  function discard() {
    removeDraft(id);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed bottom-0 right-4 z-50 w-[min(560px,calc(100vw-2rem))]">
      <div className="overflow-hidden rounded-t-2xl border border-white/10 bg-card shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between border-b border-white/10 bg-accent-grad/10 px-3 py-2 text-white" style={{ background: "linear-gradient(90deg, rgb(var(--accent-from) / 0.15), rgb(var(--accent-to) / 0.15))" }}>
          <div className="px-1 text-[12.5px] font-semibold tracking-tight">New message</div>
          <div className="flex items-center gap-0.5">
            <IconBtn label="Minimize" onClick={() => setMinimized((v) => !v)}>
              <Minimize2 className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn label="Discard" onClick={discard}>
              <Trash2 className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn label="Close" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </IconBtn>
          </div>
        </div>

        {!minimized && (
          <div>
            <Field label="To">
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@domain.com"
                className="border-0 bg-transparent text-[13px] focus-visible:ring-0"
                autoFocus
              />
            </Field>
            <Field label="Subject">
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="border-0 bg-transparent text-[13px] focus-visible:ring-0"
              />
            </Field>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message…"
              rows={8}
              className="block w-full resize-none border-0 bg-transparent px-4 py-3 text-[13.5px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex items-center justify-between gap-1 border-t border-white/10 px-2 py-2">
              <div className="flex items-center gap-0.5">
                <IconBtn label="Attach"><Paperclip className="h-3.5 w-3.5" /></IconBtn>
                <IconBtn label="AI assist" onClick={() => toast.info("AI assist coming soon")}>
                  <Sparkles className="h-3.5 w-3.5" />
                </IconBtn>
              </div>
              <Button
                size="sm"
                onClick={send}
                className="h-8 gap-1.5 rounded-lg bg-accent-grad px-3 text-[12.5px] font-medium text-white shadow-accent-glow transition-transform hover:scale-[1.03]"
              >
                <Send className="h-3.5 w-3.5" /> Send
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-white/5 px-2">
      <span className="shrink-0 pl-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
    >
      {children}
    </button>
  );
}
