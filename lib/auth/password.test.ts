import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("hashes are not the plain password and differ per call", async () => {
    const a = await hashPassword("Correct-Horse-9");
    const b = await hashPassword("Correct-Horse-9");
    expect(a).not.toBe(b);
    expect(a).not.toContain("Correct-Horse-9");
  });

  it("verifies the right password", async () => {
    const hash = await hashPassword("Correct-Horse-9");
    expect(await verifyPassword("Correct-Horse-9", hash)).toBe(true);
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("Correct-Horse-9");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("rejects a malformed stored value without throwing", async () => {
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
  });

  it("refuses a 10,000 character password", async () => {
    await expect(hashPassword("a".repeat(10000))).rejects.toThrow(
      "password_too_long",
    );
  });
});
