"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/application/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatSalary } from "@/lib/utils";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {headers.map((header) => (
                <th key={header.key} className="px-4 py-3 text-left font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => onSort(header.key)}
                  >
                    {header.label}
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortField === header.key ? "text-foreground" : ""}`} />
                    {sortField === header.key && <span className="sr-only">{sortOrder === "asc" ? "ascending" : "descending"}</span>}
                  </Button>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium">Tags</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr
                key={app.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/applications/${app.id}`}
                    className="font-medium hover:underline text-primary"
                  >
                    {app.jobTitle}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{app.company}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {app.location || "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(app.appliedDate)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatSalary(app.salaryMin, app.salaryMax, app.salaryCurrency || "USD") || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {app.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs"
                        style={{ borderColor: tag.color }}
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
                      className="text-muted-foreground hover:text-foreground"
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
