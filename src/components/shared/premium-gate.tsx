"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { Sparkles, Lock } from "lucide-react";
import Link from "next/link";

interface PremiumGateProps {
  children: React.ReactNode;
  featureName: string;
  description?: string;
}

export function PremiumGate({ children, featureName, description }: PremiumGateProps) {
  const { isProUser, loading } = useSubscription();

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 w-48 rounded-lg bg-white/[0.04] animate-pulse" />
        <div className="h-64 w-full rounded-2xl bg-white/[0.04] animate-pulse" />
      </div>
    );
  }

  if (!isProUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="liquid-glass-strong rounded-3xl max-w-md w-full text-center p-10">
          <div className="flex justify-center mb-6">
            <div className="rounded-2xl bg-white/[0.06] p-5">
              <Lock className="h-8 w-8 text-white/40" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white/90 mb-2">{featureName}</h3>
          <p className="text-sm text-white/40 leading-relaxed mb-8">
            {description || `${featureName} is available on the Pro plan. Upgrade to unlock this feature.`}
          </p>
          <Link
            href="/dashboard/settings/billing"
            className="liquid-glass-strong rounded-xl inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white/80 hover:scale-105 active:scale-95 transition-transform"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Pro
          </Link>
          <p className="text-xs text-white/25 mt-4">
            Starting at $8.25/month. 14-day free trial.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
