import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  client: Redis;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined');
    }
    this.client = new Redis(redisUrl);
  }

  onModuleDestroy() {
    if (this.client) this.client.quit();
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) return this.client.set(key, value, 'EX', ttlSeconds);
    return this.client.set(key, value);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async del(key: string) {
    return this.client.del(key);
  }
}
