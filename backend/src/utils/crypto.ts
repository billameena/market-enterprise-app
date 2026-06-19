import crypto from 'crypto';

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function generateShortToken(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join('');
}

export function hashSHA256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function generateUUID(): string {
  return crypto.randomUUID();
}
