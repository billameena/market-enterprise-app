import jwt, { Secret } from 'jsonwebtoken';
import { env } from '../configs/env';

export interface AccessTokenPayload {
  sub: string;       // userId
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface RefreshTokenPayload {
  sub: string;       // userId
  sessionId: string;
  jti: string;       // unique token ID
  iat?: number;
  exp?: number;
}

const privateKey = env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
const publicKey = env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');

// Use Buffer to satisfy jsonwebtoken overloads expecting Buffer or KeyObject
const privateKeyBuf = Buffer.from(privateKey);
const publicKeyBuf = Buffer.from(publicKey);

export function signAccessToken(payload: Omit<AccessTokenPayload, 'iat' | 'exp' | 'iss' | 'aud'>): string {
  return (jwt as any).sign(payload, privateKeyBuf, {
    algorithm: 'RS256',
    expiresIn: env.JWT_ACCESS_TOKEN_EXPIRY,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  return (jwt as any).sign(payload, privateKeyBuf, {
    algorithm: 'RS256',
    expiresIn: env.JWT_REFRESH_TOKEN_EXPIRY,
    issuer: env.JWT_ISSUER,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return (jwt as any).verify(token, publicKeyBuf, {
    algorithms: ['RS256'],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  }) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return (jwt as any).verify(token, publicKeyBuf, {
    algorithms: ['RS256'],
    issuer: env.JWT_ISSUER,
  }) as RefreshTokenPayload;
}

export function decodeToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.decode(token) as AccessTokenPayload;
  } catch {
    return null;
  }
}
