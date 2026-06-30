import React from "react";

export function Sparkline({ points = [90, 92, 95, 93, 98, 97, 99, 100] }) {
  const safePoints = points.length ? points : [0];
  const max = Math.max(...safePoints, 1);
  const min = Math.min(...safePoints, 0);
  const range = Math.max(max - min, 1);
  const width = 400;
  const height = 56;
  const step = width / Math.max(safePoints.length - 1, 1);

  const coords = safePoints
    .map((point, index) => {
      const x = index * step;
      const y = height - ((point - min) / range) * (height - 10) - 5;
      return `${x},${y}`;
    })
    .join(" ");

  // Area fill path
  const firstX = 0;
  const lastX = (safePoints.length - 1) * step;
  const areaCoords = `${firstX},${height} ${coords} ${lastX},${height}`;

  // Color based on last value
  const lastVal = safePoints[safePoints.length - 1];
  const strokeColor =
    lastVal >= 99
      ? "var(--color-success)"
      : lastVal >= 95
      ? "var(--color-warn)"
      : "var(--color-danger)";
  const fillColor =
    lastVal >= 99
      ? "rgba(22, 163, 74, 0.07)"
      : lastVal >= 95
      ? "rgba(217, 119, 6, 0.07)"
      : "rgba(220, 38, 38, 0.07)";

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        aria-hidden="true"
        style={{ display: "block" }}
      >
        <polygon fill={fillColor} points={areaCoords} />
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          points={coords}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 8,
        fontSize: 11,
        color: "var(--color-faint)",
        fontWeight: 500,
      }}>
        <span>{safePoints.length} data points</span>
        <span style={{ color: strokeColor, fontWeight: 700 }}>
          {Math.round(lastVal)}% uptime
        </span>
      </div>
    </div>
  );
}
