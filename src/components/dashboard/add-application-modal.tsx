"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon, Sparkles } from "lucide-react";

interface AddApplicationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const statuses = [
  { value: "SAVED", label: "Saved" },
  { value: "APPLIED", label: "Applied" },
  { value: "PHONE_SCREEN", label: "Phone Screen" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
];

const inputClass = "w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 transition-colors";
const labelClass = "text-xs font-medium text-white/50";

export function AddApplicationModal({ open, onClose, onSuccess }: AddApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    location: "",
    url: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    description: "",
    status: "APPLIED",
    notes: "",
    tags: "",
  });

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleScrape() {
    if (!scrapeUrl) return;
    setScraping(true);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to scrape URL");
        return;
      }

      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        jobTitle: data.jobTitle || prev.jobTitle,
        company: data.company || prev.company,
        location: data.location || prev.location,
        description: data.description || prev.description,
        url: scrapeUrl,
      }));

      if (data.remaining >= 0) {
        toast.success(`Scraped successfully! ${data.remaining} scrapes remaining this month.`);
      } else {
        toast.success("Scraped successfully!");
      }
    } catch {
      toast.error("Failed to scrape URL");
    } finally {
      setScraping(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create application");
        return;
      }

      toast.success("Application added!");
      setFormData({
        jobTitle: "", company: "", location: "", url: "",
        salaryMin: "", salaryMax: "", salaryCurrency: "USD",
        description: "", status: "APPLIED", notes: "", tags: "",
      });
      setScrapeUrl("");
      onSuccess();
      onClose();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0c0c12]/95 backdrop-blur-xl border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="text-white/90">Add Application</DialogTitle>
          <DialogDescription className="text-white/40">
            Add a new job application to track. Paste a URL to auto-fill details.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              placeholder="Paste job URL to auto-fill..."
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
          <button
            type="button"
            onClick={handleScrape}
            disabled={scraping || !scrapeUrl}
            className="liquid-glass rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white/80 transition-colors inline-flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
          >
            {scraping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Scrape
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="jobTitle" className={labelClass}>Job Title *</label>
              <input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => updateField("jobTitle", e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="company" className={labelClass}>Company *</label>
              <input
                id="company"
                value={formData.company}
                onChange={(e) => updateField("company", e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="location" className={labelClass}>Location</label>
              <input
                id="location"
                placeholder="e.g., San Francisco, CA or Remote"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className={labelClass}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => updateField("status", e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#0c0c12] text-white/80">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="salaryMin" className={labelClass}>Salary Min</label>
              <input
                id="salaryMin"
                type="number"
                placeholder="80000"
                value={formData.salaryMin}
                onChange={(e) => updateField("salaryMin", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="salaryMax" className={labelClass}>Salary Max</label>
              <input
                id="salaryMax"
                type="number"
                placeholder="120000"
                value={formData.salaryMax}
                onChange={(e) => updateField("salaryMax", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="url" className={labelClass}>URL</label>
              <input
                id="url"
                type="url"
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => updateField("url", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className={labelClass}>Job Description</label>
            <textarea
              id="description"
              placeholder="Paste the job description here..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className={labelClass}>Tags</label>
            <input
              id="tags"
              placeholder="e.g., remote, frontend, startup (comma separated)"
              value={formData.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className={labelClass}>Notes</label>
            <textarea
              id="notes"
              placeholder="Any notes about this application..."
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={onClose}
              className="liquid-glass rounded-xl px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="liquid-glass-strong rounded-xl px-5 py-2.5 text-sm font-medium text-white/80 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Application
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
