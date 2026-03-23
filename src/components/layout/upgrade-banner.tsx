"use client";

import Link from "next/link";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

export function UpgradeBanner() {
  const { isProUser, loading } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  if (loading || isProUser || dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 mx-4 mt-4">
      <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-6 w-6" onClick={() => setDismissed(true)}>
        <X className="h-3 w-3" />
      </Button>
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Upgrade to Pro</p>
          <p className="text-xs text-muted-foreground mt-1">Unlock AI resume builder, interview prep, analytics, and more.</p>
          <Button asChild size="sm" className="mt-3">
            <Link href="/dashboard/settings/billing">View Plans</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
