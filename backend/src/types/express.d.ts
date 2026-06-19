import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      requestId?: string;
    }
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  sessionId: string;
}
