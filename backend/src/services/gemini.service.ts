import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../configs/env';
import { logger } from '../configs/logger';

class GeminiService {
  private client: GoogleGenerativeAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      logger.info('Gemini AI service initialized');
    } else {
      logger.warn('GEMINI_API_KEY not set — AI will use mock responses');
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async generateProductDescription(name: string, category: string, features: string): Promise<string> {
    if (!this.client) {
      return this.getMockDescription(name, category);
    }

    const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a professional e-commerce copywriter. Write a compelling product description for an online marketplace.

Product Name: ${name}
Category: ${category}
Key Features / Notes: ${features || 'Not provided'}

Requirements:
- Write 2-3 paragraphs
- Focus on customer benefits, not just features
- Use engaging, persuasive language
- Plain text only, no markdown or bullet points
- Keep it under 200 words

Description:`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }

  private getMockDescription(name: string, category: string): string {
    return (
      `Introducing the ${name}, a premium offering in the ${category} category designed to exceed your expectations. ` +
      `Built with quality materials and meticulous attention to detail, this product delivers exceptional performance and reliability in every use.\n\n` +
      `Perfect for everyday use, the ${name} combines modern design with practical functionality. ` +
      `Whether you are a seasoned professional or an enthusiastic beginner, this product adapts to your needs and enhances your experience from day one.\n\n` +
      `Order today and experience the difference that quality makes. ` +
      `Backed by our satisfaction guarantee, you can shop with complete confidence knowing you are getting the best value for your investment.`
    );
  }
}

export const geminiService = new GeminiService();
