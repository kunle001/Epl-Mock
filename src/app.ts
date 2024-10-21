import express from "express";
import dotenv from "dotenv";
import "express-async-errors";
import bodyParser from "body-parser";
import AppError from "./shared/utils/appError";
import { errorController } from "./controllers/errorhandler.controller";
import { AllRoutes } from "./routes";
import { currentUser } from "./shared/middlewares/authMiddleware";
import { rateLimiter } from "./shared/middlewares/ratelimiter";
import { corsMiddleware } from "./shared/middlewares/cors";

const app = express();
dotenv.config();

// Rate limiting middleware
const limiter = rateLimiter();

// Apply the rate limiter to all API routes
app.use("/api", limiter);

app.use(bodyParser.json());

app.use(corsMiddleware());

app.use(currentUser);

app.use("/api/v1/", AllRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Page ${req.originalUrl} is not found`, 404));
});

app.use(errorController);

// Export app
export { app };
