import { beforeEach, describe, expect, it } from "vitest";
import { SqliteStore } from "./sqlite";
import { EmailTakenError } from "./types";

let store: SqliteStore;

const input = (email: string) => ({
  name: "Jane Doe",
  email,
  passwordHash: "hash",
  role: "member" as const,
  title: null,
});

beforeEach(() => {
  store = new SqliteStore(":memory:");
});

describe("SqliteStore users", () => {
  it("creates a user and finds it by email and id with 0 tokens", async () => {
    const created = await store.createUser(input("jane@x.com"));
    expect(created.tokens).toBe(0);
    expect((await store.findUserByEmail("jane@x.com"))?.id).toBe(created.id);
    expect((await store.findUserById(created.id))?.email).toBe("jane@x.com");
  });

  it("matches email regardless of case and spaces", async () => {
    await store.createUser(input("jane@x.com"));
    expect(await store.findUserByEmail(" JANE@X.com ")).not.toBeNull();
  });

  it("rejects a duplicate email in a different case", async () => {
    await store.createUser(input("jane@x.com"));
    await expect(store.createUser(input("Jane@X.com"))).rejects.toBeInstanceOf(
      EmailTakenError,
    );
  });

  it("updates tokens and role independently", async () => {
    const u = await store.createUser(input("jane@x.com"));
    const a = await store.updateUser(u.id, { tokens: 7 });
    expect(a?.tokens).toBe(7);
    expect(a?.role).toBe("member");
    const b = await store.updateUser(u.id, { role: "officer", title: "Treasurer" });
    expect(b?.role).toBe("officer");
    expect(b?.title).toBe("Treasurer");
    expect(b?.tokens).toBe(7);
  });

  it("updateUser returns null for an unknown id", async () => {
    expect(await store.updateUser(999, { tokens: 1 })).toBeNull();
  });

  it("counts users by role", async () => {
    await store.createUser({ ...input("a@x.com"), role: "admin" });
    await store.createUser(input("b@x.com"));
    expect(await store.countUsersWithRole("admin")).toBe(1);
    expect(await store.countUsersWithRole("member")).toBe(1);
    expect(await store.countUsersWithRole("officer")).toBe(0);
  });
});

describe("SqliteStore sessions", () => {
  it("creates, finds, and deletes a session", async () => {
    const u = await store.createUser(input("jane@x.com"));
    await store.createSession({ tokenHash: "h1", userId: u.id, expiresAt: 123 });
    expect(await store.findSession("h1")).toEqual({ userId: u.id, expiresAt: 123 });
    await store.deleteSession("h1");
    expect(await store.findSession("h1")).toBeNull();
  });

  it("deletes every session for one user and leaves others", async () => {
    const a = await store.createUser(input("a@x.com"));
    const b = await store.createUser(input("b@x.com"));
    await store.createSession({ tokenHash: "a1", userId: a.id, expiresAt: 1 });
    await store.createSession({ tokenHash: "a2", userId: a.id, expiresAt: 1 });
    await store.createSession({ tokenHash: "b1", userId: b.id, expiresAt: 1 });
    await store.deleteSessionsForUser(a.id);
    expect(await store.findSession("a1")).toBeNull();
    expect(await store.findSession("a2")).toBeNull();
    expect(await store.findSession("b1")).not.toBeNull();
  });

  it("updates the password hash through updateUser", async () => {
    const u = await store.createUser(input("jane@x.com"));
    const after = await store.updateUser(u.id, { passwordHash: "new-hash" });
    expect(after?.passwordHash).toBe("new-hash");
  });

  it("returns null for an unknown session hash", async () => {
    expect(await store.findSession("nope")).toBeNull();
  });
});
