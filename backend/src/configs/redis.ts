import IORedis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

const redisOptions: IORedis.RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
  keyPrefix: env.REDIS_KEY_PREFIX,
  retryStrategy: (times: number) => {
    if (times > 10) {
      logger.error('Redis max reconnection attempts reached');
      return null;
    }
    return Math.min(times * 100, 3000);
  },
  reconnectOnError: (err: Error) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
};

if (env.REDIS_PASSWORD) {
  redisOptions.password = env.REDIS_PASSWORD;
}

if (env.REDIS_TLS) {
  redisOptions.tls = {};
}

// Main Redis client
export const redis = new IORedis(redisOptions);

// Dedicated subscriber client (for pub/sub, cannot share with publisher)
export const redisSubscriber = new IORedis({ ...redisOptions, keyPrefix: '' });

// Publisher client
export const redisPublisher = new IORedis({ ...redisOptions, keyPrefix: '' });

redis.on('connect', () => logger.info('Redis client connected'));
redis.on('ready', () => logger.info('Redis client ready'));
redis.on('error', (err: Error) => logger.error('Redis client error', { error: err.message }));
redis.on('close', () => logger.warn('Redis client connection closed'));
redis.on('reconnecting', () => logger.info('Redis client reconnecting'));

async function connectIfNeeded(client: IORedis): Promise<void> {
  if (client.status === 'wait') {
    await client.connect();
  }
}

export async function connectRedis(): Promise<void> {
  await connectIfNeeded(redis);
  await connectIfNeeded(redisSubscriber);
  await connectIfNeeded(redisPublisher);
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
  await redisSubscriber.quit();
  await redisPublisher.quit();
}

// BullMQ connection factory — includes TLS when REDIS_TLS=true (required for Upstash)
export function getBullMQConnection() {
  const conn: Record<string, unknown> = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
  if (env.REDIS_TLS) conn['tls'] = {};
  return conn;
}

// Cache utility helpers
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  },

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  async incr(key: string, ttlSeconds?: number): Promise<number> {
    const count = await redis.incr(key);
    if (ttlSeconds && count === 1) {
      await redis.expire(key, ttlSeconds);
    }
    return count;
  },

  async exists(key: string): Promise<boolean> {
    const count = await redis.exists(key);
    return count > 0;
  },
};
