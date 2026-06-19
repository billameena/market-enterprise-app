import { Queue, Worker, Job } from 'bullmq';
import { getBullMQConnection } from '../configs/redis';
import { env } from '../configs/env';
import { logger } from '../configs/logger';
import {
  sendEmail,
  buildEmailVerificationTemplate,
  buildPasswordResetTemplate,
  buildOrderConfirmationTemplate,
} from '../utils/email';

export const emailQueue = new Queue('email-queue', {
  connection: getBullMQConnection(),
  defaultJobOptions: {
    attempts: env.QUEUE_RETRY_ATTEMPTS,
    backoff: {
      type: 'exponential',
      delay: env.QUEUE_RETRY_DELAY_MS,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

interface VerificationEmailData {
  to: string;
  name: string;
  verificationUrl: string;
}

interface PasswordResetEmailData {
  to: string;
  name: string;
  resetUrl: string;
}

interface OrderConfirmationEmailData {
  orderId: string;
  userId: string;
}

type EmailJobData =
  | ({ jobType: 'send-verification-email' } & VerificationEmailData)
  | ({ jobType: 'send-password-reset' } & PasswordResetEmailData)
  | ({ jobType: 'send-order-confirmation' } & OrderConfirmationEmailData);

async function processEmailJob(job: Job): Promise<void> {
  const data = job.data as Record<string, unknown>;
  const jobName = job.name;

  logger.info('Processing email job', { jobName, jobId: job.id });

  switch (jobName) {
    case 'send-verification-email': {
      const d = data as unknown as VerificationEmailData;
      await sendEmail({
        to: d.to,
        subject: 'Verify Your Email Address',
        html: buildEmailVerificationTemplate(d.name, d.verificationUrl),
      });
      break;
    }
    case 'send-password-reset': {
      const d = data as unknown as PasswordResetEmailData;
      await sendEmail({
        to: d.to,
        subject: 'Reset Your Password',
        html: buildPasswordResetTemplate(d.name, d.resetUrl),
      });
      break;
    }
    case 'send-order-confirmation': {
      const d = data as unknown as OrderConfirmationEmailData;
      // In production, fetch order details from DB here
      logger.info('Sending order confirmation', { orderId: d.orderId });
      break;
    }
    case 'vendor-approve': {
      const d = data as { vendorId: string };
      logger.info('Sending vendor approval email', { vendorId: d.vendorId });
      break;
    }
    case 'vendor-reject': {
      const d = data as { vendorId: string; reason?: string };
      logger.info('Sending vendor rejection email', { vendorId: d.vendorId, reason: d.reason });
      break;
    }
    default:
      logger.warn('Unknown email job type', { jobName });
  }
}

export function startEmailWorker(): Worker {
  const worker = new Worker('email-queue', processEmailJob, {
    connection: getBullMQConnection(),
    concurrency: env.QUEUE_EMAIL_CONCURRENCY,
  });

  worker.on('completed', (job) => {
    logger.info('Email job completed', { jobId: job.id, jobName: job.name });
  });

  worker.on('failed', (job, err) => {
    logger.error('Email job failed', { jobId: job?.id, jobName: job?.name, error: err.message });
  });

  return worker;
}
