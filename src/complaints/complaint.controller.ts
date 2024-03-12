import express, { Request, Response } from 'express';
import ComplaintService from './complaint.service';
import errors from '../configs/error-messages';
import complaintValidation from './complaint.validation';
import { validate } from 'express-validation';
import errorCode  from '../configs/error-codes';
import {verifyToken, checkAdmin} from '../middleware/auth.middleware';
import CustomRequest from '../utils/customRequest'

class ComplaintController {
    public path = '/complaint';
    public adminPath = '/admin';
    public router = express.Router();
    private complaintService: ComplaintService;
    
    constructor() {
        this.complaintService = new ComplaintService();
        this.initializeRoutes();
    }
    
    public addComplaint = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const userId: string = req.userId || 'defaultUserId'
      const result = await this.complaintService.addComplaint(req.body, userId);
      res.send(result);
    } catch (error) {
      if (error instanceof Error && error.message === errorCode.conflict.message) {
        res.status(errorCode.conflict.statusCode).send(errors.categoryAlreadyExists);
      } else if (error instanceof Error && error.message === errorCode.notFound.message) {
        res.status(errorCode.notFound.statusCode).send(errors.userNotFound);
      } else {
        res.status(errorCode.internalServerError.statusCode).send(errorCode.internalServerError.message);
      }
    }
  }

  public getComplaintByUserId = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const userId: string = req.userId || 'defaultUserId'
        const page: number = Number(req.params.page);
        const pageSize: number = Number(req.params.pageSize);
      const result = await this.complaintService.getComplaintByUserId(userId, page, pageSize);
      res.send(result);
    } catch (error) {
      if (error instanceof Error && error.message === errorCode.conflict.message) {
        res.status(errorCode.conflict.statusCode).send(errors.categoryAlreadyExists);
      } else if (error instanceof Error && error.message === errorCode.notFound.message) {
        res.status(errorCode.notFound.statusCode).send(errors.categoryNotFound);
      } else {
        res.status(errorCode.internalServerError.statusCode).send(errorCode.internalServerError.message);
      }
    }
  }

  public getUserComplaintById = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const userId: string = req.userId || 'defaultUserId'
        const id = req.params.id
      const result = await this.complaintService.getUserComplaintById(userId, id);
      res.send(result);
    } catch (error) {
      if (error instanceof Error && error.message === errorCode.notFound.message) {
        res.status(errorCode.notFound.statusCode).send(errors.categoryNotFound);
      } else {
        res.status(errorCode.internalServerError.statusCode).send(errorCode.internalServerError.message);
      }
    }
  }

  public getComplaintById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id
      const result = await this.complaintService.getComplaintById(id);
      res.send(result);
    } catch (error) {
      if (error instanceof Error && error.message === errorCode.notFound.message) {
        res.status(errorCode.notFound.statusCode).send(errors.categoryNotFound);
      } else {
        res.status(errorCode.internalServerError.statusCode).send(errorCode.internalServerError.message);
      }
    }
  }

  public getUsersComplaints = async (req: Request, res: Response): Promise<void> => {
    try {
      const page: number = Number(req.params.page);
      const pageSize: number = Number(req.params.pageSize);
      const status: string | undefined = req.query.status as string;
      const userId: string | undefined = req.query.userId as string;
  
      const result = await this.complaintService.getUsersComplaints(page, pageSize, status, userId);
      res.send(result);
    } catch (error) {
      if (error instanceof Error && error.message === errorCode.notFound.message) {
        res.status(errorCode.notFound.statusCode).send(errors.categoryNotFound);
      } else {
        res.status(errorCode.internalServerError.statusCode).send(errorCode.internalServerError.message);
      }
    }
  }

  public updateComplaintStatus = async (req:Request, res:Response): Promise<void> => {
    try{
        const complaintId: string = req.params.id;
        const newStatus: string = req.body.status;
        const result = await this.complaintService.updateComplaintStatus(complaintId, newStatus);
        res.send(result);
    }catch (error){
        if (error instanceof Error && error.message === errorCode.notFound.message) {
            res.status(errorCode.notFound.statusCode).send(errors.categoryNotFound);
          } else {
            res.status(errorCode.internalServerError.statusCode).send(errorCode.internalServerError.message);
          }
    }
  }
  

  public initializeRoutes(): void {
    this.router.post(
      `${this.path}`,
      verifyToken,
      validate(complaintValidation.addComplaint),
      this.addComplaint
    );
    this.router.get(
      `${this.path}/:page/:pageSize`,
      verifyToken,
      this.getComplaintByUserId
    );
    this.router.get(
    `${this.path}/:id`,
    verifyToken,
    this.getUserComplaintById
    );
    this.router.get(
    `${this.adminPath}${this.path}/:id`,
    verifyToken,
    checkAdmin,
    this.getComplaintById
    );
    this.router.get(
    `${this.adminPath}${this.path}/:page/:pageSize`,
    verifyToken,
    checkAdmin,
    this.getUsersComplaints
    );
    this.router.put(
    `${this.adminPath}${this.path}/:id`,
    verifyToken,
    checkAdmin,
    validate(complaintValidation.changeComplaintStatus),
    this.updateComplaintStatus
    );
  }
}

export default ComplaintController;
