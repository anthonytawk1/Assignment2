import mongoose, { Schema, Document, Model } from "mongoose";
import config from "../../../configs/config";

interface Otp {
    otpType: string;
    otp: string;
    userId: mongoose.Types.ObjectId;
    verificationToken: string;
    attemptsLeft: number;
    expiryDate: Date;
}

interface OtpDocument extends Otp, Document { }

const otpSchema: Schema<OtpDocument> = new Schema(
    {
        otpType: String,
        otp: String,
        userId: {
            type: Schema.Types.ObjectId
        },
        verificationToken: String,
        attemptsLeft: {
            type: Number,
            default: config.auth.maxOtpRequests
        },
        expiryDate: Date

    },
    { timestamps: true }
);

const OtpModel: Model<OtpDocument> = mongoose.model<OtpDocument>(
    config.modelNames.otp,
    otpSchema
);

export default OtpModel;