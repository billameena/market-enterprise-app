import { User, UserSession } from '@prisma/client';
import { prisma } from '../../configs/database';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    emailVerificationToken: string;
    emailVerificationExpiry: Date;
  }): Promise<User> {
    return prisma.user.create({ data });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async createSession(data: {
    userId: string;
    refreshTokenHash: string;
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }): Promise<UserSession> {
    return prisma.userSession.create({ data });
  }

  async findSessionById(id: string): Promise<UserSession | null> {
    return prisma.userSession.findFirst({
      where: { id, isActive: true, expiresAt: { gt: new Date() } },
    });
  }

  async invalidateSession(id: string): Promise<void> {
    await prisma.userSession.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    await prisma.userSession.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }

  async findUserByVerificationToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiry: { gt: new Date() },
        deletedAt: null,
      },
    });
  }

  async findUserByPasswordResetToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
        deletedAt: null,
      },
    });
  }

  async incrementFailedLoginAttempts(userId: string): Promise<number> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 } },
    });
    return user.failedLoginAttempts;
  }

  async resetFailedLoginAttempts(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, isLocked: false, lockUntil: null },
    });
  }

  async lockAccount(userId: string, lockUntil: Date): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isLocked: true, lockUntil },
    });
  }
}
