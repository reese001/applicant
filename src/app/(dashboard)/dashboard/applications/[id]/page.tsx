"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DetailSkeleton } from "@/components/shared/loading-skeleton";
import {
  ArrowLeft, ExternalLink, MapPin, Calendar, DollarSign,
  Trash2, Save, Loader2, User, Clock, MessageSquare, Plus, X,
} from "lucide-react";
import { formatDate, formatRelativeDate, formatSalary } from "@/lib/utils";
import { toast } from "sonner";
import type { ApplicationWithRelations } from "@/types";

const statuses = [
  { value: "SAVED", label: "Saved" },
  { value: "APPLIED", label: "Applied" },
  { value: "PHONE_SCREEN", label: "Phone Screen" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

const inputClass = "w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 transition-colors";
const labelClass = "text-xs font-medium text-white/50";
const smallInputClass = "w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 transition-colors";

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState<ApplicationWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    location: "",
    url: "",
    status: "",
    notes: "",
    salaryMin: "",
    salaryMax: "",
  });

  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", role: "", email: "", phone: "", notes: "" });
  const [savingContact, setSavingContact] = useState(false);

  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderForm, setReminderForm] = useState({ remindAt: "", message: "" });
  const [savingReminder, setSavingReminder] = useState(false);

  useEffect(() => {
    async function fetchApplication() {
      try {
        const res = await fetch(`/api/applications/${params.id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setApplication(data);
        setFormData({
          jobTitle: data.jobTitle,
          company: data.company,
          location: data.location || "",
          url: data.url || "",
          status: data.status,
          notes: data.notes || "",
          salaryMin: data.salaryMin?.toString() || "",
          salaryMax: data.salaryMax?.toString() || "",
        });
      } catch {
        toast.error("Failed to load application");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchApplication();
  }, [params.id, router]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/applications/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setApplication((prev) => prev ? { ...prev, ...updated } : prev);
      setEditMode(false);
      toast.success("Application updated");
    } catch {
      toast.error("Failed to update application");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this application?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Application deleted");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to delete application");
      setDeleting(false);
    }
  }

  async function handleStatusChange(status: string) {
    try {
      const res = await fetch(`/api/applications/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setApplication((prev) => prev ? { ...prev, ...updated } : prev);
      setFormData((prev) => ({ ...prev, status }));
      toast.success(`Status updated to ${statuses.find((s) => s.value === status)?.label}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    setSavingContact(true);
    try {
      const res = await fetch(`/api/applications/${params.id}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add contact");
      }
      const contact = await res.json();
      setApplication((prev) => prev ? { ...prev, contacts: [...prev.contacts, contact] } : prev);
      setContactForm({ name: "", role: "", email: "", phone: "", notes: "" });
      setShowContactForm(false);
      toast.success("Contact added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add contact");
    } finally {
      setSavingContact(false);
    }
  }

  async function handleDeleteContact(contactId: string) {
    try {
      const res = await fetch(`/api/applications/${params.id}/contacts/${contactId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setApplication((prev) => prev ? { ...prev, contacts: prev.contacts.filter((c) => c.id !== contactId) } : prev);
      toast.success("Contact removed");
    } catch {
      toast.error("Failed to delete contact");
    }
  }

  async function handleAddReminder(e: React.FormEvent) {
    e.preventDefault();
    setSavingReminder(true);
    try {
      const res = await fetch(`/api/applications/${params.id}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reminderForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add reminder");
      }
      const reminder = await res.json();
      setApplication((prev) => prev ? { ...prev, reminders: [...prev.reminders, reminder] } : prev);
      setReminderForm({ remindAt: "", message: "" });
      setShowReminderForm(false);
      toast.success("Reminder set");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add reminder");
    } finally {
      setSavingReminder(false);
    }
  }

  async function handleDeleteReminder(reminderId: string) {
    try {
      const res = await fetch(`/api/applications/${params.id}/reminders/${reminderId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setApplication((prev) => prev ? { ...prev, reminders: prev.reminders.filter((r) => r.id !== reminderId) } : prev);
      toast.success("Reminder removed");
    } catch {
      toast.error("Failed to delete reminder");
    }
  }

  if (loading) return <DetailSkeleton />;
  if (!application) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="h-10 w-10 flex items-center justify-center rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white/90">{application.jobTitle}</h1>
          <p className="text-white/40">{application.company}</p>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="liquid-glass rounded-xl px-4 py-2 text-sm font-medium text-white/60 hover:text-white/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="liquid-glass-strong rounded-xl px-4 py-2 text-sm font-medium text-white/80 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="liquid-glass rounded-xl px-4 py-2 text-sm font-medium text-white/60 hover:text-white/80 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Details */}
          <div className="liquid-glass-strong rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white/70 mb-4">Details</h3>
            {editMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={labelClass}>Job Title</label>
                    <input value={formData.jobTitle} onChange={(e) => setFormData((p) => ({ ...p, jobTitle: e.target.value }))} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Company</label>
                    <input value={formData.company} onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={labelClass}>Location</label>
                    <input value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>URL</label>
                    <input value={formData.url} onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={labelClass}>Salary Min</label>
                    <input type="number" value={formData.salaryMin} onChange={(e) => setFormData((p) => ({ ...p, salaryMin: e.target.value }))} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Salary Max</label>
                    <input type="number" value={formData.salaryMax} onChange={(e) => setFormData((p) => ({ ...p, salaryMax: e.target.value }))} className={inputClass} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {application.location && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <MapPin className="h-4 w-4 text-white/30" />
                    <span>{application.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Calendar className="h-4 w-4 text-white/30" />
                  <span>Applied {formatDate(application.appliedDate)}</span>
                </div>
                {(application.salaryMin || application.salaryMax) && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <DollarSign className="h-4 w-4 text-white/30" />
                    <span>{formatSalary(application.salaryMin, application.salaryMax, application.salaryCurrency || "USD")}</span>
                  </div>
                )}
                {application.url && (
                  <a href={application.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                    <span>View Job Posting</span>
                  </a>
                )}
                {application.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {application.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="bg-white/[0.04] border-white/[0.08] text-white/50" style={{ borderColor: tag.color, color: tag.color }}>
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Job Description */}
          {application.description && (
            <div className="liquid-glass-strong rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white/70 mb-4">Job Description</h3>
              <p className="text-sm text-white/45 whitespace-pre-wrap leading-relaxed">
                {application.description}
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="liquid-glass-strong rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white/70 mb-4">Notes</h3>
            {editMode ? (
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                rows={6}
                placeholder="Add notes about this application..."
                className={`${inputClass} resize-none`}
              />
            ) : (
              <p className="text-sm text-white/45 whitespace-pre-wrap">
                {application.notes || "No notes yet."}
              </p>
            )}
          </div>

          {/* Contacts */}
          <div className="liquid-glass-strong rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/70">Contacts</h3>
              <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="liquid-glass rounded-lg px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white/70 transition-colors inline-flex items-center gap-1"
              >
                {showContactForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                {showContactForm ? "Cancel" : "Add"}
              </button>
            </div>
            {showContactForm && (
              <form onSubmit={handleAddContact} className="space-y-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={labelClass}>Name *</label>
                    <input className={smallInputClass} value={contactForm.name} onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Role</label>
                    <input className={smallInputClass} value={contactForm.role} onChange={(e) => setContactForm((p) => ({ ...p, role: e.target.value }))} placeholder="e.g. Recruiter" />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Email</label>
                    <input className={smallInputClass} type="email" value={contactForm.email} onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Phone</label>
                    <input className={smallInputClass} value={contactForm.phone} onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Notes</label>
                  <input className={smallInputClass} value={contactForm.notes} onChange={(e) => setContactForm((p) => ({ ...p, notes: e.target.value }))} />
                </div>
                <button
                  type="submit"
                  disabled={savingContact}
                  className="liquid-glass-strong rounded-lg px-4 py-2 text-xs font-medium text-white/70 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {savingContact && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save Contact
                </button>
              </form>
            )}
            {application.contacts.length === 0 && !showContactForm ? (
              <p className="text-sm text-white/30">No contacts added yet.</p>
            ) : (
              <div className="space-y-3">
                {application.contacts.map((contact) => (
                  <div key={contact.id} className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="rounded-full bg-white/[0.06] p-2">
                      <User className="h-4 w-4 text-white/40" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-white/80">{contact.name}</p>
                      {contact.role && <p className="text-xs text-white/35">{contact.role}</p>}
                      {contact.email && <p className="text-xs text-white/35">{contact.email}</p>}
                      {contact.phone && <p className="text-xs text-white/35">{contact.phone}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="liquid-glass-strong rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white/70 mb-3">Status</h3>
            <select
              value={formData.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value} className="bg-[#0c0c12] text-white/80">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reminders */}
          <div className="liquid-glass-strong rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/70">Reminders</h3>
              <button
                onClick={() => setShowReminderForm(!showReminderForm)}
                className="liquid-glass rounded-lg px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white/70 transition-colors inline-flex items-center gap-1"
              >
                {showReminderForm ? <X className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {showReminderForm ? "Cancel" : "Add"}
              </button>
            </div>
            {showReminderForm && (
              <form onSubmit={handleAddReminder} className="space-y-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] mb-4">
                <div className="space-y-1">
                  <label className={labelClass}>Remind At *</label>
                  <input className={smallInputClass} type="datetime-local" value={reminderForm.remindAt} onChange={(e) => setReminderForm((p) => ({ ...p, remindAt: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Message</label>
                  <input className={smallInputClass} value={reminderForm.message} onChange={(e) => setReminderForm((p) => ({ ...p, message: e.target.value }))} placeholder="Follow up on application..." />
                </div>
                <button
                  type="submit"
                  disabled={savingReminder}
                  className="liquid-glass-strong rounded-lg px-4 py-2 text-xs font-medium text-white/70 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {savingReminder && <Loader2 className="h-3 w-3 animate-spin" />}
                  Set Reminder
                </button>
              </form>
            )}
            {application.reminders.length === 0 && !showReminderForm ? (
              <p className="text-sm text-white/30">No reminders set.</p>
            ) : (
              <div className="space-y-2">
                {application.reminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center gap-2 text-sm p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <Clock className="h-3 w-3 text-white/30" />
                    <div className="flex-1">
                      <p className="font-medium text-white/70">{formatDate(reminder.remindAt)}</p>
                      {reminder.message && <p className="text-xs text-white/35">{reminder.message}</p>}
                    </div>
                    {reminder.sent && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40">Sent</span>}
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="h-6 w-6 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity */}
          <div className="liquid-glass-strong rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white/70 mb-3">Activity</h3>
            {application.activityLogs.length === 0 ? (
              <p className="text-sm text-white/30">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {application.activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-sm">
                    <MessageSquare className="h-3 w-3 mt-1 text-white/25 shrink-0" />
                    <div>
                      <p className="text-white/60">
                        {log.action === "status_change"
                          ? `Status changed from ${log.oldValue} to ${log.newValue}`
                          : log.action === "created"
                          ? "Application created"
                          : log.newValue || log.action}
                      </p>
                      <p className="text-xs text-white/25">{formatRelativeDate(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
