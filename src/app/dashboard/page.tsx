"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import {
  User,
  Key,
  Activity,
  CreditCard,
  Code2,
  FolderOpen,
  Settings,
  Shield,
  Zap,
  TrendingUp,
  Clock,
  Database,
  GitBranch,
  Terminal,
  Brain,
  Sparkles,
  ChevronRight,
  Plus,
  Copy,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  Users,
  Globe,
  MessageSquare,
} from "lucide-react";
import CroweLogicLogo from "@/components/branding/CroweLogicLogo";
import { CroweLogicBadge } from "@/components/branding/CroweLogicBranding";
import Link from "next/link";
import AIChatInterface from "@/components/ai/AIChatInterface";

// Mock data - will be replaced with real API calls
const mockStats = {
  apiCalls: 12543,
  apiLimit: 50000,
  storageUsed: 2.4,
  storageLimit: 10,
  projects: 8,
  collaborators: 3,
  buildMinutes: 234,
  buildLimit: 1000,
};

const mockApiKeys = [
  { id: 1, name: "Production API", key: "clp_live_sk_...7d8f", created: "2024-01-15", lastUsed: "2 hours ago", usage: 3421 },
  { id: 2, name: "Development", key: "clp_test_sk_...4a2c", created: "2024-02-20", lastUsed: "5 days ago", usage: 892 },
];

const mockProjects = [
  { id: 1, name: "E-commerce Platform", language: "TypeScript", updated: "2 hours ago", size: "12.4 MB", stars: 45 },
  { id: 2, name: "AI Chat Bot", language: "Python", updated: "1 day ago", size: "4.2 MB", stars: 23 },
  { id: 3, name: "Mobile App API", language: "Go", updated: "3 days ago", size: "8.7 MB", stars: 67 },
];

function DashboardContent() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "ai" | "profile" | "apikeys" | "usage" | "billing" | "projects">("overview");
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-400" />
          <span className="text-white/60">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    redirect("/auth/signin");
  }

  const handleGenerateApiKey = () => {
    // Mock key generation - replace with actual API call
    const key = `clp_live_sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    setGeneratedKey(key);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <CroweLogicLogo size="sm" showText showTagline={false} variant="glow" />

              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-sm text-white font-medium">Dashboard</Link>
                <Link href="/ide" className="text-sm text-white/60 hover:text-white transition-colors">IDE</Link>
                <Link href="/projects" className="text-sm text-white/60 hover:text-white transition-colors">Projects</Link>
                <Link href="/docs" className="text-sm text-white/60 hover:text-white transition-colors">Docs</Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Terminal className="h-4 w-4 text-white/60" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="h-4 w-4 text-white/60" />
              </button>
              <div className="flex items-center gap-2">
                {session.user?.image ? (
                  <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                )}
                <span className="text-sm text-white/80">{session.user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4">
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === "overview" ? "bg-blue-500/20 text-blue-400" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === "ai" ? "bg-blue-500/20 text-blue-400" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  AI Assistant
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === "profile" ? "bg-blue-500/20 text-blue-400" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("apikeys")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === "apikeys" ? "bg-blue-500/20 text-blue-400" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Key className="h-4 w-4" />
                  API Keys
                </button>
                <button
                  onClick={() => setActiveTab("usage")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === "usage" ? "bg-blue-500/20 text-blue-400" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  Usage & Limits
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === "billing" ? "bg-blue-500/20 text-blue-400" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  Billing
                </button>
                <button
                  onClick={() => setActiveTab("projects")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === "projects" ? "bg-blue-500/20 text-blue-400" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <FolderOpen className="h-4 w-4" />
                  Projects
                </button>
              </div>

              <div className="mt-8 p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-400/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold text-white">Pro Plan</span>
                </div>
                <p className="text-xs text-white/60 mb-3">Unlock unlimited AI features</p>
                <button className="w-full px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {activeTab === "ai" && (
              <div className="h-[calc(100vh-200px)]">
                <AIChatInterface />
              </div>
            )}

            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Welcome back, {session.user?.name}</h1>
                  <p className="text-white/60">Here's an overview of your Crowe Logic Platform activity</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Brain className="h-5 w-5 text-blue-400" />
                      <span className="text-xs text-green-400">+23%</span>
                    </div>
                    <div className="text-2xl font-bold text-white">12,543</div>
                    <div className="text-xs text-white/60">AI Requests</div>
                  </div>

                  <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Database className="h-5 w-5 text-purple-400" />
                      <span className="text-xs text-white/60">2.4/10 GB</span>
                    </div>
                    <div className="text-2xl font-bold text-white">24%</div>
                    <div className="text-xs text-white/60">Storage Used</div>
                  </div>

                  <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <GitBranch className="h-5 w-5 text-green-400" />
                      <span className="text-xs text-green-400">Active</span>
                    </div>
                    <div className="text-2xl font-bold text-white">8</div>
                    <div className="text-xs text-white/60">Projects</div>
                  </div>

                  <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="h-5 w-5 text-orange-400" />
                      <span className="text-xs text-white/60">3/5</span>
                    </div>
                    <div className="text-2xl font-bold text-white">3</div>
                    <div className="text-xs text-white/60">Team Members</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Recent Projects</h2>
                  <div className="space-y-3">
                    {mockProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Code2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{project.name}</div>
                            <div className="text-xs text-white/40">{project.language} • {project.size}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-xs text-white/60">{project.updated}</div>
                          <ChevronRight className="h-4 w-4 text-white/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Profile Settings</h1>
                  <p className="text-white/60">Manage your account information and preferences</p>
                </div>

                <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      {session.user?.image ? (
                        <img src={session.user.image} alt="" className="w-20 h-20 rounded-full" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                      )}
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors">
                        Change Avatar
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Full Name</label>
                        <input
                          type="text"
                          defaultValue={session.user?.name || ""}
                          className="w-full px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue={session.user?.email || ""}
                          disabled
                          className="w-full px-4 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-white/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Bio</label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        <h3 className="text-sm font-medium text-white">Two-Factor Authentication</h3>
                        <p className="text-xs text-white/60">Add an extra layer of security to your account</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors">
                        Enable 2FA
                      </button>
                    </div>

                    <div className="pt-4">
                      <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "apikeys" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-2">API Keys</h1>
                    <p className="text-white/60">Manage your API keys for programmatic access</p>
                  </div>
                  <button
                    onClick={() => setShowNewKeyModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Generate New Key
                  </button>
                </div>

                <div className="bg-zinc-900/50 rounded-xl border border-white/10">
                  <div className="p-6 space-y-4">
                    {mockApiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Key className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{apiKey.name}</div>
                            <div className="flex items-center gap-4 mt-1">
                              <code className="text-xs text-white/40 font-mono">{apiKey.key}</code>
                              <span className="text-xs text-white/40">•</span>
                              <span className="text-xs text-white/40">Created {apiKey.created}</span>
                              <span className="text-xs text-white/40">•</span>
                              <span className="text-xs text-green-400">Used {apiKey.lastUsed}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/60">{apiKey.usage} calls</span>
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Copy className="h-4 w-4 text-white/40" />
                          </button>
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-200">Security Note</p>
                      <p className="text-xs text-yellow-200/60 mt-1">
                        Keep your API keys secure. Never share them publicly or commit them to version control.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "usage" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Usage & Limits</h1>
                  <p className="text-white/60">Monitor your resource usage and plan limits</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* AI Requests */}
                  <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-blue-400" />
                        <h3 className="font-medium text-white">AI Requests</h3>
                      </div>
                      <span className="text-sm text-white/60">This Month</span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Used</span>
                        <span className="text-white">{mockStats.apiCalls.toLocaleString()} / {mockStats.apiLimit.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${(mockStats.apiCalls / mockStats.apiLimit) * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-white/40">Resets in 12 days</p>
                  </div>

                  {/* Storage */}
                  <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-purple-400" />
                        <h3 className="font-medium text-white">Storage</h3>
                      </div>
                      <span className="text-sm text-white/60">Total</span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Used</span>
                        <span className="text-white">{mockStats.storageUsed} GB / {mockStats.storageLimit} GB</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${(mockStats.storageUsed / mockStats.storageLimit) * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-white/40">24% of total capacity</p>
                  </div>

                  {/* Build Minutes */}
                  <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-green-400" />
                        <h3 className="font-medium text-white">Build Minutes</h3>
                      </div>
                      <span className="text-sm text-white/60">This Month</span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Used</span>
                        <span className="text-white">{mockStats.buildMinutes} / {mockStats.buildLimit} min</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${(mockStats.buildMinutes / mockStats.buildLimit) * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-white/40">23% used this month</p>
                  </div>

                  {/* Collaborators */}
                  <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-orange-400" />
                        <h3 className="font-medium text-white">Team Members</h3>
                      </div>
                      <span className="text-sm text-white/60">Active</span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Members</span>
                        <span className="text-white">{mockStats.collaborators} / 5</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full"
                          style={{ width: `${(mockStats.collaborators / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-white/40">2 seats available</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-400/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Need more resources?</h3>
                      <p className="text-sm text-white/60">Upgrade to Pro for unlimited AI requests and more storage</p>
                    </div>
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all">
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h1>
                  <p className="text-white/60">Manage your subscription and payment methods</p>
                </div>

                <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Current Plan</h3>
                      <div className="flex items-center gap-3">
                        <CroweLogicBadge text="Developer Plan" />
                        <span className="text-sm text-white/60">$29/month</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors">
                      Change Plan
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-800/50 rounded-lg">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Next billing date</p>
                      <p className="text-sm font-medium text-white">February 15, 2025</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Payment method</p>
                      <p className="text-sm font-medium text-white">•••• 4242</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Status</p>
                      <p className="text-sm font-medium text-green-400">Active</p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Billing History</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-white/40" />
                        <div>
                          <p className="text-sm text-white">Developer Plan - Monthly</p>
                          <p className="text-xs text-white/40">January 15, 2025</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">$29.00</span>
                        <button className="text-xs text-blue-400 hover:text-blue-300">Download</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "projects" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Projects</h1>
                    <p className="text-white/60">Manage your code projects and repositories</p>
                  </div>
                  <Link
                    href="/ide"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    New Project
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {mockProjects.map((project) => (
                    <div key={project.id} className="bg-zinc-900/50 rounded-xl border border-white/10 p-6 hover:border-white/20 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Code2 className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{project.name}</h3>
                            <p className="text-xs text-white/40">{project.language}</p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <Globe className="h-4 w-4 text-white/40" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                        <span>{project.size}</span>
                        <span>•</span>
                        <span>Updated {project.updated}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span> {project.stars}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href="/ide"
                          className="flex-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white text-center transition-colors"
                        >
                          Open in IDE
                        </Link>
                        <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-colors">
                          Settings
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl border border-white/10 p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-white mb-4">Generate New API Key</h2>

            {!generatedKey ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white/60 mb-2">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production Server"
                    className="w-full px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleGenerateApiKey}
                    disabled={!newKeyName}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Key
                  </button>
                  <button
                    onClick={() => {
                      setShowNewKeyModal(false);
                      setNewKeyName("");
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-400 mb-2">Your API key has been generated!</p>
                  <p className="text-xs text-green-400/60">Make sure to copy it now. You won't be able to see it again.</p>
                </div>

                <div className="bg-zinc-800 rounded-lg p-3 mb-4">
                  <code className="text-xs text-white font-mono break-all">{generatedKey}</code>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyKey}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    {copiedKey ? (
                      <>
                        <span className="text-green-400">✓</span> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy Key
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewKeyModal(false);
                      setNewKeyName("");
                      setGeneratedKey("");
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap in dynamic to prevent SSR issues during build
const DashboardPage = dynamic(() => Promise.resolve(DashboardContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <RefreshCw className="h-5 w-5 animate-spin text-blue-400" />
        <span className="text-white/60">Loading dashboard...</span>
      </div>
    </div>
  )
});

export default DashboardPage;