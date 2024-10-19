import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { UserPayload } from "../utils/validators";
import AppError from "../utils/appError";
import jwt from "jsonwebtoken";
import { redisService } from "../utils/redis";

export const currentUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace("Bearer ", "");

    // Decode the token to extract user info
    const decoded = jwt.decode(token) as UserPayload;
    if (!decoded) {
      return next(new AppError("Invalid token", 401));
    }

    // Fetch the token from Redis using the user ID
    const redisToken = await redisService.get(decoded.id);

    // Check if the token from Redis matches the one in the request
    if (!redisToken || redisToken !== token) {
      return next(new AppError("Invalid or expired session", 401));
    }

    // Attach the user payload to req.currentUser
    req.currentUser = decoded;

    next();
  }
);

export const requireAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      throw new AppError("Please login", 403);
    }
    next();
  }
);

export const RestrictAccessto = (roles: string[]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.currentUser!.role)) {
      throw new AppError("You cannot access this action", 403);
    }

    next();
  });

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}
