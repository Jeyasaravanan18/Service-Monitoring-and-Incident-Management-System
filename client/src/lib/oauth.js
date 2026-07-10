import { apiGet } from "./api.js";

/**
 * Check if Google OAuth is configured on the server.
 * Returns the clientId if configured, or null if not.
 */
export async function getGoogleClientId() {
  try {
    const response = await apiGet("/auth/google/config");
    return response.data?.clientId || null;
  } catch {
    return null;
  }
}

/**
 * Redirects the browser to Google's OAuth consent screen.
 * @param {string} clientId The Google OAuth client ID.
 * @param {"login" | "link"} state Defines if we are logging in or linking accounts.
 */
export function redirectToGoogle(clientId, state = "login") {
  const redirectUri = window.location.origin + "/auth/google/callback";
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(
    "openid profile email"
  )}&state=${state}&prompt=select_account`;
  window.location.href = googleAuthUrl;
}
