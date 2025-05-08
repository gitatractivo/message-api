import nodemailer from "nodemailer";
import { logger } from "@/config/logger";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Verify your email address",
        html: `
          <h1>Email Verification</h1>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>This link will expire in 24 hours.</p>
        `,
      });

      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}:`, error);
      throw new Error("Failed to send verification email");
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    try {
      const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Reset your password",
        html: `
          <h1>Password Reset</h1>
          <p>Please click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
        `,
      });

      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new Error("Failed to send password reset email");
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Welcome to our platform!",
        html: `
          <h1>Welcome ${name}!</h1>
          <p>Thank you for joining our platform. We're excited to have you on board!</p>
          <p>You can now start using all the features available to you.</p>
        `,
      });

      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send welcome email to ${email}:`, error);
      throw new Error("Failed to send welcome email");
    }
  }
}

export const emailService = new EmailService();
