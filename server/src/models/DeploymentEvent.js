import mongoose from "mongoose";

const deploymentEventSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true, index: true },
    title: { type: String, required: true },
    environment: { type: String, enum: ["dev", "staging", "prod"], default: "prod" },
    sha: { type: String, default: "" },
    deployedAt: { type: Date, required: true },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.DeploymentEvent || mongoose.model("DeploymentEvent", deploymentEventSchema);
