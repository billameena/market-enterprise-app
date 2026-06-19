import { addDays, addHours, addMinutes } from 'date-fns';
import { AuthRepository } from './auth.repository';
import {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  ChangePasswordInput,
} from './auth.validator';
import { AuthResponse, AuthTokens, UserProfile } from './auth.types';
import { hashPassword, comparePassword, compareToken } from '../../utils/bcrypt';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { generateSecureToken } from '../../utils/crypto';
import { AppError } from '../../middlewares/error.middleware';
import { env } from '../../configs/env';
import { emailQueue } from '../../jobs/email.job';
import { logger } from '../../configs/logger';
import crypto from 'crypto';

const repo = new AuthRepository();

function buildUserProfile(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
}): UserProfile {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    avatarUrl: user.avatarUrl,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
}

function issueTokenPair(userId: string, email: string, role: string, sessionId: string): AuthTokens {
  const accessToken = signAccessToken({ sub: userId, email, role, sessionId });
  const refreshToken = signRefreshToken({ sub: userId, sessionId, jti: generateSecureToken(16) });
  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
}

export class AuthService {
  async register(input: RegisterInput, ipAddress?: string, userAgent?: string): Promise<{ message: string }> {
    const existing = await repo.findUserByEmail(input.email);
    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }

    const hashedPassword = await hashPassword(input.password);
    const verificationToken = generateSecureToken(32);
    const verificationExpiry = addHours(new Date(), env.EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS);

    const user = await repo.createUser({
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
    });

    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await emailQueue.add('send-verification-email', {
      to: user.email,
      name: `${user.firstName} ${user.lastName}`,
      verificationUrl,
    });

    logger.info('User registered', { userId: user.id, email: user.email, ipAddress });

    return { message: 'Registration successful. Please check your email to verify your account.' };
  }

  async login(
    input: LoginInput,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const user = await repo.findUserByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Check if account is locked
    if (user.isLocked && user.lockUntil) {
      if (new Date() < user.lockUntil) {
        const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
        throw AppError.unauthorized(
          `Account locked due to too many failed login attempts. Try again in ${minutesLeft} minutes.`,
        );
      }
      // Lock expired, reset
      await repo.resetFailedLoginAttempts(user.id);
    }

    if (!user.isActive) {
      throw AppError.unauthorized('Your account has been deactivated. Please contact support.');
    }

    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      const attempts = await repo.incrementFailedLoginAttempts(user.id);
      const remaining = env.MAX_LOGIN_ATTEMPTS - attempts;

      if (attempts >= env.MAX_LOGIN_ATTEMPTS) {
        const lockUntil = addMinutes(new Date(), env.ACCOUNT_LOCK_DURATION_MINUTES);
        await repo.lockAccount(user.id, lockUntil);
        throw AppError.unauthorized(
          `Too many failed login attempts. Account locked for ${env.ACCOUNT_LOCK_DURATION_MINUTES} minutes.`,
        );
      }

      throw AppError.unauthorized(
        `Invalid email or password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      );
    }

    // Reset failed attempts on success
    await repo.resetFailedLoginAttempts(user.id);

    // Create new session
    const refreshTokenRaw = generateSecureToken(32);
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
    const sessionExpiry = addDays(new Date(), 7);

    const session = await repo.createSession({
      userId: user.id,
      refreshTokenHash,
      deviceInfo: input.deviceInfo,
      ipAddress,
      userAgent,
      expiresAt: sessionExpiry,
    });

    // Update last login
    await repo.updateUser(user.id, {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
    });

    const tokens = issueTokenPair(user.id, user.email, user.role, session.id);
    // Embed the raw refresh token (not hash) in the JWT
    const refreshToken = signRefreshToken({
      sub: user.id,
      sessionId: session.id,
      jti: refreshTokenRaw,
    });

    logger.info('User logged in', { userId: user.id, sessionId: session.id, ipAddress });

    return {
      user: buildUserProfile(user),
      tokens: { ...tokens, refreshToken },
    };
  }

  async refreshTokens(input: RefreshTokenInput): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(input.refreshToken);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    const session = await repo.findSessionById(payload.sessionId);
    if (!session) {
      throw AppError.unauthorized('Session not found or expired');
    }

    // Verify the raw token in jti against the stored hash
    const tokenHash = crypto.createHash('sha256').update(payload.jti).digest('hex');
    if (tokenHash !== session.refreshTokenHash) {
      // Possible token reuse — invalidate all sessions for security
      await repo.invalidateAllUserSessions(payload.sub);
      throw AppError.unauthorized('Refresh token reuse detected. All sessions invalidated.');
    }

    // ROTATION: invalidate old session
    await repo.invalidateSession(session.id);

    // Create new session
    const newRefreshTokenRaw = generateSecureToken(32);
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshTokenRaw).digest('hex');
    const newSessionExpiry = addDays(new Date(), 7);

    const user = await repo.findUserById(payload.sub);
    if (!user || !user.isActive) {
      throw AppError.unauthorized('User account is no longer active');
    }

    const newSession = await repo.createSession({
      userId: user.id,
      refreshTokenHash: newRefreshTokenHash,
      deviceInfo: session.deviceInfo ?? undefined,
      ipAddress: session.ipAddress ?? undefined,
      userAgent: session.userAgent ?? undefined,
      expiresAt: newSessionExpiry,
    });

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: newSession.id,
    });

    const newRefreshToken = signRefreshToken({
      sub: user.id,
      sessionId: newSession.id,
      jti: newRefreshTokenRaw,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60,
    };
  }

  async logout(sessionId: string): Promise<void> {
    await repo.invalidateSession(sessionId);
  }

  async logoutAllDevices(userId: string): Promise<void> {
    await repo.invalidateAllUserSessions(userId);
  }

  async verifyEmail(input: VerifyEmailInput): Promise<void> {
    const user = await repo.findUserByVerificationToken(input.token);
    if (!user) {
      throw AppError.badRequest('Invalid or expired verification token');
    }

    await repo.updateUser(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    });

    logger.info('Email verified', { userId: user.id });
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await repo.findUserByEmail(input.email);
    // Always return success to prevent email enumeration
    if (!user) return;

    const resetToken = generateSecureToken(32);
    const resetExpiry = addHours(new Date(), env.PASSWORD_RESET_TOKEN_EXPIRY_HOURS);

    await repo.updateUser(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiry: resetExpiry,
    });

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await emailQueue.add('send-password-reset', {
      to: user.email,
      name: `${user.firstName} ${user.lastName}`,
      resetUrl,
    });

    logger.info('Password reset email sent', { userId: user.id });
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const user = await repo.findUserByPasswordResetToken(input.token);
    if (!user) {
      throw AppError.badRequest('Invalid or expired password reset token');
    }

    const hashedPassword = await hashPassword(input.password);

    await repo.updateUser(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
      failedLoginAttempts: 0,
      isLocked: false,
      lockUntil: null,
    });

    // Invalidate all sessions after password reset
    await repo.invalidateAllUserSessions(user.id);

    logger.info('Password reset successful', { userId: user.id });
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await repo.findUserById(userId);
    if (!user) {
      throw AppError.notFound('User');
    }

    const isCurrentPasswordValid = await comparePassword(input.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw AppError.badRequest('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(input.newPassword);
    await repo.updateUser(userId, { password: hashedPassword });

    // Invalidate all other sessions
    await repo.invalidateAllUserSessions(userId);

    logger.info('Password changed', { userId });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await repo.findUserByEmail(email);
    if (!user) return; // Prevent enumeration

    if (user.isEmailVerified) {
      throw AppError.badRequest('Email is already verified');
    }

    const verificationToken = generateSecureToken(32);
    const verificationExpiry = addHours(new Date(), env.EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS);

    await repo.updateUser(user.id, {
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
    });

    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await emailQueue.add('send-verification-email', {
      to: user.email,
      name: `${user.firstName} ${user.lastName}`,
      verificationUrl,
    });
  }
}
