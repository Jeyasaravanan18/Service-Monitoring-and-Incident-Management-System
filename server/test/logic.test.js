import test from "node:test";
import assert from "node:assert/strict";
import { computeHealthScore } from "../src/utils/health.js";
import { buildAlertDedupeKey, isAlertBreached } from "../src/services/alertService.js";
import { summarizeIncident, summarizeServiceTrends } from "../src/services/aiService.js";

test("computeHealthScore produces a bounded score", () => {
  const score = computeHealthScore({ uptimePercentage: 99.9, avgLatencyMs: 80, errorRate: 0.01 });
  assert.ok(score >= 0 && score <= 100);
});

test("alert breach logic covers latency and uptime", () => {
  assert.equal(isAlertBreached({ type: "latency", threshold: 200 }, { avgLatencyMs: 250 }), true);
  assert.equal(isAlertBreached({ type: "uptime", threshold: 99 }, { uptimePercentage: 98 }), true);
  assert.equal(isAlertBreached({ type: "failure", threshold: 2 }, { failureCount: 1 }), false);
});

test("dedupe key is stable", () => {
  assert.equal(buildAlertDedupeKey("abc123", { type: "latency", threshold: 200 }), "abc123:latency:200");
});

test("AI summaries stay grounded in data", async () => {
  const incidentSummary = await summarizeIncident({
    incident: { title: "Billing outage", status: "investigating", severity: "high", summary: "Spike in errors" },
    alerts: [{ _id: "1" }],
    logs: [{ severity: "error", message: "timeout" }],
    service: { name: "Billing API", uptimePercentage: 98.2, avgLatencyMs: 320, healthStatus: "degraded" },
  });

  assert.match(incidentSummary, /Billing outage/);
  assert.match(incidentSummary, /not enough evidence|probable root cause/i);

  const trend = await summarizeServiceTrends({
    service: { name: "Billing API", uptimePercentage: 98.2, avgLatencyMs: 320, healthStatus: "degraded" },
    checks: [{ _id: "c1" }, { _id: "c2" }, { _id: "c3" }],
    logs: [{ severity: "error" }, { severity: "warn" }],
  });

  assert.match(trend.summary, /Billing API/);
  assert.ok(Array.isArray(trend.evidence));
});
