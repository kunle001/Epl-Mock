import { app } from "./app";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { redisService } from "./shared/utils/redis";
import { loadEnvVariables, PORT } from "./config/env.config";

dotenv.config();

// check that all env variables a set
loadEnvVariables();

// Connect to your database
connectDB();

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Gracefully handle server termination
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function shutdown() {
  console.log("Shutting down server...");

  // Close Redis connection
  await redisService.disconnect().then(() => {
    console.log("redis connection closed");
  });

  // Close HTTP server
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
}
