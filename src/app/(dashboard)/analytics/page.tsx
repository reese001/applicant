"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumGate } from "@/components/shared/premium-gate";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Application } from "@prisma/client";

export default function AnalyticsPage() {
  return (
    <PremiumGate featureName="Application Analytics" description="Get insights into your job search with detailed analytics and charts.">
      <AnalyticsContent />
    </PremiumGate>
  );
}

function AnalyticsContent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/applications?limit=1000");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setApplications(data.applications);
      } catch {
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const statusCounts: Record<string, number> = {};
  applications.forEach((app) => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  });

  const total = applications.length;
  const applied = applications.filter((a) => a.status !== "SAVED").length;
  const responded = applications.filter((a) => !["SAVED", "APPLIED"].includes(a.status)).length;
  const responseRate = applied > 0 ? Math.round((responded / applied) * 100) : 0;

  const funnelStages = [
    { name: "Saved", count: statusCounts["SAVED"] || 0, color: "bg-gray-400" },
    { name: "Applied", count: statusCounts["APPLIED"] || 0, color: "bg-blue-500" },
    { name: "Phone Screen", count: statusCounts["PHONE_SCREEN"] || 0, color: "bg-purple-500" },
    { name: "Interview", count: statusCounts["INTERVIEW"] || 0, color: "bg-amber-500" },
    { name: "Offer", count: statusCounts["OFFER"] || 0, color: "bg-green-500" },
  ];

  const maxCount = Math.max(...funnelStages.map((s) => s.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Insights into your job search progress</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Applications</p>
            <p className="text-3xl font-bold mt-1">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Response Rate</p>
            <p className="text-3xl font-bold mt-1">{responseRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Interviews</p>
            <p className="text-3xl font-bold mt-1">{statusCounts["INTERVIEW"] || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Offers</p>
            <p className="text-3xl font-bold mt-1 text-green-600">{statusCounts["OFFER"] || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnelStages.map((stage) => (
              <div key={stage.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{stage.name}</span>
                  <span className="font-medium">{stage.count}</span>
                </div>
                <div className="h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all`}
                    style={{ width: `${(stage.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => {
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${
                        status === "OFFER" ? "bg-green-500" :
                        status === "REJECTED" ? "bg-red-500" :
                        status === "INTERVIEW" ? "bg-amber-500" :
                        status === "APPLIED" ? "bg-blue-500" :
                        "bg-gray-400"
                      }`} />
                      <span className="text-sm">{status.replace("_", " ")}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
