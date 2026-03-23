"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationList } from "@/components/dashboard/application-list";
import { AddApplicationModal } from "@/components/dashboard/add-application-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ListSkeleton } from "@/components/shared/loading-skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Briefcase } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import type { Application, Tag } from "@prisma/client";

type ApplicationWithTags = Application & { tags: Tag[] };

export default function ApplicationsPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">All your job applications in one place</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
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
