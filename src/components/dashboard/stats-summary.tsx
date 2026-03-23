"use client";

import { Card, CardContent } from "@/components/ui/card";
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
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-100 dark:bg-gray-800",
    },
    {
      label: "Applied",
      value: applications.filter((a) => a.status === "APPLIED").length,
      icon: Send,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900",
    },
    {
      label: "Phone Screen",
      value: applications.filter((a) => a.status === "PHONE_SCREEN").length,
      icon: Phone,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900",
    },
    {
      label: "Interview",
      value: applications.filter((a) => a.status === "INTERVIEW").length,
      icon: Users,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900",
    },
    {
      label: "Offers",
      value: applications.filter((a) => a.status === "OFFER").length,
      icon: Trophy,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900",
    },
    {
      label: "Rejected",
      value: applications.filter((a) => a.status === "REJECTED").length,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
