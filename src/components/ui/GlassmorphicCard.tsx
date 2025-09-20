"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: "light" | "medium" | "heavy" | "ultra";
  gradient?: boolean;
  interactive?: boolean;
  parallax?: boolean;
  neural?: boolean;
  glow?: boolean;
  floating?: boolean;
}

export default function GlassmorphicCard({
  children,
  className = "",
  blur = "medium",
  gradient = true,
  interactive = true,
  parallax = false,
  neural = false,
  glow = true,
  floating = false,
}: GlassmorphicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const { ref: inViewRef, inView } = useInView({ threshold: 0.1 });

  // Parallax effect
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, parallax ? -50 : 0]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  // 3D tilt effect on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0.5, y: 0.5 });
    setIsHovered(false);
  };

  // Calculate 3D rotation based on mouse position
  const rotateX = isHovered ? (mousePosition.y - 0.5) * 20 : 0;
  const rotateY = isHovered ? (mousePosition.x - 0.5) * -20 : 0;

  // Blur intensities
  const blurIntensity = {
    light: "backdrop-blur-sm",
    medium: "backdrop-blur-md",
    heavy: "backdrop-blur-lg",
    ultra: "backdrop-blur-2xl",
  };

  // Neural network animation
  useEffect(() => {
    if (!neural || !cardRef.current) return;

    const canvas = cardRef.current.querySelector(".neural-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      connections: number[];
    }> = [];

    // Initialize particles
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        connections: [],
      });
    }

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off walls
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(147, 197, 253, 0.5)";
        ctx.fill();

        // Draw connections
        particles.forEach((otherParticle, j) => {
          if (i === j) return;

          const distance = Math.sqrt(
            Math.pow(particle.x - otherParticle.x, 2) +
            Math.pow(particle.y - otherParticle.y, 2)
          );

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${0.2 - distance / 500})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [neural]);

  return (
    <motion.div
      ref={(el) => {
        cardRef.current = el as HTMLDivElement;
        inViewRef(el);
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        y: springY,
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`
        relative
        ${blurIntensity[blur]}
        bg-gradient-to-br
        ${gradient
          ? "from-white/10 via-white/5 to-transparent"
          : "bg-white/10"
        }
        border border-white/20
        rounded-2xl
        overflow-hidden
        ${interactive ? "transition-all duration-300" : ""}
        ${isHovered && glow
          ? "shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          : "shadow-2xl"
        }
        ${floating ? "animate-float" : ""}
        ${className}
      `}
    >
      {/* Background gradient mesh */}
      {gradient && (
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        </div>
      )}

      {/* Neural network canvas */}
      {neural && (
        <canvas
          className="neural-canvas absolute inset-0 w-full h-full opacity-30"
          width={800}
          height={600}
        />
      )}

      {/* Animated border gradient */}
      {isHovered && interactive && (
        <div className="absolute inset-0 rounded-2xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-30 animate-spin-slow" />
        </div>
      )}

      {/* Glass refraction effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Hover spotlight effect */}
      {interactive && isHovered && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(59, 130, 246, 0.1), transparent 40%)`,
            inset: 0,
          }}
        />
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </motion.div>
  );
}