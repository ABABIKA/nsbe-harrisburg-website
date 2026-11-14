import { describe, expect, it } from "vitest";
import { dateParts, firstName, formatDate, formatTimestamp, initials, roleLabel } from "./format";

describe("initials", () => {
  it("uses first and last name", () => {
    expect(initials("Daron Nyarko")).toBe("DN");
    expect(initials("  mary  jane  watson ")).toBe("MW");
  });
  it("handles one name and empty names", () => {
    expect(initials("Cher")).toBe("C");
    expect(initials("   ")).toBe("?");
  });
});

describe("firstName", () => {
  it("returns the first word, or a friendly fallback", () => {
    expect(firstName("Daron Nyarko")).toBe("Daron");
    expect(firstName("  ")).toBe("there");
  });
});

describe("dates", () => {
  it("formats an ISO date without timezone drift", () => {
    expect(formatDate("2026-11-18")).toBe("Nov 18, 2026");
    expect(formatDate("2026-01-01")).toBe("Jan 1, 2026");
  });
  it("splits a date for the calendar box", () => {
    expect(dateParts("2026-12-03")).toEqual({ day: "3", month: "DEC", year: "2026" });
  });
  it("returns the original text for an invalid date", () => {
    expect(formatDate("soon")).toBe("soon");
  });
});

describe("roleLabel", () => {
  it("shows the title for officers and admins, or the role name", () => {
    expect(roleLabel("admin", "President")).toBe("President");
    expect(roleLabel("officer", "Treasurer")).toBe("Treasurer");
    expect(roleLabel("admin", null)).toBe("Admin");
    expect(roleLabel("officer", null)).toBe("Officer");
    expect(roleLabel("member", "Ignored title")).toBe("Member");
  });
});

describe("formatTimestamp", () => {
  it("formats a time in milliseconds as a date", () => {
    expect(formatTimestamp(new Date(2026, 10, 18, 15, 30).getTime())).toBe("Nov 18, 2026");
    expect(formatTimestamp(new Date(2026, 0, 1, 0, 5).getTime())).toBe("Jan 1, 2026");
  });
});
