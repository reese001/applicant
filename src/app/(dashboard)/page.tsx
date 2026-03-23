"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { ApplicationList } from "@/components/dashboard/application-list";
import { StatsSummary } from "@/components/dashboard/stats-summary";
import { AddApplicationModal } from "@/components/dashboard/add-application-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { KanbanSkeleton } from "@/components/shared/loading-skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Search, LayoutGrid, List, Download, Briefcase,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import type { Application, Tag } from "@prisma/client";

type ApplicationWithTags = Application & { tags: Tag[] };
type ViewMode = "kanban" | "list";

export default function DashboardPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </div>
      </div>

      <StatsSummary applications={applications} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-input"
            placeholder="Search applications... (press /)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="SAVED">Saved</SelectItem>
            <SelectItem value="APPLIED">Applied</SelectItem>
            <SelectItem value="PHONE_SCREEN">Phone Screen</SelectItem>
            <SelectItem value="INTERVIEW">Interview</SelectItem>
            <SelectItem value="OFFER">Offer</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === "kanban" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            aria-label="Kanban view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
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
