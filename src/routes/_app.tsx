import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { Mail, Inbox, LogOut, Copy, Check, Plus, ChevronsUpDown, Trash2, KeyRound, Eye, EyeOff, Send, FileText, Settings as SettingsIcon, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMailtm } from "@/lib/mailtm-context";
import { loadStore } from "@/lib/mailtm";
import { Compose } from "@/components/compose";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && loadStore().accounts.length === 0) {
      throw redirect({ to: "/" });
    }
  },
  component: AppLayout,
});

const NAV = [
  { to: "/inbox" as const, label: "Inbox", icon: Inbox },
  { to: "/sent" as const, label: "Sent", icon: Send },
  { to: "/drafts" as const, label: "Drafts", icon: FileText },
  { to: "/settings" as const, label: "Settings", icon: SettingsIcon },
];

function AppLayout() {
  const { account, accounts, switchTo, remove, create, login, signOut } = useMailtm();
  const nav = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [local, setLocal] = useState("");
  const [createPwd, setCreatePwd] = useState("");
  const [loginAddr, setLoginAddr] = useState("");
  const [loginPwd, setLoginPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [credsOpen, setCredsOpen] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [copied, setCopied] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    const handler = () => setComposeOpen(true);
    window.addEventListener("pmail-compose", handler);
    return () => window.removeEventListener("pmail-compose", handler);
  }, []);

  function copy() {
    if (!account) return;
    navigator.clipboard.writeText(account.address);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 1500);
  }

  async function addAccount() {
    setBusy(true);
    try {
      await create(local.trim() || undefined, createPwd.trim() || undefined);
      toast.success("New inbox added");
      setAddOpen(false);
      setLocal("");
      setCreatePwd("");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to create inbox");
    } finally {
      setBusy(false);
    }
  }

  async function loginExisting() {
    if (!loginAddr.trim() || !loginPwd) {
      toast.error("Enter address and password");
      return;
    }
    setBusy(true);
    try {
      await login(loginAddr.trim(), loginPwd);
      toast.success("Signed in");
      setAddOpen(false);
      setLoginAddr("");
      setLoginPwd("");
    } catch (e: any) {
      toast.error(e.message ?? "Login failed — check address and password");
    } finally {
      setBusy(false);
    }
  }

  function handleRemove(id: string) {
    const remaining = accounts.length - 1;
    remove(id);
    toast.success("Inbox removed");
    if (remaining === 0) nav({ to: "/" });
  }

  function copyCreds() {
    if (!account) return;
    navigator.clipboard.writeText(`${account.address}\n${account.password}`);
    toast.success("Credentials copied");
  }

  return (
    <div className="flex h-screen bg-[oklch(0.13_0.02_265)]">
      <aside className="flex w-56 shrink-0 flex-col border-r border-white/5 bg-[oklch(0.16_0.02_265)] text-white">
        <Link to="/" className="flex items-center gap-2.5 px-5 pt-5 pb-6">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_0_20px_-4px_rgba(168,85,247,0.7)]">
            <Mail className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Pmail</span>
        </Link>

        <div className="px-3 pb-3">
          <button
            onClick={() => setComposeOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-grad px-3 py-2 text-[13px] font-semibold text-white shadow-accent-glow transition-transform hover:scale-[1.02]"
          >
            <Pencil className="h-3.5 w-3.5" /> Compose
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <SideLink key={item.to} to={item.to} icon={<item.icon className="h-4 w-4" />} label={item.label} />
          ))}
        </nav>

        <div className="border-t border-white/5 p-3 space-y-1">
          <Link
            to="/settings"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-white/70 hover:bg-white/5 hover:text-white"
          >
            <SettingsIcon className="h-4 w-4" /> Settings
          </Link>
        </div>
      </aside>

      <main className="flex flex-1 min-w-0 flex-col overflow-hidden">
        {/* Top app bar matching screenshot */}
        <header className="flex h-14 shrink-0 items-center gap-1 border-b border-white/5 bg-[oklch(0.16_0.02_265)] px-5 text-white">
          {NAV.map((item) => (
            <TopTab key={item.to} to={item.to} label={item.label} />
          ))}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={copy}
              className="hidden items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono text-white/70 transition-colors hover:bg-white/10 hover:text-white md:inline-flex"
              title="Copy address"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span className="max-w-[180px] truncate">{account?.address ?? "—"}</span>
            </button>
            <button
              onClick={() => setCredsOpen(true)}
              className="grid h-8 w-8 place-items-center rounded-md text-white/60 hover:bg-white/5 hover:text-white"
              aria-label="Show password"
            >
              <KeyRound className="h-4 w-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="grid h-8 w-8 place-items-center rounded-md text-white/60 hover:bg-white/5 hover:text-white" aria-label="Account">
                  <ChevronsUpDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 border-white/10 bg-[oklch(0.18_0.02_265)] text-white">
                <DropdownMenuLabel>Switch inbox</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {accounts.map((a) => (
                  <DropdownMenuItem
                    key={a.id}
                    onSelect={(e) => { e.preventDefault(); switchTo(a.id); }}
                    className="flex items-center gap-2 focus:bg-white/10"
                  >
                    <Check className={cn("h-4 w-4 shrink-0", a.id === account?.id ? "opacity-100 text-violet-400" : "opacity-0")} />
                    <span className="flex-1 truncate font-mono text-xs">{a.address}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(a.id); }}
                      className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-rose-400"
                      aria-label="Remove inbox"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setAddOpen(true); }} className="gap-2 focus:bg-white/10">
                  <Plus className="h-4 w-4" /> Add another inbox
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); signOut(); nav({ to: "/" }); }} className="gap-2 text-rose-300 focus:bg-white/10 focus:text-rose-300">
                  <LogOut className="h-4 w-4" /> Forget all inboxes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-semibold text-white">
              {(account?.address?.[0] ?? "U").toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-hidden">
          <Outlet />
        </div>
      </main>

      <Compose open={composeOpen} onClose={() => setComposeOpen(false)} />


      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="border-white/10 bg-[oklch(0.18_0.02_265)] text-white">
          <DialogHeader>
            <DialogTitle>Add an inbox</DialogTitle>
            <DialogDescription className="text-white/60">
              Create a new inbox or sign in to one you already have.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger value="create">Create new</TabsTrigger>
              <TabsTrigger value="login">Sign in</TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-white/70">Address (optional)</Label>
                <Input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="your-name" autoFocus className="border-white/10 bg-white/5" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/70">Password (optional)</Label>
                <Input
                  type="text"
                  value={createPwd}
                  onChange={(e) => setCreatePwd(e.target.value)}
                  placeholder="Leave blank for a random one"
                  onKeyDown={(e) => e.key === "Enter" && !busy && addAccount()}
                  className="border-white/10 bg-white/5"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setAddOpen(false)} disabled={busy}>Cancel</Button>
                <Button onClick={addAccount} disabled={busy} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
                  {busy ? "Creating…" : "Create inbox"}
                </Button>
              </DialogFooter>
            </TabsContent>
            <TabsContent value="login" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-white/70">Email address</Label>
                <Input value={loginAddr} onChange={(e) => setLoginAddr(e.target.value)} placeholder="name@domain.com" autoComplete="email" className="border-white/10 bg-white/5" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/70">Password</Label>
                <Input
                  type="password"
                  value={loginPwd}
                  onChange={(e) => setLoginPwd(e.target.value)}
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && !busy && loginExisting()}
                  className="border-white/10 bg-white/5"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setAddOpen(false)} disabled={busy}>Cancel</Button>
                <Button onClick={loginExisting} disabled={busy} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
                  {busy ? "Signing in…" : "Sign in"}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={credsOpen} onOpenChange={setCredsOpen}>
        <DialogContent className="border-white/10 bg-[oklch(0.18_0.02_265)] text-white">
          <DialogHeader>
            <DialogTitle>Inbox credentials</DialogTitle>
            <DialogDescription className="text-white/60">Save these to sign in from anywhere.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/70">Address</Label>
              <Input readOnly value={account?.address ?? ""} className="border-white/10 bg-white/5 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/70">Password</Label>
              <div className="relative">
                <Input readOnly type={showPwd ? "text" : "password"} value={account?.password ?? ""} className="border-white/10 bg-white/5 pr-9 font-mono" />
                <button onClick={() => setShowPwd((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white" aria-label="Toggle password">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCredsOpen(false)}>Close</Button>
            <Button onClick={copyCreds} className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
              <Copy className="h-4 w-4" /> Copy both
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SideLink({ to, icon, label }: { to: "/inbox" | "/sent" | "/drafts" | "/settings"; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white"
      activeProps={{ className: "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium bg-white/8 text-white" }}
    >
      {icon}
      {label}
    </Link>
  );
}

function TopTab({ to, label }: { to: "/inbox" | "/sent" | "/drafts" | "/settings"; label: string }) {
  return (
    <Link
      to={to}
      className="relative rounded-md px-3 py-1.5 text-[13px] font-medium text-white/55 transition-colors hover:text-white"
      activeProps={{ className: "relative rounded-md px-3 py-1.5 text-[13px] font-semibold text-white after:absolute after:inset-x-3 after:-bottom-[15px] after:h-[2px] after:rounded-full after:bg-gradient-to-r after:from-violet-400 after:to-fuchsia-400" }}
    >
      {label}
    </Link>
  );
}
