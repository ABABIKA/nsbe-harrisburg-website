import "server-only";
import { cookies } from "next/headers";
import { getStore } from "../db";
import type { User } from "../db/types";
import {
  hashSessionToken,
  newSessionToken,
  sessionExpiry,
} from "./session-core";

export const SESSION_COOKIE = "nsbe_session";

export async function createSession(userId: number): Promise<void> {
  const token = newSessionToken();
  const expiresAt = sessionExpiry();
  await getStore().createSession({
    tokenHash: hashSessionToken(token),
    userId,
    expiresAt,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
  });
}

export async function deleteSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await getStore().deleteSession(hashSessionToken(token));
  jar.delete(SESSION_COOKIE);
}

// Returns the signed-in user, or null for a missing, unknown, forged, or
// expired cookie. Never throws for a bad cookie.
export async function readSessionUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const store = getStore();
  const tokenHash = hashSessionToken(token);
  const session = await store.findSession(tokenHash);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    await store.deleteSession(tokenHash);
    return null;
  }
  const record = await store.findUserById(session.userId);
  if (!record) return null;
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    title: record.title,
    tokens: record.tokens,
  };
}
