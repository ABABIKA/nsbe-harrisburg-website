import { describe, expect, it } from "vitest";
import {
  SESSION_DAYS,
  hashSessionToken,
  newSessionToken,
  sessionExpiry,
} from "./session-core";

describe("session primitives", () => {
  it("generates distinct long tokens", () => {
    const a = newSessionToken();
    const b = newSessionToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(40);
  });

  it("hashes deterministically and never returns the input", () => {
    const t = newSessionToken();
    expect(hashSessionToken(t)).toBe(hashSessionToken(t));
    expect(hashSessionToken(t)).not.toBe(t);
  });

  it("expires after 7 days", () => {
    expect(SESSION_DAYS).toBe(7);
    expect(sessionExpiry(0)).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
