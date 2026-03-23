"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { DetailSkeleton } from "@/components/shared/loading-skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, ExternalLink, MapPin, Calendar, DollarSign,
  Trash2, Save, Loader2, User, Clock, MessageSquare,
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

  // Contact form
  const [showContactForm, setShowContactForm] = useState(false);

  // Reminder form
  const [showReminderForm, setShowReminderForm] = useState(false);

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

  if (loading) return <DetailSkeleton />;
  if (!application) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{application.jobTitle}</h1>
          <p className="text-muted-foreground">{application.company}</p>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditMode(true)}>Edit</Button>
              <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input value={formData.jobTitle} onChange={(e) => setFormData((p) => ({ ...p, jobTitle: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input value={formData.company} onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input value={formData.url} onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Salary Min</Label>
                      <Input type="number" value={formData.salaryMin} onChange={(e) => setFormData((p) => ({ ...p, salaryMin: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Salary Max</Label>
                      <Input type="number" value={formData.salaryMax} onChange={(e) => setFormData((p) => ({ ...p, salaryMax: e.target.value }))} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {application.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{application.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Applied {formatDate(application.appliedDate)}</span>
                  </div>
                  {(application.salaryMin || application.salaryMax) && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{formatSalary(application.salaryMin, application.salaryMax, application.salaryCurrency || "USD")}</span>
                    </div>
                  )}
                  {application.url && (
                    <a href={application.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <ExternalLink className="h-4 w-4" />
                      <span>View Job Posting</span>
                    </a>
                  )}
                  {application.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {application.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary" style={{ borderColor: tag.color }}>
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {application.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {application.description}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  rows={6}
                  placeholder="Add notes about this application..."
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {application.notes || "No notes yet."}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Contacts</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowContactForm(!showContactForm)}>
                <User className="mr-1 h-3 w-3" /> Add
              </Button>
            </CardHeader>
            <CardContent>
              {application.contacts.length === 0 && !showContactForm ? (
                <p className="text-sm text-muted-foreground">No contacts added yet.</p>
              ) : (
                <div className="space-y-3">
                  {application.contacts.map((contact) => (
                    <div key={contact.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="rounded-full bg-primary/10 p-2">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{contact.name}</p>
                        {contact.role && <p className="text-xs text-muted-foreground">{contact.role}</p>}
                        {contact.email && <p className="text-xs text-muted-foreground">{contact.email}</p>}
                        {contact.phone && <p className="text-xs text-muted-foreground">{contact.phone}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Reminders</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowReminderForm(!showReminderForm)}>
                <Clock className="mr-1 h-3 w-3" /> Add
              </Button>
            </CardHeader>
            <CardContent>
              {application.reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reminders set.</p>
              ) : (
                <div className="space-y-2">
                  {application.reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center gap-2 text-sm p-2 rounded border">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{formatDate(reminder.remindAt)}</p>
                        {reminder.message && <p className="text-xs text-muted-foreground">{reminder.message}</p>}
                      </div>
                      {reminder.sent && <Badge variant="secondary" className="text-xs">Sent</Badge>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {application.activityLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {application.activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 text-sm">
                      <MessageSquare className="h-3 w-3 mt-1 text-muted-foreground shrink-0" />
                      <div>
                        <p>
                          {log.action === "status_change"
                            ? `Status changed from ${log.oldValue} to ${log.newValue}`
                            : log.action === "created"
                            ? "Application created"
                            : log.newValue || log.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatRelativeDate(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
