"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Lock } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isProUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle>{featureName}</CardTitle>
            <CardDescription>
              {description || `${featureName} is available on the Pro plan. Upgrade to unlock this feature.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="gap-2">
              <Link href="/dashboard/settings/billing">
                <Sparkles className="h-4 w-4" />
                Upgrade to Pro
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Starting at $8.25/month. 14-day free trial.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
