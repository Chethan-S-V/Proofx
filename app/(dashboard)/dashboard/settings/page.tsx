import {
  Bell,
  Bot,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  FileCheck2,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Monitor,
  Palette,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "../../../../src/components/ui/button";
import { Card } from "../../../../src/components/ui/card";
import { getServerUser } from "../../../../src/lib/auth/service";
import {
  getDashboardSettings,
  updateAccountSettings,
  updateAppearanceSettings,
  updatePasswordSettings,
  updatePreferenceSettings,
} from "../../../../src/lib/settings/service";

const inputClass =
  "h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400";
const labelClass = "text-xs font-medium uppercase tracking-[0.12em] text-slate-500";

const themeOptions = [
  { accent: "bg-cyan-300", label: "Midnight", mode: "Dark", value: "dark-midnight" },
  { accent: "bg-zinc-400", label: "Graphite", mode: "Dark", value: "dark-graphite" },
  { accent: "bg-emerald-300", label: "Emerald", mode: "Dark", value: "dark-emerald" },
  { accent: "bg-rose-400", label: "Crimson", mode: "Dark", value: "dark-crimson" },
  { accent: "bg-violet-300", label: "Violet", mode: "Dark", value: "dark-violet" },
  { accent: "bg-slate-200", label: "Paper", mode: "Light", value: "light-paper" },
  { accent: "bg-sky-300", label: "Sky", mode: "Light", value: "light-sky" },
  { accent: "bg-emerald-200", label: "Mint", mode: "Light", value: "light-mint" },
  { accent: "bg-pink-300", label: "Rose", mode: "Light", value: "light-rose" },
  { accent: "bg-amber-200", label: "Sand", mode: "Light", value: "light-sand" },
];

function ThemeOption({ checked, option }: { checked: boolean; option: (typeof themeOptions)[number] }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 transition hover:border-cyan-400">
      <input defaultChecked={checked} name="theme" type="radio" value={option.value} />
      <span className={`h-5 w-5 rounded-full ${option.accent}`} aria-hidden="true" />
      <span>
        <span className="block text-sm font-medium text-white">{option.label}</span>
        <span className="text-xs text-slate-500">{option.mode}</span>
      </span>
    </label>
  );
}

function SettingsHeader({ description, icon: Icon, title }: { description: string; icon: typeof UserRound; title: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  description,
  icon: Icon,
  label,
  name,
}: {
  checked: boolean;
  description: string;
  icon: typeof UserRound;
  label: string;
  name: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-md border border-slate-800 p-4">
      <span className="flex gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-slate-300">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-medium text-white">{label}</span>
          <span className="mt-1 block text-sm leading-6 text-slate-500">{description}</span>
        </span>
      </span>
      <input className="mt-1" defaultChecked={checked} name={name} type="checkbox" />
    </label>
  );
}

export default async function SettingsPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  const settings = getDashboardSettings(user);
  const selectedTheme = themeOptions.find((option) => option.value === settings.theme) ?? themeOptions[0];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-300">Dashboard / Settings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Settings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Manage account identity, security, privacy, notifications, recruiter visibility, and ProofX assistant preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-950 p-5">
            <SettingsHeader
              description="Manage sign-in email, language, and timezone. Profile name is edited from your profile page."
              icon={UserRound}
              title="Account"
            />
            <form action={updateAccountSettings} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className={labelClass}>Email</span>
                <input className={inputClass} defaultValue={settings.email} name="email" required type="email" />
                <span className="block text-xs text-slate-600">Changing email may require confirmation through Supabase Auth.</span>
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Language</span>
                <input className={inputClass} defaultValue={settings.language} name="language" />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Timezone</span>
                <input className={inputClass} defaultValue={settings.timezone} name="timezone" />
              </label>
              <div className="sm:col-span-2">
                <Button type="submit">Save account</Button>
              </div>
            </form>
          </Card>

          <Card className="border-slate-800 bg-slate-950 p-5">
            <SettingsHeader
              description="Choose how ProofX looks and behaves visually across dense work sessions."
              icon={Palette}
              title="Appearance"
            />
            <form action={updateAppearanceSettings} className="mt-5 space-y-5">
              <div>
                <p className={labelClass}>Theme</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {themeOptions.map((option) => (
                    <ThemeOption checked={settings.theme === option.value} key={option.value} option={option} />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Toggle
                  checked={settings.compactMode}
                  description="Tighten spacing in dashboards, lists, and repeated controls."
                  icon={Monitor}
                  label="Compact mode"
                  name="compactMode"
                />
                <Toggle
                  checked={settings.highContrast}
                  description="Increase contrast for text, borders, and important status indicators."
                  icon={Eye}
                  label="High contrast"
                  name="highContrast"
                />
                <Toggle
                  checked={settings.reduceMotion}
                  description="Reduce motion-heavy transitions for a calmer interface."
                  icon={SlidersHorizontal}
                  label="Reduced motion"
                  name="reduceMotion"
                />
              </div>
              <Button type="submit">Save appearance</Button>
            </form>
          </Card>

          <Card className="border-slate-800 bg-slate-950 p-5">
            <SettingsHeader
              description="Update the password used for email/password sign in."
              icon={KeyRound}
              title="Security"
            />
            <form action={updatePasswordSettings} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClass}>New password</span>
                <input className={inputClass} minLength={8} name="password" required type="password" />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Confirm password</span>
                <input className={inputClass} minLength={8} name="confirmPassword" required type="password" />
              </label>
              <div className="sm:col-span-2">
                <Button type="submit">Update password</Button>
              </div>
            </form>
          </Card>

          <Card className="border-slate-800 bg-slate-950 p-5">
            <SettingsHeader
              description="Control what ProofX can surface to recruiters, teams, notifications, and the assistant."
              icon={SlidersHorizontal}
              title="Preferences"
            />
            <form action={updatePreferenceSettings} className="mt-5 space-y-6">
              <div className="space-y-3">
                <p className={labelClass}>Privacy and discovery</p>
                <Toggle
                  checked={settings.privateProfile}
                  description="Hide profile details from public views until you share them intentionally."
                  icon={Lock}
                  label="Private profile"
                  name="privateProfile"
                />
                <Toggle
                  checked={settings.recruiterVisible}
                  description="Allow recruiter-facing surfaces to discover your verified profile."
                  icon={ShieldCheck}
                  label="Recruiter visibility"
                  name="recruiterVisible"
                />
                <Toggle
                  checked={settings.loginAlerts}
                  description="Send an alert when ProofX notices a new sign-in pattern."
                  icon={Smartphone}
                  label="Login alerts"
                  name="loginAlerts"
                />
              </div>
              <div className="space-y-3">
                <p className={labelClass}>Notifications</p>
                <Toggle
                  checked={settings.emailNotifications}
                  description="Receive important account, proof, and codespace notifications by email."
                  icon={Bell}
                  label="Email notifications"
                  name="emailNotifications"
                />
                <Toggle
                  checked={settings.productUpdates}
                  description="Receive updates about new ProofX features and verification workflows."
                  icon={Globe}
                  label="Product updates"
                  name="productUpdates"
                />
                <Toggle
                  checked={settings.weeklyDigest}
                  description="Get a weekly summary of profile, proof, and codespace activity."
                  icon={Clock}
                  label="Weekly digest"
                  name="weeklyDigest"
                />
              </div>
              <div className="space-y-3">
                <p className={labelClass}>Workspace and proofs</p>
                <Toggle
                  checked={settings.autoSaveDrafts}
                  description="Automatically preserve profile, proof, and post drafts while you work."
                  icon={Save}
                  label="Auto-save drafts"
                  name="autoSaveDrafts"
                />
                <Toggle
                  checked={settings.codeActivityTracking}
                  description="Use codespace activity as private proof-building signals."
                  icon={Database}
                  label="Codespace activity tracking"
                  name="codeActivityTracking"
                />
                <Toggle
                  checked={settings.proofReminders}
                  description="Remind you when strong activity is ready to convert into proof."
                  icon={FileCheck2}
                  label="Proof reminders"
                  name="proofReminders"
                />
              </div>
              <div className="space-y-3">
                <p className={labelClass}>Assistant and data</p>
                <Toggle
                  checked={settings.aiSuggestions}
                  description="Let the assistant suggest profile improvements and proof opportunities."
                  icon={Bot}
                  label="AI suggestions"
                  name="aiSuggestions"
                />
                <Toggle
                  checked={settings.dataExportReady}
                  description="Prepare account data exports in the background when export workflows are available."
                  icon={Database}
                  label="Data export readiness"
                  name="dataExportReady"
                />
              </div>
              <Button type="submit">Save preferences</Button>
            </form>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="border-slate-800 bg-slate-950 p-5">
            <SettingsHeader description="Current account state." icon={CheckCircle2} title="Status" />
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-500">Session</span>
                <span className="font-medium text-cyan-300">Active</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-500">Email</span>
                <span className="max-w-40 truncate text-white">{settings.email}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-500">Profile</span>
                <span className="font-medium text-white">{settings.privateProfile ? "Private" : "Visible"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Recruiters</span>
                <span className="font-medium text-white">{settings.recruiterVisible ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          </Card>

          <Card className="border-slate-800 bg-slate-950 p-5">
            <SettingsHeader description="Communication preferences." icon={Mail} title="Notifications" />
            <div className="mt-5 space-y-3 text-sm text-slate-400">
              <p>Email notifications: {settings.emailNotifications ? "On" : "Off"}</p>
              <p>Product updates: {settings.productUpdates ? "On" : "Off"}</p>
              <p>AI suggestions: {settings.aiSuggestions ? "On" : "Off"}</p>
            </div>
          </Card>

          <Card className="border-slate-800 bg-slate-950 p-5">
            <SettingsHeader description="ProofX account controls." icon={ShieldCheck} title="Account Safety" />
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-400">
              <p>Password changes apply immediately through Supabase Auth.</p>
              <p>Email changes may require confirmation before becoming active.</p>
              <p>Deleting accounts is intentionally not exposed until the data-retention workflow is implemented.</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
