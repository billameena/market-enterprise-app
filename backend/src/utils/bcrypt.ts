import bcrypt from 'bcryptjs';
import { env } from '../configs/env';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export async function compareToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}
