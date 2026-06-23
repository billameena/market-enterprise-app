import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../configs/redis';
import { env } from '../configs/env';

// Each limiter must have its own RedisStore instance with a unique prefix
function createRedisStore(prefix: string): any {
  return new RedisStore({
    // avoid spread to satisfy typing: call.apply with args array
    sendCommand: (...args: unknown[]) => (redis.call as any).apply(redis, args) as Promise<any>,
    prefix: `${env.REDIS_KEY_PREFIX}rl:${prefix}:`,
  }) as any;
}

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('global'),
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    data: null,
  },
  skip: (req) => req.path === '/api/health',
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('auth'),
  keyGenerator: (req) => {
    return `auth:${req.ip ?? 'unknown'}:${req.path}`;
  },
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    data: null,
  },
});

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: env.UPLOAD_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('upload'),
  message: {
    success: false,
    message: 'Too many file uploads. Please try again later.',
    data: null,
  },
});

export const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('strict'),
  message: {
    success: false,
    message: 'Too many requests for this action. Please try again later.',
    data: null,
  },
});
