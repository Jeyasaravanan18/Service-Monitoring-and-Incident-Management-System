import mongoose from "mongoose";
import env from "../config/env.js";
import { Service } from "../models/index.js";
import { encrypt } from "../utils/crypto.js";

async function run() {
  if (!env.mongoUri) {
    console.error("MONGO_URI not found");
    process.exit(1);
  }

  await mongoose.connect(env.mongoUri);
  console.log("Connected to MongoDB");

  const services = await Service.find({ apiKey: { $exists: true, $ne: "" } });
  let updatedCount = 0;

  for (const service of services) {
    if (!service.apiKey.startsWith("v1:")) {
      service.apiKey = encrypt(service.apiKey);
      await service.save();
      updatedCount++;
    }
  }

  console.log(`Migration complete. Updated ${updatedCount} services.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
