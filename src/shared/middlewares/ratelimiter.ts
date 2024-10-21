import rateLimit from "express-rate-limit";
import { REQUEST_PER_MINUTE } from "../../config/env.config";

export const rateLimiter = () => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: Number(REQUEST_PER_MINUTE),
    message: "Too many requests from this IP, please try again after a minute",
    headers: true, // Send rate limit info in the response headers
  });
};
