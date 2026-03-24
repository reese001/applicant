"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Briefcase, LayoutDashboard, FileText, BarChart3, MessageSquare, Settings, CreditCard, LogOut, ChevronLeft, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/applications", label: "Applications", icon: Briefcase },
  { href: "/dashboard/resume", label: "Resumes", icon: FileText },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, premium: true },
  { href: "/dashboard/interview-prep", label: "Interview Prep", icon: MessageSquare, premium: true },
];

const bottomNavItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/settings/billing", label: "Billing", icon: CreditCard },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen hidden md:flex flex-col transition-all duration-300",
      "bg-white/[0.02] backdrop-blur-xl border-r border-white/[0.06]",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl liquid-glass shrink-0">
              <Briefcase className="h-4 w-4 text-white/80" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-white/90">Applicant</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl liquid-glass">
              <Briefcase className="h-4 w-4 text-white/80" />
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "h-8 w-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col justify-between h-full px-3 py-4">
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                  {!collapsed && item.premium && <Sparkles className="h-3 w-3 text-amber-400/60" />}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pt-4">
            <div className="h-px bg-white/[0.06] mb-4" />
            <nav className="space-y-1">
              {bottomNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-white/40 hover:text-white/70 hover:bg-white/[0.04]",
                  collapsed && "justify-center px-2"
                )}
              >
                <LogOut className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span>Sign Out</span>}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}
