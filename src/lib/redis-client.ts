import { createClient } from "redis";

// Redis configuration from environment or provided credentials
const redisConfig = {
  url: process.env.REDIS_URL || "redis://default:hSXZQTsTCmn2ZZkvBG5lUkUpZjWiursB@redis-12393.internal.c46225.us-central1-mz.gcp.cloud.rlrcp.com:12393",
};

// Create Redis client singleton
let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: redisConfig.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error("Redis: Max reconnection attempts reached");
            return new Error("Max reconnection attempts reached");
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    redisClient.on("reconnecting", () => {
      console.log("🔄 Redis reconnecting...");
    });

    await redisClient.connect();
  }

  return redisClient;
}

// Cache utilities
export class RedisCache {
  private static instance: RedisCache;
  private client: ReturnType<typeof createClient> | null = null;

  private constructor() {}

  static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  async initialize() {
    this.client = await getRedisClient();
  }

  // Generic cache methods
  async get(key: string): Promise<string | null> {
    if (!this.client) await this.initialize();
    return this.client!.get(key);
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    if (!this.client) await this.initialize();
    if (expirySeconds) {
      await this.client!.setEx(key, expirySeconds, value);
    } else {
      await this.client!.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.client) await this.initialize();
    await this.client!.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) await this.initialize();
    const result = await this.client!.exists(key);
    return result === 1;
  }

  // List operations for queues
  async pushToQueue(queueName: string, value: string): Promise<void> {
    if (!this.client) await this.initialize();
    await this.client!.lPush(queueName, value);
  }

  async popFromQueue(queueName: string): Promise<string | null> {
    if (!this.client) await this.initialize();
    return this.client!.rPop(queueName);
  }

  // Hash operations for sessions
  async setSession(sessionId: string, data: Record<string, any>, expirySeconds: number = 86400): Promise<void> {
    if (!this.client) await this.initialize();
    await this.client!.hSet(`session:${sessionId}`, data);
    await this.client!.expire(`session:${sessionId}`, expirySeconds);
  }

  async getSession(sessionId: string): Promise<Record<string, string>> {
    if (!this.client) await this.initialize();
    return this.client!.hGetAll(`session:${sessionId}`);
  }

  // Pub/Sub for real-time features
  async publish(channel: string, message: string): Promise<void> {
    if (!this.client) await this.initialize();
    await this.client!.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const subscriber = this.client!.duplicate();
    await subscriber.connect();
    await subscriber.subscribe(channel, (message) => {
      callback(message);
    });
  }

  // Rate limiting
  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    if (!this.client) await this.initialize();

    const multi = this.client!.multi();
    const now = Date.now();
    const window = now - (windowSeconds * 1000);

    // Remove old entries
    multi.zRemRangeByScore(key, 0, window);

    // Count current entries
    multi.zCard(key);

    // Add new entry
    multi.zAdd(key, { score: now, value: `${now}-${Math.random()}` });

    // Set expiry
    multi.expire(key, windowSeconds);

    const results = await multi.exec();
    const count = results[1] as number;

    return {
      allowed: count < limit,
      remaining: Math.max(0, limit - count),
      resetAt: new Date(now + windowSeconds * 1000)
    };
  }

  // AI response caching
  async cacheAIResponse(prompt: string, response: string, ttl: number = 3600): Promise<void> {
    if (!this.client) await this.initialize();
    const key = `ai:${Buffer.from(prompt).toString('base64').substring(0, 50)}`;
    await this.set(key, JSON.stringify({
      prompt,
      response,
      timestamp: Date.now()
    }), ttl);
  }

  async getAIResponse(prompt: string): Promise<string | null> {
    if (!this.client) await this.initialize();
    const key = `ai:${Buffer.from(prompt).toString('base64').substring(0, 50)}`;
    const cached = await this.get(key);
    if (cached) {
      const data = JSON.parse(cached);
      return data.response;
    }
    return null;
  }

  // Code execution results caching
  async cacheCodeExecution(code: string, result: any, ttl: number = 300): Promise<void> {
    if (!this.client) await this.initialize();
    const key = `exec:${Buffer.from(code).toString('base64').substring(0, 50)}`;
    await this.set(key, JSON.stringify(result), ttl);
  }

  async getCodeExecution(code: string): Promise<any | null> {
    if (!this.client) await this.initialize();
    const key = `exec:${Buffer.from(code).toString('base64').substring(0, 50)}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Collaboration presence
  async updateUserPresence(workspaceId: string, userId: string, data: any): Promise<void> {
    if (!this.client) await this.initialize();
    const key = `presence:${workspaceId}:${userId}`;
    await this.set(key, JSON.stringify({
      ...data,
      lastSeen: Date.now()
    }), 30); // 30 second TTL
  }

  async getWorkspacePresence(workspaceId: string): Promise<any[]> {
    if (!this.client) await this.initialize();
    const pattern = `presence:${workspaceId}:*`;
    const keys = await this.client!.keys(pattern);
    const presence = [];

    for (const key of keys) {
      const data = await this.get(key);
      if (data) {
        presence.push(JSON.parse(data));
      }
    }

    return presence;
  }
}

// Export singleton instance
export const redisCache = RedisCache.getInstance();