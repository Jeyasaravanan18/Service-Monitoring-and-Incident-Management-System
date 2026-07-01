function normalizeOrigin(origin) {
  if (!origin) return null;

  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
}

function safeHostname(origin) {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return null;

  try {
    return new URL(normalized).hostname;
  } catch {
    return null;
  }
}

export function isAllowedBrowserOrigin(origin, allowedOrigins = []) {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return false;

  const normalizedAllowedOrigins = allowedOrigins
    .filter(Boolean)
    .map((value) => normalizeOrigin(value))
    .filter(Boolean);

  if (normalizedAllowedOrigins.includes(normalizedOrigin)) return true;

  const hostname = safeHostname(normalizedOrigin);
  if (!hostname) return false;

  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".vercel.app");
}
