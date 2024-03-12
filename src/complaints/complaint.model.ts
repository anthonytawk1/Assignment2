import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import config from '../configs/config';


interface Complaint {
    title: string,
    description: string,
    categories: [string],
    createdBy: Object,
    status : string
}

interface ComplaintDocument extends Complaint, Document { }

const complaintSchema: Schema<ComplaintDocument> = new Schema(
  {
    title: String,
    description: String,
    categories: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: config.modelNames.user,
      },
    status: {
        type: String,
        default: "pending"
    }
  },
  { timestamps: true }
);

const ComplaintModel: Model<ComplaintDocument> = mongoose.model<ComplaintDocument>(
  config.modelNames.complaint,
  complaintSchema
);

export default ComplaintModel;
