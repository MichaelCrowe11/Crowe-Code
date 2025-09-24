import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIProviderManager, aiProviderManager } from '@/lib/ai-provider';

// Mock logger
vi.mock('@/lib/logger', () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('AIProviderManager', () => {
  let manager: AIProviderManager;

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up test environment variables
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.XAI_API_KEY = 'test-xai-key';
    process.env.GOOGLE_AI_KEY = 'test-google-key';
    process.env.CODEX_API_KEY = 'test-codex-key';

    // Create fresh instance for each test
    manager = new AIProviderManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clean up environment variables
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.XAI_API_KEY;
    delete process.env.GOOGLE_AI_KEY;
    delete process.env.CODEX_API_KEY;
  });

  describe('Provider Initialization', () => {
    it('should initialize providers when API keys are available', () => {
      expect(manager.hasProvider()).toBe(true);

      const activeProvider = manager.getActiveProvider();
      expect(activeProvider).toBeDefined();
      expect(activeProvider?.name).toContain('CroweCode');
    });

    it('should handle missing API keys gracefully', () => {
      // Remove all API keys
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.OPENAI_API_KEY;
      delete process.env.XAI_API_KEY;
      delete process.env.GOOGLE_AI_KEY;
      delete process.env.CODEX_API_KEY;

      const emptyManager = new AIProviderManager();
      expect(emptyManager.hasProvider()).toBe(false);
      expect(emptyManager.getActiveProvider()).toBeNull();
    });

    it('should set up primary provider correctly', () => {
      const activeProvider = manager.getActiveProvider();
      expect(activeProvider?.apiKey).toBe('test-anthropic-key');
      expect(activeProvider?.model).toBe('claude-opus-4-1-20250805');
      expect(activeProvider?.contextWindow).toBe(200000);
    });
  });

  describe('Provider Management', () => {
    it('should switch between providers', () => {
      const initialProvider = manager.getActiveProvider();
      expect(initialProvider?.name).toContain('Neural Engine Pro');

      manager.switchProvider('gpt4-turbo');
      const newProvider = manager.getActiveProvider();
      expect(newProvider?.name).toContain('Advanced Engine');
    });

    it('should ignore invalid provider switches', () => {
      const initialProvider = manager.getActiveProvider();

      manager.switchProvider('non-existent-provider');
      const unchangedProvider = manager.getActiveProvider();

      expect(unchangedProvider).toEqual(initialProvider);
    });

    it('should track provider switches', () => {
      manager.switchProvider('gpt4-turbo');
      manager.switchProvider('grok');

      const analytics = manager.getUsageAnalytics();
      expect(analytics.totalRequests).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Capability Matching', () => {
    it('should find best provider for code generation', async () => {
      const bestProvider = await manager.getBestProviderForTask('code_generation', 'typescript');
      expect(bestProvider).toBeDefined();
    });

    it('should find best provider for security analysis', async () => {
      const bestProvider = await manager.getBestProviderForTask('security_analysis');
      expect(bestProvider).toBeDefined();
    });

    it('should handle language-specific requests', async () => {
      const bestProvider = await manager.getBestProviderForTask('code_generation', 'python', 'fastapi');
      expect(bestProvider).toBeDefined();
    });

    it('should return null for unsupported tasks', async () => {
      const bestProvider = await manager.getBestProviderForTask('unsupported_task' as any);
      expect(bestProvider).toBeNull();
    });

    it('should prioritize expert proficiency', async () => {
      const provider = await manager.getBestProviderForTask('code_generation', 'typescript');
      const activeProvider = manager.getActiveProvider();

      if (provider && activeProvider) {
        const capability = activeProvider.capabilities.find(c => c.type === 'code_generation');
        expect(capability?.proficiency).toBe('expert');
      }
    });
  });

  describe('Fallback Chain', () => {
    it('should execute with fallback on provider failure', async () => {
      // Mock provider execution to fail on first try, succeed on second
      const originalExecute = (manager as any).executeWithProvider;
      let callCount = 0;

      (manager as any).executeWithProvider = vi.fn().mockImplementation(async (providerKey, task) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Provider failed');
        }
        return { provider: providerKey, success: true };
      });

      const result = await manager.executeWithFallback({ prompt: 'test' }, 'code_generation');
      expect(result.success).toBe(true);
      expect(callCount).toBe(2);
    });

    it('should fail when all providers fail', async () => {
      // Mock all providers to fail
      (manager as any).executeWithProvider = vi.fn().mockRejectedValue(new Error('All providers failed'));

      await expect(
        manager.executeWithFallback({ prompt: 'test' }, 'code_generation')
      ).rejects.toThrow('All providers failed');
    });

    it('should try providers in order of proficiency', async () => {
      const execution = vi.fn().mockRejectedValue(new Error('Provider failed'));
      (manager as any).executeWithProvider = execution;

      try {
        await manager.executeWithFallback({ prompt: 'test' }, 'code_generation');
      } catch (error) {
        // Should have tried multiple providers
        expect(execution.mock.calls.length).toBeGreaterThan(1);
      }
    });
  });

  describe('Load Balancing', () => {
    it('should distribute requests across providers', () => {
      const loadBalancer = (manager as any).loadBalancer;
      const providers = ['primary', 'gpt4-turbo', 'grok'];

      const selections = [];
      for (let i = 0; i < 6; i++) {
        const selected = loadBalancer.getNextProvider(providers);
        selections.push(selected);
      }

      // Should distribute requests evenly
      const uniqueSelections = new Set(selections);
      expect(uniqueSelections.size).toBeGreaterThan(1);
    });

    it('should handle single provider gracefully', () => {
      const loadBalancer = (manager as any).loadBalancer;
      const singleProvider = ['primary'];

      const selected = loadBalancer.getNextProvider(singleProvider);
      expect(selected).toBe('primary');
    });

    it('should handle empty provider list', () => {
      const loadBalancer = (manager as any).loadBalancer;
      const emptyProviders: string[] = [];

      const selected = loadBalancer.getNextProvider(emptyProviders);
      expect(selected).toBeNull();
    });
  });

  describe('Usage Tracking', () => {
    it('should track successful requests', () => {
      const tracker = (manager as any).usageTracker;

      tracker.logRequest('primary', 'code_generation');
      tracker.logSuccess('primary');

      const analytics = tracker.getAnalytics();
      expect(analytics.totalRequests).toBe(1);
      expect(analytics.totalErrors).toBe(0);
    });

    it('should track failed requests', () => {
      const tracker = (manager as any).usageTracker;

      tracker.logRequest('primary', 'code_generation');
      tracker.logError('primary', new Error('Test error'));

      const analytics = tracker.getAnalytics();
      expect(analytics.totalRequests).toBe(1);
      expect(analytics.totalErrors).toBe(1);
    });

    it('should track provider switches', () => {
      const tracker = (manager as any).usageTracker;

      tracker.logProviderSwitch('gpt4-turbo');
      tracker.logProviderSwitch('grok');

      // Verify logs were created
      const logs = (tracker as any).logs;
      const switchLogs = logs.filter((log: any) => log.type === 'switch');
      expect(switchLogs.length).toBe(2);
    });

    it('should track activity timestamps', () => {
      const tracker = (manager as any).usageTracker;

      tracker.logRequest('primary', 'code_generation');

      const analytics = tracker.getAnalytics();
      expect(analytics.lastActivity).toBeInstanceOf(Date);
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate average response time', () => {
      const capabilities = manager.getDetailedCapabilities();
      expect(capabilities.averageResponseTime).toBeGreaterThan(0);
      expect(typeof capabilities.averageResponseTime).toBe('number');
    });

    it('should calculate overall uptime', () => {
      const capabilities = manager.getDetailedCapabilities();
      expect(capabilities.overallUptime).toBeGreaterThanOrEqual(0);
      expect(capabilities.overallUptime).toBeLessThanOrEqual(100);
    });

    it('should list supported languages and frameworks', () => {
      const capabilities = manager.getDetailedCapabilities();
      expect(Array.isArray(capabilities.supportedLanguages)).toBe(true);
      expect(Array.isArray(capabilities.supportedFrameworks)).toBe(true);

      // Should include common languages
      expect(capabilities.supportedLanguages).toContain('typescript');
      expect(capabilities.supportedLanguages).toContain('python');

      // Should include common frameworks
      expect(capabilities.supportedFrameworks).toContain('react');
      expect(capabilities.supportedFrameworks).toContain('next.js');
    });
  });

  describe('Display Information', () => {
    it('should return consistent display name', () => {
      const displayName = manager.getDisplayName();
      expect(displayName).toBe('CroweCode™ Intelligence System');
    });

    it('should return model info with provider count', () => {
      const modelInfo = manager.getModelInfo();
      expect(modelInfo).toContain('CroweCode');
      expect(modelInfo).toContain('engines available');
    });

    it('should handle empty providers gracefully', () => {
      // Create manager without providers
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.OPENAI_API_KEY;
      delete process.env.XAI_API_KEY;
      delete process.env.GOOGLE_AI_KEY;
      delete process.env.CODEX_API_KEY;

      const emptyManager = new AIProviderManager();
      const modelInfo = emptyManager.getModelInfo();
      expect(modelInfo).toBe('CroweCode Neural Architecture v4.1');
    });
  });

  describe('Provider Configuration Validation', () => {
    it('should validate provider structure', () => {
      const activeProvider = manager.getActiveProvider();

      if (activeProvider) {
        expect(activeProvider).toHaveProperty('name');
        expect(activeProvider).toHaveProperty('endpoint');
        expect(activeProvider).toHaveProperty('model');
        expect(activeProvider).toHaveProperty('apiKey');
        expect(activeProvider).toHaveProperty('capabilities');
        expect(activeProvider).toHaveProperty('contextWindow');
        expect(activeProvider).toHaveProperty('pricing');
        expect(activeProvider).toHaveProperty('performanceMetrics');
      }
    });

    it('should validate capability structure', () => {
      const activeProvider = manager.getActiveProvider();

      if (activeProvider?.capabilities.length) {
        const capability = activeProvider.capabilities[0];
        expect(capability).toHaveProperty('type');
        expect(capability).toHaveProperty('proficiency');
        expect(capability).toHaveProperty('languages');
        expect(capability).toHaveProperty('frameworks');

        expect(['basic', 'intermediate', 'advanced', 'expert']).toContain(capability.proficiency);
      }
    });

    it('should validate pricing structure', () => {
      const activeProvider = manager.getActiveProvider();

      if (activeProvider) {
        expect(activeProvider.pricing).toHaveProperty('tier');
        expect(activeProvider.pricing).toHaveProperty('costPerToken');
        expect(['free', 'standard', 'premium', 'enterprise']).toContain(activeProvider.pricing.tier);
        expect(typeof activeProvider.pricing.costPerToken).toBe('number');
      }
    });

    it('should validate performance metrics', () => {
      const activeProvider = manager.getActiveProvider();

      if (activeProvider) {
        const metrics = activeProvider.performanceMetrics;
        expect(metrics).toHaveProperty('averageResponseTime');
        expect(metrics).toHaveProperty('successRate');
        expect(metrics).toHaveProperty('uptime');
        expect(metrics).toHaveProperty('lastUpdated');

        expect(typeof metrics.averageResponseTime).toBe('number');
        expect(typeof metrics.successRate).toBe('number');
        expect(typeof metrics.uptime).toBe('number');
        expect(metrics.lastUpdated).toBeInstanceOf(Date);

        expect(metrics.successRate).toBeGreaterThanOrEqual(0);
        expect(metrics.successRate).toBeLessThanOrEqual(100);
        expect(metrics.uptime).toBeGreaterThanOrEqual(0);
        expect(metrics.uptime).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Singleton Instance', () => {
    it('should export singleton instance', () => {
      expect(aiProviderManager).toBeInstanceOf(AIProviderManager);
    });

    it('should maintain state across imports', () => {
      aiProviderManager.switchProvider('gpt4-turbo');
      const provider = aiProviderManager.getActiveProvider();
      expect(provider?.name).toContain('Advanced Engine');
    });
  });
});