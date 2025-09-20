"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface QuantumLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "quantum" | "neural" | "dna" | "orbit" | "matrix" | "wormhole";
  text?: string;
  progress?: number;
}

export default function QuantumLoader({
  size = "md",
  variant = "quantum",
  text,
  progress,
}: QuantumLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sizes = {
    sm: 40,
    md: 60,
    lg: 80,
    xl: 120,
  };

  const dimension = sizes[size];

  useEffect(() => {
    if (variant === "quantum" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let animationId: number;
      let particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        maxLife: number;
      }> = [];

      // Initialize quantum particles
      const initParticles = () => {
        particles = [];
        for (let i = 0; i < 20; i++) {
          particles.push({
            x: dimension / 2,
            y: dimension / 2,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 0,
            maxLife: 60 + Math.random() * 60,
          });
        }
      };

      initParticles();

      const animate = () => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, dimension, dimension);

        particles.forEach((particle, index) => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life++;

          // Quantum tunneling effect
          if (Math.random() < 0.01) {
            particle.x = dimension / 2 + (Math.random() - 0.5) * dimension;
            particle.y = dimension / 2 + (Math.random() - 0.5) * dimension;
          }

          // Boundary collision with uncertainty
          if (particle.x < 0 || particle.x > dimension) {
            particle.vx *= -1;
            particle.x += Math.random() * 10 - 5;
          }
          if (particle.y < 0 || particle.y > dimension) {
            particle.vy *= -1;
            particle.y += Math.random() * 10 - 5;
          }

          // Reset particle if life exceeded
          if (particle.life > particle.maxLife) {
            particles[index] = {
              x: dimension / 2,
              y: dimension / 2,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              life: 0,
              maxLife: 60 + Math.random() * 60,
            };
          }

          // Draw particle with quantum blur
          const opacity = 1 - particle.life / particle.maxLife;
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            5
          );
          gradient.addColorStop(0, `rgba(59, 130, 246, ${opacity})`);
          gradient.addColorStop(1, `rgba(168, 85, 247, 0)`);

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Quantum entanglement lines
          particles.forEach((other) => {
            const distance = Math.sqrt(
              Math.pow(particle.x - other.x, 2) + Math.pow(particle.y - other.y, 2)
            );
            if (distance < 30 && distance > 0) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `rgba(147, 197, 253, ${0.2 * opacity})`;
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
    }
  }, [variant, dimension]);

  const renderLoader = () => {
    switch (variant) {
      case "quantum":
        return (
          <canvas
            ref={canvasRef}
            width={dimension}
            height={dimension}
            className="rounded-full"
          />
        );

      case "neural":
        return (
          <div className="relative" style={{ width: dimension, height: dimension }}>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  transformOrigin: "center",
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [0.5, 1.5, 0.5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.25,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
            ))}
          </div>
        );

      case "dna":
        return (
          <div className="relative" style={{ width: dimension, height: dimension }}>
            <svg width={dimension} height={dimension} className="animate-spin-slow">
              {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const x1 = dimension / 2 + Math.cos(angle) * (dimension / 3);
                const y1 = dimension / 2 + Math.sin(angle) * (dimension / 3);
                const x2 = dimension / 2 - Math.cos(angle) * (dimension / 3);
                const y2 = dimension / 2 - Math.sin(angle) * (dimension / 3);

                return (
                  <motion.g key={i}>
                    <motion.circle
                      cx={x1}
                      cy={y1}
                      r="3"
                      fill="url(#gradient1)"
                      animate={{
                        r: [2, 4, 2],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        repeat: Infinity,
                      }}
                    />
                    <motion.circle
                      cx={x2}
                      cy={y2}
                      r="3"
                      fill="url(#gradient2)"
                      animate={{
                        r: [2, 4, 2],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1 + 1,
                        repeat: Infinity,
                      }}
                    />
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="rgba(147, 197, 253, 0.3)"
                      strokeWidth="1"
                    />
                  </motion.g>
                );
              })}
              <defs>
                <linearGradient id="gradient1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
                <linearGradient id="gradient2">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        );

      case "orbit":
        return (
          <div className="relative" style={{ width: dimension, height: dimension }}>
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute border border-blue-400/30 rounded-full"
                  style={{
                    width: dimension - i * 20,
                    height: dimension - i * 20,
                    left: i * 10,
                    top: i * 10,
                  }}
                  animate={{
                    rotate: i % 2 === 0 ? 360 : -360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: {
                      duration: 4 + i,
                      repeat: Infinity,
                      ease: "linear",
                    },
                    scale: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <div
                    className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                    style={{
                      top: -6,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        );

      case "matrix":
        return (
          <div
            className="relative overflow-hidden rounded"
            style={{ width: dimension, height: dimension }}
          >
            <div className="absolute inset-0 bg-black">
              {[...Array(5)].map((_, col) => (
                <motion.div
                  key={col}
                  className="absolute text-green-400 text-xs font-mono"
                  style={{
                    left: col * (dimension / 5),
                    width: dimension / 5,
                  }}
                  animate={{
                    y: [-dimension, dimension * 2],
                  }}
                  transition={{
                    duration: 3 + col * 0.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {[...Array(10)].map((_, row) => (
                    <div
                      key={row}
                      className="opacity-80"
                      style={{
                        opacity: 1 - row * 0.1,
                      }}
                    >
                      {Math.random() > 0.5 ? "1" : "0"}
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "wormhole":
        return (
          <div className="relative" style={{ width: dimension, height: dimension }}>
            <svg width={dimension} height={dimension} className="animate-spin">
              <defs>
                <radialGradient id="wormhole">
                  <stop offset="0%" stopColor="#000000" />
                  <stop offset="30%" stopColor="#1E3A8A" />
                  <stop offset="60%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#EC4899" />
                </radialGradient>
              </defs>
              <circle
                cx={dimension / 2}
                cy={dimension / 2}
                r={dimension / 2}
                fill="url(#wormhole)"
              />
              {[...Array(8)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx={dimension / 2}
                  cy={dimension / 2}
                  r={dimension / 4}
                  fill="none"
                  stroke="rgba(147, 197, 253, 0.3)"
                  strokeWidth="1"
                  animate={{
                    r: [dimension / 4, dimension / 2, dimension / 4],
                    opacity: [1, 0, 1],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.25,
                    repeat: Infinity,
                  }}
                />
              ))}
            </svg>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {renderLoader()}

      {/* Progress indicator */}
      {progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-center mt-2 text-gray-400">{progress}%</p>
        </div>
      )}

      {/* Loading text */}
      {text && (
        <motion.p
          className="text-sm text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}