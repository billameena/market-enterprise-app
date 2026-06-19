import { Queue, Worker, Job } from 'bullmq';
import { getBullMQConnection } from '../configs/redis';
import { env } from '../configs/env';
import { logger } from '../configs/logger';
import { geminiService } from '../services/gemini.service';
import { emitToUser } from '../configs/socket';

// ─── Queue ────────────────────────────────────────────────────────────────────
// The Queue is the "mailbox" — producers drop jobs here.
// Redis stores the jobs until a Worker picks them up.
export const aiQueue = new Queue('ai-queue', {
  connection: getBullMQConnection(),
  defaultJobOptions: {
    attempts: 2,                          // retry twice if Gemini API fails
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 50,                 // keep last 50 completed jobs in Redis
    removeOnFail: 100,
  },
});

// ─── Job Data Shape ───────────────────────────────────────────────────────────
interface GenerateDescriptionJobData {
  userId: string;    // which vendor triggered this — used to emit result back
  name: string;
  category: string;
  features: string;
}

// ─── Processor ────────────────────────────────────────────────────────────────
// This function runs inside the Worker — it gets the job data and does the work.
async function processAiJob(job: Job): Promise<void> {
  logger.info('Processing AI job', { jobId: job.id, jobName: job.name });

  if (job.name === 'generate-description') {
    const { userId, name, category, features } = job.data as GenerateDescriptionJobData;

    try {
      // Call Gemini API (or mock if key not set)
      const description = await geminiService.generateProductDescription(name, category, features);

      // Push the result to the specific vendor's browser via Socket.io
      // emitToUser finds the socket room "user:{userId}" and sends the event
      emitToUser(userId, 'ai:description_ready', {
        jobId: job.id,
        description,
        success: true,
      });

      logger.info('AI description generated and emitted', { jobId: job.id, userId });
    } catch (error) {
      const err = error as Error;
      logger.error('AI generation failed', { jobId: job.id, error: err.message });

      // Notify the frontend even on failure so the UI stops showing "Generating..."
      emitToUser(userId, 'ai:description_ready', {
        jobId: job.id,
        description: null,
        success: false,
        error: 'Failed to generate description. Please try again.',
      });

      throw error; // re-throw so BullMQ marks the job as failed and retries
    }
  }
}

// ─── Worker ───────────────────────────────────────────────────────────────────
// The Worker is the "consumer" — it continuously polls Redis for new jobs
// and calls processAiJob() for each one. concurrency: 2 means it processes
// up to 2 AI jobs at the same time.
export function startAiWorker(): Worker {
  const worker = new Worker('ai-queue', processAiJob, {
    connection: getBullMQConnection(),
    concurrency: 2,
  });

  worker.on('completed', (job) => {
    logger.info('AI job completed', { jobId: job.id, jobName: job.name });
  });

  worker.on('failed', (job, err) => {
    logger.error('AI job failed permanently', { jobId: job?.id, error: err.message });
  });

  return worker;
}
