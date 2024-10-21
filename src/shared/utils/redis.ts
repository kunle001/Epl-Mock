import Redis from "ioredis";
import dotenv from "dotenv";
import {
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
} from "../../config/env.config";
dotenv.config();
class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: REDIS_HOST,
      port: parseInt(REDIS_PORT, 10),
      password: REDIS_PASSWORD,
    });
    console.log("====Redis Cache Connected====");
  }

  // Set data in Redis with an expiration time (in seconds)
  async set(
    key: string,
    value: string,
    expireTimeInSeconds?: number
  ): Promise<void> {
    if (expireTimeInSeconds) {
      await this.client.set(key, value, "EX", expireTimeInSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  // Get data from Redis by key
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  // Delete data from Redis by key
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  // Check if a key exists in Redis
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // Close Redis connection (useful for graceful shutdowns)
  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

export const redisService = new RedisService();
