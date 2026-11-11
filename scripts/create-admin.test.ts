import { beforeEach, describe, expect, it } from "vitest";
import { SqliteStore } from "../lib/db/sqlite";
import { resetRateLimits, signIn, signUp } from "../lib/auth/accounts";
import { createAdmin } from "./create-admin";

let store: SqliteStore;

beforeEach(() => {
  store = new SqliteStore(":memory:");
});

describe("createAdmin", () => {
  it("creates a new admin with the given title", async () => {
    const u = await createAdmin(store, {
      name: "Pat President",
      email: "Pat@x.com",
      password: "Correct-Horse-9",
      title: "President",
    });
    expect(u.role).toBe("admin");
    expect(u.title).toBe("President");
    expect(u.email).toBe("pat@x.com");
  });

  it("refuses to touch an existing account unless promote is requested", async () => {
    const s = await signUp(store, {
      name: "Squatter",
      email: "pat@x.com",
      password: "Attacker-Pass-1",
    });
    if (!s.ok) throw new Error("setup failed");
    await expect(
      createAdmin(store, {
        name: "Pat President",
        email: "pat@x.com",
        password: "Owner-Pass-1",
        title: "President",
      }),
    ).rejects.toThrow(/already exists/);
    expect((await store.findUserById(s.user.id))?.role).toBe("member");
  });

  it("with promote, keeps id and tokens but replaces the password and ends old sessions", async () => {
    const s = await signUp(store, {
      name: "Vic VP",
      email: "vic@x.com",
      password: "Old-Password-1",
    });
    if (!s.ok) throw new Error("setup failed");
    await store.updateUser(s.user.id, { tokens: 12 });
    await store.createSession({ tokenHash: "old-session", userId: s.user.id, expiresAt: 9e15 });
    const u = await createAdmin(
      store,
      { name: "Vic VP", email: "vic@x.com", password: "New-Password-1", title: "Vice President" },
      { promote: true },
    );
    expect(u.id).toBe(s.user.id);
    expect(u.role).toBe("admin");
    expect(u.tokens).toBe(12);
    expect(u.title).toBe("Vice President");
    expect(await store.findSession("old-session")).toBeNull();
    expect((await signIn(store, { email: "vic@x.com", password: "New-Password-1" })).ok).toBe(true);
    resetRateLimits();
    expect((await signIn(store, { email: "vic@x.com", password: "Old-Password-1" })).ok).toBe(false);
  });

  it("rejects a password under 8 characters", async () => {
    await expect(
      createAdmin(store, { name: "A B", email: "a@x.com", password: "short", title: "President" }),
    ).rejects.toThrow();
  });
});
