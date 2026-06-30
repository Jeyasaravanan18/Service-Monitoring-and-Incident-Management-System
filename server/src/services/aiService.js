import env from "../config/env.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

function evidenceLines({ incident, alerts, logs, service }) {
  const lines = [];
  if (incident?.title) lines.push(`Incident: ${incident.title}`);
  if (incident?.status) lines.push(`Lifecycle: ${incident.status}`);
  if (incident?.severity) lines.push(`Severity: ${incident.severity}`);
  if (service?.name) lines.push(`Service: ${service.name}`);
  if (service?.healthStatus) lines.push(`Service health: ${service.healthStatus}`);
  if (alerts?.length) lines.push(`Related alerts: ${alerts.length}`);
  if (logs?.length) lines.push(`Related logs: ${logs.length}`);
  return lines;
}

function buildPrompt({ incident, alerts, logs, service }) {
  const evidence = {
    incident,
    alerts: alerts.slice(0, 10),
    logs: logs.slice(0, 10),
    service,
  };

  return [
    "You are writing an observability incident summary for an engineering team.",
    "Use only the provided evidence. Do not invent facts, dates, root causes, or mitigations that are not supported by the data.",
    "If the evidence is insufficient, say so clearly.",
    "Return 3 short sections: summary, probable root cause, next steps.",
    `Evidence JSON: ${JSON.stringify(evidence)}`,
  ].join("\n");
}

async function callGemini(prompt) {
  if (!env.geminiApiKey) return null;
  
  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: env.geminiModel });

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text || null;
  } catch (error) {
    throw new Error(`Gemini request failed: ${error.message}`);
  }
}

function fallbackIncidentSummary({ incident, alerts = [], logs = [], service = null }) {
  const lines = evidenceLines({ incident, alerts, logs, service });
  const latencyHint = service?.avgLatencyMs ? ` Current average latency is ${Math.round(service.avgLatencyMs)}ms.` : "";
  const uptimeHint = service?.uptimePercentage ? ` Uptime is ${Math.round(service.uptimePercentage)}%.` : "";

  return [
    `This incident summary is grounded in the stored alert, log, and service data.${latencyHint}${uptimeHint}`,
    lines.length ? `Evidence: ${lines.join("; ")}.` : "Evidence is sparse, so the summary is intentionally conservative.",
    "Probable root cause: the current dataset suggests a latency or error-path regression, but there is not enough evidence to claim a definitive cause.",
    "Recommended next steps: review recent deploy markers, inspect the top correlated logs, and confirm whether a dependency or configuration change preceded the alert burst.",
  ].join(" ");
}

function fallbackServiceTrends({ service, checks = [], logs = [] }) {
  const recentChecks = checks.slice(0, 5);
  const recentErrors = logs.filter((log) => ["error", "fatal"].includes(log.severity)).slice(0, 5);
  const evidence = [];
  if (service?.name) evidence.push(`Service ${service.name}`);
  if (recentChecks.length) evidence.push(`${recentChecks.length} recent checks`);
  if (recentErrors.length) evidence.push(`${recentErrors.length} error logs`);

  return {
    summary: [
      `Service trend summary for ${service?.name || "unknown service"} is based on the stored monitoring data.`,
      service?.healthStatus ? `The current health status is ${service.healthStatus}.` : "",
      service?.avgLatencyMs ? `Average latency is ${Math.round(service.avgLatencyMs)}ms.` : "",
      service?.uptimePercentage ? `Uptime is ${Math.round(service.uptimePercentage)}%.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    evidence,
    caution: recentChecks.length < 3 ? "Data is limited, so trend confidence is low." : "Trend confidence is reasonable from the current sample.",
  };
}

export async function summarizeIncident({ incident, alerts = [], logs = [], service = null }) {
  const prompt = buildPrompt({ incident, alerts, logs, service });
  try {
    const generated = await callGemini(prompt);
    if (generated) return generated;
  } catch {
    // fall through to grounded fallback
  }
  return fallbackIncidentSummary({ incident, alerts, logs, service });
}

export async function summarizeServiceTrends({ service, checks = [], logs = [] }) {
  const fallback = fallbackServiceTrends({ service, checks, logs });
  const prompt = [
    "You are writing a service health trend summary.",
    "Use only the evidence and stay grounded.",
    "Return a concise summary, a probable issue pattern, and a short confidence note.",
    `Evidence JSON: ${JSON.stringify({ service, checks: checks.slice(0, 10), logs: logs.slice(0, 10) })}`,
  ].join("\n");

  try {
    const generated = await callGemini(prompt);
    if (generated) {
      return {
        summary: generated,
        evidence: fallback.evidence,
        caution: fallback.caution,
      };
    }
  } catch {
    // fall through
  }

  return fallback;
}
