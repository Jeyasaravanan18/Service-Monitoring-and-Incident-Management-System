export const demoWorkspace = {
  _id: "demo-workspace",
  name: "Acme Infra",
  slug: "acme-infra",
  plan: "business",
};

export const demoUser = {
  _id: "demo-user",
  name: "Ava Admin",
  email: "admin@acme.io",
  roles: ["super-admin", "admin"],
  workspaceIds: [demoWorkspace._id],
};

export const demoServices = [
  {
    _id: "svc-1",
    workspaceId: demoWorkspace._id,
    name: "Billing API",
    url: "https://api.acme.io/health",
    environment: "prod",
    tags: ["critical", "payments"],
    maintenanceMode: false,
    expectedKeyword: "ok",
    uptimePercentage: 98.72,
    avgLatencyMs: 241,
    errorRate: 0.03,
    healthStatus: "degraded",
    lastCheckedAt: new Date().toISOString(),
  },
  {
    _id: "svc-2",
    workspaceId: demoWorkspace._id,
    name: "Auth Gateway",
    url: "https://auth.acme.io/health",
    environment: "prod",
    tags: ["auth"],
    maintenanceMode: false,
    expectedKeyword: "ok",
    uptimePercentage: 99.98,
    avgLatencyMs: 61,
    errorRate: 0.001,
    healthStatus: "healthy",
    lastCheckedAt: new Date().toISOString(),
  },
  {
    _id: "svc-3",
    workspaceId: demoWorkspace._id,
    name: "Webhook Relay",
    url: "https://hooks.acme.io/health",
    environment: "staging",
    tags: ["integration"],
    maintenanceMode: false,
    expectedKeyword: "ok",
    uptimePercentage: 99.9,
    avgLatencyMs: 84,
    errorRate: 0.005,
    healthStatus: "healthy",
    lastCheckedAt: new Date().toISOString(),
  },
];

export const demoAlerts = [
  {
    _id: "alert-1",
    workspaceId: demoWorkspace._id,
    serviceId: "svc-1",
    title: "Billing API latency threshold breached",
    severity: "high",
    status: "open",
    summary: "Current latency is above the alert threshold.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "alert-2",
    workspaceId: demoWorkspace._id,
    serviceId: "svc-2",
    title: "Checkout deploy correlated with error burst",
    severity: "medium",
    status: "acknowledged",
    summary: "Deployment marker matched recent error spikes.",
    createdAt: new Date().toISOString(),
  },
];

export const demoIncidents = [
  {
    _id: "inc-1",
    workspaceId: demoWorkspace._id,
    serviceId: "svc-1",
    title: "Billing API latency spike",
    severity: "high",
    status: "investigating",
    summary: "Upstream timeout and retry storm.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "inc-2",
    workspaceId: demoWorkspace._id,
    serviceId: "svc-3",
    title: "Checkout UI error burst",
    severity: "critical",
    status: "monitoring",
    summary: "Likely regression after deploy.",
    createdAt: new Date().toISOString(),
  },
];

export const demoLogs = [
  {
    _id: "log-1",
    workspaceId: demoWorkspace._id,
    serviceId: "svc-1",
    incidentId: "inc-1",
    severity: "error",
    message: "Upstream dependency timeout detected",
    environment: "prod",
    occurredAt: new Date().toISOString(),
  },
  {
    _id: "log-2",
    workspaceId: demoWorkspace._id,
    serviceId: "svc-3",
    incidentId: "inc-2",
    severity: "warn",
    message: "Retry budget increased after deploy marker",
    environment: "staging",
    occurredAt: new Date().toISOString(),
  },
];

export const demoAlertsRules = [
  {
    _id: "rule-1",
    workspaceId: demoWorkspace._id,
    serviceId: "svc-1",
    name: "Latency threshold",
    type: "latency",
    threshold: 200,
    enabled: true,
    severity: "high",
    notifyChannels: ["in-app", "email"],
  },
];

export function buildDemoSession() {
  return {
    user: {
      id: demoUser._id,
      email: demoUser.email,
      name: demoUser.name,
      roles: demoUser.roles,
      workspaceIds: demoUser.workspaceIds,
    },
    accessToken: "demo-token",
    refreshToken: "demo-refresh-token",
  };
}
