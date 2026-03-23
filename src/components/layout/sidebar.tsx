"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Briefcase, LayoutDashboard, FileText, BarChart3, MessageSquare, Settings, CreditCard, LogOut, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
    <aside className={cn("fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 hidden md:block", collapsed ? "w-16" : "w-64")}>
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Applicant</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <Briefcase className="h-6 w-6 text-primary" />
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className={cn("h-8 w-8", collapsed && "hidden")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 h-[calc(100vh-3.5rem)]">
        <div className="flex flex-col justify-between h-full p-3">
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <Link key={item.href} href={item.href}
                className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  collapsed && "justify-center px-2")}>
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.premium && <Sparkles className="h-3 w-3 text-amber-500" />}
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
            <Separator className="my-3" />
            <nav className="space-y-1">
              {bottomNavItems.map((item) => (
                <Link key={item.href} href={item.href}
                  className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    collapsed && "justify-center px-2")}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
              <button onClick={() => signOut({ callbackUrl: "/login" })}
                className={cn("flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground", collapsed && "justify-center px-2")}>
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Sign Out</span>}
              </button>
            </nav>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
