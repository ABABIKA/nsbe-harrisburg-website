import { describe, expect, it } from "vitest";
import { can, isRole, type Permission } from "./roles";

const permissions: Permission[] = ["edit_tokens", "edit_roles", "edit_titles"];

describe("roles", () => {
  it("admin has every permission", () => {
    for (const p of permissions) expect(can("admin", p)).toBe(true);
  });

  it("officer has no admin permissions", () => {
    for (const p of permissions) expect(can("officer", p)).toBe(false);
  });

  it("member has no admin permissions", () => {
    for (const p of permissions) expect(can("member", p)).toBe(false);
  });

  it("isRole accepts only the three roles", () => {
    expect(isRole("admin")).toBe(true);
    expect(isRole("officer")).toBe(true);
    expect(isRole("member")).toBe(true);
    expect(isRole("president")).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
});
