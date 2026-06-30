import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    workspaceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Workspace" }],
    revokedAt: Date,
    replacedByTokenHash: { type: String, default: "" },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.RefreshToken || mongoose.model("RefreshToken", refreshTokenSchema);
