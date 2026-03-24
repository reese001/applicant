"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { toast } from "sonner";
import { Check, Loader2, Sparkles, Crown, CreditCard, XCircle } from "lucide-react";

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
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  );
}

function BillingContent() {
  const { isProUser } = useSubscription();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

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

  async function handleManageBilling() {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error("Failed to open billing portal");
      setLoading(null);
    }
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel your subscription? You'll keep access until the end of the current billing period.")) return;

    setCanceling(true);
    try {
      const res = await fetch("/api/stripe/cancel", { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Subscription will cancel at the end of the billing period");
    } catch {
      toast.error("Failed to cancel subscription");
    } finally {
      setCanceling(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white/90">Billing</h1>
        <p className="text-white/40">Manage your subscription and billing</p>
      </div>

      {isProUser && (
        <div className="liquid-glass-strong rounded-2xl p-6 border border-primary/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold text-lg text-white/90">Pro Plan Active</h3>
                <p className="text-sm text-white/40">
                  You have access to all premium features.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManageBilling}
                disabled={loading === "portal"}
                className="liquid-glass rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white/80 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                {loading === "portal" && <Loader2 className="h-4 w-4 animate-spin" />}
                <CreditCard className="h-4 w-4" />
                Manage Billing
              </button>
              <button
                onClick={handleCancel}
                disabled={canceling}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                {canceling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Free Plan */}
        <div className={`liquid-glass rounded-2xl p-6 ${!isProUser ? "ring-1 ring-white/10" : ""}`}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-white/85">Free</h3>
            {!isProUser && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/[0.08] text-white/60">Current Plan</span>
            )}
          </div>
          <p className="text-sm text-white/35 mb-3">For getting started</p>
          <div className="mb-6">
            <span className="text-3xl font-bold text-white/90">$0</span>
            <span className="text-white/40">/month</span>
          </div>
          <ul className="space-y-2.5">
            {features.free.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-white/60">
                <Check className="h-4 w-4 text-emerald-400/60 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro Plan */}
        <div className={`liquid-glass-strong rounded-2xl p-6 ${isProUser ? "ring-1 ring-primary/30" : "ring-1 ring-primary/20"}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-white/85">Pro</h3>
            </div>
            {isProUser && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/20 text-primary">Current Plan</span>
            )}
          </div>
          <p className="text-sm text-white/35 mb-3">For serious job seekers</p>
          <div className="mb-1">
            <span className="text-3xl font-bold text-white/90">$12</span>
            <span className="text-white/40">/month</span>
          </div>
          <p className="text-xs text-white/30 mb-6">
            or $99/year (~$8.25/month)
          </p>

          <ul className="space-y-2.5">
            {features.pro.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-white/60">
                <Check className="h-4 w-4 text-emerald-400/60 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          {!isProUser && (
            <>
              <div className="h-px bg-white/[0.06] my-6" />
              <div className="space-y-2">
                <button
                  onClick={() => handleCheckout("monthly")}
                  disabled={!!loading}
                  className="liquid-glass-strong rounded-xl w-full py-3 text-sm font-medium text-white/80 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
                >
                  {loading === "monthly" && <Loader2 className="h-4 w-4 animate-spin" />}
                  Subscribe Monthly - $12/mo
                </button>
                <button
                  onClick={() => handleCheckout("annual")}
                  disabled={!!loading}
                  className="liquid-glass rounded-xl w-full py-3 text-sm font-medium text-white/60 hover:text-white/80 transition-colors disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
                >
                  {loading === "annual" && <Loader2 className="h-4 w-4 animate-spin" />}
                  Subscribe Annual - $99/yr (Save 31%)
                </button>
                <p className="text-xs text-center text-white/25">
                  14-day free trial. Cancel anytime.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
