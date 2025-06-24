import { Request, Response, NextFunction } from "express";
import { authService } from "@/services/auth.service";

import {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/validators/auth.validator";

class AuthController {
  async register(
    req: Request<{}, {}, RegisterInput["body"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { firstName, lastName, email, password, country } = req.body;

      const result = await authService.register({
        firstName,
        lastName,
        email,
        password,
        country,
      });

      res.status(201).json({
        status: "success",
        data: result,
        message: "User registered successfully, Please check your email for verification",
      });
    } catch (error) {
      next(error);
    }
  }

  async login(
    req: Request<{}, {}, LoginInput["body"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(
    req: Request<{ token: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { token } = req.params;

      const result = await authService.verifyEmail(token);


      //return a dom page with a a message that email is verified successfully  
      res.status(200).send(`
        <html>
          <body>
            <h1>Email Verified Successfully</h1>
            <p>Thank you for verifying your email address.</p>
          </body>
        </html>
      `);
      
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(
    req: Request<{}, {}, ForgotPasswordInput["body"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email } = req.body;

      const result = await authService.forgotPassword(email);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(
    req: Request<{}, {}, ResetPasswordInput["body"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { token, password } = req.body;

      const result = await authService.resetPassword(token, password);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
