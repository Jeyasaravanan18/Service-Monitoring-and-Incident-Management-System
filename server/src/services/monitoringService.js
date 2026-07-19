import { CheckResult, Service } from "../models/index.js";
import { evaluateAlertsForService } from "./alertService.js";
import { emitRealtime } from "./realtimeService.js";
import { computeHealthScore } from "../utils/health.js";
import { decrypt } from "../utils/crypto.js";
import logger from "../config/logger.js";

const MAX_RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 2000; // 2s between retries
const REQUEST_TIMEOUT_MS = 10000; // 10s per check

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeHeaders(service) {
  const headers = { ...(service.customHeaders || {}) };
  if (service.apiKey) {
    try {
      const decryptedKey = decrypt(service.apiKey);
      headers.Authorization = headers.Authorization || `Bearer ${decryptedKey}`;
    } catch (e) {
      logger.error("Failed to decrypt apiKey for service %s: %s", service._id, e.message);
      // Fallback or leave it out if we can't decrypt
    }
  }
  return headers;
}

async function runHttpCheck(service) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const response = await fetch(service.url, {
      method: "GET",
      headers: normalizeHeaders(service),
      signal: controller.signal,
    });
    const latencyMs = Date.now() - startedAt;
    const text = await response.text();
    const responseSnippet = text.slice(0, 500);
    const keywordMatched = service.expectedKeyword
      ? text.includes(service.expectedKeyword)
      : true;
    const ok = response.ok && keywordMatched;

    return {
      ok,
      latencyMs,
      statusCode: response.status,
      keywordMatched,
      errorMessage: ok
        ? ""
        : response.ok
        ? "Expected response keyword was not found"
        : `Unexpected status code ${response.status}`,
      responseSnippet,
    };
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    return {
      ok: false,
      latencyMs,
      statusCode: 0,
      keywordMatched: false,
      errorMessage:
        error.name === "AbortError" ? "Request timed out" : error.message,
      responseSnippet: "",
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Recalculate uptime percentage from the last N check results stored in DB.
 * This is a real rolling-window calculation, not a naive increment.
 */
async function recalcUptimeFromHistory(service) {
  const WINDOW = 100; // last 100 checks
  const recent = await CheckResult.find({ serviceId: service._id })
    .sort({ checkedAt: -1 })
    .limit(WINDOW)
    .lean();

  if (!recent.length) return service.uptimePercentage ?? 100;
  const okCount = recent.filter((r) => r.ok).length;
  return Math.round((okCount / recent.length) * 1000) / 10; // 1 decimal place
}

/**
 * Recalculate average latency from last N checks.
 */
async function recalcAvgLatency(service) {
  const WINDOW = 50;
  const recent = await CheckResult.find({ serviceId: service._id, ok: true })
    .sort({ checkedAt: -1 })
    .limit(WINDOW)
    .lean();
  if (!recent.length) return service.avgLatencyMs ?? 0;
  const total = recent.reduce((sum, r) => sum + r.latencyMs, 0);
  return Math.round(total / recent.length);
}

async function applyCheckToService(service, result) {
  service.lastCheckedAt = new Date();
  service.lastStatusCode = result.statusCode;
  service.lastResponseTimeMs = result.latencyMs;
  service.lastCheckSummary = result.ok ? "Healthy" : result.errorMessage;
  service.failureCount = result.ok ? 0 : (service.failureCount || 0) + 1;
  service.errorRate = result.ok
    ? Math.max(0, Math.round(((service.errorRate ?? 0) - 0.01) * 100) / 100)
    : Math.min(1, Math.round(((service.errorRate ?? 0) + 0.05) * 100) / 100);

  // Maintain latency history array (max 20 points)
  const history = service.latencyHistory || [];
  history.push(result.latencyMs);
  if (history.length > 20) {
    history.shift();
  }
  service.latencyHistory = history;

  // Real uptime from rolling window
  service.uptimePercentage = await recalcUptimeFromHistory(service);
  service.avgLatencyMs = await recalcAvgLatency(service);

  // Health status from uptime
  service.healthStatus =
    service.uptimePercentage > 99
      ? "healthy"
      : service.uptimePercentage > 95
      ? "degraded"
      : "critical";
}

export async function runServiceCheck(service) {
  if (service.maintenanceMode) {
    emitRealtime("service:checked", {
      serviceId: service._id.toString(),
      workspaceId: service.workspaceId.toString(),
      maintenanceMode: true,
    });
    return {
      ok: true,
      latencyMs: 0,
      statusCode: 204,
      keywordMatched: true,
      errorMessage: "",
      responseSnippet: "Maintenance mode",
    };
  }

  let lastResult = null;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    const result = await runHttpCheck(service);
    lastResult = result;

    await CheckResult.create({
      workspaceId: service.workspaceId,
      serviceId: service._id,
      latencyMs: result.latencyMs,
      statusCode: result.statusCode,
      ok: result.ok,
      keywordMatched: result.keywordMatched,
      errorMessage: result.errorMessage,
      responseSnippet: result.responseSnippet,
      attempt,
    });

    if (result.ok) {
      // Success on this attempt — stop retrying
      break;
    }

    if (attempt < MAX_RETRY_ATTEMPTS) {
      // Exponential backoff before retry
      logger.warn(
        "Service %s failed (attempt %d/%d), retrying in %dms",
        service._id,
        attempt,
        MAX_RETRY_ATTEMPTS,
        RETRY_DELAY_MS * attempt
      );
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  await applyCheckToService(service, lastResult);
  await service.save();

  emitRealtime("service:checked", {
    serviceId: service._id.toString(),
    workspaceId: service.workspaceId.toString(),
    result: lastResult,
    healthStatus: service.healthStatus,
    uptimePercentage: service.uptimePercentage,
  });

  if (!lastResult?.ok && !service.maintenanceMode) {
    await evaluateAlertsForService(service);
    emitRealtime("service:check-failed", {
      serviceId: service._id.toString(),
      workspaceId: service.workspaceId.toString(),
      result: lastResult,
    });
  }

  return lastResult;
}

export async function runMonitoringSweep() {
  const services = await Service.find({}).limit(500);
  const results = [];
  for (const service of services) {
    results.push(await runServiceCheck(service));
  }
  return results;
}
