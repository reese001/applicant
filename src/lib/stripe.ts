import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
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
