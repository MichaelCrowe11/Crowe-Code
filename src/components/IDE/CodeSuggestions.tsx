"use client";

import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  AlertCircle,
  Shield,
  Zap,
  Code2,
  Bug,
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface Suggestion {
  id: string;
  type: "optimization" | "security" | "bug" | "refactor" | "style";
  severity: "info" | "warning" | "error";
  line?: number;
  column?: number;
  message: string;
  description?: string;
  fix?: {
    code: string;
    explanation: string;
  };
}

interface CodeSuggestionsProps {
  code: string;
  language: string;
  fileName?: string;
  onApplyFix?: (line: number, column: number, newCode: string) => void;
}

export default function CodeSuggestions({
  code,
  language,
  fileName,
  onApplyFix
}: CodeSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code && code.length > 10) {
      analyzecode();
    } else {
      setSuggestions([]);
    }
  }, [code, language]);

  const analyzecode = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          fileName,
          analysisType: "comprehensive",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze code");
      }

      const data = await response.json();

      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (err: any) {
      console.error("Error analyzing code:", err);
      setError(err.message || "Failed to analyze code");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "warning":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      default:
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "optimization":
        return <Zap className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      case "bug":
        return <Bug className="h-4 w-4" />;
      case "refactor":
        return <Code2 className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const handleApplyFix = (suggestion: Suggestion) => {
    if (suggestion.fix && onApplyFix && suggestion.line !== undefined) {
      onApplyFix(
        suggestion.line,
        suggestion.column || 0,
        suggestion.fix.code
      );
    }
  };

  const mockSuggestions: Suggestion[] = [
    {
      id: "1",
      type: "optimization",
      severity: "warning",
      line: 5,
      message: "Consider using useMemo for expensive computation",
      description: "This calculation runs on every render. Memoizing it could improve performance.",
      fix: {
        code: "const memoizedValue = useMemo(() => expensiveCalculation(data), [data]);",
        explanation: "Wrap the expensive calculation in useMemo to prevent unnecessary recalculations"
      }
    },
    {
      id: "2",
      type: "security",
      severity: "error",
      line: 12,
      message: "Potential XSS vulnerability",
      description: "User input is being rendered without sanitization.",
      fix: {
        code: "dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }}",
        explanation: "Use DOMPurify to sanitize user input before rendering"
      }
    },
    {
      id: "3",
      type: "refactor",
      severity: "info",
      line: 20,
      message: "Function could be simplified",
      description: "This function has multiple return statements that could be consolidated.",
      fix: {
        code: "return condition ? valueA : valueB;",
        explanation: "Use a ternary operator for simpler conditional returns"
      }
    }
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : (loading ? [] : mockSuggestions);

  return (
    <div className="h-full flex flex-col bg-zinc-900/50">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-blue-500/10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Crowe Intelligence Analysis
          </span>
        </div>
        <button
          onClick={analyzecode}
          disabled={loading || !code}
          className="p-1 hover:bg-white/10 rounded disabled:opacity-50"
          title="Refresh analysis"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center text-sm text-gray-400">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
            Analyzing code with Crowe Intelligence...
          </div>
        )}

        {error && (
          <div className="p-3 m-2 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400">
            <XCircle className="h-4 w-4 inline mr-2" />
            {error}
          </div>
        )}

        {!loading && displaySuggestions.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500">
            <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-medium">Code looks great!</p>
            <p className="text-xs mt-1">No suggestions at this time</p>
          </div>
        )}

        <div className="space-y-2 p-2">
          {displaySuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`rounded-lg border p-3 cursor-pointer transition-all ${
                getSeverityColor(suggestion.severity)
              } ${
                selectedSuggestion === suggestion.id
                  ? "ring-1 ring-emerald-400"
                  : "hover:ring-1 hover:ring-white/20"
              }`}
              onClick={() =>
                setSelectedSuggestion(
                  selectedSuggestion === suggestion.id ? null : suggestion.id
                )
              }
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{getTypeIcon(suggestion.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">
                      {suggestion.line ? `Line ${suggestion.line}` : "Global"}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded">
                      {suggestion.type}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{suggestion.message}</p>

                  {selectedSuggestion === suggestion.id && (
                    <div className="mt-2 space-y-2">
                      {suggestion.description && (
                        <p className="text-xs text-gray-400">
                          {suggestion.description}
                        </p>
                      )}

                      {suggestion.fix && (
                        <div className="bg-black/30 rounded p-2 space-y-2">
                          <p className="text-xs text-gray-400">
                            Suggested fix:
                          </p>
                          <pre className="text-xs overflow-x-auto">
                            <code>{suggestion.fix.code}</code>
                          </pre>
                          <p className="text-xs text-gray-500">
                            {suggestion.fix.explanation}
                          </p>
                          {onApplyFix && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyFix(suggestion);
                              }}
                              className="text-xs px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 rounded text-emerald-400 flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Apply Fix
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <ChevronRight
                  className={`h-3 w-3 transition-transform ${
                    selectedSuggestion === suggestion.id ? "rotate-90" : ""
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-3 py-2 border-t border-white/10 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>{displaySuggestions.length} suggestion{displaySuggestions.length !== 1 ? "s" : ""}</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            AI-Powered Analysis
          </span>
        </div>
      </div>
    </div>
  );
}