import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sun, Moon, Monitor, User, PenLine, Check, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePrefs, type ThemeMode } from "@/lib/local-store";
import { ACCENT_OPTIONS } from "@/lib/theme";
import { useMailtm } from "@/lib/mailtm-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { account } = useMailtm();
  const [prefs, setPrefs] = usePrefs();
  const [displayName, setDisplayName] = useState(prefs.displayName);
  const [signature, setSignature] = useState(prefs.signature);

  function saveProfile() {
    setPrefs({ displayName: displayName.trim(), signature: signature.trim() });
    toast.success("Profile saved");
  }

  function resetTheme() {
    setPrefs({ themeMode: "dark", accent: "violet" });
    toast.success("Theme reset");
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-10 sm:py-10">
        <header className="mb-8">
          <h1 className="text-[24px] font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Make PMail yours. Changes save instantly to this browser.
          </p>
        </header>

        {/* Theme */}
        <Section title="Appearance" description="Theme mode and accent color.">
          <div className="space-y-5">
            <div>
              <Label className="text-[12px] text-muted-foreground">Mode</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <ModeCard mode="light" current={prefs.themeMode} onPick={(m) => setPrefs({ themeMode: m })} icon={<Sun className="h-4 w-4" />} label="Light" />
                <ModeCard mode="dark" current={prefs.themeMode} onPick={(m) => setPrefs({ themeMode: m })} icon={<Moon className="h-4 w-4" />} label="Dark" />
                <ModeCard mode="system" current={prefs.themeMode} onPick={(m) => setPrefs({ themeMode: m })} icon={<Monitor className="h-4 w-4" />} label="System" />
              </div>
            </div>

            <div>
              <Label className="text-[12px] text-muted-foreground">Accent color</Label>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {ACCENT_OPTIONS.map((a) => {
                  const active = prefs.accent === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setPrefs({ accent: a.id })}
                      className={cn(
                        "group relative h-14 overflow-hidden rounded-xl border transition-all",
                        active ? "border-foreground/30 ring-2 ring-offset-2 ring-offset-background ring-accent" : "border-border hover:border-foreground/20",
                      )}
                      style={{ background: a.preview }}
                      aria-label={a.label}
                      title={a.label}
                    >
                      {active && (
                        <span className="absolute inset-0 grid place-items-center text-white">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={resetTheme} className="gap-1.5 text-[12px]">
              <RefreshCw className="h-3.5 w-3.5" /> Reset to defaults
            </Button>
          </div>
        </Section>

        {/* Profile */}
        <Section title="Profile" description="Your name + signature get attached to outgoing mail.">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3.5 w-3.5" /> Display name
              </Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex Carter"
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] flex items-center gap-1.5 text-muted-foreground">
                <PenLine className="h-3.5 w-3.5" /> Signature
              </Label>
              <textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Sent from PMail · the inbox that just works."
                rows={3}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Button onClick={saveProfile} className="bg-accent-grad text-white shadow-accent-glow">
              Save profile
            </Button>
          </div>
        </Section>

        {/* Inbox */}
        <Section title="Inbox" description="Tweak how mail looks in your list.">
          <div className="space-y-4">
            <Row
              title="Density"
              description="More breathing room or pack in more rows."
              control={
                <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
                  {(["comfortable", "compact"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setPrefs({ density: d })}
                      className={cn(
                        "rounded-md px-3 py-1 text-[12px] font-medium capitalize transition-colors",
                        prefs.density === d ? "bg-accent-grad text-white" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              }
            />
            <Row
              title="Show previews"
              description="Display the first line of each email under the subject."
              control={
                <Switch
                  checked={prefs.showPreviews}
                  onCheckedChange={(v) => setPrefs({ showPreviews: v })}
                />
              }
            />
          </div>
        </Section>

        {/* Account */}
        <Section title="Account" description="The active PMail inbox.">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Address</div>
            <div className="mt-1 truncate font-mono text-[13.5px] font-semibold">{account?.address ?? "—"}</div>
            <p className="mt-2 text-[12px] text-muted-foreground">
              Use the chevron icon in the top bar to switch inboxes or sign out.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-6">
      <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
      <p className="mt-0.5 text-[12.5px] text-muted-foreground">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Row({ title, description, control }: { title: string; description: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-[13px] font-medium">{title}</div>
        <div className="text-[12px] text-muted-foreground">{description}</div>
      </div>
      <div>{control}</div>
    </div>
  );
}

function ModeCard({
  mode, current, onPick, icon, label,
}: {
  mode: ThemeMode;
  current: ThemeMode;
  onPick: (m: ThemeMode) => void;
  icon: React.ReactNode;
  label: string;
}) {
  const active = current === mode;
  return (
    <button
      onClick={() => onPick(mode)}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-[12px] font-medium transition-all",
        active
          ? "border-transparent bg-accent-grad text-white shadow-accent-glow"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
