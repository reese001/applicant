"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
          <DialogDescription>
            Add a new job application to track. Paste a URL to auto-fill details.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Paste job URL to auto-fill..."
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleScrape}
            disabled={scraping || !scrapeUrl}
          >
            {scraping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="ml-2">Scrape</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => updateField("jobTitle", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => updateField("company", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA or Remote"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Salary Min</Label>
              <Input
                id="salaryMin"
                type="number"
                placeholder="80000"
                value={formData.salaryMin}
                onChange={(e) => updateField("salaryMin", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Salary Max</Label>
              <Input
                id="salaryMax"
                type="number"
                placeholder="120000"
                value={formData.salaryMax}
                onChange={(e) => updateField("salaryMax", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => updateField("url", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              placeholder="Paste the job description here..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="e.g., remote, frontend, startup (comma separated)"
              value={formData.tags}
              onChange={(e) => updateField("tags", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any notes about this application..."
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
