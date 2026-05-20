import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Mail, Inbox, Zap, ShieldCheck, Loader2, LogIn, ArrowRight, Sparkles,
  Lock, Globe, Infinity as InfinityIcon, Clock, Check, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useMailtm } from "@/lib/mailtm-context";
import { loadStore } from "@/lib/mailtm";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && loadStore().accounts.length > 0) {
      throw redirect({ to: "/inbox" });
    }
  },
  component: Landing,
  head: () => ({
    meta: [
      { title: "PMail — A real inbox in one click. Free forever." },
      {
        name: "description",
        content:
          "PMail gives you a real, working email address in seconds. Free, no signup, unlimited storage. Receive verification codes from anywhere.",
      },
    ],
  }),
});

function Landing() {
  const { account, create, login, loading } = useMailtm();
  const nav = useNavigate();
  const [local, setLocal] = useState("");
  const [busy, setBusy] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginAddr, setLoginAddr] = useState("");
  const [loginPwd, setLoginPwd] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function go() {
    setBusy(true);
    try {
      await create(local.trim() || undefined);
      toast.success("Inbox ready!");
      nav({ to: "/inbox" });
    } catch (e: any) {
      toast.error(e.message ?? "Could not create inbox");
    } finally {
      setBusy(false);
    }
  }

  async function doLogin() {
    if (!loginAddr.trim() || !loginPwd) {
      toast.error("Enter address and password");
      return;
    }
    setBusy(true);
    try {
      await login(loginAddr.trim(), loginPwd);
      toast.success("Signed in");
      setLoginOpen(false);
      nav({ to: "/inbox" });
    } catch (e: any) {
      toast.error(e.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[oklch(0.13_0.02_265)] text-foreground">
      {/* Ambient background */}
      <BackgroundFX />

      {/* Floating glass nav */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        <nav
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 backdrop-blur-xl transition-all duration-300 ${
            scrolled ? "h-12 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]" : "h-14"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="relative grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_0_20px_-4px_rgba(168,85,247,0.7)]">
              <Mail className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">PMail</span>
          </div>
          <div className="hidden items-center gap-1 md:flex">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#showcase">Product</NavLink>
            <NavLink href="#testimonials">Loved by</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-[13px] text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setLoginOpen(true)}
            >
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </Button>
            <Button
              size="sm"
              onClick={() => document.getElementById("get-inbox")?.scrollIntoView({ behavior: "smooth" })}
              className="h-8 gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-[13px] font-medium text-white shadow-[0_0_24px_-6px_rgba(168,85,247,0.8)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_32px_-4px_rgba(168,85,247,0.9)]"
            >
              Get inbox <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </nav>
      </header>

      <main className="relative">
        {/* HERO */}
        <section className="relative mx-auto max-w-6xl px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Free forever · Unlimited storage
            </div>

            <h1 className="mt-7 text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
              The inbox that
              <br />
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                just works.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-white/60">
              A real email address in one click. No signup. No tracking. Use it to
              receive verification codes, sign up for anything, and keep your real
              inbox clean — forever.
            </p>

            {loading ? (
              <div className="mt-10 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-white/50" />
              </div>
            ) : account ? (
              <div
                id="get-inbox"
                className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left backdrop-blur-xl"
              >
                <div className="text-[11px] uppercase tracking-widest text-white/50">
                  Your inbox
                </div>
                <div className="mt-1 truncate font-mono text-lg font-semibold text-white">
                  {account.address}
                </div>
                <Button
                  onClick={() => nav({ to: "/inbox" })}
                  size="lg"
                  className="mt-5 w-full gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_32px_-8px_rgba(168,85,247,0.8)] transition-all hover:scale-[1.02]"
                >
                  <Inbox className="h-4 w-4" /> Open inbox
                </Button>
              </div>
            ) : (
              <div id="get-inbox" className="mx-auto mt-10 w-full max-w-md">
                <div className="group relative">
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 opacity-40 blur-lg transition-opacity group-focus-within:opacity-70" />
                  <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-[oklch(0.18_0.02_265)] p-1.5 backdrop-blur">
                    <Input
                      value={local}
                      onChange={(e) => setLocal(e.target.value)}
                      placeholder="your-name (optional)"
                      className="h-10 border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0"
                      onKeyDown={(e) => e.key === "Enter" && go()}
                    />
                    <Button
                      onClick={go}
                      disabled={busy}
                      className="h-10 gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-white shadow-[0_0_24px_-6px_rgba(168,85,247,0.8)] transition-all hover:scale-[1.03]"
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Get inbox
                    </Button>
                  </div>
                </div>
                <p className="mt-3 text-xs text-white/40">
                  Real address. Real delivery. Saved to this browser so it's yours next time.
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-white/50">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> No tracking</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Works in 2 seconds</span>
            </div>
          </div>

          {/* Hero product preview */}
          <div id="showcase" className="relative mx-auto mt-20 max-w-5xl">
            <div className="absolute -inset-x-10 -inset-y-6 bg-gradient-to-b from-violet-500/20 via-fuchsia-500/10 to-transparent blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-1.5 shadow-[0_40px_120px_-30px_rgba(168,85,247,0.4)] backdrop-blur-xl">
              <MockInbox />
            </div>
          </div>
        </section>

        {/* Marquee */}
        <section className="relative border-y border-white/5 bg-white/[0.015] py-8">
          <div className="mx-auto max-w-6xl px-6">
            <p className="mb-6 text-center text-[11px] uppercase tracking-[0.2em] text-white/40">
              Used to sign up at
            </p>
            <Marquee />
          </div>
        </section>

        {/* BENTO */}
        <section id="features" className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Built for the way you actually use email.
            </h2>
            <p className="mt-4 text-white/60">
              Everything you need. None of the noise.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-6 md:grid-rows-[180px_180px_180px]">
            <BentoCard className="md:col-span-4 md:row-span-2" glow>
              <div className="flex h-full flex-col justify-between">
                <div>
                  <Pill icon={<Zap className="h-3 w-3" />}>Instant</Pill>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                    A working inbox in <span className="text-violet-300">one click</span>.
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-white/60">
                    Skip the signup forms. PMail generates a real address you can
                    use immediately — anywhere on the internet.
                  </p>
                </div>
                <div className="relative mt-6 overflow-hidden rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-[12px] text-white/80">
                  <div className="flex items-center gap-1.5 pb-2">
                    <span className="h-2 w-2 rounded-full bg-rose-400/70" />
                    <span className="h-2 w-2 rounded-full bg-amber-400/70" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                  </div>
                  <div className="text-white/40">$ create inbox</div>
                  <div className="text-emerald-300">✓ ready in 1.2s</div>
                  <div className="mt-1 text-violet-300">→ alex-9k2@pmail.tm</div>
                </div>
              </div>
            </BentoCard>

            <BentoCard className="md:col-span-2">
              <Pill icon={<InfinityIcon className="h-3 w-3" />}>Storage</Pill>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">
                Unlimited, forever.
              </h3>
              <p className="mt-1.5 text-sm text-white/55">
                Keep every email. Never see a "storage full" warning again.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-1">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full bg-gradient-to-r from-violet-500/70 to-fuchsia-500/70"
                    style={{ opacity: 0.3 + (i % 6) * 0.12 }}
                  />
                ))}
              </div>
            </BentoCard>

            <BentoCard className="md:col-span-2">
              <Pill icon={<Lock className="h-3 w-3" />}>Private</Pill>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">
                Zero tracking.
              </h3>
              <p className="mt-1.5 text-sm text-white/55">
                No ads. No profiling. No selling your data to "partners."
              </p>
            </BentoCard>

            <BentoCard className="md:col-span-2">
              <Pill icon={<Clock className="h-3 w-3" />}>Remembers you</Pill>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">
                Stays signed in.
              </h3>
              <p className="mt-1.5 text-sm text-white/55">
                We won't log you out every week. Come back and your inbox is right there.
              </p>
            </BentoCard>

            <BentoCard className="md:col-span-2">
              <Pill icon={<Globe className="h-3 w-3" />}>Worldwide</Pill>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">
                Real delivery.
              </h3>
              <p className="mt-1.5 text-sm text-white/55">
                Verification codes from AliExpress, Steam, Discord — all land instantly.
              </p>
            </BentoCard>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Loved by people who hate spam.
            </h2>
          </div>
          <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
            {TESTIMONIALS.map((t, i) => (
              <Testimonial key={i} {...t} />
            ))}
          </div>
        </section>

        {/* PRICING / CTA */}
        <section id="pricing" className="relative mx-auto max-w-4xl px-6 py-24">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-cyan-500/10 p-10 text-center backdrop-blur-xl sm:p-16">
            <div className="absolute -top-32 left-1/2 h-64 w-[140%] -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="relative">
              <Pill icon={<Sparkles className="h-3 w-3" />}>Forever free</Pill>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                $0. Always.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-white/60">
                No tiers. No trials. No "premium" upsell. Just an inbox that works.
              </p>
              <Button
                size="lg"
                onClick={() => document.getElementById("get-inbox")?.scrollIntoView({ behavior: "smooth" })}
                className="mt-8 h-12 gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 text-white shadow-[0_0_40px_-8px_rgba(168,85,247,0.8)] transition-all hover:scale-[1.04]"
              >
                Get my inbox <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative border-t border-white/5 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-white/40">
              <div className="grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Mail className="h-2.5 w-2.5 text-white" />
              </div>
              PMail · © {new Date().getFullYear()}
            </div>
            <div className="flex items-center gap-5 text-sm text-white/40">
              <Link to="/" className="hover:text-white">Home</Link>
              <a href="#features" className="hover:text-white">Features</a>
              <a href="#pricing" className="hover:text-white">Pricing</a>
            </div>
          </div>
        </footer>
      </main>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="border-white/10 bg-[oklch(0.18_0.02_265)] text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Sign in to an inbox</DialogTitle>
            <DialogDescription className="text-white/60">
              Use the address and password you saved when you created the inbox.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/70">Email address</Label>
              <Input
                value={loginAddr}
                onChange={(e) => setLoginAddr(e.target.value)}
                placeholder="name@domain.com"
                autoComplete="email"
                autoFocus
                className="border-white/10 bg-white/5"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/70">Password</Label>
              <Input
                type="password"
                value={loginPwd}
                onChange={(e) => setLoginPwd(e.target.value)}
                autoComplete="current-password"
                onKeyDown={(e) => e.key === "Enter" && !busy && doLogin()}
                className="border-white/10 bg-white/5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLoginOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              onClick={doLogin}
              disabled={busy}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
            >
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- Components ---------- */

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-lg px-3 py-1.5 text-[13px] text-white/60 transition-colors duration-200 hover:bg-white/5 hover:text-white"
    >
      {children}
    </a>
  );
}

function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, black 30%, transparent 70%)",
        }}
      />
      <div className="absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/25 blur-[120px]" />
      <div className="absolute right-[-10%] top-[40%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/15 blur-[120px]" />
      <div className="absolute left-[-10%] top-[70%] h-[400px] w-[400px] rounded-full bg-cyan-500/15 blur-[120px]" />
    </div>
  );
}

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] uppercase tracking-widest text-white/70">
      {icon}
      {children}
    </div>
  );
}

function BentoCard({
  className = "",
  glow = false,
  children,
}: {
  className?: string;
  glow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] ${className}`}
    >
      {glow && (
        <div className="pointer-events-none absolute -top-24 right-[-10%] h-48 w-48 rounded-full bg-violet-500/30 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

function MockInbox() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-[oklch(0.16_0.02_265)]">
      <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <div className="ml-3 truncate font-mono text-[11px] text-white/40">
          pmail.app — pmail@wshu.net
        </div>
      </div>
      <div className="grid grid-cols-[200px_1fr] sm:grid-cols-[220px_320px_1fr]">
        <div className="hidden border-r border-white/5 p-3 sm:block">
          {["Inbox", "Sent", "Drafts", "Archive", "Trash"].map((f, i) => (
            <div
              key={f}
              className={`mb-0.5 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] ${
                i === 0 ? "bg-white/8 text-white" : "text-white/50"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              {f}
              {i === 0 && <span className="ml-auto text-[10px] text-white/40">3</span>}
            </div>
          ))}
        </div>
        <div className="border-r border-white/5">
          {MOCK_EMAILS.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 border-b border-white/5 p-3 text-[12px] ${
                i === 0 ? "bg-white/5" : ""
              }`}
            >
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500/40 to-fuchsia-500/40 text-[10px] font-semibold text-white">
                {m.from[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="truncate font-medium text-white">{m.from}</div>
                  <div className="text-[10px] text-white/40">{m.time}</div>
                </div>
                <div className="truncate text-white/80">{m.subject}</div>
                <div className="truncate text-white/40">{m.preview}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden p-5 sm:block">
          <div className="text-[11px] uppercase tracking-widest text-white/40">
            From Steam
          </div>
          <div className="mt-2 text-base font-semibold text-white">
            Your Steam verification code
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] text-white/40">Code</div>
            <div className="mt-1 font-mono text-2xl tracking-[0.3em] text-white">
              7K2-9FQ
            </div>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-white/55">
            Enter this code to finish signing in. It expires in 5 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

const MOCK_EMAILS = [
  { from: "Steam", subject: "Your verification code", preview: "Use code 7K2-9FQ to sign in…", time: "now" },
  { from: "Discord", subject: "Welcome to Discord!", preview: "Hey there, we're so glad…", time: "2m" },
  { from: "AliExpress", subject: "Confirm your account", preview: "Tap the link below to verify…", time: "11m" },
  { from: "Figma", subject: "You've been invited", preview: "Join the team workspace…", time: "1h" },
  { from: "GitHub", subject: "[security] new sign-in", preview: "A new device just signed in…", time: "3h" },
];

function Marquee() {
  const items = ["Steam", "Discord", "Figma", "GitHub", "Notion", "Vercel", "Linear", "AliExpress", "Spotify", "Reddit"];
  const doubled = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div className="flex w-max gap-12 animate-[marquee_30s_linear_infinite]">
        {doubled.map((name, i) => (
          <div key={i} className="text-2xl font-semibold tracking-tight text-white/40">
            {name}
          </div>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

const TESTIMONIALS = [
  { name: "Maya R.", handle: "@mayadev", body: "Finally an email that doesn't ask me to 'verify my identity' three times. One click and done.", stars: 5 },
  { name: "Jordan T.", handle: "@jtcodes", body: "Use it for every random signup. Inbox is clean for the first time in years.", stars: 5 },
  { name: "Priya S.", handle: "@priyaships", body: "Works for Steam, Discord, even AliExpress codes. Real delivery, not a sketchy proxy.", stars: 5 },
  { name: "Leo K.", handle: "@leobuilds", body: "Unlimited storage and it remembers me on every visit. This is what email should be.", stars: 5 },
  { name: "Sam W.", handle: "@samw", body: "Looks gorgeous. Feels like a $20/mo product but it's free.", stars: 5 },
  { name: "Ana M.", handle: "@anam", body: "No tracking, no upsell, no nonsense. Just an inbox.", stars: 4 },
];

function Testimonial({ name, handle, body, stars }: { name: string; handle: string; body: string; stars: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur transition-colors hover:bg-white/[0.06]">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500/60 to-fuchsia-500/60 text-sm font-semibold text-white">
          {name[0]}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{name}</div>
          <div className="text-xs text-white/40">{handle}</div>
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          {Array.from({ length: stars }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-white/75">{body}</p>
    </div>
  );
}
