import { Queue, Worker, Job } from 'bullmq';
import { getBullMQConnection } from '../configs/redis';
import { env } from '../configs/env';
import { logger } from '../configs/logger';
import { NotificationsService } from '../modules/notifications/notifications.service';
import { NotificationType } from '@prisma/client';

export const notificationQueue = new Queue('notification-queue', {
  connection: getBullMQConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 50,
    removeOnFail: 200,
  },
});

interface InAppNotificationData {
  userId: string;
  type: string;
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

const notificationsService = new NotificationsService();

async function processNotificationJob(job: Job): Promise<void> {
  const data = job.data as Record<string, unknown>;
  logger.info('Processing notification job', { jobName: job.name, jobId: job.id });

  switch (job.name) {
    case 'in-app-notification': {
      const d = data as unknown as InAppNotificationData;
      await notificationsService.createNotification({
        userId: d.userId,
        type: d.type as NotificationType,
        title: d.title,
        body: d.body,
        imageUrl: d.imageUrl,
        actionUrl: d.actionUrl,
        metadata: d.metadata,
      });
      break;
    }
    default:
      logger.warn('Unknown notification job', { jobName: job.name });
  }
}

export function startNotificationWorker(): Worker {
  const worker = new Worker('notification-queue', processNotificationJob, {
    connection: getBullMQConnection(),
    concurrency: env.QUEUE_NOTIFICATION_CONCURRENCY,
  });

  worker.on('completed', (job) => {
    logger.info('Notification job completed', { jobId: job.id });
  });

  worker.on('failed', (job, err) => {
    logger.error('Notification job failed', { jobId: job?.id, error: err.message });
  });

  return worker;
}
