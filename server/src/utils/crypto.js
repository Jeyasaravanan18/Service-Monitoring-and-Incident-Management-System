import crypto from "node:crypto";
import env from "../config/env.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const KEY_PREFIX = "v1:";

export function encrypt(text) {
  if (!text) return text;
  
  // Return early if it's already in the encrypted format
  if (text.startsWith(KEY_PREFIX)) {
    return text;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Use the 32-byte base64 decoded encryption key directly for AES-256
  const key = Buffer.from(env.encryptionKey, "base64");
  
  const cipher = crypto.createCipheriv(ALGORITHM, iv, key);
  
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  
  const tag = cipher.getAuthTag();
  
  // Format: prefix:iv:tag:encryptedData
  return `${KEY_PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${encrypted}`;
}

export function decrypt(text) {
  if (!text) return text;
  
  // If not encrypted format, assume plaintext
  if (!text.startsWith(KEY_PREFIX)) {
    return text;
  }

  const parts = text.slice(KEY_PREFIX.length).split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted format");
  }

  const [ivBase64, tagBase64, encryptedBase64] = parts;
  
  const iv = Buffer.from(ivBase64, "base64");
  const tag = Buffer.from(tagBase64, "base64");
  const key = Buffer.from(env.encryptionKey, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, iv, key);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedBase64, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
