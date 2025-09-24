"use client";

import React from "react";
import { siteConfig } from "@/config/site";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface CroweCodeLogoProps {
  size?: Size;
  showText?: boolean;
  showTagline?: boolean;
  animate?: boolean;
  className?: string;
}

const sizeMap: Record<Size, { text: string; cursor: string }> = {
  xs: { text: "text-xs", cursor: "h-3" },
  sm: { text: "text-sm", cursor: "h-3.5" },
  md: { text: "text-base", cursor: "h-4" },
  lg: { text: "text-lg", cursor: "h-5" },
  xl: { text: "text-xl", cursor: "h-6" },
};

export default function CroweCodeLogo({
  size = "md",
  showText = true,
  showTagline = false,
  animate = true,
  className = "",
}: CroweCodeLogoProps) {
  const { text, cursor } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Wordmark built in code style */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-mono ${text} tracking-tight cc-text-gradient`}>
              crowe<span className="opacity-70">/</span>code
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-white/70 bg-white/5">
              BETA
            </span>
          </div>
          {showTagline && (
            <span className={`text-[10px] md:text-xs text-white/50 font-normal`}>{siteConfig.branding.tagline}</span>
          )}
        </div>
      )}

      {/* Blinking cursor accent */}
      {animate && (
        <span
          aria-hidden
          className={`ml-1 w-[2px] ${cursor} rounded-sm bg-white/80 animate-pulse`}
        />
      )}
    </div>
  );
}
