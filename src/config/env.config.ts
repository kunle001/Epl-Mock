import dotenv from "dotenv";
import { UserPayload } from "../shared/utils/validators";

export const JWT_SECRET = process.env.JWT_SECRET || "testsecret";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
export const REDIS_PASSWORD =
  process.env.REDIS_PASSWORD || "WIceaDIDTv66a5MZQKT5PtiPoIyk8h7U";
export const REDIS_HOST =
  process.env.JWT_SECRET ||
  "redis-16644.c9.us-east-1-2.ec2.redns.redis-cloud.com";
export const REDIS_PORT = process.env.REDIS_PORT || "16644";
export const DB_URL = process.env.DB_URL;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = process.env.PORT || "3000";
export const REQUEST_PER_MINUTE = process.env.REQUEST_PER_MINUTE || 50;

const requiredEnvVariables = [
  "DB_URL",
  "PORT",
  "NODE_ENV",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
];

// Load environment variables from the .env file
export const loadEnvVariables = (): void => {
  const result = dotenv.config();

  if (result.error) {
    console.error("Error loading environment variables from .env file");
    process.exit(1);
  }

  // Check if each required environment variable is set
  requiredEnvVariables.forEach((envVar) => {
    const value = process.env[envVar];
    if (!value) {
      console.error(`Environment variable ${envVar} is not set.`);
      process.exit(1);
    }
  });

  console.log("All required environment variables are set successfully.");
};
