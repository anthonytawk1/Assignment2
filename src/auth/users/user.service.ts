import userModel from "../users/models/user.model";
import otpModel from "../users/models/otp.model";
import errorCodes from "../../configs/error-codes";
import emailConfig from "../../configs/email";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../configs/config";
import { sendEmail } from "../../services/notification.service";
import { generateToken } from "../../utils/generateToken";
import { OTP_TYPE } from "../../enums/otp-type";
import moment from "moment";
interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  isVip?: boolean;
}

class UserService {
  async createNewUser(user: User) {
    const { firstName, lastName, email, password, isAdmin, isVip } = user;
    const hashedPass = await bcrypt.hash(password, 12);
    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password: hashedPass,
      isAdmin,
      isVip,
    });
    return await newUser.save();
  }

  async generateOTP() {
    return Math.random().toString().slice(2, 8);
  }

  async lockUser(userId: string) {
    return userModel.updateOne({ _id: userId }, { $set: { isLocked: true } });
  }

  async signup(user: User) {
    const userFound = await userModel.findOne({ email: user.email });
    if (userFound) {
      throw new Error(errorCodes.conflict.message);
    } else {
      await this.createNewUser(user);
    }
  }

  async login(user: User) {
    const { email, password } = user;
    const userFound = await userModel.findOne({ email });
    if (!userFound) {
      throw new Error(errorCodes.unauthorized.message);
    }
    const isEqual = await bcrypt.compare(password, userFound.password);
    if (!isEqual) {
      userFound.passwordAttemptsLeft -= 1;
      await userFound.save();
      throw new Error(errorCodes.unauthorized.message);
    }

    if (userFound.isLocked) {
      throw new Error(errorCodes.unauthorized.message);
    }

    if (userFound.passwordAttemptsLeft === 0) {
      await this.lockUser(userFound._id);
      throw new Error(errorCodes.unauthorized.message);
    }

    const token = jwt.sign(
      {
        email: userFound.email,
        userId: userFound._id.toString(),
        isAdmin: userFound.isAdmin,
      },
      config.jwt.accessToken as string,
      { expiresIn: "1h" }
    );
    return {
      token,
      userId: userFound._id.toString(),
    };
  }

  async getUserById(_id: string) {
    const user = await userModel.findById(_id);
    if (!user) {
      throw new Error(errorCodes.notFound.message);
    }

    return user;
  }
  async changePassword(
    newPassword: string,
    oldPassword: string,
    userId: string
  ) {
    const user = await userModel.findById(userId);

    if (user) {
      const isEqual = await bcrypt.compare(oldPassword, user.password);
      if (!isEqual) {
        throw new Error(errorCodes.unauthorized.message);
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      user.forgetPasswordOtpAttemptsLeft = 10;
      user.passwordAttemptsLeft = 10;
      const result = await user.save();
      return result;
    }
  }

  async initiateForgotPassword(email: string) {
    const userFound = await userModel.findOne({ email });
    if (!userFound) {
      throw new Error(errorCodes.forbidden.message);
    }

    if (userFound.forgetPasswordOtpAttemptsLeft === 0) {
      await this.lockUser(userFound._id);
      throw new Error(errorCodes.forbidden.message);
    }
    const verificationToken = generateToken(10);
    const otp = await this.generateOTP();
    await otpModel.findOneAndUpdate(
      { userId: userFound._id, otpType: OTP_TYPE.FORGOT_PASSWORD },
      {
        userId: userFound._id,
        verificationToken,
        otpType: OTP_TYPE.FORGOT_PASSWORD,
        otp,
        attemptsLeft: 10,
        expiryDate: moment().add(5, "minutes"),
      },
      { upsert: true }
    );

    sendEmail({
      to: email,
      subject: emailConfig.emails.forgotPassword.subject,
      text: emailConfig.emails.forgotPassword.body.replace("{otp}", otp),
    });

    userFound.forgetPasswordOtpAttemptsLeft -= 1;
    await userFound.save();

    return { verificationToken };
  }

  async resendForgetPasswordOTP(body: any) {
    const { email, verificationToken } = body;
    const userFound = await userModel.findOne({ email });
    if (!userFound) {
      throw new Error(errorCodes.forbidden.message);
    }
    if (userFound.isLocked) {
      throw new Error(errorCodes.forbidden.message);
    }

    if (userFound.forgetPasswordOtpAttemptsLeft === 0) {
      await this.lockUser(userFound._id);
      throw new Error(errorCodes.forbidden.message);
    }

    const otpRecord = await otpModel.findOneAndDelete({
      verificationToken,
      userId: userFound._id,
      otpType: OTP_TYPE.FORGOT_PASSWORD,
    });
    if (!otpRecord) {
      throw new Error(errorCodes.forbidden.message);
    }

    const newVerificationToken = generateToken(10);
    const otp = await this.generateOTP();
    await otpModel.findOneAndUpdate(
      { userId: userFound._id, otpType: OTP_TYPE.FORGOT_PASSWORD },
      {
        userId: userFound._id,
        verificationToken: newVerificationToken,
        otpType: OTP_TYPE.FORGOT_PASSWORD,
        otp,
        attemptsLeft: 10,
        expiryDate: moment().add(5, "minutes"),
      },
      { upsert: true }
    );

    sendEmail({
      to: email,
      subject: emailConfig.emails.forgotPassword.subject,
      text: emailConfig.emails.forgotPassword.body.replace("{otp}", otp),
    });

    userFound.forgetPasswordOtpAttemptsLeft -= 1;
    await userFound.save();

    return { newVerificationToken };
  }

  async verifyForgotPasswordOTP(body: any) {
    const { verificationToken, otp } = body;
    const otpRecord = await otpModel.findOne({
      verificationToken,
      otpType: OTP_TYPE.FORGOT_PASSWORD,
      expiryDate: { $gte: new Date() },
      attemptsLeft: { $gt: 0 },
    });

    if (!otpRecord) {
      throw new Error(errorCodes.forbidden.message);
    }
    //! Deacrese the OTP by 1 each time the user enters an invalid OTP BEFORE UPLOADING
    if (otpRecord.otp === otp) {
      await otpModel.deleteOne({ _id: otpRecord._id });

      await userModel.findOneAndUpdate(
        { _id: otpRecord.userId },
        {
          $set: {
            forgetPasswordOtpAttemptsLeft: 10,
            passwordAttemptsLeft: 10,
          },
        }
      );
      const userFound = await userModel.findById(otpRecord.userId);
      if (!userFound) {
        throw new Error(errorCodes.forbidden.message);
      }
      const token = jwt.sign(
        {
          email: userFound.email,
          userId: userFound._id.toString(),
          isAdmin: userFound.isAdmin,
        },
        config.jwt.accessToken as string,
        { expiresIn: "1h" }
      );
      return {
        token,
      };
    }
  }
  async resetPassword(newPassword: string, userId: string) {
    const userFound = await userModel.findById(userId);
    if (!userFound) {
      throw new Error(errorCodes.forbidden.message);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    userFound.password = hashedPassword;
    userFound.forgetPasswordOtpAttemptsLeft = 10;
    userFound.passwordAttemptsLeft = 10;
    await userFound.save();
  }
}

export default UserService;
