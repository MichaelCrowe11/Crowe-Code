"use client";

import React, { useState, useCallback } from 'react';
import { Flask, Play, Download, Upload, CheckCircle, XCircle, AlertTriangle, Code, FileCode, Settings, Filter, RefreshCw, Zap, Brain, Target, Shield, Clock, TrendingUp, Package, GitBranch, Terminal, Copy, ChevronRight, Sparkles } from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  code: string;
  assertions: number;
  coverage: number;
  executionTime?: number;
  error?: string;
  framework: string;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: TestCase[];
  coverage: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

interface CodeAnalysis {
  functions: string[];
  classes: string[];
  complexity: number;
  dependencies: string[];
  testableUnits: number;
  existingTests: number;
  coverage: number;
}

const testFrameworks = [
  { id: 'jest', name: 'Jest', icon: '🃏' },
  { id: 'mocha', name: 'Mocha', icon: '☕' },
  { id: 'vitest', name: 'Vitest', icon: '⚡' },
  { id: 'playwright', name: 'Playwright', icon: '🎭' },
  { id: 'cypress', name: 'Cypress', icon: '🌲' },
  { id: 'pytest', name: 'PyTest', icon: '🐍' }
];

const testStrategies = [
  { id: 'comprehensive', name: 'Comprehensive', description: 'Generate tests for all functions and edge cases' },
  { id: 'critical', name: 'Critical Path', description: 'Focus on core functionality and main user flows' },
  { id: 'boundary', name: 'Boundary Testing', description: 'Test edge cases and boundary conditions' },
  { id: 'mutation', name: 'Mutation Testing', description: 'Generate tests to catch code mutations' },
  { id: 'regression', name: 'Regression', description: 'Prevent previously fixed bugs from reoccurring' },
  { id: 'performance', name: 'Performance', description: 'Test performance and scalability' }
];

export default function IntelligentTestGeneration() {
  const [sourceCode, setSourceCode] = useState('');
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [generatedTests, setGeneratedTests] = useState<TestCase[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [selectedFramework, setSelectedFramework] = useState('jest');
  const [selectedStrategy, setSelectedStrategy] = useState('comprehensive');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);
  const [coverageTarget, setCoverageTarget] = useState(80);
  const [generateMocks, setGenerateMocks] = useState(true);
  const [generateSnapshots, setGenerateSnapshots] = useState(false);

  // Analyze source code
  const analyzeCode = useCallback(async () => {
    if (!sourceCode.trim()) return;

    setIsAnalyzing(true);
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 1500));

    setAnalysis({
      functions: ['calculateSum', 'getUserData', 'validateInput', 'processOrder', 'sendEmail'],
      classes: ['User', 'Order', 'PaymentProcessor'],
      complexity: 12,
      dependencies: ['axios', 'lodash', 'moment'],
      testableUnits: 15,
      existingTests: 3,
      coverage: 20
    });
    setIsAnalyzing(false);
  }, [sourceCode]);

  // Generate tests
  const generateTests = useCallback(async () => {
    if (!analysis) return;

    setIsGenerating(true);
    // Simulate test generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockTests: TestCase[] = [
      {
        id: '1',
        name: 'calculateSum should return correct sum',
        description: 'Test basic addition functionality',
        type: 'unit',
        status: 'pending',
        code: `describe('calculateSum', () => {
  it('should return the sum of two positive numbers', () => {
    expect(calculateSum(2, 3)).toBe(5);
  });

  it('should handle negative numbers', () => {
    expect(calculateSum(-1, -1)).toBe(-2);
  });

  it('should handle zero', () => {
    expect(calculateSum(0, 5)).toBe(5);
  });
});`,
        assertions: 3,
        coverage: 100,
        framework: selectedFramework
      },
      {
        id: '2',
        name: 'getUserData integration test',
        description: 'Test API integration for user data retrieval',
        type: 'integration',
        status: 'pending',
        code: `describe('getUserData', () => {
  it('should fetch user data successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe' };
    axios.get.mockResolvedValue({ data: mockUser });

    const result = await getUserData(1);
    expect(result).toEqual(mockUser);
    expect(axios.get).toHaveBeenCalledWith('/api/users/1');
  });

  it('should handle API errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    await expect(getUserData(1)).rejects.toThrow('Network error');
  });
});`,
        assertions: 4,
        coverage: 85,
        framework: selectedFramework
      },
      {
        id: '3',
        name: 'Order flow E2E test',
        description: 'Complete order placement flow',
        type: 'e2e',
        status: 'pending',
        code: `describe('Order Placement Flow', () => {
  test('user can complete order', async () => {
    await page.goto('/products');
    await page.click('[data-testid="product-1"]');
    await page.click('[data-testid="add-to-cart"]');
    await page.goto('/cart');
    await page.click('[data-testid="checkout"]');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="card"]', '4242424242424242');
    await page.click('[data-testid="place-order"]');

    await expect(page).toHaveURL('/order-confirmation');
    await expect(page.locator('.success-message')).toBeVisible();
  });
});`,
        assertions: 2,
        coverage: 70,
        framework: 'playwright'
      },
      {
        id: '4',
        name: 'Performance test for data processing',
        description: 'Ensure data processing meets performance requirements',
        type: 'performance',
        status: 'pending',
        code: `describe('Performance Tests', () => {
  it('should process 1000 records under 100ms', () => {
    const startTime = performance.now();
    const data = generateLargeDataset(1000);
    processData(data);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100);
  });

  it('should handle concurrent requests', async () => {
    const requests = Array(100).fill(null).map(() =>
      makeRequest('/api/data')
    );

    const results = await Promise.all(requests);
    expect(results.every(r => r.status === 200)).toBe(true);
  });
});`,
        assertions: 2,
        coverage: 60,
        framework: selectedFramework
      },
      {
        id: '5',
        name: 'Security validation test',
        description: 'Test input validation and sanitization',
        type: 'security',
        status: 'pending',
        code: `describe('Security Tests', () => {
  it('should prevent SQL injection', () => {
    const maliciousInput = "'; DROP TABLE users; --";
    expect(() => validateInput(maliciousInput)).toThrow('Invalid input');
  });

  it('should sanitize XSS attempts', () => {
    const xssInput = '<script>alert("XSS")</script>';
    const sanitized = sanitizeHtml(xssInput);
    expect(sanitized).not.toContain('<script>');
  });

  it('should enforce rate limiting', async () => {
    const requests = Array(11).fill(null).map(() =>
      makeRequest('/api/protected')
    );

    const lastRequest = await requests[10];
    expect(lastRequest.status).toBe(429);
  });
});`,
        assertions: 3,
        coverage: 90,
        framework: selectedFramework
      }
    ];

    setGeneratedTests(mockTests);

    // Create test suite
    const suite: TestSuite = {
      id: 'suite-1',
      name: 'Generated Test Suite',
      description: `AI-generated tests using ${selectedStrategy} strategy`,
      tests: mockTests,
      coverage: 75,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0
    };

    setTestSuites([suite]);
    setIsGenerating(false);
  }, [analysis, selectedFramework, selectedStrategy]);

  // Run tests
  const runTests = useCallback(async () => {
    setIsRunning(true);

    // Simulate running tests one by one
    for (let i = 0; i < generatedTests.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const test = generatedTests[i];
      const passed = Math.random() > 0.2; // 80% pass rate

      setGeneratedTests(prev => prev.map((t, index) => {
        if (index === i) {
          return {
            ...t,
            status: passed ? 'passed' : 'failed',
            executionTime: Math.random() * 100 + 10,
            error: passed ? undefined : 'Assertion failed: expected 5 but got 4'
          };
        }
        return t;
      }));
    }

    setIsRunning(false);
  }, [generatedTests]);

  // Export tests
  const exportTests = useCallback(() => {
    const testsContent = generatedTests.map(test => test.code).join('\n\n');
    const blob = new Blob([testsContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-tests-${Date.now()}.test.js`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedTests]);

  // Get test status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'skipped': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flask className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-semibold">Intelligent Test Generation</h1>
            </div>
            <span className="text-sm text-white/40">AI-powered test creation and optimization</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportTests}
              disabled={generatedTests.length === 0}
              className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export Tests
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Configuration Sidebar */}
        <div className="w-80 bg-zinc-900/50 border-r border-white/10 p-6 overflow-y-auto">
          <h3 className="text-sm font-medium text-white/60 mb-4">CONFIGURATION</h3>

          <div className="space-y-6">
            {/* Framework Selection */}
            <div>
              <label className="text-sm text-white/60 mb-2 block">Test Framework</label>
              <div className="grid grid-cols-2 gap-2">
                {testFrameworks.map(fw => (
                  <button
                    key={fw.id}
                    onClick={() => setSelectedFramework(fw.id)}
                    className={`p-2 rounded-lg border transition-all ${
                      selectedFramework === fw.id
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg">{fw.icon}</span>
                    <div className="text-xs mt-1">{fw.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Strategy */}
            <div>
              <label className="text-sm text-white/60 mb-2 block">Test Strategy</label>
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50"
              >
                {testStrategies.map(strategy => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-white/40 mt-2">
                {testStrategies.find(s => s.id === selectedStrategy)?.description}
              </p>
            </div>

            {/* Coverage Target */}
            <div>
              <label className="text-sm text-white/60 mb-2 block">
                Coverage Target: {coverageTarget}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={coverageTarget}
                onChange={(e) => setCoverageTarget(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={generateMocks}
                  onChange={(e) => setGenerateMocks(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Generate mocks automatically</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={generateSnapshots}
                  onChange={(e) => setGenerateSnapshots(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Generate snapshots</span>
              </label>
            </div>

            {/* Code Analysis */}
            {analysis && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">Code Analysis</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/60">Functions</span>
                    <span className="text-white">{analysis.functions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Classes</span>
                    <span className="text-white">{analysis.classes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Complexity</span>
                    <span className="text-white">{analysis.complexity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Testable Units</span>
                    <span className="text-white">{analysis.testableUnits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Current Coverage</span>
                    <span className="text-yellow-400">{analysis.coverage}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Input Area */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white/60">SOURCE CODE</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={analyzeCode}
                  disabled={isAnalyzing || !sourceCode.trim()}
                  className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Brain className="h-3 w-3" />
                  )}
                  Analyze
                </button>

                <button
                  onClick={generateTests}
                  disabled={isGenerating || !analysis}
                  className="px-3 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Generate Tests
                </button>

                <button
                  onClick={runTests}
                  disabled={isRunning || generatedTests.length === 0}
                  className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isRunning ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                  Run Tests
                </button>
              </div>
            </div>

            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder="Paste your code here to generate tests..."
              className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono text-sm focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Generated Tests */}
          <div className="flex-1 overflow-y-auto p-6">
            {generatedTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/30">
                <Flask className="h-12 w-12 mb-4" />
                <p className="text-lg">No tests generated yet</p>
                <p className="text-sm mt-2">Paste your code and click "Generate Tests" to start</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Test Summary */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white">{generatedTests.length}</div>
                    <div className="text-xs text-white/60">Total Tests</div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {generatedTests.filter(t => t.status === 'passed').length}
                    </div>
                    <div className="text-xs text-white/60">Passed</div>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">
                      {generatedTests.filter(t => t.status === 'failed').length}
                    </div>
                    <div className="text-xs text-white/60">Failed</div>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.round(generatedTests.reduce((sum, t) => sum + t.coverage, 0) / generatedTests.length)}%
                    </div>
                    <div className="text-xs text-white/60">Coverage</div>
                  </div>
                </div>

                {/* Test Cases */}
                {generatedTests.map(test => (
                  <div
                    key={test.id}
                    className={`p-4 bg-white/5 rounded-lg border transition-all cursor-pointer hover:bg-white/10 ${
                      selectedTest?.id === test.id ? 'border-purple-500/50' : 'border-white/10'
                    }`}
                    onClick={() => setSelectedTest(test)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <div className="font-medium">{test.name}</div>
                          <div className="text-xs text-white/40 mt-1">{test.description}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="px-2 py-1 bg-white/10 rounded">
                          {test.type}
                        </span>
                        <span className="text-white/60">
                          {test.assertions} assertions
                        </span>
                        <span className="text-white/60">
                          {test.coverage}% coverage
                        </span>
                        {test.executionTime && (
                          <span className="text-white/60">
                            {test.executionTime.toFixed(0)}ms
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedTest?.id === test.id && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <pre className="bg-zinc-900 p-3 rounded-lg overflow-x-auto">
                          <code className="text-xs text-white/80">{test.code}</code>
                        </pre>

                        {test.error && (
                          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <div className="text-sm text-red-400">{test.error}</div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(test.code);
                            }}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs flex items-center gap-1 transition-all"
                          >
                            <Copy className="h-3 w-3" />
                            Copy Code
                          </button>
                          <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs transition-all">
                            Edit Test
                          </button>
                          <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs transition-all">
                            Debug
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}