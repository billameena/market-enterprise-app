import winston from 'winston';
import { env } from './env';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const prettyFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp: ts, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}]: ${message}${metaStr}`;
  }),
);

const jsonFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: env.LOG_FORMAT === 'json' ? jsonFormat : prettyFormat,
  defaultMeta: { service: 'marketplace-api' },
  transports: [
    new winston.transports.Console({
      silent: env.NODE_ENV === 'test',
    }),
    ...(env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 14,
          }),
          new winston.transports.File({
            filename: 'logs/app.log',
            maxsize: 10 * 1024 * 1024,
            maxFiles: 14,
          }),
        ]
      : []),
  ],
  exceptionHandlers: [
    new winston.transports.Console({ silent: env.NODE_ENV === 'test' }),
  ],
  rejectionHandlers: [
    new winston.transports.Console({ silent: env.NODE_ENV === 'test' }),
  ],
});

// Create a stream for Morgan HTTP logger
export const httpLogStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
