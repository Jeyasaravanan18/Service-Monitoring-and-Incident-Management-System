import cron from "node-cron";
import logger from "../config/logger.js";
import { Service, MaintenanceWindow } from "../models/index.js";
import { runServiceCheck } from "../services/monitoringService.js";

const CONCURRENCY = 10; // max parallel HTTP checks
const BATCH_QUERY_LIMIT = 500; // max services fetched per sweep

/**
 * Run checks for a list of services with bounded concurrency.
 * Uses a simple semaphore to avoid overwhelming the network.
 */
async function runWithConcurrency(items, fn, concurrency) {
  let index = 0;
  const results = [];

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

export function registerMonitoringJob() {
  // Run every minute — each service's checkIntervalMinutes is respected inside
  cron.schedule("* * * * *", async () => {
    const sweepStart = Date.now();
    let checked = 0;
    let skipped = 0;

    try {
      const now = new Date();
      const services = await Service.find({}).limit(BATCH_QUERY_LIMIT).lean();

      // Filter to only services due for a check
      const due = services.filter((service) => {
        if (!service.lastCheckedAt) return true;
        const intervalMs = (service.checkIntervalMinutes || 5) * 60 * 1000;
        return now - new Date(service.lastCheckedAt) >= intervalMs;
      });

      skipped = services.length - due.length;

      // Fetch active maintenance windows across all relevant workspaces
      const workspaceIds = [...new Set(due.map(s => s.workspaceId.toString()))];
      const activeWindows = await MaintenanceWindow.find({
        workspaceId: { $in: workspaceIds },
        active: true,
        startsAt: { $lte: now },
        endsAt: { $gte: now }
      }).lean();

      await runWithConcurrency(due, async (service) => {
        try {
          const doc = await Service.findById(service._id);
          if (!doc) return;
          
          // Check if this service is under an active maintenance window
          const isUnderMaintenance = activeWindows.some(w => 
            w.workspaceId.toString() === service.workspaceId.toString() &&
            (!w.serviceId || w.serviceId.toString() === service._id.toString())
          );
          
          if (isUnderMaintenance) {
            doc.maintenanceMode = true; // Temporary flag for the check to respect
          }

          await runServiceCheck(doc);
          checked++;
        } catch (err) {
          logger.error("Check failed for service %s: %s", service._id, err.message);
        }
      }, CONCURRENCY);

      logger.info(
        "Monitoring sweep: %d checked, %d skipped, took %dms",
        checked,
        skipped,
        Date.now() - sweepStart
      );
    } catch (err) {
      logger.error("Monitoring sweep error: %s", err.message);
    }
  });

  logger.info("Monitoring job registered (1-minute tick, per-service interval respected)");
}
