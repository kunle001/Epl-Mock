import { Request, Response, NextFunction } from "express";
import Joi, { object } from "joi";
import AppError from "../shared/utils/appError";
import { NODE_ENV } from "../config/env.config";

// FUNCTION FOR HANDLING TOKEN AND MONGOOSE ERRORS
const handleDuplicateErrorDB = (error: any) => {
  const message = `${
    Object.values(error.keyValue)[0]
  } is taken already, please try another name`;
  return new AppError(message, 400);
};

const handleCastErrorDB = (error: any) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleValidationError = (error: any) => {
  // const message = `${error.errors}, is either not provided or has the wrong value`;
  return new AppError(error, 400);
};

const handleJWTError = (error: any) => {
  const message = "Please Log in";
  return new AppError(message, 400);
};

const handleTokenExpired = (error: any) => {
  const message = "Token Expired , Login again";
  return new AppError(message, 401);
};

const handleValidation = (error: any) => {
  const message = error;
  return new AppError(message, 400);
};

const sendErrorDev = (err: AppError, res: Response) => {
  // development error:
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendProdErr = (err: AppError, res: Response) => {
  // Error to be sent to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Logging the error so the developer can see it, even when running in Production NODE_ENV
    console.error("ERROR💥", err);
    // Sending a friendlier error to client
    res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};

export const errorController = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (NODE_ENV === "production") {
    let error: AppError;
    const t_e = String(err.statusCode);
    console.log(t_e);
    if (err.code === 11000) {
      error = handleDuplicateErrorDB(err);
    } else if (err.name === "CastError") {
      error = handleCastErrorDB(err);
    } else if (err.name === "ValidationError") {
      error = handleValidationError(err);
    } else if (err.name === "JsonWebTokenError") {
      error = handleJWTError(err);
    } else if (err.name === "TokenExpiredError") {
      error = handleTokenExpired(err);
    } else if (err instanceof Joi.ValidationError) {
      error = handleValidation(err);
    } else {
      console.log(err, String(err.name));
      error = new AppError("something went wrong", 400);
    }

    sendProdErr(error, res);
  } else {
    sendErrorDev(err, res);
  }
};
