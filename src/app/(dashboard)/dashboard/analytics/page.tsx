"use client";

import { useState, useEffect, useMemo } from "react";
import { PremiumGate } from "@/components/shared/premium-gate";
import { toast } from "sonner";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { format, parseISO, startOfMonth } from "date-fns";
import type { Application } from "@prisma/client";

const STATUS_COLORS: Record<string, string> = {
  SAVED: "#9ca3af",
  APPLIED: "#3b82f6",
  PHONE_SCREEN: "#a855f7",
  INTERVIEW: "#f59e0b",
  OFFER: "#22c55e",
  REJECTED: "#ef4444",
  WITHDRAWN: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  PHONE_SCREEN: "Phone Screen",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

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

  const stats = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    applications.forEach((app) => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    const total = applications.length;
    const applied = applications.filter((a) => a.status !== "SAVED").length;
    const responded = applications.filter((a) => !["SAVED", "APPLIED"].includes(a.status)).length;
    const responseRate = applied > 0 ? Math.round((responded / applied) * 100) : 0;

    const pieData = Object.entries(statusCounts).map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status] || "#9ca3af",
    }));

    const funnelData = [
      { name: "Saved", count: statusCounts["SAVED"] || 0 },
      { name: "Applied", count: statusCounts["APPLIED"] || 0 },
      { name: "Phone Screen", count: statusCounts["PHONE_SCREEN"] || 0 },
      { name: "Interview", count: statusCounts["INTERVIEW"] || 0 },
      { name: "Offer", count: statusCounts["OFFER"] || 0 },
    ];

    const monthlyMap: Record<string, number> = {};
    applications.forEach((app) => {
      const month = format(startOfMonth(parseISO(String(app.appliedDate))), "yyyy-MM");
      monthlyMap[month] = (monthlyMap[month] || 0) + 1;
    });
    const timelineData = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month: format(parseISO(`${month}-01`), "MMM yyyy"),
        applications: count,
      }));

    const monthlyResponseMap: Record<string, { applied: number; responded: number }> = {};
    applications.forEach((app) => {
      const month = format(startOfMonth(parseISO(String(app.appliedDate))), "yyyy-MM");
      if (!monthlyResponseMap[month]) monthlyResponseMap[month] = { applied: 0, responded: 0 };
      if (app.status !== "SAVED") {
        monthlyResponseMap[month].applied++;
        if (!["SAVED", "APPLIED"].includes(app.status)) {
          monthlyResponseMap[month].responded++;
        }
      }
    });
    const responseData = Object.entries(monthlyResponseMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: format(parseISO(`${month}-01`), "MMM yyyy"),
        rate: data.applied > 0 ? Math.round((data.responded / data.applied) * 100) : 0,
      }));

    return { total, responseRate, statusCounts, pieData, funnelData, timelineData, responseData };
  }, [applications]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-white/90">Analytics</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white/90">Analytics</h1>
        <p className="text-white/40">Insights into your job search progress</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Applications", value: stats.total },
          { label: "Response Rate", value: `${stats.responseRate}%` },
          { label: "Interviews", value: stats.statusCounts["INTERVIEW"] || 0 },
          { label: "Offers", value: stats.statusCounts["OFFER"] || 0, accent: true },
        ].map((stat) => (
          <div key={stat.label} className="liquid-glass rounded-2xl p-6">
            <p className="text-sm text-white/40">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.accent ? "text-emerald-400" : "text-white/90"}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="liquid-glass-strong rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4">Pipeline Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "rgba(12,12,18,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "rgba(255,255,255,0.8)" }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {stats.funnelData.map((entry, index) => {
                  const statusKey = ["SAVED", "APPLIED", "PHONE_SCREEN", "INTERVIEW", "OFFER"][index];
                  return <Cell key={index} fill={STATUS_COLORS[statusKey]} fillOpacity={0.7} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="liquid-glass-strong rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {stats.pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.7} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "rgba(12,12,18,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "rgba(255,255,255,0.8)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="liquid-glass-strong rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4">Applications Over Time</h3>
          {stats.timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" fontSize={12} tick={{ fill: "rgba(255,255,255,0.4)" }} />
                <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "rgba(12,12,18,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "rgba(255,255,255,0.8)" }}
                />
                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)" }} />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-white/30 text-center py-12">No data yet</p>
          )}
        </div>

        <div className="liquid-glass-strong rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4">Response Rate Over Time</h3>
          {stats.responseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.responseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" fontSize={12} tick={{ fill: "rgba(255,255,255,0.4)" }} />
                <YAxis unit="%" domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Response Rate"]}
                  contentStyle={{ background: "rgba(12,12,18,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "rgba(255,255,255,0.8)" }}
                />
                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)" }} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Response Rate"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-white/30 text-center py-12">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
