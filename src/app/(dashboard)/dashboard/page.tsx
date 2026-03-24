"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { ApplicationList } from "@/components/dashboard/application-list";
import { StatsSummary } from "@/components/dashboard/stats-summary";
import { AddApplicationModal } from "@/components/dashboard/add-application-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { KanbanSkeleton } from "@/components/shared/loading-skeleton";
import {
  Plus, Search, LayoutGrid, List, Download, Briefcase,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import type { Application, Tag } from "@prisma/client";

type ApplicationWithTags = Application & { tags: Tag[] };
type ViewMode = "kanban" | "list";

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [applications, setApplications] = useState<ApplicationWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get("view") as ViewMode) || "kanban"
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [sortField, setSortField] = useState(searchParams.get("sort") || "appliedDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("order") as "asc" | "desc") || "desc"
  );

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      params.set("sort", sortField);
      params.set("order", sortOrder);

      const res = await fetch(`/api/applications?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setApplications(data.applications);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (viewMode !== "kanban") params.set("view", viewMode);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
    if (sortField !== "appliedDate") params.set("sort", sortField);
    if (sortOrder !== "desc") params.set("order", sortOrder);

    const newUrl = params.toString()
      ? `?${params.toString()}`
      : "/dashboard";
    router.replace(newUrl, { scroll: false });
  }, [viewMode, debouncedSearch, statusFilter, sortField, sortOrder, router]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "n") {
        e.preventDefault();
        setShowAddModal(true);
      }
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
      if (e.key === "k") {
        e.preventDefault();
        setViewMode((v) => (v === "kanban" ? "list" : "kanban"));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSort(field: string) {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  }

  async function handleExport() {
    try {
      const res = await fetch("/api/export?format=csv");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "applications.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded!");
    } catch {
      toast.error("Failed to export");
    }
  }

  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "SAVED", label: "Saved" },
    { value: "APPLIED", label: "Applied" },
    { value: "PHONE_SCREEN", label: "Phone Screen" },
    { value: "INTERVIEW", label: "Interview" },
    { value: "OFFER", label: "Offer" },
    { value: "REJECTED", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">Dashboard</h1>
          <p className="text-white/40">
            Track and manage your job applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="liquid-glass rounded-xl px-4 py-2 text-sm font-medium text-white/60 hover:text-white/80 transition-colors inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="liquid-glass-strong rounded-xl px-4 py-2 text-sm font-medium text-white/80 hover:scale-105 active:scale-95 transition-transform inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>
      </div>

      <StatsSummary applications={applications} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            id="search-input"
            placeholder="Search applications... (press /)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] pl-9 pr-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 text-sm text-white/60 focus:outline-none focus:ring-1 focus:ring-white/15 transition-colors appearance-none cursor-pointer"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value} className="bg-[#0c0c12] text-white/80">
              {s.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] p-1">
          <button
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${viewMode === "kanban" ? "bg-white/[0.08] text-white/80" : "text-white/40 hover:text-white/60"}`}
            onClick={() => setViewMode("kanban")}
            aria-label="Kanban view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${viewMode === "list" ? "bg-white/[0.08] text-white/80" : "text-white/40 hover:text-white/60"}`}
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <KanbanSkeleton />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Start tracking your job search by adding your first application."
          actionLabel="Add Application"
          onAction={() => setShowAddModal(true)}
        />
      ) : viewMode === "kanban" ? (
        <KanbanBoard applications={applications} onUpdate={fetchApplications} />
      ) : (
        <ApplicationList
          applications={applications}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      <AddApplicationModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchApplications}
      />
    </div>
  );
}
