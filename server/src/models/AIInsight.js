import mongoose from "mongoose";

const aiInsightSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident" },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    evidence: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.AIInsight || mongoose.model("AIInsight", aiInsightSchema);
