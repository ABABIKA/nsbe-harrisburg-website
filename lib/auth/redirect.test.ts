import { describe, expect, it } from "vitest";
import { safeNextPath } from "./redirect";

const FALLBACK = "/portal/dashboard";

describe("safeNextPath", () => {
  it("keeps safe portal paths unchanged", () => {
    expect(safeNextPath("/portal/events")).toBe("/portal/events");
    expect(safeNextPath("/portal/torch-tokens?tab=history")).toBe(
      "/portal/torch-tokens?tab=history",
    );
    expect(safeNextPath("/portal")).toBe("/portal");
  });

  it.each([
    "//evil.com",
    "https://evil.com",
    "/\\evil.com",
    "/dashboard",
    "/portalx",
    "/portal//evil.com",
    "/portal/..\\evil",
    "",
  ])("falls back for %j", (bad) => {
    expect(safeNextPath(bad)).toBe(FALLBACK);
  });

  it("falls back for non-string input", () => {
    expect(safeNextPath(undefined)).toBe(FALLBACK);
    expect(safeNextPath(["/portal/a"])).toBe(FALLBACK);
    expect(safeNextPath(null)).toBe(FALLBACK);
  });
});
