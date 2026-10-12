import mongoose from "mongoose";
import env from "./src/config/env.js";
import { connectDb } from "./src/config/db.js";
import { Service, CheckResult, Incident, Alert, Workspace } from "./src/models/index.js";

async function seed() {
  console.log("Connecting to Database...");
  await connectDb();

  console.log("Looking for an existing workspace...");
  const workspace = await Workspace.findOne();

  if (!workspace) {
    console.error("❌ No workspace found! Please open the app and register a user first.");
    process.exit(1);
  }

  const wId = workspace._id;
  console.log(`✅ Using Workspace: ${workspace.name} (${wId})`);

  console.log("Cleaning old demo data...");
  await Service.deleteMany({ workspaceId: wId });
  await CheckResult.deleteMany({ workspaceId: wId });
  await Incident.deleteMany({ workspaceId: wId });
  await Alert.deleteMany({ workspaceId: wId });

  console.log("Creating Services...");
  const servicesData = [
    {
      workspaceId: wId,
      name: "API Gateway",
      description: "Main routing and gateway service",
      url: "https://httpstat.us/200",
      protocol: "https",
      checkIntervalMinutes: 1,
      healthStatus: "healthy",
      uptimePercentage: 99.9,
      avgLatencyMs: 45,
      latencyHistory: [],
    },
    {
      workspaceId: wId,
      name: "Payment Processor",
      description: "Stripe webhook processor",
      url: "https://httpstat.us/200?sleep=1000",
      protocol: "https",
      checkIntervalMinutes: 1,
      healthStatus: "degraded",
      uptimePercentage: 96.5,
      avgLatencyMs: 1200,
      latencyHistory: [],
    },
    {
      workspaceId: wId,
      name: "Authentication DB",
      description: "Primary user database",
      url: "https://httpstat.us/500",
      protocol: "https",
      checkIntervalMinutes: 1,
      healthStatus: "critical",
      uptimePercentage: 88.2,
      avgLatencyMs: 300,
      latencyHistory: [],
    }
  ];

  const services = await Service.insertMany(servicesData);

  console.log("Generating Telemetry History (Charts)...");
  const now = Date.now();
  const checksToGenerate = [];

  for (const svc of services) {
    const isHealthy = svc.healthStatus === "healthy";
    const isDegraded = svc.healthStatus === "degraded";
    
    // Generate 60 points of history (1 point per minute for the last hour)
    for (let i = 60; i >= 0; i--) {
      const timestamp = new Date(now - i * 60 * 1000);
      
      let latency = 45 + Math.random() * 20; // Default healthy
      let ok = true;

      if (isDegraded) {
        latency = 800 + Math.random() * 1000; // High latency spikes
      } else if (!isHealthy) {
        // Critical
        ok = Math.random() > 0.3; // 30% failure rate
        latency = ok ? 100 + Math.random() * 50 : 0;
      }

      checksToGenerate.push({
        workspaceId: wId,
        serviceId: svc._id,
        latencyMs: latency,
        statusCode: ok ? 200 : 500,
        ok,
        errorMessage: ok ? "" : "Connection timed out",
        checkedAt: timestamp,
      });

      // Also populate the fast 20-point array on the service model
      if (i < 20) {
        svc.latencyHistory.push(Math.round(latency));
      }
    }
    
    // Set the last values
    const lastCheck = checksToGenerate[checksToGenerate.length - 1];
    svc.lastCheckedAt = lastCheck.checkedAt;
    svc.lastStatusCode = lastCheck.statusCode;
    svc.lastResponseTimeMs = lastCheck.latencyMs;
    await svc.save();
  }

  await CheckResult.insertMany(checksToGenerate);

  console.log("Generating Active Incidents & Alerts...");
  const authDb = services.find(s => s.name === "Authentication DB");
  
  const incident = await Incident.create({
    workspaceId: wId,
    serviceId: authDb._id,
    title: "Authentication Database Unreachable",
    status: "investigating",
    severity: "critical",
    summary: "The primary replica for the auth DB is dropping 30% of connections and failing readiness probes.",
  });

  await Alert.create({
    workspaceId: wId,
    incidentId: incident._id,
    serviceId: authDb._id,
    title: "High Error Rate: Auth DB",
    severity: "critical",
    status: "open",
    meta: {
      metricName: "http_errors",
      metricValue: 0.3,
      thresholdValue: 0.05
    },
    summary: "HTTP 500 errors exceeded 5% threshold across last 3 polling windows."
  });

  console.log("✅ Demo Seed Complete! Refresh your browser to see the data.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed Failed:", err);
  process.exit(1);
});
