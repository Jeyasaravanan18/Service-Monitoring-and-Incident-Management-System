import mongoose from "mongoose";

const accountTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["email-verification", "password-reset"], required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.AccountToken || mongoose.model("AccountToken", accountTokenSchema);
