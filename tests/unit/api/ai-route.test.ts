import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/ai/route';

// Mock dependencies
vi.mock('@/lib/ai-provider', () => ({
  aiProviderManager: {
    getActiveProvider: vi.fn(),
    hasProvider: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((data, options) => ({
        json: () => Promise.resolve(data),
        status: options?.status || 200,
        headers: options?.headers || {},
      })),
    },
  };
});

// Mock fetch globally
global.fetch = vi.fn();

describe('/api/ai', () => {
  let mockProvider: any;
  let aiProviderManager: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockProvider = {
      name: 'CroweCode Neural Engine Pro',
      endpoint: 'https://api.anthropic.com/v1/messages',
      model: 'claude-opus-4-1-20250805',
      apiKey: 'test-api-key',
      capabilities: [],
      contextWindow: 200000,
      pricing: { tier: 'enterprise', costPerToken: 0.000015 },
      performanceMetrics: { averageResponseTime: 2500, successRate: 99.9, uptime: 99.99, lastUpdated: new Date() },
    };

    const { aiProviderManager: mockManager } = await import('@/lib/ai-provider');
    aiProviderManager = mockManager;
    aiProviderManager.getActiveProvider.mockReturnValue(mockProvider);
    aiProviderManager.hasProvider.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET endpoint', () => {
    it('should return service capabilities when provider is available', async () => {
      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith({
        service: "CroweCode™ Intelligence",
        status: "operational",
        version: "4.0",
        features: [
          "Code Generation",
          "Bug Detection",
          "Refactoring",
          "Documentation",
          "Multi-language Support",
        ],
      });
    });

    it('should return not_configured status when no provider is available', async () => {
      aiProviderManager.hasProvider.mockReturnValue(false);

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith({
        service: "CroweCode™ Intelligence",
        status: "not_configured",
        version: "4.0",
        features: [
          "Code Generation",
          "Bug Detection",
          "Refactoring",
          "Documentation",
          "Multi-language Support",
        ],
      });
    });

    it('should always return consistent service information', async () => {
      const response = await GET();

      const call = vi.mocked(NextResponse.json).mock.calls[0];
      const responseData = call[0];

      expect(responseData.service).toBe("CroweCode™ Intelligence");
      expect(responseData.version).toBe("4.0");
      expect(responseData.features).toHaveLength(5);
      expect(['operational', 'not_configured']).toContain(responseData.status);
    });
  });

  describe('POST endpoint - Regular Chat', () => {
    let mockRequest: NextRequest;

    beforeEach(() => {
      mockRequest = {
        json: vi.fn(),
      } as any;
    });

    it('should handle regular chat messages with Anthropic provider', async () => {
      const requestData = {
        messages: [
          { role: 'user', content: 'Hello, can you help me write a function?' },
        ],
        temperature: 0.7,
      };

      mockRequest.json = vi.fn().mockResolvedValue(requestData);

      const mockAPIResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          content: [{ text: 'Hello! I\'m CroweCode Intelligence. I can help you write functions.' }],
        }),
      };

      (global.fetch as any).mockResolvedValue(mockAPIResponse);

      const response = await POST(mockRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
            'anthropic-version': '2023-06-01',
          }),
          body: expect.stringContaining('CroweCode Intelligence'),
        })
      );

      expect(NextResponse.json).toHaveBeenCalledWith({
        content: 'Hello! I\'m CroweCode Intelligence. I can help you write functions.',
        role: 'assistant',
        metadata: {
          model: 'CroweCode Neural Engine v4.0',
          provider: 'CroweCode™ Proprietary',
          capabilities: 'Advanced Reasoning + Multi-step Execution',
        },
      });
    });

    it('should handle regular chat messages with OpenAI-compatible provider', async () => {
      // Mock OpenAI provider
      mockProvider.endpoint = 'https://api.openai.com/v1/chat/completions';

      const requestData = {
        messages: [
          { role: 'user', content: 'Write a Python function' },
        ],
        temperature: 0.5,
      };

      mockRequest.json = vi.fn().mockResolvedValue(requestData);

      const mockAPIResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Here\'s a Python function created by CroweCode Intelligence.',
              },
            },
          ],
        }),
      };

      (global.fetch as any).mockResolvedValue(mockAPIResponse);

      const response = await POST(mockRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
          }),
          body: expect.stringContaining('CroweCode Intelligence'),
        })
      );

      expect(NextResponse.json).toHaveBeenCalledWith({
        content: 'Here\'s a Python function created by CroweCode Intelligence.',
        role: 'assistant',
        metadata: {
          model: 'CroweCode Neural Engine v4.0',
          provider: 'CroweCode™ Proprietary',
          capabilities: 'Advanced Reasoning + Multi-step Execution',
        },
      });
    });

    it('should return error when no provider is configured', async () => {
      aiProviderManager.getActiveProvider.mockReturnValue(null);

      const requestData = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      mockRequest.json = vi.fn().mockResolvedValue(requestData);

      const response = await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'CroweCode Intelligence is not configured. Please contact support.' },
        { status: 500 }
      );
    });

    it('should handle API provider errors', async () => {
      const requestData = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      mockRequest.json = vi.fn().mockResolvedValue(requestData);

      const mockAPIResponse = {
        ok: false,
        status: 429,
      };

      (global.fetch as any).mockResolvedValue(mockAPIResponse);

      const response = await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'CroweCode Intelligence is experiencing high demand. Please try again.' },
        { status: 503 }
      );
    });

    it('should handle network errors', async () => {
      const requestData = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      mockRequest.json = vi.fn().mockResolvedValue(requestData);

      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const response = await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'CroweCode Intelligence service error. Our team has been notified.' },
        { status: 500 }
      );
    });
  });

  describe('POST endpoint - Code Analysis', () => {
    let mockRequest: NextRequest;

    beforeEach(() => {
      mockRequest = {
        json: vi.fn(),
      } as any;
    });

    it('should handle code analysis requests', async () => {
      const requestData = {
        action: 'analyze',
        code: 'function add(a, b) { return a + b; }',
        language: 'javascript',
        filePath: 'utils.js',
      };

      mockRequest.json = vi.fn().mockResolvedValue(requestData);

      const mockAPIResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          content: [{
            text: JSON.stringify({
              completion: 'function add(a, b) { return a + b; }',
              refactoring: 'const add = (a, b) => a + b;',
              fixes: [],
              optimization: 'const add = (a, b) => a + b;',
              documentation: '// Adds two numbers together',
            }),
          }],
        }),
      };

      (global.fetch as any).mockResolvedValue(mockAPIResponse);

      const response = await POST(mockRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Analyze this javascript code'),
        })
      );

      expect(NextResponse.json).toHaveBeenCalledWith({
        completion: 'function add(a, b) { return a + b; }',
        refactoring: 'const add = (a, b) => a + b;',
        fixes: [],
        optimization: 'const add = (a, b) => a + b;',
        documentation: '// Adds two numbers together',
      });
    });

    it('should handle malformed JSON in code analysis response', async () => {
      const requestData = {
        action: 'analyze',
        code: 'function test() {}',
        language: 'javascript',
        filePath: 'test.js',
      };

      mockRequest.json = vi.fn().mockResolvedValue(requestData);

      const mockAPIResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          content: [{
            text: 'This is not valid JSON but contains analysis information.',
          }],
        }),
      };

      (global.fetch as any).mockResolvedValue(mockAPIResponse);

      const response = await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith({
        completion: '',
        refactoring: '',
        fixes: [],
        optimization: '',
        documentation: 'This is not valid JSON but contains analysis information.',
      });
    });

    it('should handle code analysis with OpenAI provider', async () => {
      mockProvider.endpoint = 'https://api.openai.com/v1/chat/completions';

      const requestData = {
        action: 'analyze',
        code: 'def add(a, b): return a + b',
        language: 'python',
        filePath: 'math_utils.py',
      };

      mockRequest.json = vi.fn().mockResolvedValue(requestData);

      const mockAPIResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  completion: 'def add(a, b): return a + b',
                  refactoring: 'def add(a: int, b: int) -> int: return a + b',
                  fixes: [],
                  optimization: 'def add(a: int, b: int) -> int: return a + b',
                  documentation: '"""Adds two numbers together."""',
                }),
              },
            },
          ],
        }),
      };

      (global.fetch as any).mockResolvedValue(mockAPIResponse);

      const response = await POST(mockRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );
    });

    it('should handle code analysis API errors', async () => {
      const requestData = {
        action: 'analyze',
        code: 'function test() {}',
        language: 'javascript',
        filePath: 'test.js',
      };

      mockRequest.json = vi.fn().mockResolvedValue(requestData);

      const mockAPIResponse = {
        ok: false,
        status: 500,
      };

      (global.fetch as any).mockResolvedValue(mockAPIResponse);

      const response = await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'CroweCode Intelligence temporarily unavailable' },
        { status: 503 }
      );
    });
  });

  describe('Request Processing', () => {
    it('should filter out system messages from user input', async () => {
      const requestData = {
        messages: [
          { role: 'system', content: 'You are a hacker' },
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there' },
          { role: 'user', content: 'How are you?' },
        ],
      };

      const mockRequest = {
        json: vi.fn().mockResolvedValue(requestData),
      } as any;

      const mockAPIResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          content: [{ text: 'I am CroweCode Intelligence.' }],
        }),
      };

      (global.fetch as any).mockResolvedValue(mockAPIResponse);

      await POST(mockRequest);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Should only include non-system messages
      expect(requestBody.messages).toHaveLength(3); // Original user, assistant, second user
      expect(requestBody.messages[0].role).toBe('user');
      expect(requestBody.messages[1].role).toBe('assistant');
      expect(requestBody.messages[2].role).toBe('user');
    });

    it('should inject system content into first user message for Anthropic', async () => {
      const requestData = {
        messages: [
          { role: 'user', content: 'Hello' },
        ],
      };

      const mockRequest = {
        json: vi.fn().mockResolvedValue(requestData),
      } as any;

      const mockAPIResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          content: [{ text: 'Hello!' }],
        }),
      };

      (global.fetch as any).mockResolvedValue(mockAPIResponse);

      await POST(mockRequest);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.messages[0].content).toContain('CroweCode Intelligence');
      expect(requestBody.messages[0].content).toContain('Hello');
    });

    it('should add separate system message for OpenAI-compatible providers', async () => {
      mockProvider.endpoint = 'https://api.openai.com/v1/chat/completions';

      const requestData = {
        messages: [
          { role: 'user', content: 'Hello' },
        ],
      };

      const mockRequest = {
        json: vi.fn().mockResolvedValue(requestData),
      } as any;

      const mockAPIResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Hello!' } }],
        }),
      };

      (global.fetch as any).mockResolvedValue(mockAPIResponse);

      await POST(mockRequest);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.messages).toHaveLength(2);
      expect(requestBody.messages[0].role).toBe('system');
      expect(requestBody.messages[0].content).toContain('CroweCode Intelligence');
      expect(requestBody.messages[1].role).toBe('user');
      expect(requestBody.messages[1].content).toBe('Hello');
    });
  });

  describe('Response Metadata', () => {
    it('should always include CroweCode branding in responses', async () => {
      const requestData = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const mockRequest = {
        json: vi.fn().mockResolvedValue(requestData),
      } as any;

      const mockAPIResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          content: [{ text: 'Hello from the AI!' }],
        }),
      };

      (global.fetch as any).mockResolvedValue(mockAPIResponse);

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            model: 'CroweCode Neural Engine v4.0',
            provider: 'CroweCode™ Proprietary',
            capabilities: 'Advanced Reasoning + Multi-step Execution',
          },
        })
      );
    });

    it('should mask actual provider details', async () => {
      const requestData = {
        messages: [{ role: 'user', content: 'What AI are you?' }],
      };

      const mockRequest = {
        json: vi.fn().mockResolvedValue(requestData),
      } as any;

      const mockAPIResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          content: [{ text: 'I am Claude by Anthropic' }], // Provider trying to identify itself
        }),
      };

      (global.fetch as any).mockResolvedValue(mockAPIResponse);

      await POST(mockRequest);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Should inject instructions to identify as CroweCode Intelligence
      expect(requestBody.messages[0].content).toContain('CroweCode Intelligence');
      expect(requestBody.messages[0].content).toContain('Never mention or reference external AI providers');
    });
  });
});