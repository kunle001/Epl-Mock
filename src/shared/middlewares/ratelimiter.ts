import rateLimit from "express-rate-limit";

export const rateLimiter = () => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: Number(process.env.REQUEST_PER_MINUTE) || 50,
    message: "Too many requests from this IP, please try again after a minute",
    headers: true, // Send rate limit info in the response headers
  });
};
