import { Router } from "express";
import authRoutes from "./authRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import serviceRoutes from "./serviceRoutes.js";
import alertRoutes from "./alertRoutes.js";
import incidentRoutes from "./incidentRoutes.js";
import logRoutes from "./logRoutes.js";
import aiRoutes from "./aiRoutes.js";
import workspaceRoutes from "./workspaceRoutes.js";
import teamRoutes from "./teamRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import auditRoutes from "./auditRoutes.js";
import maintenanceRoutes from "./maintenanceRoutes.js";
import integrationRoutes from "./integrationRoutes.js";
import sloRoutes from "./sloRoutes.js";
import statusRoutes from "./statusRoutes.js";
import viewRoutes from "./viewRoutes.js";
import apiKeyRoutes from "./apiKeyRoutes.js";
import deploymentRoutes from "./deploymentRoutes.js";
import metricsRoutes from "./metricsRoutes.js";
import dependencyRoutes from "./dependencyRoutes.js";
import escalationRoutes from "./escalationRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/services", serviceRoutes);
router.use("/alerts", alertRoutes);
router.use("/incidents", incidentRoutes);
router.use("/logs", logRoutes);
router.use("/ai", aiRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/teams", teamRoutes);
router.use("/notifications", notificationRoutes);
router.use("/audit", auditRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/integrations", integrationRoutes);
router.use("/slo", sloRoutes);
router.use("/status", statusRoutes);
router.use("/views", viewRoutes);
router.use("/api-keys", apiKeyRoutes);
router.use("/deployments", deploymentRoutes);
router.use("/metrics", metricsRoutes);
router.use("/dependencies", dependencyRoutes);
router.use("/escalation-policies", escalationRoutes);

router.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

export default router;
