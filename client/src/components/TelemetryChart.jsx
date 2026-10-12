import React, { useMemo, memo } from "react";

export const TelemetryChart = memo(function TelemetryChart({ data = [], width = "100%", height = 120, color = "#38bdf8" }) {
  if (!data || data.length === 0) {
    return <div className="subtle" style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>No telemetry data.</div>;
  }

  const plotData = data.length === 1 ? [data[0], data[0]] : data;
  const min = Math.min(...plotData);
  const max = Math.max(...plotData);
  const range = max - min === 0 ? 1 : max - min;
  const paddingY = 16; 

  const { points, areaD, pathD } = useMemo(() => {
    const pts = plotData.map((val, i) => {
      const x = (i / (plotData.length - 1)) * 1000;
      const normalizedY = (val - min) / range;
      const y = 100 - paddingY - (normalizedY * (100 - paddingY * 2));
      return `${x},${y}`;
    });
    const pD = `M ${pts.join(" L ")}`;
    return {
      points: pts,
      pathD: pD,
      areaD: `${pD} L 1000,100 L 0,100 Z`
    };
  }, [plotData, min, range, paddingY]);

  const gradientId = useMemo(() => `chartGrad_${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <div style={{ width, height, position: "relative", padding: "8px 0" }}>
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Subtle grid lines */}
        <line x1="0" y1="20" x2="1000" y2="20" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="0" y1="50" x2="1000" y2="50" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="0" y1="80" x2="1000" y2="80" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Area fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Stroke line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        
        {/* Plot points */}
        {plotData.map((val, i) => {
          const x = (i / (plotData.length - 1)) * 1000;
          const normalizedY = (val - min) / range;
          const y = 100 - paddingY - (normalizedY * (100 - paddingY * 2));
          return (
            <circle key={i} cx={x} cy={y} r="3" fill={color} stroke="#070a12" strokeWidth="2" />
          );
        })}
      </svg>
      <div style={{ position: "absolute", top: 0, right: 0, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--color-muted)" }}>
        max: {Math.round(max)}ms
      </div>
      <div style={{ position: "absolute", bottom: 0, right: 0, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--color-muted)" }}>
        min: {Math.round(min)}ms
      </div>
    </div>
  );
});
