"use client";

import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";

const MultiCloudDeployment = dynamic(
  () => import("@/components/deployment/MultiCloudDeployment"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
          <span className="text-white/60">Loading Multi-Cloud Deployment...</span>
        </div>
      </div>
    ),
  }
);

export default function MultiCloudPage() {
  return <MultiCloudDeployment />;
}