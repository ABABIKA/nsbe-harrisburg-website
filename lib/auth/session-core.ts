import { createHash, randomBytes } from "node:crypto";

export const SESSION_DAYS = 7;

export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

// Only this hash is stored, so a leaked database cannot be used to sign in.
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionExpiry(now: number = Date.now()): number {
  return now + SESSION_DAYS * 24 * 60 * 60 * 1000;
}
