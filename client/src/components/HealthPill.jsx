import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, Activity } from "lucide-react";

export function HealthPill({ value, showPulse = true }) {
  const normalized = (value || "unknown").toLowerCase();
  
  let Icon = HelpCircle;
  let statusClass = "unknown";

  if (normalized === "healthy" || normalized === "operational" || normalized === "active") {
    Icon = CheckCircle2;
    statusClass = "healthy";
  } else if (normalized === "degraded" || normalized === "warning" || normalized === "investigating") {
    Icon = AlertTriangle;
    statusClass = "degraded";
  } else if (normalized === "critical" || normalized === "down" || normalized === "failed" || normalized === "error") {
    Icon = AlertCircle;
    statusClass = "critical";
  } else if (normalized === "open" || normalized === "acknowledged") {
    Icon = Activity;
    statusClass = "open";
  }

  return (
    <span className={`status ${statusClass}`}>
      <Icon size={13} strokeWidth={2.5} style={{ flexShrink: 0 }} />
      <span>{normalized}</span>
    </span>
  );
}
