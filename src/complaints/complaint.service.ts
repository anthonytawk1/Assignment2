import { Document, Types } from 'mongoose';
import ComplaintModel from './complaint.model';
import errorCode from '../configs/error-codes';
import UserService from '../auth/users/user.service'
import mongoose from 'mongoose';
const userServiceInstance = new UserService();
interface Complaint {
    title: string;
    description: string;
    category: [string];
    createdBy: string;
}

class ComplaintService {

    async addComplaint(complaint: Complaint, userId: string) {
        try {
            const existingComplaint = await ComplaintModel.findOne({
                title: complaint.title,
            });

            if (existingComplaint) {
                throw new Error(errorCode.conflict.message);
            }

            complaint.createdBy = userId;
            const newComplaint = await new ComplaintModel(complaint).save();
            return newComplaint;
        } catch (error) {
            throw new Error(errorCode.internalServerError.message)
        }
    }

    async getComplaintByUserId(userId: string, page: number, pageSize: number) {
        try {
            const skip = (page - 1) * pageSize;
            const complaints = await ComplaintModel.find({ createdBy: userId })
                .skip(skip)
                .limit(pageSize);

            if (complaints.length === 0) {
                throw new Error(errorCode.notFound.message);
            }

            return complaints;
        } catch (error) {
            throw new Error(errorCode.internalServerError.message)
        }

    }
    
    async getUserComplaintById(userId: string, _id: string) {
        try {
            const complaints = await ComplaintModel.findOne({ createdBy: userId, _id })

            if (!complaints) {
                throw new Error(errorCode.notFound.message);
            }

            return complaints;
        } catch (error) {
            throw new Error(errorCode.internalServerError.message)
        }

    }

    async getComplaintById(_id: string) {
        try {
            const complaint = await ComplaintModel.findById(_id);

            if (!complaint) {
                console.log(errorCode.notFound.message);
                throw new Error(errorCode.notFound.message);
            }

            return complaint;
        } catch (error) {
            throw new Error(errorCode.internalServerError.message)
        }
    }

    async updateComplaintStatus(complaintId: string, newStatus: string) {
        try {
            const _id = new mongoose.Types.ObjectId(complaintId);
            const updatedStatus = { status: newStatus };

            const complaint = await ComplaintModel.findOneAndUpdate(
                { _id },
                updatedStatus,
                { new: true }
            );

            if (!complaint) {
                console.log(errorCode.notFound.message);
                throw new Error(errorCode.notFound.message);
            }

            return complaint;
        } catch (error) {
            throw new Error(errorCode.internalServerError.message)
        }
    }

    async getUsersComplaints(page: number, pageSize: number, status?: string, userId?: string) {
        try {
            const skip = (page - 1) * pageSize;

            let query: any = {};

            if (status) {
                query.status = status;
            }

            if (userId) {
                query.createdBy = userId;
            }
            const complaints = await ComplaintModel.find(query)
                .sort({ createdAt: 'desc' })
                .skip(skip)
                .limit(pageSize);

            if (complaints.length === 0) {
                throw new Error(errorCode.notFound.message);
            }

            return complaints;
        } catch (error) {
            throw new Error(errorCode.internalServerError.message)
        }
    }
}

export default ComplaintService;
