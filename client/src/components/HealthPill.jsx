import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from "lucide-react";

export function HealthPill({ value }) {
  const normalized = (value || "unknown").toLowerCase();
  
  let Icon = HelpCircle;
  if (normalized === "healthy" || normalized === "operational") Icon = CheckCircle2;
  else if (normalized === "degraded") Icon = AlertTriangle;
  else if (normalized === "critical" || normalized === "down") Icon = AlertCircle;

  return (
    <span className={`status ${normalized}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <Icon size={14} strokeWidth={2} />
      {normalized}
    </span>
  );
}
