"use client";

import { useState, useEffect, useCallback } from "react";
import type { Application, Tag } from "@prisma/client";

type ApplicationWithTags = Application & { tags: Tag[] };

interface UseApplicationsOptions {
  status?: string;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  tag?: string;
}

export function useApplications(options: UseApplicationsOptions = {}) {
  const [applications, setApplications] = useState<ApplicationWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (options.status) params.set("status", options.status);
      if (options.search) params.set("search", options.search);
      if (options.sort) params.set("sort", options.sort);
      if (options.order) params.set("order", options.order);
      if (options.tag) params.set("tag", options.tag);

      const res = await fetch(`/api/applications?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      setApplications(data.applications);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [options.status, options.search, options.sort, options.order, options.tag]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { applications, loading, error, refetch: fetchApplications, setApplications };
}
