"use client";

import { useState, useEffect } from "react";
import type { Plan } from "@prisma/client";

interface SubscriptionState {
  plan: Plan;
  isProUser: boolean;
  loading: boolean;
}

export function useSubscription(): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>({
    plan: "FREE",
    isProUser: false,
    loading: true,
  });

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        const plan = session?.user?.plan || "FREE";
        setState({ plan, isProUser: plan === "PRO", loading: false });
      } catch {
        setState({ plan: "FREE", isProUser: false, loading: false });
      }
    }
    fetchPlan();
  }, []);

  return state;
}
