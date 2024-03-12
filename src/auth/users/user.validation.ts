import Joi from "joi";

export const userValidation = {
  signup: {
    body: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      isAdmin: Joi.boolean().default(false),
      isVip: Joi.boolean().default(false),
    }),
  },
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  },
  changePassword: {
    body: Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
    }),
  },
  forgetPassword: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },
  resendPasswordOtp: {
    body: Joi.object({
      email: Joi.string().email().required(),
      verificationToken: Joi.string().required(),
    }),
  },
  verifyPasswordOtp: {
    body: Joi.object({
      otp: Joi.string().required(),
      verificationToken: Joi.string().required(),
    }),
  },
  resetPassword: {
    body: Joi.object({
      newPassword: Joi.string().required(),
    }),
  },
};

export default userValidation;
