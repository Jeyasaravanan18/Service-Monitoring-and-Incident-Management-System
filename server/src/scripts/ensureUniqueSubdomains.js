import mongoose from "mongoose";
import env from "../config/env.js";
import { StatusPageConfig } from "../models/index.js";
import crypto from "node:crypto";

async function run() {
  if (!env.mongoUri) {
    console.error("MONGO_URI not found");
    process.exit(1);
  }

  await mongoose.connect(env.mongoUri);
  console.log("Connected to MongoDB");

  const configs = await StatusPageConfig.find({});
  const seen = new Set();
  let updatedCount = 0;

  for (const config of configs) {
    if (seen.has(config.subdomain)) {
      const suffix = crypto.randomBytes(3).toString("hex");
      config.subdomain = `${config.subdomain}-${suffix}`;
      await config.save();
      updatedCount++;
      seen.add(config.subdomain);
    } else {
      seen.add(config.subdomain);
    }
  }

  // Ensure indexes are built
  await StatusPageConfig.syncIndexes();

  console.log(`Migration complete. Deduplicated ${updatedCount} subdomains.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
