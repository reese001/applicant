"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Briefcase, LayoutDashboard, FileText, BarChart3, MessageSquare, Settings, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/applications", label: "Applications", icon: Briefcase },
  { href: "/dashboard/resume", label: "Resumes", icon: FileText },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, premium: true },
  { href: "/dashboard/interview-prep", label: "Interview Prep", icon: MessageSquare, premium: true },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 md:hidden" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-lg md:hidden">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Applicant</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.premium && <Sparkles className="h-3 w-3 text-amber-500" />}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
