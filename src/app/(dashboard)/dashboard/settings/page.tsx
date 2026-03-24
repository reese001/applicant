"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, User, Bell, Shield } from "lucide-react";

const inputClass = "w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 transition-colors";
const labelClass = "text-xs font-medium text-white/50";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      await updateSession({ name });
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange() {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update password");
      }
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white/90">Settings</h1>
        <p className="text-white/40">Manage your account settings and preferences</p>
      </div>

      {/* Profile */}
      <div className="liquid-glass-strong rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <User className="h-5 w-5 text-white/50" />
          <h2 className="text-lg font-semibold text-white/85">Profile</h2>
        </div>
        <p className="text-sm text-white/35 -mt-3">Update your personal information</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className={labelClass}>Full name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" value={session?.user?.email || ""} disabled className={`${inputClass} opacity-50`} />
            <p className="text-xs text-white/25">Email cannot be changed</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="liquid-glass-strong rounded-xl px-5 py-2.5 text-sm font-medium text-white/80 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="liquid-glass-strong rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="h-5 w-5 text-white/50" />
          <h2 className="text-lg font-semibold text-white/85">Notifications</h2>
        </div>
        <p className="text-sm text-white/35 -mt-3">Configure how you receive notifications</p>
        <div className="space-y-0">
          {[
            { label: "Email reminders", desc: "Receive follow-up reminders via email", defaultOn: true },
            { label: "Weekly summary", desc: "Get a weekly overview of your applications", defaultOn: false },
            { label: "Status change alerts", desc: "Be notified when you update an application status", defaultOn: true },
          ].map((item, i) => (
            <div key={item.label}>
              {i > 0 && <div className="h-px bg-white/[0.06] my-4" />}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">{item.label}</p>
                  <p className="text-xs text-white/30">{item.desc}</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.defaultOn ? "bg-primary/60" : "bg-white/[0.08]"}`}
                  role="switch"
                  aria-checked={item.defaultOn}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${item.defaultOn ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="liquid-glass-strong rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-white/50" />
          <h2 className="text-lg font-semibold text-white/85">Security</h2>
        </div>
        <p className="text-sm text-white/35 -mt-3">Manage your password and security settings</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="current-password" className={labelClass}>Current password</label>
            <input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label htmlFor="new-password" className={labelClass}>New password</label>
            <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm-password" className={labelClass}>Confirm new password</label>
            <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
          </div>
          <button
            onClick={handlePasswordChange}
            disabled={changingPassword}
            className="liquid-glass rounded-xl px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white/80 transition-colors disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2"
          >
            {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Password
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6">
        <h2 className="text-lg font-semibold text-red-400/80 mb-1">Danger Zone</h2>
        <p className="text-sm text-white/35 mb-4">Irreversible actions</p>
        <button className="rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
