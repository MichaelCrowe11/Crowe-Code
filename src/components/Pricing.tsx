"use client";

import React, { useState } from "react";
import { Check, X, Sparkles, Zap, Shield, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  limitations?: string[];
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    description: "Perfect for personal projects and learning",
    icon: <Sparkles className="h-6 w-6" />,
    color: "from-gray-400 to-gray-600",
    features: [
      "1,000 AI requests/month",
      "1 GB storage",
      "100 build minutes",
      "Community support",
      "3 private repositories",
      "Basic code completion",
    ],
    limitations: [
      "No custom domains",
      "Limited collaborators",
      "Basic analytics",
    ],
  },
  {
    id: "DEVELOPER",
    name: "Developer",
    price: 29,
    description: "For professional developers and small teams",
    icon: <Zap className="h-6 w-6" />,
    color: "from-blue-400 to-purple-600",
    popular: true,
    features: [
      "50,000 AI requests/month",
      "10 GB storage",
      "1,000 build minutes",
      "Priority email support",
      "50 private repositories",
      "Advanced AI code generation",
      "1 custom domain",
      "5 collaborators",
      "GitHub/GitLab integration",
      "Advanced analytics",
    ],
    limitations: [],
  },
  {
    id: "TEAM",
    name: "Team",
    price: 99,
    description: "Scale your development with powerful collaboration",
    icon: <Shield className="h-6 w-6" />,
    color: "from-purple-400 to-pink-600",
    features: [
      "200,000 AI requests/month",
      "50 GB storage",
      "5,000 build minutes",
      "Priority support",
      "200 private repositories",
      "AI pair programming",
      "5 custom domains",
      "20 collaborators",
      "SSO authentication",
      "Team analytics",
      "Code review AI",
      "Deployment pipelines",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 299,
    description: "Ultimate power for large organizations",
    icon: <Crown className="h-6 w-6" />,
    color: "from-yellow-400 to-orange-600",
    features: [
      "Unlimited AI requests",
      "500 GB storage",
      "Unlimited build minutes",
      "24/7 dedicated support",
      "Unlimited repositories",
      "Custom AI models",
      "Unlimited domains",
      "Unlimited collaborators",
      "Enterprise SSO",
      "Advanced security",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option",
    ],
  },
];

export default function Pricing() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const handleUpgrade = async (planId: string) => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard?tab=billing");
      return;
    }

    if (planId === "FREE") {
      return; // Already on free plan
    }

    setLoading(planId);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error starting checkout:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const getPrice = (plan: PricingPlan) => {
    if (plan.price === 0) return 0;
    return billingPeriod === "yearly"
      ? Math.floor(plan.price * 10) // 2 months free
      : plan.price;
  };

  const getSavings = (plan: PricingPlan) => {
    if (plan.price === 0) return 0;
    return plan.price * 2; // 2 months free
  };

  return (
    <div className="py-12 px-4">
      {/* Billing Period Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-zinc-800/50 rounded-lg p-1 flex">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === "monthly"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === "yearly"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl bg-zinc-900/50 border ${
              plan.popular
                ? "border-blue-500/50 shadow-lg shadow-blue-500/20"
                : "border-white/10"
            } p-6 flex flex-col`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            {/* Header */}
            <div className="mb-6">
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${plan.color} mb-4`}>
                {plan.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">
                  ${getPrice(plan)}
                </span>
                <span className="text-gray-400">
                  /{billingPeriod === "yearly" ? "year" : "month"}
                </span>
              </div>
              {billingPeriod === "yearly" && plan.price > 0 && (
                <p className="text-xs text-green-400 mt-1">
                  Save ${getSavings(plan)} per year
                </p>
              )}
            </div>

            {/* Features */}
            <div className="flex-1">
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
                {plan.limitations?.map((limitation, i) => (
                  <li key={`limit-${i}`} className="flex items-start gap-2 opacity-60">
                    <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-500">{limitation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={loading === plan.id}
              className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                plan.popular
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25"
                  : plan.id === "FREE"
                  ? "bg-zinc-800 text-gray-400 cursor-default"
                  : "bg-white/10 hover:bg-white/20 text-white"
              } ${loading === plan.id ? "opacity-50 cursor-wait" : ""}`}
            >
              {loading === plan.id ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : plan.id === "FREE" ? (
                "Current Plan"
              ) : (
                "Get Started"
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Enterprise Contact */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-400 mb-4">
          Need more? Looking for custom solutions?
        </p>
        <button
          onClick={() => router.push("/contact?subject=enterprise")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          <Crown className="h-5 w-5" />
          Contact Sales for Enterprise
        </button>
      </div>

      {/* Features Comparison Link */}
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push("/pricing/compare")}
          className="text-sm text-blue-400 hover:text-blue-300 underline"
        >
          View detailed feature comparison →
        </button>
      </div>
    </div>
  );
}