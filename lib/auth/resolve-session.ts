import type { Store, User } from "../db/types";
import { hashSessionToken } from "./session-core";

// Turns a session cookie value into the signed-in user, or null.
// Missing, garbage, unknown, and expired tokens all return null and never
// throw. An expired session's row is deleted. The password hash is never
// returned.
export async function resolveSession(
  store: Store,
  token: string | undefined,
  now: number = Date.now(),
): Promise<User | null> {
  if (!token) return null;
  const tokenHash = hashSessionToken(token);
  const session = await store.findSession(tokenHash);
  if (!session) return null;
  if (session.expiresAt <= now) {
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
