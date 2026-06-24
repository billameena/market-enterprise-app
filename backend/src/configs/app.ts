import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './env';
import { httpLogStream } from './logger';
import { apiRouter } from '../routes';
import { errorMiddleware } from '../middlewares/error.middleware';
import { globalRateLimiter } from '../middlewares/rateLimit.middleware';

export function createApp(): Application {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
  console.log('[CORS] Allowed origins:', allowedOrigins);
  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID', 'X-Session-ID'],
    exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
  };
  app.options('*', cors(corsOptions));
  app.use(cors(corsOptions));

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(env.SESSION_SECRET));
  app.use(compression());

  // HTTP logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('combined', { stream: httpLogStream }));
  }

  // Trust proxy (for rate limiting behind nginx)
  app.set('trust proxy', 1);

  // Global rate limiter
  app.use(globalRateLimiter);

  // Request ID middleware
  app.use((req, _res, next) => {
    req.headers['x-request-id'] =
      req.headers['x-request-id'] ?? `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    next();
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      message: 'API is healthy',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: env.API_VERSION,
        environment: env.NODE_ENV,
      },
    });
  });

  // API routes
  app.use(`/api/${env.API_VERSION}`, apiRouter);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      data: null,
    });
  });

  // Global error handler
  app.use(errorMiddleware);

  return app;
}
