"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ApplicationList } from "@/components/dashboard/application-list";
import { AddApplicationModal } from "@/components/dashboard/add-application-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ListSkeleton } from "@/components/shared/loading-skeleton";
import { Plus, Search, Briefcase } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import type { Application, Tag } from "@prisma/client";

type ApplicationWithTags = Application & { tags: Tag[] };

export default function ApplicationsPage() {
  return (
    <Suspense>
      <ApplicationsContent />
    </Suspense>
  );
}

function ApplicationsContent() {
  const searchParams = useSearchParams();

  const [applications, setApplications] = useState<ApplicationWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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

  function handleSort(field: string) {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  }

  const statusOptions = [
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
          <h1 className="text-2xl font-bold tracking-tight text-white/90">Applications</h1>
          <p className="text-white/40">All your job applications in one place</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="liquid-glass-strong rounded-xl px-4 py-2 text-sm font-medium text-white/80 hover:scale-105 active:scale-95 transition-transform inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Application
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            placeholder="Search applications..."
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
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value} className="bg-[#0c0c12] text-white/80">
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications found"
          description={searchQuery || statusFilter !== "all"
            ? "Try adjusting your filters"
            : "Start tracking your job search by adding your first application."}
          actionLabel={!searchQuery && statusFilter === "all" ? "Add Application" : undefined}
          onAction={!searchQuery && statusFilter === "all" ? () => setShowAddModal(true) : undefined}
        />
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
