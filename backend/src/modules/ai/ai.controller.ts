import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { aiQueue } from '../../jobs/ai.job';
import { geminiService } from '../../services/gemini.service';

// Zod schema — validates the request body before we do anything
const generateDescriptionSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  features: z.string().optional().default(''),
});

export async function generateDescription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, category, features } = generateDescriptionSchema.parse(req.body);
    const userId = req.user!.id; // set by authenticate middleware

    // Add job to the BullMQ queue — this is instant, does NOT wait for AI
    // BullMQ stores the job in Redis and returns a Job object with an id
    const job = await aiQueue.add('generate-description', { userId, name, category, features });

    // Return immediately — the frontend doesn't wait for the AI response here.
    // The actual AI result arrives later via Socket.io event 'ai:description_ready'
    res.json({
      success: true,
      message: 'AI generation started',
      data: {
        jobId: job.id,
        isAiConfigured: geminiService.isConfigured(),
      },
    });
  } catch (error) {
    next(error);
  }
}
