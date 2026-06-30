import mongoose from "mongoose";

const serviceDependencySchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true, index: true },
    dependsOnServiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true, index: true },
    relationType: { type: String, default: "upstream" },
  },
  { timestamps: true }
);

export default mongoose.models.ServiceDependency || mongoose.model("ServiceDependency", serviceDependencySchema);
