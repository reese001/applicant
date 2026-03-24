"use client";

import Link from "next/link";
import { useSubscription } from "@/hooks/use-subscription";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

export function UpgradeBanner() {
  const { isProUser, loading } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  if (loading || isProUser || dismissed) return null;

  return (
    <div className="mx-4 md:mx-6 lg:mx-8 mt-4">
      <div className="flex items-center gap-3 rounded-2xl liquid-glass p-3.5">
        <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-white/[0.06] shrink-0">
          <Sparkles className="h-4 w-4 text-amber-400/70" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/80">Upgrade to Pro</p>
          <p className="text-xs text-white/35">Unlock AI tools, analytics, and more</p>
        </div>
        <Link
          href="/dashboard/settings/billing"
          className="shrink-0 h-8 px-4 text-xs font-medium rounded-lg liquid-glass-strong flex items-center hover:scale-105 active:scale-95 transition-transform text-white/80"
        >
          Upgrade
        </Link>
        <button
          className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
