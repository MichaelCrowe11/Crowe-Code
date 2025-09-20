"use client";

import React from 'react';
import CroweLogicLogo from './CroweLogicLogo';

interface BrandingProps {
  variant?: 'header' | 'footer' | 'splash' | 'minimal';
  className?: string;
}

export function CroweLogicHeader({ className = '' }: { className?: string }) {
  return (
    <header className={`h-14 border-b border-white/10 flex items-center px-4 bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 ${className}`}>
      <CroweLogicLogo size="md" showText showTagline variant="glow" />

      {/* Navigation */}
      <nav className="flex-1 flex items-center justify-center gap-6">
        <a href="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors">Dashboard</a>
        <a href="/ide" className="text-sm text-white/60 hover:text-white transition-colors">IDE</a>
        <a href="/projects" className="text-sm text-white/60 hover:text-white transition-colors">Projects</a>
        <a href="/ai-tools" className="text-sm text-white/60 hover:text-white transition-colors">AI Tools</a>
        <a href="/docs" className="text-sm text-white/60 hover:text-white transition-colors">Documentation</a>
      </nav>

      {/* User Menu Placeholder */}
      <div className="flex items-center gap-4">
        <button className="text-sm text-white/60 hover:text-white transition-colors">Settings</button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
      </div>
    </header>
  );
}

export function CroweLogicFooter({ className = '' }: { className?: string }) {
  return (
    <footer className={`h-8 border-t border-white/10 flex items-center justify-between px-4 bg-zinc-900/80 ${className}`}>
      <div className="flex items-center gap-4 text-xs text-white/40">
        <span>© 2025 Crowe Logic Platform</span>
        <span>•</span>
        <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
        <span>•</span>
        <a href="/terms" className="hover:text-white transition-colors">Terms</a>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/40">All Systems Operational</span>
        </span>
        <span className="text-white/30">•</span>
        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
          Crowe Intelligence v2.0
        </span>
      </div>
    </footer>
  );
}

export function CroweLogicSplash({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-6 p-8 ${className}`}>
      <CroweLogicLogo size="xl" showText showTagline variant="glow" />

      <div className="text-center space-y-2 max-w-md">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Welcome to Crowe Logic Platform
        </h1>
        <p className="text-sm text-white/60">
          The most advanced AI-powered development platform. Build, deploy, and scale with intelligence.
        </p>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105">
          Get Started
        </button>
        <button className="px-6 py-2 border border-white/20 text-white/80 rounded-lg hover:bg-white/10 transition-all">
          Learn More
        </button>
      </div>
    </div>
  );
}

export function CroweLogicBadge({
  text = "Powered by Crowe Logic",
  className = ''
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-full ${className}`}>
      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" />
      <span className="text-xs bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
        {text}
      </span>
    </div>
  );
}

export function CroweLogicStatusBar({
  status = 'connected',
  message = 'Crowe Intelligence Active',
  className = ''
}: {
  status?: 'connected' | 'disconnected' | 'loading';
  message?: string;
  className?: string;
}) {
  const statusColors = {
    connected: 'bg-green-400',
    disconnected: 'bg-red-400',
    loading: 'bg-yellow-400'
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1 bg-zinc-900/50 border border-white/10 rounded-lg ${className}`}>
      <div className={`w-2 h-2 ${statusColors[status]} rounded-full ${status === 'loading' ? 'animate-pulse' : ''}`} />
      <span className="text-xs text-white/60">{message}</span>
    </div>
  );
}

// Main export with all components
export default {
  Logo: CroweLogicLogo,
  Header: CroweLogicHeader,
  Footer: CroweLogicFooter,
  Splash: CroweLogicSplash,
  Badge: CroweLogicBadge,
  StatusBar: CroweLogicStatusBar
};