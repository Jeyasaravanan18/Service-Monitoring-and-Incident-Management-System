/**
 * One-off script to delete a user by email from the production database.
 * Usage: node src/scripts/deleteUser.js sarjeya18@gmail.com
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const candidates = [
  path.resolve(cwd, ".env"),
  path.resolve(cwd, "..", ".env"),
];
const envPath = candidates.find((c) => fs.existsSync(c));
dotenv.config(envPath ? { path: envPath } : undefined);

const MONGO_URI = process.env.MONGO_URI || process.argv[2];
const EMAIL = process.argv[2] || process.argv[3];

if (!MONGO_URI) {
  console.error("MONGO_URI is required");
  process.exit(1);
}
if (!EMAIL || !EMAIL.includes("@")) {
  console.error("Usage: node src/scripts/deleteUser.js <email>");
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
const db = mongoose.connection.db;

const result = await db.collection("users").deleteOne({ email: EMAIL.toLowerCase() });
const workspaceResult = await db.collection("workspaces").deleteMany({ 
  ownerId: { $exists: true }
});

if (result.deletedCount > 0) {
  console.log(`✅ Deleted user: ${EMAIL}`);
} else {
  console.log(`⚠️  No user found with email: ${EMAIL}`);
}

await mongoose.disconnect();
process.exit(0);
