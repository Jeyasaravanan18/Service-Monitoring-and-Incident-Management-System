import mongoose from "mongoose";
import env from "./env.js";
import logger from "./logger.js";

export async function connectDb() {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(env.mongoUri);
  logger.info("Connected to MongoDB");
  return { connected: true };
}
