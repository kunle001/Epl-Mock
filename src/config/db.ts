import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_URL } from "./env.config";

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(DB_URL as string, {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
    });
    console.log("Database Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
