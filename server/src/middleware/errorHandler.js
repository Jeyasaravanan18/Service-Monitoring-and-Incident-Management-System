import logger from "../config/logger.js";
import { ZodError } from "zod";

export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  logger.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    details: err.details || null,
  });
}
