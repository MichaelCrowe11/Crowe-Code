"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface NeuralBackgroundProps {
  particleCount?: number;
  connectionDistance?: number;
  speed?: number;
  color?: string;
  pulseIntensity?: number;
  interactive?: boolean;
}

export default function NeuralBackground({
  particleCount = 50,
  connectionDistance = 150,
  speed = 0.5,
  color = "147, 197, 253", // RGB values for blue-400
  pulseIntensity = 0.3,
  interactive = true,
}: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Particle class
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      pulsePhase: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.radius = Math.random() * 2 + 1;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update(mouseX: number, mouseY: number) {
        // Basic movement
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Interactive mouse attraction
        if (interactive) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            const force = (200 - distance) / 200;
            this.vx += (dx / distance) * force * 0.02;
            this.vy += (dy / distance) * force * 0.02;

            // Limit velocity
            const maxSpeed = 2;
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (currentSpeed > maxSpeed) {
              this.vx = (this.vx / currentSpeed) * maxSpeed;
              this.vy = (this.vy / currentSpeed) * maxSpeed;
            }
          }
        }

        // Update pulse phase
        this.pulsePhase += 0.02;
      }

      draw() {
        if (!ctx) return;

        // Pulsing effect
        const pulse = Math.sin(this.pulsePhase) * pulseIntensity + 1;
        const currentRadius = this.radius * pulse;

        // Gradient for particles
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, currentRadius * 2
        );
        gradient.addColorStop(0, `rgba(${color}, 0.8)`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, 1)`;
        ctx.fill();
      }
    }

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.update(mouseRef.current.x, mouseRef.current.y);
        particle.draw();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = 1 - distance / connectionDistance;

            // Create gradient for connections
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            gradient.addColorStop(0, `rgba(${color}, ${opacity * 0.3})`);
            gradient.addColorStop(0.5, `rgba(${color}, ${opacity * 0.5})`);
            gradient.addColorStop(1, `rgba(${color}, ${opacity * 0.3})`);

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = opacity * 1.5;
            ctx.stroke();

            // Add glow to strong connections
            if (opacity > 0.5) {
              ctx.shadowBlur = 10;
              ctx.shadowColor = `rgba(${color}, ${opacity})`;
              ctx.stroke();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // Draw mouse interaction ripple
      if (interactive && mouseRef.current.x && mouseRef.current.y) {
        const gradient = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 100
        );
        gradient.addColorStop(0, `rgba(${color}, 0.1)`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);

        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 100, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, connectionDistance, speed, color, pulseIntensity, interactive]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ background: "linear-gradient(to bottom, #0f172a, #1e293b)" }}
      />

      {/* Gradient overlay for depth */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-purple-900/10" />
      </div>

      {/* Animated orbs for ambiance */}
      <motion.div
        className="fixed top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="fixed bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </>
  );
}