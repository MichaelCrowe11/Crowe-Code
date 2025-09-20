"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface HolographicDisplayProps {
  children: React.ReactNode;
  variant?: "card" | "panel" | "button" | "badge" | "tooltip";
  interactive?: boolean;
  intensity?: number;
  color?: string;
  glitchEffect?: boolean;
}

export default function HolographicDisplay({
  children,
  variant = "card",
  interactive = true,
  intensity = 1,
  color = "59, 130, 246", // RGB blue
  glitchEffect = false,
}: HolographicDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3D rotation based on mouse position
  const rotateX = useTransform(mouseY, [-100, 100], [10, -10]);
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Holographic scanline effect
  useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;
    let animationId: number;
    let scanlinePosition = 0;

    const animateScanline = () => {
      scanlinePosition += 1;
      if (scanlinePosition > element.offsetHeight + 100) {
        scanlinePosition = -100;
      }

      const scanline = element.querySelector(".holographic-scanline") as HTMLElement;
      if (scanline) {
        scanline.style.transform = `translateY(${scanlinePosition}px)`;
      }

      animationId = requestAnimationFrame(animateScanline);
    };

    animateScanline();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const variants = {
    card: "p-6 rounded-2xl",
    panel: "p-4 rounded-lg",
    button: "px-4 py-2 rounded-lg",
    badge: "px-2 py-1 rounded-full text-xs",
    tooltip: "p-3 rounded-lg",
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative ${variants[variant]} overflow-hidden`}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
        rotateX: interactive ? rotateX : 0,
        rotateY: interactive ? rotateY : 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={interactive ? { scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Holographic base layer */}
      <div
        className="absolute inset-0 rounded-inherit"
        style={{
          background: `linear-gradient(135deg,
            rgba(${color}, ${0.1 * intensity}) 0%,
            rgba(${color}, ${0.05 * intensity}) 50%,
            rgba(${color}, ${0.1 * intensity}) 100%)`,
          border: `1px solid rgba(${color}, ${0.3 * intensity})`,
          backdropFilter: "blur(10px)",
        }}
      />

      {/* Holographic grid pattern */}
      <div className="absolute inset-0 opacity-20 rounded-inherit">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="holographic-grid"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="20"
                stroke={`rgba(${color}, 0.3)`}
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1="0"
                x2="20"
                y2="0"
                stroke={`rgba(${color}, 0.3)`}
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#holographic-grid)" />
        </svg>
      </div>

      {/* Holographic reflection */}
      <div
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{
          background: `linear-gradient(105deg,
            transparent 40%,
            rgba(${color}, ${0.1 * intensity}) 50%,
            transparent 60%)`,
          transform: "translateX(-100%)",
          animation: isHovered ? "holographic-shine 1s ease-in-out" : "none",
        }}
      />

      {/* Scanline effect */}
      <div
        className="holographic-scanline absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background: `linear-gradient(90deg,
            transparent,
            rgba(${color}, ${0.5 * intensity}),
            transparent)`,
          height: "2px",
          filter: "blur(1px)",
        }}
      />

      {/* Chromatic aberration for depth */}
      <div className="absolute inset-0 rounded-inherit pointer-events-none">
        <div
          className="absolute inset-0 rounded-inherit"
          style={{
            background: `linear-gradient(45deg,
              rgba(255, 0, 0, ${0.03 * intensity}),
              transparent 30%,
              transparent 70%,
              rgba(0, 0, 255, ${0.03 * intensity}))`,
            transform: "translate(1px, -1px)",
          }}
        />
      </div>

      {/* Glitch effect */}
      {glitchEffect && isHovered && (
        <>
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              background: `rgba(0, 255, 255, ${0.1 * intensity})`,
              clipPath: "polygon(0 20%, 100% 20%, 100% 30%, 0 30%)",
            }}
            animate={{
              clipPath: [
                "polygon(0 20%, 100% 20%, 100% 30%, 0 30%)",
                "polygon(0 50%, 100% 50%, 100% 60%, 0 60%)",
                "polygon(0 80%, 100% 80%, 100% 90%, 0 90%)",
              ],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              background: `rgba(255, 0, 255, ${0.1 * intensity})`,
              clipPath: "polygon(0 60%, 100% 60%, 100% 65%, 0 65%)",
            }}
            animate={{
              clipPath: [
                "polygon(0 60%, 100% 60%, 100% 65%, 0 65%)",
                "polygon(0 30%, 100% 30%, 100% 35%, 0 35%)",
                "polygon(0 10%, 100% 10%, 100% 15%, 0 15%)",
              ],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 0.15,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        </>
      )}

      {/* Holographic noise texture */}
      <div
        className="absolute inset-0 rounded-inherit pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
        }}
      />

      {/* Content with holographic text effect */}
      <div className="relative z-10">
        <div
          className="holographic-text"
          style={{
            textShadow: `
              0 0 ${5 * intensity}px rgba(${color}, 0.5),
              0 0 ${10 * intensity}px rgba(${color}, 0.3),
              0 0 ${20 * intensity}px rgba(${color}, 0.2)
            `,
          }}
        >
          {children}
        </div>
      </div>

      {/* Edge glow */}
      <div
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{
          boxShadow: `
            inset 0 0 ${20 * intensity}px rgba(${color}, 0.1),
            inset 0 0 ${40 * intensity}px rgba(${color}, 0.05),
            0 0 ${30 * intensity}px rgba(${color}, 0.2),
            0 0 ${60 * intensity}px rgba(${color}, 0.1)
          `,
        }}
      />

      <style jsx>{`
        @keyframes holographic-shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        .holographic-text {
          background: linear-gradient(
            45deg,
            rgb(${color}),
            rgb(${color.split(",")[0]}, ${parseInt(color.split(",")[1]) + 50}, ${color.split(",")[2]}),
            rgb(${color}),
            rgb(${parseInt(color.split(",")[0]) + 50}, ${color.split(",")[1]}, ${color.split(",")[2]})
          );
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: holographic-gradient 3s ease infinite;
        }

        @keyframes holographic-gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </motion.div>
  );
}

// Holographic Button Component
export function HolographicButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}) {
  const colors = {
    primary: "59, 130, 246",
    secondary: "168, 85, 247",
    danger: "239, 68, 68",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <HolographicDisplay
      variant="button"
      color={colors[variant]}
      interactive={!disabled}
      glitchEffect
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${sizes[size]} font-medium transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {children}
      </button>
    </HolographicDisplay>
  );
}