import { beforeEach, describe, expect, it } from "vitest";
import { SqliteStore } from "../db/sqlite";
import { hashSessionToken, newSessionToken } from "./session-core";
import { resolveSession } from "./resolve-session";

let store: SqliteStore;
let userId: number;

beforeEach(async () => {
  store = new SqliteStore(":memory:");
  const u = await store.createUser({
    name: "Jane Doe",
    email: "jane@x.com",
    passwordHash: "secret-hash",
    role: "member",
    title: null,
  });
  userId = u.id;
});

describe("resolveSession", () => {
  it("returns the user for a valid token, without the password hash", async () => {
    const token = newSessionToken();
    await store.createSession({ tokenHash: hashSessionToken(token), userId, expiresAt: 2000 });
    const user = await resolveSession(store, token, 1000);
    expect(user?.email).toBe("jane@x.com");
    expect(JSON.stringify(user)).not.toContain("secret-hash");
  });

  it("returns null for missing, empty, garbage, and unknown tokens", async () => {
    expect(await resolveSession(store, undefined, 1000)).toBeNull();
    expect(await resolveSession(store, "", 1000)).toBeNull();
    expect(await resolveSession(store, "💥garbage\u0000", 1000)).toBeNull();
    expect(await resolveSession(store, newSessionToken(), 1000)).toBeNull();
  });

  it("returns null for an expired token and deletes its row", async () => {
    const token = newSessionToken();
    const h = hashSessionToken(token);
    await store.createSession({ tokenHash: h, userId, expiresAt: 500 });
    expect(await resolveSession(store, token, 1000)).toBeNull();
    expect(await store.findSession(h)).toBeNull();
  });
});
