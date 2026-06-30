import bcrypt from "bcryptjs";
import { connectDb } from "../config/db.js";
import {
  AIInsight,
  Alert,
  AlertRule,
  AuditLog,
  DeploymentEvent,
  EscalationPolicy,
  Incident,
  LogEntry,
  MaintenanceWindow,
  Metric,
  Notification,
  SavedView,
  Service,
  ServiceDependency,
  SLOTarget,
  StatusPageConfig,
  Team,
  User,
  Workspace,
  ApiKey,
} from "../models/index.js";

await connectDb();

await Promise.all([
  AIInsight.deleteMany({}),
  Alert.deleteMany({}),
  AlertRule.deleteMany({}),
  ApiKey.deleteMany({}),
  AuditLog.deleteMany({}),
  DeploymentEvent.deleteMany({}),
  EscalationPolicy.deleteMany({}),
  Incident.deleteMany({}),
  LogEntry.deleteMany({}),
  MaintenanceWindow.deleteMany({}),
  Metric.deleteMany({}),
  Notification.deleteMany({}),
  SavedView.deleteMany({}),
  Service.deleteMany({}),
  ServiceDependency.deleteMany({}),
  SLOTarget.deleteMany({}),
  StatusPageConfig.deleteMany({}),
  Team.deleteMany({}),
  User.deleteMany({}),
  Workspace.deleteMany({}),
]);

const workspace = await Workspace.create({
  name: "Acme Infra",
  slug: "acme-infra",
  plan: "business",
});

const user = await User.create({
  email: "admin@acme.io",
  passwordHash: await bcrypt.hash("Password123!", 12),
  name: "Ava Admin",
  roles: ["super-admin", "admin"],
  workspaceIds: [workspace._id],
});

workspace.ownerId = user._id;
await workspace.save();

const team = await Team.create({
  workspaceId: workspace._id,
  name: "Platform",
  memberIds: [user._id],
});

const service = await Service.create({
  workspaceId: workspace._id,
  teamId: team._id,
  ownerId: user._id,
  name: "Billing API",
  url: "https://api.acme.io/health",
  environment: "prod",
  tags: ["critical", "payments"],
  uptimePercentage: 98.72,
  avgLatencyMs: 241,
  errorRate: 0.03,
  healthStatus: "degraded",
});

await AlertRule.create({
  workspaceId: workspace._id,
  serviceId: service._id,
  name: "Latency threshold",
  type: "latency",
  threshold: 200,
  severity: "high",
  notifyChannels: ["in-app", "email"],
});

const incident = await Incident.create({
  workspaceId: workspace._id,
  serviceId: service._id,
  title: "Billing API latency spike",
  status: "investigating",
  severity: "high",
  summary: "Synthetic demo incident seeded for the dashboard.",
  responderIds: [user._id],
});

await LogEntry.create({
  workspaceId: workspace._id,
  serviceId: service._id,
  incidentId: incident._id,
  severity: "error",
  message: "Upstream dependency timeout detected",
  environment: "prod",
  metadata: { traceId: "demo-trace-01" },
});

await Notification.create({
  workspaceId: workspace._id,
  userId: user._id,
  type: "incident.created",
  title: "Billing API latency spike",
  body: "The demo incident has been seeded and is visible in the workspace.",
});

await DeploymentEvent.create({
  workspaceId: workspace._id,
  serviceId: service._id,
  title: "Billing API release 1.42.0",
  environment: "prod",
  sha: "a1b2c3d",
  deployedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  metadata: { version: "1.42.0" },
});

await Metric.create({
  workspaceId: workspace._id,
  serviceId: service._id,
  name: "requests_per_minute",
  value: 1480,
  unit: "rpm",
  recordedAt: new Date(),
  tags: { source: "demo" },
});

await MaintenanceWindow.create({
  workspaceId: workspace._id,
  serviceId: service._id,
  name: "Planned database migration",
  startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  endsAt: new Date(Date.now() + 26 * 60 * 60 * 1000),
  reason: "Demo maintenance window",
  active: true,
});

await EscalationPolicy.create({
  workspaceId: workspace._id,
  name: "Primary platform policy",
  steps: [
    { delayMinutes: 10, targetType: "team", targetId: team._id.toString() },
    { delayMinutes: 30, targetType: "user", targetId: user._id.toString() },
  ],
  active: true,
});

await StatusPageConfig.create({
  workspaceId: workspace._id,
  title: "Acme Status",
  subdomain: "acme-status",
  public: true,
  serviceIds: [service._id],
});

await SLOTarget.create({
  workspaceId: workspace._id,
  serviceId: service._id,
  name: "Billing API availability",
  objective: 99.9,
  windowDays: 30,
  errorBudgetBurnRate: 1.4,
});

await SavedView.create({
  workspaceId: workspace._id,
  userId: user._id,
  name: "Critical incidents",
  type: "incidents",
  filters: { severity: "critical", status: "open" },
  pinned: true,
});

await ApiKey.create({
  workspaceId: workspace._id,
  name: "Metrics ingestor",
  keyHash: "demo-key-hash",
  scopes: ["metrics:write", "logs:write"],
  lastUsedAt: new Date(),
});

await ServiceDependency.create({
  workspaceId: workspace._id,
  serviceId: service._id,
  dependsOnServiceId: service._id,
  relationType: "placeholder",
});

await AIInsight.create({
  workspaceId: workspace._id,
  serviceId: service._id,
  incidentId: incident._id,
  type: "incident-summary",
  title: "Demo AI summary",
  body: "The seeded incident reflects a latency spike and related dependency timeout.",
  evidence: { logs: 1, alerts: 1 },
});

await AuditLog.create({
  workspaceId: workspace._id,
  actorId: user._id,
  action: "seed.demo",
  resourceType: "workspace",
  resourceId: workspace._id.toString(),
  details: { note: "Seeded demo environment" },
});

console.log("Seed complete");
