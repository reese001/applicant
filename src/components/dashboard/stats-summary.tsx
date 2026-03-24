"use client";

import { Briefcase, Send, Phone, Users, Trophy, XCircle } from "lucide-react";
import type { Application } from "@prisma/client";

interface StatsSummaryProps {
  applications: Application[];
}

export function StatsSummary({ applications }: StatsSummaryProps) {
  const stats = [
    {
      label: "Total",
      value: applications.length,
      icon: Briefcase,
      color: "text-white/70",
      bg: "bg-white/[0.06]",
    },
    {
      label: "Applied",
      value: applications.filter((a) => a.status === "APPLIED").length,
      icon: Send,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Phone Screen",
      value: applications.filter((a) => a.status === "PHONE_SCREEN").length,
      icon: Phone,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Interview",
      value: applications.filter((a) => a.status === "INTERVIEW").length,
      icon: Users,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Offers",
      value: applications.filter((a) => a.status === "OFFER").length,
      icon: Trophy,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Rejected",
      value: applications.filter((a) => a.status === "REJECTED").length,
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="liquid-glass rounded-2xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-2 ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-white/90">{stat.value}</p>
              <p className="text-xs text-white/40">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
