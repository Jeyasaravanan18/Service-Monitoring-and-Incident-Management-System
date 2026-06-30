import React from "react";

export function MetricCard({ label, value, trend, variant = "default", icon: Icon }) {
  return (
    <div className="metric-card">
      <div className="metric-label" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
        {label}
        {Icon && <Icon size={16} strokeWidth={1.5} style={{ opacity: 0.5 }} />}
      </div>
      <div className={`metric-value${variant !== "default" ? " " + variant : ""}`}>{value}</div>
      {trend ? <div className="trend">{trend}</div> : null}
    </div>
  );
}
