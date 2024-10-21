import dotenv from "dotenv";

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
