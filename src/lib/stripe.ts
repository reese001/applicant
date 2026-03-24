import Stripe from "stripe";

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover" as const,
  });
}

let _stripe: ReturnType<typeof getStripeClient> | null = null;
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!_stripe) _stripe = getStripeClient();
    return (_stripe as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLANS = {
  FREE: {
    name: "Free",
    scrapeLimit: 10,
    reminderLimit: 3,
    templateLimit: 2,
  },
  PRO: {
    name: "Pro",
    scrapeLimit: Infinity,
    reminderLimit: Infinity,
    templateLimit: Infinity,
    prices: {
      monthly: {
        id: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
        amount: 1200,
        interval: "month" as const,
      },
      annual: {
        id: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
        amount: 9900,
        interval: "year" as const,
      },
    },
  },
} as const;
