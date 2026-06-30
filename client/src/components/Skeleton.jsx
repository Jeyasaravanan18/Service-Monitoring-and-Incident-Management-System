import React from "react";

export function Skeleton({ width = "100%", height = 20, style = {}, className = "" }) {
  return (
    <div 
      className={`skeleton ${className}`} 
      style={{ 
        width, 
        height, 
        ...style 
      }} 
    />
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <div className="grid cols-4" style={{ marginBottom: 16 }}>
        <div className="metric-card"><Skeleton height={48} /></div>
        <div className="metric-card"><Skeleton height={48} /></div>
        <div className="metric-card"><Skeleton height={48} /></div>
        <div className="metric-card"><Skeleton height={48} /></div>
      </div>
      <div className="grid cols-2">
        <div className="panel">
          <Skeleton height={24} width={120} style={{ marginBottom: 16 }} />
          <div style={{ display: "grid", gap: 12 }}>
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
          </div>
        </div>
        <div className="panel">
          <Skeleton height={24} width={120} style={{ marginBottom: 16 }} />
          <div style={{ display: "grid", gap: 12 }}>
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
          </div>
        </div>
      </div>
    </>
  );
}
