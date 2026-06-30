import cron from "node-cron";
import logger from "../config/logger.js";
import { RefreshToken } from "../models/index.js";

/**
 * Weekly cleanup job:
 * - Deletes refresh tokens revoked more than 7 days ago
 * CheckResult TTL index handles check result expiry automatically via MongoDB.
 */
export function registerCleanupJob() {
  // Run every Sunday at 03:00
  cron.schedule("0 3 * * 0", async () => {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    try {
      const result = await RefreshToken.deleteMany({
        revokedAt: { $lt: cutoff },
      });
      logger.info("Cleanup: deleted %d revoked refresh tokens", result.deletedCount);
    } catch (err) {
      logger.error("Cleanup job error: %s", err.message);
    }
  });

  logger.info("Cleanup job registered (weekly Sunday 03:00)");
}
