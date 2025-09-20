"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import NeuralBackground from "@/components/ui/NeuralBackground";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import FuturisticButton from "@/components/ui/FuturisticButton";
import { AdaptiveThemeProvider, ThemeSwitcher } from "@/components/ui/AdaptiveTheme";
import { SoundSystemProvider, useSoundSystem } from "@/components/ui/SoundSystem";
import QuantumLoader from "@/components/ui/QuantumLoader";
import HolographicDisplay, { HolographicButton } from "@/components/ui/HolographicDisplay";
import {
  Sparkles, Zap, Shield, Brain, Cloud, Rocket,
  Code2, Terminal, GitBranch, Users, Lock, Cpu
} from "lucide-react";

function ShowcaseContent() {
  const { playSound } = useSoundSystem();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeLoader, setActiveLoader] = useState<string>("quantum");

  // Simulate loading progress
  const startLoading = () => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Neural Background */}
      <NeuralBackground
        particleCount={80}
        connectionDistance={200}
        color="147, 197, 253"
        interactive={true}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 p-6"
      >
        <div className="container mx-auto">
          <HolographicDisplay variant="panel" glitchEffect>
            <h1 className="text-4xl md:text-6xl font-bold text-center">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                UI/UX Showcase
              </span>
            </h1>
            <p className="text-center text-gray-400 mt-2">
              Experience the future of interface design
            </p>
          </HolographicDisplay>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 space-y-16">
        {/* Futuristic Buttons Section */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold mb-8"
          >
            Futuristic Buttons
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <FuturisticButton
              variant="primary"
              icon={<Sparkles className="h-4 w-4" />}
              onClick={() => playSound("click")}
            >
              Primary
            </FuturisticButton>
            <FuturisticButton
              variant="quantum"
              icon={<Brain className="h-4 w-4" />}
              onClick={() => playSound("quantum")}
              pulse
            >
              Quantum
            </FuturisticButton>
            <FuturisticButton
              variant="neural"
              icon={<Cpu className="h-4 w-4" />}
              onClick={() => playSound("neural")}
              glitch
            >
              Neural
            </FuturisticButton>
            <FuturisticButton
              variant="danger"
              icon={<Shield className="h-4 w-4" />}
              onClick={() => playSound("error")}
            >
              Danger
            </FuturisticButton>
          </div>
        </section>

        {/* Glassmorphic Cards Section */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold mb-8"
          >
            Glassmorphic Cards
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassmorphicCard blur="light" interactive>
              <h3 className="text-xl font-bold mb-3">Light Blur</h3>
              <p className="text-gray-400">
                Subtle glass effect with light blur and interactive 3D tilt
              </p>
            </GlassmorphicCard>
            <GlassmorphicCard blur="heavy" neural>
              <h3 className="text-xl font-bold mb-3">Neural Network</h3>
              <p className="text-gray-400">
                Live neural network animation with particle connections
              </p>
            </GlassmorphicCard>
            <GlassmorphicCard blur="ultra" floating gradient>
              <h3 className="text-xl font-bold mb-3">Floating Card</h3>
              <p className="text-gray-400">
                Ultra blur with floating animation and gradient mesh
              </p>
            </GlassmorphicCard>
          </div>
        </section>

        {/* Quantum Loaders Section */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold mb-8"
          >
            Quantum Loading States
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {["quantum", "neural", "dna", "orbit", "matrix", "wormhole"].map((variant) => (
              <GlassmorphicCard key={variant} className="p-6">
                <QuantumLoader
                  variant={variant as any}
                  size="md"
                  text={variant.charAt(0).toUpperCase() + variant.slice(1)}
                  progress={variant === activeLoader ? loadingProgress : undefined}
                />
                <button
                  onClick={() => {
                    setActiveLoader(variant);
                    startLoading();
                    playSound("woosh");
                  }}
                  className="mt-4 w-full px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs"
                >
                  Activate
                </button>
              </GlassmorphicCard>
            ))}
          </div>
        </section>

        {/* Holographic Elements Section */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold mb-8"
          >
            Holographic UI
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <HolographicDisplay variant="card" glitchEffect>
              <h3 className="text-2xl font-bold mb-3">Holographic Card</h3>
              <p className="text-gray-300 mb-4">
                Experience true 3D holographic effects with chromatic aberration,
                scanlines, and interactive depth perception.
              </p>
              <div className="flex gap-3">
                <HolographicButton variant="primary" onClick={() => playSound("click")}>
                  Primary
                </HolographicButton>
                <HolographicButton variant="secondary" onClick={() => playSound("hover")}>
                  Secondary
                </HolographicButton>
              </div>
            </HolographicDisplay>

            <HolographicDisplay variant="panel" color="168, 85, 247" intensity={1.5}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Code2 className="h-6 w-6" />
                  <span className="text-lg font-semibold">Advanced Features</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Real-time holographic rendering
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Chromatic aberration effects
                  </li>
                  <li className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Interactive 3D transformations
                  </li>
                  <li className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    Dynamic glitch animations
                  </li>
                </ul>
              </div>
            </HolographicDisplay>
          </div>
        </section>

        {/* Sound Effects Section */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold mb-8"
          >
            Immersive Sound Design
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: "click", label: "Click", icon: <Terminal className="h-4 w-4" /> },
              { type: "hover", label: "Hover", icon: <Cloud className="h-4 w-4" /> },
              { type: "success", label: "Success", icon: <Sparkles className="h-4 w-4" /> },
              { type: "error", label: "Error", icon: <Shield className="h-4 w-4" /> },
              { type: "notification", label: "Notify", icon: <Brain className="h-4 w-4" /> },
              { type: "typing", label: "Typing", icon: <Code2 className="h-4 w-4" /> },
              { type: "quantum", label: "Quantum", icon: <Cpu className="h-4 w-4" /> },
              { type: "glitch", label: "Glitch", icon: <Zap className="h-4 w-4" /> },
            ].map(({ type, label, icon }) => (
              <GlassmorphicCard key={type} className="p-4">
                <button
                  onClick={() => playSound(type as any)}
                  className="w-full flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                >
                  {icon}
                  <span className="text-sm">{label}</span>
                </button>
              </GlassmorphicCard>
            ))}
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold mb-8"
          >
            Interactive Playground
          </motion.h2>
          <HolographicDisplay variant="card" intensity={2}>
            <div className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Experience the Future of UI
              </h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                This showcase demonstrates cutting-edge UI/UX technologies including
                quantum animations, neural network visualizations, holographic displays,
                adaptive theming, and immersive sound design.
              </p>
              <div className="flex justify-center gap-4">
                <FuturisticButton
                  variant="quantum"
                  size="lg"
                  icon={<Rocket className="h-5 w-5" />}
                  onClick={() => {
                    playSound("quantum");
                    window.location.href = "/ide";
                  }}
                  pulse
                  glitch
                >
                  Launch Platform
                </FuturisticButton>
              </div>
            </div>
          </HolographicDisplay>
        </section>

        {/* Features Grid */}
        <section className="pb-20">
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold mb-8"
          >
            Platform Capabilities
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain className="h-6 w-6" />,
                title: "AI-Powered",
                description: "256K context window with multi-model orchestration",
                gradient: "from-blue-400 to-purple-600",
              },
              {
                icon: <Zap className="h-6 w-6" />,
                title: "Lightning Fast",
                description: "Sub-second response with edge computing",
                gradient: "from-yellow-400 to-orange-600",
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Enterprise Security",
                description: "SOC 2 compliant with E2E encryption",
                gradient: "from-green-400 to-emerald-600",
              },
              {
                icon: <Cloud className="h-6 w-6" />,
                title: "Cloud Native",
                description: "Auto-scaling with 99.99% uptime",
                gradient: "from-cyan-400 to-blue-600",
              },
              {
                icon: <GitBranch className="h-6 w-6" />,
                title: "Version Control",
                description: "Built-in Git with advanced branching",
                gradient: "from-purple-400 to-pink-600",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Collaboration",
                description: "Real-time pair programming",
                gradient: "from-pink-400 to-rose-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassmorphicCard className="p-6 h-full" interactive glow>
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Theme Switcher */}
      <ThemeSwitcher />
    </div>
  );
}

export default function ShowcasePage() {
  return (
    <AdaptiveThemeProvider>
      <SoundSystemProvider>
        <ShowcaseContent />
      </SoundSystemProvider>
    </AdaptiveThemeProvider>
  );
}