import { UserRole } from '@prisma/client';
import type { Readable } from 'stream';

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        stream: Readable;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }

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
