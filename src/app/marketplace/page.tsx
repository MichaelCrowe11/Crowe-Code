"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { RefreshCw } from "lucide-react";

const AIAgentMarketplace = dynamic(
  () => import("@/components/marketplace/AIAgentMarketplace"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 h-5 animate-spin text-purple-400" />
          <span className="text-white/60">Loading marketplace...</span>
        </div>
      </div>
    ),
  }
);

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AIAgentMarketplace />
    </Suspense>
  );
}