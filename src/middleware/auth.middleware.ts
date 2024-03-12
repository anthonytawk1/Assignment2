import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import config from '../configs/config';
import CustomRequest from '../utils/customRequest'


export const verifyToken = (req: CustomRequest, res: Response, next: NextFunction): any => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Token missing' });
  }

  jwt.verify(token, config.jwt.accessToken as string, (err, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    req.userId = decoded.userId; // Assuming userId is present in the token payload
    req.isAdmin = decoded.isAdmin
    next();
  });
};

export const checkAdmin = (req: CustomRequest, res: Response, next: NextFunction): any => {
  const { isAdmin } = req;

  if (!isAdmin) {
    return res.status(403).json({ message: 'Forbidden: User is not an admin' });
  }

  next();
};