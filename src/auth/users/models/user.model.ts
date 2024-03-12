import mongoose, { Schema, Document, Model } from "mongoose";
import config from "../../../configs/config";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  isVip?: boolean;
  forgetPasswordOtpAttemptsLeft: number;
  passwordAttemptsLeft: number;
  isLocked?: boolean;
}

interface UserDocument extends User, Document {}

const userSchema: Schema<UserDocument> = new Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVip: {
      type: Boolean,
      default: false,
    },
    forgetPasswordOtpAttemptsLeft: {
      type: Number,
      default: 10,
    },
    passwordAttemptsLeft: {
        type: Number,
      default: 10,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const UserModel: Model<UserDocument> = mongoose.model<UserDocument>(
  config.modelNames.user,
  userSchema
);

export default UserModel;
