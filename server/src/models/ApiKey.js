import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    name: { type: String, required: true },
    keyHash: { type: String, required: true },
    scopes: [{ type: String }],
    lastUsedAt: Date,
    revokedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.ApiKey || mongoose.model("ApiKey", apiKeySchema);
