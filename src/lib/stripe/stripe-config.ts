import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("⚠️ STRIPE_SECRET_KEY is not set. Stripe features will be disabled.");
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    })
  : null;

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

// Subscription Plans with IDs
export const PLANS = {
  FREE: {
    id: "FREE",
    name: "Free",
    priceId: null,
    price: 0,
    features: {
      aiRequests: 1000,
      storageGB: 1,
      buildMinutes: 100,
      apiCalls: 10000,
      collaborators: 1,
      privateRepos: 3,
      customDomains: 0,
      support: "Community",
    },
  },
  DEVELOPER: {
    id: "DEVELOPER",
    name: "CroweCode Pro",
    priceId: process.env.CROWECODE_PRO_PRICE_ID || process.env.STRIPE_DEVELOPER_PRICE_ID || "",
    price: 20,
    features: {
      aiRequests: 1000,
      storageGB: 25,
      buildMinutes: 1000,
      apiCalls: 100000,
      collaborators: 3,
      privateRepos: 50,
      customDomains: 1,
      support: "Priority Email",
    },
  },
  TEAM: {
    id: "TEAM",
    name: "CroweCode Team",
    priceId: process.env.CROWECODE_TEAM_PRICE_ID || process.env.STRIPE_TEAM_PRICE_ID || "",
    price: 200,
    features: {
      aiRequests: 10000,
      storageGB: 100,
      buildMinutes: 5000,
      apiCalls: 500000,
      collaborators: 20,
      privateRepos: 200,
      customDomains: 5,
      support: "Priority Support",
    },
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "CroweCode Enterprise+",
    priceId: process.env.CROWECODE_ENTERPRISE_PLUS_PRICE_ID || process.env.STRIPE_ENTERPRISE_PRICE_ID || "",
    price: 299,
    features: {
      aiRequests: -1, // Unlimited
      storageGB: 500,
      buildMinutes: -1,
      apiCalls: -1,
      collaborators: -1,
      privateRepos: -1,
      customDomains: -1,
      support: "24/7 Dedicated",
    },
  },
};

// Usage-based pricing for overages
export const USAGE_PRICING = {
  AI_REQUEST: {
    unitAmount: 0.001, // $0.001 per AI request over limit
    currency: "usd",
    meteredPriceId: process.env.STRIPE_AI_REQUEST_PRICE_ID || "",
  },
  STORAGE_GB: {
    unitAmount: 0.10, // $0.10 per GB per month over limit
    currency: "usd",
    meteredPriceId: process.env.STRIPE_STORAGE_PRICE_ID || "",
  },
  BUILD_MINUTES: {
    unitAmount: 0.02, // $0.02 per build minute over limit
    currency: "usd",
    meteredPriceId: process.env.STRIPE_BUILD_MINUTES_PRICE_ID || "",
  },
  COMPUTE_CREDITS: {
    unitAmount: 2.00, // $2.00 per compute credit hour
    currency: "usd",
    meteredPriceId: process.env.CROWECODE_COMPUTE_CREDITS_PRICE_ID || "",
  },
};

// Helper to get plan by tier
export function getPlanByTier(tier: string) {
  return PLANS[tier as keyof typeof PLANS] || PLANS.FREE;
}

// Helper to check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PUBLISHABLE_KEY;
}