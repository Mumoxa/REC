import { createHmac, hkdfSync, timingSafeEqual } from "node:crypto";
import { sessionCookieOptions } from "./access";

export const PASSWORD_GRANT_COOKIE = "rec-password-reset";
export const passwordGrantOptions = {
  ...sessionCookieOptions,
  path: "/api/auth/password",
  maxAge: 15 * 60,
};
function signingKey() {
  const secret = process.env.AUTH_PASSWORD_RESET_SECRET || process.env.INGEST_API_KEY;
  if (!secret || Buffer.byteLength(secret) < 32)
    throw new Error("Password setup signing is not configured.");
  // A dedicated key is preferred; HKDF separates this use from the existing
  // server-only ingestion credential without changing that credential.
  return hkdfSync("sha256", secret, "Talent Tree REC", "password-reset-grant/v1", 32);
}
export function hasPasswordResetKey() {
  try {
    signingKey();
    return true;
  } catch {
    return false;
  }
}
export function passwordGrant(
  userId: string,
  accessToken: string,
  expiresAt = Date.now() + 15 * 60 * 1000
) {
  const digest = createHmac("sha256", signingKey())
    .update(`${userId}:${accessToken}:${expiresAt}`)
    .digest("hex");
  return `${expiresAt}.${digest}`;
}
export function validPasswordGrant(value: string | undefined, userId: string, accessToken: string) {
  if (!value || !/^\d{13}\.[a-f0-9]{64}$/.test(value)) return false;
  const expiresAt = Number(value.split(".")[0]);
  if (expiresAt <= Date.now() || expiresAt > Date.now() + 15 * 60 * 1000) return false;
  return timingSafeEqual(
    Buffer.from(value),
    Buffer.from(passwordGrant(userId, accessToken, expiresAt))
  );
}
