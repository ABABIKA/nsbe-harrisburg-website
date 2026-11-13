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

  it("officers and admins can see the e-board area and post announcements, members cannot", () => {
    for (const p of ["view_eboard", "post_announcements"] as const) {
      expect(can("member", p)).toBe(false);
      expect(can("officer", p)).toBe(true);
      expect(can("admin", p)).toBe(true);
    }
  });

  it("only admins can pin announcements or delete other people's", () => {
    for (const p of ["pin_announcements", "delete_any_announcement"] as const) {
      expect(can("member", p)).toBe(false);
      expect(can("officer", p)).toBe(false);
      expect(can("admin", p)).toBe(true);
    }
  });
});
