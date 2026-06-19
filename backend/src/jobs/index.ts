import { startEmailWorker } from './email.job';
import { startNotificationWorker } from './notification.job';
import { startAiWorker } from './ai.job';
import { logger } from '../configs/logger';

export function startAllWorkers(): void {
  const emailWorker = startEmailWorker();
  const notificationWorker = startNotificationWorker();
  const aiWorker = startAiWorker();

  logger.info('BullMQ workers started', {
    workers: ['email-queue', 'notification-queue', 'ai-queue'],
  });

  process.on('SIGTERM', async () => {
    await emailWorker.close();
    await notificationWorker.close();
    await aiWorker.close();
    logger.info('BullMQ workers stopped');
  });
}
