"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UpgradeBanner } from "@/components/layout/upgrade-banner";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <div className={cn("transition-all duration-300", sidebarCollapsed ? "md:ml-16" : "md:ml-64")}>
          <TopNav onMenuClick={() => setMobileNavOpen(true)} />
          <UpgradeBanner />
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
