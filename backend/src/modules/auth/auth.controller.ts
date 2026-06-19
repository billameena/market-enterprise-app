import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(
        req.body,
        req.ip ?? undefined,
        req.headers['user-agent'] ?? undefined,
      );
      sendCreated(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(
        req.body,
        req.ip ?? undefined,
        req.headers['user-agent'] ?? undefined,
      );
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshTokens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokens = await authService.refreshTokens(req.body);
      sendSuccess(res, tokens, 'Tokens refreshed');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.sessionId) {
        await authService.logout(req.user.sessionId);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async logoutAllDevices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.id) {
        await authService.logoutAllDevices(req.user.id);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.verifyEmail(req.body);
      sendSuccess(res, null, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.forgotPassword(req.body);
      sendSuccess(res, null, 'If an account with that email exists, a password reset email has been sent.');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.resetPassword(req.body);
      sendSuccess(res, null, 'Password reset successfully. Please log in with your new password.');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.changePassword(req.user!.id, req.body);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.resendVerificationEmail(req.body.email);
      sendSuccess(res, null, 'Verification email sent if account exists.');
    } catch (error) {
      next(error);
    }
  }
}
