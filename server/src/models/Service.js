import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    url: { type: String, required: true },
    environment: { type: String, enum: ["dev", "staging", "prod"], default: "prod" },
    tags: [{ type: String }],
    maintenanceMode: { type: Boolean, default: false },
    expectedKeyword: { type: String, default: "" },
    customHeaders: { type: Object, default: {} },
    apiKey: { type: String, default: "" },
    checkIntervalMinutes: { type: Number, default: 5 },
    failureCount: { type: Number, default: 0 },
    lastStatusCode: { type: Number, default: 0 },
    lastResponseTimeMs: { type: Number, default: 0 },
    lastCheckSummary: { type: String, default: "" },
    uptimePercentage: { type: Number, default: 100 },
    avgLatencyMs: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0 },
    healthStatus: { type: String, enum: ["healthy", "degraded", "critical"], default: "healthy" },
    latencyHistory: [{ type: Number }],
    lastCheckedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Service || mongoose.model("Service", serviceSchema);
