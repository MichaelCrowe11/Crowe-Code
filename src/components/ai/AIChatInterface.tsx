"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Code2,
  FileText,
  Terminal,
  Sparkles,
  Copy,
  RefreshCw,
  Download,
  ChevronDown,
  Settings,
  Zap,
  Brain,
  Hash,
  Globe,
  Database,
  Shield,
  GitBranch,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: number;
  code?: { language: string; content: string }[];
}

interface Suggestion {
  icon: any;
  text: string;
  prompt: string;
}

const suggestions: Suggestion[] = [
  {
    icon: Code2,
    text: "Write a React component",
    prompt: "Create a React component with TypeScript that implements a searchable data table with sorting and pagination",
  },
  {
    icon: Database,
    text: "Design a database schema",
    prompt: "Design a PostgreSQL database schema for an e-commerce platform with users, products, orders, and reviews",
  },
  {
    icon: Shield,
    text: "Security best practices",
    prompt: "What are the security best practices for a Node.js API handling sensitive user data?",
  },
  {
    icon: GitBranch,
    text: "Git workflow strategy",
    prompt: "Explain the best Git branching strategy for a team of 5 developers working on a SaaS product",
  },
];

const models = [
  { id: "crowecode-ultra", name: "CroweCode Ultra", icon: Brain, speed: "Fastest", context: "256K" },
  { id: "crowecode-pro", name: "CroweCode Pro", icon: Zap, speed: "Fast", context: "128K" },
  { id: "claude-opus", name: "Claude Opus", icon: Bot, speed: "Balanced", context: "200K" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", icon: Globe, speed: "Standard", context: "128K" },
];

export default function AIChatInterface() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModel.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
        model: selectedModel.name,
        tokens: data.tokens,
        code: data.code,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        });
      }

      // Add code block
      parts.push({
        type: "code",
        language: match[1] || "plaintext",
        content: match[2].trim(),
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }

    return parts;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 rounded-xl border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">CroweCode Intelligence</h2>
            <p className="text-xs text-white/60">AI-powered coding assistant</p>
          </div>
        </div>

        {/* Model Selector */}
        <div className="relative">
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <selectedModel.icon className="h-3 w-3 text-blue-400" />
            <span className="text-xs text-white">{selectedModel.name}</span>
            <ChevronDown className="h-3 w-3 text-white/40" />
          </button>

          {showModelDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-zinc-800 rounded-lg border border-white/10 shadow-xl z-10">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model);
                    setShowModelDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <model.icon className="h-4 w-4 text-blue-400" />
                  <div className="flex-1 text-left">
                    <div className="text-sm text-white">{model.name}</div>
                    <div className="text-xs text-white/40">
                      {model.speed} • {model.context}
                    </div>
                  </div>
                  {selectedModel.id === model.id && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              How can I help you code today?
            </h3>
            <p className="text-sm text-white/60 mb-8 text-center max-w-md">
              I can help you write code, debug issues, explain concepts, and optimize your solutions
            </p>

            {/* Suggestions */}
            <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestion(suggestion.prompt)}
                  className="flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-white/10 hover:border-white/20 transition-all text-left"
                >
                  <suggestion.icon className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-white/80">{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : ""
                }`}
              >
                {message.role !== "user" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] ${
                    message.role === "user"
                      ? "bg-blue-500/20 border-blue-400/20"
                      : message.role === "system"
                      ? "bg-yellow-500/10 border-yellow-400/20"
                      : "bg-zinc-800/50 border-white/10"
                  } rounded-lg border p-4`}
                >
                  <div className="space-y-3">
                    {formatMessage(message.content).map((part, index) => (
                      <div key={index}>
                        {part.type === "text" ? (
                          <p className="text-sm text-white/90 whitespace-pre-wrap">
                            {part.content}
                          </p>
                        ) : (
                          <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-white/60">
                                {part.language}
                              </span>
                              <button
                                onClick={() => handleCopyCode(part.content)}
                                className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white/80 transition-colors"
                              >
                                <Copy className="h-3 w-3" />
                                Copy
                              </button>
                            </div>
                            <SyntaxHighlighter
                              language={part.language}
                              style={vscDarkPlus}
                              customStyle={{
                                background: "rgb(0 0 0 / 0.3)",
                                padding: "1rem",
                                borderRadius: "0.5rem",
                                fontSize: "0.875rem",
                              }}
                            >
                              {part.content}
                            </SyntaxHighlighter>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {message.model && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                      <span className="text-xs text-white/40">
                        {message.model}
                      </span>
                      {message.tokens && (
                        <>
                          <span className="text-xs text-white/20">•</span>
                          <span className="text-xs text-white/40">
                            {message.tokens} tokens
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-zinc-800/50 rounded-lg border border-white/10 p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                    <span className="text-sm text-white/60">
                      CroweCode is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about coding..."
            className="flex-1 px-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-400 resize-none"
            rows={1}
            style={{
              minHeight: "44px",
              maxHeight: "120px",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            <button className="text-xs text-white/40 hover:text-white/60 transition-colors">
              <FileText className="h-4 w-4" />
            </button>
            <button className="text-xs text-white/40 hover:text-white/60 transition-colors">
              <Terminal className="h-4 w-4" />
            </button>
            <button className="text-xs text-white/40 hover:text-white/60 transition-colors">
              <Settings className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-white/40">
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
}