import mongoose from "mongoose";

const checkResultSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    statusCode: { type: Number, required: true },
    latencyMs: { type: Number, required: true },
    ok: { type: Boolean, required: true },
    keywordMatched: { type: Boolean, default: true },
    errorMessage: { type: String, default: "" },
    responseSnippet: { type: String, default: "" },
    attempt: { type: Number, default: 1 },
    checkedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index for service history queries (most common access pattern)
checkResultSchema.index({ serviceId: 1, checkedAt: -1 });

// TTL index — auto-delete check results older than 30 days
checkResultSchema.index({ checkedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.models.CheckResult || mongoose.model("CheckResult", checkResultSchema);
