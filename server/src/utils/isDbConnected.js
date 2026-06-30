import mongoose from "mongoose";

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
