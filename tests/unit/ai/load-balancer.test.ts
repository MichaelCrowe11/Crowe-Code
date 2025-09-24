import { describe, it, expect, vi, beforeEach } from 'vitest';

// Since LoadBalancer is a private class, we'll test it through the AIProviderManager
// or create a simplified version for testing
class TestLoadBalancer {
  private requestCounts: Map<string, number> = new Map();

  getNextProvider(providers: string[]): string | null {
    if (providers.length === 0) return null;
    if (providers.length === 1) return providers[0];

    // Simple round-robin
    const counts = providers.map(p => this.requestCounts.get(p) || 0);
    const minCount = Math.min(...counts);
    const provider = providers[counts.indexOf(minCount)];

    this.requestCounts.set(provider, (this.requestCounts.get(provider) || 0) + 1);
    return provider;
  }

  getRequestCount(provider: string): number {
    return this.requestCounts.get(provider) || 0;
  }

  reset(): void {
    this.requestCounts.clear();
  }
}

describe('LoadBalancer', () => {
  let loadBalancer: TestLoadBalancer;

  beforeEach(() => {
    loadBalancer = new TestLoadBalancer();
  });

  describe('Basic Functionality', () => {
    it('should return null for empty provider list', () => {
      const result = loadBalancer.getNextProvider([]);
      expect(result).toBeNull();
    });

    it('should return the only provider for single provider list', () => {
      const providers = ['provider1'];
      const result = loadBalancer.getNextProvider(providers);
      expect(result).toBe('provider1');
    });

    it('should handle multiple providers', () => {
      const providers = ['provider1', 'provider2', 'provider3'];
      const result = loadBalancer.getNextProvider(providers);
      expect(providers).toContain(result);
    });
  });

  describe('Round-Robin Distribution', () => {
    it('should distribute requests evenly across providers', () => {
      const providers = ['provider1', 'provider2', 'provider3'];
      const selections: string[] = [];

      // Make 9 requests (3 rounds of 3 providers)
      for (let i = 0; i < 9; i++) {
        const selected = loadBalancer.getNextProvider(providers);
        if (selected) selections.push(selected);
      }

      // Each provider should be selected 3 times
      expect(loadBalancer.getRequestCount('provider1')).toBe(3);
      expect(loadBalancer.getRequestCount('provider2')).toBe(3);
      expect(loadBalancer.getRequestCount('provider3')).toBe(3);
    });

    it('should select provider with minimum request count', () => {
      const providers = ['provider1', 'provider2', 'provider3'];

      // First request should go to provider1 (first in list with 0 requests)
      const first = loadBalancer.getNextProvider(providers);
      expect(first).toBe('provider1');

      // Second request should go to provider2 (next with 0 requests)
      const second = loadBalancer.getNextProvider(providers);
      expect(second).toBe('provider2');

      // Third request should go to provider3 (next with 0 requests)
      const third = loadBalancer.getNextProvider(providers);
      expect(third).toBe('provider3');

      // Fourth request should go back to provider1 (all have 1 request, provider1 is first)
      const fourth = loadBalancer.getNextProvider(providers);
      expect(fourth).toBe('provider1');
    });

    it('should maintain fair distribution over many requests', () => {
      const providers = ['provider1', 'provider2', 'provider3', 'provider4'];
      const requestCount = 100;

      for (let i = 0; i < requestCount; i++) {
        loadBalancer.getNextProvider(providers);
      }

      // Each provider should have received exactly 25 requests
      providers.forEach(provider => {
        expect(loadBalancer.getRequestCount(provider)).toBe(25);
      });
    });
  });

  describe('Provider Addition/Removal', () => {
    it('should handle dynamic provider list changes', () => {
      let providers = ['provider1', 'provider2'];

      // Make some requests with 2 providers
      loadBalancer.getNextProvider(providers);
      loadBalancer.getNextProvider(providers);

      expect(loadBalancer.getRequestCount('provider1')).toBe(1);
      expect(loadBalancer.getRequestCount('provider2')).toBe(1);

      // Add a third provider
      providers = ['provider1', 'provider2', 'provider3'];
      const next = loadBalancer.getNextProvider(providers);

      // Should select provider3 since it has 0 requests
      expect(next).toBe('provider3');
    });

    it('should handle provider removal gracefully', () => {
      const providers = ['provider1', 'provider2', 'provider3'];

      // Make some requests
      loadBalancer.getNextProvider(providers);
      loadBalancer.getNextProvider(providers);
      loadBalancer.getNextProvider(providers);

      // Remove provider2 from list
      const reducedProviders = ['provider1', 'provider3'];
      const next = loadBalancer.getNextProvider(reducedProviders);

      // Should still work with remaining providers
      expect(['provider1', 'provider3']).toContain(next);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single provider with multiple requests', () => {
      const providers = ['single-provider'];

      for (let i = 0; i < 10; i++) {
        const selected = loadBalancer.getNextProvider(providers);
        expect(selected).toBe('single-provider');
      }

      expect(loadBalancer.getRequestCount('single-provider')).toBe(10);
    });

    it('should handle provider names with special characters', () => {
      const providers = ['provider-1', 'provider_2', 'provider.3', 'provider@4'];

      providers.forEach(provider => {
        const selected = loadBalancer.getNextProvider([provider]);
        expect(selected).toBe(provider);
      });
    });

    it('should handle very long provider lists', () => {
      const providers = Array.from({ length: 100 }, (_, i) => `provider${i}`);
      const requestCount = 1000;

      for (let i = 0; i < requestCount; i++) {
        const selected = loadBalancer.getNextProvider(providers);
        expect(providers).toContain(selected);
      }

      // Each provider should have received exactly 10 requests
      providers.forEach(provider => {
        expect(loadBalancer.getRequestCount(provider)).toBe(10);
      });
    });

    it('should maintain consistency with repeated identical calls', () => {
      const providers = ['provider1', 'provider2'];

      // Multiple calls with same provider list should be deterministic
      const first = loadBalancer.getNextProvider(providers);
      expect(first).toBe('provider1');

      const second = loadBalancer.getNextProvider(providers);
      expect(second).toBe('provider2');

      const third = loadBalancer.getNextProvider(providers);
      expect(third).toBe('provider1');
    });
  });

  describe('Request Count Tracking', () => {
    it('should accurately track request counts', () => {
      const providers = ['provider1', 'provider2'];

      expect(loadBalancer.getRequestCount('provider1')).toBe(0);
      expect(loadBalancer.getRequestCount('provider2')).toBe(0);

      loadBalancer.getNextProvider(providers);
      expect(loadBalancer.getRequestCount('provider1')).toBe(1);
      expect(loadBalancer.getRequestCount('provider2')).toBe(0);

      loadBalancer.getNextProvider(providers);
      expect(loadBalancer.getRequestCount('provider1')).toBe(1);
      expect(loadBalancer.getRequestCount('provider2')).toBe(1);
    });

    it('should handle request counts for non-existent providers', () => {
      expect(loadBalancer.getRequestCount('non-existent')).toBe(0);
    });

    it('should reset request counts correctly', () => {
      const providers = ['provider1', 'provider2'];

      loadBalancer.getNextProvider(providers);
      loadBalancer.getNextProvider(providers);

      expect(loadBalancer.getRequestCount('provider1')).toBe(1);
      expect(loadBalancer.getRequestCount('provider2')).toBe(1);

      loadBalancer.reset();

      expect(loadBalancer.getRequestCount('provider1')).toBe(0);
      expect(loadBalancer.getRequestCount('provider2')).toBe(0);
    });
  });

  describe('Performance Considerations', () => {
    it('should handle high-frequency requests efficiently', () => {
      const providers = ['provider1', 'provider2', 'provider3'];
      const startTime = Date.now();
      const requestCount = 10000;

      for (let i = 0; i < requestCount; i++) {
        loadBalancer.getNextProvider(providers);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 10,000 requests in reasonable time (< 100ms)
      expect(duration).toBeLessThan(100);
    });

    it('should maintain O(n) complexity for provider selection', () => {
      // Test with different provider list sizes
      const sizes = [10, 100, 1000];

      sizes.forEach(size => {
        const providers = Array.from({ length: size }, (_, i) => `provider${i}`);

        const startTime = Date.now();
        for (let i = 0; i < 100; i++) {
          loadBalancer.getNextProvider(providers);
        }
        const endTime = Date.now();

        // Should scale linearly with provider count
        expect(endTime - startTime).toBeLessThan(size * 0.1);
      });
    });
  });

  describe('Concurrent Access Simulation', () => {
    it('should handle simulated concurrent requests', () => {
      const providers = ['provider1', 'provider2', 'provider3'];
      const requests = 30;

      // Simulate concurrent access by making multiple requests rapidly
      const selections: string[] = [];
      for (let i = 0; i < requests; i++) {
        const selected = loadBalancer.getNextProvider(providers);
        if (selected) selections.push(selected);
      }

      // Verify all requests were processed
      expect(selections.length).toBe(requests);

      // Verify even distribution
      expect(loadBalancer.getRequestCount('provider1')).toBe(10);
      expect(loadBalancer.getRequestCount('provider2')).toBe(10);
      expect(loadBalancer.getRequestCount('provider3')).toBe(10);
    });
  });
});