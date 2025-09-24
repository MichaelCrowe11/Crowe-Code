import { describe, it, expect, vi, beforeEach } from 'vitest';

// Since UsageTracker is a private class, we'll create a test version
class TestUsageTracker {
  private logs: any[] = [];

  logRequest(provider: string, taskType: string) {
    this.logs.push({ type: 'request', provider, taskType, timestamp: new Date() });
  }

  logSuccess(provider: string) {
    this.logs.push({ type: 'success', provider, timestamp: new Date() });
  }

  logError(provider: string, error: any) {
    this.logs.push({ type: 'error', provider, error: error.message, timestamp: new Date() });
  }

  logProviderSwitch(provider: string) {
    this.logs.push({ type: 'switch', provider, timestamp: new Date() });
  }

  getAnalytics() {
    return {
      totalRequests: this.logs.filter(l => l.type === 'request').length,
      totalErrors: this.logs.filter(l => l.type === 'error').length,
      totalSuccesses: this.logs.filter(l => l.type === 'success').length,
      totalSwitches: this.logs.filter(l => l.type === 'switch').length,
      lastActivity: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : null,
      providers: [...new Set(this.logs.map(l => l.provider))],
      logs: this.logs,
    };
  }

  clearLogs() {
    this.logs = [];
  }

  getLogsByType(type: string) {
    return this.logs.filter(l => l.type === type);
  }

  getLogsByProvider(provider: string) {
    return this.logs.filter(l => l.provider === provider);
  }
}

describe('UsageTracker', () => {
  let tracker: TestUsageTracker;

  beforeEach(() => {
    tracker = new TestUsageTracker();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Request Logging', () => {
    it('should log requests correctly', () => {
      tracker.logRequest('provider1', 'code_generation');

      const analytics = tracker.getAnalytics();
      expect(analytics.totalRequests).toBe(1);

      const requestLogs = tracker.getLogsByType('request');
      expect(requestLogs).toHaveLength(1);
      expect(requestLogs[0]).toMatchObject({
        type: 'request',
        provider: 'provider1',
        taskType: 'code_generation',
      });
    });

    it('should track multiple requests', () => {
      tracker.logRequest('provider1', 'code_generation');
      tracker.logRequest('provider2', 'code_analysis');
      tracker.logRequest('provider1', 'debugging');

      const analytics = tracker.getAnalytics();
      expect(analytics.totalRequests).toBe(3);

      const provider1Logs = tracker.getLogsByProvider('provider1');
      expect(provider1Logs).toHaveLength(2);

      const provider2Logs = tracker.getLogsByProvider('provider2');
      expect(provider2Logs).toHaveLength(1);
    });

    it('should include timestamp in request logs', () => {
      const testDate = new Date('2024-01-01T10:00:00Z');
      vi.setSystemTime(testDate);

      tracker.logRequest('provider1', 'code_generation');

      const requestLogs = tracker.getLogsByType('request');
      expect(requestLogs[0].timestamp).toEqual(testDate);
    });

    it('should track different task types', () => {
      const taskTypes = ['code_generation', 'code_analysis', 'debugging', 'testing', 'documentation'];

      taskTypes.forEach(taskType => {
        tracker.logRequest('provider1', taskType);
      });

      const requestLogs = tracker.getLogsByType('request');
      expect(requestLogs).toHaveLength(5);

      const loggedTaskTypes = requestLogs.map(log => log.taskType);
      taskTypes.forEach(taskType => {
        expect(loggedTaskTypes).toContain(taskType);
      });
    });
  });

  describe('Success Logging', () => {
    it('should log successes correctly', () => {
      tracker.logSuccess('provider1');

      const analytics = tracker.getAnalytics();
      expect(analytics.totalSuccesses).toBe(1);

      const successLogs = tracker.getLogsByType('success');
      expect(successLogs).toHaveLength(1);
      expect(successLogs[0]).toMatchObject({
        type: 'success',
        provider: 'provider1',
      });
    });

    it('should track multiple successes', () => {
      tracker.logSuccess('provider1');
      tracker.logSuccess('provider2');
      tracker.logSuccess('provider1');

      const analytics = tracker.getAnalytics();
      expect(analytics.totalSuccesses).toBe(3);
    });

    it('should include timestamp in success logs', () => {
      const testDate = new Date('2024-01-01T11:00:00Z');
      vi.setSystemTime(testDate);

      tracker.logSuccess('provider1');

      const successLogs = tracker.getLogsByType('success');
      expect(successLogs[0].timestamp).toEqual(testDate);
    });
  });

  describe('Error Logging', () => {
    it('should log errors correctly', () => {
      const error = new Error('Provider failed');
      tracker.logError('provider1', error);

      const analytics = tracker.getAnalytics();
      expect(analytics.totalErrors).toBe(1);

      const errorLogs = tracker.getLogsByType('error');
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0]).toMatchObject({
        type: 'error',
        provider: 'provider1',
        error: 'Provider failed',
      });
    });

    it('should track multiple errors', () => {
      tracker.logError('provider1', new Error('Network error'));
      tracker.logError('provider2', new Error('Auth error'));
      tracker.logError('provider1', new Error('Rate limit'));

      const analytics = tracker.getAnalytics();
      expect(analytics.totalErrors).toBe(3);
    });

    it('should handle different error types', () => {
      const errors = [
        new Error('Network error'),
        { message: 'API error' },
        { message: 'Timeout error', code: 'TIMEOUT' },
        new TypeError('Type error'),
      ];

      errors.forEach((error, index) => {
        tracker.logError(`provider${index}`, error);
      });

      const errorLogs = tracker.getLogsByType('error');
      expect(errorLogs).toHaveLength(4);
      expect(errorLogs[0].error).toBe('Network error');
      expect(errorLogs[1].error).toBe('API error');
      expect(errorLogs[2].error).toBe('Timeout error');
      expect(errorLogs[3].error).toBe('Type error');
    });

    it('should include timestamp in error logs', () => {
      const testDate = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(testDate);

      tracker.logError('provider1', new Error('Test error'));

      const errorLogs = tracker.getLogsByType('error');
      expect(errorLogs[0].timestamp).toEqual(testDate);
    });
  });

  describe('Provider Switch Logging', () => {
    it('should log provider switches correctly', () => {
      tracker.logProviderSwitch('provider2');

      const analytics = tracker.getAnalytics();
      expect(analytics.totalSwitches).toBe(1);

      const switchLogs = tracker.getLogsByType('switch');
      expect(switchLogs).toHaveLength(1);
      expect(switchLogs[0]).toMatchObject({
        type: 'switch',
        provider: 'provider2',
      });
    });

    it('should track multiple switches', () => {
      tracker.logProviderSwitch('provider2');
      tracker.logProviderSwitch('provider3');
      tracker.logProviderSwitch('provider1');

      const analytics = tracker.getAnalytics();
      expect(analytics.totalSwitches).toBe(3);
    });

    it('should include timestamp in switch logs', () => {
      const testDate = new Date('2024-01-01T13:00:00Z');
      vi.setSystemTime(testDate);

      tracker.logProviderSwitch('provider2');

      const switchLogs = tracker.getLogsByType('switch');
      expect(switchLogs[0].timestamp).toEqual(testDate);
    });
  });

  describe('Analytics Generation', () => {
    it('should provide accurate analytics for empty tracker', () => {
      const analytics = tracker.getAnalytics();

      expect(analytics).toEqual({
        totalRequests: 0,
        totalErrors: 0,
        totalSuccesses: 0,
        totalSwitches: 0,
        lastActivity: null,
        providers: [],
        logs: [],
      });
    });

    it('should provide comprehensive analytics', () => {
      tracker.logRequest('provider1', 'code_generation');
      tracker.logSuccess('provider1');
      tracker.logRequest('provider2', 'code_analysis');
      tracker.logError('provider2', new Error('Failed'));
      tracker.logProviderSwitch('provider3');

      const analytics = tracker.getAnalytics();

      expect(analytics.totalRequests).toBe(2);
      expect(analytics.totalSuccesses).toBe(1);
      expect(analytics.totalErrors).toBe(1);
      expect(analytics.totalSwitches).toBe(1);
      expect(analytics.providers).toEqual(['provider1', 'provider2', 'provider3']);
      expect(analytics.lastActivity).toBeInstanceOf(Date);
    });

    it('should track unique providers correctly', () => {
      tracker.logRequest('provider1', 'code_generation');
      tracker.logSuccess('provider1');
      tracker.logRequest('provider1', 'debugging');
      tracker.logError('provider1', new Error('Failed'));

      const analytics = tracker.getAnalytics();
      expect(analytics.providers).toEqual(['provider1']);
    });

    it('should update last activity timestamp', () => {
      const firstTime = new Date('2024-01-01T10:00:00Z');
      const secondTime = new Date('2024-01-01T11:00:00Z');

      vi.setSystemTime(firstTime);
      tracker.logRequest('provider1', 'code_generation');

      vi.setSystemTime(secondTime);
      tracker.logSuccess('provider1');

      const analytics = tracker.getAnalytics();
      expect(analytics.lastActivity).toEqual(secondTime);
    });
  });

  describe('Complex Usage Patterns', () => {
    it('should handle complete request-response cycle', () => {
      // Simulate a complete request cycle
      tracker.logRequest('provider1', 'code_generation');
      tracker.logSuccess('provider1');

      tracker.logRequest('provider2', 'code_analysis');
      tracker.logError('provider2', new Error('Provider failed'));

      tracker.logProviderSwitch('provider3');
      tracker.logRequest('provider3', 'code_analysis');
      tracker.logSuccess('provider3');

      const analytics = tracker.getAnalytics();
      expect(analytics.totalRequests).toBe(3);
      expect(analytics.totalSuccesses).toBe(2);
      expect(analytics.totalErrors).toBe(1);
      expect(analytics.totalSwitches).toBe(1);
    });

    it('should handle high-frequency logging', () => {
      const requestCount = 1000;

      for (let i = 0; i < requestCount; i++) {
        const provider = `provider${i % 3}`;
        tracker.logRequest(provider, 'code_generation');

        if (i % 2 === 0) {
          tracker.logSuccess(provider);
        } else {
          tracker.logError(provider, new Error(`Error ${i}`));
        }
      }

      const analytics = tracker.getAnalytics();
      expect(analytics.totalRequests).toBe(requestCount);
      expect(analytics.totalSuccesses).toBe(500);
      expect(analytics.totalErrors).toBe(500);
      expect(analytics.providers).toEqual(['provider0', 'provider1', 'provider2']);
    });

    it('should maintain chronological order', () => {
      const times = [
        new Date('2024-01-01T10:00:00Z'),
        new Date('2024-01-01T10:01:00Z'),
        new Date('2024-01-01T10:02:00Z'),
      ];

      times.forEach((time, index) => {
        vi.setSystemTime(time);
        tracker.logRequest(`provider${index}`, 'code_generation');
      });

      const logs = tracker.getAnalytics().logs;
      for (let i = 1; i < logs.length; i++) {
        expect(logs[i].timestamp.getTime()).toBeGreaterThanOrEqual(logs[i - 1].timestamp.getTime());
      }
    });
  });

  describe('Memory and Performance', () => {
    it('should handle large numbers of logs efficiently', () => {
      const logCount = 10000;
      const startTime = Date.now();

      for (let i = 0; i < logCount; i++) {
        tracker.logRequest('provider1', 'code_generation');
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 10,000 logs in reasonable time
      expect(duration).toBeLessThan(1000); // 1 second

      const analytics = tracker.getAnalytics();
      expect(analytics.totalRequests).toBe(logCount);
    });

    it('should allow log cleanup', () => {
      tracker.logRequest('provider1', 'code_generation');
      tracker.logSuccess('provider1');
      tracker.logError('provider1', new Error('Test'));

      expect(tracker.getAnalytics().logs.length).toBe(3);

      tracker.clearLogs();

      const analytics = tracker.getAnalytics();
      expect(analytics.totalRequests).toBe(0);
      expect(analytics.totalSuccesses).toBe(0);
      expect(analytics.totalErrors).toBe(0);
      expect(analytics.logs.length).toBe(0);
      expect(analytics.lastActivity).toBeNull();
    });
  });

  describe('Provider Filtering', () => {
    it('should filter logs by provider', () => {
      tracker.logRequest('provider1', 'code_generation');
      tracker.logRequest('provider2', 'code_analysis');
      tracker.logSuccess('provider1');
      tracker.logError('provider2', new Error('Failed'));

      const provider1Logs = tracker.getLogsByProvider('provider1');
      expect(provider1Logs).toHaveLength(2);
      expect(provider1Logs.every(log => log.provider === 'provider1')).toBe(true);

      const provider2Logs = tracker.getLogsByProvider('provider2');
      expect(provider2Logs).toHaveLength(2);
      expect(provider2Logs.every(log => log.provider === 'provider2')).toBe(true);
    });

    it('should return empty array for non-existent provider', () => {
      tracker.logRequest('provider1', 'code_generation');

      const nonExistentLogs = tracker.getLogsByProvider('non-existent');
      expect(nonExistentLogs).toEqual([]);
    });
  });

  describe('Log Type Filtering', () => {
    it('should filter logs by type', () => {
      tracker.logRequest('provider1', 'code_generation');
      tracker.logSuccess('provider1');
      tracker.logError('provider1', new Error('Failed'));
      tracker.logProviderSwitch('provider2');

      expect(tracker.getLogsByType('request')).toHaveLength(1);
      expect(tracker.getLogsByType('success')).toHaveLength(1);
      expect(tracker.getLogsByType('error')).toHaveLength(1);
      expect(tracker.getLogsByType('switch')).toHaveLength(1);
    });

    it('should return empty array for non-existent type', () => {
      tracker.logRequest('provider1', 'code_generation');

      const nonExistentLogs = tracker.getLogsByType('non-existent');
      expect(nonExistentLogs).toEqual([]);
    });
  });
});