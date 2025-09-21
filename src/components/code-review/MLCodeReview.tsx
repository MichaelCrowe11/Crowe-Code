"use client";

import React, { useState, useCallback } from 'react';
import { Shield, AlertTriangle, Zap, CheckCircle, XCircle, Info, GitBranch, Clock, TrendingUp, Code, FileCode, Brain, Sparkles, Search, Filter, Download, RefreshCw, ChevronRight, Bug, Lock, Gauge, BookOpen, Award } from 'lucide-react';

interface CodeIssue {
  id: string;
  type: 'bug' | 'security' | 'performance' | 'style' | 'best-practice';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  file: string;
  line: number;
  column: number;
  message: string;
  suggestion: string;
  codeSnippet: string;
  fixSnippet?: string;
  confidence: number;
  category: string;
  references?: string[];
}

interface ReviewMetrics {
  totalIssues: number;
  criticalIssues: number;
  securityVulnerabilities: number;
  performanceIssues: number;
  codeQualityScore: number;
  complexityScore: number;
  maintainabilityIndex: number;
  testCoverage: number;
  duplicateCodePercentage: number;
  technicalDebtHours: number;
}

interface ReviewHistory {
  id: string;
  timestamp: string;
  filesReviewed: number;
  issuesFound: number;
  issuesFixed: number;
  qualityImprovement: number;
}

const mockIssues: CodeIssue[] = [
  {
    id: '1',
    type: 'security',
    severity: 'critical',
    file: 'src/api/auth.ts',
    line: 45,
    column: 12,
    message: 'SQL Injection vulnerability detected',
    suggestion: 'Use parameterized queries to prevent SQL injection',
    codeSnippet: 'const query = `SELECT * FROM users WHERE id = ${userId}`;',
    fixSnippet: 'const query = "SELECT * FROM users WHERE id = ?"; db.query(query, [userId]);',
    confidence: 0.95,
    category: 'SQL Injection',
    references: ['OWASP Top 10', 'CWE-89']
  },
  {
    id: '2',
    type: 'performance',
    severity: 'high',
    file: 'src/components/Dashboard.tsx',
    line: 128,
    column: 8,
    message: 'Inefficient array operation in render loop',
    suggestion: 'Move array filtering outside of render method or use useMemo',
    codeSnippet: 'const filtered = data.filter(item => item.active).map(item => <Item key={item.id} />);',
    fixSnippet: 'const filtered = useMemo(() => data.filter(item => item.active), [data]);',
    confidence: 0.88,
    category: 'React Performance'
  },
  {
    id: '3',
    type: 'bug',
    severity: 'medium',
    file: 'src/utils/helpers.ts',
    line: 67,
    column: 15,
    message: 'Potential null pointer exception',
    suggestion: 'Add null check before accessing property',
    codeSnippet: 'return user.profile.name.toUpperCase();',
    fixSnippet: 'return user?.profile?.name?.toUpperCase() || "";',
    confidence: 0.82,
    category: 'Null Safety'
  },
  {
    id: '4',
    type: 'best-practice',
    severity: 'low',
    file: 'src/services/api.ts',
    line: 203,
    column: 4,
    message: 'Missing error handling in async function',
    suggestion: 'Wrap async operations in try-catch blocks',
    codeSnippet: 'const data = await fetch(url);',
    fixSnippet: 'try { const data = await fetch(url); } catch (error) { console.error("API Error:", error); }',
    confidence: 0.75,
    category: 'Error Handling'
  },
  {
    id: '5',
    type: 'security',
    severity: 'high',
    file: 'src/api/upload.ts',
    line: 89,
    column: 20,
    message: 'Missing file type validation',
    suggestion: 'Validate file MIME types before processing uploads',
    codeSnippet: 'const file = req.files[0];',
    fixSnippet: 'const allowedTypes = ["image/jpeg", "image/png"]; if (!allowedTypes.includes(file.mimetype)) throw new Error("Invalid file type");',
    confidence: 0.91,
    category: 'File Upload Security',
    references: ['OWASP File Upload']
  }
];

const mockMetrics: ReviewMetrics = {
  totalIssues: 47,
  criticalIssues: 3,
  securityVulnerabilities: 8,
  performanceIssues: 12,
  codeQualityScore: 78,
  complexityScore: 6.2,
  maintainabilityIndex: 72,
  testCoverage: 68,
  duplicateCodePercentage: 4.2,
  technicalDebtHours: 18.5
};

export default function MLCodeReview() {
  const [issues, setIssues] = useState<CodeIssue[]>(mockIssues);
  const [metrics, setMetrics] = useState<ReviewMetrics>(mockMetrics);
  const [selectedIssue, setSelectedIssue] = useState<CodeIssue | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [isReviewing, setIsReviewing] = useState(false);
  const [autoFix, setAutoFix] = useState(false);
  const [reviewProgress, setReviewProgress] = useState(0);
  const [fixedIssues, setFixedIssues] = useState<Set<string>>(new Set());

  // Start code review
  const startReview = useCallback(async () => {
    setIsReviewing(true);
    setReviewProgress(0);

    // Simulate review progress
    const interval = setInterval(() => {
      setReviewProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReviewing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  }, []);

  // Apply auto-fix for an issue
  const applyFix = useCallback((issue: CodeIssue) => {
    if (issue.fixSnippet) {
      setFixedIssues(prev => new Set([...prev, issue.id]));
      setIssues(issues.filter(i => i.id !== issue.id));
      setMetrics(prev => ({
        ...prev,
        totalIssues: prev.totalIssues - 1,
        codeQualityScore: Math.min(100, prev.codeQualityScore + 2)
      }));
    }
  }, [issues]);

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const typeMatch = filterType === 'all' || issue.type === filterType;
    const severityMatch = filterSeverity === 'all' || issue.severity === filterSeverity;
    return typeMatch && severityMatch;
  });

  // Get icon for issue type
  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'bug': return Bug;
      case 'security': return Lock;
      case 'performance': return Gauge;
      case 'style': return Code;
      case 'best-practice': return BookOpen;
      default: return Info;
    }
  };

  // Get color for severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-blue-500 bg-blue-500/10';
      case 'info': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-semibold">ML-Powered Code Review</h1>
            </div>
            <span className="text-sm text-white/40">AI-driven code analysis and optimization</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={autoFix}
                onChange={(e) => setAutoFix(e.target.checked)}
                className="w-4 h-4 rounded text-purple-500 bg-white/10 border-white/20"
              />
              <span className="text-sm">Auto-fix Issues</span>
            </label>

            <button
              onClick={startReview}
              disabled={isReviewing}
              className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isReviewing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Reviewing... {reviewProgress}%
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Start Review
                </>
              )}
            </button>

            <button className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg flex items-center gap-2 transition-all">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Review Progress */}
        {isReviewing && (
          <div className="px-6 pb-4">
            <div className="w-full bg-white/5 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${reviewProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Metrics Sidebar */}
        <div className="w-80 bg-zinc-900/50 border-r border-white/10 p-6 overflow-y-auto">
          <h3 className="text-sm font-medium text-white/60 mb-4">CODE METRICS</h3>

          <div className="space-y-4">
            {/* Quality Score */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Quality Score</span>
                <Award className="h-4 w-4 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white">{metrics.codeQualityScore}/100</div>
              <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                  style={{ width: `${metrics.codeQualityScore}%` }}
                />
              </div>
            </div>

            {/* Issue Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{metrics.criticalIssues}</div>
                <div className="text-xs text-white/60">Critical Issues</div>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">{metrics.securityVulnerabilities}</div>
                <div className="text-xs text-white/60">Security</div>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{metrics.performanceIssues}</div>
                <div className="text-xs text-white/60">Performance</div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{metrics.totalIssues}</div>
                <div className="text-xs text-white/60">Total Issues</div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-white/60">Complexity Score</span>
                <span className="text-sm font-medium">{metrics.complexityScore.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-white/60">Maintainability</span>
                <span className="text-sm font-medium">{metrics.maintainabilityIndex}%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-white/60">Test Coverage</span>
                <span className="text-sm font-medium">{metrics.testCoverage}%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-white/60">Duplicate Code</span>
                <span className="text-sm font-medium">{metrics.duplicateCodePercentage.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-white/60">Technical Debt</span>
                <span className="text-sm font-medium">{metrics.technicalDebtHours.toFixed(1)}h</span>
              </div>
            </div>

            {/* AI Insights */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">AI Insights</span>
              </div>
              <ul className="space-y-1 text-xs text-white/60">
                <li>• Consider refactoring auth module</li>
                <li>• Add input validation in 3 endpoints</li>
                <li>• Optimize database queries in Dashboard</li>
                <li>• Implement caching strategy</li>
              </ul>
            </div>

            {/* Fixed Issues */}
            {fixedIssues.size > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Fixed Issues</span>
                </div>
                <div className="text-2xl font-bold text-green-400">{fixedIssues.size}</div>
                <div className="text-xs text-white/60">Issues auto-fixed this session</div>
              </div>
            )}
          </div>
        </div>

        {/* Issues List */}
        <div className="flex-1 flex flex-col">
          {/* Filters */}
          <div className="px-6 py-4 bg-zinc-900/30 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-white/40" />
                <span className="text-sm text-white/60">Filter:</span>
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500/50"
              >
                <option value="all">All Types</option>
                <option value="bug">Bugs</option>
                <option value="security">Security</option>
                <option value="performance">Performance</option>
                <option value="style">Style</option>
                <option value="best-practice">Best Practice</option>
              </select>

              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500/50"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>

              <div className="ml-auto text-sm text-white/40">
                {filteredIssues.length} issues found
              </div>
            </div>
          </div>

          {/* Issues */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {filteredIssues.map(issue => {
                const Icon = getIssueIcon(issue.type);
                const isFixed = fixedIssues.has(issue.id);

                return (
                  <div
                    key={issue.id}
                    className={`p-4 bg-white/5 rounded-lg border ${
                      selectedIssue?.id === issue.id
                        ? 'border-purple-500/50 bg-purple-500/5'
                        : 'border-white/10'
                    } cursor-pointer hover:bg-white/10 transition-all ${
                      isFixed ? 'opacity-50' : ''
                    }`}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getSeverityColor(issue.severity)}`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(issue.severity)}`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-white/40">{issue.category}</span>
                          <span className="text-xs text-white/40">•</span>
                          <span className="text-xs text-white/40">
                            {issue.file}:{issue.line}:{issue.column}
                          </span>
                          {issue.confidence && (
                            <>
                              <span className="text-xs text-white/40">•</span>
                              <span className="text-xs text-white/40">
                                {Math.round(issue.confidence * 100)}% confidence
                              </span>
                            </>
                          )}
                        </div>

                        <div className="font-medium mb-2">{issue.message}</div>

                        <div className="text-sm text-white/60 mb-3">{issue.suggestion}</div>

                        {/* Code Snippet */}
                        <div className="bg-zinc-900 rounded-lg p-3 mb-3">
                          <code className="text-xs text-red-400 font-mono">
                            {issue.codeSnippet}
                          </code>
                        </div>

                        {/* Fix Snippet */}
                        {issue.fixSnippet && (
                          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                            <div className="text-xs text-green-400 mb-1 font-medium">Suggested Fix:</div>
                            <code className="text-xs text-green-300 font-mono">
                              {issue.fixSnippet}
                            </code>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3">
                          {issue.fixSnippet && !isFixed && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                applyFix(issue);
                              }}
                              className="px-3 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs flex items-center gap-1 transition-all"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Apply Fix
                            </button>
                          )}
                          {isFixed && (
                            <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Fixed
                            </span>
                          )}
                          <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs transition-all">
                            View in Editor
                          </button>
                          <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs transition-all">
                            Ignore
                          </button>
                        </div>

                        {/* References */}
                        {issue.references && issue.references.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-white/40">References:</span>
                            {issue.references.map((ref, i) => (
                              <span key={i} className="text-xs text-blue-400 hover:underline cursor-pointer">
                                {ref}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}