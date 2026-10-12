import bcrypt from "bcryptjs";
import {
  AIInsight,
  Alert,
  AlertRule,
  AuditLog,
  CheckResult,
  DeploymentEvent,
  Incident,
  LogEntry,
  Service,
  ServiceDependency,
  SLOTarget,
  User,
  Workspace,
} from "../models/index.js";
import logger from "../config/logger.js";

export async function seedWorkspaceDemoData(workspaceId, ownerId = null) {
  if (!workspaceId) throw new Error("workspaceId is required to seed demo data");

  // Check if services already exist for this workspace to avoid duplicate flood
  const existingCount = await Service.countDocuments({ workspaceId });
  if (existingCount >= 5) {
    return {
      alreadySeeded: true,
      message: "Workspace already contains monitored services.",
      servicesCount: existingCount,
    };
  }

  // 1. Create realistic enterprise services / projects
  const servicesConfig = [
    {
      name: "API Gateway & Edge Router",
      url: "https://httpstat.us/200",
      environment: "prod",
      tags: ["edge", "critical", "gateway", "tier-1"],
      healthStatus: "healthy",
      uptimePercentage: 99.95,
      avgLatencyMs: 42,
      checkIntervalMinutes: 1,
    },
    {
      name: "Auth & Identity Service",
      url: "https://httpstat.us/200",
      environment: "prod",
      tags: ["security", "auth", "jwt", "tier-1"],
      healthStatus: "healthy",
      uptimePercentage: 99.88,
      avgLatencyMs: 58,
      checkIntervalMinutes: 1,
    },
    {
      name: "Stripe Checkout & Billing API",
      url: "https://httpstat.us/200?sleep=1000",
      environment: "prod",
      tags: ["payments", "billing", "external", "tier-2"],
      healthStatus: "degraded",
      uptimePercentage: 96.40,
      avgLatencyMs: 1150,
      checkIntervalMinutes: 1,
    },
    {
      name: "PostgreSQL Primary DB Cluster",
      url: "https://httpstat.us/500",
      environment: "prod",
      tags: ["database", "storage", "critical", "tier-1"],
      healthStatus: "critical",
      uptimePercentage: 88.50,
      avgLatencyMs: 310,
      checkIntervalMinutes: 1,
    },
    {
      name: "Redis Cache & Session Store",
      url: "https://httpstat.us/200",
      environment: "prod",
      tags: ["cache", "in-memory", "fast-path"],
      healthStatus: "healthy",
      uptimePercentage: 99.99,
      avgLatencyMs: 8,
      checkIntervalMinutes: 1,
    },
    {
      name: "Notification & Dispatch Queue",
      url: "https://httpstat.us/200",
      environment: "staging",
      tags: ["workers", "email", "async", "resend"],
      healthStatus: "healthy",
      uptimePercentage: 99.70,
      avgLatencyMs: 35,
      checkIntervalMinutes: 2,
    },
    {
      name: "Search & Vector Indexer",
      url: "https://httpstat.us/200",
      environment: "prod",
      tags: ["search", "ai", "elastic", "embeddings"],
      healthStatus: "healthy",
      uptimePercentage: 99.45,
      avgLatencyMs: 125,
      checkIntervalMinutes: 2,
    },
  ];

  const now = Date.now();
  const createdServices = [];

  for (const cfg of servicesConfig) {
    // Generate realistic 20-point latency history
    const history = [];
    const baseLatency = cfg.avgLatencyMs;
    for (let i = 0; i < 20; i++) {
      if (cfg.healthStatus === "degraded") {
        history.push(Math.round(baseLatency + (Math.random() * 800 - 300)));
      } else if (cfg.healthStatus === "critical") {
        history.push(Math.random() > 0.4 ? 0 : Math.round(baseLatency + Math.random() * 200));
      } else {
        history.push(Math.round(baseLatency + (Math.random() * 16 - 8)));
      }
    }

    const svc = await Service.create({
      workspaceId,
      ownerId,
      name: cfg.name,
      url: cfg.url,
      environment: cfg.environment,
      tags: cfg.tags,
      healthStatus: cfg.healthStatus,
      uptimePercentage: cfg.uptimePercentage,
      avgLatencyMs: cfg.avgLatencyMs,
      checkIntervalMinutes: cfg.checkIntervalMinutes,
      latencyHistory: history,
      lastStatusCode: cfg.healthStatus === "critical" ? 500 : 200,
      lastResponseTimeMs: history[history.length - 1] || baseLatency,
      lastCheckedAt: new Date(now - 30 * 1000),
      lastCheckSummary: cfg.healthStatus === "critical"
        ? "HTTP 500: Database Connection Pool Exhausted"
        : cfg.healthStatus === "degraded"
        ? "HTTP 200: Response time 1,150ms exceeded 500ms SLA"
        : "HTTP 200: Synthetic probe passed",
    });
    createdServices.push(svc);
  }

  // 2. Generate 30 CheckResults per service (total ~210 telemetry records for rich graphs)
  const checksToInsert = [];
  for (const svc of createdServices) {
    for (let i = 30; i >= 0; i--) {
      const timestamp = new Date(now - i * 60 * 1000);
      let ok = true;
      let statusCode = 200;
      let latency = svc.avgLatencyMs + (Math.random() * 20 - 10);

      if (svc.healthStatus === "critical") {
        ok = Math.random() > 0.35;
        statusCode = ok ? 200 : 500;
        latency = ok ? svc.avgLatencyMs : 0;
      } else if (svc.healthStatus === "degraded") {
        latency = svc.avgLatencyMs + Math.random() * 600;
      }

      checksToInsert.push({
        workspaceId,
        serviceId: svc._id,
        statusCode,
        latencyMs: Math.max(1, Math.round(latency)),
        ok,
        errorMessage: ok ? "" : "Connection refused / pool exhausted",
        checkedAt: timestamp,
      });
    }
  }
  await CheckResult.insertMany(checksToInsert);

  // 3. Connect services into a realistic topology (ServiceDependency)
  const apiGateway = createdServices.find((s) => s.name.includes("API Gateway"));
  const authService = createdServices.find((s) => s.name.includes("Auth"));
  const stripeService = createdServices.find((s) => s.name.includes("Stripe"));
  const dbService = createdServices.find((s) => s.name.includes("PostgreSQL"));
  const redisService = createdServices.find((s) => s.name.includes("Redis"));
  const notifService = createdServices.find((s) => s.name.includes("Notification"));
  const searchService = createdServices.find((s) => s.name.includes("Search"));

  const dependencies = [
    { serviceId: apiGateway._id, dependsOnServiceId: authService._id, relationType: "http" },
    { serviceId: apiGateway._id, dependsOnServiceId: stripeService._id, relationType: "http" },
    { serviceId: apiGateway._id, dependsOnServiceId: searchService._id, relationType: "grpc" },
    { serviceId: stripeService._id, dependsOnServiceId: dbService._id, relationType: "tcp" },
    { serviceId: stripeService._id, dependsOnServiceId: redisService._id, relationType: "tcp" },
    { serviceId: authService._id, dependsOnServiceId: dbService._id, relationType: "tcp" },
    { serviceId: authService._id, dependsOnServiceId: redisService._id, relationType: "tcp" },
    { serviceId: notifService._id, dependsOnServiceId: dbService._id, relationType: "tcp" },
  ];

  for (const dep of dependencies) {
    await ServiceDependency.create({
      workspaceId,
      serviceId: dep.serviceId,
      dependsOnServiceId: dep.dependsOnServiceId,
      relationType: dep.relationType,
    });
  }

  // 4. Create Alert Rules
  const alertRules = [
    {
      workspaceId,
      serviceId: dbService._id,
      name: "High Failure Rate Threshold (>5%)",
      type: "failure",
      threshold: 0.05,
      severity: "critical",
      enabled: true,
      notifyChannels: ["in-app", "email"],
    },
    {
      workspaceId,
      serviceId: stripeService._id,
      name: "P99 Latency Budget Violation (>500ms)",
      type: "latency",
      threshold: 500,
      severity: "high",
      enabled: true,
      notifyChannels: ["in-app"],
    },
    {
      workspaceId,
      serviceId: apiGateway._id,
      name: "Global Synthetic Uptime Probe",
      type: "uptime",
      threshold: 99.5,
      severity: "high",
      enabled: true,
      notifyChannels: ["in-app"],
    },
  ];
  await AlertRule.insertMany(alertRules);

  // 5. Create Incidents
  const dbIncident = await Incident.create({
    workspaceId,
    serviceId: dbService._id,
    title: "PostgreSQL Primary DB Connection Pool Exhaustion",
    status: "investigating",
    severity: "critical",
    summary:
      "Active connections reached the hard limit (200/200) following traffic burst. Primary replica rejecting 35% of incoming transactions.",
    ownerId,
    responderIds: ownerId ? [ownerId] : [],
    notes: [
      {
        body: "Incident war-room initialized. DBA on-call investigating connection leaks from worker pool.",
        createdAt: new Date(now - 15 * 60 * 1000),
      },
      {
        body: "Identified unindexed batch query from Stripe billing reconciliation holding long-lived locks.",
        createdAt: new Date(now - 5 * 60 * 1000),
      },
    ],
  });

  const stripeIncident = await Incident.create({
    workspaceId,
    serviceId: stripeService._id,
    title: "Stripe Webhook Gateway Elevated Latency",
    status: "monitoring",
    severity: "high",
    summary:
      "Average latency spiked to 1,150ms due to upstream third-party rate limits. Automatic retry queue engaged.",
    ownerId,
    responderIds: ownerId ? [ownerId] : [],
    notes: [
      {
        body: "Temporary circuit breaker triggered to protect checkout checkout flows.",
        createdAt: new Date(now - 25 * 60 * 1000),
      },
    ],
  });

  // 6. Create Alerts linked to Incidents
  await Alert.create({
    workspaceId,
    serviceId: dbService._id,
    incidentId: dbIncident._id,
    title: "Connection Pool Exhaustion: PostgreSQL Primary",
    status: "escalated",
    severity: "critical",
    dedupeKey: `pool-exhaustion-${dbService._id}`,
    summary: "Active connections > 95% threshold across last 3 probe intervals.",
    meta: { activeConnections: 200, maxConnections: 200 },
  });

  await Alert.create({
    workspaceId,
    serviceId: stripeService._id,
    incidentId: stripeIncident._id,
    title: "High Latency Threshold: Stripe Checkout API",
    status: "open",
    severity: "high",
    dedupeKey: `latency-spike-${stripeService._id}`,
    summary: "Response time 1,150ms exceeded 500ms threshold.",
    meta: { latencyMs: 1150, thresholdMs: 500 },
  });

  // 7. Create Operational Log Entries
  const logs = [
    {
      workspaceId,
      serviceId: dbService._id,
      incidentId: dbIncident._id,
      severity: "critical",
      environment: "prod",
      message: "FATAL: remaining connection slots are reserved for non-replication superuser connections",
      occurredAt: new Date(now - 12 * 60 * 1000),
      metadata: { traceId: "tr-pg-001", client: "checkout-worker" },
    },
    {
      workspaceId,
      serviceId: dbService._id,
      incidentId: dbIncident._id,
      severity: "error",
      environment: "prod",
      message: "Client pool timeout: could not acquire connection within 5000ms",
      occurredAt: new Date(now - 8 * 60 * 1000),
      metadata: { traceId: "tr-pg-002", poolSize: 200, waiting: 48 },
    },
    {
      workspaceId,
      serviceId: stripeService._id,
      incidentId: stripeIncident._id,
      severity: "warn",
      environment: "prod",
      message: "Upstream HTTP 429 received from Stripe API: rate limit backoff applied (backoff=1500ms)",
      occurredAt: new Date(now - 18 * 60 * 1000),
      metadata: { traceId: "tr-stripe-001", retryCount: 2 },
    },
    {
      workspaceId,
      serviceId: apiGateway._id,
      severity: "info",
      environment: "prod",
      message: "Edge routing health check: 18,400 rpm routed cleanly. TLS 1.3 session cache hit rate 94.2%",
      occurredAt: new Date(now - 4 * 60 * 1000),
      metadata: { traceId: "tr-edge-001", host: "api.smimp.io" },
    },
    {
      workspaceId,
      serviceId: redisService._id,
      severity: "info",
      environment: "prod",
      message: "Redis memory fragmentation ratio: 1.12. Active keys: 842,910. Cache hit ratio: 99.4%",
      occurredAt: new Date(now - 2 * 60 * 1000),
      metadata: { traceId: "tr-redis-001", clusterNodes: 3 },
    },
  ];
  await LogEntry.insertMany(logs);

  // 8. Create AI Insights
  await AIInsight.create({
    workspaceId,
    serviceId: dbService._id,
    incidentId: dbIncident._id,
    type: "incident-summary",
    title: "Postmortem Synthesis: Database Pool Saturation",
    body: `### Incident Summary
PostgreSQL Primary Cluster experienced connection exhaustion during checkout batch processing, causing 35% of database readiness probes to fail.

### Probable Root Cause
Stripe billing reconciliation worker ran an unindexed table scan across \`payment_transactions\`, acquiring long-lived table locks and holding open connections beyond the 5,000ms client timeout threshold.

### Recommended Next Steps
1. Deploy index on \`payment_transactions(status, processed_at)\` to reduce query duration from 4.2s to 18ms.
2. Configure PgBouncer transaction-mode pooling to buffer spikes and isolate worker connections from user-facing API traffic.
3. Lower client connection timeout to 2,000ms and verify health status after pool recycling.`,
    evidence: { alertCount: 1, logCount: 2, affectedService: "PostgreSQL Primary DB Cluster" },
  });

  await AIInsight.create({
    workspaceId,
    serviceId: stripeService._id,
    incidentId: stripeIncident._id,
    type: "service-trend",
    title: "Health Trend Forecast: Stripe Checkout Latency",
    body: `### Telemetry Analysis
Stripe Checkout & Billing API has sustained an average latency of 1,150ms over the last 30 minutes, exceeding the established 500ms SLO threshold.

### Trend Projection
Current retry queues are buffering incoming requests. If upstream rate limiting persists, error rates may escalate to critical within the next 45 minutes.

### Mitigation Guidance
Enable client-side rate limiting on outgoing webhooks and activate asynchronous job buffering via Redis to smooth traffic spikes.`,
    evidence: { avgLatency: 1150, p99: 1420, uptime: 96.4 },
  });

  // 9. Create SLO Targets
  await SLOTarget.create({
    workspaceId,
    serviceId: apiGateway._id,
    name: "API Gateway 99.9% Uptime Objective",
    objective: 99.9,
    windowDays: 30,
    errorBudgetBurnRate: 0.12,
  });

  await SLOTarget.create({
    workspaceId,
    serviceId: stripeService._id,
    name: "Checkout API Latency SLO (<500ms)",
    objective: 99.5,
    windowDays: 30,
    errorBudgetBurnRate: 2.45,
  });

  // 10. Create Deployment Event
  await DeploymentEvent.create({
    workspaceId,
    serviceId: apiGateway._id,
    title: "Edge Gateway Release v2.4.1",
    environment: "prod",
    sha: "7b1a05f",
    deployedAt: new Date(now - 45 * 60 * 1000),
    metadata: { author: "Platform SRE", version: "2.4.1" },
  });

  // 11. Audit log
  await AuditLog.create({
    workspaceId,
    actorId: ownerId,
    action: "demo.seeded",
    resourceType: "workspace",
    resourceId: workspaceId.toString(),
    details: {
      servicesCount: createdServices.length,
      incidentsCount: 2,
      alertsCount: 2,
      checksCount: checksToInsert.length,
    },
  });

  return {
    success: true,
    message: "Demo environment successfully seeded with 7 microservices and live telemetry.",
    data: {
      servicesCount: createdServices.length,
      checksCount: checksToInsert.length,
      incidentsCount: 2,
      alertsCount: 2,
      dependenciesCount: dependencies.length,
    },
  };
}

export async function ensureDemoAccounts() {
  try {
    const demoEmail = "admin@smimp.io";
    let adminUser = await User.findOne({ email: demoEmail });

    if (!adminUser) {
      logger.info("[demo] Initializing demo accounts and default enterprise workspace...");

      // 1. Create Demo Workspace
      const workspace = await Workspace.create({
        name: "Acme Global Infrastructure",
        slug: "acme-global-infra",
        plan: "enterprise",
      });

      // 2. Create Demo Admin
      const adminHash = await bcrypt.hash("AdminPassword123!", 12);
      adminUser = await User.create({
        name: "Alex Vance (Demo Admin)",
        email: demoEmail,
        passwordHash: adminHash,
        roles: ["super-admin", "admin"],
        workspaceRoles: [{ workspaceId: workspace._id, role: "admin" }],
        workspaceIds: [workspace._id],
        emailVerifiedAt: new Date(),
      });

      // 3. Create Demo Super Admin
      const superHash = await bcrypt.hash("SuperAdmin123!", 12);
      await User.create({
        name: "Samantha Reed (Super Admin)",
        email: "superadmin@smimp.io",
        passwordHash: superHash,
        roles: ["super-admin"],
        workspaceRoles: [{ workspaceId: workspace._id, role: "super-admin" }],
        workspaceIds: [workspace._id],
        emailVerifiedAt: new Date(),
      });

      // 4. Create Demo Viewer
      const viewerHash = await bcrypt.hash("ViewerPassword123!", 12);
      await User.create({
        name: "Jordan Lee (Viewer)",
        email: "viewer@smimp.io",
        passwordHash: viewerHash,
        roles: ["viewer"],
        workspaceRoles: [{ workspaceId: workspace._id, role: "viewer" }],
        workspaceIds: [workspace._id],
        emailVerifiedAt: new Date(),
      });

      workspace.ownerId = adminUser._id;
      await workspace.save();

      // 5. Seed full demo data into this workspace
      await seedWorkspaceDemoData(workspace._id, adminUser._id);
      logger.info("✅ Demo accounts and demo workspace initialized successfully.");
    } else {
      // Ensure the demo workspace has services seeded
      const workspaceId = adminUser.workspaceIds?.[0];
      if (workspaceId) {
        const count = await Service.countDocuments({ workspaceId });
        if (count === 0) {
          logger.info("[demo] Demo workspace is empty, seeding demo services...");
          await seedWorkspaceDemoData(workspaceId, adminUser._id);
        }
      }
    }
  } catch (error) {
    logger.error("[demo] Failed to ensure demo accounts: %s", error.message);
  }
}
