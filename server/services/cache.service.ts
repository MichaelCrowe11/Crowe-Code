import { createClient, RedisClientType } from 'redis';
import { env } from '../config/environment';
import { logger } from './logger.service';

class CacheService {
  private client: RedisClientType | null = null;
  private connected = false;
  private readonly ttl = {
    short: 60, // 1 minute
    medium: 300, // 5 minutes
    long: 3600, // 1 hour
    day: 86400, // 24 hours
  };
  
  async initialize() {
    if (!env.REDIS_URL) {
      logger.info('Redis URL not configured, caching disabled');
      return;
    }
    
    try {
      this.client = createClient({
        url: env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });
      
      this.client.on('error', (err) => {
        logger.error('Redis client error:', err);
        this.connected = false;
      });
      
      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.connected = true;
      });
      
      this.client.on('ready', () => {
        logger.info('Redis client ready');
      });
      
      await this.client.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
      this.client = null;
    }
  }
  
  isEnabled(): boolean {
    return this.client !== null && this.connected;
  }
  
  async ping(): Promise<boolean> {
    if (!this.client) return false;
    
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }
  
  // Key generation helpers
  private key(namespace: string, ...parts: (string | number)[]): string {
    return `crowe:${namespace}:${parts.join(':')}`;
  }
  
  // Basic operations
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isEnabled()) return null;
    
    try {
      const value = await this.client!.get(key);
      if (!value) return null;
      
      return JSON.parse(value);
    } catch (error) {
      logger.warn(`Cache get error for key ${key}:`, error);
      return null;
    }
  }
  
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.isEnabled()) return false;
    
    try {
      const serialized = JSON.stringify(value);
      const options = ttl ? { EX: ttl } : undefined;
      
      await this.client!.set(key, serialized, options);
      return true;
    } catch (error) {
      logger.warn(`Cache set error for key ${key}:`, error);
      return false;
    }
  }
  
  async del(key: string | string[]): Promise<number> {
    if (!this.isEnabled()) return 0;
    
    try {
      const keys = Array.isArray(key) ? key : [key];
      return await this.client!.del(keys);
    } catch (error) {
      logger.warn(`Cache delete error:`, error);
      return 0;
    }
  }
  
  async exists(key: string): Promise<boolean> {
    if (!this.isEnabled()) return false;
    
    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      return false;
    }
  }
  
  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isEnabled()) return false;
    
    try {
      const result = await this.client!.expire(key, ttl);
      return result === 1;
    } catch (error) {
      return false;
    }
  }
  
  // Pattern operations
  async keys(pattern: string): Promise<string[]> {
    if (!this.isEnabled()) return [];
    
    try {
      return await this.client!.keys(pattern);
    } catch (error) {
      logger.warn(`Cache keys error for pattern ${pattern}:`, error);
      return [];
    }
  }
  
  async flush(pattern?: string): Promise<number> {
    if (!this.isEnabled()) return 0;
    
    try {
      if (pattern) {
        const keys = await this.keys(pattern);
        if (keys.length > 0) {
          return await this.del(keys);
        }
        return 0;
      } else {
        await this.client!.flushDb();
        return 1;
      }
    } catch (error) {
      logger.warn('Cache flush error:', error);
      return 0;
    }
  }
  
  // Cache-aside pattern helper
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = this.ttl.medium
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Generate value
    const value = await factory();
    
    // Store in cache
    await this.set(key, value, ttl);
    
    return value;
  }
  
  // Invalidation helpers
  async invalidateUser(userId: number | string): Promise<void> {
    const pattern = this.key('user', userId, '*');
    await this.flush(pattern);
  }
  
  async invalidateKnowledge(): Promise<void> {
    const pattern = this.key('knowledge', '*');
    await this.flush(pattern);
  }
  
  async invalidateLab(userId: number | string): Promise<void> {
    const pattern = this.key('lab', userId, '*');
    await this.flush(pattern);
  }
  
  // Specific cache methods
  async getUserSession(userId: number | string): Promise<any> {
    const key = this.key('session', userId);
    return this.get(key);
  }
  
  async setUserSession(userId: number | string, session: any): Promise<boolean> {
    const key = this.key('session', userId);
    return this.set(key, session, this.ttl.day);
  }
  
  async getStrainData(strainId: number): Promise<any> {
    const key = this.key('knowledge', 'strain', strainId);
    return this.get(key);
  }
  
  async setStrainData(strainId: number, data: any): Promise<boolean> {
    const key = this.key('knowledge', 'strain', strainId);
    return this.set(key, data, this.ttl.long);
  }
  
  async getAIResponse(prompt: string): Promise<string | null> {
    const hash = this.hashString(prompt);
    const key = this.key('ai', 'response', hash);
    return this.get(key);
  }
  
  async setAIResponse(prompt: string, response: string): Promise<boolean> {
    const hash = this.hashString(prompt);
    const key = this.key('ai', 'response', hash);
    return this.set(key, response, this.ttl.medium);
  }
  
  // Rate limiting helper
  async incrementRateLimit(identifier: string, window: number = 60): Promise<number> {
    if (!this.isEnabled()) return 0;
    
    const key = this.key('ratelimit', identifier);
    
    try {
      const multi = this.client!.multi();
      multi.incr(key);
      multi.expire(key, window);
      const results = await multi.exec();
      return results[0] as number;
    } catch (error) {
      logger.warn('Rate limit increment error:', error);
      return 0;
    }
  }
  
  async getRateLimit(identifier: string): Promise<number> {
    if (!this.isEnabled()) return 0;
    
    const key = this.key('ratelimit', identifier);
    const value = await this.get<string>(key);
    return value ? parseInt(value, 10) : 0;
  }
  
  // Metrics
  async getMetrics(): Promise<any> {
    if (!this.isEnabled()) return null;
    
    try {
      const info = await this.client!.info('stats');
      const dbSize = await this.client!.dbSize();
      
      return {
        connected: this.connected,
        dbSize,
        info: this.parseRedisInfo(info),
      };
    } catch (error) {
      logger.warn('Failed to get cache metrics:', error);
      return null;
    }
  }
  
  private parseRedisInfo(info: string): Record<string, any> {
    const lines = info.split('\r\n');
    const parsed: Record<string, any> = {};
    
    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          parsed[key] = value;
        }
      }
    }
    
    return parsed;
  }
  
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
  
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.connected = false;
    }
  }
}

// Export singleton instance
export const cache = new CacheService();

// Cache decorator for methods
export function Cacheable(ttl: number = 300) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = await cache.get(cacheKey);
      if (cached !== null) {
        logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }
      
      // Call original method
      const result = await originalMethod.apply(this, args);
      
      // Store in cache
      await cache.set(cacheKey, result, ttl);
      
      return result;
    };
    
    return descriptor;
  };
}