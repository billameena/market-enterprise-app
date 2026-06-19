import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { env } from './env';

// Serialize Prisma Decimal as plain JS number in JSON responses
(Decimal.prototype as unknown as { toJSON: () => number }).toJSON = function () {
  return parseFloat(this.toString());
};

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    errorFormat: 'pretty',
  });
}

// Prevent multiple instances in development (hot reload)
export const prisma: PrismaClient =
  global.__prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
