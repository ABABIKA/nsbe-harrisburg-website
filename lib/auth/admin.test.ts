import { beforeEach, describe, expect, it } from "vitest";
import { SqliteStore } from "../db/sqlite";
import type { Role } from "./roles";
import type { User } from "../db/types";
import { setMemberRole, setMemberTitle, setMemberTokens } from "./admin";

let store: SqliteStore;

async function make(email: string, role: Role): Promise<User> {
  const r = await store.createUser({
    name: email,
    email,
    passwordHash: "h",
    role,
    title: null,
  });
  const { passwordHash: _p, ...user } = r;
  void _p;
  return user;
}

beforeEach(() => {
  store = new SqliteStore(":memory:");
});

describe("admin-only functions", () => {
  it("refuses members and officers for all three functions", async () => {
    const member = await make("m@x.com", "member");
    const officer = await make("o@x.com", "officer");
    const target = await make("t@x.com", "member");
    for (const actor of [member, officer]) {
      expect(await setMemberTokens(store, actor, target.id, 5)).toEqual({ ok: false, error: "forbidden" });
      expect(await setMemberRole(store, actor, target.id, "officer")).toEqual({ ok: false, error: "forbidden" });
      expect(await setMemberTitle(store, actor, target.id, "Treasurer")).toEqual({ ok: false, error: "forbidden" });
    }
    const after = await store.findUserById(target.id);
    expect(after?.tokens).toBe(0);
    expect(after?.role).toBe("member");
    expect(after?.title).toBeNull();
  });

  it("lets an admin set tokens and titles and change roles", async () => {
    const admin = await make("a@x.com", "admin");
    const target = await make("t@x.com", "member");
    const t = await setMemberTokens(store, admin, target.id, 42);
    expect(t.ok && t.user.tokens).toBe(42);
    const r = await setMemberRole(store, admin, target.id, "officer");
    expect(r.ok && r.user.role).toBe("officer");
    const title = await setMemberTitle(store, admin, target.id, "  Treasurer ");
    expect(title.ok && title.user.title).toBe("Treasurer");
    const cleared = await setMemberTitle(store, admin, target.id, "   ");
    expect(cleared.ok && cleared.user.title).toBeNull();
  });

  it("rejects invalid token amounts", async () => {
    const admin = await make("a@x.com", "admin");
    const target = await make("t@x.com", "member");
    for (const bad of [-1, 1.5, Number.NaN, 1e9]) {
      expect(await setMemberTokens(store, admin, target.id, bad)).toEqual({ ok: false, error: "invalid" });
    }
  });

  it("rejects an unknown role and an over-long title", async () => {
    const admin = await make("a@x.com", "admin");
    const target = await make("t@x.com", "member");
    expect(await setMemberRole(store, admin, target.id, "president")).toEqual({ ok: false, error: "invalid" });
    expect(await setMemberTitle(store, admin, target.id, "x".repeat(61))).toEqual({ ok: false, error: "invalid" });
  });

  it("returns not_found for an unknown target", async () => {
    const admin = await make("a@x.com", "admin");
    expect(await setMemberTokens(store, admin, 999, 1)).toEqual({ ok: false, error: "not_found" });
  });

  it("refuses to demote the only admin, allows it with a second admin", async () => {
    const admin = await make("a@x.com", "admin");
    expect(await setMemberRole(store, admin, admin.id, "member")).toEqual({ ok: false, error: "last_admin" });
    await make("b@x.com", "admin");
    const r = await setMemberRole(store, admin, admin.id, "member");
    expect(r.ok && r.user.role).toBe("member");
  });

  it("uses the stored role, not the actor object, so a demoted admin loses power", async () => {
    const admin = await make("a@x.com", "admin");
    await make("b@x.com", "admin");
    const target = await make("t@x.com", "member");
    await store.updateUser(admin.id, { role: "member" });
    // `admin` object still says role "admin"
    expect(await setMemberTokens(store, admin, target.id, 9)).toEqual({ ok: false, error: "forbidden" });
  });
});
