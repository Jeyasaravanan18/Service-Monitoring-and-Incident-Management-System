export function computeHealthScore(service) {
  const uptime = service.uptimePercentage ?? 100;
  const latency = service.avgLatencyMs ?? 0;
  const errorRate = service.errorRate ?? 0;
  const score = Math.max(
    0,
    Math.min(100, Math.round(uptime - latency / 50 - errorRate * 40))
  );
  return score;
}
