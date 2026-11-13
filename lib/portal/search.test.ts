import { describe, expect, it } from "vitest";
import { searchContent } from "./search";
import type { PortalContent } from "./content";

const content: PortalContent = {
  events: [
    { id: "e1", title: "Weekly GBM", category: "General body meeting", date: "2026-11-18", time: "11:30 AM", location: "Olmsted E243", summary: "Meet the chapter." },
  ],
  opportunities: [
    { id: "o1", kind: "Internship", title: "Engineering Co-op Program", deadline: "April 30", url: "https://example.com" },
  ],
  resources: [
    { id: "r1", title: "Resume templates", summary: "Start from a clean engineering resume.", url: "https://example.com/r" },
  ],
};

describe("searchContent", () => {
  it("returns nothing for an empty or whitespace query", () => {
    expect(searchContent("", content)).toEqual([]);
    expect(searchContent("   ", content)).toEqual([]);
  });

  it("matches across events, opportunities, and resources, ignoring case", () => {
    const hits = searchContent("engineering", content);
    expect(hits.map((h) => h.id).sort()).toEqual(["o1", "r1"]);
    expect(searchContent("GBM", content).map((h) => h.id)).toEqual(["e1"]);
  });

  it("labels each hit with its section and a link inside the portal for events", () => {
    const [hit] = searchContent("gbm", content);
    expect(hit.section).toBe("Events");
    expect(hit.href).toBe("/portal/events");
  });

  it("returns nothing when nothing matches", () => {
    expect(searchContent("zzzz", content)).toEqual([]);
  });

  it("does not throw on regex characters in the query", () => {
    expect(searchContent("(.*[", content)).toEqual([]);
  });
});
