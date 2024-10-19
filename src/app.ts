import express from "express";
import dotenv from "dotenv";
import "express-async-errors";
import bodyParser from "body-parser";
import cors from "cors";
import AppError from "./shared/utils/appError";
import { errorController } from "./controllers/errorhandler.controller";
import { AllRoutes } from "./routes";
import { currentUser } from "./middlewares/authMiddleware";
import rateLimit from "express-rate-limit";

const app = express();
dotenv.config();
// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: Number(process.env.REQUEST_PER_MINUTE) || 50,
  message: "Too many requests from this IP, please try again after a minute",
  headers: true, // Send rate limit info in the response headers
});

// Apply the rate limiter to all API routes
app.use("/api", limiter);

app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(currentUser);

app.use("/api/v1/", AllRoutes);
app.all("*", (req, res, next) => {
  next(new AppError(`Page ${req.originalUrl} is not found`, 404));
});

app.use(errorController);

// Export app
export { app };
