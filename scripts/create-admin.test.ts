import { beforeEach, describe, expect, it } from "vitest";
import { SqliteStore } from "../lib/db/sqlite";
import { signUp } from "../lib/auth/accounts";
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

  it("promotes an existing member without changing id or tokens", async () => {
    const s = await signUp(store, {
      name: "Vic VP",
      email: "vic@x.com",
      password: "Correct-Horse-9",
    });
    if (!s.ok) throw new Error("setup failed");
    await store.updateUser(s.user.id, { tokens: 12 });
    const u = await createAdmin(store, {
      name: "Vic VP",
      email: "vic@x.com",
      password: "Another-Pass-1",
      title: "Vice President",
    });
    expect(u.id).toBe(s.user.id);
    expect(u.role).toBe("admin");
    expect(u.tokens).toBe(12);
    expect(u.title).toBe("Vice President");
  });

  it("rejects a password under 8 characters", async () => {
    await expect(
      createAdmin(store, { name: "A B", email: "a@x.com", password: "short", title: "President" }),
    ).rejects.toThrow();
  });
});
