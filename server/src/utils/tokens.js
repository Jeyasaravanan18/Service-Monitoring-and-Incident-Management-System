import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/env.js";

export function signAccessToken(payload) {
  return jwt.sign({ ...payload, jti: payload.jti || crypto.randomUUID() }, env.jwtAccessSecret, { expiresIn: env.jwtAccessTtl });
}

export function signRefreshToken(payload) {
  return jwt.sign({ ...payload, jti: payload.jti || crypto.randomUUID() }, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshTtl });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
