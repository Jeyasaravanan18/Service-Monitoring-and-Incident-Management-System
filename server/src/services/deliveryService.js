import env from "../config/env.js";
import logger from "../config/logger.js";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function cleanText(value) {
  return String(value || "").trim();
}

async function postJson(url, body, headers = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: response.ok, status: response.status, data };
}

function buildEmailHtml(title, body, meta = {}) {
  const metaHtml = Object.keys(meta).length
    ? `<table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:13px">${Object.entries(meta)
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 10px;border-top:1px solid #e5e7eb;color:#6b7280;white-space:nowrap">${k}</td><td style="padding:6px 10px;border-top:1px solid #e5e7eb;word-break:break-all">${typeof v === "object" ? JSON.stringify(v) : v}</td></tr>`
        )
        .join("")}</table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <!-- Header -->
        <tr><td style="background:#0f172a;padding:24px 32px;border-radius:12px 12px 0 0">
          <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:0.02em">Service Monitoring and Incident Management Platform</span>
          <span style="color:#64748b;font-size:13px;margin-left:12px">Service Monitoring</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none">
          <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px">${title}</h2>
          <p style="margin:0 0 20px;color:#475569;line-height:1.6">${body || ""}</p>
          ${metaHtml}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:16px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0;color:#94a3b8;font-size:12px">This notification was sent by Service Monitoring and Incident Management Platform. If you believe this was sent in error, please contact your workspace administrator.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendEmailDelivery({ to, title, body, meta = {} }) {
  const apiKey = cleanText(env.resendApiKey);
  const from = cleanText(env.notificationEmailFrom);
  if (!apiKey || !from || !to) {
    return {
      channel: "email",
      ok: false,
      skipped: true,
      reason: "Missing RESEND_API_KEY, NOTIFICATION_EMAIL_FROM, or recipient email",
    };
  }

  const response = await postJson(
    RESEND_ENDPOINT,
    { from, to, subject: title, html: buildEmailHtml(title, body, meta) },
    { Authorization: `Bearer ${apiKey}` }
  );

  if (!response.ok) {
    logger.warn("Email delivery failed to %s: %d", to, response.status);
  }

  return { channel: "email", ok: response.ok, status: response.status, response: response.data };
}

export async function sendWebhookDelivery({ url, payload }) {
  const endpoint = cleanText(url || env.notificationWebhookUrl);
  if (!endpoint) {
    return { channel: "webhook", ok: false, skipped: true, reason: "Missing webhook URL" };
  }
  const response = await postJson(endpoint, payload);
  return { channel: "webhook", ok: response.ok, status: response.status, response: response.data };
}

export async function sendSlackDelivery({ url, title, body, meta = {} }) {
  const endpoint = cleanText(url || env.notificationSlackWebhookUrl);
  if (!endpoint) {
    return { channel: "slack", ok: false, skipped: true, reason: "Missing Slack webhook URL" };
  }
  const response = await postJson(endpoint, {
    text: `${title}\n${body || ""}`.trim(),
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: `*${title}*` } },
      body ? { type: "section", text: { type: "mrkdwn", text: body } } : null,
      Object.keys(meta).length
        ? { type: "section", text: { type: "mrkdwn", text: `\`\`\`${JSON.stringify(meta, null, 2)}\`\`\`` } }
        : null,
    ].filter(Boolean),
  });
  return { channel: "slack", ok: response.ok, status: response.status, response: response.data };
}

export async function dispatchNotificationDeliveries({ recipients = [], title, body, meta = {} }) {
  const results = [];

  if (env.notificationWebhookUrl) {
    results.push(await sendWebhookDelivery({ payload: { title, body, meta, recipients, source: "Service Monitoring and Incident Management Platform" } }));
  }
  if (env.notificationSlackWebhookUrl) {
    results.push(await sendSlackDelivery({ title, body, meta }));
  }
  if (env.resendApiKey && env.notificationEmailFrom) {
    for (const recipient of recipients) {
      if (recipient?.email) {
        results.push(await sendEmailDelivery({ to: recipient.email, title, body, meta }));
      }
    }
  }

  return results;
}
