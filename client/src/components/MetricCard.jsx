import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function MetricCard({ label, value, trend, trendDirection = "neutral", variant = "default", icon: Icon }) {
  let TrendIcon = Minus;
  let trendColor = "var(--color-text-soft)";

  if (trendDirection === "up" || (typeof trend === "string" && trend.includes("+"))) {
    TrendIcon = TrendingUp;
    trendColor = variant === "danger" ? "var(--color-danger)" : "var(--color-success)";
  } else if (trendDirection === "down" || (typeof trend === "string" && trend.includes("-"))) {
    TrendIcon = TrendingDown;
    trendColor = variant === "danger" ? "var(--color-success)" : "var(--color-warn)";
  }

  return (
    <div className={`metric-card ${variant !== "default" ? "metric-card--" + variant : ""}`}>
      <div className="metric-label">
        <span>{label}</span>
        {Icon && (
          <div style={{
            width: 28,
            height: 28,
            borderRadius: "var(--radius-xs)",
            background: "var(--color-surface-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--color-border)",
            color: "var(--color-brand)"
          }}>
            <Icon size={15} strokeWidth={2} />
          </div>
        )}
      </div>

      <div className={`metric-value${variant !== "default" ? " " + variant : ""}`}>
        {value}
      </div>

      {trend ? (
        <div className="trend" style={{ color: trendColor }}>
          <TrendIcon size={14} strokeWidth={2} />
          <span>{trend}</span>
        </div>
      ) : null}
    </div>
  );
}
