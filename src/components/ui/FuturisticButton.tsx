"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface FuturisticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "quantum" | "neural";
  size?: "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  pulse?: boolean;
  glitch?: boolean;
  haptic?: boolean;
}

export default function FuturisticButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  pulse = false,
  glitch = false,
  haptic = true,
}: FuturisticButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const controls = useAnimation();

  // Haptic feedback simulation
  const triggerHaptic = () => {
    if (haptic && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  // Create ripple effect
  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleId = Date.now();

    setRipples(prev => [...prev, { x, y, id: rippleId }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 1000);
  };

  // Handle click with effects
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    createRipple(e);
    triggerHaptic();

    // Quantum flash effect
    controls.start({
      scale: [1, 1.05, 0.95, 1],
      transition: { duration: 0.3 }
    });

    onClick?.();
  };

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  // Variant styles with advanced gradients and effects
  const variantStyles = {
    primary: {
      base: "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600",
      hover: "hover:from-blue-600 hover:via-blue-700 hover:to-purple-700",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
      text: "text-white",
    },
    secondary: {
      base: "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900",
      hover: "hover:from-gray-600 hover:via-gray-700 hover:to-gray-800",
      glow: "shadow-[0_0_15px_rgba(156,163,175,0.3)]",
      text: "text-gray-200",
    },
    danger: {
      base: "bg-gradient-to-r from-red-500 via-red-600 to-pink-600",
      hover: "hover:from-red-600 hover:via-red-700 hover:to-pink-700",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.5)]",
      text: "text-white",
    },
    quantum: {
      base: "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600",
      hover: "hover:from-cyan-500 hover:via-blue-600 hover:to-purple-700",
      glow: "shadow-[0_0_30px_rgba(6,182,212,0.6)]",
      text: "text-white",
    },
    neural: {
      base: "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500",
      hover: "hover:from-purple-500 hover:via-pink-600 hover:to-red-600",
      glow: "shadow-[0_0_25px_rgba(168,85,247,0.6)]",
      text: "text-white",
    },
  };

  const style = variantStyles[variant];

  return (
    <motion.button
      ref={buttonRef}
      animate={controls}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden
        ${sizeClasses[size]}
        ${style.base}
        ${style.hover}
        ${style.text}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${pulse && !disabled ? "animate-pulse" : ""}
        font-semibold
        rounded-lg
        transition-all duration-300
        transform-gpu
        ${isHovered && !disabled ? style.glow : ""}
        ${isPressed && !disabled ? "scale-95" : ""}
        backdrop-blur-sm
        border border-white/10
        ${glitch ? "glitch-effect" : ""}
      `}
      style={{
        background: disabled
          ? "linear-gradient(to right, #4B5563, #6B7280)"
          : undefined,
      }}
    >
      {/* Quantum particle effect background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>

      {/* Neural network pattern */}
      {variant === "neural" && (
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="neural-pattern"
            x="0"
            y="0"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="5" cy="5" r="1" fill="white" opacity="0.5" />
            <circle cx="25" cy="25" r="1" fill="white" opacity="0.5" />
            <circle cx="45" cy="45" r="1" fill="white" opacity="0.5" />
            <line x1="5" y1="5" x2="25" y2="25" stroke="white" strokeWidth="0.5" opacity="0.3" />
            <line x1="25" y1="25" x2="45" y2="45" stroke="white" strokeWidth="0.5" opacity="0.3" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#neural-pattern)" />
        </svg>
      )}

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
          }}
        />
      ))}

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {icon && <span className="inline-block">{icon}</span>}
        <span>{children}</span>
      </div>

      {/* Hover glow effect */}
      {isHovered && !disabled && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
        </div>
      )}

      {/* Glitch effect */}
      {glitch && !disabled && (
        <>
          <div className="glitch-copy glitch-1" aria-hidden="true">
            {children}
          </div>
          <div className="glitch-copy glitch-2" aria-hidden="true">
            {children}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(10);
            opacity: 0;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-ripple {
          animation: ripple 1s ease-out;
        }

        .glitch-copy {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-center;
          opacity: 0.8;
          animation: glitch 2s infinite;
        }

        .glitch-1 {
          color: #00ffff;
          animation-delay: 0s;
        }

        .glitch-2 {
          color: #ff00ff;
          animation-delay: 0.1s;
        }

        @keyframes glitch {
          0%, 90%, 100% {
            opacity: 0;
            transform: translate(0);
          }
          95% {
            opacity: 0.8;
            transform: translate(2px, -2px);
          }
        }
      `}</style>
    </motion.button>
  );
}