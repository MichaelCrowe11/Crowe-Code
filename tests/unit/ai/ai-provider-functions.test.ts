import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAICapabilities,
  generateCode,
  generateCompletion,
  anthropic,
  aiProviderManager
} from '@/lib/ai-provider';

// Mock the AI provider manager
vi.mock('@/lib/ai-provider', async () => {
  const actual = await vi.importActual('@/lib/ai-provider');
  return {
    ...actual,
    aiProviderManager: {
      executeWithFallback: vi.fn(),
      getActiveProvider: vi.fn(),
      hasProvider: vi.fn(),
    },
  };
});

vi.mock('@/lib/logger', () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('AI Provider Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAICapabilities', () => {
    it('should return consistent capability structure', () => {
      const capabilities = getAICapabilities();

      expect(capabilities).toEqual({
        name: 'CroweCode™ Intelligence System',
        version: '4.0',
        features: [
          '256K context window',
          'Advanced reasoning',
          'Multi-step execution',
          'Code optimization',
          'Security analysis',
          'Pattern recognition'
        ],
        powered_by: 'Proprietary Neural Network'
      });
    });

    it('should not expose internal provider details', () => {
      const capabilities = getAICapabilities();

      expect(capabilities).not.toHaveProperty('providers');
      expect(capabilities).not.toHaveProperty('apiKeys');
      expect(capabilities).not.toHaveProperty('endpoints');
      expect(capabilities.powered_by).toBe('Proprietary Neural Network');
    });

    it('should include expected features', () => {
      const capabilities = getAICapabilities();
      const expectedFeatures = [
        '256K context window',
        'Advanced reasoning',
        'Multi-step execution',
        'Code optimization',
        'Security analysis',
        'Pattern recognition'
      ];

      expectedFeatures.forEach(feature => {
        expect(capabilities.features).toContain(feature);
      });
    });
  });

  describe('generateCode', () => {
    it('should call executeWithFallback with correct parameters', async () => {
      const mockResult = { code: 'generated code', provider: 'test' };
      (aiProviderManager.executeWithFallback as any).mockResolvedValue(mockResult);

      const prompt = 'Create a React component';
      const options = { language: 'typescript' };

      const result = await generateCode(prompt, options);

      expect(aiProviderManager.executeWithFallback).toHaveBeenCalledWith(
        { prompt, ...options },
        'code_generation'
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle prompt-only requests', async () => {
      const mockResult = { code: 'simple code' };
      (aiProviderManager.executeWithFallback as any).mockResolvedValue(mockResult);

      const prompt = 'Write a hello world function';
      const result = await generateCode(prompt);

      expect(aiProviderManager.executeWithFallback).toHaveBeenCalledWith(
        { prompt },
        'code_generation'
      );
      expect(result).toEqual(mockResult);
    });

    it('should propagate errors from provider manager', async () => {
      const error = new Error('Provider failed');
      (aiProviderManager.executeWithFallback as any).mockRejectedValue(error);

      const prompt = 'Generate code';

      await expect(generateCode(prompt)).rejects.toThrow('Provider failed');
    });

    it('should handle complex options', async () => {
      const mockResult = { code: 'complex code' };
      (aiProviderManager.executeWithFallback as any).mockResolvedValue(mockResult);

      const prompt = 'Create a complex component';
      const options = {
        language: 'typescript',
        framework: 'react',
        style: 'functional',
        tests: true,
        documentation: true,
      };

      const result = await generateCode(prompt, options);

      expect(aiProviderManager.executeWithFallback).toHaveBeenCalledWith(
        { prompt, ...options },
        'code_generation'
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('generateCompletion', () => {
    it('should call executeWithFallback with code_completion task type', async () => {
      const mockResult = { completion: 'code completion' };
      (aiProviderManager.executeWithFallback as any).mockResolvedValue(mockResult);

      const prompt = 'Complete this function';
      const options = { maxTokens: 100 };

      const result = await generateCompletion(prompt, options);

      expect(aiProviderManager.executeWithFallback).toHaveBeenCalledWith(
        { prompt, ...options },
        'code_completion'
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle completion without options', async () => {
      const mockResult = { completion: 'simple completion' };
      (aiProviderManager.executeWithFallback as any).mockResolvedValue(mockResult);

      const prompt = 'Complete: function add(a, b) {';
      const result = await generateCompletion(prompt);

      expect(aiProviderManager.executeWithFallback).toHaveBeenCalledWith(
        { prompt },
        'code_completion'
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle streaming options', async () => {
      const mockResult = { completion: 'streamed completion' };
      (aiProviderManager.executeWithFallback as any).mockResolvedValue(mockResult);

      const prompt = 'Complete this code';
      const options = { stream: true, temperature: 0.7 };

      const result = await generateCompletion(prompt, options);

      expect(aiProviderManager.executeWithFallback).toHaveBeenCalledWith(
        { prompt, ...options },
        'code_completion'
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('anthropic compatibility object', () => {
    it('should have correct structure', () => {
      expect(anthropic).toHaveProperty('apiKey');
      expect(anthropic).toHaveProperty('generateContent');
      expect(typeof anthropic.generateContent).toBe('function');
    });

    it('should use environment API key', () => {
      expect(anthropic.apiKey).toBe('test-anthropic-key');
    });

    it('should call executeWithFallback for generateContent', async () => {
      const mockResult = { content: 'generated content' };
      (aiProviderManager.executeWithFallback as any).mockResolvedValue(mockResult);

      const prompt = 'Generate some content';
      const result = await anthropic.generateContent(prompt);

      expect(aiProviderManager.executeWithFallback).toHaveBeenCalledWith(
        { prompt },
        'code_generation'
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle missing API key', () => {
      delete process.env.ANTHROPIC_API_KEY;

      // Re-import to get updated environment
      const { anthropic: newAnthropic } = vi.importActual('@/lib/ai-provider') as any;
      expect(newAnthropic?.apiKey).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle provider manager errors gracefully', async () => {
      const providerError = new Error('All providers failed');
      (aiProviderManager.executeWithFallback as any).mockRejectedValue(providerError);

      await expect(generateCode('test prompt')).rejects.toThrow('All providers failed');
      await expect(generateCompletion('test prompt')).rejects.toThrow('All providers failed');
      await expect(anthropic.generateContent('test prompt')).rejects.toThrow('All providers failed');
    });

    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      (aiProviderManager.executeWithFallback as any).mockRejectedValue(timeoutError);

      await expect(generateCode('test prompt')).rejects.toThrow('Request timeout');
    });

    it('should handle rate limiting errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';
      (aiProviderManager.executeWithFallback as any).mockRejectedValue(rateLimitError);

      await expect(generateCode('test prompt')).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Invalid API key');
      authError.name = 'AuthenticationError';
      (aiProviderManager.executeWithFallback as any).mockRejectedValue(authError);

      await expect(generateCode('test prompt')).rejects.toThrow('Invalid API key');
    });
  });

  describe('Input Validation', () => {
    it('should handle empty prompts', async () => {
      const mockResult = { code: 'default response' };
      (aiProviderManager.executeWithFallback as any).mockResolvedValue(mockResult);

      await generateCode('');
      await generateCompletion('');
      await anthropic.generateContent('');

      expect(aiProviderManager.executeWithFallback).toHaveBeenCalledTimes(3);
    });

    it('should handle null/undefined prompts', async () => {
      const mockResult = { code: 'default response' };
      (aiProviderManager.executeWithFallback as any).mockResolvedValue(mockResult);

      await generateCode(null as any);
      await generateCompletion(undefined as any);

      expect(aiProviderManager.executeWithFallback).toHaveBeenCalledTimes(2);
    });

    it('should handle very long prompts', async () => {
      const mockResult = { code: 'response to long prompt' };
      (aiProviderManager.executeWithFallback as any).mockResolvedValue(mockResult);

      const longPrompt = 'a'.repeat(100000); // 100KB prompt
      const result = await generateCode(longPrompt);

      expect(aiProviderManager.executeWithFallback).toHaveBeenCalledWith(
        { prompt: longPrompt },
        'code_generation'
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle special characters in prompts', async () => {
      const mockResult = { code: 'response with special chars' };
      (aiProviderManager.executeWithFallback as any).mockResolvedValue(mockResult);

      const specialPrompt = 'Create function with émojis 🚀 and "quotes" and \\backslashes\\';
      const result = await generateCode(specialPrompt);

      expect(aiProviderManager.executeWithFallback).toHaveBeenCalledWith(
        { prompt: specialPrompt },
        'code_generation'
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('Response Handling', () => {
    it('should return provider responses as-is', async () => {
      const complexResponse = {
        code: 'function example() {}',
        explanation: 'This is an example function',
        metadata: {
          language: 'javascript',
          complexity: 'low',
          provider: 'primary',
        },
        timestamp: new Date(),
      };

      (aiProviderManager.executeWithFallback as any).mockResolvedValue(complexResponse);

      const result = await generateCode('Create a function');
      expect(result).toEqual(complexResponse);
    });

    it('should handle null responses', async () => {
      (aiProviderManager.executeWithFallback as any).mockResolvedValue(null);

      const result = await generateCode('test prompt');
      expect(result).toBeNull();
    });

    it('should handle empty object responses', async () => {
      (aiProviderManager.executeWithFallback as any).mockResolvedValue({});

      const result = await generateCode('test prompt');
      expect(result).toEqual({});
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple simultaneous requests', async () => {
      const mockResult1 = { code: 'result 1' };
      const mockResult2 = { code: 'result 2' };
      const mockResult3 = { code: 'result 3' };

      (aiProviderManager.executeWithFallback as any)
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2)
        .mockResolvedValueOnce(mockResult3);

      const promises = [
        generateCode('prompt 1'),
        generateCode('prompt 2'),
        generateCode('prompt 3'),
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual([mockResult1, mockResult2, mockResult3]);
      expect(aiProviderManager.executeWithFallback).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed success and failure', async () => {
      (aiProviderManager.executeWithFallback as any)
        .mockResolvedValueOnce({ code: 'success' })
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({ code: 'success again' });

      const promises = [
        generateCode('prompt 1'),
        generateCode('prompt 2').catch(err => ({ error: err.message })),
        generateCode('prompt 3'),
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual([
        { code: 'success' },
        { error: 'Failed' },
        { code: 'success again' }
      ]);
    });
  });
});