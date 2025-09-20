"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Code2, Zap, Shield, Brain, Sparkles, ChevronRight,
  Star, GitBranch, Terminal, Cloud, Lock, Cpu,
  Globe, Users, Rocket, ArrowRight, Check, X,
  ChevronDown, Play, Eye, GitFork, Activity
} from "lucide-react";
import NeuralBackground from "@/components/ui/NeuralBackground";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import FuturisticButton from "@/components/ui/FuturisticButton";

// Animated typing effect
function TypewriterText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// Stats counter animation
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const [isLoaded, setIsLoaded] = useState(false);

  // Parallax transforms
  const heroY = useTransform(scrollY, [0, 500], [0, -50]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Intelligence",
      description: "256K context window with multi-model orchestration",
      gradient: "from-blue-400 to-purple-600",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Sub-second response times with edge computing",
      gradient: "from-yellow-400 to-orange-600",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "SOC 2 compliant with end-to-end encryption",
      gradient: "from-green-400 to-emerald-600",
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: "Cloud Native",
      description: "Auto-scaling infrastructure with 99.99% uptime",
      gradient: "from-cyan-400 to-blue-600",
    },
    {
      icon: <GitBranch className="h-6 w-6" />,
      title: "Version Control",
      description: "Built-in Git integration with advanced branching",
      gradient: "from-purple-400 to-pink-600",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Real-time Collaboration",
      description: "Pair program with AI and team members",
      gradient: "from-pink-400 to-rose-600",
    },
  ];

  const stats = [
    { value: 50000, suffix: "+", label: "Active Developers" },
    { value: 10, suffix: "M+", label: "Lines of Code Generated" },
    { value: 99.99, suffix: "%", label: "Uptime SLA" },
    { value: 150, suffix: "+", label: "Languages Supported" },
  ];

  const testimonials = [
    {
      quote: "Crowe Logic has transformed how we build software. The AI understands our codebase better than most developers.",
      author: "Sarah Chen",
      role: "CTO at TechCorp",
      avatar: "SC"
    },
    {
      quote: "The speed and accuracy of code generation is mind-blowing. We've reduced development time by 70%.",
      author: "Michael Rodriguez",
      role: "Lead Developer at StartupX",
      avatar: "MR"
    },
    {
      quote: "Enterprise-grade security with startup agility. Exactly what we needed.",
      author: "Emma Watson",
      role: "Engineering Director at FinTech",
      avatar: "EW"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Neural network background */}
      <NeuralBackground
        particleCount={60}
        connectionDistance={150}
        color="59, 130, 246"
        interactive={true}
      />

      {/* Navigation Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10"
      >
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-md opacity-50" />
              <Image
                src="/crowe-avatar.png"
                alt="Crowe Logic"
                width={40}
                height={40}
                className="relative rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Crowe Logic
              </h1>
              <p className="text-xs text-gray-400">Next-Gen Development Platform</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm hover:text-blue-400 transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm hover:text-blue-400 transition-colors">Pricing</Link>
            <Link href="/docs" className="text-sm hover:text-blue-400 transition-colors">Documentation</Link>
            <Link href="/blog" className="text-sm hover:text-blue-400 transition-colors">Blog</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <FuturisticButton variant="secondary" size="sm">
                Sign In
              </FuturisticButton>
            </Link>
            <FuturisticButton
              variant="quantum"
              size="sm"
              onClick={() => router.push("/auth/signup")}
            >
              Get Started
            </FuturisticButton>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center pt-20"
      >
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-8">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-300">Powered by Advanced AI</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              <TypewriterText text="Code at the Speed" />
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              of Thought
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto"
          >
            Experience the future of software development with our quantum-inspired AI
            that understands your intent and generates production-ready code instantly.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col md:flex-row gap-6 justify-center items-center"
          >
            <FuturisticButton
              variant="neural"
              size="lg"
              icon={<Rocket className="h-5 w-5" />}
              onClick={() => router.push("/ide")}
              pulse
            >
              Launch IDE Now
            </FuturisticButton>
            <FuturisticButton
              variant="secondary"
              size="lg"
              icon={<Play className="h-5 w-5" />}
              onClick={() => router.push("/demo")}
            >
              Watch Demo
            </FuturisticButton>
          </motion.div>

          {/* Floating code preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-20 relative"
          >
            <GlassmorphicCard
              blur="heavy"
              interactive
              floating
              className="max-w-4xl mx-auto p-6"
            >
              <div className="text-left font-mono text-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-gray-400">app.tsx</span>
                </div>
                <pre className="text-blue-300">
                  <code>{`// AI-generated React component with real-time optimization
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function SmartDashboard({ data }) {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // AI automatically optimized this for performance
    const processed = processMetrics(data);
    setMetrics(processed);
  }, [data]);

  return (
    <motion.div className="dashboard">
      {/* Component continues... */}
    </motion.div>
  );
}`}</code>
                </pre>
              </div>
            </GlassmorphicCard>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="h-8 w-8 text-white/30" />
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassmorphicCard className="p-6 text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {isLoaded && <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Revolutionary Features
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built with cutting-edge technology to push the boundaries of what's possible
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassmorphicCard
                  className="p-8 h-full"
                  interactive
                  glow
                  neural={index === 0}
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                What Developers Say
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassmorphicCard className="p-6 h-full">
                  <div className="flex items-start gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-sm font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <GlassmorphicCard className="p-12 text-center" blur="ultra" gradient>
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ready to Transform Your Development?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already building the future with Crowe Logic
            </p>
            <FuturisticButton
              variant="quantum"
              size="xl"
              icon={<ArrowRight className="h-6 w-6" />}
              onClick={() => router.push("/auth/signup")}
              pulse
              glitch
            >
              Start Your Free Trial
            </FuturisticButton>
          </GlassmorphicCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white text-sm">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white text-sm">Pricing</Link></li>
                <li><Link href="/demo" className="text-gray-400 hover:text-white text-sm">Demo</Link></li>
                <li><Link href="/changelog" className="text-gray-400 hover:text-white text-sm">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-gray-400 hover:text-white text-sm">Documentation</Link></li>
                <li><Link href="/api" className="text-gray-400 hover:text-white text-sm">API Reference</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white text-sm">Blog</Link></li>
                <li><Link href="/community" className="text-gray-400 hover:text-white text-sm">Community</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white text-sm">About</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white text-sm">Careers</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link></li>
                <li><Link href="/press" className="text-gray-400 hover:text-white text-sm">Press</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white text-sm">Terms</Link></li>
                <li><Link href="/security" className="text-gray-400 hover:text-white text-sm">Security</Link></li>
                <li><Link href="/cookies" className="text-gray-400 hover:text-white text-sm">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Image
                src="/crowe-avatar.png"
                alt="Crowe Logic"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <p className="text-sm text-gray-400">
                © 2025 Crowe Logic. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link href="https://github.com/crowelogic" className="text-gray-400 hover:text-white">
                <GitBranch className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com/crowelogic" className="text-gray-400 hover:text-white">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="https://discord.gg/crowelogic" className="text-gray-400 hover:text-white">
                <Users className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}