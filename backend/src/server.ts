import 'dotenv/config';
import { createServer } from 'http';
import { createApp } from './configs/app';
import { connectDatabase, disconnectDatabase } from './configs/database';
import { connectRedis, disconnectRedis } from './configs/redis';
import { createSocketServer } from './configs/socket';
import { startAllWorkers } from './jobs';
import { env } from './configs/env';
import { logger } from './configs/logger';

async function bootstrap(): Promise<void> {
  // Connect to infrastructure
  await connectDatabase();
  await connectRedis();

  // Create Express app
  const app = createApp();

  // Create HTTP server
  const httpServer = createServer(app);

  // Attach Socket.IO
  createSocketServer(httpServer);

  // Start BullMQ workers
  startAllWorkers();

  // Start listening
  httpServer.listen(env.PORT, () => {
    logger.info(`Server started`, {
      port: env.PORT,
      environment: env.NODE_ENV,
      apiVersion: env.API_VERSION,
      url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
    });
  });

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    httpServer.close(async () => {
      await disconnectDatabase();
      await disconnectRedis();
      logger.info('Server shut down successfully');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
