"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/application/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatSalary } from "@/lib/utils";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import type { Application, Tag } from "@prisma/client";

type ApplicationWithTags = Application & { tags: Tag[] };

interface ApplicationListProps {
  applications: ApplicationWithTags[];
  sortField: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
}

export function ApplicationList({
  applications,
  sortField,
  sortOrder,
  onSort,
}: ApplicationListProps) {
  const headers = [
    { key: "jobTitle", label: "Job Title" },
    { key: "company", label: "Company" },
    { key: "location", label: "Location" },
    { key: "status", label: "Status" },
    { key: "appliedDate", label: "Applied" },
    { key: "salaryMin", label: "Salary" },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.01] backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              {headers.map((header) => (
                <th key={header.key} className="px-4 py-3 text-left font-medium">
                  <button
                    className="flex items-center gap-1 text-white/50 hover:text-white/80 transition-colors"
                    onClick={() => onSort(header.key)}
                  >
                    {header.label}
                    <ArrowUpDown className={`h-3 w-3 ${sortField === header.key ? "text-white/70" : "text-white/20"}`} />
                    {sortField === header.key && <span className="sr-only">{sortOrder === "asc" ? "ascending" : "descending"}</span>}
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium text-white/50">Tags</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr
                key={app.id}
                className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/applications/${app.id}`}
                    className="font-medium text-white/80 hover:text-white transition-colors"
                  >
                    {app.jobTitle}
                  </Link>
                </td>
                <td className="px-4 py-3 text-white/40">{app.company}</td>
                <td className="px-4 py-3 text-white/40">
                  {app.location || "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-4 py-3 text-white/40">
                  {formatDate(app.appliedDate)}
                </td>
                <td className="px-4 py-3 text-white/40">
                  {formatSalary(app.salaryMin, app.salaryMax, app.salaryCurrency || "USD") || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {app.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs bg-white/[0.04] border-white/[0.08]"
                        style={{ borderColor: tag.color, color: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {app.url && (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/30 hover:text-white/60 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
