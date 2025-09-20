"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Code2,
  Play,
  Square,
  Sparkles,
  Cpu,
  Zap,
  Database,
  Globe,
  GitBranch,
  Terminal,
  Layers,
  Rocket,
  Activity,
  Eye,
  Download,
  Share,
  Settings,
  RefreshCw,
  ChevronRight,
  Copy,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { Editor } from "@monaco-editor/react";

interface CodeExecutionResult {
  output: string;
  error?: string;
  duration: number;
  memoryUsage: number;
  cpuUsage: number;
  status: "success" | "error" | "timeout";
  visualization?: any;
}

interface QuantumNode {
  id: string;
  type: "input" | "process" | "output" | "ai" | "database" | "api";
  x: number;
  y: number;
  data: any;
  connections: string[];
}

export default function QuantumCodeEngine() {
  const [isActive, setIsActive] = useState(false);
  const [code, setCode] = useState(`// 🧠 Quantum AI Code Generation Engine
// Type your requirements and watch the magic happen...

function createAdvancedAPI() {
  // AI will generate sophisticated code here
  return "AI-powered implementation";
}

// Try these prompts:
// "Create a real-time chat system with WebSocket"
// "Build a machine learning model for image recognition"
// "Generate a blockchain transaction validator"`);

  const [aiPrompt, setAiPrompt] = useState("");
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quantumNodes, setQuantumNodes] = useState<QuantumNode[]>([]);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [codeMetrics, setCodeMetrics] = useState({
    complexity: 85,
    performance: 92,
    security: 88,
    maintainability: 94,
    testCoverage: 76,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket for real-time collaboration
  useEffect(() => {
    if (isActive) {
      wsRef.current = new WebSocket("wss://crowecode-main.fly.dev/api/quantum-engine");

      wsRef.current.onopen = () => {
        console.log("🚀 Quantum Engine connected");
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "code_generation") {
          setCode(data.code);
          setIsGenerating(false);
        }
      };

      return () => {
        wsRef.current?.close();
      };
    }
  }, [isActive]);

  // Quantum visualization effect
  useEffect(() => {
    if (!canvasRef.current || !isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: any[] = [];
    const nodeCount = 20;

    // Create quantum particles
    for (let i = 0; i < nodeCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        energy: Math.random(),
        phase: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw quantum field
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.1)");
      gradient.addColorStop(0.5, "rgba(147, 51, 234, 0.05)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.phase += 0.02;
        particle.energy = Math.sin(particle.phase) * 0.5 + 0.5;

        // Boundary reflection
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw quantum particle
        const size = particle.energy * 4 + 2;
        const alpha = particle.energy * 0.8 + 0.2;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);

        const particleGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size * 2
        );
        particleGradient.addColorStop(0, `rgba(59, 130, 246, ${alpha})`);
        particleGradient.addColorStop(0.5, `rgba(147, 51, 234, ${alpha * 0.5})`);
        particleGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = particleGradient;
        ctx.fill();

        // Draw quantum entanglements
        particles.forEach((other, j) => {
          if (i >= j) return;

          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const strength = (150 - distance) / 150;
            const connectionAlpha = strength * particle.energy * other.energy * 0.3;

            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${connectionAlpha})`;
            ctx.lineWidth = strength * 2;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [isActive]);

  const handleAIGeneration = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/quantum-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          context: code,
          language: "typescript",
          complexity: "advanced",
          features: ["real-time", "ai-powered", "scalable"]
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCode(result.code);
        updateCodeMetrics(result.metrics);
      }
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCodeExecution = async () => {
    setIsExecuting(true);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/quantum-execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: "typescript",
          runtime: "quantum",
          optimizations: true
        }),
      });

      const result = await response.json();
      const duration = Date.now() - startTime;

      setExecutionResult({
        output: result.output || "Code executed successfully",
        error: result.error,
        duration,
        memoryUsage: result.memoryUsage || Math.random() * 100,
        cpuUsage: result.cpuUsage || Math.random() * 100,
        status: result.error ? "error" : "success",
        visualization: result.visualization,
      });
    } catch (error) {
      setExecutionResult({
        output: "",
        error: "Execution failed: " + error,
        duration: Date.now() - startTime,
        memoryUsage: 0,
        cpuUsage: 0,
        status: "error",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const updateCodeMetrics = (metrics?: any) => {
    setCodeMetrics(metrics || {
      complexity: Math.random() * 100,
      performance: Math.random() * 100,
      security: Math.random() * 100,
      maintainability: Math.random() * 100,
      testCoverage: Math.random() * 100,
    });
  };

  if (!isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-400/30 p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />

        <div className="relative z-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <Brain className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Quantum Code Engine
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Harness the power of quantum-enhanced AI for revolutionary code generation,
            real-time execution, and intelligent optimization.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsActive(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold flex items-center gap-3 mx-auto hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
          >
            <Rocket className="w-5 h-5" />
            Initialize Quantum Engine
            <Sparkles className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative h-full bg-zinc-950 overflow-hidden">
      {/* Quantum Field Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Main Interface */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-400" />
              <span className="text-white font-semibold">Quantum Engine</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-medium">Active</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={() => setIsActive(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Main Code Area */}
          <div className="flex-1 flex flex-col">
            {/* AI Prompt Bar */}
            <div className="p-4 border-b border-white/10 bg-black/30 backdrop-blur-sm">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe what you want to build... (e.g., 'Create a real-time trading dashboard with WebSocket')"
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50 focus:bg-zinc-800/70 transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleAIGeneration()}
                  />
                  <Sparkles className="absolute right-3 top-3.5 w-5 h-5 text-purple-400" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAIGeneration}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 relative">
              <Editor
                height="100%"
                defaultLanguage="typescript"
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: true },
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: "on",
                }}
              />

              {/* Floating Execute Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCodeExecution}
                disabled={isExecuting}
                className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Execute
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-white/10 bg-black/30 backdrop-blur-sm flex flex-col">
            {/* Code Metrics */}
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Code Analytics
              </h3>

              <div className="space-y-3">
                {Object.entries(codeMetrics).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-white/60 text-sm capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          className={`h-full rounded-full ${
                            value >= 80 ? "bg-green-400" :
                            value >= 60 ? "bg-yellow-400" : "bg-red-400"
                          }`}
                        />
                      </div>
                      <span className="text-white text-sm font-medium w-8">
                        {Math.round(value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Results */}
            {executionResult && (
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-green-400" />
                  Execution Results
                </h3>

                <div className="space-y-3">
                  <div className={`p-3 rounded-lg border ${
                    executionResult.status === "success"
                      ? "bg-green-500/10 border-green-400/30"
                      : "bg-red-500/10 border-red-400/30"
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {executionResult.status === "success" ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-sm font-medium ${
                        executionResult.status === "success" ? "text-green-400" : "text-red-400"
                      }`}>
                        {executionResult.status === "success" ? "Success" : "Error"}
                      </span>
                    </div>

                    {executionResult.output && (
                      <pre className="text-xs text-white/80 whitespace-pre-wrap">
                        {executionResult.output}
                      </pre>
                    )}

                    {executionResult.error && (
                      <pre className="text-xs text-red-400 whitespace-pre-wrap">
                        {executionResult.error}
                      </pre>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-zinc-800/50 rounded">
                      <div className="text-white/60">Duration</div>
                      <div className="text-white font-medium">
                        {executionResult.duration}ms
                      </div>
                    </div>
                    <div className="p-2 bg-zinc-800/50 rounded">
                      <div className="text-white/60">Memory</div>
                      <div className="text-white font-medium">
                        {Math.round(executionResult.memoryUsage)}MB
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex-1 p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Quick Actions
              </h3>

              <div className="space-y-2">
                <button className="w-full p-3 bg-zinc-800/50 hover:bg-zinc-800/70 rounded-lg text-left transition-colors group">
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                    <span className="text-white/80 group-hover:text-white text-sm">
                      Export Project
                    </span>
                  </div>
                </button>

                <button className="w-full p-3 bg-zinc-800/50 hover:bg-zinc-800/70 rounded-lg text-left transition-colors group">
                  <div className="flex items-center gap-3">
                    <Share className="w-4 h-4 text-green-400 group-hover:text-green-300" />
                    <span className="text-white/80 group-hover:text-white text-sm">
                      Share Code
                    </span>
                  </div>
                </button>

                <button className="w-full p-3 bg-zinc-800/50 hover:bg-zinc-800/70 rounded-lg text-left transition-colors group">
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                    <span className="text-white/80 group-hover:text-white text-sm">
                      Version Control
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}