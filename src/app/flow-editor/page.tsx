"use client";

import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";

const VisualCodeFlowEditor = dynamic(
  () => import("@/components/flow-editor/VisualCodeFlowEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
          <span className="text-white/60">Loading Visual Code Flow Editor...</span>
        </div>
      </div>
    ),
  }
);

export default function FlowEditorPage() {
  return <VisualCodeFlowEditor />;
}