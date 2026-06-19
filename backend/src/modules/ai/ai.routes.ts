import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { generateDescription } from './ai.controller';

export const aiRoutes = Router();

// Only logged-in users (vendors) can trigger AI generation
aiRoutes.post('/generate-description', authenticate, generateDescription);
