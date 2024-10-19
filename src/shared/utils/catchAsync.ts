import { NextFunction, Request, Response } from "express";

// Define the type for the asynchronous function
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

// Middleware function to catch asynchronous errors
export const catchAsync = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
