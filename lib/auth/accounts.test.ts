import { beforeEach, describe, expect, it } from "vitest";
import { SqliteStore } from "../db/sqlite";
import { rateLimitEntries, resetRateLimits, signIn, signUp } from "./accounts";

let store: SqliteStore;

const good = {
  name: "Jane Doe",
  email: "jane@x.com",
  password: "Correct-Horse-9",
};

beforeEach(() => {
  store = new SqliteStore(":memory:");
  resetRateLimits();
});

describe("signUp", () => {
  it("creates a member with 0 tokens and no title", async () => {
    const r = await signUp(store, good);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.user.role).toBe("member");
      expect(r.user.tokens).toBe(0);
      expect(r.user.title).toBeNull();
      expect(JSON.stringify(r.user)).not.toContain("passwordHash");
    }
  });

  it("ignores role and tokens in the input", async () => {
    const r = await signUp(store, { ...good, role: "admin", tokens: 999 } as never);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.user.role).toBe("member");
      expect(r.user.tokens).toBe(0);
    }
  });

  it("treats email case and spaces as the same account", async () => {
    await signUp(store, good);
    const r = await signUp(store, { ...good, email: " Jane@X.com " });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.email?.length).toBeGreaterThan(0);
  });

  it("reports each invalid field", async () => {
    const r = await signUp(store, { name: "", email: "nope", password: "short1" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.name).toBeDefined();
      expect(r.errors.email).toBeDefined();
      expect(r.errors.password).toBeDefined();
    }
  });

  it("rejects a 10,000 character password without throwing", async () => {
    const r = await signUp(store, { ...good, password: "a1".repeat(5000) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.password).toBeDefined();
  });

  it("requires a letter and a number in the password", async () => {
    const r = await signUp(store, { ...good, password: "onlyletters" });
    expect(r.ok).toBe(false);
  });

  it("enforces the join code only when one is configured", async () => {
    const opts = { requiredJoinCode: "GBM-2026" };
    const missing = await signUp(store, good, opts);
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.errors.joinCode).toBeDefined();
    const wrong = await signUp(store, { ...good, joinCode: "nope" }, opts);
    expect(wrong.ok).toBe(false);
    const right = await signUp(store, { ...good, joinCode: "GBM-2026" }, opts);
    expect(right.ok).toBe(true);
    const off = await signUp(store, { ...good, email: "b@x.com" });
    expect(off.ok).toBe(true);
  });
});

describe("signIn", () => {
  beforeEach(async () => {
    await signUp(store, good);
  });

  it("succeeds with correct credentials in any email case", async () => {
    const r = await signIn(store, { email: " JANE@x.com", password: good.password });
    expect(r.ok).toBe(true);
  });

  it("gives the identical message for unknown email and wrong password", async () => {
    const a = await signIn(store, { email: "ghost@x.com", password: "whatever1" });
    const b = await signIn(store, { email: good.email, password: "wrong-pass1" });
    expect(a).toEqual({ ok: false, message: "Incorrect email or password." });
    expect(b).toEqual(a);
  });

  it("locks after 5 failures and recovers after 15 minutes", async () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 5; i++) {
      await signIn(store, { email: good.email, password: "bad-pass1" }, { now: t0 });
    }
    const locked = await signIn(
      store,
      { email: good.email, password: good.password },
      { now: t0 },
    );
    expect(locked).toEqual({
      ok: false,
      message: "Too many attempts. Try again in a few minutes.",
    });
    const later = await signIn(
      store,
      { email: good.email, password: good.password },
      { now: t0 + 16 * 60 * 1000 },
    );
    expect(later.ok).toBe(true);
  });

  it("counts attempts that are still in flight, so parallel guesses cannot bypass the lock", async () => {
    const wrong = Array.from({ length: 20 }, () =>
      signIn(store, { email: good.email, password: "bad-pass1" }),
    );
    const right = signIn(store, { email: good.email, password: good.password });
    const results = await Promise.all([...wrong, right]);
    expect(results[results.length - 1].ok).toBe(false);
    expect(results.filter((r) => r.ok).length).toBe(0);
  });

  it("does not store rate-limit entries for absurdly long emails", async () => {
    resetRateLimits();
    await signIn(store, { email: "a".repeat(300) + "@x.com", password: "whatever1" });
    expect(rateLimitEntries()).toBe(0);
  });

  it("rejects an over-long password at sign-in without throwing", async () => {
    const r = await signIn(store, { email: good.email, password: "a1".repeat(5000) });
    expect(r).toEqual({ ok: false, message: "Incorrect email or password." });
  });
});
