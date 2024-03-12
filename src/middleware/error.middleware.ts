import { Request, Response, NextFunction } from "express";
import { ValidationError } from "express-validation";

function errorHandlerMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof ValidationError) {
    res.status(400).send(error);
  } else {
    console.log(error);

    const statusCode: number = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
}

export default errorHandlerMiddleware;
