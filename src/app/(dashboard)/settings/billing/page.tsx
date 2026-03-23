"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Check, Loader2, Sparkles, Crown } from "lucide-react";
import { useEffect } from "react";

const features = {
  free: [
    "Unlimited job tracking",
    "10 URL scrapes/month",
    "3 active reminders",
    "2 basic resume templates",
    "CSV export",
  ],
  pro: [
    "Everything in Free",
    "Unlimited URL scrapes",
    "Unlimited reminders",
    "20+ resume templates",
    "AI Resume Builder",
    "AI Resume Tailor",
    "Cover Letter Generator",
    "AI Interview Prep",
    "ATS Score Checker",
    "Full Analytics Dashboard",
    "CSV + JSON export",
    "Priority support",
  ],
};

export default function BillingPage() {
  const { plan, isProUser, loading: planLoading } = useSubscription();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated! Welcome to Pro.");
    }
    if (searchParams.get("canceled") === "true") {
      toast.info("Checkout canceled.");
    }
  }, [searchParams]);

  async function handleCheckout(priceType: "monthly" | "annual") {
    const priceId = priceType === "monthly"
      ? process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID
      : process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID;

    setLoading(priceType);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) throw new Error();
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error("Failed to start checkout");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {isProUser && (
        <Card className="border-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold text-lg">Pro Plan Active</h3>
                <p className="text-sm text-muted-foreground">
                  You have access to all premium features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className={!isProUser ? "border-2" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Free
              {!isProUser && <Badge>Current Plan</Badge>}
            </CardTitle>
            <CardDescription>For getting started</CardDescription>
            <div className="pt-2">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {features.free.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className={isProUser ? "border-primary border-2" : "border-primary/50"}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Pro
              </div>
              {isProUser && <Badge className="bg-primary">Current Plan</Badge>}
            </CardTitle>
            <CardDescription>For serious job seekers</CardDescription>
            <div className="pt-2 space-y-1">
              <div>
                <span className="text-3xl font-bold">$12</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-muted-foreground">
                or $99/year (~$8.25/month)
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.pro.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {!isProUser && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => handleCheckout("monthly")}
                    disabled={!!loading}
                  >
                    {loading === "monthly" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Subscribe Monthly - $12/mo
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleCheckout("annual")}
                    disabled={!!loading}
                  >
                    {loading === "annual" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Subscribe Annual - $99/yr (Save 31%)
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    14-day free trial. Cancel anytime.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
