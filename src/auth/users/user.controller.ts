import express, { Request, Response } from "express";
import UserService from "./user.service";
import errors from "../../configs/error-messages";
import { userValidation } from "./user.validation";
import { validate } from "express-validation";
import errorCode from "../../configs/error-codes";
import CustomRequest from "../../utils/customRequest";
import { verifyToken } from "../../middleware/auth.middleware";

class UserController {
  public path = "/user";
  public router = express.Router();
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
    this.initializeRoutes();
  }

  public signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.signup(req.body);
      res.send(result);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === errorCode.conflict.message
      ) {
        res.status(errorCode.conflict.statusCode).send(errors.unauthorized);
      } else {
        res.status(errorCode.internalServerError.statusCode).send(error);
      }
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.login(req.body);
      res.send(result);
    } catch (error) {
      console.log(error);
      if (
        error instanceof Error &&
        error.message === errorCode.unauthorized.message
      ) {
        res.status(errorCode.unauthorized.statusCode).send(errors.unauthorized);
      } else {
        res.status(errorCode.internalServerError.statusCode).send(error);
      }
    }
  };

  public changePassword = async (
    req: CustomRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId: string = req.userId || "defaultUserId";
      const oldPassword = req.body.oldPassword;
      const newPassword = req.body.newPassword;
      const result = await this.userService.changePassword(
        newPassword,
        oldPassword,
        userId
      );
      res.send(result);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === errorCode.unauthorized.message
      ) {
        res.status(errorCode.unauthorized.statusCode).send(errors.unauthorized);
      } else {
        res.status(errorCode.internalServerError.statusCode).send(error);
      }
    }
  };

  public forgetPassword = async (
    req: CustomRequest,
    res: Response
  ): Promise<void> => {
    try {
      const email = req.body.email;
      const result = await this.userService.initiateForgotPassword(email);
      res.send(result);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === errorCode.forbidden.message
      ) {
        res.status(errorCode.forbidden.statusCode).send(errors.forbidden);
      } else {
        res.status(errorCode.internalServerError.statusCode).send(error);
      }
    }
  };

  public resendPasswordOtp = async (
    req: CustomRequest,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.userService.resendForgetPasswordOTP(req.body);
      res.send(result);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === errorCode.forbidden.message
      ) {
        res.status(errorCode.forbidden.statusCode).send(errors.forbidden);
      } else {
        res.status(errorCode.internalServerError.statusCode).send(error);
      }
    }
  };

  public verifyForgetPasswordOtp = async (
    req: CustomRequest,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.userService.verifyForgotPasswordOTP(req.body);
      res.send(result);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === errorCode.forbidden.message
      ) {
        res.status(errorCode.forbidden.statusCode).send(errors.forbidden);
      } else {
        res.status(errorCode.internalServerError.statusCode).send(error);
      }
    }
  };

  public resetPassword = async (
    req: CustomRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId: string = req.userId || "defaultUserId";
      const newPassword = req.body.newPassword;
      const result = await this.userService.resetPassword(newPassword, userId);
      res.send(result);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === errorCode.forbidden.message
      ) {
        res.status(errorCode.forbidden.statusCode).send(errors.forbidden);
      } else {
        res.status(errorCode.internalServerError.statusCode).send(error);
      }
    }
  };

  public initializeRoutes(): void {
    this.router.post(
      `${this.path}/signup`,
      validate(userValidation.signup),
      this.signup
    );
    this.router.post(
      `${this.path}/login`,
      validate(userValidation.login),
      this.login
    );
    this.router.put(
      `${this.path}/change-password`,
      verifyToken,
      validate(userValidation.changePassword),
      this.changePassword
    );
    this.router.put(
      `${this.path}/forget-password`,
      validate(userValidation.forgetPassword),
      this.forgetPassword
    );
    this.router.put(
      `${this.path}/resend-password-otp`,
      validate(userValidation.resendPasswordOtp),
      this.resendPasswordOtp
    );
    this.router.put(
      `${this.path}/verify-password-otp`,
      validate(userValidation.verifyPasswordOtp),
      this.verifyForgetPasswordOtp
    );
    this.router.put(
      `${this.path}/reset-password`,
      verifyToken,
      validate(userValidation.resetPassword),
      this.resetPassword
    );
  }
}

export default UserController;
