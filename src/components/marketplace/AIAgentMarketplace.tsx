"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  Star,
  Download,
  TrendingUp,
  Shield,
  Zap,
  Code2,
  Brain,
  Rocket,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  ShoppingCart,
  Heart,
  Share2,
  MoreVertical,
  Package,
  Lock,
  Unlock,
  Award,
  BarChart3,
  GitBranch,
  Database,
  Globe,
  Terminal,
  FileCode,
  Cpu,
  Activity,
  AlertCircle,
  Play,
  Settings,
} from "lucide-react";
import { useSession } from "next-auth/react";
import logger from '../../lib/logger';

interface AIAgent {
  id: string;
  name: string;
  description: string;
  category: "coding" | "testing" | "review" | "deployment" | "security" | "data" | "automation" | "analytics";
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  pricing: {
    type: "free" | "one-time" | "subscription" | "usage-based";
    price?: number;
    currency?: string;
    period?: "month" | "year";
  };
  stats: {
    downloads: number;
    rating: number;
    reviews: number;
    activeUsers: number;
  };
  features: string[];
  requirements?: string[];
  version: string;
  lastUpdated: Date;
  icon: string;
  color: string;
  capabilities: {
    languages: string[];
    integrations: string[];
    performance: "high" | "medium" | "low";
  };
  trending?: boolean;
  featured?: boolean;
  installed?: boolean;
}

const mockAgents: AIAgent[] = [
  {
    id: "quantum-coder",
    name: "Quantum Coder Pro",
    description: "Advanced AI agent that generates production-ready code from natural language descriptions with 99% accuracy",
    category: "coding",
    author: { name: "CroweCode Labs", avatar: "", verified: true },
    pricing: { type: "subscription", price: 49, currency: "USD", period: "month" },
    stats: { downloads: 15420, rating: 4.9, reviews: 892, activeUsers: 3200 },
    features: [
      "Natural language to code",
      "Multi-language support",
      "Real-time optimization",
      "Security scanning",
      "Auto-documentation"
    ],
    requirements: ["Node.js 18+", "4GB RAM"],
    version: "2.3.1",
    lastUpdated: new Date(),
    icon: "🧠",
    color: "from-purple-500 to-pink-500",
    capabilities: {
      languages: ["TypeScript", "Python", "Go", "Rust"],
      integrations: ["VSCode", "GitHub", "GitLab"],
      performance: "high"
    },
    trending: true,
    featured: true
  },
  {
    id: "test-wizard",
    name: "Test Wizard AI",
    description: "Automatically generates comprehensive test suites with edge case detection and 95%+ code coverage",
    category: "testing",
    author: { name: "TestMasters", avatar: "", verified: true },
    pricing: { type: "free" },
    stats: { downloads: 28900, rating: 4.7, reviews: 1240, activeUsers: 8500 },
    features: [
      "Unit test generation",
      "Integration testing",
      "E2E test creation",
      "Coverage analysis",
      "Performance testing"
    ],
    version: "1.8.5",
    lastUpdated: new Date(),
    icon: "🧪",
    color: "from-green-500 to-emerald-500",
    capabilities: {
      languages: ["JavaScript", "TypeScript", "Python", "Java"],
      integrations: ["Jest", "Pytest", "Mocha", "Cypress"],
      performance: "medium"
    },
    trending: true
  },
  {
    id: "security-sentinel",
    name: "Security Sentinel",
    description: "Enterprise-grade security scanning with real-time vulnerability detection and automated patches",
    category: "security",
    author: { name: "SecureCode Inc", avatar: "", verified: true },
    pricing: { type: "subscription", price: 99, currency: "USD", period: "month" },
    stats: { downloads: 8320, rating: 4.8, reviews: 456, activeUsers: 2100 },
    features: [
      "Vulnerability scanning",
      "Dependency auditing",
      "SAST/DAST analysis",
      "Compliance checking",
      "Auto-remediation"
    ],
    requirements: ["Docker", "8GB RAM"],
    version: "3.1.0",
    lastUpdated: new Date(),
    icon: "🛡️",
    color: "from-red-500 to-orange-500",
    capabilities: {
      languages: ["All major languages"],
      integrations: ["GitHub Actions", "GitLab CI", "Jenkins"],
      performance: "high"
    },
    featured: true
  },
  {
    id: "deploy-master",
    name: "Deploy Master",
    description: "One-click deployment to multiple cloud providers with automatic scaling and monitoring",
    category: "deployment",
    author: { name: "CloudNinja", avatar: "", verified: false },
    pricing: { type: "usage-based", price: 0.10, currency: "USD" },
    stats: { downloads: 12450, rating: 4.6, reviews: 678, activeUsers: 3800 },
    features: [
      "Multi-cloud deployment",
      "Auto-scaling config",
      "CI/CD integration",
      "Rollback support",
      "Cost optimization"
    ],
    version: "2.0.3",
    lastUpdated: new Date(),
    icon: "🚀",
    color: "from-blue-500 to-cyan-500",
    capabilities: {
      languages: ["Docker", "Kubernetes", "Terraform"],
      integrations: ["AWS", "Azure", "GCP", "Fly.io"],
      performance: "high"
    }
  },
  {
    id: "code-reviewer",
    name: "AI Code Reviewer",
    description: "Intelligent code review with best practices enforcement and refactoring suggestions",
    category: "review",
    author: { name: "ReviewBot", avatar: "", verified: true },
    pricing: { type: "free" },
    stats: { downloads: 34200, rating: 4.5, reviews: 1890, activeUsers: 12000 },
    features: [
      "PR review automation",
      "Style guide enforcement",
      "Performance suggestions",
      "Security analysis",
      "Technical debt tracking"
    ],
    version: "1.5.2",
    lastUpdated: new Date(),
    icon: "👁️",
    color: "from-yellow-500 to-amber-500",
    capabilities: {
      languages: ["JavaScript", "TypeScript", "Python", "Go"],
      integrations: ["GitHub", "GitLab", "Bitbucket"],
      performance: "medium"
    }
  },
  {
    id: "data-alchemist",
    name: "Data Alchemist",
    description: "Transform and analyze data with AI-powered ETL pipelines and real-time insights",
    category: "data",
    author: { name: "DataWizards", avatar: "", verified: true },
    pricing: { type: "subscription", price: 79, currency: "USD", period: "month" },
    stats: { downloads: 6780, rating: 4.7, reviews: 342, activeUsers: 1500 },
    features: [
      "ETL pipeline generation",
      "Data visualization",
      "Anomaly detection",
      "Predictive analytics",
      "Real-time streaming"
    ],
    requirements: ["Python 3.9+", "16GB RAM"],
    version: "1.2.0",
    lastUpdated: new Date(),
    icon: "📊",
    color: "from-indigo-500 to-purple-500",
    capabilities: {
      languages: ["SQL", "Python", "R"],
      integrations: ["PostgreSQL", "MongoDB", "Redis", "Kafka"],
      performance: "high"
    }
  }
];

const categories = [
  { id: "all", name: "All Agents", icon: Package },
  { id: "coding", name: "Coding", icon: Code2 },
  { id: "testing", name: "Testing", icon: FileCode },
  { id: "review", name: "Code Review", icon: GitBranch },
  { id: "deployment", name: "Deployment", icon: Rocket },
  { id: "security", name: "Security", icon: Shield },
  { id: "data", name: "Data & Analytics", icon: Database },
  { id: "automation", name: "Automation", icon: Cpu },
];

export default function AIAgentMarketplace() {
  const { data: session } = useSession();
  const [agents, setAgents] = useState<AIAgent[]>(mockAgents);
  const [filteredAgents, setFilteredAgents] = useState<AIAgent[]>(mockAgents);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [cart, setCart] = useState<AIAgent[]>([]);
  const [installedAgents, setInstalledAgents] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "newest" | "price">("popular");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    filterAndSortAgents();
  }, [selectedCategory, searchQuery, sortBy]);

  const filterAndSortAgents = () => {
    let filtered = [...agents];

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(agent => agent.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sorting
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.stats.downloads - a.stats.downloads);
        break;
      case "rating":
        filtered.sort((a, b) => b.stats.rating - a.stats.rating);
        break;
      case "newest":
        filtered.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
        break;
      case "price":
        filtered.sort((a, b) => (a.pricing.price || 0) - (b.pricing.price || 0));
        break;
    }

    setFilteredAgents(filtered);
  };

  const installAgent = async (agent: AIAgent) => {
    // Simulate installation
    setInstalledAgents([...installedAgents, agent.id]);

    // API call to install agent
    try {
      const response = await fetch("/api/marketplace/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id })
      });

      if (response.ok) {
        // Success notification
        logger.info(`Agent ${agent.name} installed successfully`);
      }
    } catch (error) {
      logger.error("Failed to install agent:", error);
    }
  };

  const addToCart = (agent: AIAgent) => {
    if (!cart.find(a => a.id === agent.id)) {
      setCart([...cart, agent]);
    }
  };

  const removeFromCart = (agentId: string) => {
    setCart(cart.filter(a => a.id !== agentId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, agent) => {
      if (agent.pricing.type === "free") return total;
      return total + (agent.pricing.price || 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-blue-950/10 to-purple-950/10">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-purple-400" />
                <h1 className="text-xl font-bold text-white">AI Agent Marketplace</h1>
              </div>

              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-400/30">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">
                  {agents.length} Agents Available
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agents..."
                  className="pl-10 pr-4 py-2 w-64 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50"
                />
              </div>

              {/* Cart */}
              <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ShoppingCart className="w-5 h-5 text-white/60" />
                {cart.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{cart.length}</span>
                  </div>
                )}
              </button>

              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            {/* Categories */}
            <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4 mb-4">
              <h3 className="text-white font-semibold mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? "bg-purple-500/20 text-purple-400 border border-purple-400/30"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort Options */}
            <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4 mb-4">
              <h3 className="text-white font-semibold mb-3">Sort By</h3>
              <div className="space-y-1">
                {[
                  { id: "popular", name: "Most Popular", icon: TrendingUp },
                  { id: "rating", name: "Highest Rated", icon: Star },
                  { id: "newest", name: "Recently Updated", icon: Clock },
                  { id: "price", name: "Price", icon: DollarSign },
                ].map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === option.id
                          ? "bg-blue-500/20 text-blue-400"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {option.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-semibold">Your Stats</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Installed Agents</span>
                  <span className="text-white font-medium">{installedAgents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Total Spent</span>
                  <span className="text-white font-medium">$127</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Saved Time</span>
                  <span className="text-green-400 font-medium">284 hrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Section */}
            {!searchQuery && selectedCategory === "all" && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl font-semibold text-white">Featured Agents</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {filteredAgents.filter(a => a.featured).slice(0, 2).map(agent => (
                    <motion.div
                      key={agent.id}
                      whileHover={{ scale: 1.02 }}
                      className="relative bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 rounded-xl border border-purple-400/30 p-6 overflow-hidden group cursor-pointer"
                      onClick={() => setSelectedAgent(agent)}
                    >
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-10 group-hover:opacity-20 transition-opacity`} />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-4xl">{agent.icon}</div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-white/60">by {agent.author.name}</span>
                                {agent.author.verified && (
                                  <CheckCircle className="w-3 h-3 text-blue-400" />
                                )}
                              </div>
                            </div>
                          </div>

                          {agent.trending && (
                            <div className="px-2 py-1 bg-orange-500/20 border border-orange-400/30 rounded-full">
                              <span className="text-xs text-orange-400 font-medium">Trending</span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-white/70 mb-4 line-clamp-2">
                          {agent.description}
                        </p>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-white">{agent.stats.rating}</span>
                            <span className="text-xs text-white/40">({agent.stats.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-white/60">{agent.stats.downloads.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-white/60">{agent.stats.activeUsers.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            {agent.pricing.type === "free" ? (
                              <span className="text-green-400 font-semibold">FREE</span>
                            ) : (
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-white">
                                  ${agent.pricing.price}
                                </span>
                                {agent.pricing.period && (
                                  <span className="text-sm text-white/60">/{agent.pricing.period}</span>
                                )}
                              </div>
                            )}
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (installedAgents.includes(agent.id)) {
                                // Open agent
                              } else if (agent.pricing.type === "free") {
                                installAgent(agent);
                              } else {
                                addToCart(agent);
                              }
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                              installedAgents.includes(agent.id)
                                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                : agent.pricing.type === "free"
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-purple-500 text-white hover:bg-purple-600"
                            }`}
                          >
                            {installedAgents.includes(agent.id) ? (
                              <>
                                <Play className="w-4 h-4" />
                                Open
                              </>
                            ) : agent.pricing.type === "free" ? (
                              <>
                                <Download className="w-4 h-4" />
                                Install
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* All Agents Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {selectedCategory === "all" ? "All Agents" : categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <span className="text-sm text-white/60">
                  {filteredAgents.length} agents found
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgents.map(agent => (
                  <motion.div
                    key={agent.id}
                    whileHover={{ y: -4 }}
                    className="bg-zinc-900/50 rounded-xl border border-white/10 p-5 hover:border-white/20 transition-all cursor-pointer group"
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{agent.icon}</div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                            {agent.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-white/60">{agent.author.name}</span>
                            {agent.author.verified && (
                              <CheckCircle className="w-3 h-3 text-blue-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                        <MoreVertical className="w-4 h-4 text-white/60" />
                      </button>
                    </div>

                    <p className="text-sm text-white/60 mb-3 line-clamp-2">
                      {agent.description}
                    </p>

                    <div className="flex items-center gap-3 mb-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-white">{agent.stats.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-green-400" />
                        <span className="text-white/60">{agent.stats.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-400" />
                        <span className="text-white/60">{agent.stats.activeUsers}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {agent.features.slice(0, 3).map((feature, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-white/5 rounded-full text-xs text-white/60"
                        >
                          {feature}
                        </span>
                      ))}
                      {agent.features.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-white/40">
                          +{agent.features.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        {agent.pricing.type === "free" ? (
                          <span className="text-green-400 font-semibold text-sm">FREE</span>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-white">
                              ${agent.pricing.price}
                            </span>
                            {agent.pricing.period && (
                              <span className="text-xs text-white/60">/{agent.pricing.period}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle favorite
                          }}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Heart className="w-4 h-4 text-white/40 hover:text-red-400" />
                        </button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (installedAgents.includes(agent.id)) {
                              // Open agent
                            } else if (agent.pricing.type === "free") {
                              installAgent(agent);
                            } else {
                              addToCart(agent);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            installedAgents.includes(agent.id)
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                          }`}
                        >
                          {installedAgents.includes(agent.id) ? "Open" : "Get"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Detail Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAgent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal content here - agent details, screenshots, reviews, etc. */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{selectedAgent.icon}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedAgent.name}</h2>
                      <p className="text-white/60 mt-1">{selectedAgent.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                {/* Add more detailed content here */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
                    <ul className="space-y-2">
                      {selectedAgent.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-white/80">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-zinc-800/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/60">Price</span>
                        {selectedAgent.pricing.type === "free" ? (
                          <span className="text-green-400 font-bold text-xl">FREE</span>
                        ) : (
                          <span className="text-white font-bold text-xl">
                            ${selectedAgent.pricing.price}
                            {selectedAgent.pricing.period && (
                              <span className="text-sm text-white/60">/{selectedAgent.pricing.period}</span>
                            )}
                          </span>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (installedAgents.includes(selectedAgent.id)) {
                            // Open agent
                          } else if (selectedAgent.pricing.type === "free") {
                            installAgent(selectedAgent);
                          } else {
                            addToCart(selectedAgent);
                          }
                          setSelectedAgent(null);
                        }}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                      >
                        {installedAgents.includes(selectedAgent.id)
                          ? "Open Agent"
                          : selectedAgent.pricing.type === "free"
                          ? "Install Now"
                          : "Add to Cart"}
                      </motion.button>
                    </div>

                    <div className="bg-zinc-800/50 rounded-xl p-4">
                      <h4 className="text-white font-semibold mb-2">Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Downloads</span>
                          <span className="text-white">{selectedAgent.stats.downloads.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Active Users</span>
                          <span className="text-white">{selectedAgent.stats.activeUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Rating</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-white">{selectedAgent.stats.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}