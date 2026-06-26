import nodemailer, { Transporter } from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../configs/env';
import { logger } from '../configs/logger';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

// Use Resend HTTP API when RESEND_API_KEY is set (required on Render — SMTP ports are blocked)
// Falls back to Nodemailer SMTP for local development with MailHog
async function sendViaResend(options: EmailOptions): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY);
  const to = Array.isArray(options.to) ? options.to : [options.to];

  const { error } = await resend.emails.send({
    from: `${env.SMTP_FROM_NAME} <${env.SMTP_FROM_EMAIL}>`,
    to,
    subject: options.subject,
    html: options.html,
    text: options.text ?? options.html.replace(/<[^>]*>/g, ''),
  });

  if (error) throw new Error(error.message);
}

let transporter: Transporter;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      requireTLS: !env.SMTP_SECURE,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: env.SMTP_USER
        ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
        : undefined,
    });
  }
  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    if (env.RESEND_API_KEY) {
      await sendViaResend(options);
    } else {
      const info = await getTransporter().sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text ?? options.html.replace(/<[^>]*>/g, ''),
        attachments: options.attachments,
      });
      logger.info('Email sent', { messageId: info.messageId, to: options.to });
      return;
    }
    logger.info('Email sent', { to: options.to });
  } catch (error) {
    logger.error('Failed to send email', { error, to: options.to });
    throw error;
  }
}

export function buildEmailVerificationTemplate(name: string, verificationUrl: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#1a1a1a">Verify Your Email Address</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
      <div style="text-align:center;margin:30px 0">
        <a href="${verificationUrl}" style="background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
          Verify Email
        </a>
      </div>
      <p>This link expires in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
    </div>
  `;
}

export function buildPasswordResetTemplate(name: string, resetUrl: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#1a1a1a">Reset Your Password</h2>
      <p>Hello ${name},</p>
      <p>You requested to reset your password. Click the button below to proceed:</p>
      <div style="text-align:center;margin:30px 0">
        <a href="${resetUrl}" style="background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
          Reset Password
        </a>
      </div>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;
}

export function buildOrderConfirmationTemplate(
  name: string,
  orderNumber: string,
  orderTotal: string,
  orderUrl: string,
): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#1a1a1a">Order Confirmed!</h2>
      <p>Hello ${name},</p>
      <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
      <p>Order Total: <strong>${orderTotal}</strong></p>
      <div style="text-align:center;margin:30px 0">
        <a href="${orderUrl}" style="background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
          View Order
        </a>
      </div>
    </div>
  `;
}
