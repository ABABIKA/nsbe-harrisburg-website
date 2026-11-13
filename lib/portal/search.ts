import { portalContent, type PortalContent } from "./content";

export interface SearchHit {
  id: string;
  section: "Events" | "Opportunities" | "Resources";
  title: string;
  summary: string;
  href: string;
}

// Plain substring search (no regular expressions) across the portal's
// events, opportunities, and resources.
export function searchContent(
  query: string,
  content: PortalContent = portalContent,
): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const has = (...parts: string[]) => parts.some((p) => p.toLowerCase().includes(q));

  const hits: SearchHit[] = [];
  for (const e of content.events) {
    if (has(e.title, e.summary, e.category, e.location)) {
      hits.push({ id: e.id, section: "Events", title: e.title, summary: e.summary, href: "/portal/events" });
    }
  }
  for (const o of content.opportunities) {
    if (has(o.title, o.kind)) {
      hits.push({ id: o.id, section: "Opportunities", title: o.title, summary: `${o.kind}. ${o.deadline}`, href: "/portal/opportunities" });
    }
  }
  for (const r of content.resources) {
    if (has(r.title, r.summary)) {
      hits.push({ id: r.id, section: "Resources", title: r.title, summary: r.summary, href: "/portal/resources" });
    }
  }
  return hits;
}
