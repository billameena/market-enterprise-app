import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  API_VERSION: z.string().default('v1'),
  APP_NAME: z.string().default('Enterprise Marketplace'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_POOL_MIN: z.string().default('2').transform(Number),
  DATABASE_POOL_MAX: z.string().default('10').transform(Number),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform(Number),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().default('0').transform(Number),
  REDIS_KEY_PREFIX: z.string().default('marketplace:'),
  REDIS_TLS: z.string().default('false').transform((v) => v === 'true'),

  // JWT
  JWT_PRIVATE_KEY: z.string().min(1, 'JWT_PRIVATE_KEY is required'),
  JWT_PUBLIC_KEY: z.string().min(1, 'JWT_PUBLIC_KEY is required'),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  JWT_ISSUER: z.string().default('enterprise-marketplace'),
  JWT_AUDIENCE: z.string().default('marketplace-users'),

  // Email
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.string().default('1025').transform(Number),
  SMTP_SECURE: z.string().default('false').transform((v) => v === 'true'),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM_NAME: z.string().default('Enterprise Marketplace'),
  SMTP_FROM_EMAIL: z.string().email().default('noreply@marketplace.com'),

  // AI
  GEMINI_API_KEY: z.string().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default('marketplace'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_CURRENCY: z.string().default('usd'),

  // Security
  BCRYPT_SALT_ROUNDS: z.string().default('12').transform(Number),
  MAX_LOGIN_ATTEMPTS: z.string().default('5').transform(Number),
  ACCOUNT_LOCK_DURATION_MINUTES: z.string().default('30').transform(Number),
  PASSWORD_RESET_TOKEN_EXPIRY_HOURS: z.string().default('1').transform(Number),
  EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS: z.string().default('24').transform(Number),
  SESSION_SECRET: z.string().min(16).default('change-me-in-production-please'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
  AUTH_RATE_LIMIT_MAX: z.string().default('10').transform(Number),
  UPLOAD_RATE_LIMIT_MAX: z.string().default('20').transform(Number),

  // Queue
  QUEUE_EMAIL_CONCURRENCY: z.string().default('3').transform(Number),
  QUEUE_NOTIFICATION_CONCURRENCY: z.string().default('2').transform(Number),
  QUEUE_ORDER_CONCURRENCY: z.string().default('5').transform(Number),
  QUEUE_RETRY_ATTEMPTS: z.string().default('3').transform(Number),
  QUEUE_RETRY_DELAY_MS: z.string().default('5000').transform(Number),

  // Pagination
  DEFAULT_PAGE_SIZE: z.string().default('20').transform(Number),
  MAX_PAGE_SIZE: z.string().default('100').transform(Number),

  // File Upload
  MAX_FILE_SIZE_MB: z.string().default('5').transform(Number),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),

  // Platform
  DEFAULT_COMMISSION_RATE: z.string().default('10').transform(Number),
  PLATFORM_TAX_RATE: z.string().default('8').transform(Number),
  FREE_SHIPPING_THRESHOLD: z.string().default('50').transform(Number),
  CART_EXPIRY_DAYS: z.string().default('7').transform(Number),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
