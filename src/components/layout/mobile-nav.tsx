"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Briefcase, LayoutDashboard, FileText, BarChart3, MessageSquare, Settings, X, Sparkles } from "lucide-react";

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
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a10]/95 backdrop-blur-xl border-r border-white/[0.06] shadow-2xl md:hidden">
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl liquid-glass">
              <Briefcase className="h-4 w-4 text-white/80" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-white/90">Applicant</span>
          </Link>
          <button
            className="h-8 w-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span className="flex-1">{item.label}</span>
                {item.premium && <Sparkles className="h-3 w-3 text-amber-400/60" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
