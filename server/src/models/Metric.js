import mongoose from "mongoose";

const metricSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true, index: true },
    name: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, default: "" },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Metric || mongoose.model("Metric", metricSchema);
